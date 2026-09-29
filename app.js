import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { triggerPoints, painAreas } from "./data.js";

const viewer = document.querySelector("#viewer");
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x080d19, 6, 12);

const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
camera.position.set(0, 1.05, 6.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
viewer.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xbfdcff, 0x14172a, 2.1));
const key = new THREE.DirectionalLight(0xffffff, 2.5);
key.position.set(4, 5, 5);
scene.add(key);
const rim = new THREE.DirectionalLight(0x6aa7ff, 1.8);
rim.position.set(-4, 3, -4);
scene.add(rim);

const body = new THREE.Group();
body.position.y = 0.05;
scene.add(body);

const skin = new THREE.MeshStandardMaterial({ color: 0xc98d78, roughness: .66 });
const muscle = new THREE.MeshStandardMaterial({ color: 0xa9343e, roughness: .62 });
const darkMuscle = new THREE.MeshStandardMaterial({ color: 0x732932, roughness: .7 });

function capsule(r, l, material = muscle) {
  const g = new THREE.CapsuleGeometry(r, l, 8, 16);
  return new THREE.Mesh(g, material);
}
function sphere(rx, ry, rz, material = muscle) {
  const g = new THREE.SphereGeometry(1, 32, 20);
  g.scale(rx, ry, rz);
  return new THREE.Mesh(g, material);
}
function limb(x, y, z, r, l, rotZ, material = muscle) {
  const m = capsule(r, l, material);
  m.position.set(x, y, z);
  m.rotation.z = rotZ;
  body.add(m);
  return m;
}

const pelvis = sphere(.42, .34, .25, darkMuscle); pelvis.position.y = .35; body.add(pelvis);
const torso = sphere(.56, .85, .30, muscle); torso.position.y = 1.15; body.add(torso);
const chest = sphere(.64, .42, .34, muscle); chest.position.y = 1.52; body.add(chest);
const neck = capsule(.16, .25, skin); neck.position.y = 2.04; body.add(neck);
const head = sphere(.30, .38, .30, skin); head.position.y = 2.44; body.add(head);
limb(-.73, 1.42, 0, .15, .72, -.08);
limb(.73, 1.42, 0, .15, .72, .08);
limb(-.80, .79, 0, .125, .62, -.02, skin);
limb(.80, .79, 0, .125, .62, .02, skin);
limb(-.25, -.05, 0, .19, .88, 0);
limb(.25, -.05, 0, .19, .88, 0);
limb(-.25, -.93, 0, .15, .78, 0);
limb(.25, -.93, 0, .15, .78, 0);
const footL = sphere(.18, .12, .34, skin); footL.position.set(-.25, -1.52, .13); body.add(footL);
const footR = sphere(.18, .12, .34, skin); footR.position.set(.25, -1.52, .13); body.add(footR);

const pointMeshes = [];
const pointGroup = new THREE.Group();
body.add(pointGroup);
triggerPoints.forEach((p) => {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(.06, 20, 14),
    new THREE.MeshStandardMaterial({ color: 0xff3e55, emissive: 0x8a0a19, emissiveIntensity: 1.3 })
  );
  mesh.position.fromArray(p.position);
  mesh.userData.point = p;
  pointGroup.add(mesh);
  pointMeshes.push(mesh);
});

const painGroup = new THREE.Group();
body.add(painGroup);

let rotX = 0;
let rotY = 0;
let targetRotX = 0;
let targetRotY = 0;
let distance = 6.2;
let dragging = false;
let lastX = 0;
let lastY = 0;

renderer.domElement.style.touchAction = "none";
renderer.domElement.addEventListener("pointerdown", (e) => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  renderer.domElement.setPointerCapture(e.pointerId);
});
renderer.domElement.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  targetRotY += dx * 0.01;
  targetRotX += dy * 0.006;
  targetRotX = Math.max(-0.5, Math.min(0.5, targetRotX));
  lastX = e.clientX;
  lastY = e.clientY;
});
renderer.domElement.addEventListener("pointerup", (e) => {
  dragging = false;
  try { renderer.domElement.releasePointerCapture(e.pointerId); } catch {}
});
renderer.domElement.addEventListener("wheel", (e) => {
  e.preventDefault();
  distance += e.deltaY * 0.004;
  distance = Math.max(3.6, Math.min(8.5, distance));
}, { passive: false });

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downX = 0, downY = 0;
renderer.domElement.addEventListener("pointerdown", e => { downX=e.clientX; downY=e.clientY; });
renderer.domElement.addEventListener("pointerup", (e) => {
  if (Math.hypot(e.clientX-downX,e.clientY-downY) > 5) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(pointMeshes, false)[0];
  if (hit) selectPoint(hit.object.userData.point);
});

let selected = null;
let painVisible = false;
function clearPain() {
  while (painGroup.children.length) painGroup.remove(painGroup.children[0]);
}
function showPain() {
  clearPain();
  if (!selected) return;
  const [x,y,z] = selected.position;
  const mat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: .28, depthWrite: false });
  const halo = sphere(.30,.42,.12,mat);
  halo.position.set(x,y,z+(z>=0?.18:-.18));
  painGroup.add(halo);
}
function selectPoint(point) {
  selected = point;
  painVisible = false;
  clearPain();
  document.querySelector("#emptyState").hidden = true;
  document.querySelector("#detailCard").hidden = false;
  document.querySelector("#detailTitle").textContent = point.label;
  document.querySelector("#detailMuscle").textContent = point.muscle + " · côté " + point.side;
  document.querySelector("#detailReferral").textContent = point.referral;
  document.querySelector("#detailLocation").textContent = point.location;
  document.querySelector("#detailCare").textContent = point.care;
  document.querySelector("#detailCaution").textContent = point.caution;
  document.querySelector("#togglePain").textContent = "Afficher la zone projetée";
  switchTab("explore");
}
document.querySelector("#togglePain").addEventListener("click", () => {
  painVisible = !painVisible;
  if (painVisible) showPain(); else clearPain();
  document.querySelector("#togglePain").textContent = painVisible ? "Masquer la zone projetée" : "Afficher la zone projetée";
});

const viewAngles = { front:0, back:Math.PI, left:-Math.PI/2, right:Math.PI/2 };
document.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => {
  targetRotY = viewAngles[btn.dataset.view] ?? 0;
  targetRotX = 0;
}));
document.querySelector("#resetView").addEventListener("click", () => {
  targetRotY = 0; targetRotX = 0; distance = 6.2;
});

function switchTab(name) {
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === "tab-" + name));
}
document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => switchTab(t.dataset.tab)));

const painButtons = document.querySelector("#painButtons");
painAreas.forEach(area => {
  const b = document.createElement("button");
  b.className = "chip";
  b.textContent = area[0].toUpperCase() + area.slice(1);
  b.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    renderPainResults(area);
  });
  painButtons.appendChild(b);
});
function renderPainResults(area) {
  const out = document.querySelector("#painResults");
  const matches = triggerPoints.filter(p => p.painZones.includes(area));
  out.innerHTML = "";
  if (!matches.length) out.innerHTML = '<div class="result-card">Aucun point dans la base prototype.</div>';
  matches.forEach(p => {
    const card = document.createElement("div"); card.className = "result-card";
    const btn = document.createElement("button");
    btn.innerHTML = "<strong>"+p.muscle+"</strong><small>"+p.referral+"</small>";
    btn.addEventListener("click", () => selectPoint(p));
    card.appendChild(btn); out.appendChild(card);
  });
}
const muscles = [...new Set(triggerPoints.map(p => p.muscle))].sort();
const muscleList = document.querySelector("#muscleList");
muscles.forEach(name => {
  const p = triggerPoints.find(x => x.muscle === name);
  const card = document.createElement("div"); card.className = "result-card";
  const btn = document.createElement("button");
  btn.innerHTML = "<strong>"+name+"</strong><small>"+p.referral+"</small>";
  btn.addEventListener("click", () => selectPoint(p));
  card.appendChild(btn); muscleList.appendChild(card);
});

function resize() {
  const r = viewer.getBoundingClientRect();
  renderer.setSize(Math.max(1,r.width), Math.max(1,r.height), false);
  camera.aspect = Math.max(1,r.width) / Math.max(1,r.height);
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

function animate() {
  requestAnimationFrame(animate);
  rotX += (targetRotX - rotX) * .12;
  rotY += (targetRotY - rotY) * .12;
  body.rotation.x = rotX;
  body.rotation.y = rotY;
  camera.position.set(0, 1.05, distance);
  camera.lookAt(0, .65, 0);
  pointMeshes.forEach((m,i) => {
    const s = 1 + Math.sin(performance.now()/450 + i) * .08;
    m.scale.setScalar(s);
  });
  renderer.render(scene, camera);
}
animate();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js?v=3").catch(()=>{}));
}
