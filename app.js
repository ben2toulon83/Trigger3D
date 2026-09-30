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
let pendingFocusMeshes=null;

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
      const nn=norm(o.name || o.userData?.za_name || "");
      o.material.roughness=Math.max(.48,o.material.roughness ?? .55);
      if ("color" in o.material) {
        if (/(tendon|aponeuros|fascia)/.test(nn)) {
          o.material.color.set(0xd9c7a3);
        } else if (/(bone|osseous|skeleton)/.test(nn)) {
          o.material.color.set(0xe8dfcc);
        } else {
          o.material.color.set(0xa9404d);
        }
      }
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
const markerByPointId=new Map();
function clearMarkers(){
  while(markerRoot.children.length) markerRoot.remove(markerRoot.children[0]);
  markerMeshes.length=0;
  markerByPointId.clear();
}

function worldDistanceToBox(point,box){
  const x=Math.max(box.min.x,Math.min(point.x,box.max.x));
  const y=Math.max(box.min.y,Math.min(point.y,box.max.y));
  const z=Math.max(box.min.z,Math.min(point.z,box.max.z));
  return point.distanceTo(new THREE.Vector3(x,y,z));
}

function nearestMeshesToWorldPoint(worldPoint,count=1){
  return anatomyMeshes
    .map(m=>{
      const box=new THREE.Box3().setFromObject(m);
      return {m,d:worldDistanceToBox(worldPoint,box)};
    })
    .sort((a,b)=>a.d-b.d)
    .slice(0,count)
    .map(x=>x.m);
}

function resolvePointMeshes(point){
  const named=matchMuscle(point);
  if(named.length) return named;

  const marker=markerByPointId.get(point.id);
  if(marker){
    markerRoot.updateMatrixWorld(true);
    const world=marker.getWorldPosition(new THREE.Vector3());
    return nearestMeshesToWorldPoint(world,1);
  }
  return [];
}
function rebuildMarkers(){
  clearMarkers();
  anatomyRoot.updateMatrixWorld(true);
  markerRoot.updateMatrixWorld(true);

  triggerPoints.forEach((p,i)=>{
    let worldPos=new THREE.Vector3(...(p.position||[0,0,0]));
    const matched=matchMuscle(p);

    if(matched.length){
      const box=new THREE.Box3();
      matched.forEach(m=>box.expandByObject(m));
      const size=new THREE.Vector3();
      box.getSize(size);

      const a=p.anchor || [0.5,0.5,0.5];
      const anchorPoint=new THREE.Vector3(
        box.min.x + size.x * a[0],
        box.min.y + size.y * a[1],
        box.min.z + size.z * a[2]
      );

      // Project the anatomical anchor onto the real mesh surface.
      // This keeps trigger points attached to the muscle rather than floating
      // at the centre of its bounding box.
      const ray=new THREE.Raycaster();
      const margin=Math.max(size.x,size.y,size.z)*0.75 + 0.05;
      let origin=anchorPoint.clone();
      let direction=new THREE.Vector3(0,0,-1);

      if(p.view==="front"){
        origin.z=box.max.z+margin;
        direction.set(0,0,-1);
      } else if(p.view==="back"){
        origin.z=box.min.z-margin;
        direction.set(0,0,1);
      } else if(p.view==="left"){
        origin.x=box.min.x-margin;
        direction.set(1,0,0);
      } else if(p.view==="right"){
        origin.x=box.max.x+margin;
        direction.set(-1,0,0);
      }

      ray.set(origin,direction.normalize());
      const hits=ray.intersectObjects(matched,false);
      if(hits.length){
        worldPos.copy(hits[0].point);
        // Tiny outward lift prevents z-fighting while preserving depth occlusion.
        worldPos.addScaledVector(direction,-0.006);
      } else {
        worldPos.copy(anchorPoint);
      }
    }

    // Box3 returns world coordinates. Convert them back into the local
    // coordinate system of the rotating anatomy root.
    const localPos=markerRoot.worldToLocal(worldPos.clone());

    const mesh=new THREE.Mesh(
      new THREE.SphereGeometry(.018,18,12),
      new THREE.MeshStandardMaterial({
        color:0xff3150,
        emissive:0x7a0718,
        emissiveIntensity:1.25,
        depthTest:true,
        depthWrite:true
      })
    );
    mesh.position.copy(localPos);
    mesh.userData.point=p;
    markerRoot.add(mesh);
    markerMeshes.push(mesh);
    markerByPointId.set(p.id,mesh);
  });

  updatePointVisibility();
}

function resetHighlights(){
  anatomyMeshes.forEach(m=>{
    if(m.userData.originalMaterial) {
      m.material=m.userData.originalMaterial.clone();
      m.material.transparent=false;
      m.material.opacity=1;
      m.material.depthWrite=true;
    }
  });
  selectedMuscleMeshes=[];
}
function highlightMeshes(meshes){
  resetHighlights();
  selectedMuscleMeshes=meshes;
  const set=new Set(meshes);
  anatomyMeshes.forEach(m=>{
    const mat=m.material.clone();
    if(set.has(m)){
      if("emissive" in mat){ mat.emissive=new THREE.Color(0x5b0a1a); mat.emissiveIntensity=1.0; }
      if("color" in mat) mat.color.set(0xd65061);
      mat.transparent=false; mat.opacity=1;
    } else {
      mat.transparent=true;
      mat.opacity=.22;
      mat.depthWrite=false;
    }
    m.material=mat;
  });
}
function focusOnMeshes(meshes){
  if(!meshes.length) return;
  const box=new THREE.Box3();
  meshes.forEach(m=>box.expandByObject(m));
  const sphere=new THREE.Sphere();
  box.getBoundingSphere(sphere);
  cameraTargetGoal.copy(sphere.center);
  cameraDistanceGoal=Math.max(.55,Math.min(2.25,sphere.radius*3.0));
  highlightMeshes(meshes);
}
function focusPoint(point){
  const meshes=resolvePointMeshes(point);
  if(meshes.length) focusOnMeshes(meshes);
  else {
    const marker=markerByPointId.get(point.id);
    if(marker){
      const c=marker.getWorldPosition(new THREE.Vector3());
      cameraTargetGoal.copy(c);
      cameraDistanceGoal=1.25;
    }
  }
}
function resetCamera(){
  pendingFocusMeshes=null;
  cameraTargetGoal.set(0,.15,0);
  cameraDistanceGoal=5.2;
  resetHighlights();
}

const viewAngles={front:0,back:Math.PI,left:-Math.PI/2,right:Math.PI/2};

function schedulePointFocus(point){
  if(!point) return;

  // Remove the previous highlight immediately, so a stale muscle never remains
  // highlighted while the body is rotating toward the new selection.
  resetHighlights();

  const resolved=resolvePointMeshes(point);
  pendingFocusMeshes=resolved.length ? resolved : null;

  targetRotY=viewAngles[point.view] ?? 0;
  targetRotX=-.04;

  // Even when mesh naming is imperfect, keep the camera tied to the marker.
  if(!pendingFocusMeshes){
    const marker=markerByPointId.get(point.id);
    if(marker){
      const c=marker.getWorldPosition(new THREE.Vector3());
      cameraTargetGoal.copy(c);
      cameraDistanceGoal=1.25;
    }
  }
}

function angularDistance(a,b){
  return Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
}

function clearPain(){ while(painRoot.children.length) painRoot.remove(painRoot.children[0]); }
function showPain(){
  clearPain();
  if(!selected) return;
  const matched=resolvePointMeshes(selected);
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
  if(zoom) schedulePointFocus(point);
  if(filterMode==="selected") updatePointVisibility();
}

document.querySelector("#togglePain").addEventListener("click",()=>{
  painVisible=!painVisible; if(painVisible) showPain(); else clearPain();
  document.querySelector("#togglePain").textContent=painVisible?"Masquer la zone projetée":"Afficher la zone projetée";
});
document.querySelector("#showMusclePoints").addEventListener("click",()=>{
  filterMode="selected";
  updatePointVisibility();
  if(selected) schedulePointFocus(selected);
});
document.querySelector("#showAllPoints").addEventListener("click",()=>{filterMode="all";updatePointVisibility();});
document.querySelector("#focusSelection").addEventListener("click",()=>{if(selected) schedulePointFocus(selected);});
document.querySelector("#resetView").addEventListener("click",()=>{
  targetRotY=0;
  targetRotX=-.05;
  resetCamera();
});
document.querySelectorAll("[data-view]").forEach(btn=>btn.addEventListener("click",()=>{
  targetRotY=viewAngles[btn.dataset.view]??0;
  targetRotX=-.05;
  resetCamera();
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
  dragging=false;
  targetRotY=Math.atan2(Math.sin(targetRotY),Math.cos(targetRotY));
  try{renderer.domElement.releasePointerCapture(e.pointerId);}catch{}
  if(Math.hypot(e.clientX-downX,e.clientY-downY)>5)return;
  const rect=renderer.domElement.getBoundingClientRect(); pointer.x=((e.clientX-rect.left)/rect.width)*2-1; pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const markerHit=raycaster.intersectObjects(markerMeshes,false)[0];
  if(markerHit){selectPoint(markerHit.object.userData.point,true);return;}
  const muscleHit=raycaster.intersectObjects(anatomyMeshes,false)[0];
  if(muscleHit){
    const mesh=muscleHit.object;
    focusOnMeshes([mesh]);

    const n=norm(mesh.name || mesh.userData?.za_name || "");
    let matchedPoint=null;
    for(const p of triggerPoints){
      const aa=aliases[p.muscle]||[];
      if(aa.some(a=>n.includes(norm(a)))){matchedPoint=p;break;}
    }

    // If mesh names do not match the atlas naming, select the nearest trigger
    // point to the clicked anatomical structure instead.
    if(!matchedPoint){
      const box=new THREE.Box3().setFromObject(mesh);
      const c=new THREE.Vector3(); box.getCenter(c);
      let best=null, bestD=Infinity;
      for(const p of triggerPoints){
        const marker=markerByPointId.get(p.id);
        if(!marker) continue;
        const w=marker.getWorldPosition(new THREE.Vector3());
        const d=w.distanceTo(c);
        if(d<bestD){bestD=d;best=p;}
      }
      matchedPoint=best;
    }

    if(matchedPoint) selectPoint(matchedPoint,false);
  }
});
renderer.domElement.addEventListener("dblclick",()=>{
  targetRotY=0;
  targetRotX=-.05;
  resetCamera();
});
renderer.domElement.addEventListener("wheel",e=>{
  e.preventDefault();
  cameraDistanceGoal=Math.max(.75,Math.min(6.2,cameraDistanceGoal+e.deltaY*.003));
},{passive:false});

function resize(){const r=viewer.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=Math.max(1,r.width)/Math.max(1,r.height);camera.updateProjectionMatrix();}
window.addEventListener("resize",resize);resize();

function animate(){
  requestAnimationFrame(animate);

  rotX+=(targetRotX-rotX)*.11;
  const dy=Math.atan2(Math.sin(targetRotY-rotY),Math.cos(targetRotY-rotY));
  rotY+=dy*.11;
  anatomyRoot.rotation.set(rotX,rotY,0);
  anatomyRoot.updateMatrixWorld(true);

  // First turn the body toward the correct side, then calculate the
  // muscle bounding box and zoom. This prevents zooming toward a stale position.
  if(pendingFocusMeshes && angularDistance(rotY,targetRotY)<.035 && Math.abs(rotX-targetRotX)<.035){
    const meshes=pendingFocusMeshes;
    pendingFocusMeshes=null;
    focusOnMeshes(meshes);
  }

  // When focused, keep the camera target attached to the selected muscle
  // while the user rotates the anatomy.
  if(selectedMuscleMeshes.length && cameraDistanceGoal<4){
    const box=new THREE.Box3();
    selectedMuscleMeshes.forEach(m=>box.expandByObject(m));
    const c=new THREE.Vector3();
    box.getCenter(c);
    cameraTargetGoal.lerp(c,.35);
  }

  cameraTarget.lerp(cameraTargetGoal,.12);
  cameraDistance+=(cameraDistanceGoal-cameraDistance)*.12;
  camera.position.set(cameraTarget.x,cameraTarget.y,cameraTarget.z+cameraDistance);
  camera.lookAt(cameraTarget);

  markerMeshes.forEach((m,i)=>{
    const pulse=1+Math.sin(performance.now()/520+i)*.04;
    m.scale.setScalar(pulse);
  });

  renderer.render(scene,camera);
}
animate();

if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js?v=real1").catch(()=>{}));}
