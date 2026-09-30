/**
 * Núcleo Rovik: escena three.js que se ensambla por fases.
 * Se usa en la web (tiempo real) y en scripts/render (imágenes estáticas),
 * así que no depende de React ni del DOM salvo el canvas.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type PartGroup = "core" | "ring" | "armor" | "hud" | "frame";

export interface CoreView {
  /** Desplazamiento del objeto en unidades de mundo (x, y). */
  offsetX: number;
  offsetY: number;
  /** Escala base del objeto. */
  scale: number;
  /** Giro base (radianes). */
  yaw: number;
  pitch: number;
  roll: number;
}

export interface CoreOptions {
  canvas: HTMLCanvasElement;
  pixelRatio?: number;
  preserveDrawingBuffer?: boolean;
  /** Grupos visibles (para imágenes aisladas de un módulo). */
  only?: PartGroup[];
  antialias?: boolean;
}

export interface CoreHandle {
  setAssembly(p: number): void;
  setPointer(x: number, y: number): void;
  setView(view: Partial<CoreView>): void;
  setCamera(distance: number, fov?: number): void;
  resize(width: number, height: number): void;
  /** Precompila los shaders sin bloquear el hilo principal cuando el navegador lo permite. */
  compile(): Promise<void>;
  render(timeSeconds: number): void;
  dispose(): void;
}

// Ventanas de ensamblaje por grupo sobre el progreso 0..1
const WINDOWS: Record<PartGroup, [number, number]> = {
  core: [0.02, 0.18],
  ring: [0.2, 0.38],
  armor: [0.4, 0.58],
  hud: [0.6, 0.78],
  frame: [0.8, 0.94],
};

interface Part {
  object: THREE.Object3D;
  group: PartGroup;
  homePos: THREE.Vector3;
  homeQuat: THREE.Quaternion;
  fromPos: THREE.Vector3;
  fromQuat: THREE.Quaternion;
  start: number;
  end: number;
  scaleIn?: boolean;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** PRNG determinista: las imágenes renderizadas salen idénticas en cada ejecución. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function glowTexture(inner: string, outer: string): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.18, inner);
  g.addColorStop(0.42, outer);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function streakTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 64;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const gx = ctx.createLinearGradient(0, 0, w, 0);
  gx.addColorStop(0, "rgba(0,0,0,0)");
  gx.addColorStop(0.5, "rgba(210,248,255,1)");
  gx.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "destination-in";
  const gy = ctx.createLinearGradient(0, 0, 0, h);
  gy.addColorStop(0, "rgba(0,0,0,0)");
  gy.addColorStop(0.5, "rgba(0,0,0,1)");
  gy.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gy;
  ctx.fillRect(0, 0, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function annularSector(r0: number, r1: number, a0: number, a1: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(Math.cos(a0) * r1, Math.sin(a0) * r1);
  s.absarc(0, 0, r1, a0, a1, false);
  s.lineTo(Math.cos(a1) * r0, Math.sin(a1) * r0);
  s.absarc(0, 0, r0, a1, a0, true);
  s.closePath();
  return s;
}

/** Anillo torneado: perfil (radio, z) girado alrededor del eje Z. */
function latheRing(profile: [number, number][], segments = 128): THREE.BufferGeometry {
  const pts = profile.map(([r, z]) => new THREE.Vector2(r, z));
  const g = new THREE.LatheGeometry(pts, segments);
  g.rotateX(Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

function dashedCircle(radius: number, dashes: number, fill: number, segmentsPerDash = 6): THREE.BufferGeometry {
  const positions: number[] = [];
  for (let i = 0; i < dashes; i++) {
    const a0 = (i / dashes) * Math.PI * 2;
    const a1 = a0 + ((Math.PI * 2) / dashes) * fill;
    for (let k = 0; k < segmentsPerDash; k++) {
      const t0 = a0 + ((a1 - a0) * k) / segmentsPerDash;
      const t1 = a0 + ((a1 - a0) * (k + 1)) / segmentsPerDash;
      positions.push(Math.cos(t0) * radius, Math.sin(t0) * radius, 0, Math.cos(t1) * radius, Math.sin(t1) * radius, 0);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return g;
}

function ticks(radius: number, count: number, len: number, majorEvery: number): THREE.BufferGeometry {
  const positions: number[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const l = i % majorEvery === 0 ? len * 2.2 : len;
    positions.push(Math.cos(a) * radius, Math.sin(a) * radius, 0, Math.cos(a) * (radius + l), Math.sin(a) * (radius + l), 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return g;
}

export function createCore(opts: CoreOptions): CoreHandle {
  const { canvas } = opts;
  const rand = mulberry32(7);
  const only = opts.only ? new Set(opts.only) : null;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: opts.antialias ?? true,
    alpha: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: opts.preserveDrawingBuffer ?? false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(opts.pixelRatio ?? 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  let camDistance = 8.2;
  camera.position.set(0, 0, camDistance);

  // Luces
  const key = new THREE.DirectionalLight(0xffe6c4, 3.2);
  key.position.set(-3, 4, 5);
  const rim = new THREE.DirectionalLight(0xff2a2a, 2.6);
  rim.position.set(4, -2.5, -3);
  const fill = new THREE.DirectionalLight(0x6fe3ff, 0.9);
  fill.position.set(3, 2, 4);
  scene.add(key, rim, fill, new THREE.AmbientLight(0x20242c, 0.6));

  // Raíz: pivot (vista) > rig (giro) > piezas
  const pivot = new THREE.Group();
  const rig = new THREE.Group();
  pivot.add(rig);
  scene.add(pivot);

  const parts: Part[] = [];
  const disposables: { dispose(): void }[] = [envTex, pmrem];
  const track = <T extends { dispose(): void }>(d: T) => {
    disposables.push(d);
    return d;
  };

  const addPart = (
    object: THREE.Object3D,
    group: PartGroup,
    index: number,
    count: number,
    explode: { dist: number; z?: number; zJitter?: number; spin?: number; scaleIn?: boolean }
  ) => {
    if (only && !only.has(group)) return;
    rig.add(object);
    const [w0, w1] = WINDOWS[group];
    const span = w1 - w0;
    const stagger = count > 1 ? (index / (count - 1)) * span * 0.45 : 0;
    const start = w0 + stagger;
    const end = start + span * (count > 1 ? 0.55 : 1);
    const homePos = object.position.clone();
    const homeQuat = object.quaternion.clone();
    const dir = homePos.lengthSq() > 1e-4 ? homePos.clone().setZ(0).normalize() : new THREE.Vector3();
    const fromPos = homePos
      .clone()
      .addScaledVector(dir, explode.dist * (0.8 + rand() * 0.4))
      .add(new THREE.Vector3(0, 0, (explode.z ?? 0) + (rand() - 0.5) * 2 * (explode.zJitter ?? 0)));
    const spin = explode.spin ?? 1.2;
    const fromQuat = homeQuat
      .clone()
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler((rand() - 0.5) * spin, (rand() - 0.5) * spin, (rand() - 0.5) * spin * 1.6)));
    parts.push({ object, group, homePos, homeQuat, fromPos, fromQuat, start, end, scaleIn: explode.scaleIn });
  };

  // ---------- Materiales ----------
  const gold = track(new THREE.MeshStandardMaterial({ color: 0xa8742a, metalness: 1, roughness: 0.3 }));
  const goldDark = track(new THREE.MeshStandardMaterial({ color: 0x6e4a1a, metalness: 1, roughness: 0.4 }));
  const red = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x7a0711,
      metalness: 0.45,
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
    })
  );
  const gunmetal = track(new THREE.MeshStandardMaterial({ color: 0x23272e, metalness: 0.9, roughness: 0.42 }));
  const steel = track(new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: 1, roughness: 0.22 }));
  const coreWhite = track(new THREE.MeshBasicMaterial({ color: 0xe6fbff, toneMapped: false }));
  const coreCyan = track(new THREE.MeshBasicMaterial({ color: 0x8ff0ff, toneMapped: false }));
  const CORE_ON = new THREE.Color(0xe6fbff);
  const CORE_OFF = new THREE.Color(0x1c2328);
  const CYAN_ON = new THREE.Color(0x8ff0ff);
  const CYAN_OFF = new THREE.Color(0x24343a);
  const underGlow = track(
    new THREE.MeshBasicMaterial({ color: 0xff3524, transparent: true, opacity: 0.5, toneMapped: false, depthWrite: false, side: THREE.DoubleSide })
  );
  const holo = (opacity: number) =>
    track(new THREE.LineBasicMaterial({ color: 0x7fe7ff, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));

  // ---------- 1. Núcleo (Validar) ----------
  const coreGroup = new THREE.Group();
  const coreDisc = new THREE.Mesh(track(new THREE.CylinderGeometry(0.44, 0.44, 0.06, 64).rotateX(Math.PI / 2)), coreWhite);
  const coreTorus = new THREE.Mesh(track(new THREE.TorusGeometry(0.5, 0.03, 16, 128)), coreCyan);
  const hexNut = new THREE.Mesh(track(new THREE.CylinderGeometry(0.19, 0.19, 0.16, 6).rotateX(Math.PI / 2)), gunmetal);
  hexNut.position.z = 0.07;
  const hexCap = new THREE.Mesh(track(new THREE.CylinderGeometry(0.085, 0.085, 0.2, 32).rotateX(Math.PI / 2)), steel);
  hexCap.position.z = 0.08;
  // Iris: 12 láminas finas alrededor del hexágono
  const bladeGeo = track(new THREE.BoxGeometry(0.03, 0.12, 0.05));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const b = new THREE.Mesh(bladeGeo, gunmetal);
    b.position.set(Math.cos(a) * 0.34, Math.sin(a) * 0.34, 0.05);
    b.rotation.z = a;
    coreGroup.add(b);
  }
  coreGroup.add(coreDisc, coreTorus, hexNut, hexCap);
  const coreGlow = new THREE.Sprite(
    track(new THREE.SpriteMaterial({ map: track(glowTexture("rgba(220,250,255,1)", "rgba(60,200,255,0.35)")), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }))
  );
  coreGlow.scale.set(2, 2, 1);
  coreGlow.position.z = 0.2;
  const streak = new THREE.Sprite(
    track(new THREE.SpriteMaterial({ map: track(streakTexture()), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55, toneMapped: false }))
  );
  streak.scale.set(5.5, 0.22, 1);
  streak.position.z = 0.25;
  coreGroup.add(coreGlow, streak);
  const coreLight = new THREE.PointLight(0x9cefff, 2, 2.2, 2);
  coreLight.position.z = 0.45;
  coreGroup.add(coreLight);
  addPart(coreGroup, "core", 0, 1, { dist: 0, z: 2.0, spin: 0.25 });

  // ---------- 2. Anillo dorado (Vender) ----------
  const ringProfile: [number, number][] = [
    [0.56, -0.07],
    [0.56, 0.07],
    [0.6, 0.11],
    [0.7, 0.11],
    [0.72, 0.07],
    [0.84, 0.07],
    [0.87, 0.03],
    [0.87, -0.07],
    [0.56, -0.07],
  ];
  const goldRing = new THREE.Mesh(track(latheRing(ringProfile)), gold);
  const groove = new THREE.Mesh(track(new THREE.TorusGeometry(0.78, 0.009, 8, 128)), gunmetal);
  groove.position.z = 0.072;
  goldRing.add(groove);
  const ringBoltGeo = track(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 12).rotateX(Math.PI / 2));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const bolt = new THREE.Mesh(ringBoltGeo, steel);
    bolt.position.set(Math.cos(a) * 0.65, Math.sin(a) * 0.65, 0.115);
    goldRing.add(bolt);
  }
  addPart(goldRing, "ring", 0, 2, { dist: 0, z: 1.3, spin: 0.5 });
  const toothGeo = track(new THREE.BoxGeometry(0.045, 0.1, 0.1));
  const teeth = new THREE.Group();
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const t = new THREE.Mesh(toothGeo, i % 3 === 0 ? gold : goldDark);
    t.position.set(Math.cos(a) * 0.91, Math.sin(a) * 0.91, 0);
    t.rotation.z = a;
    teeth.add(t);
  }
  addPart(teeth, "ring", 1, 2, { dist: 0, z: 0.95, spin: 0.7 });

  // ---------- 3. Blindaje rojo (Repetir) ----------
  const plateCount = 10;
  const gap = THREE.MathUtils.degToRad(3.2);
  const under = new THREE.Mesh(track(new THREE.RingGeometry(0.95, 1.38, 96)), underGlow);
  under.position.z = -0.06;
  addPart(under, "armor", 0, plateCount + 1, { dist: 0, z: 0, spin: 0, scaleIn: true });
  const inlayMat = gold;
  for (let i = 0; i < plateCount; i++) {
    const a0 = (i / plateCount) * Math.PI * 2 + gap / 2 + Math.PI / 2;
    const a1 = ((i + 1) / plateCount) * Math.PI * 2 - gap / 2 + Math.PI / 2;
    const shape = annularSector(0.96, 1.4, a0, a1);
    const geo = track(
      new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.02, bevelSegments: 3, curveSegments: 20 })
    );
    geo.translate(0, 0, -0.04);
    // centrar la geometría en su centro angular para que la explosión salga radial
    const mid = (a0 + a1) / 2;
    const cx = Math.cos(mid) * 1.18;
    const cy = Math.sin(mid) * 1.18;
    geo.translate(-cx, -cy, 0);
    const plate = new THREE.Group();
    const mesh = new THREE.Mesh(geo, red);
    plate.add(mesh);
    if (i % 2 === 0) {
      const inlay = new THREE.Mesh(
        track(new THREE.ExtrudeGeometry(annularSector(1.3, 1.325, a0 + 0.05, a1 - 0.05), { depth: 0.02, bevelEnabled: false, curveSegments: 16 }).translate(-cx, -cy, 0.115)),
        inlayMat
      );
      plate.add(inlay);
    }
    plate.position.set(cx, cy, 0);
    addPart(plate, "armor", i + 1, plateCount + 1, { dist: 0.55, z: 0.25, zJitter: 0.3, spin: 0.7 });
  }

  // ---------- 4. Anillos holográficos (Automatizar) ----------
  const hudGroup = new THREE.Group();
  const hudRings: { obj: THREE.Object3D; speed: number }[] = [];
  const ringA = new THREE.LineSegments(track(dashedCircle(1.72, 48, 0.62)), holo(0.75));
  const ringB = new THREE.LineSegments(track(ticks(1.86, 120, 0.04, 10)), holo(0.6));
  const ringC = new THREE.LineSegments(track(dashedCircle(2.12, 6, 0.12, 24)), holo(0.9));
  const ringD = new THREE.LineSegments(track(dashedCircle(2.3, 180, 0.3, 1)), holo(0.35));
  ringC.rotation.x = 0.0;
  hudGroup.add(ringA, ringB, ringC, ringD);
  hudRings.push({ obj: ringA, speed: 0.12 }, { obj: ringB, speed: -0.05 }, { obj: ringC, speed: 0.22 }, { obj: ringD, speed: -0.02 });
  // Órbitas inclinadas
  const orbit1 = new THREE.LineLoop(track(new THREE.BufferGeometry().setFromPoints(new THREE.Path().absarc(0, 0, 2.0, 0, Math.PI * 2, false).getSpacedPoints(160))), holo(0.28));
  orbit1.rotation.set(1.18, 0.25, 0);
  const orbit2 = orbit1.clone();
  orbit2.material = holo(0.22);
  orbit2.rotation.set(1.05, -0.6, 0.4);
  hudGroup.add(orbit1, orbit2);
  // Partículas de datos
  const pCount = 420;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const a = rand() * Math.PI * 2;
    const r = 1.55 + Math.pow(rand(), 1.6) * 0.95;
    pPos[i * 3] = Math.cos(a) * r;
    pPos[i * 3 + 1] = Math.sin(a) * r;
    pPos[i * 3 + 2] = (rand() - 0.5) * 0.35;
  }
  const pGeo = track(new THREE.BufferGeometry());
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const pMat = track(
    new THREE.PointsMaterial({ color: 0x9ff3ff, size: 0.022, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
  );
  const particles = new THREE.Points(pGeo, pMat);
  hudGroup.add(particles);
  addPart(hudGroup, "hud", 0, 1, { dist: 0, z: 0, spin: 0.4, scaleIn: true });
  const hudMaterials = [ringA, ringB, ringC, ringD, orbit1, orbit2].map((o) => (o as THREE.Line).material as THREE.LineBasicMaterial);
  const hudBaseOpacity = hudMaterials.map((m) => m.opacity);

  // ---------- 5. Chasis exterior (Escalar) ----------
  const frameProfile: [number, number][] = [
    [1.43, -0.12],
    [1.43, 0.1],
    [1.47, 0.15],
    [1.56, 0.15],
    [1.6, 0.1],
    [1.6, -0.12],
    [1.43, -0.12],
  ];
  const frameRing = new THREE.Mesh(track(latheRing(frameProfile)), gunmetal);
  addPart(frameRing, "frame", 0, 6, { dist: 0, z: -1.1, spin: 0.4 });
  const backPlate = new THREE.Mesh(track(new THREE.CircleGeometry(1.45, 96)), gunmetal);
  backPlate.position.z = -0.12;
  addPart(backPlate, "frame", 1, 6, { dist: 0, z: -1.7, spin: 0.3 });
  const bracketShape = new THREE.Shape();
  bracketShape.moveTo(-0.08, -0.2);
  bracketShape.lineTo(0.08, -0.2);
  bracketShape.lineTo(0.12, 0.2);
  bracketShape.lineTo(-0.12, 0.2);
  bracketShape.closePath();
  const bracketGeo = track(
    new THREE.ExtrudeGeometry(bracketShape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 2 }).translate(0, 0, -0.1)
  );
  const boltGeo = track(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 12).rotateX(Math.PI / 2));
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i / 4) * Math.PI * 2;
    const br = new THREE.Group();
    const body = new THREE.Mesh(bracketGeo, gold);
    br.add(body);
    for (const dy of [-0.13, 0.13]) {
      const bolt = new THREE.Mesh(boltGeo, steel);
      bolt.position.set(0, dy, 0.14);
      br.add(bolt);
    }
    br.position.set(Math.cos(a) * 1.58, Math.sin(a) * 1.58, 0.02);
    br.rotation.z = a - Math.PI / 2;
    addPart(br, "frame", 2 + i, 6, { dist: 0.6, z: -0.8, zJitter: 0.2, spin: 0.9 });
  }
  // Onda expansiva al completar
  const shock = new THREE.Mesh(
    track(new THREE.RingGeometry(0.98, 1, 128)),
    track(new THREE.MeshBasicMaterial({ color: 0x9ff3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }))
  );
  if (!only || only.has("frame")) rig.add(shock);

  // ---------- Estado ----------
  let assembly = 1;
  const pointer = new THREE.Vector2();
  const pointerSmooth = new THREE.Vector2();
  const view: CoreView = { offsetX: 0, offsetY: 0, scale: 1, yaw: -0.35, pitch: 0.18, roll: 0 };
  const tmpQuat = new THREE.Quaternion();

  function apply(t: number) {
    for (const p of parts) {
      const k = easeOutCubic(clamp01((assembly - p.start) / (p.end - p.start)));
      p.object.position.lerpVectors(p.fromPos, p.homePos, k);
      tmpQuat.copy(p.fromQuat).slerp(p.homeQuat, k);
      p.object.quaternion.copy(tmpQuat);
      if (p.scaleIn) {
        const s = Math.max(0.0001, k);
        p.object.scale.setScalar(s);
      }
      p.object.visible = k > 0.001 || !p.scaleIn;
    }

    const coreK = clamp01((assembly - WINDOWS.core[0]) / (WINDOWS.core[1] - WINDOWS.core[0]));
    coreWhite.color.lerpColors(CORE_OFF, CORE_ON, easeOutCubic(coreK));
    coreCyan.color.lerpColors(CYAN_OFF, CYAN_ON, easeOutCubic(coreK));
    const finale = easeInOut(clamp01((assembly - 0.94) / 0.06));
    const pulse = 0.9 + Math.sin(t * 2.2) * 0.06 + Math.sin(t * 7.3) * 0.02;
    const power = coreK * (0.55 + 0.45 * clamp01(assembly / 0.94)) * pulse + finale * 0.25;
    (coreGlow.material as THREE.SpriteMaterial).opacity = 0.7 * power;
    coreGlow.scale.setScalar(1.45 + power * 0.75);
    (streak.material as THREE.SpriteMaterial).opacity = (0.12 + 0.3 * power) * coreK;
    coreLight.intensity = 2 * power;
    underGlow.opacity = 0.18 + 0.4 * power;

    const hudK = clamp01((assembly - WINDOWS.hud[0]) / (WINDOWS.hud[1] - WINDOWS.hud[0]));
    hudMaterials.forEach((m, i) => (m.opacity = hudBaseOpacity[i] * easeOutCubic(hudK)));
    pMat.opacity = 0.85 * easeOutCubic(hudK);
    for (const r of hudRings) r.obj.rotation.z = t * r.speed;
    particles.rotation.z = -t * 0.04;

    const sm = shock.material as THREE.MeshBasicMaterial;
    if (finale > 0 && finale < 1) {
      shock.scale.setScalar(1.4 + finale * 2.2);
      sm.opacity = (1 - finale) * 0.7;
    } else {
      sm.opacity = 0;
    }
  }

  function updateCamera() {
    camera.position.set(0, 0, camDistance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  const handle: CoreHandle = {
    setAssembly(p) {
      assembly = clamp01(p);
    },
    setPointer(x, y) {
      pointer.set(x, y);
    },
    setView(v) {
      Object.assign(view, v);
    },
    setCamera(distance, fov) {
      camDistance = distance;
      if (fov) camera.fov = fov;
      updateCamera();
    },
    resize(width, height) {
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      updateCamera();
    },
    async compile() {
      if (!renderer.extensions.has("KHR_parallel_shader_compile")) return;
      try {
        await renderer.compileAsync(scene, camera);
      } catch {
        // Sin soporte: se compilará en el primer fotograma
      }
    },
    render(t) {
      pointerSmooth.lerp(pointer, 0.06);
      pivot.position.set(view.offsetX, view.offsetY, 0);
      pivot.scale.setScalar(view.scale);
      rig.rotation.set(view.pitch - pointerSmooth.y * 0.22, view.yaw + pointerSmooth.x * 0.35, view.roll);
      apply(t);
      renderer.render(scene, camera);
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
  updateCamera();
  return handle;
}
