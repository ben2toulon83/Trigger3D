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
let currentView="front";
let cameraTarget=new THREE.Vector3(0,0.25,0);
let cameraTargetGoal=cameraTarget.clone();
let userPanOffset=new THREE.Vector3(0,0,0);
let cameraDistance=5.2;
let cameraDistanceGoal=5.2;
let pendingFocusMeshes=null;
let pendingFocusPoint=null;
let bodyLocalBox=null;

const anatomicalRegions={
  "Trapèze supérieur":      {y:.78,z:.16,spanY:.13,spanX:.14,spanZ:.10},
  "Sterno-cléido-mastoïdien":{y:.86,z:.76,spanY:.12,spanX:.10,spanZ:.12},
  "Masséter":               {y:.92,z:.78,spanY:.08,spanX:.08,spanZ:.10},
  "Supra-épineux":          {y:.75,z:.16,spanY:.08,spanX:.15,spanZ:.08},
  "Infra-épineux":          {y:.69,z:.13,spanY:.15,spanX:.16,spanZ:.09},
  "Élévateur de la scapula":{y:.78,z:.14,spanY:.14,spanX:.11,spanZ:.08},
  "Grand pectoral":         {y:.69,z:.86,spanY:.18,spanX:.20,spanZ:.09},
  "Carré des lombes":       {y:.51,z:.16,spanY:.16,spanX:.12,spanZ:.10},
  "Moyen fessier":          {y:.38,z:.16,spanY:.14,spanX:.10,spanZ:.11,xLeft:.60,xRight:.40},
  "Piriforme":              {y:.34,z:.15,spanY:.09,spanX:.09,spanZ:.09,xLeft:.56,xRight:.44},
  "Ischio-jambiers":        {y:.23,z:.14,spanY:.22,spanX:.09,spanZ:.09,xLeft:.60,xRight:.40},
  "Gastrocnémien":          {y:.09,z:.14,spanY:.17,spanX:.08,spanZ:.08,xLeft:.61,xRight:.39},
  "Tibial antérieur":       {y:.09,z:.84,spanY:.18,spanX:.08,spanZ:.08,xLeft:.61,xRight:.39},
  "Deltoïde":                {y:.72,z:.50,spanY:.13,spanX:.08,spanZ:.20,xLeft:.73,xRight:.27},
  "Grand dorsal":            {y:.58,z:.18,spanY:.22,spanX:.12,spanZ:.10,xLeft:.61,xRight:.39},
  "Rhomboïdes":              {y:.67,z:.14,spanY:.15,spanX:.14,spanZ:.08},
  "Grand fessier":           {y:.34,z:.15,spanY:.18,spanX:.10,spanZ:.11,xLeft:.58,xRight:.42},
  "Petit fessier":           {y:.40,z:.28,spanY:.12,spanX:.09,spanZ:.12,xLeft:.60,xRight:.40},
  "Soléaire":                {y:.08,z:.15,spanY:.19,spanX:.08,spanZ:.08,xLeft:.61,xRight:.39},
  "Psoas-iliaque":           {y:.48,z:.62,spanY:.18,spanX:.10,spanZ:.16},
  "Adducteurs":              {y:.25,z:.55,spanY:.22,spanX:.08,spanZ:.12,xLeft:.57,xRight:.43},
  "Droit fémoral":           {y:.24,z:.82,spanY:.22,spanX:.08,spanZ:.09,xLeft:.60,xRight:.40},
  "Vaste latéral":           {y:.23,z:.68,spanY:.23,spanX:.08,spanZ:.13,xLeft:.63,xRight:.37},
  "Tenseur du fascia lata":  {y:.36,z:.58,spanY:.11,spanX:.08,spanZ:.12,xLeft:.65,xRight:.35},
  "Scalènes":                {y:.84,z:.54,spanY:.12,spanX:.09,spanZ:.15},
  "Temporal":                {y:.94,z:.60,spanY:.07,spanX:.09,spanZ:.14}
};

const preferredFocusView={
  "Deltoïde":"side",
  "Sterno-cléido-mastoïdien":"side",
  "Masséter":"side",
  "Temporal":"side",
  "Trapèze supérieur":"back",
  "Supra-épineux":"back",
  "Infra-épineux":"back",
  "Élévateur de la scapula":"back",
  "Rhomboïdes":"back",
  "Grand dorsal":"back",
  "Carré des lombes":"back",
  "Grand pectoral":"front",
  "Grand fessier":"back",
  "Moyen fessier":"back",
  "Petit fessier":"back",
  "Piriforme":"back",
  "Ischio-jambiers":"back",
  "Gastrocnémien":"back",
  "Soléaire":"back",
  "Tibial antérieur":"front",
  "Droit fémoral":"front",
  "Vaste latéral":"side",
  "Tenseur du fascia lata":"side",
  "Psoas-iliaque":"front",
  "Adducteurs":"front",
  "Scalènes":"side"
};

function bestViewForPoint(point){
  const pref=preferredFocusView[point.muscle];
  if(pref==="side") return point.side==="gauche" ? "left" : "right";
  return pref || point.view || "front";
}

const directHighlightMuscles=new Set([
  "Trapèze supérieur",
  "Sterno-cléido-mastoïdien",
  "Masséter",
  "Supra-épineux",
  "Infra-épineux",
  "Élévateur de la scapula",
  "Grand pectoral",
  "Deltoïde",
  "Grand fessier",
  "Moyen fessier",
  "Petit fessier",
  "Piriforme",
  "Gastrocnémien",
  "Soléaire",
  "Tibial antérieur",
  "Droit fémoral",
  "Vaste latéral",
  "Tenseur du fascia lata",
  "Temporal"
]);

const regionalOnlyMuscles=new Set([
  "Carré des lombes",
  "Grand dorsal",
  "Rhomboïdes",
  "Psoas-iliaque",
  "Adducteurs",
  "Ischio-jambiers",
  "Scalènes"
]);

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
  "Tibial antérieur":["tibialis anterior","tibialis_anterior"],
  "Deltoïde":["deltoid","deltoideus"],
  "Grand dorsal":["latissimus dorsi","latissimus_dorsi"],
  "Rhomboïdes":["rhomboid major","rhomboid minor","rhomboideus"],
  "Grand fessier":["gluteus maximus","gluteus_maximus"],
  "Petit fessier":["gluteus minimus","gluteus_minimus"],
  "Soléaire":["soleus"],
  "Psoas-iliaque":["psoas major","iliacus","iliopsoas"],
  "Adducteurs":["adductor longus","adductor magnus","adductor brevis"],
  "Droit fémoral":["rectus femoris","rectus_femoris"],
  "Vaste latéral":["vastus lateralis","vastus_lateralis"],
  "Tenseur du fascia lata":["tensor fasciae latae","tensor_fasciae_latae"],
  "Scalènes":["scalenus anterior","scalenus medius","scalenus posterior","scalene"],
  "Temporal":["temporalis","temporal muscle"]
};

function norm(s){
  return (s||"").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[._-]+/g," ").replace(/\s+/g," ").trim();
}
function regionLocalPoint(point){
  if(!bodyLocalBox) return new THREE.Vector3(...(point.position||[0,0,0]));

  const r=anatomicalRegions[point.muscle] || {y:.5,z:point.view==="front"?.85:.15,spanY:.12,spanX:.12,spanZ:.08};
  const size=new THREE.Vector3();
  bodyLocalBox.getSize(size);

  const defaultLeft=.57;
  const defaultRight=.43;
  const sideCenter=point.side==="gauche" ? (r.xLeft ?? defaultLeft) : (r.xRight ?? defaultRight);
  const a=point.anchor || [.5,.5,.5];

  const xn=sideCenter + (a[0]-.5)*r.spanX;
  const yn=r.y + (a[1]-.5)*r.spanY;
  const zn=r.z + (a[2]-.5)*r.spanZ;

  return new THREE.Vector3(
    bodyLocalBox.min.x + size.x*xn,
    bodyLocalBox.min.y + size.y*yn,
    bodyLocalBox.min.z + size.z*zn
  );
}

function regionWorldPoint(point){
  const local=regionLocalPoint(point);
  anatomyRoot.updateMatrixWorld(true);
  return anatomyRoot.localToWorld(local.clone());
}

function sideScore(name,side){
  const n=norm(name);
  if(side==="gauche") return /(^|\s)(left|l)(\s|$)/.test(n) || n.endsWith(" l") ? 2 : 0;
  if(side==="droit") return /(^|\s)(right|r)(\s|$)/.test(n) || n.endsWith(" r") ? 2 : 0;
  return 0;
}

function candidateMeshIsPlausible(mesh,point){
  if(!mesh || !bodyLocalBox) return true;

  const bodySize=new THREE.Vector3();
  bodyLocalBox.getSize(bodySize);

  const box=new THREE.Box3().setFromObject(mesh);
  const size=new THREE.Vector3();
  box.getSize(size);

  const bodyCenterX=(bodyLocalBox.min.x+bodyLocalBox.max.x)/2;

  // A unilateral trigger should not highlight a mesh spanning most of both sides.
  const crossesMidline=box.min.x<bodyCenterX && box.max.x>bodyCenterX;
  const tooWide=size.x>bodySize.x*.34;

  if(point.side && crossesMidline && tooWide){
    return false;
  }

  // Reject clearly oversized structures for a local muscle focus.
  if(size.y>bodySize.y*.55 || size.x>bodySize.x*.60){
    return false;
  }

  // Candidate centre should remain reasonably close to the anatomical region.
  const centre=new THREE.Vector3();
  box.getCenter(centre);
  const expected=regionWorldPoint(point);
  const maxDist=Math.max(bodySize.y*.18,0.35);

  if(centre.distanceTo(expected)>maxDist){
    return false;
  }

  return true;
}

function matchMuscle(point){
  if(!directHighlightMuscles.has(point.muscle)) return [];
  const list=aliases[point.muscle]||[point.muscle];
  const candidates=anatomyMeshes.filter(m=>{
    const n=norm(m.name || m.userData?.za_name || "");
    return list.some(a=>n.includes(norm(a)));
  });

  if(!candidates.length) return [];

  const plausible=candidates.filter(m=>candidateMeshIsPlausible(m,point));
  const pool=plausible.length ? plausible : [];

  if(!pool.length) return [];

  const scored=[...pool].sort((a,b)=>sideScore(b.name,point.side)-sideScore(a.name,point.side));
  const bestScore=sideScore(scored[0].name,point.side);

  return bestScore>0
    ? scored.filter(x=>sideScore(x.name,point.side)===bestScore)
    : scored;
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
  modelRoot.updateMatrixWorld(true);
  bodyLocalBox=new THREE.Box3().setFromObject(modelRoot);
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
  bodyLocalBox=new THREE.Box3().setFromObject(root);
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
  resetCamera();
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
  // Only accept an explicit anatomical-name match.
  // A nearby but unrelated mesh is worse than no highlight at all.
  return matchMuscle(point);
}


function projectPointOnSurface(anchorWorld, meshes, view, side=null){
  if(!meshes || !meshes.length) return anchorWorld.clone();

  const box=new THREE.Box3();
  meshes.forEach(m=>box.expandByObject(m));

  const size=new THREE.Vector3();
  box.getSize(size);

  const margin=Math.max(size.x,size.y,size.z)*0.8+0.03;
  const ray=new THREE.Raycaster();
  const candidates=[];

  const pushCandidate=(origin,direction)=>{
    candidates.push({origin,direction:direction.clone().normalize()});
  };

  if(view==="front"){
    pushCandidate(
      new THREE.Vector3(anchorWorld.x,anchorWorld.y,box.max.z+margin),
      new THREE.Vector3(0,0,-1)
    );
  } else if(view==="back"){
    pushCandidate(
      new THREE.Vector3(anchorWorld.x,anchorWorld.y,box.min.z-margin),
      new THREE.Vector3(0,0,1)
    );
  } else if(view==="left"){
    pushCandidate(
      new THREE.Vector3(box.min.x-margin,anchorWorld.y,anchorWorld.z),
      new THREE.Vector3(1,0,0)
    );
  } else if(view==="right"){
    pushCandidate(
      new THREE.Vector3(box.max.x+margin,anchorWorld.y,anchorWorld.z),
      new THREE.Vector3(-1,0,0)
    );
  }

  // Fallback rays in all main anatomical directions.
  pushCandidate(
    new THREE.Vector3(anchorWorld.x,box.max.y+margin,anchorWorld.z),
    new THREE.Vector3(0,-1,0)
  );
  pushCandidate(
    new THREE.Vector3(anchorWorld.x,box.min.y-margin,anchorWorld.z),
    new THREE.Vector3(0,1,0)
  );
  pushCandidate(
    new THREE.Vector3(anchorWorld.x,anchorWorld.y,box.max.z+margin),
    new THREE.Vector3(0,0,-1)
  );
  pushCandidate(
    new THREE.Vector3(anchorWorld.x,anchorWorld.y,box.min.z-margin),
    new THREE.Vector3(0,0,1)
  );
  pushCandidate(
    new THREE.Vector3(box.min.x-margin,anchorWorld.y,anchorWorld.z),
    new THREE.Vector3(1,0,0)
  );
  pushCandidate(
    new THREE.Vector3(box.max.x+margin,anchorWorld.y,anchorWorld.z),
    new THREE.Vector3(-1,0,0)
  );

  let bestHit=null;
  let bestDistance=Infinity;

  for(const candidate of candidates){
    ray.set(candidate.origin,candidate.direction);
    const hits=ray.intersectObjects(meshes,false);
    if(!hits.length) continue;

    for(const hit of hits.slice(0,6)){
      const d=hit.point.distanceTo(anchorWorld);

      let sidePenalty=0;
      if(side && bodyLocalBox){
        const bodyCenterX=(bodyLocalBox.min.x+bodyLocalBox.max.x)/2;
        const hitLocal=anatomyRoot.worldToLocal(hit.point.clone());

        if(side==="gauche" && hitLocal.x<bodyCenterX) sidePenalty=2.0;
        if(side==="droit" && hitLocal.x>bodyCenterX) sidePenalty=2.0;
      }

      const score=d+sidePenalty;
      if(score<bestDistance){
        bestDistance=score;
        bestHit=hit;
      }
    }
  }

  if(!bestHit) return anchorWorld.clone();

  const normal=new THREE.Vector3(0,0,1);

  if(bestHit.face){
    normal.copy(bestHit.face.normal).transformDirection(bestHit.object.matrixWorld);
  } else {
    normal.copy(bestHit.ray.direction).negate();
  }

  return bestHit.point.clone().addScaledVector(normal,0.004);
}


function projectRegionPointOnBody(anchorWorld, view, side){
  if(!anatomyMeshes.length) return anchorWorld.clone();

  const bodyBox=getWholeBodyBox();
  if(bodyBox.isEmpty()) return anchorWorld.clone();

  const size=new THREE.Vector3();
  bodyBox.getSize(size);
  const margin=Math.max(size.x,size.y,size.z)*0.18+0.08;

  const ray=new THREE.Raycaster();
  const candidates=[];

  const add=(origin,direction)=>candidates.push({
    origin,
    direction:direction.clone().normalize()
  });

  // Main ray based on the anatomical face.
  if(view==="front"){
    add(
      new THREE.Vector3(anchorWorld.x,anchorWorld.y,bodyBox.max.z+margin),
      new THREE.Vector3(0,0,-1)
    );
  } else if(view==="back"){
    add(
      new THREE.Vector3(anchorWorld.x,anchorWorld.y,bodyBox.min.z-margin),
      new THREE.Vector3(0,0,1)
    );
  } else if(view==="left"){
    add(
      new THREE.Vector3(bodyBox.min.x-margin,anchorWorld.y,anchorWorld.z),
      new THREE.Vector3(1,0,0)
    );
  } else if(view==="right"){
    add(
      new THREE.Vector3(bodyBox.max.x+margin,anchorWorld.y,anchorWorld.z),
      new THREE.Vector3(-1,0,0)
    );
  }

  // Side-aware fallback rays.
  const xBias = side==="gauche" ? bodyBox.max.x+margin : bodyBox.min.x-margin;
  const xDir  = side==="gauche" ? new THREE.Vector3(-1,0,0) : new THREE.Vector3(1,0,0);
  add(new THREE.Vector3(xBias,anchorWorld.y,anchorWorld.z),xDir);

  // General front/back fallbacks.
  add(
    new THREE.Vector3(anchorWorld.x,anchorWorld.y,bodyBox.max.z+margin),
    new THREE.Vector3(0,0,-1)
  );
  add(
    new THREE.Vector3(anchorWorld.x,anchorWorld.y,bodyBox.min.z-margin),
    new THREE.Vector3(0,0,1)
  );

  let bestHit=null;
  let bestScore=Infinity;

  for(const c of candidates){
    ray.set(c.origin,c.direction);
    const hits=ray.intersectObjects(anatomyMeshes,false);
    for(const hit of hits.slice(0,4)){
      const dy=Math.abs(hit.point.y-anchorWorld.y);
      const dx=Math.abs(hit.point.x-anchorWorld.x);
      const dz=Math.abs(hit.point.z-anchorWorld.z);

      let sidePenalty=0;
      if(side && bodyLocalBox){
        const bodyCenterX=(bodyLocalBox.min.x+bodyLocalBox.max.x)/2;
        const localHit=anatomyRoot.worldToLocal(hit.point.clone());
        if(side==="gauche" && localHit.x<bodyCenterX) sidePenalty=2.0;
        if(side==="droit" && localHit.x>bodyCenterX) sidePenalty=2.0;
      }

      const score=dy*2 + dx + dz*.35 + sidePenalty;
      if(score<bestScore){
        bestScore=score;
        bestHit=hit;
      }
    }
  }

  if(!bestHit){
    const nearest=nearestMeshesToWorldPoint(anchorWorld,6);
    let nearestHit=null;
    let nearestScore=Infinity;

    for(const mesh of nearest){
      const box=new THREE.Box3().setFromObject(mesh);
      const target=new THREE.Vector3();
      box.getCenter(target);

      const dir=target.clone().sub(anchorWorld);
      const dist=dir.length();
      if(dist<1e-4) continue;

      ray.set(anchorWorld.clone(),dir.normalize());
      const hits=ray.intersectObject(mesh,false);

      if(hits.length && hits[0].distance<=dist+0.5){
        const score=hits[0].point.distanceTo(anchorWorld);
        if(score<nearestScore){
          nearestScore=score;
          nearestHit=hits[0];
        }
      }
    }

    if(!nearestHit) return anchorWorld.clone();
    bestHit=nearestHit;
  }

  const normal=new THREE.Vector3();
  if(bestHit.face){
    normal.copy(bestHit.face.normal).transformDirection(bestHit.object.matrixWorld);
  } else {
    normal.copy(bestHit.ray.direction).negate();
  }

  return bestHit.point.clone().addScaledVector(normal,0.004);
}

function rebuildMarkers(){
  clearMarkers();
  anatomyRoot.updateMatrixWorld(true);
  markerRoot.updateMatrixWorld(true);

  triggerPoints.forEach((p,i)=>{
    let worldPos=regionWorldPoint(p);
    const matched=matchMuscle(p);

    const anchorPoint=regionWorldPoint(p);

    if(p.view==="left" || p.view==="right"){
      // Profile trigger points are projected against the complete body surface.
      // This is more robust than using a bilateral muscle mesh whose bounding box
      // may span both sides of the body.
      worldPos.copy(projectRegionPointOnBody(anchorPoint,p.view,p.side));
    } else if(matched.length){
      worldPos.copy(projectPointOnSurface(anchorPoint,matched,p.view,p.side));
    } else {
      // When the muscle name is not available in the GLB, never leave
      // the regional anchor floating in space: snap it to the visible body surface.
      worldPos.copy(projectRegionPointOnBody(anchorPoint,p.view,p.side));
    }

    // Box3 returns world coordinates. Convert them back into the local
    // coordinate system of the rotating anatomy root.
    const localPos=markerRoot.worldToLocal(worldPos.clone());

    const mesh=new THREE.Mesh(
      new THREE.SphereGeometry(.014,16,12),
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
  userPanOffset.set(0,0,0);
  const box=new THREE.Box3();
  meshes.forEach(m=>box.expandByObject(m));
  const sphere=new THREE.Sphere();
  box.getBoundingSphere(sphere);
  cameraTargetGoal.copy(sphere.center);
  cameraDistanceGoal=Math.max(.55,Math.min(2.25,sphere.radius*3.0));
  highlightMeshes(meshes);
}
function focusPoint(point){
  userPanOffset.set(0,0,0);
  if(!directHighlightMuscles.has(point.muscle)) resetHighlights();
  const meshes=resolvePointMeshes(point);
  if(meshes.length){
    focusOnMeshes(meshes);
  } else {
    resetHighlights();
    cameraTargetGoal.copy(regionWorldPoint(point));
    const r=anatomicalRegions[point.muscle];
    cameraDistanceGoal=regionalOnlyMuscles.has(point.muscle)
      ? 1.55
      : (r ? 1.35 : 1.6);
  }
}
function getWholeBodyBox(){
  const box=new THREE.Box3();
  if(modelRoot.children.length) box.setFromObject(modelRoot);
  else box.setFromObject(anatomyRoot);
  return box;
}

function opticalCenterWorldOffset(){
  const r=viewer.getBoundingClientRect();
  if(!r.width || window.innerWidth<=900) return 0;

  const toolbar=document.querySelector(".viewer-tools");
  if(!toolbar) return 0;

  const tr=toolbar.getBoundingClientRect();
  const occupied=Math.max(0,tr.right-r.left+26);

  // Desired visual centre = centre of the free area to the right of the toolbar.
  const freeWidth=Math.max(100,r.width-occupied);
  const desiredPx=occupied + freeWidth*0.47;
  const canvasCenterPx=r.width/2;
  const deltaPx=desiredPx-canvasCenterPx;

  // Convert screen pixels into world units at the current full-body depth.
  const distance=Math.max(cameraDistanceGoal||5,1);
  const verticalFov=THREE.MathUtils.degToRad(camera.fov);
  const worldHeight=2*distance*Math.tan(verticalFov/2);
  const worldWidth=worldHeight*camera.aspect;

  return (deltaPx/r.width)*worldWidth;
}

function wholeBodyFitDistance(){
  const box=getWholeBodyBox();
  if(box.isEmpty()) return 7.2;

  const size=new THREE.Vector3();
  box.getSize(size);

  const verticalFov=THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov=2*Math.atan(Math.tan(verticalFov/2)*Math.max(camera.aspect,.25));
  const dV=(size.y*.5)/Math.tan(verticalFov*.5);
  const dH=(size.x*.5)/Math.tan(horizontalFov*.5);

  return Math.max(dV,dH)*1.15 + size.z*.40;
}

function fitWholeBody(){
  pendingFocusMeshes=null;
  pendingFocusPoint=null;
  resetHighlights();

  const box=getWholeBodyBox();
  if(!box.isEmpty()){
    const center=new THREE.Vector3();
    box.getCenter(center);
    cameraTargetGoal.copy(center);
    cameraTargetGoal.x += opticalCenterWorldOffset();
    cameraTargetGoal.y += 0.08;
  } else {
    cameraTargetGoal.set(0,.15,0);
  }
  cameraDistanceGoal=wholeBodyFitDistance();
}

function focusBodyBand(name){
  const box=getWholeBodyBox();
  if(box.isEmpty()) return;

  const size=new THREE.Vector3();
  const center=new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const presets={
    whole:{y:.50,span:.95,distance:wholeBodyFitDistance()},
    upper:{y:.78,span:.34,distance:2.75},
    trunk:{y:.60,span:.34,distance:2.65},
    pelvis:{y:.42,span:.26,distance:2.35},
    legs:{y:.22,span:.38,distance:3.0},
    feet:{y:.045,span:.16,distance:1.85}
  };

  const p=presets[name] || presets.whole;

  pendingFocusMeshes=null;
  pendingFocusPoint=null;
  resetHighlights();

  cameraTargetGoal.set(
    center.x + opticalCenterWorldOffset(),
    box.min.y + size.y*p.y + (name==="whole" ? 0.08 : 0),
    center.z
  );
  userPanOffset.set(0,0,0);

  cameraDistanceGoal = name==="whole"
    ? wholeBodyFitDistance()
    : Math.max(p.distance, size.y*p.span*1.65);
}

function resetCamera(){
  userPanOffset.set(0,0,0);
  focusBodyBand("whole");
}

const viewAngles={front:0,back:Math.PI,left:-Math.PI/2,right:Math.PI/2};

function schedulePointFocus(point){
  if(!point) return;

  resetHighlights();

  const resolved=resolvePointMeshes(point);
  pendingFocusMeshes=resolved.length ? resolved : null;
  pendingFocusPoint=point;

  currentView=bestViewForPoint(point);
  targetRotY=viewAngles[currentView] ?? 0;
  targetRotX=-.04;

  // Start from a local region target immediately so the transition feels intentional.
  cameraTargetGoal.copy(regionWorldPoint(point));
  cameraDistanceGoal=regionalOnlyMuscles.has(point.muscle) ? 1.55 : 1.30;

  updatePointVisibility();
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
function updateFocusQuality(point){
  const el=document.querySelector("#focusQuality");
  if(!el || !point) return;

  const exact=directHighlightMuscles.has(point.muscle) && matchMuscle(point).length>0;

  el.textContent=exact
    ? "Muscle 3D identifié"
    : "Zone anatomique ciblée";

  el.classList.toggle("exact",exact);
  el.classList.toggle("regional",!exact);
}

function selectPoint(point,zoom=true){
  selected=point;
  filterMode="selected";
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
  updateFocusQuality(point);
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
  currentView="front";
  targetRotY=0;
  targetRotX=-.05;
  userPanOffset.set(0,0,0);
  resetCamera();
  updatePointVisibility();
});
document.querySelectorAll("[data-view]").forEach(btn=>btn.addEventListener("click",()=>{
  currentView=btn.dataset.view;
  targetRotY=viewAngles[currentView]??0;
  targetRotX=-.05;
  resetCamera();
  updatePointVisibility();
}));

document.querySelectorAll("[data-body-nav]").forEach(btn=>btn.addEventListener("click",()=>{
  focusBodyBand(btn.dataset.bodyNav);
}));


function pointVisibleForView(point){
  // Canonical views are intentionally strict.
  // Profile views only show points explicitly authored for that profile.
  if(currentView==="left"){
    return point.side==="gauche" && point.view==="left";
  }

  if(currentView==="right"){
    return point.side==="droit" && point.view==="right";
  }

  if(currentView==="front"){
    return point.view==="front" || point.view==="left" || point.view==="right";
  }

  if(currentView==="back"){
    return point.view==="back";
  }

  // Free rotation: let depth testing decide visibility.
  return true;
}


const occlusionRaycaster=new THREE.Raycaster();

function markerOccludedByBody(marker){
  if(!marker || !marker.visible || !anatomyMeshes.length) return false;

  const worldPos=marker.getWorldPosition(new THREE.Vector3());
  const dir=worldPos.clone().sub(camera.position);
  const markerDistance=dir.length();

  if(markerDistance<1e-4) return false;

  occlusionRaycaster.set(camera.position,dir.normalize());
  occlusionRaycaster.far=Math.max(0,markerDistance-0.008);

  const hits=occlusionRaycaster.intersectObjects(anatomyMeshes,false);
  return hits.length>0;
}

function refreshDynamicMarkerVisibility(){
  // In free rotation, hide points physically behind the body.
  // In selected-muscle mode, do the same regardless of the canonical view.
  if(currentView!=="free" && filterMode!=="selected") return;

  markerMeshes.forEach(mesh=>{
    const p=mesh.userData.point;
    const allowedByFilter=filterMode==="all" || (
      selected &&
      p.muscle===selected.muscle &&
      (!selected.side || p.side===selected.side)
    );

    if(!allowedByFilter){
      mesh.visible=false;
      return;
    }

    mesh.visible=true;
    mesh.visible=!markerOccludedByBody(mesh);
  });
}

function updatePointVisibility(){
  markerMeshes.forEach(mesh=>{
    const p=mesh.userData.point;

    if(filterMode==="selected" && selected){
      // Focus mode shows the selected muscle and prioritises the selected
      // anatomical side so the view remains unambiguous.
      const sameMuscle=p.muscle===selected.muscle;
      const sameSide=!selected.side || p.side===selected.side;
      mesh.visible=sameMuscle && sameSide;
      return;
    }

    mesh.visible=pointVisibleForView(p);
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
  b.addEventListener("click",()=>{
    resetHighlights();
    selectPoint(list[0],true);
    filterMode="selected";
    updatePointVisibility();
  });
  c.appendChild(b); muscleList.appendChild(c);
});
document.querySelector("#statPoints").textContent=String(triggerPoints.length);
document.querySelector("#statMuscles").textContent=String(muscles.length);

const raycaster=new THREE.Raycaster(); const pointer=new THREE.Vector2();
let dragging=false,lastX=0,lastY=0,downX=0,downY=0;
let dragMode="rotate";

function pointerToNDC(e){
  const rect=renderer.domElement.getBoundingClientRect();
  pointer.x=((e.clientX-rect.left)/rect.width)*2-1;
  pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
  return rect;
}

renderer.domElement.style.touchAction="none";
renderer.domElement.style.cursor="grab";

renderer.domElement.addEventListener("pointerdown",e=>{
  dragging=true;
  lastX=downX=e.clientX;
  lastY=downY=e.clientY;

  pointerToNDC(e);
  raycaster.setFromCamera(pointer,camera);

  // Clicking directly on the anatomical model means "grab and move it".
  // Clicking the empty background keeps the familiar rotation behaviour.
  const bodyHit=raycaster.intersectObjects(anatomyMeshes,false)[0];
  dragMode=bodyHit ? "pan" : "rotate";

  renderer.domElement.style.cursor=dragMode==="pan" ? "grabbing" : "grabbing";
  renderer.domElement.setPointerCapture(e.pointerId);
});

renderer.domElement.addEventListener("pointermove",e=>{
  if(!dragging)return;

  const dx=e.clientX-lastX;
  const dy=e.clientY-lastY;

  if(dragMode==="pan"){
    const scale=Math.max(.0015,cameraDistance*.00075);
    const right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);
    const up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);

    const delta=new THREE.Vector3()
      .addScaledVector(right,-dx*scale)
      .addScaledVector(up,dy*scale);

    userPanOffset.add(delta);

    // Limit panning so the body cannot disappear completely.
    userPanOffset.x=THREE.MathUtils.clamp(userPanOffset.x,-1.6,1.6);
    userPanOffset.y=THREE.MathUtils.clamp(userPanOffset.y,-1.8,1.8);

    cameraTargetGoal.add(delta);
  } else {
    currentView="free";
    targetRotY+=dx*.009;
    targetRotX+=dy*.005;
    updatePointVisibility();
    targetRotX=Math.max(-.45,Math.min(.45,targetRotX));
  }

  lastX=e.clientX;
  lastY=e.clientY;
});

renderer.domElement.addEventListener("pointerup",e=>{
  dragging=false;
  renderer.domElement.style.cursor="grab";
  targetRotY=Math.atan2(Math.sin(targetRotY),Math.cos(targetRotY));
  try{renderer.domElement.releasePointerCapture(e.pointerId);}catch{}
  if(Math.hypot(e.clientX-downX,e.clientY-downY)>5)return;
  pointerToNDC(e);
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
      if(bestD < 0.45) matchedPoint=best;
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
  cameraDistanceGoal=Math.max(.75,Math.min(10,cameraDistanceGoal+e.deltaY*.003));
},{passive:false});

function resize(){
  const r=viewer.getBoundingClientRect();
  renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);
  camera.aspect=Math.max(1,r.width)/Math.max(1,r.height);
  camera.updateProjectionMatrix();
  if(!selectedMuscleMeshes.length && !pendingFocusPoint){
    cameraDistanceGoal=wholeBodyFitDistance();
    if(userPanOffset.lengthSq()<1e-6){
      const box=getWholeBodyBox();
      if(!box.isEmpty()){
        const center=new THREE.Vector3();
        box.getCenter(center);
        center.x+=opticalCenterWorldOffset();
        center.y+=0.08;
        cameraTargetGoal.copy(center);
      }
    }
  }
}
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
  if((pendingFocusMeshes || pendingFocusPoint) && angularDistance(rotY,targetRotY)<.035 && Math.abs(rotX-targetRotX)<.035){
    const meshes=pendingFocusMeshes;
    const point=pendingFocusPoint;
    pendingFocusMeshes=null;
    pendingFocusPoint=null;

    if(meshes && meshes.length) focusOnMeshes(meshes);
    else if(point) focusPoint(point);
  }

  // When focused, keep the camera target attached to the selected muscle
  // while the user rotates the anatomy.
  if(selectedMuscleMeshes.length && cameraDistanceGoal<4){
    const box=new THREE.Box3();
    selectedMuscleMeshes.forEach(m=>box.expandByObject(m));
    const c=new THREE.Vector3();
    box.getCenter(c);
    c.add(userPanOffset);
    cameraTargetGoal.lerp(c,.35);
  }

  cameraTarget.lerp(cameraTargetGoal,.12);
  cameraDistance+=(cameraDistanceGoal-cameraDistance)*.12;
  camera.position.set(cameraTarget.x,cameraTarget.y,cameraTarget.z+cameraDistance);
  camera.lookAt(cameraTarget);

  refreshDynamicMarkerVisibility();

  markerMeshes.forEach((m,i)=>{
    const pulse=1+Math.sin(performance.now()/620+i)*.025;
    const profileScale=(currentView==="left" || currentView==="right") ? .78 : 1;
    const mp=m.userData.point;
    const selectionScale=(
      filterMode==="selected" &&
      selected &&
      mp.muscle===selected.muscle &&
      (!selected.side || mp.side===selected.side)
    ) ? 1.34 : 1;
    m.scale.setScalar(pulse*profileScale*selectionScale);
  });

  renderer.render(scene,camera);
}
animate();

if("serviceWorker" in navigator){
  window.addEventListener("load",async()=>{
    try{
      const regs=await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r=>r.unregister()));
      if("caches" in window){
        const keys=await caches.keys();
        await Promise.all(keys.filter(k=>k.startsWith("trigger3d-")).map(k=>caches.delete(k)));
      }
      console.info("Trigger3D development cache cleared");
    }catch(e){
      console.warn("Cache cleanup skipped",e);
    }
  });
}
