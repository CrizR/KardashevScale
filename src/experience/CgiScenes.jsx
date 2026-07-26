import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Line, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { REALISM_TEXTURES } from '../components/LifeScale/realismTextures';
import {
  CgiAtmosphere,
  CgiCloudMaterial,
  CgiEarthSurface,
  CgiPointMaterial,
  CgiSunMaterial,
} from './CgiMaterials';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const dummy = new THREE.Object3D();
const instanceColor = new THREE.Color();

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
      <CgiPointMaterial size={size} opacity={opacity} useVertexColors={Boolean(colors)} />
    </points>
  );
}

function Starfield({ count = 5000, radius = 120, opacity = 0.5 }) {
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const point = spherePoint(i, count, radius * (0.62 + seeded(i + 90) * 0.38));
      values.set(point.toArray(), i * 3);
    }
    return values;
  }, [count, radius]);
  return <PointCloud positions={positions} size={0.026} opacity={opacity} />;
}

function InstancedObjects({ items, geometry, material, animate }) {
  const ref = useRef();
  useLayoutEffect(() => {
    if (!ref.current) return;
    items.forEach((item, index) => {
      dummy.position.fromArray(item.position || [0, 0, 0]);
      dummy.rotation.set(...(item.rotation || [0, 0, 0]));
      if (Array.isArray(item.scale)) dummy.scale.fromArray(item.scale);
      else dummy.scale.setScalar(item.scale ?? 1);
      dummy.updateMatrix();
      ref.current.setMatrixAt(index, dummy.matrix);
      if (item.color) {
        instanceColor.set(item.color);
        ref.current.setColorAt(index, instanceColor);
      }
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [items]);
  useFrame((state, delta) => animate?.(ref.current, state, delta));
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} frustumCulled={false} />;
}

function OrbitalHardware({ count, type }) {
  const items = useMemo(() => Array.from({ length: count }, (_, i) => {
    const shell = i % (type === 'planetary' ? 8 : 3);
    const radius = 5.05 + shell * (type === 'planetary' ? 0.42 : 0.28) + seeded(i + 15) * 0.2;
    const angle = seeded(i + 100) * Math.PI * 2;
    const tilt = (seeded(i + 300) - 0.5) * (type === 'planetary' ? 1.2 : 0.42);
    const habitat = type === 'planetary' && i % 41 === 0;
    return {
      position: [Math.cos(angle) * radius, Math.sin(angle * 1.7) * tilt, Math.sin(angle) * radius],
      rotation: [tilt * 0.25, -angle, seeded(i + 700) * Math.PI],
      scale: habitat ? [0.34, 0.34, 1.25] : type === 'planetary' ? [0.18, 0.025, 0.34] : [0.08, 0.018, 0.14],
      color: habitat ? '#c9a875' : i % 7 === 0 ? '#446f8e' : '#8696a2',
    };
  }), [count, type]);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({ vertexColors: true, metalness: 0.86, roughness: 0.24, clearcoat: 0.28 }), []);
  return <InstancedObjects items={items} geometry={geometry} material={material} />;
}

function CivilizationSurface({ level, count }) {
  const points = useMemo(() => Array.from({ length: count }, (_, i) => spherePoint(i * 13 + 5, count * 13 + 17, 4.055)), [count]);
  const geometry = useMemo(() => new THREE.SphereGeometry(level === 2 ? 0.045 : 0.025, 8, 8), [level]);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: level === 2 ? '#7effc8' : '#72d8ff', toneMapped: false }), [level]);
  const items = useMemo(() => points.map((point) => ({ position: point.toArray() })), [points]);
  return (
    <group>
      <InstancedObjects items={items} geometry={geometry} material={material} />
      {level > 0 && points.slice(0, Math.min(30, points.length - 1)).map((point, i) => (
        <Line key={i} points={[point, points[(i * 7 + 11) % points.length]]} color={level === 2 ? '#7dffd4' : '#68d8ff'} transparent opacity={level === 2 ? 0.14 : 0.1} lineWidth={0.45} />
      ))}
    </group>
  );
}

function TypeOneInfrastructure({ quality }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[5.75, 0.09, 18, 420]} />
        <meshPhysicalMaterial color="#b8c1b8" metalness={0.92} roughness={0.2} clearcoat={0.42} />
      </mesh>
      <mesh rotation={[Math.PI / 2 + 0.31, 0.18, 0]}>
        <torusGeometry args={[6.62, 0.035, 12, 360]} />
        <meshBasicMaterial color="#79ffd8" transparent opacity={0.34} toneMapped={false} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[i * 0.78, i * 1.17, i * 0.31]}>
          <torusGeometry args={[7.6 + i * 0.72, 0.025 + i * 0.006, 10, 320]} />
          <meshBasicMaterial color={i % 2 ? '#4f978b' : '#7dc8b7'} transparent opacity={0.12} />
        </mesh>
      ))}
      <OrbitalHardware count={quality.earthInfrastructure} type="planetary" />
    </group>
  );
}

function Earth({ mode, quality }) {
  const [day, specular, normal, night, clouds] = useTexture([
    REALISM_TEXTURES.earthDay,
    REALISM_TEXTURES.earthSpecular,
    REALISM_TEXTURES.earthNormal,
    REALISM_TEXTURES.earthNight,
    REALISM_TEXTURES.earthClouds,
  ]);
  const group = useRef();
  const cloudsRef = useRef();
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.0032;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.0018;
  });
  const connected = mode === 'connected';
  const planetary = mode === 'planetary';
  const infrastructureCount = planetary ? quality.earthInfrastructure : connected ? Math.floor(quality.earthInfrastructure * 0.2) : Math.floor(quality.earthInfrastructure * 0.035);
  return (
    <group ref={group} rotation={[0.12, planetary ? -0.42 : -0.85, -0.045]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[4, quality.heroSegments, quality.heroSegments]} />
        <CgiEarthSurface dayMap={day} nightMap={night} specularMap={specular} normalMap={normal} civilization={planetary ? 1 : connected ? 0.35 : 0} />
      </mesh>
      <mesh ref={cloudsRef} scale={1.008} rotation={[0.01, 0.09, 0]}>
        <sphereGeometry args={[4.026, Math.min(quality.heroSegments, 160), Math.min(quality.heroSegments, 160)]} />
        <CgiCloudMaterial cloudMap={clouds} opacity={planetary ? 0.5 : 0.42} />
      </mesh>
      <mesh scale={1.03}>
        <sphereGeometry args={[4.12, 96, 96]} />
        <CgiAtmosphere intensity={planetary ? 1.12 : 0.92} />
      </mesh>
      <OrbitalHardware count={infrastructureCount} type={planetary ? 'planetary' : 'current'} />
      {connected && <CivilizationSurface level={1} count={quality.networkNodes} />}
      {planetary && <CivilizationSurface level={2} count={Math.max(quality.networkNodes * 2, 80)} />}
      {planetary && <TypeOneInfrastructure quality={quality} />}
    </group>
  );
}

function PresentScene({ quality }) {
  return (
    <group>
      <Earth mode="present" quality={quality} />
      <mesh position={[7.2, 2, -3]} rotation={[0.08, 0.4, 0.1]}>
        <sphereGeometry args={[0.93, 96, 96]} />
        <meshStandardMaterial color="#73767b" roughness={0.94} bumpScale={0.12} />
      </mesh>
      <Starfield count={quality.stars} />
    </group>
  );
}

function ConnectedEarthScene({ quality }) {
  return <group><Earth mode="connected" quality={quality} /><Starfield count={quality.stars} /></group>;
}

function PlanetaryScene({ quality }) {
  return (
    <group>
      <Earth mode="planetary" quality={quality} />
      <mesh position={[10.2, 1.2, -5.5]} rotation={[0.15, -0.72, 0.22]}>
        <cylinderGeometry args={[1.25, 1.25, 4.8, 48]} />
        <meshPhysicalMaterial color="#bda77f" metalness={0.8} roughness={0.25} clearcoat={0.45} />
      </mesh>
      <mesh position={[-10.5, -2.8, -8]} rotation={[0.7, 0.2, 0.1]}>
        <torusGeometry args={[2.5, 0.3, 24, 200]} />
        <meshPhysicalMaterial color="#8d806a" metalness={0.82} roughness={0.28} />
      </mesh>
      <Starfield count={quality.stars} />
    </group>
  );
}

function StarSurface({ quality }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[3.65, quality.heroSegments, quality.heroSegments]} />
        <CgiSunMaterial />
      </mesh>
      {[1.035, 1.075, 1.14, 1.24].map((scale, i) => (
        <mesh key={scale} scale={scale}>
          <sphereGeometry args={[3.65, 72, 72]} />
          <meshBasicMaterial color="#ffad48" transparent opacity={[0.085, 0.038, 0.014, 0.004][i]} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
      <pointLight color="#ffb45b" intensity={260} distance={120} decay={2} />
    </group>
  );
}

function DysonScene({ quality }) {
  const group = useRef();
  useFrame((_, delta) => { if (group.current) group.current.rotation.y += delta * 0.0011; });
  const collectors = useMemo(() => Array.from({ length: quality.dysonCollectors }, (_, i) => {
    const family = i % 11;
    const radius = 6.6 + Math.pow(seeded(i + 10), 0.58) * 12.8;
    const angle = seeded(i + 300) * Math.PI * 2;
    const inclination = (family - 5) * 0.055 + (seeded(i + 600) - 0.5) * 0.22;
    const habitat = i % 131 === 0;
    return {
      position: [Math.cos(angle) * radius, Math.sin(angle * (1.08 + family * 0.025)) * radius * inclination, Math.sin(angle) * radius],
      rotation: [inclination, -angle, seeded(i + 1000) * Math.PI],
      scale: habitat ? [0.55, 0.35, 1.7] : [0.08 + seeded(i + 900) * 0.22, 0.012, 0.07 + seeded(i + 1200) * 0.2],
      color: habitat ? '#c1a172' : i % 7 === 0 ? '#57738e' : i % 3 ? '#263e57' : '#788997',
    };
  }), [quality.dysonCollectors]);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({ vertexColors: true, metalness: 0.9, roughness: 0.2, clearcoat: 0.32 }), []);
  return (
    <group ref={group} rotation={[0.08, 0, -0.03]}>
      <StarSurface quality={quality} />
      <InstancedObjects items={collectors} geometry={geometry} material={material} />
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.5, 18.5, 320]} />
        <meshBasicMaterial color="#8d522d" transparent opacity={0.028} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Starfield count={quality.stars} radius={160} opacity={0.36} />
    </group>
  );
}

function GalaxyScene({ quality }) {
  const group = useRef();
  useFrame((_, delta) => { if (group.current) group.current.rotation.y += delta * 0.00065; });
  const data = useMemo(() => {
    const count = quality.galaxyStars;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const warm = new THREE.Color('#ffd2a0');
    const cool = new THREE.Color('#80aaff');
    const red = new THREE.Color('#c05d4d');
    for (let i = 0; i < count; i += 1) {
      const random = seeded(i + 2);
      let x; let y; let z;
      if (random < 0.09) {
        const point = spherePoint(i, count, 8 + seeded(i + 20) * 17);
        x = point.x; y = point.y * 0.5; z = point.z;
      } else if (random < 0.27) {
        const radius = Math.pow(seeded(i + 41), 1.8) * 5.6;
        const point = spherePoint(i, count, radius);
        x = point.x * 1.3; y = point.y * 0.42; z = point.z * 1.3;
      } else {
        const arm = i % 5;
        const radius = 2.3 + Math.pow(seeded(i + 61), 0.68) * 20.5;
        const broken = seeded(i + 91) > 0.81 ? (seeded(i + 92) - 0.5) * 1.1 : 0;
        const angle = radius * 0.42 + arm * Math.PI * 0.4 + broken + (seeded(i + 110) - 0.5) * (0.22 + radius * 0.045);
        const clump = Math.pow(seeded(i + 130), 2.8);
        x = Math.cos(angle) * radius + (seeded(i + 150) - 0.5) * (0.2 + clump * 1.4);
        z = Math.sin(angle) * radius + (seeded(i + 180) - 0.5) * (0.2 + clump * 1.4);
        y = (seeded(i + 210) - 0.5) * Math.max(0.14, 1.45 - radius * 0.055);
      }
      positions.set([x, y, z], i * 3);
      const temperature = seeded(i + 260);
      const selected = random < 0.27 ? warm : temperature > 0.78 ? cool : temperature > 0.63 ? red : warm.clone().lerp(cool, 0.28);
      colors.set([selected.r, selected.g, selected.b], i * 3);
    }
    return { positions, colors };
  }, [quality.galaxyStars]);
  return (
    <group ref={group} rotation={[0.46, 0, -0.08]}>
      <PointCloud positions={data.positions} colors={data.colors} size={0.018} opacity={0.92} />
      {[4.8, 7.7, 11.5, 15.7].map((radius, i) => (
        <mesh key={radius} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 1.1, radius + 1.1, 300]} />
          <meshBasicMaterial color={i < 2 ? '#301a13' : '#171011'} transparent opacity={[0.2, 0.14, 0.085, 0.04][i]} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
      <mesh scale={[1.5, 0.5, 1.5]}>
        <sphereGeometry args={[2.5, 80, 80]} />
        <meshBasicMaterial color="#ffe1ae" transparent opacity={0.24} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <Starfield count={quality.stars} radius={175} opacity={0.22} />
    </group>
  );
}

function CosmicWebScene({ quality }) {
  const data = useMemo(() => {
    const clusters = 13;
    const centers = Array.from({ length: clusters }, (_, i) => new THREE.Vector3((seeded(i + 10) - 0.5) * 36, (seeded(i + 40) - 0.5) * 19, (seeded(i + 70) - 0.5) * 31));
    const perCluster = Math.max(40, Math.floor(quality.cosmicGalaxies / clusters));
    const positions = new Float32Array(clusters * perCluster * 3);
    const colors = new Float32Array(clusters * perCluster * 3);
    let cursor = 0;
    centers.forEach((center, clusterIndex) => {
      for (let i = 0; i < perCluster; i += 1) {
        const radius = Math.pow(seeded(clusterIndex * 1000 + i), 2.5) * 4.6;
        const point = spherePoint(i, perCluster, radius).add(center);
        positions.set(point.toArray(), cursor * 3);
        const starColor = new THREE.Color(i % 17 === 0 ? '#ffd8aa' : i % 7 === 0 ? '#8dacff' : '#d9dfea');
        colors.set([starColor.r, starColor.g, starColor.b], cursor * 3);
        cursor += 1;
      }
    });
    const links = [];
    centers.forEach((a, i) => centers.slice(i + 1).map((b) => ({ b, d: a.distanceTo(b) })).sort((x, y) => x.d - y.d).slice(0, 2).forEach(({ b }) => links.push([a, b])));
    return { positions, colors, centers, links };
  }, [quality.cosmicGalaxies]);
  return (
    <group>
      {data.links.map((link, i) => <Line key={i} points={link} color="#6d80a8" transparent opacity={0.075} lineWidth={0.42} />)}
      <PointCloud positions={data.positions} colors={data.colors} size={0.016} opacity={0.9} />
      {data.centers.map((center, i) => (
        <mesh key={i} position={center} scale={0.5 + seeded(i + 500) * 1.2}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color={i % 3 ? '#8aa6dc' : '#f3d2ae'} transparent opacity={0.055} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      <Starfield count={quality.stars} radius={175} opacity={0.16} />
    </group>
  );
}

function MaterialScene({ quality }) {
  const lattice = useMemo(() => Array.from({ length: quality.latticeAtoms }, (_, i) => {
    const defect = i % 73 === 0 || i % 109 === 0;
    return { position: [((i % 20) - 9.5) * 0.58, (Math.floor(i / 20) % 10 - 4.5) * 0.58, (Math.floor(i / 200) - 1) * 0.72], scale: defect ? [0.38, 1.75, 0.38] : 0.42, color: defect ? '#ff8c5f' : i % 5 ? '#74818b' : '#c69764' };
  }), [quality.latticeAtoms]);
  const geometry = useMemo(() => new THREE.OctahedronGeometry(0.3, 1), []);
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({ vertexColors: true, metalness: 0.8, roughness: 0.22, clearcoat: 0.42 }), []);
  return (
    <group rotation={[0.24, -0.42, 0.08]}>
      <mesh position={[0, -5.2, 0]}><boxGeometry args={[24, 0.75, 15]} /><meshPhysicalMaterial color="#161f25" metalness={0.74} roughness={0.18} clearcoat={0.55} /></mesh>
      <InstancedObjects items={lattice} geometry={geometry} material={material} />
      <mesh position={[0, 4.9, 0]}><cylinderGeometry args={[1.65, 0.42, 5.7, 64]} /><meshPhysicalMaterial color="#3d464e" metalness={0.92} roughness={0.16} /></mesh>
      <mesh position={[0, 2.15, 0]}><cylinderGeometry args={[0.06, 0.06, 5.5, 12]} /><meshBasicMaterial color="#6ad8ff" transparent opacity={0.7} toneMapped={false} /></mesh>
      <pointLight position={[0, 2.5, 2]} color="#7fdfff" intensity={40} distance={18} />
    </group>
  );
}

function BiologyScene({ quality }) {
  const count = quality.dnaPairs;
  const backbone = useMemo(() => Array.from({ length: count * 2 }, (_, i) => {
    const pair = Math.floor(i / 2); const side = i % 2;
    const t = (pair / Math.max(1, count - 1)) * Math.PI * 14 - Math.PI * 7;
    const angle = t + side * Math.PI;
    return { position: [Math.cos(angle) * 2.3, t * 0.25, Math.sin(angle) * 2.3], scale: 0.095, color: side ? '#58adbb' : '#d66b96' };
  }), [count]);
  const proteins = useMemo(() => Array.from({ length: 34 }, (_, i) => ({ position: [(seeded(i + 4) - 0.5) * 11, (seeded(i + 40) - 0.5) * 8, (seeded(i + 80) - 0.5) * 8], scale: 0.22 + seeded(i + 130) * 0.55, color: i % 2 ? '#744c70' : '#4f6e77' })), []);
  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(1, 12, 12), []);
  const backboneMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.42, clearcoat: 0.22 }), []);
  const proteinGeometry = useMemo(() => new THREE.IcosahedronGeometry(1, 2), []);
  const proteinMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.55, transmission: 0.08 }), []);
  return (
    <group rotation={[0.2, 0.42, Math.PI / 2]}>
      <mesh scale={[8.6, 5.9, 5.9]}><sphereGeometry args={[1, 80, 80]} /><meshPhysicalMaterial color="#32132b" transparent opacity={0.13} transmission={0.58} thickness={2.3} roughness={0.34} side={THREE.BackSide} /></mesh>
      <InstancedObjects items={backbone} geometry={sphereGeometry} material={backboneMaterial} />
      <InstancedObjects items={proteins} geometry={proteinGeometry} material={proteinMaterial} />
      {Array.from({ length: Math.floor(count / 4) }, (_, i) => {
        const pair = i * 4; const t = (pair / Math.max(1, count - 1)) * Math.PI * 14 - Math.PI * 7;
        return <Line key={i} points={[[Math.cos(t) * 2.3, t * 0.25, Math.sin(t) * 2.3], [Math.cos(t + Math.PI) * 2.3, t * 0.25, Math.sin(t + Math.PI) * 2.3]]} color="#ddd0dd" transparent opacity={0.36} lineWidth={0.82} />;
      })}
      <pointLight position={[3, 2, 4]} color="#dc7aa7" intensity={30} distance={20} />
    </group>
  );
}

function MolecularScene({ quality }) {
  const atoms = useMemo(() => Array.from({ length: quality.moleculeAtoms }, (_, i) => ({ position: [(seeded(i + 2) - 0.5) * 11, (seeded(i + 60) - 0.5) * 8, (seeded(i + 120) - 0.5) * 7], scale: 0.16 + seeded(i + 180) * 0.29, color: i % 9 === 0 ? '#d84c5c' : i % 7 === 0 ? '#4d78c5' : i % 3 === 0 ? '#e1e5eb' : '#4a5059' })), [quality.moleculeAtoms]);
  const atomGeometry = useMemo(() => new THREE.SphereGeometry(1, 20, 20), []);
  const atomMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.28, clearcoat: 0.58 }), []);
  const solvent = useMemo(() => { const values = new Float32Array(quality.microParticles * 3); for (let i = 0; i < quality.microParticles; i += 1) values.set(spherePoint(i, quality.microParticles, Math.pow(seeded(i + 900), 0.55) * 9).toArray(), i * 3); return values; }, [quality.microParticles]);
  return <group><InstancedObjects items={atoms} geometry={atomGeometry} material={atomMaterial} /><PointCloud positions={solvent} size={0.009} opacity={0.12} /><mesh scale={8.7}><sphereGeometry args={[1, 64, 64]} /><meshPhysicalMaterial color="#173647" transparent opacity={0.06} transmission={0.88} thickness={1.8} side={THREE.BackSide} /></mesh><pointLight position={[4, 3, 6]} color="#78c7e7" intensity={32} distance={20} /></group>;
}

function AtomicScene({ quality }) {
  const cloud = useMemo(() => {
    const values = new Float32Array(quality.microParticles * 3);
    for (let i = 0; i < quality.microParticles; i += 1) {
      const orbital = i % 5;
      const radius = -Math.log(Math.max(0.001, 1 - seeded(i + 4))) * 1.12;
      const theta = seeded(i + 30) * Math.PI * 2;
      const phi = Math.acos(2 * seeded(i + 70) - 1);
      const axes = orbital === 0 ? [1, 0.28, 0.28] : orbital === 1 ? [0.28, 1, 0.28] : orbital === 2 ? [0.28, 0.28, 1] : orbital === 3 ? [0.72, 0.72, 0.28] : [0.72, 0.72, 0.72];
      values.set([radius * Math.sin(phi) * Math.cos(theta) * axes[0], radius * Math.cos(phi) * axes[1], radius * Math.sin(phi) * Math.sin(theta) * axes[2]], i * 3);
    }
    return values;
  }, [quality.microParticles]);
  return <group><PointCloud positions={cloud} size={0.012} opacity={0.34} /><mesh><sphereGeometry args={[0.42, 56, 56]} /><meshStandardMaterial color="#d6defd" emissive="#526bb0" emissiveIntensity={1.5} roughness={0.46} /></mesh><mesh scale={5.8}><sphereGeometry args={[1, 64, 64]} /><meshBasicMaterial color="#5546a5" transparent opacity={0.026} side={THREE.BackSide} /></mesh><pointLight color="#738aff" intensity={34} distance={16} /></group>;
}

function NuclearScene({ quality }) {
  const nucleons = useMemo(() => Array.from({ length: quality.nucleons }, (_, i) => ({ position: spherePoint(i, quality.nucleons, Math.cbrt(seeded(i + 3)) * 3.35).toArray(), scale: 0.33, color: i % 2 ? '#357690' : '#aa4356' })), [quality.nucleons]);
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 18, 18), []);
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.44, clearcoat: 0.28 }), []);
  return <group><InstancedObjects items={nucleons} geometry={geometry} material={material} /><mesh scale={3.9}><sphereGeometry args={[1, 72, 72]} /><meshBasicMaterial color="#9a78ff" wireframe transparent opacity={0.06} /></mesh><mesh scale={5.3}><sphereGeometry args={[1, 64, 64]} /><meshBasicMaterial color="#6d45c9" transparent opacity={0.025} side={THREE.BackSide} /></mesh><pointLight color="#9b72ff" intensity={34} distance={16} /></group>;
}

function ParticleScene({ quality }) {
  const tracks = useMemo(() => Array.from({ length: quality.particleTracks }, (_, i) => {
    const angle = seeded(i + 8) * Math.PI * 2;
    const bend = (seeded(i + 40) - 0.5) * 3.2;
    return Array.from({ length: 72 }, (_, step) => { const t = step / 71; const radius = t * 11; return [Math.cos(angle + bend * t) * radius, (seeded(i + 80) - 0.5) * t * 8, Math.sin(angle + bend * t) * radius]; });
  }), [quality.particleTracks]);
  return (
    <group rotation={[0.1, 0.35, 0]}>
      {[2, 3.1, 4.4, 5.9, 7.6, 9.5].map((radius, i) => <mesh key={radius} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius, 0.18 + i * 0.024, 18, 300]} /><meshPhysicalMaterial color={i % 2 ? '#52676e' : '#27373d'} metalness={0.82} roughness={0.22} /></mesh>)}
      {tracks.map((track, i) => <Line key={i} points={track} color={i % 6 === 0 ? '#ff9d68' : i % 5 === 0 ? '#809eff' : '#7ce0ce'} transparent opacity={0.62} lineWidth={1.15} />)}
      <pointLight color="#ffffff" intensity={95} distance={20} />
    </group>
  );
}

function SpacetimeScene({ quality }) {
  const lines = useMemo(() => {
    const result = [];
    for (let x = -13; x <= 13; x += 0.65) { const points = []; for (let z = -13; z <= 13; z += 0.3) { const distance = Math.sqrt(x * x + z * z); points.push([x, -6.5 / (distance + 0.62), z]); } result.push(points); }
    for (let z = -13; z <= 13; z += 0.65) { const points = []; for (let x = -13; x <= 13; x += 0.3) { const distance = Math.sqrt(x * x + z * z); points.push([x, -6.5 / (distance + 0.62), z]); } result.push(points); }
    return result;
  }, []);
  return (
    <group rotation={[0.76, 0, 0]}>
      {lines.map((line, i) => <Line key={i} points={line} color="#93a9bb" transparent opacity={0.1} lineWidth={0.38} />)}
      <mesh position={[0, -6.25, 0]}><sphereGeometry args={[1.9, quality.heroSegments, quality.heroSegments]} /><meshBasicMaterial color="#000000" /></mesh>
      {[2.28, 2.55, 2.9, 3.35, 4.1].map((radius, i) => <mesh key={radius} position={[0, -6.25, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius, 0.12 + i * 0.042, 30, 380]} /><meshBasicMaterial color={i < 2 ? '#fff1cf' : i < 4 ? '#e37a43' : '#8b3827'} transparent opacity={[0.95, 0.7, 0.46, 0.25, 0.1][i]} toneMapped={false} /></mesh>)}
      <Starfield count={quality.stars} radius={170} opacity={0.52} />
    </group>
  );
}

function MultiverseScene({ quality }) {
  const bubbles = useMemo(() => Array.from({ length: 28 }, (_, i) => ({ position: [(seeded(i + 1) - 0.5) * 26, (seeded(i + 40) - 0.5) * 17, (seeded(i + 90) - 0.5) * 22], scale: 0.65 + seeded(i + 130) * 2.7, color: new THREE.Color().setHSL(0.55 + seeded(i + 180) * 0.28, 0.45, 0.62) })), []);
  return <group>{bubbles.map((bubble, i) => <mesh key={i} position={bubble.position} scale={bubble.scale}><sphereGeometry args={[1, 64, 64]} /><meshPhysicalMaterial color={bubble.color} transparent opacity={0.075} transmission={0.92} thickness={1.4} roughness={0.06} iridescence={0.7} side={THREE.DoubleSide} /></mesh>)}<Starfield count={quality.stars} radius={170} opacity={0.2} /></group>;
}

function RealityScene({ quality }) {
  const shells = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ scale: 1.15 + i * 0.4, rotation: [seeded(i + 1) * Math.PI, seeded(i + 30) * Math.PI, seeded(i + 60) * Math.PI] })), []);
  return <group>{shells.map((shell, i) => <mesh key={i} scale={shell.scale} rotation={shell.rotation}><icosahedronGeometry args={[1, i % 3 + 1]} /><meshPhysicalMaterial color={i % 2 ? '#b9c0ff' : '#f0d8ff'} wireframe transparent opacity={0.055 + (i % 5) * 0.008} /></mesh>)}<Starfield count={quality.stars} radius={170} opacity={0.14} /></group>;
}

export const CGI_SCENES = {
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
