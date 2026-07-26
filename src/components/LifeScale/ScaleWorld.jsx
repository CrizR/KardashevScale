import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { NASA_TEXTURES, SCALE_SECTIONS, SECTION_SPACING } from './scaleConfig';

function seeded(index) {
  const x = Math.sin(index * 999.91) * 43758.5453;
  return x - Math.floor(x);
}

function useOptionalTexture(url) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    let active = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(url, (loaded) => {
      if (!active) return;
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.anisotropy = 8;
      setTexture(loaded);
    }, undefined, () => undefined);
    return () => { active = false; };
  }, [url]);
  return texture;
}

function CameraRig({ progress, pointer, reducedMotion }) {
  const { camera } = useThree();
  useFrame((state, delta) => {
    const targetZ = -progress * SECTION_SPACING + 14;
    const active = SCALE_SECTIONS[Math.max(0, Math.min(SCALE_SECTIONS.length - 1, Math.round(progress)))];
    const ease = reducedMotion ? 1 : 1 - Math.exp(-delta * 3.6);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, ease);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.current.x * 1.8, ease * 0.7);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.current.y * 1.1, ease * 0.7);
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, active.camera.roll, ease * 0.55);
    camera.fov = THREE.MathUtils.lerp(camera.fov, active.camera.fov, ease * 0.45);
    camera.updateProjectionMatrix();
    camera.lookAt(pointer.current.x * 0.5, pointer.current.y * 0.3, targetZ - 14);
  });
  return null;
}

function Sun({ radius = 4, color = '#ffb45c' }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.material.emissiveIntensity = 3.5 + Math.sin(state.clock.elapsedTime * 1.7) * 0.35;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[radius, 96, 96]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3.5} roughness={0.75} />
      <pointLight color={color} intensity={180} distance={70} decay={2} />
    </mesh>
  );
}

function Atmosphere({ radius = 4.15, color = '#6ec8ff' }) {
  return (
    <mesh scale={1.01}>
      <sphereGeometry args={[radius, 96, 96]} />
      <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function Earth({ connected = false, industrial = false }) {
  const earthHigh = useOptionalTexture(NASA_TEXTURES.earthHigh);
  const earthLow = useOptionalTexture(NASA_TEXTURES.earthLow);
  const texture = earthHigh || earthLow;
  const group = useRef();
  useFrame((_, delta) => { if (group.current) group.current.rotation.y += delta * 0.035; });
  const nodes = useMemo(() => Array.from({ length: connected ? 26 : 0 }, (_, index) => {
    const phi = Math.acos(2 * seeded(index + 10) - 1);
    const theta = seeded(index + 90) * Math.PI * 2;
    return new THREE.Vector3(
      4.12 * Math.sin(phi) * Math.cos(theta),
      4.12 * Math.cos(phi),
      4.12 * Math.sin(phi) * Math.sin(theta),
    );
  }), [connected]);
  return (
    <group ref={group} rotation={[0.14, -0.7, -0.05]}>
      <mesh>
        <sphereGeometry args={[4, 128, 128]} />
        <meshStandardMaterial map={texture} color={texture ? '#ffffff' : '#28618f'} roughness={0.82} metalness={0.02} />
      </mesh>
      <mesh scale={1.006} rotation={[0, 0.12, 0]}>
        <sphereGeometry args={[4.03, 96, 96]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.07} roughness={1} depthWrite={false} />
      </mesh>
      <Atmosphere />
      {connected && nodes.map((node, index) => (
        <React.Fragment key={index}>
          <mesh position={node}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color="#72e8ff" toneMapped={false} />
          </mesh>
          {index > 0 && index % 2 === 0 && (
            <Line points={[nodes[index - 1], node]} color="#55ddff" transparent opacity={0.3} lineWidth={0.7} />
          )}
        </React.Fragment>
      ))}
      {industrial && [4.7, 5.2, 5.8].map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2 + index * 0.25, index * 0.5, 0]}>
          <torusGeometry args={[radius, 0.018, 8, 240]} />
          <meshBasicMaterial color="#91ffe3" transparent opacity={0.38} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function PresentScene() {
  return <group><Earth /><mesh position={[7, 2, -3]}><sphereGeometry args={[0.9, 48, 48]} /><meshStandardMaterial color="#777b83" roughness={1} /></mesh></group>;
}
function ConnectedEarthScene() { return <Earth connected />; }
function PlanetaryScene() {
  const satellites = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    a: seeded(i + 11) * Math.PI * 2,
    r: 5.1 + seeded(i + 71) * 2.8,
    y: (seeded(i + 151) - 0.5) * 1.2,
  })), []);
  return <group><Earth connected industrial />{satellites.map((sat, index) => <mesh key={index} position={[Math.cos(sat.a) * sat.r, sat.y, Math.sin(sat.a) * sat.r]}><boxGeometry args={[0.1, 0.045, 0.16]} /><meshStandardMaterial color="#d8fff4" metalness={0.8} roughness={0.25} /></mesh>)}</group>;
}

function DysonScene() {
  const panels = useMemo(() => Array.from({ length: 420 }, (_, i) => {
    const phi = Math.acos(2 * seeded(i + 7) - 1);
    const theta = seeded(i + 500) * Math.PI * 2;
    const radius = 7.5 + seeded(i + 900) * 5;
    return { position: [radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)], rotation: [phi, theta, seeded(i + 1200) * Math.PI] };
  }), []);
  return <group><Sun radius={3.8} />{panels.map((panel, i) => <mesh key={i} position={panel.position} rotation={panel.rotation}><boxGeometry args={[0.32, 0.018, 0.2]} /><meshStandardMaterial color="#a7c7d8" metalness={0.92} roughness={0.16} /></mesh>)}</group>;
}

function GalaxyScene() {
  const points = useMemo(() => {
    const array = new Float32Array(18000 * 3);
    for (let i = 0; i < 18000; i += 1) {
      const arm = i % 4;
      const radius = Math.pow(seeded(i + 10), 0.58) * 15;
      const angle = radius * 0.72 + arm * Math.PI / 2 + (seeded(i + 100) - 0.5) * 0.7;
      array[i * 3] = Math.cos(angle) * radius;
      array[i * 3 + 1] = (seeded(i + 500) - 0.5) * (1.4 - radius * 0.045);
      array[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return array;
  }, []);
  const ref = useRef();
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.018; });
  return <group ref={ref} rotation={[0.42, 0, 0]}><points><bufferGeometry><bufferAttribute attach="attributes-position" args={[points, 3]} /></bufferGeometry><pointsMaterial size={0.055} color="#9dbdff" transparent opacity={0.84} depthWrite={false} blending={THREE.AdditiveBlending} /></points><Sun radius={1.2} color="#fff0c7" /></group>;
}

function CosmicWebScene() {
  const nodes = useMemo(() => Array.from({ length: 120 }, (_, i) => new THREE.Vector3((seeded(i + 1) - 0.5) * 28, (seeded(i + 301) - 0.5) * 17, (seeded(i + 701) - 0.5) * 24)), []);
  const links = useMemo(() => {
    const result = [];
    nodes.forEach((node, i) => {
      nodes.slice(i + 1).map((other, offset) => ({ other, d: node.distanceTo(other), j: i + offset + 1 })).sort((a, b) => a.d - b.d).slice(0, 2).forEach(({ other }) => result.push([node, other]));
    });
    return result;
  }, [nodes]);
  return <group>{links.map((line, i) => <Line key={i} points={line} color="#8097ff" transparent opacity={0.13} lineWidth={0.45} />)}{nodes.map((node, i) => <mesh key={i} position={node}><sphereGeometry args={[0.08 + seeded(i + 88) * 0.18, 12, 12]} /><meshBasicMaterial color="#d6ddff" toneMapped={false} /></mesh>)}</group>;
}

function MultiverseScene() {
  const bubbles = useMemo(() => Array.from({ length: 24 }, (_, i) => ({ p: [(seeded(i + 2) - 0.5) * 24, (seeded(i + 202) - 0.5) * 15, (seeded(i + 402) - 0.5) * 18], s: 0.8 + seeded(i + 802) * 2.3, c: new THREE.Color().setHSL(0.63 + seeded(i + 1200) * 0.18, 0.58, 0.63) })), []);
  return <group>{bubbles.map((bubble, i) => <mesh key={i} position={bubble.p} scale={bubble.s}><sphereGeometry args={[1, 48, 48]} /><meshPhysicalMaterial color={bubble.c} transparent opacity={0.12} transmission={0.8} thickness={0.6} roughness={0.12} iridescence={0.7} side={THREE.DoubleSide} /></mesh>)}</group>;
}

function RealityScene() {
  const rings = useMemo(() => Array.from({ length: 16 }, (_, i) => ({ r: 1.7 + i * 0.65, rot: [seeded(i + 10) * Math.PI, seeded(i + 30) * Math.PI, seeded(i + 60) * Math.PI] })), []);
  return <group>{rings.map((ring, i) => <mesh key={i} rotation={ring.rot}><torusKnotGeometry args={[ring.r, 0.018 + i * 0.001, 180, 12, 2 + i % 4, 3 + i % 5]} /><meshBasicMaterial color={i % 2 ? '#d7b8ff' : '#ffffff'} transparent opacity={0.34} toneMapped={false} /></mesh>)}<mesh><icosahedronGeometry args={[2.2, 5]} /><meshPhysicalMaterial color="#e8d8ff" wireframe transparent opacity={0.22} /></mesh></group>;
}

function MaterialScene() {
  const blocks = useMemo(() => Array.from({ length: 90 }, (_, i) => ({ p: [((i % 9) - 4) * 1.05, (Math.floor(i / 9) % 5 - 2) * 1.05, (Math.floor(i / 45) - 0.5) * 2.4], h: 0.35 + seeded(i + 5) * 1.4 })), []);
  return <group rotation={[0.2, 0.5, 0]}>{blocks.map((block, i) => <mesh key={i} position={block.p} scale={[0.82, block.h, 0.82]}><boxGeometry /><meshStandardMaterial color={i % 4 ? '#8f99a3' : '#ffbd8d'} metalness={0.82} roughness={0.22} /></mesh>)}</group>;
}

function BiologyScene() {
  const helix = useMemo(() => Array.from({ length: 160 }, (_, i) => {
    const t = (i / 159) * Math.PI * 10 - Math.PI * 5;
    return { a: [Math.cos(t) * 2.3, t * 0.31, Math.sin(t) * 2.3], b: [Math.cos(t + Math.PI) * 2.3, t * 0.31, Math.sin(t + Math.PI) * 2.3] };
  }), []);
  return <group rotation={[0.1, 0.4, Math.PI / 2]}>{helix.map((pair, i) => <React.Fragment key={i}><mesh position={pair.a}><sphereGeometry args={[0.105, 12, 12]} /><meshStandardMaterial color="#ff72ad" emissive="#68163c" emissiveIntensity={0.8} /></mesh><mesh position={pair.b}><sphereGeometry args={[0.105, 12, 12]} /><meshStandardMaterial color="#8ce8ff" emissive="#14536c" emissiveIntensity={0.8} /></mesh>{i % 6 === 0 && <Line points={[pair.a, pair.b]} color="#e4d7ff" transparent opacity={0.45} lineWidth={1} />}</React.Fragment>)}</group>;
}

function MolecularScene() {
  const atoms = useMemo(() => Array.from({ length: 36 }, (_, i) => ({ p: [(seeded(i + 2) - 0.5) * 9, (seeded(i + 52) - 0.5) * 7, (seeded(i + 102) - 0.5) * 6], r: 0.18 + seeded(i + 300) * 0.28, c: i % 5 === 0 ? '#ff6b88' : i % 3 === 0 ? '#72b7ff' : '#e8e8ef' })), []);
  const bonds = useMemo(() => atoms.flatMap((atom, i) => atoms.slice(i + 1).map((other) => ({ a: atom.p, b: other.p, d: new THREE.Vector3(...atom.p).distanceTo(new THREE.Vector3(...other.p)) })).filter((bond) => bond.d < 2.4).slice(0, 2)), [atoms]);
  return <group>{bonds.map((bond, i) => <Line key={i} points={[bond.a, bond.b]} color="#c9b3ff" transparent opacity={0.34} lineWidth={1.2} />)}{atoms.map((atom, i) => <mesh key={i} position={atom.p}><sphereGeometry args={[atom.r, 32, 32]} /><meshPhysicalMaterial color={atom.c} roughness={0.28} metalness={0.05} clearcoat={0.7} /></mesh>)}</group>;
}

function AtomicScene() {
  const cloud = useMemo(() => {
    const array = new Float32Array(9000 * 3);
    for (let i = 0; i < 9000; i += 1) {
      const radius = Math.abs((seeded(i + 10) + seeded(i + 20) + seeded(i + 30)) / 3 - 0.5) * 10;
      const theta = seeded(i + 50) * Math.PI * 2;
      const phi = Math.acos(2 * seeded(i + 70) - 1);
      array[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      array[i * 3 + 1] = radius * Math.cos(phi) * 0.55;
      array[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return array;
  }, []);
  return <group><points><bufferGeometry><bufferAttribute attach="attributes-position" args={[cloud, 3]} /></bufferGeometry><pointsMaterial size={0.035} color="#8ea8ff" transparent opacity={0.33} depthWrite={false} blending={THREE.AdditiveBlending} /></points><Sun radius={0.65} color="#ffffff" />{[2.7,4.5,6.2].map((r,i)=><mesh key={r} rotation={[i*.7,i*.4,i*.2]}><torusGeometry args={[r,0.015,8,180]} /><meshBasicMaterial color="#92a8ff" transparent opacity={0.26} /></mesh>)}</group>;
}

function NuclearScene() {
  const nucleons = useMemo(() => Array.from({ length: 92 }, (_, i) => {
    const radius = Math.cbrt(seeded(i + 1)) * 3.1;
    const theta = seeded(i + 100) * Math.PI * 2;
    const phi = Math.acos(2 * seeded(i + 200) - 1);
    return { p: [radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)], proton: i % 2 === 0 };
  }), []);
  return <group>{nucleons.map((n, i) => <mesh key={i} position={n.p}><sphereGeometry args={[0.38, 24, 24]} /><meshStandardMaterial color={n.proton ? '#ff6684' : '#62c7ff'} emissive={n.proton ? '#4b0b18' : '#08344b'} emissiveIntensity={0.8} roughness={0.42} /></mesh>)}{[4.4,5.2,6].map((r,i)=><mesh key={r} rotation={[i*.6,i*.4,0]}><torusGeometry args={[r,0.02,8,160]} /><meshBasicMaterial color="#73e2ff" transparent opacity={0.22} /></mesh>)}</group>;
}

function ParticleScene() {
  const tracks = useMemo(() => Array.from({ length: 28 }, (_, i) => {
    const angle = seeded(i + 1) * Math.PI * 2;
    const bend = (seeded(i + 90) - 0.5) * 2.4;
    return Array.from({ length: 32 }, (_, step) => {
      const t = step / 31;
      const r = t * 9;
      return [Math.cos(angle + bend * t) * r, (seeded(i + 200) - 0.5) * t * 6, Math.sin(angle + bend * t) * r];
    });
  }), []);
  return <group>{[2,3.4,5,6.8].map((r,i)=><mesh key={r} rotation={[Math.PI/2,0,0]}><torusGeometry args={[r,0.08,12,180]} /><meshStandardMaterial color={i%2?'#8fffe4':'#577a87'} metalness={0.85} roughness={0.2} /></mesh>)}{tracks.map((track,i)=><Line key={i} points={track} color={i%3===0?'#ff9b6b':'#8fffe4'} transparent opacity={0.72} lineWidth={1.1} />)}<Sun radius={0.28} color="#ffffff" /></group>;
}

function SpacetimeScene() {
  const lines = useMemo(() => {
    const result=[];
    for(let x=-10;x<=10;x+=0.8){const points=[];for(let z=-10;z<=10;z+=0.35){const d=Math.sqrt(x*x+z*z);points.push([x,-3.8/(d+0.65),z]);}result.push(points);}
    for(let z=-10;z<=10;z+=0.8){const points=[];for(let x=-10;x<=10;x+=0.35){const d=Math.sqrt(x*x+z*z);points.push([x,-3.8/(d+0.65),z]);}result.push(points);}
    return result;
  },[]);
  return <group rotation={[0.8,0,0]}>{lines.map((line,i)=><Line key={i} points={line} color="#d9f7ff" transparent opacity={0.24} lineWidth={0.55} />)}<mesh position={[0,-4.4,0]}><sphereGeometry args={[1.6,64,64]} /><meshBasicMaterial color="#000000" /></mesh><mesh position={[0,-4.4,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[2.4,0.22,24,200]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.7} toneMapped={false} /></mesh></group>;
}

const SCENES = {
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

function SceneLayer({ progress }) {
  return SCALE_SECTIONS.map((section, index) => {
    if (Math.abs(index - progress) > 1.6) return null;
    const Scene = SCENES[section.scene];
    const distance = Math.abs(index - progress);
    return <group key={section.id} position={[0, 0, -index * SECTION_SPACING]} scale={1 - Math.min(distance, 1) * 0.08}><Scene /></group>;
  });
}

export default function ScaleWorld({ progress, pointer, reducedMotion, onReady, onError }) {
  return (
    <Canvas
      className="scale-world-canvas"
      camera={{ position: [0, 0, -progress * SECTION_SPACING + 14], fov: 44, near: 0.05, far: SECTION_SPACING * 4 }}
      dpr={[1, typeof window !== 'undefined' && window.innerWidth > 1000 ? 2 : 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', logarithmicDepthBuffer: true }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
        onReady?.();
        gl.domElement.addEventListener('webglcontextlost', (event) => { event.preventDefault(); onError?.(); }, { once: true });
      }}
    >
      <color attach="background" args={['#010104']} />
      <fogExp2 attach="fog" args={['#010104', 0.008]} />
      <ambientLight intensity={0.12} />
      <directionalLight position={[8, 7, 12]} intensity={4.8} color="#fff4dc" />
      <Stars radius={120} depth={80} count={6000} factor={3.2} saturation={0.15} fade speed={0.25} />
      <CameraRig progress={progress} pointer={pointer} reducedMotion={reducedMotion} />
      <SceneLayer progress={progress} />
      <EffectComposer multisampling={4}>
        <Bloom intensity={0.75} luminanceThreshold={0.72} luminanceSmoothing={0.22} mipmapBlur />
        <Noise opacity={0.018} />
        <Vignette offset={0.18} darkness={0.72} />
      </EffectComposer>
    </Canvas>
  );
}
