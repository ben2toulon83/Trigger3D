import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";
import { triggerPoints, painAreas } from "./data.js";

const viewer = document.querySelector("#viewer");
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x080d19, 6, 12);

const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
camera.position.set(0, 1.05, 6.2);

const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
viewer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0,0.65,0);
controls.minDistance = 3.3;
controls.maxDistance = 9;
controls.enablePan = false;

scene.add(new THREE.HemisphereLight(0xbfdcff,0x14172a,2.1));
const key = new THREE.DirectionalLight(0xffffff,2.5);
key.position.set(4,5,5);
scene.add(key);
const rim = new THREE.DirectionalLight(0x6aa7ff,1.8);
rim.position.set(-4,3,-4);
scene.add(rim);

const body = new THREE.Group();
scene.add(body);

const skin = new THREE.MeshStandardMaterial({color:0x9f6657,roughness:.66,metalness:.02});
const muscle = new THREE.MeshStandardMaterial({color:0xa9343e,roughness:.62,metalness:.01});
const darkMuscle = new THREE.MeshStandardMaterial({color:0x732932,roughness:.7});

function capsule(r,l,material=muscle){
  const g = new THREE.CapsuleGeometry(r,l,8,16);
  const m = new THREE.Mesh(g,material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
function sphere(rx,ry,rz,material=muscle){
  const g = new THREE.SphereGeometry(1,32,20);
  g.scale(rx,ry,rz);
  const m = new THREE.Mesh(g,material);
  m.castShadow = true;
  return m;
}

const pelvis=sphere(.42,.34,.25,darkMuscle); pelvis.position.y=.35; body.add(pelvis);
const torso=sphere(.56,.85,.30,muscle); torso.position.y=1.15; body.add(torso);
const chest=sphere(.64,.42,.34,muscle); chest.position.y=1.52; body.add(chest);
const neck=capsule(.16,.25,skin); neck.position.y=2.04; body.add(neck);
const head=sphere(.30,.38,.30,skin); head.position.y=2.44; body.add(head);

function limb(x,y,z,r,l,rotZ,material=muscle){
  const m=capsule(r,l,material);
  m.position.set(x,y,z);
  m.rotation.z=rotZ;
  body.add(m); return m;
}
limb(-.73,1.42,0,.15,.72,-.08);
limb(.73,1.42,0,.15,.72,.08);
limb(-.80,.79,0,.125,.62,-.02,skin);
limb(.80,.79,0,.125,.62,.02,skin);
limb(-.25,-.05,0,.19,.88,0);
limb(.25,-.05,0,.19,.88,0);
limb(-.25,-.93,0,.15,.78,0);
limb(.25,-.93,0,.15,.78,0);
const footL=sphere(.18,.12,.34,skin); footL.position.set(-.25,-1.52,.13); body.add(footL);
const footR=sphere(.18,.12,.34,skin); footR.position.set(.25,-1.52,.13); body.add(footR);

const pointGroup = new THREE.Group();
body.add(pointGroup);
const pointMeshes = [];
triggerPoints.forEach((p)=>{
  const geo = new THREE.SphereGeometry(.055,20,14);
  const mat = new THREE.MeshStandardMaterial({color:0xff3e55,emissive:0x6d0712,emissiveIntensity:1.2});
  const mesh = new THREE.Mesh(geo,mat);
  mesh.position.fromArray(p.position);
  mesh.userData.point=p;
  pointGroup.add(mesh);
  pointMeshes.push(mesh);
});

const painGroup = new THREE.Group();
body.add(painGroup);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selected = null;
let painVisible = false;

renderer.domElement.addEventListener("pointerdown",(event)=>{
  const rect=renderer.domElement.getBoundingClientRect();
  pointer.x=((event.clientX-rect.left)/rect.width)*2-1;
  pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects(pointMeshes,false);
  if(hits[0]) selectPoint(hits[0].object.userData.point);
});

function selectPoint(point){
  selected=point;
  painVisible=false;
  clearPain();
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
}

function clearPain(){
  while(painGroup.children.length) painGroup.remove(painGroup.children[0]);
}
function showPain(){
  clearPain();
  if(!selected) return;
  const [x,y,z]=selected.position;
  const mat=new THREE.MeshBasicMaterial({color:0xf59e0b,transparent:true,opacity:.28,depthWrite:false});
  const halo=sphere(.30,.42,.12,mat);
  halo.position.set(x,y,z+(z>=0?.18:-.18));
  painGroup.add(halo);
}
document.querySelector("#togglePain").addEventListener("click",()=>{
  painVisible=!painVisible;
  if(painVisible) showPain(); else clearPain();
  document.querySelector("#togglePain").textContent=painVisible?"Masquer la zone projetée":"Afficher la zone projetée";
});

const views={
  front:[0,1.0,6.2],
  back:[0,1.0,-6.2],
  left:[-6.2,1.0,0],
  right:[6.2,1.0,0]
};
document.querySelectorAll("[data-view]").forEach(btn=>btn.addEventListener("click",()=>{
  const v=views[btn.dataset.view];
  camera.position.set(...v);
  controls.target.set(0,.65,0);
  controls.update();
}));
document.querySelector("#resetView").addEventListener("click",()=>{
  camera.position.set(0,1.05,6.2);
  controls.target.set(0,.65,0);
  controls.update();
});

function switchTab(name){
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===name));
  document.querySelectorAll(".tab-panel").forEach(p=>p.classList.toggle("active",p.id==="tab-"+name));
}
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>switchTab(t.dataset.tab)));

const painButtons=document.querySelector("#painButtons");
painAreas.forEach(area=>{
  const b=document.createElement("button");
  b.className="chip";
  b.textContent=area[0].toUpperCase()+area.slice(1);
  b.addEventListener("click",()=>{
    document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    renderPainResults(area);
  });
  painButtons.appendChild(b);
});

function renderPainResults(area){
  const out=document.querySelector("#painResults");
  const matches=triggerPoints.filter(p=>p.painZones.includes(area));
  out.innerHTML=matches.length?"":'<div class="result-card">Aucun point dans la base prototype.</div>';
  matches.forEach(p=>{
    const card=document.createElement("div"); card.className="result-card";
    const btn=document.createElement("button");
    btn.innerHTML='<strong>'+p.muscle+'</strong><small>'+p.referral+'</small>';
    btn.addEventListener("click",()=>selectPoint(p));
    card.appendChild(btn); out.appendChild(card);
  });
}

const muscles=[...new Set(triggerPoints.map(p=>p.muscle))].sort();
const muscleList=document.querySelector("#muscleList");
muscles.forEach(name=>{
  const p=triggerPoints.find(x=>x.muscle===name);
  const card=document.createElement("div");card.className="result-card";
  const btn=document.createElement("button");
  btn.innerHTML='<strong>'+name+'</strong><small>'+p.referral+'</small>';
  btn.addEventListener("click",()=>selectPoint(p));
  card.appendChild(btn); muscleList.appendChild(card);
});

function resize(){
  const r=viewer.getBoundingClientRect();
  renderer.setSize(r.width,r.height,false);
  camera.aspect=r.width/r.height;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize",resize);
resize();

function animate(){
  requestAnimationFrame(animate);
  controls.update();
  pointMeshes.forEach((m,i)=>{
    const s=1+Math.sin(performance.now()/500+i)*.08;
    m.scale.setScalar(s);
  });
  renderer.render(scene,camera);
}
animate();

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}

let deferredPrompt;
const installBtn=document.querySelector("#installBtn");
window.addEventListener("beforeinstallprompt",(e)=>{
  e.preventDefault();
  deferredPrompt=e;
  installBtn.hidden=false;
});
installBtn.addEventListener("click",async()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt=null;
  installBtn.hidden=true;
});
