import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { triggerPoints, painAreas } from "./data.js";

const viewer = document.querySelector("#viewer");
const statusEl = document.querySelector("#jsStatus");
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x080d19, 5, 12);

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0.45, 5.9);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
viewer.appendChild(renderer.domElement);
statusEl.textContent = "3D chargée";
statusEl.classList.add("ok");

scene.add(new THREE.HemisphereLight(0xc6ddff, 0x101625, 2.0));
const key = new THREE.DirectionalLight(0xffffff, 2.4);
key.position.set(4, 5, 6);
scene.add(key);
const fill = new THREE.DirectionalLight(0x93c5fd, 1.2);
fill.position.set(-4, 1.5, 3);
scene.add(fill);
const rim = new THREE.DirectionalLight(0x7dd3fc, 1.1);
rim.position.set(-4, 3, -4);
scene.add(rim);

const body = new THREE.Group();
scene.add(body);

const skinMat = new THREE.MeshStandardMaterial({ color: 0xc9917e, roughness: 0.68, metalness: 0.0 });
const muscleFrontMat = new THREE.MeshStandardMaterial({ color: 0xb64356, roughness: 0.55, metalness: 0.0 });
const muscleBackMat = new THREE.MeshStandardMaterial({ color: 0x9e3746, roughness: 0.58, metalness: 0.0 });
const jointMat = new THREE.MeshStandardMaterial({ color: 0x7d3240, roughness: 0.7, metalness: 0.0 });

function addMesh(geometry, material, x, y, z, rx = 0, ry = 0, rz = 0) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  body.add(mesh);
  return mesh;
}

function ellipsoid(rx, ry, rz) {
  const g = new THREE.SphereGeometry(1, 28, 20);
  g.scale(rx, ry, rz);
  return g;
}

// Head and neck
addMesh(ellipsoid(0.19, 0.25, 0.20), skinMat, 0, 1.92, 0.03);
addMesh(new THREE.CylinderGeometry(0.08, 0.09, 0.18, 18), skinMat, 0, 1.60, 0.02);

// Torso core
addMesh(ellipsoid(0.42, 0.42, 0.24), muscleFrontMat, 0, 1.28, 0.08); // chest front
addMesh(ellipsoid(0.40, 0.42, 0.20), muscleBackMat, 0, 1.28, -0.08); // upper back
addMesh(ellipsoid(0.33, 0.36, 0.19), muscleFrontMat, 0, 0.82, 0.06); // abdomen front
addMesh(ellipsoid(0.33, 0.36, 0.17), muscleBackMat, 0, 0.82, -0.06); // low back

// Pectorals split
addMesh(ellipsoid(0.20, 0.16, 0.10), muscleFrontMat, -0.16, 1.29, 0.23);
addMesh(ellipsoid(0.20, 0.16, 0.10), muscleFrontMat, 0.16, 1.29, 0.23);

// Shoulder caps
addMesh(ellipsoid(0.14, 0.16, 0.14), muscleFrontMat, -0.46, 1.33, 0.04);
addMesh(ellipsoid(0.14, 0.16, 0.14), muscleFrontMat, 0.46, 1.33, 0.04);

// Trapezius ridge
addMesh(ellipsoid(0.28, 0.14, 0.14), muscleBackMat, 0, 1.53, -0.02);

// Pelvis / glutes
addMesh(ellipsoid(0.26, 0.20, 0.16), jointMat, -0.12, 0.28, -0.07);
addMesh(ellipsoid(0.26, 0.20, 0.16), jointMat, 0.12, 0.28, -0.07);
addMesh(ellipsoid(0.34, 0.20, 0.18), muscleFrontMat, 0, 0.35, 0.04);

// Arms
function addArm(side = -1) {
  const sx = side;
  addMesh(new THREE.CylinderGeometry(0.09, 0.08, 0.46, 18), muscleFrontMat, 0.57 * sx, 1.08, 0.04, 0, 0, 0.05 * sx);
  addMesh(new THREE.CylinderGeometry(0.07, 0.06, 0.42, 18), skinMat, 0.58 * sx, 0.68, 0.04, 0, 0, 0.02 * sx);
  addMesh(ellipsoid(0.08, 0.06, 0.09), jointMat, 0.58 * sx, 0.88, 0.04);
}
addArm(-1); addArm(1);

// Legs
function addLeg(side = -1) {
  const sx = side;
  addMesh(new THREE.CylinderGeometry(0.13, 0.11, 0.70, 22), muscleFrontMat, 0.15 * sx, -0.25, 0.00, 0, 0, 0.02 * sx);
  addMesh(new THREE.CylinderGeometry(0.09, 0.07, 0.68, 22), muscleFrontMat, 0.13 * sx, -0.95, 0.02, 0, 0, 0.01 * sx);
  addMesh(ellipsoid(0.09, 0.06, 0.09), jointMat, 0.14 * sx, -0.61, 0.02);
  addMesh(ellipsoid(0.13, 0.05, 0.26), skinMat, 0.13 * sx, -1.35, 0.11, 0.25, 0, 0);
}
addLeg(-1); addLeg(1);

// Trigger points
const pointGroup = new THREE.Group();
body.add(pointGroup);
const pointMeshes = [];

triggerPoints.forEach((p, idx) => {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.034, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xff4c62, emissive: 0x8f0d1f, emissiveIntensity: 1.35 })
  );
  mesh.position.fromArray(p.position);
  mesh.userData.point = p;
  mesh.userData.baseScale = 1;
  pointGroup.add(mesh);
  pointMeshes.push(mesh);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.047, 0.006, 10, 24),
    new THREE.MeshBasicMaterial({ color: 0xff8fa0, transparent: true, opacity: 0.7 })
  );
  ring.position.copy(mesh.position);
  ring.rotation.x = Math.PI / 2;
  ring.userData.target = mesh;
  pointGroup.add(ring);
  mesh.userData.ring = ring;
});

const painGroup = new THREE.Group();
body.add(painGroup);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let rotX = -0.08;
let rotY = 0;
let targetRotX = -0.08;
let targetRotY = 0;
let distance = 4.9;
let dragging = false;
let downX = 0;
let downY = 0;
let lastX = 0;
let lastY = 0;
let selected = null;
let painVisible = false;
let filterMode = "all";

renderer.domElement.style.touchAction = "none";
renderer.domElement.addEventListener("pointerdown", (e) => {
  dragging = true;
  lastX = downX = e.clientX;
  lastY = downY = e.clientY;
  renderer.domElement.setPointerCapture(e.pointerId);
});
renderer.domElement.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  targetRotY += dx * 0.01;
  targetRotX += dy * 0.006;
  targetRotX = Math.max(-0.45, Math.min(0.45, targetRotX));
  lastX = e.clientX;
  lastY = e.clientY;
});
renderer.domElement.addEventListener("pointerup", (e) => {
  dragging = false;
  try { renderer.domElement.releasePointerCapture(e.pointerId); } catch {}
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(pointMeshes, false)[0];
  if (hit) selectPoint(hit.object.userData.point);
});
renderer.domElement.addEventListener("wheel", (e) => {
  e.preventDefault();
  distance += e.deltaY * 0.0035;
  distance = Math.max(3.7, Math.min(7.0, distance));
}, { passive: false });

function clearPain() {
  while (painGroup.children.length) painGroup.remove(painGroup.children[0]);
}

function addPainHalo(x, y, z, sx, sy, sz) {
  const halo = new THREE.Mesh(
    ellipsoid(sx, sy, sz),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.24, depthWrite: false })
  );
  halo.position.set(x, y, z);
  painGroup.add(halo);
}

function showPain() {
  clearPain();
  if (!selected) return;
  const zones = selected.painZones || [];
  zones.forEach(zone => {
    if (zone === "nuque") addPainHalo(0, 1.58, -0.03, 0.26, 0.18, 0.14);
    if (zone === "tempe") addPainHalo(selected.side === "gauche" ? -0.16 : 0.16, 1.98, 0.18, 0.11, 0.10, 0.07);
    if (zone === "mâchoire") addPainHalo(selected.side === "gauche" ? -0.16 : 0.16, 1.86, 0.17, 0.11, 0.08, 0.06);
    if (zone === "visage") addPainHalo(selected.side === "gauche" ? -0.11 : 0.11, 1.93, 0.18, 0.10, 0.10, 0.08);
    if (zone === "épaule") addPainHalo(selected.side === "gauche" ? -0.45 : 0.45, 1.33, 0.05, 0.16, 0.14, 0.14);
    if (zone === "bras") addPainHalo(selected.side === "gauche" ? -0.58 : 0.58, 1.03, 0.04, 0.13, 0.18, 0.10);
    if (zone === "avant-bras") addPainHalo(selected.side === "gauche" ? -0.58 : 0.58, 0.67, 0.04, 0.11, 0.16, 0.09);
    if (zone === "thorax") addPainHalo(selected.side === "gauche" ? -0.22 : 0.22, 1.24, 0.21, 0.18, 0.20, 0.10);
    if (zone === "lombaires") addPainHalo(0, 0.64, -0.06, 0.30, 0.18, 0.12);
    if (zone === "hanche") addPainHalo(selected.side === "gauche" ? -0.26 : 0.26, 0.28, -0.02, 0.14, 0.12, 0.10);
    if (zone === "fesse") addPainHalo(selected.side === "gauche" ? -0.14 : 0.14, 0.18, -0.13, 0.18, 0.14, 0.10);
    if (zone === "jambe") addPainHalo(selected.side === "gauche" ? -0.12 : 0.12, -0.84, 0.02, 0.12, 0.32, 0.10);
    if (zone === "cuisse") addPainHalo(selected.side === "gauche" ? -0.15 : 0.15, -0.28, -0.02, 0.14, 0.28, 0.10);
    if (zone === "genou") addPainHalo(selected.side === "gauche" ? -0.14 : 0.14, -0.60, 0.02, 0.11, 0.08, 0.08);
    if (zone === "mollet") addPainHalo(selected.side === "gauche" ? -0.12 : 0.12, -1.00, -0.03, 0.11, 0.20, 0.09);
    if (zone === "cheville") addPainHalo(selected.side === "gauche" ? -0.13 : 0.13, -1.28, 0.04, 0.10, 0.08, 0.08);
    if (zone === "pied") addPainHalo(selected.side === "gauche" ? -0.13 : 0.13, -1.36, 0.12, 0.13, 0.05, 0.22);
    if (zone === "plante du pied") addPainHalo(selected.side === "gauche" ? -0.13 : 0.13, -1.37, 0.15, 0.13, 0.04, 0.22);
  });
}

function updatePointVisibility() {
  pointMeshes.forEach(mesh => {
    const point = mesh.userData.point;
    const show = filterMode === "all" || (selected && point.muscle === selected.muscle);
    mesh.visible = show;
    if (mesh.userData.ring) mesh.userData.ring.visible = show;
  });
  document.querySelector("#showAllPoints").classList.toggle("active", filterMode === "all");
  document.querySelector("#focusSelection").classList.toggle("active", filterMode === "selected");
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
  if (filterMode === "selected") updatePointVisibility();
}

document.querySelector("#togglePain").addEventListener("click", () => {
  painVisible = !painVisible;
  if (painVisible) showPain(); else clearPain();
  document.querySelector("#togglePain").textContent = painVisible ? "Masquer la zone projetée" : "Afficher la zone projetée";
});

document.querySelector("#showMusclePoints").addEventListener("click", () => {
  filterMode = "selected";
  updatePointVisibility();
});

document.querySelector("#showAllPoints").addEventListener("click", () => {
  filterMode = "all";
  updatePointVisibility();
});

document.querySelector("#focusSelection").addEventListener("click", () => {
  if (!selected) return;
  filterMode = "selected";
  updatePointVisibility();
});

const viewAngles = { front: 0, back: Math.PI, left: -Math.PI/2, right: Math.PI/2 };
document.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => {
  targetRotY = viewAngles[btn.dataset.view] ?? 0;
  targetRotX = -0.06;
}));
document.querySelector("#resetView").addEventListener("click", () => {
  targetRotY = 0;
  targetRotX = -0.08;
  distance = 4.9;
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
  out.innerHTML = matches.length ? "" : '<div class="result-card">Aucun point dans la base actuelle.</div>';
  matches.forEach(p => {
    const card = document.createElement("div");
    card.className = "result-card";
    const btn = document.createElement("button");
    btn.innerHTML = '<strong>' + p.muscle + ' · ' + p.side + '</strong><small>' + p.referral + '</small>';
    btn.addEventListener("click", () => selectPoint(p));
    card.appendChild(btn);
    out.appendChild(card);
  });
}

const muscles = [...new Set(triggerPoints.map(p => p.muscle))].sort();
const muscleList = document.querySelector("#muscleList");
muscles.forEach(name => {
  const list = triggerPoints.filter(x => x.muscle === name);
  const card = document.createElement("div");
  card.className = "result-card";
  const btn = document.createElement("button");
  btn.innerHTML = '<strong>' + name + '</strong><small>' + list.length + ' point(s) dans cette base</small>';
  btn.addEventListener("click", () => {
    selectPoint(list[0]);
    filterMode = "selected";
    updatePointVisibility();
  });
  card.appendChild(btn);
  muscleList.appendChild(card);
});

document.querySelector("#statPoints").textContent = String(triggerPoints.length);
document.querySelector("#statMuscles").textContent = String(muscles.length);

function resize() {
  const r = viewer.getBoundingClientRect();
  renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false);
  camera.aspect = Math.max(1, r.width) / Math.max(1, r.height);
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

function animate() {
  requestAnimationFrame(animate);
  rotX += (targetRotX - rotX) * 0.12;
  rotY += (targetRotY - rotY) * 0.12;
  body.rotation.x = rotX;
  body.rotation.y = rotY;
  camera.position.set(0, 0.45, distance);
  camera.lookAt(0, 0.45, 0);

  pointMeshes.forEach((m, i) => {
    const pulse = 1 + Math.sin(performance.now() / 450 + i) * 0.08;
    m.scale.setScalar(pulse);
    if (m.userData.ring) {
      m.userData.ring.scale.setScalar(1 + Math.sin(performance.now() / 600 + i) * 0.05);
    }
    const isSelected = selected && selected.id === m.userData.point.id;
    m.material.emissiveIntensity = isSelected ? 2.0 : 1.25;
    m.material.color.set(isSelected ? 0xff7b8b : 0xff4c62);
  });

  renderer.render(scene, camera);
}

updatePointVisibility();
animate();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}

window.addEventListener("error", (e) => {
  statusEl.textContent = "Erreur 3D : " + (e.message || "inconnue");
  statusEl.classList.remove("ok");
});
