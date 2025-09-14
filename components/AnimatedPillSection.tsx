"use client";

import React, { Suspense, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Environment } from "@react-three/drei";

/** ===================== Tunables ===================== **/
const PILL_COUNT = 26;                // pool size (max on screen)
const GRAVITY = -0.20;                // slower fall
const DRAG = 0.997;                   // smoother
const WIND_BASE = new THREE.Vector3(-0.015, 0, 0.008);
const WIND_VARIATION = 0.010;
const FLOOR_Y = -3.2;

const EMIT_SPEED = 0.14;              // slower initial push
const EMIT_SPREAD = 0.035;            // tighter mouth jitter
const EMIT_INTERVAL = 0.32;           // seconds between spawns (steady)

const SEPARATION_RADIUS = 0.18;       // anti-clump radius
const SEPARATION_FORCE = 0.75;        // anti-clump strength
const MAX_SEP_ACCEL = 0.8;            // clamp accel
const TUMBLE = 0.10;                  // subtle spin

// Look
const BOTTLE_AMBER = "#8c3b00";
const BOTTLE_LIP = "#d9c7a6";
const PILL_COLOR = "#FFC98A";         // light orange

/** ============== tiny deterministic PRNG (no deps) ============== **/
function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** ================= Bottle (tilted) ================= **/
function Bottle({ mouthRef }: { mouthRef: React.RefObject<THREE.Group> }) {
  const h = 1.6;
  const group = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!group.current) return;
    group.current.rotation.z = -0.55 + Math.sin(t * 0.35) * 0.010; // lean left
    group.current.rotation.x =  1.18 + Math.sin(t * 0.27) * 0.008; // tip forward
  });

  return (
    <group
      ref={group}
      position={[-0.60, 1.55, 0]}          // your placement
      rotation={[1.18, -0.35, -0.55]}      // mouth aims down-left
    >
      {/* amber glass body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.48, h, 48, 1, true]} />
        <meshPhysicalMaterial
          color={BOTTLE_AMBER}
          roughness={0.22}
          transmission={0.75}
          transparent
          opacity={0.95}
          thickness={0.5}
        />
      </mesh>

      {/* bottom cap */}
      <mesh position={[0, -h/2 + 0.06, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.12, 48]} />
        <meshPhysicalMaterial
          color={BOTTLE_AMBER}
          roughness={0.22}
          transmission={0.75}
          transparent
          opacity={0.95}
          thickness={0.5}
        />
      </mesh>

      {/* neck lip */}
      <mesh position={[0, h/2 - 0.05, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.1, 36]} />
        <meshStandardMaterial color={BOTTLE_LIP} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* emitter just outside the mouth */}
      <group ref={mouthRef} position={[0, h/2 + 0.02, 0]} />
    </group>
  );
}

/** ================= Pills (flat round disks) ================= **/
function Pills({ mouthRef }: { mouthRef: React.RefObject<THREE.Group> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const rng = useMemo(() => mulberry32(xmur3("round-pills")()), []);

  // State
  const positions = useMemo(() => Array.from({ length: PILL_COUNT }, () => new THREE.Vector3()), []);
  const velocities = useMemo(() => Array.from({ length: PILL_COUNT }, () => new THREE.Vector3()), []);
  const spins = useMemo(
    () => Array.from({ length: PILL_COUNT }, () => new THREE.Vector3(
      (rng()-0.5)*TUMBLE, (rng()-0.5)*TUMBLE, (rng()-0.5)*TUMBLE
    )),
  [rng]);
  const scales = useMemo(() => Array.from({ length: PILL_COUNT }, () => 0.9 + rng()*0.2), [rng]);
  const rotEuler = useMemo(
    () => Array.from({ length: PILL_COUNT }, () => new THREE.Euler(rng()*Math.PI, rng()*Math.PI, rng()*Math.PI)),
  [rng]);

  // activity / emission timing
  const alive = useMemo(() => new Array<boolean>(PILL_COUNT).fill(false), []);
  const ages = useMemo(() => new Float32Array(PILL_COUNT).fill(0), []);
  const emitAccRef = useRef(0);
  const nextIdxRef = useRef(0);

  // limit drawn instances to active ones to avoid identity-dot at center
  useEffect(() => {
    if (meshRef.current) meshRef.current.count = 0;
  }, []);

  // target pour direction (down-left)
  const POUR_DIR = new THREE.Vector3(-0.55, -1.0, 0).normalize();

  // helper: get mouth world origin/dir
  function mouthWorld(outOrigin: THREE.Vector3, outDir: THREE.Vector3) {
    const mouth = mouthRef.current;
    if (!mouth) return;
    mouth.getWorldPosition(outOrigin);
    const q = mouth.getWorldQuaternion(new THREE.Quaternion());
    outDir.set(0, 1, 0).applyQuaternion(q).normalize(); // bottle +Y
  }

  function spawn(i: number) {
    const origin = new THREE.Vector3();
    const mouthDir = new THREE.Vector3();
    mouthWorld(origin, mouthDir);

    // spawn slightly outside the lip so we never start inside the bottle
    const RIM_OFFSET = 0.05;
    const p = positions[i];
    p.copy(origin).addScaledVector(mouthDir, RIM_OFFSET);
    p.x += (rng() - 0.5) * EMIT_SPREAD;
    p.y += (rng() - 0.5) * EMIT_SPREAD * 0.35;
    p.z += (rng() - 0.5) * EMIT_SPREAD * 0.35;

    // direction: mostly along mouth, blended with a fixed down-left bias
    const dir = mouthDir.clone().multiplyScalar(0.7).addScaledVector(POUR_DIR, 0.3).normalize();
    velocities[i].copy(dir).multiplyScalar(EMIT_SPEED + rng() * 0.04);

    // reset rotation + age
    rotEuler[i].set(rng()*Math.PI, rng()*Math.PI, rng()*Math.PI);
    ages[i] = 0;
    alive[i] = true;
  }

  // start empty; emitter will fill steadily
  useEffect(() => {
    alive.fill(false);
    ages.fill(0);
  }, [alive, ages]);

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    const wind = new THREE.Vector3(
      WIND_BASE.x + Math.sin(t * 0.5) * WIND_VARIATION,
      0,
      WIND_BASE.z + Math.cos(t * 0.45) * WIND_VARIATION
    );

    // --- steady emission ---
    emitAccRef.current += dt;
    while (emitAccRef.current >= EMIT_INTERVAL) {
      emitAccRef.current -= EMIT_INTERVAL;
      // find next inactive index in a ring
      let tries = 0;
      while (tries < PILL_COUNT) {
        const i = nextIdxRef.current;
        nextIdxRef.current = (nextIdxRef.current + 1) % PILL_COUNT;
        if (!alive[i]) { spawn(i); break; }
        tries++;
      }
    }

    // mouth plane to prevent re-entering bottle
    const mouthOrigin = new THREE.Vector3();
    const mouthNormal = new THREE.Vector3();
    mouthWorld(mouthOrigin, mouthNormal);

    // --- pairwise separation (only active) ---
    for (let i = 0; i < PILL_COUNT; i++) {
      if (!alive[i]) continue;
      let ax = 0, ay = 0, az = 0;
      const pi = positions[i];
      for (let j = 0; j < PILL_COUNT; j++) {
        if (i === j || !alive[j]) continue;
        const pj = positions[j];
        const dx = pi.x - pj.x, dy = pi.y - pj.y, dz = pi.z - pj.z;
        const d2 = dx*dx + dy*dy + dz*dz;
        if (d2 > SEPARATION_RADIUS * SEPARATION_RADIUS || d2 === 0) continue;
        const inv = 1 / Math.sqrt(d2);
        ax += dx * inv; ay += dy * inv; az += dz * inv;
      }
      const len = Math.sqrt(ax*ax + ay*ay + az*az) || 1;
      if (len > 0) {
        ax = (ax / len) * Math.min(len, MAX_SEP_ACCEL);
        ay = (ay / len) * Math.min(len, MAX_SEP_ACCEL);
        az = (az / len) * Math.min(len, MAX_SEP_ACCEL);
        velocities[i].x += ax * SEPARATION_FORCE * dt;
        velocities[i].y += ay * SEPARATION_FORCE * dt;
        velocities[i].z += az * SEPARATION_FORCE * dt;
      }
    }

    // --- integrate, constraint, pack & render ---
    let renderSlot = 0; // pack live instances into 0..renderSlot-1
    for (let i = 0; i < PILL_COUNT; i++) {
      if (!alive[i]) continue;

      const v = velocities[i];
      const p = positions[i];

      // forces
      v.x += wind.x * dt; v.z += wind.z * dt; v.y += GRAVITY * dt;
      v.multiplyScalar(Math.pow(DRAG, Math.max(1, dt * 60)));

      // integrate
      p.addScaledVector(v, dt);

      // mouth plane constraint (push out if pill drifts behind lip)
      const toP = new THREE.Vector3().subVectors(p, mouthOrigin);
      if (toP.dot(mouthNormal) < 0.0) {
        const d = toP.dot(mouthNormal); // negative
        const margin = 0.015;
        p.addScaledVector(mouthNormal, -d + margin);
        const vn = mouthNormal.clone().multiplyScalar(v.dot(mouthNormal));
        const vt = v.clone().sub(vn);
        v.copy(vt).addScaledVector(vn, -0.2);
      }

      // gentle spin
      rotEuler[i].x += spins[i].x * dt;
      rotEuler[i].y += spins[i].y * dt;
      rotEuler[i].z += spins[i].z * dt;

      // deactivate when off-screen
      if (p.y < FLOOR_Y) { alive[i] = false; continue; }

      // write matrix into the packed render slot
      dummy.position.copy(p);
      dummy.rotation.set(rotEuler[i].x, rotEuler[i].y, rotEuler[i].z);
      const s = scales[i];
      dummy.scale.set(s * 0.9, s * 0.2, s * 0.9); // flat round pill
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(renderSlot, dummy.matrix);
      renderSlot++;
    }
    meshRef.current.count = renderSlot;                 // draw only the packed, active instances
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PILL_COUNT]} castShadow receiveShadow>
      <cylinderGeometry args={[0.16, 0.16, 0.10, 32]} />
      <meshStandardMaterial color={PILL_COLOR} roughness={0.7} metalness={0.02} />
    </instancedMesh>
  );
}

/** ================= Scene ================= **/
function Scene() {
  const mouthRef = useRef<THREE.Group>(null);
  return (
    <>
      {/* Transparent canvas; page shows your grey gradient */}
      <PerspectiveCamera makeDefault position={[0, 0.9, 6.0]} fov={45} />
      <ambientLight intensity={0.95} />
      <directionalLight position={[2.5, 4, 1.5]} intensity={1.15} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <Environment preset="studio" />
      <Bottle mouthRef={mouthRef} />
      <Pills mouthRef={mouthRef} />
      <mesh position={[0, FLOOR_Y - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial transparent opacity={0.10} />
      </mesh>
    </>
  );
}

/** ================= No-SSR Canvas Wrapper ================= **/
const R3FCanvas = dynamic(
  () =>
    Promise.resolve(({ children }: { children: React.ReactNode }) => (
      <Canvas gl={{ antialias: true, alpha: true }} shadows>
        {children}
      </Canvas>
    )),
  { ssr: false }
);

/** ================= Exported Section ================= **/
export default function AnimatedPillsSection() {
  return (
<div className="relative group">
  {/* outer glow */}
  <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br
                  from-amber-400/25 via-orange-500/25 to-pink-500/25
                  blur-xl opacity-40 group-hover:opacity-60 transition" />
  {/* gradient border */}
  <div className="relative p-[1px] rounded-3xl bg-gradient-to-br
                  from-amber-400 to-orange-500">
    {/* surface */}
    <div className="relative h-[60vh] min-h-[400px] rounded-[calc(theme(borderRadius.3xl)-1px)]
                    bg-neutral-900/80 backdrop-blur-md border border-white/10
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_30px_rgba(0,0,0,0.35)]
                    overflow-hidden">
      <Suspense fallback={null}>
            <R3FCanvas>
              <Scene />
            </R3FCanvas>
          </Suspense>
      <div className="pointer-events-none absolute inset-0
                      bg-[radial-gradient(80%_120%_at_100%_0%,rgba(255,255,255,0.16),transparent_60%)]" />
    </div>
  </div>
</div>

  );
}
