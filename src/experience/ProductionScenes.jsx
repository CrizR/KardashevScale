import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Line, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { REALISM_TEXTURES } from '../components/LifeScale/realismTextures';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const dummy = new THREE.Object3D();
const color = new THREE.Color();

function seeded(index) {
  const value = Math.sin(index * 913.73 + 31.17) * 43758.5453123;
  return value - Math.floor(value);
}

function spherePoint(index, count, radius = 1) {
  const y = 1 - (index / Math.max(1, count - 1)) * 2;
  const ring = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = GOLDEN_ANGLE * index;
  return new THREE.Vector3(Math.cos(theta) * ring, y, Math.sin(theta) * ring).multiplyScalar(radius);
}

function PointCloud({ positions, colors, size = 0.04, opacity = 0.7 }) {
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        {colors && <bufferAttribute attach="attributes-color" args={[colors, 3]} />}
      </bufferGeometry>
      <pointsMaterial size={size} vertexColors={Boolean(colors)} color={colors ? undefined : '#dbe7ff'} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  );
}

function Starfield({ count = 5000, radius = 120, opacity = 0.55 }) {
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const point = spherePoint(i, count, radius * (0.65 + seeded(i + 90) * 0.35));
      values.set([point.x, point.y, point.z], i * 3);
    }
    return values;
  }, [count, radius]);
  return <PointCloud positions={positions} size={0.07} opacity={opacity} />;
}

function InstancedObjects({ items, geometry, material, onFrame }) {
  const ref = useRef();
  useLayoutEffect(() => {
    if (!ref.current) return;
    items.forEach((item, index) => {
      dummy.position.fromArray(item.position || [0, 0, 0]);
      dummy.rotation.set(...(item.rotation || [0, 0, 0]));
      const scale = item.scale ?? 1;
      if (Array.isArray(scale)) dummy.scale.fromArray(scale); else dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      ref.current.setMatrixAt(index, dummy.matrix);
      if (item.color) {
        color.set(item.color);
        ref.current.setColorAt(index, color);
      }
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [items]);
  useFrame((state, delta) => onFrame?.(ref.current, state, delta));
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} frustumCulled={false} />;
}

function Atmosphere({ radius = 4.16, colorValue = '#62baff', opacity = 0.7 }) {
  return (
    <mesh scale={1.01}>
      <sphereGeometry args={[radius, 96, 96]} />
      <meshBasicMaterial color={colorValue} transparent opacity={opacity * 0.12} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function Earth({ mode = 'present', quality }) {
  const [day, specular, normal, night, clouds] = useTexture([
    REALISM_TEXTURES.earthDay,
    REALISM_TEXTURES.earthSpecular,
    REALISM_TEXTURES.earthNormal,
    REALISM_TEXTURES.earthNight,
    REALISM_TEXTURES.earthClouds,
  ]);
  const group = useRef();
  const cloud = useRef();
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.004;
    if (cloud.current) cloud.current.rotation.y += delta * 0.006;
  });

  const connected = mode === 'connected';
  const planetary = mode === 'planetary';
  const satCount = planetary ? quality.earthInfrastructure : connected ? Math.floor(quality.earthInfrastructure * 0.28) : Math.floor(quality.earthInfrastructure * 0.06);
  const satellites = useMemo(() => Array.from({ length: satCount }, (_, i) => {
    const shell = i % (planetary ? 7 : 3);
    const radius = 5.0 + shell * (planetary ? 0.38 : 0.28) + seeded(i + 20) * 0.16;
    const theta = seeded(i + 100) * Math.PI * 2;
    const tilt = (seeded(i + 300) - 0.5) * (planetary ? 0.9 : 0.35);
    return {
      position: [Math.cos(theta) * radius, Math.sin(theta * 1.7) * tilt, Math.sin(theta) * radius],
      rotation: [tilt * 0.2, -theta, 0],
      scale: planetary ? [0.12 + seeded(i + 500) * 0.18, 0.025, 0.22 + seeded(i + 700) * 0.3] : [0.07, 0.018, 0.12],
      color: planetary && i % 19 === 0 ? '#d6bb88' : '#7f919d',
    };
  }), [planetary, satCount]);

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.82, roughness: 0.28 }), []);

  return (
    <group ref={group} rotation={[0.12, -0.85, -0.045]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[4, quality.heroSegments, quality.heroSegments]} />
        <meshPhysicalMaterial map={day} normalMap={normal} normalScale={new THREE.Vector2(0.36, 0.36)} roughnessMap={specular} roughness={0.8} clearcoat={0.06} clearcoatRoughness={0.72} />
      </mesh>
      <mesh scale={1.0014}>
        <sphereGeometry args={[4, 128, 128]} />
        <meshBasicMaterial map={night} transparent opacity={mode === 'present' ? 0.18 : connected ? 0.48 : 0.72} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={cloud} scale={1.008} rotation={[0.01, 0.09, 0]}>
        <sphereGeometry args={[4.026, 128, 128]} />
        <meshStandardMaterial map={clouds} alphaMap={clouds} transparent opacity={0.34} alphaTest={0.16} depthWrite={false} roughness={1} />
      </mesh>
      <Atmosphere opacity={planetary ? 0.9 : 0.68} />
      <InstancedObjects items={satellites} geometry={geometry} material={material} />
      {connected && <NetworkShell count={quality.networkNodes} colorValue="#65ddff" radius={4.12} />}
      {planetary && <PlanetaryMegastructures quality={quality} />}
    </group>
  );
}

function NetworkShell({ count, colorValue, radius }) {
  const positions = useMemo(() => Array.from({ length: count }, (_, i) => spherePoint(i * 7 + 3, count * 7 + 11, radius)), [count, radius]);
  const geometry = useMemo(() => new THREE.SphereGeometry(0.025, 8, 8), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: colorValue, toneMapped: false }), [colorValue]);
  const items = useMemo(() => positions.map((p) => ({ position: p.toArray() })), [positions]);
  return (
    <group>
      <InstancedObjects items={items} geometry={geometry} material={material} />
      {positions.slice(1, Math.min(positions.length, 26)).map((p, i) => <Line key={i} points={[positions[i], p]} color={colorValue} transparent opacity={0.16} lineWidth={0.45} />)}
    </group>
  );
}

function PlanetaryMegastructures({ quality }) {
  const habitats = useMemo(() => Array.from({ length: quality.habitats }, (_, i) => {
    const a = (i / quality.habitats) * Math.PI * 2;
    const r = 7.2 + (i % 3) * 0.65;
    return { position: [Math.cos(a) * r, Math.sin(a * 2.2) * 1.1, Math.sin(a) * r], rotation: [Math.PI / 2, -a, 0], scale: [0.22, 0.22, 0.65], color: i % 3 ? '#91846f' : '#c4aa76' };
  }), [quality.habitats]);
  const geometry = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 16), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.85, roughness: 0.25 }), []);
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[5.75, 0.055, 16, 320]} /><meshStandardMaterial color="#aab6af" metalness={0.9} roughness={0.22} /></mesh>
      <mesh rotation={[Math.PI / 2 + 0.32, 0.2, 0]}><torusGeometry args={[6.7, 0.025, 10, 280]} /><meshBasicMaterial color="#86ffe0" transparent opacity={0.24} toneMapped={false} /></mesh>
      <InstancedObjects items={habitats} geometry={geometry} material={material} />
      {[0, 1, 2].map((i) => <mesh key={i} rotation={[i * 1.1, i * 0.6, 0]}><torusGeometry args={[8.5 + i * 0.8, 0.02, 8, 260]} /><meshBasicMaterial color="#77cfba" transparent opacity={0.1} /></mesh>)}
    </group>
  );
}

function PresentScene({ quality }) {
  return <group><Earth mode="present" quality={quality} /><mesh position={[7.2, 2, -3]}><sphereGeometry args={[0.93, 72, 72]} /><meshStandardMaterial color="#77797d" roughness={0.95} /></mesh><Starfield count={quality.stars} /></group>;
}
function ConnectedEarthScene({ quality }) { return <group><Earth mode="connected" quality={quality} /><Starfield count={quality.stars} /></group>; }
function PlanetaryScene({ quality }) { return <group><Earth mode="planetary" quality={quality} /><Starfield count={quality.stars} /></group>; }

function StarSurface({ quality }) {
  const material = useRef();
  useFrame((state) => { if (material.current) material.current.uniforms.time.value = state.clock.elapsedTime; });
  const uniforms = useMemo(() => ({ time: { value: 0 } }), []);
  return (
    <group>
      <mesh><sphereGeometry args={[3.65, quality.heroSegments, quality.heroSegments]} /><shaderMaterial ref={material} uniforms={uniforms} vertexShader={`varying vec3 p;varying vec3 n;void main(){p=position;n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`} fragmentShader={`uniform float time;varying vec3 p;varying vec3 n;float h(vec3 q){return fract(sin(dot(q,vec3(127.1,311.7,74.7)))*43758.5453);}float no(vec3 q){vec3 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}float fb(vec3 q){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*no(q);q*=2.04;a*=.5;}return v;}void main(){vec3 q=normalize(p)*7.5;float a=fb(q+vec3(0,time*.045,0));float b=fb(q*2.8-vec3(time*.02,0,0));float limb=pow(max(dot(n,vec3(0,0,1)),0.),.32);vec3 c=mix(vec3(.58,.12,.015),vec3(1.35,.7,.14),smoothstep(.32,.78,a));c*=.5+1.18*limb;c-=smoothstep(.7,.92,b)*.2;gl_FragColor=vec4(c,1.);}`} /></mesh>
      {[1.04, 1.1, 1.18].map((s, i) => <mesh key={s} scale={s}><sphereGeometry args={[3.65, 64, 64]} /><meshBasicMaterial color="#ffaf52" transparent opacity={[0.07, 0.025, 0.008][i]} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>)}
      <pointLight color="#ffb65f" intensity={220} distance={110} decay={2} />
    </group>
  );
}

function DysonScene({ quality }) {
  const group = useRef();
  useFrame((_, d) => { if (group.current) group.current.rotation.y += d * 0.0015; });
  const items = useMemo(() => Array.from({ length: quality.dysonCollectors }, (_, i) => {
    const shell = i % 19;
    const r = 6.7 + Math.pow(seeded(i + 10), 0.58) * 12;
    const a = seeded(i + 300) * Math.PI * 2;
    const inclination = (shell - 9) * 0.022 + (seeded(i + 600) - 0.5) * 0.1;
    return { position: [Math.cos(a) * r, Math.sin(a * (1.15 + shell * 0.02)) * r * inclination, Math.sin(a) * r], rotation: [inclination, -a, 0], scale: [0.08 + seeded(i + 900) * 0.18, 0.012, 0.06 + seeded(i + 1200) * 0.16], color: i % 97 === 0 ? '#b89b69' : i % 5 ? '#314b66' : '#67788a' };
  }), [quality.dysonCollectors]);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.88, roughness: 0.23 }), []);
  return <group ref={group}><StarSurface quality={quality} /><InstancedObjects items={items} geometry={geometry} material={material} /><Starfield count={quality.stars} radius={150} opacity={0.45} /></group>;
}

function GalaxyScene({ quality }) {
  const ref = useRef();
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.001; });
  const { positions, colors } = useMemo(() => {
    const count = quality.galaxyStars;
    const p = new Float32Array(count * 3); const c = new Float32Array(count * 3);
    const warm = new THREE.Color('#ffd39c'); const cool = new THREE.Color('#83adff'); const red = new THREE.Color('#b96152');
    for (let i = 0; i < count; i += 1) {
      const halo = i < count * 0.07; const bulge = !halo && i < count * 0.24;
      let x; let y; let z;
      if (halo) { const v = spherePoint(i, Math.ceil(count * 0.07), 8 + seeded(i + 9) * 16); x = v.x; y = v.y * 0.55; z = v.z; }
      else if (bulge) { const r = Math.pow(seeded(i + 4), 1.7) * 5.2; const v = spherePoint(i, count, r); x = v.x * 1.25; y = v.y * 0.42; z = v.z * 1.25; }
      else { const arm = i % 5; const r = 2.4 + Math.pow(seeded(i + 13), 0.72) * 20; const branch = seeded(i + 80) > 0.86 ? 0.65 : 0; const a = r * 0.43 + arm * Math.PI * 0.4 + branch + (seeded(i + 200) - 0.5) * (0.32 + r * 0.03); x = Math.cos(a) * r + (seeded(i + 500) - 0.5) * 0.85; z = Math.sin(a) * r + (seeded(i + 900) - 0.5) * 0.85; y = (seeded(i + 1300) - 0.5) * Math.max(0.15, 1.35 - r * 0.052); }
      p.set([x, y, z], i * 3);
      const r = seeded(i + 1600); const cc = bulge ? warm : r > 0.79 ? cool : r > 0.68 ? red : warm.clone().lerp(cool, 0.32); c.set([cc.r, cc.g, cc.b], i * 3);
    }
    return { positions: p, colors: c };
  }, [quality.galaxyStars]);
  return <group ref={ref} rotation={[0.44, 0, -0.08]}><PointCloud positions={positions} colors={colors} size={0.05} opacity={0.82} />{[5, 9, 14].map((r, i) => <mesh key={r} rotation={[Math.PI / 2, 0, 0]}><ringGeometry args={[r - 1.4, r + 1.4, 220]} /><meshBasicMaterial color="#211512" transparent opacity={[0.2, 0.12, 0.055][i]} side={THREE.DoubleSide} depthWrite={false} /></mesh>)}<mesh scale={[1.4, 0.48, 1.4]}><sphereGeometry args={[2.4, 64, 64]} /><meshBasicMaterial color="#ffe0ae" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh><Starfield count={quality.stars} radius={170} opacity={0.3} /></group>;
}

function CosmicWebScene({ quality }) {
  const data = useMemo(() => {
    const clusters = 16; const galaxiesPer = Math.floor(quality.cosmicGalaxies / clusters); const p = new Float32Array(clusters * galaxiesPer * 3); const c = new Float32Array(clusters * galaxiesPer * 3); const centers = [];
    for (let k = 0; k < clusters; k += 1) centers.push(new THREE.Vector3((seeded(k + 10) - 0.5) * 34, (seeded(k + 40) - 0.5) * 18, (seeded(k + 70) - 0.5) * 30));
    let cursor = 0;
    centers.forEach((center, k) => { for (let i = 0; i < galaxiesPer; i += 1) { const v = spherePoint(i, galaxiesPer, Math.pow(seeded(k * 1000 + i), 2.1) * 4.5).add(center); p.set([v.x, v.y, v.z], cursor * 3); const cc = new THREE.Color(i % 13 === 0 ? '#ffe1bd' : i % 5 === 0 ? '#9ab8ff' : '#d7dce9'); c.set([cc.r, cc.g, cc.b], cursor * 3); cursor += 1; } });
    const links = []; centers.forEach((a, i) => centers.slice(i + 1).map((b) => ({ b, d: a.distanceTo(b) })).sort((x, y) => x.d - y.d).slice(0, 2).forEach(({ b }) => links.push([a, b])));
    return { p, c, links };
  }, [quality.cosmicGalaxies]);
  return <group>{data.links.map((l, i) => <Line key={i} points={l} color="#6680a9" transparent opacity={0.07} lineWidth={0.3} />)}<PointCloud positions={data.p} colors={data.c} size={0.035} opacity={0.72} /><Starfield count={quality.stars} radius={170} opacity={0.24} /></group>;
}

function MaterialScene({ quality }) {
  const items = useMemo(() => Array.from({ length: quality.latticeAtoms }, (_, i) => ({ position: [((i % 20) - 9.5) * 0.58, (Math.floor(i / 20) % 10 - 4.5) * 0.58, (Math.floor(i / 200) - 1) * 0.72], scale: i % 73 === 0 ? [0.34, 1.6, 0.34] : 0.42, color: i % 73 === 0 ? '#ff8d61' : i % 5 ? '#77848e' : '#c59766' })), [quality.latticeAtoms]);
  const geometry = useMemo(() => new THREE.OctahedronGeometry(0.3, 0), []); const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.78, roughness: 0.25 }), []);
  return <group rotation={[0.26, -0.42, 0.08]}><mesh position={[0, -5.2, 0]}><boxGeometry args={[24, 0.7, 15]} /><meshPhysicalMaterial color="#182128" metalness={0.72} roughness={0.22} clearcoat={0.4} /></mesh><InstancedObjects items={items} geometry={geometry} material={material} /><mesh position={[0, 4.8, 0]}><cylinderGeometry args={[1.6, 0.5, 5.4, 48]} /><meshStandardMaterial color="#3b454e" metalness={0.88} roughness={0.2} /></mesh><pointLight position={[0, 2, 2]} color="#77d5ff" intensity={32} distance={18} /></group>;
}

function BiologyScene({ quality }) {
  const count = quality.dnaPairs;
  const items = useMemo(() => Array.from({ length: count * 2 }, (_, i) => { const pair = Math.floor(i / 2); const side = i % 2; const t = (pair / Math.max(1, count - 1)) * Math.PI * 14 - Math.PI * 7; const a = t + side * Math.PI; return { position: [Math.cos(a) * 2.3, t * 0.25, Math.sin(a) * 2.3], scale: 0.09, color: side ? '#55a5b7' : '#d26790' }; }), [count]);
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 10, 10), []); const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5 }), []);
  return <group rotation={[0.2, 0.45, Math.PI / 2]}><mesh scale={[8.5, 5.8, 5.8]}><sphereGeometry args={[1, 72, 72]} /><meshPhysicalMaterial color="#35142c" transparent opacity={0.13} transmission={0.5} thickness={2} roughness={0.36} side={THREE.BackSide} /></mesh><InstancedObjects items={items} geometry={geometry} material={material} />{Array.from({ length: Math.floor(count / 5) }, (_, i) => { const pair = i * 5; const t = (pair / Math.max(1, count - 1)) * Math.PI * 14 - Math.PI * 7; return <Line key={i} points={[[Math.cos(t) * 2.3, t * 0.25, Math.sin(t) * 2.3], [Math.cos(t + Math.PI) * 2.3, t * 0.25, Math.sin(t + Math.PI) * 2.3]]} color="#d8ccd9" transparent opacity={0.32} lineWidth={0.7} />; })}<pointLight position={[3, 2, 4]} color="#d774a2" intensity={24} distance={18} /></group>;
}

function MolecularScene({ quality }) {
  const count = quality.moleculeAtoms;
  const items = useMemo(() => Array.from({ length: count }, (_, i) => ({ position: [(seeded(i + 2) - 0.5) * 11, (seeded(i + 60) - 0.5) * 8, (seeded(i + 120) - 0.5) * 7], scale: 0.16 + seeded(i + 180) * 0.28, color: i % 9 === 0 ? '#ca4958' : i % 7 === 0 ? '#4d74bd' : i % 3 === 0 ? '#dadde3' : '#4b5058' })), [count]);
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 18, 18), []); const material = useMemo(() => new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.34, clearcoat: 0.42 }), []);
  const solvent = useMemo(() => { const p = new Float32Array(quality.microParticles * 3); for (let i = 0; i < quality.microParticles; i += 1) { const v = spherePoint(i, quality.microParticles, Math.pow(seeded(i + 900), 0.55) * 9); p.set([v.x, v.y, v.z], i * 3); } return p; }, [quality.microParticles]);
  return <group><InstancedObjects items={items} geometry={geometry} material={material} /><PointCloud positions={solvent} size={0.025} opacity={0.045} /><pointLight position={[4, 3, 6]} color="#70b9d7" intensity={28} distance={20} /></group>;
}

function AtomicScene({ quality }) {
  const cloud = useMemo(() => { const p = new Float32Array(quality.microParticles * 3); for (let i = 0; i < quality.microParticles; i += 1) { const orbital = i % 4; const r = -Math.log(Math.max(0.001, 1 - seeded(i + 4))) * 1.15; const t = seeded(i + 30) * Math.PI * 2; const f = Math.acos(2 * seeded(i + 70) - 1); const axes = orbital === 0 ? [1, .34, .34] : orbital === 1 ? [.34, 1, .34] : orbital === 2 ? [.34, .34, 1] : [.72, .72, .72]; p.set([r * Math.sin(f) * Math.cos(t) * axes[0], r * Math.cos(f) * axes[1], r * Math.sin(f) * Math.sin(t) * axes[2]], i * 3); } return p; }, [quality.microParticles]);
  return <group><PointCloud positions={cloud} size={0.032} opacity={0.23} /><mesh><sphereGeometry args={[0.42, 48, 48]} /><meshStandardMaterial color="#c9d6ff" emissive="#4d61a0" emissiveIntensity={1.2} roughness={0.5} /></mesh><pointLight color="#6d80ff" intensity={30} distance={15} /></group>;
}

function NuclearScene({ quality }) {
  const items = useMemo(() => Array.from({ length: quality.nucleons }, (_, i) => ({ position: spherePoint(i, quality.nucleons, Math.cbrt(seeded(i + 3)) * 3.35).toArray(), scale: 0.33, color: i % 2 ? '#35738f' : '#a54153' })), [quality.nucleons]);
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 16, 16), []); const material = useMemo(() => new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.48, clearcoat: 0.22 }), []);
  return <group><InstancedObjects items={items} geometry={geometry} material={material} /><mesh scale={3.8}><sphereGeometry args={[1, 64, 64]} /><meshBasicMaterial color="#8e77ff" wireframe transparent opacity={0.035} /></mesh><pointLight color="#8a68ff" intensity={28} distance={15} /></group>;
}

function ParticleScene({ quality }) {
  const tracks = useMemo(() => Array.from({ length: quality.particleTracks }, (_, i) => { const a = seeded(i + 8) * Math.PI * 2; const bend = (seeded(i + 40) - 0.5) * 2.8; return Array.from({ length: 42 }, (_, step) => { const t = step / 41; const r = t * 11; return [Math.cos(a + bend * t) * r, (seeded(i + 80) - 0.5) * t * 8, Math.sin(a + bend * t) * r]; }); }), [quality.particleTracks]);
  return <group rotation={[0.1, 0.35, 0]}>{[2, 3.1, 4.4, 5.9, 7.6, 9.5].map((r, i) => <mesh key={r} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[r, 0.14 + i * 0.02, 12, 160]} /><meshStandardMaterial color={i % 2 ? '#51656b' : '#29383e'} metalness={0.76} roughness={0.27} /></mesh>)}{tracks.map((track, i) => <Line key={i} points={track} color={i % 6 === 0 ? '#ff9c6b' : i % 5 === 0 ? '#7f9dff' : '#7fd6c7'} transparent opacity={0.56} lineWidth={0.9} />)}<pointLight color="#ffffff" intensity={70} distance={20} /></group>;
}

function SpacetimeScene({ quality }) {
  const lines = useMemo(() => { const result = []; const step = quality.gridStep; for (let x = -13; x <= 13; x += step) { const pts = []; for (let z = -13; z <= 13; z += 0.32) { const d = Math.sqrt(x*x+z*z); pts.push([x,-6.4/(d+.65),z]); } result.push(pts); } for (let z=-13;z<=13;z+=step){const pts=[];for(let x=-13;x<=13;x+=.32){const d=Math.sqrt(x*x+z*z);pts.push([x,-6.4/(d+.65),z]);}result.push(pts);} return result; }, [quality.gridStep]);
  return <group rotation={[0.76,0,0]}>{lines.map((l,i)=><Line key={i} points={l} color="#95a8ba" transparent opacity={0.11} lineWidth={0.35} />)}<mesh position={[0,-6.2,0]}><sphereGeometry args={[1.88,72,72]} /><meshBasicMaterial color="#000000" /></mesh>{[2.35,2.7,3.2,3.9].map((r,i)=><mesh key={r} position={[0,-6.2,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[r,.1+i*.035,20,220]} /><meshBasicMaterial color={i<2?'#fff0cf':'#d46a3d'} transparent opacity={[.82,.5,.24,.1][i]} toneMapped={false} /></mesh>)}<Starfield count={quality.stars} radius={170} /></group>;
}

function MultiverseScene({ quality }) {
  const bubbles = useMemo(() => Array.from({ length: quality.multiverseBubbles }, (_, i) => ({ position: [(seeded(i+1)-.5)*26,(seeded(i+40)-.5)*17,(seeded(i+90)-.5)*22], scale: .6+seeded(i+130)*2.6, color: new THREE.Color().setHSL(.55+seeded(i+180)*.28,.42,.58) })), [quality.multiverseBubbles]);
  const geometry = useMemo(()=>new THREE.SphereGeometry(1,32,32),[]); const material=useMemo(()=>new THREE.MeshPhysicalMaterial({vertexColors:true,transparent:true,opacity:.06,transmission:.82,thickness:1.1,roughness:.1,side:THREE.DoubleSide}),[]);
  return <group><InstancedObjects items={bubbles} geometry={geometry} material={material} /><Starfield count={quality.stars} radius={170} opacity={0.25} /></group>;
}

function RealityScene({ quality }) {
  const shells=useMemo(()=>Array.from({length:quality.realityShells},(_,i)=>({position:[0,0,0],rotation:[seeded(i+1)*Math.PI,seeded(i+30)*Math.PI,seeded(i+60)*Math.PI],scale:1.2+i*.38,color:i%2?'#b9c0ff':'#f4d9ff'})),[quality.realityShells]);
  const geometry=useMemo(()=>new THREE.IcosahedronGeometry(1,1),[]); const material=useMemo(()=>new THREE.MeshBasicMaterial({vertexColors:true,wireframe:true,transparent:true,opacity:.08}),[]);
  return <group><InstancedObjects items={shells} geometry={geometry} material={material}/><Starfield count={quality.stars} radius={170} opacity={0.2}/></group>;
}

export const PRODUCTION_SCENES = {
  reality: RealityScene,
  multiverse: MultiverseScene,
  'cosmic-web': CosmicWebScene,
  galaxy: GalaxyScene,
  dyson: DysonScene,
  planetary: PlanetaryScene,
  'connected-earth': ConnectedEarthScene,
  present: PresentScene,
  material: MaterialScene,
  biology: BiologyScene,
  molecular: MolecularScene,
  atomic: AtomicScene,
  nuclear: NuclearScene,
  particle: ParticleScene,
  spacetime: SpacetimeScene,
};
