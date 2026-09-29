import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { triggerPoints, painAreas } from "./data.js";

const viewer = document.querySelector("#viewer");
const statusEl = document.querySelector("#jsStatus");
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x080d19, 7, 14);

const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 100);
const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x000000, 0);
viewer.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdbeafe,0x101827,2.4));
const key=new THREE.DirectionalLight(0xffffff,2.2); key.position.set(4,6,5); scene.add(key);
const rim=new THREE.DirectionalLight(0x7dd3fc,1.2); rim.position.set(-4,3,-4); scene.add(rim);

const anatomyRoot=new THREE.Group();
scene.add(anatomyRoot);
const modelRoot=new THREE.Group();
anatomyRoot.add(modelRoot);
const markerRoot=new THREE.Group();
anatomyRoot.add(markerRoot);
const painRoot=new THREE.Group();
anatomyRoot.add(painRoot);

let anatomyMeshes=[];
let modelLoaded=false;
let selected=null;
let selectedMuscleMeshes=[];
let painVisible=false;
let filterMode="all";
let targetRotX=-0.05, targetRotY=0, rotX=-0.05, rotY=0;
let cameraTarget=new THREE.Vector3(0,0.25,0);
let cameraTargetGoal=cameraTarget.clone();
let cameraDistance=5.2;
let cameraDistanceGoal=5.2;

const aliases={
  "Trapèze supérieur":["trapezius"],
  "Sterno-cléido-mastoïdien":["sternocleidomastoid","sternocleidomastoideus"],
  "Masséter":["masseter"],
  "Supra-épineux":["supraspinatus"],
  "Infra-épineux":["infraspinatus"],
  "Élévateur de la scapula":["levator scapulae","levator_scapulae"],
  "Grand pectoral":["pectoralis major","pectoralis_major"],
  "Carré des lombes":["quadratus lumborum","quadratus_lumborum"],
  "Moyen fessier":["gluteus medius","gluteus_medius"],
  "Piriforme":["piriformis"],
  "Ischio-jambiers":["biceps femoris","semitendinosus","semimembranosus"],
  "Gastrocnémien":["gastrocnemius"],
  "Tibial antérieur":["tibialis anterior","tibialis_anterior"]
};

function norm(s){
  return (s||"").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[._-]+/g," ").replace(/\s+/g," ").trim();
}
function sideScore(name,side){
  const n=norm(name);
  if(side==="gauche") return /(^|\s)(left|l)(\s|$)/.test(n) || n.endsWith(" l") ? 2 : 0;
  if(side==="droit") return /(^|\s)(right|r)(\s|$)/.test(n) || n.endsWith(" r") ? 2 : 0;
  return 0;
}
function matchMuscle(point){
  const list=aliases[point.muscle]||[point.muscle];
  const candidates=anatomyMeshes.filter(m=>{
    const n=norm(m.name || m.userData?.za_name || "");
    return list.some(a=>n.includes(norm(a)));
  });
  if(!candidates.length) return [];
  const scored=[...candidates].sort((a,b)=>sideScore(b.name,point.side)-sideScore(a.name,point.side));
  const bestScore=sideScore(scored[0].name,point.side);
  return bestScore>0 ? scored.filter(x=>sideScore(x.name,point.side)===bestScore) : scored;
}

function makeFallback(){
  modelRoot.clear();
  anatomyMeshes=[];
  const mat=new THREE.MeshStandardMaterial({color:0xa73e4e,roughness:.62});
  const skin=new THREE.MeshStandardMaterial({color:0xc98f7e,roughness:.7});
  const add=(geo,material,x,y,z)=>{const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);modelRoot.add(m);anatomyMeshes.push(m);return m;};
  const ell=(x,y,z)=>{const g=new THREE.SphereGeometry(1,24,16);g.scale(x,y,z);return g;};
  add(ell(.27,.35,.25),skin,0,1.75,0);
  add(ell(.48,.72,.28),mat,0,.92,0);
  add(ell(.40,.30,.25),mat,0,.20,0);
  [-1,1].forEach(s=>{
    add(new THREE.CylinderGeometry(.12,.10,.78,18),mat,.57*s,.96,0);
    add(new THREE.CylinderGeometry(.10,.08,.70,18),skin,.60*s,.28,0);
    add(new THREE.CylinderGeometry(.16,.13,.95,20),mat,.20*s,-.45,0);
    add(new THREE.CylinderGeometry(.12,.09,.85,20),mat,.18*s,-1.33,0);
  });
  statusEl.textContent="Modèle simplifié (secours)";
  statusEl.classList.remove("ok");
  modelLoaded=false;
  rebuildMarkers();
}

function normalizeModel(root){
  const box=new THREE.Box3().setFromObject(root);
  const size=new THREE.Vector3(); box.getSize(size);
  const center=new THREE.Vector3(); box.getCenter(center);
  const scale=3.8/Math.max(size.y,0.001);
  root.scale.setScalar(scale);
  root.position.set(-center.x*scale,-center.y*scale+0.15,-center.z*scale);
  root.updateMatrixWorld(true);
}

const loader=new GLTFLoader();
const draco=new DRACOLoader();
draco.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/libs/draco/");
loader.setDRACOLoader(draco);
const MODEL_URL="https://cdn.jsdelivr.net/gh/nqwrc/3d-anatomy@master/public/models/muscular.glb";

statusEl.textContent="Chargement anatomie…";
loader.load(MODEL_URL,gltf=>{
  modelRoot.clear();
  anatomyMeshes=[];
  const root=gltf.scene;
  root.traverse(o=>{
    if(o.isMesh){
      anatomyMeshes.push(o);
      o.material=o.material.clone();
      o.material.roughness=Math.max(.45,o.material.roughness ?? .55);
      o.userData.originalMaterial=o.material.clone();
    }
  });
  modelRoot.add(root);
  normalizeModel(root);
  modelLoaded=true;
  statusEl.textContent="Anatomie 3D chargée";
  statusEl.classList.add("ok");
  rebuildMarkers();
},undefined,err=>{
  console.error(err);
  makeFallback();
});

const markerMeshes=[];
function clearMarkers(){ while(markerRoot.children.length) markerRoot.remove(markerRoot.children[0]); markerMeshes.length=0; }
function rebuildMarkers(){
  clearMarkers();
  triggerPoints.forEach((p,i)=>{
    let pos=new THREE.Vector3(...(p.position||[0,0,0]));
    const matched=matchMuscle(p);
    if(matched.length){
      const box=new THREE.Box3();
      matched.forEach(m=>box.expandByObject(m));
      box.getCenter(pos);
    }
    const mesh=new THREE.Mesh(
      new THREE.SphereGeometry(.045,18,12),
      new THREE.MeshStandardMaterial({color:0xff4c62,emissive:0x8f0d1f,emissiveIntensity:1.5,depthTest:false})
    );
    mesh.position.copy(pos);
    mesh.userData.point=p;
    mesh.renderOrder=20;
    markerRoot.add(mesh);
    markerMeshes.push(mesh);
  });
  updatePointVisibility();
}

function resetHighlights(){
  anatomyMeshes.forEach(m=>{
    if(m.userData.originalMaterial) m.material=m.userData.originalMaterial.clone();
  });
  selectedMuscleMeshes=[];
}
function highlightMeshes(meshes){
  resetHighlights();
  selectedMuscleMeshes=meshes;
  meshes.forEach(m=>{
    const mat=m.material.clone();
    if("emissive" in mat){ mat.emissive=new THREE.Color(0x4d0b17); mat.emissiveIntensity=1.2; }
    if("color" in mat) mat.color.offsetHSL(0,.08,.08);
    m.material=mat;
  });
}
function focusOnMeshes(meshes){
  if(!meshes.length) return;
  const box=new THREE.Box3();
  meshes.forEach(m=>box.expandByObject(m));
  const center=new THREE.Vector3(); const size=new THREE.Vector3();
  box.getCenter(center); box.getSize(size);
  cameraTargetGoal.copy(center);
  cameraDistanceGoal=Math.max(.75,Math.min(2.8,Math.max(size.x,size.y,size.z)*3.1));
  highlightMeshes(meshes);
}
function focusPoint(point){
  const meshes=matchMuscle(point);
  if(meshes.length) focusOnMeshes(meshes);
}
function resetCamera(){
  cameraTargetGoal.set(0,.15,0);
  cameraDistanceGoal=5.2;
  resetHighlights();
}

function clearPain(){ while(painRoot.children.length) painRoot.remove(painRoot.children[0]); }
function showPain(){
  clearPain();
  if(!selected) return;
  const matched=matchMuscle(selected);
  let center=new THREE.Vector3(...(selected.position||[0,0,0]));
  if(matched.length){ const b=new THREE.Box3(); matched.forEach(m=>b.expandByObject(m)); b.getCenter(center); }
  const g=new THREE.SphereGeometry(.18,24,16);
  const m=new THREE.MeshBasicMaterial({color:0xf59e0b,transparent:true,opacity:.25,depthWrite:false,depthTest:false});
  const halo=new THREE.Mesh(g,m); halo.position.copy(center); halo.scale.set(1.7,2.3,.7); halo.renderOrder=19; painRoot.add(halo);
}
function selectPoint(point,zoom=true){
  selected=point; painVisible=false; clearPain();
  document.querySelector("#emptyState").hidden=true;
  document.querySelector("#detailCard").hidden=false;
  document.querySelector("#detailTitle").textContent=point.label;
  document.querySelector("#detailMuscle").textContent=point.muscle+" · côté "+point.side;
  document.querySelector("#detailReferral").textContent=point.referral;
  document.querySelector("#detailLocation").textContent=point.location;
  document.querySelector("#detailCare").textContent=point.care;
  document.querySelector("#detailCaution").textContent=point.caution;
  document.querySelector("#togglePain").textContent="Afficher la zone projetée";
  switchTab("explore");
  if(zoom) focusPoint(point);
  if(filterMode==="selected") updatePointVisibility();
}

document.querySelector("#togglePain").addEventListener("click",()=>{
  painVisible=!painVisible; if(painVisible) showPain(); else clearPain();
  document.querySelector("#togglePain").textContent=painVisible?"Masquer la zone projetée":"Afficher la zone projetée";
});
document.querySelector("#showMusclePoints").addEventListener("click",()=>{filterMode="selected";updatePointVisibility();focusPoint(selected);});
document.querySelector("#showAllPoints").addEventListener("click",()=>{filterMode="all";updatePointVisibility();});
document.querySelector("#focusSelection").addEventListener("click",()=>{if(selected) focusPoint(selected);});
document.querySelector("#resetView").addEventListener("click",()=>{targetRotY=0;targetRotX=-.05;resetCamera();});
document.querySelectorAll("[data-view]").forEach(btn=>btn.addEventListener("click",()=>{
  const views={front:0,back:Math.PI,left:-Math.PI/2,right:Math.PI/2};
  targetRotY=views[btn.dataset.view]??0; targetRotX=-.05;
}));

function updatePointVisibility(){
  markerMeshes.forEach(mesh=>{
    const p=mesh.userData.point;
    mesh.visible=filterMode==="all" || (selected && p.muscle===selected.muscle);
  });
  document.querySelector("#showAllPoints").classList.toggle("active",filterMode==="all");
  document.querySelector("#focusSelection").classList.toggle("active",filterMode==="selected");
}

function switchTab(name){
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===name));
  document.querySelectorAll(".tab-panel").forEach(p=>p.classList.toggle("active",p.id==="tab-"+name));
}
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>switchTab(t.dataset.tab)));

const painButtons=document.querySelector("#painButtons");
painAreas.forEach(area=>{
  const b=document.createElement("button"); b.className="chip"; b.textContent=area[0].toUpperCase()+area.slice(1);
  b.addEventListener("click",()=>{
    document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active")); b.classList.add("active");
    const out=document.querySelector("#painResults"); const matches=triggerPoints.filter(p=>p.painZones.includes(area)); out.innerHTML="";
    matches.forEach(p=>{ const c=document.createElement("div"); c.className="result-card"; const bt=document.createElement("button");
      bt.innerHTML="<strong>"+p.muscle+" · "+p.side+"</strong><small>"+p.referral+"</small>";
      bt.addEventListener("click",()=>selectPoint(p,true)); c.appendChild(bt); out.appendChild(c); });
  });
  painButtons.appendChild(b);
});

const muscles=[...new Set(triggerPoints.map(p=>p.muscle))].sort();
const muscleList=document.querySelector("#muscleList");
muscles.forEach(name=>{
  const list=triggerPoints.filter(p=>p.muscle===name); const c=document.createElement("div");c.className="result-card"; const b=document.createElement("button");
  b.innerHTML="<strong>"+name+"</strong><small>"+list.length+" point(s)</small>";
  b.addEventListener("click",()=>{selectPoint(list[0],true);filterMode="selected";updatePointVisibility();});
  c.appendChild(b); muscleList.appendChild(c);
});
document.querySelector("#statPoints").textContent=String(triggerPoints.length);
document.querySelector("#statMuscles").textContent=String(muscles.length);

const raycaster=new THREE.Raycaster(); const pointer=new THREE.Vector2();
let dragging=false,lastX=0,lastY=0,downX=0,downY=0;
renderer.domElement.style.touchAction="none";
renderer.domElement.addEventListener("pointerdown",e=>{dragging=true;lastX=downX=e.clientX;lastY=downY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener("pointermove",e=>{if(!dragging)return;targetRotY+=(e.clientX-lastX)*.009;targetRotX+=(e.clientY-lastY)*.005;targetRotX=Math.max(-.45,Math.min(.45,targetRotX));lastX=e.clientX;lastY=e.clientY;});
renderer.domElement.addEventListener("pointerup",e=>{
  dragging=false; try{renderer.domElement.releasePointerCapture(e.pointerId);}catch{}
  if(Math.hypot(e.clientX-downX,e.clientY-downY)>5)return;
  const rect=renderer.domElement.getBoundingClientRect(); pointer.x=((e.clientX-rect.left)/rect.width)*2-1; pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const markerHit=raycaster.intersectObjects(markerMeshes,false)[0];
  if(markerHit){selectPoint(markerHit.object.userData.point,true);return;}
  const muscleHit=raycaster.intersectObjects(anatomyMeshes,false)[0];
  if(muscleHit){
    const mesh=muscleHit.object; focusOnMeshes([mesh]);
    const n=norm(mesh.name || mesh.userData?.za_name || "");
    for(const p of triggerPoints){
      const aa=aliases[p.muscle]||[];
      if(aa.some(a=>n.includes(norm(a)))){selectPoint(p,false);break;}
    }
  }
});
renderer.domElement.addEventListener("wheel",e=>{e.preventDefault();cameraDistanceGoal=Math.max(.65,Math.min(7,cameraDistanceGoal+e.deltaY*.003));},{passive:false});

function resize(){const r=viewer.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=Math.max(1,r.width)/Math.max(1,r.height);camera.updateProjectionMatrix();}
window.addEventListener("resize",resize);resize();

function animate(){
  requestAnimationFrame(animate);
  rotX+=(targetRotX-rotX)*.1; rotY+=(targetRotY-rotY)*.1; anatomyRoot.rotation.set(rotX,rotY,0);
  cameraTarget.lerp(cameraTargetGoal,.1); cameraDistance+=(cameraDistanceGoal-cameraDistance)*.1;
  camera.position.set(cameraTarget.x,cameraTarget.y,cameraTarget.z+cameraDistance); camera.lookAt(cameraTarget);
  markerMeshes.forEach((m,i)=>{const s=1+Math.sin(performance.now()/430+i)*.08;m.scale.setScalar(s);});
  renderer.render(scene,camera);
}
animate();

if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js?v=real1").catch(()=>{}));}
