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

function useMobileViewport() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 700px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 700px)');
    const update = () => setMobile(query.matches);
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  return mobile;
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
      loaded.anisotropy = 12;
      setTexture(loaded);
    }, undefined, () => undefined);
    return () => { active = false; };
  }, [url]);
  return texture;
}

function CameraRig({ progress, pointer, reducedMotion, mobile }) {
  const { camera } = useThree();
  const previousTarget = useRef(-progress * SECTION_SPACING + 14);

  useFrame((_, delta) => {
    const targetZ = -progress * SECTION_SPACING + 14;
    const active = SCALE_SECTIONS[Math.max(0, Math.min(SCALE_SECTIONS.length - 1, Math.round(progress)))];
    const ease = reducedMotion ? 1 : 1 - Math.exp(-delta * (mobile ? 7.5 : 3.6));
    const nextZ = THREE.MathUtils.lerp(camera.position.z, targetZ, ease);

    if (targetZ < previousTarget.current) camera.position.z = Math.min(camera.position.z, nextZ);
    else if (targetZ > previousTarget.current) camera.position.z = Math.max(camera.position.z, nextZ);
    else camera.position.z = nextZ;

    previousTarget.current = targetZ;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.current.x * (mobile ? 0.55 : 1.8), ease * 0.7);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.current.y * (mobile ? 0.35 : 1.1), ease * 0.7);
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, mobile ? 0 : active.camera.roll, ease * 0.55);
    camera.fov = THREE.MathUtils.lerp(camera.fov, mobile ? 46 : active.camera.fov, ease * 0.45);
    camera.updateProjectionMatrix();
    camera.lookAt(pointer.current.x * (mobile ? 0.12 : 0.5), pointer.current.y * (mobile ? 0.08 : 0.3), targetZ - 14);
  });
  return null;
}

function StellarSurface({ radius = 4, color = '#ffb45c' }) {
  const material = useRef();
  useFrame((state) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) },
  }), [color]);

  return (
    <mesh>
      <sphereGeometry args={[radius, 128, 128]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;
          varying vec3 vNormal;
          varying vec3 vPosition;
          float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453123); }
          float noise(vec3 p) {
            vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
            return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
          }
          float fbm(vec3 p){ float v=0.0; float a=.5; for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;} return v; }
          void main() {
            vec3 p = normalize(vPosition) * 7.0;
            float granulation = fbm(p + vec3(0.0, uTime * 0.055, 0.0));
            float cells = smoothstep(0.38, 0.78, granulation);
            float limb = pow(max(dot(vNormal, vec3(0.0,0.0,1.0)), 0.0), 0.28);
            vec3 hot = mix(uColor * 0.62, vec3(1.35, 0.93, 0.52), cells);
            vec3 finalColor = hot * (0.62 + limb * 0.92);
            gl_FragColor = vec4(finalColor, 1.0);
          }
        `}
      />
      <pointLight color={color} intensity={220} distance={90} decay={2} />
    </mesh>
  );
}

function Corona({ radius = 4.35, color = '#ffc980' }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 96, 96]} />
      <meshBasicMaterial color={color} transparent opacity={0.085} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function Sun({ radius = 4, color = '#ffb45c' }) {
  return <group><StellarSurface radius={radius} color={color} /><Corona radius={radius * 1.09} color={color} /></group>;
}

function Atmosphere({ radius = 4.18, color = '#6ec8ff' }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 128, 128]} />
      <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

function Earth({ connected = false, industrial = false }) {
  const earthHigh = useOptionalTexture(NASA_TEXTURES.earthHigh);
  const earthLow = useOptionalTexture(NASA_TEXTURES.earthLow);
  const night = useOptionalTexture(NASA_TEXTURES.earthNight);
  const texture = earthHigh || earthLow;
  const group = useRef();
  useFrame((_, delta) => { if (group.current) group.current.rotation.y += delta * 0.018; });

  const nodes = useMemo(() => Array.from({ length: connected ? 34 : 0 }, (_, index) => {
    const phi = Math.acos(2 * seeded(index + 10) - 1);
    const theta = seeded(index + 90) * Math.PI * 2;
    return new THREE.Vector3(4.12 * Math.sin(phi) * Math.cos(theta), 4.12 * Math.cos(phi), 4.12 * Math.sin(phi) * Math.sin(theta));
  }), [connected]);

  return (
    <group ref={group} rotation={[0.14, -0.7, -0.05]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[4, 192, 192]} />
        <meshStandardMaterial map={texture} color={texture ? '#ffffff' : '#28618f'} roughness={0.86} metalness={0} />
      </mesh>
      {night && (
        <mesh scale={1.001}>
          <sphereGeometry args={[4, 160, 160]} />
          <meshBasicMaterial map={night} transparent opacity={0.24} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      <mesh scale={1.008} rotation={[0.03, 0.18, 0.01]}>
        <sphereGeometry args={[4.035, 160, 160]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.065} roughness={1} depthWrite={false} />
      </mesh>
      <Atmosphere />
      {connected && nodes.map((node, index) => (
        <React.Fragment key={index}>
          <mesh position={node}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color="#72e8ff" toneMapped={false} />
          </mesh>
          {index > 0 && index % 2 === 0 && <Line points={[nodes[index - 1], node]} color="#55ddff" transparent opacity={0.22} lineWidth={0.55} />}
        </React.Fragment>
      ))}
      {industrial && [4.85, 5.35, 6.05].map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2 + index * 0.21, index * 0.48, 0]}>
          <torusGeometry args={[radius, 0.012, 8, 320]} />
          <meshBasicMaterial color="#91ffe3" transparent opacity={0.28} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function PresentScene() {
  return <group><Earth /><mesh position={[7, 2, -3]}><sphereGeometry args={[0.9, 72, 72]} /><meshStandardMaterial color="#777b83" roughness={1} /></mesh></group>;
}
function ConnectedEarthScene() { return <Earth connected />; }
function PlanetaryScene() {
  const satellites = useMemo(() => Array.from({ length: 110 }, (_, i) => ({
    a: seeded(i + 11) * Math.PI * 2,
    r: 5.1 + seeded(i + 71) * 3.2,
    y: (seeded(i + 151) - 0.5) * 1.5,
    s: 0.65 + seeded(i + 270) * 0.9,
  })), []);
  return <group><Earth connected industrial />{satellites.map((sat, index) => <mesh key={index} position={[Math.cos(sat.a) * sat.r, sat.y, Math.sin(sat.a) * sat.r]} rotation={[0, -sat.a, 0]} scale={sat.s}><boxGeometry args={[0.12, 0.025, 0.19]} /><meshStandardMaterial color="#d8fff4" metalness={0.92} roughness={0.18} /></mesh>)}</group>;
}

function DysonScene() {
  const collectors = useMemo(() => Array.from({ length: 900 }, (_, i) => {
    const inclination = (seeded(i + 7) - 0.5) * 0.48;
    const theta = seeded(i + 500) * Math.PI * 2;
    const radius = 7.2 + Math.pow(seeded(i + 900), 0.55) * 7.5;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    const y = Math.sin(theta * 1.7 + i) * inclination * radius * 0.35;
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(-x, -y, -z).normalize());
    return { position: [x, y, z], quaternion, size: 0.16 + seeded(i + 1400) * 0.34 };
  }), []);

  return (
    <group>
      <Sun radius={3.65} />
      {[7.8, 9.5, 11.8, 14.2].map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2 + (index - 1.5) * 0.08, index * 0.35, 0]}>
          <torusGeometry args={[radius, 0.016, 6, 420]} />
          <meshBasicMaterial color="#7f9ca8" transparent opacity={0.12} />
        </mesh>
      ))}
      {collectors.map((collector, index) => (
        <mesh key={index} position={collector.position} quaternion={collector.quaternion} scale={collector.size}>
          <boxGeometry args={[1.25, 0.035, 0.78]} />
          <meshPhysicalMaterial color={index % 7 === 0 ? '#d6c9a8' : '#5d7180'} metalness={0.94} roughness={0.2} clearcoat={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function GalaxyScene() {
  const { positions, colors } = useMemo(() => {
    const count = 42000;
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const warm = new THREE.Color('#ffd7a6');
    const cool = new THREE.Color('#8fb7ff');
    const dust = new THREE.Color('#593e34');
    for (let i = 0; i < count; i += 1) {
      const arm = i % 4;
      const radius = Math.pow(seeded(i + 10), 0.5) * 17;
      const angle = radius * 0.56 + arm * Math.PI / 2 + (seeded(i + 100) - 0.5) * (0.42 + radius * 0.035);
      const thickness = Math.max(0.16, 1.25 - radius * 0.055);
      p[i * 3] = Math.cos(angle) * radius + (seeded(i + 901) - 0.5) * 0.35;
      p[i * 3 + 1] = (seeded(i + 500) - 0.5) * thickness;
      p[i * 3 + 2] = Math.sin(angle) * radius + (seeded(i + 1201) - 0.5) * 0.35;
      const color = radius < 4 ? warm : seeded(i + 2200) > 0.62 ? cool : radius > 12 && seeded(i + 2500) > 0.85 ? dust : warm.clone().lerp(cool, 0.35);
      c.set([color.r, color.g, color.b], i * 3);
    }
    return { positions: p, colors: c };
  }, []);
  const ref = useRef();
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.006; });
  return (
    <group ref={ref} rotation={[0.38, 0, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.043} vertexColors transparent opacity={0.82} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 13.5, 256]} />
        <meshBasicMaterial color="#3d2a24" transparent opacity={0.11} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Sun radius={0.92} color="#fff1cf" />
    </group>
  );
}

function CosmicWebScene() {
  const nodes = useMemo(() => Array.from({ length: 190 }, (_, i) => new THREE.Vector3((seeded(i + 1) - 0.5) * 32, (seeded(i + 301) - 0.5) * 19, (seeded(i + 701) - 0.5) * 28)), []);
  const links = useMemo(() => {
    const result = [];
    nodes.forEach((node, i) => {
      nodes.slice(i + 1).map((other) => ({ other, d: node.distanceTo(other) })).sort((a, b) => a.d - b.d).slice(0, 3).forEach(({ other, d }) => { if (d < 7.5) result.push([node, other]); });
    });
    return result;
  }, [nodes]);
  return <group>{links.map((line, i) => <Line key={i} points={line} color="#7a8fc9" transparent opacity={0.1} lineWidth={0.35} />)}{nodes.map((node, i) => <mesh key={i} position={node}><sphereGeometry args={[0.06 + seeded(i + 88) * 0.14, 10, 10]} /><meshBasicMaterial color={i % 11 === 0 ? '#f0e8ff' : '#9eabcf'} transparent opacity={0.72} toneMapped={false} /></mesh>)}</group>;
}

function MultiverseScene() {
  const bubbles = useMemo(() => Array.from({ length: 30 }, (_, i) => ({ p: [(seeded(i + 2) - 0.5) * 26, (seeded(i + 202) - 0.5) * 16, (seeded(i + 402) - 0.5) * 21], s: 0.7 + seeded(i + 802) * 2.5, c: new THREE.Color().setHSL(0.61 + seeded(i + 1200) * 0.18, 0.42, 0.56) })), []);
  return <group>{bubbles.map((bubble, i) => <mesh key={i} position={bubble.p} scale={bubble.s}><sphereGeometry args={[1, 72, 72]} /><meshPhysicalMaterial color={bubble.c} transparent opacity={0.075} transmission={0.92} thickness={0.9} roughness={0.08} iridescence={0.5} side={THREE.DoubleSide} /></mesh>)}</group>;
}

function RealityScene() {
  const rings = useMemo(() => Array.from({ length: 22 }, (_, i) => ({ r: 1.5 + i * 0.52, rot: [seeded(i + 10) * Math.PI, seeded(i + 30) * Math.PI, seeded(i + 60) * Math.PI] })), []);
  return <group>{rings.map((ring, i) => <mesh key={i} rotation={ring.rot}><torusKnotGeometry args={[ring.r, 0.012 + i * 0.0006, 220, 10, 2 + i % 4, 3 + i % 5]} /><meshBasicMaterial color={i % 2 ? '#d7b8ff' : '#ffffff'} transparent opacity={0.19} toneMapped={false} /></mesh>)}<mesh><icosahedronGeometry args={[2.2, 6]} /><meshPhysicalMaterial color="#e8d8ff" wireframe transparent opacity={0.12} /></mesh></group>;
}

function MaterialScene() {
  const blocks = useMemo(() => Array.from({ length: 144 }, (_, i) => ({ p: [((i % 12) - 5.5) * 0.8, (Math.floor(i / 12) % 6 - 2.5) * 0.8, (Math.floor(i / 72) - 0.5) * 2.1], h: 0.45 + seeded(i + 5) * 1.25 })), []);
  return <group rotation={[0.2, 0.5, 0]}>{blocks.map((block, i) => <mesh key={i} position={block.p} scale={[0.63, block.h, 0.63]}><boxGeometry /><meshStandardMaterial color={i % 5 ? '#69717a' : '#c58a63'} metalness={0.78} roughness={0.28} /></mesh>)}</group>;
}

function BiologyScene() {
  const helix = useMemo(() => Array.from({ length: 190 }, (_, i) => {
    const t = (i / 189) * Math.PI * 11 - Math.PI * 5.5;
    return { a: [Math.cos(t) * 2.25, t * 0.29, Math.sin(t) * 2.25], b: [Math.cos(t + Math.PI) * 2.25, t * 0.29, Math.sin(t + Math.PI) * 2.25] };
  }), []);
  return <group rotation={[0.1, 0.4, Math.PI / 2]}>{helix.map((pair, i) => <React.Fragment key={i}><mesh position={pair.a}><sphereGeometry args={[0.085, 14, 14]} /><meshStandardMaterial color="#b14f70" roughness={0.52} /></mesh><mesh position={pair.b}><sphereGeometry args={[0.085, 14, 14]} /><meshStandardMaterial color="#4a8fa5" roughness={0.52} /></mesh>{i % 5 === 0 && <Line points={[pair.a, pair.b]} color="#b8b2c6" transparent opacity={0.34} lineWidth={0.75} />}</React.Fragment>)}</group>;
}

function MolecularScene() {
  const atoms = useMemo(() => Array.from({ length: 42 }, (_, i) => ({ p: [(seeded(i + 2) - 0.5) * 9, (seeded(i + 52) - 0.5) * 7, (seeded(i + 102) - 0.5) * 6], r: 0.16 + seeded(i + 300) * 0.24, c: i % 7 === 0 ? '#bb3f4e' : i % 5 === 0 ? '#335e9f' : i % 3 === 0 ? '#d6d6d8' : '#45484e' })), []);
  const bonds = useMemo(() => atoms.flatMap((atom, i) => atoms.slice(i + 1).map((other) => ({ a: atom.p, b: other.p, d: new THREE.Vector3(...atom.p).distanceTo(new THREE.Vector3(...other.p)) })).filter((bond) => bond.d < 2.15).slice(0, 2)), [atoms]);
  return <group>{bonds.map((bond, i) => <Line key={i} points={[bond.a, bond.b]} color="#8a8d94" transparent opacity={0.42} lineWidth={0.9} />)}{atoms.map((atom, i) => <mesh key={i} position={atom.p}><sphereGeometry args={[atom.r, 40, 40]} /><meshPhysicalMaterial color={atom.c} roughness={0.38} metalness={0.02} clearcoat={0.42} /></mesh>)}</group>;
}

function AtomicScene() {
  const cloud = useMemo(() => {
    const count = 18000;
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const r = -Math.log(Math.max(0.0001, 1 - seeded(i + 10))) * 1.25;
      const theta = seeded(i + 50) * Math.PI * 2;
      const phi = Math.acos(2 * seeded(i + 70) - 1);
      const lobe = i % 3;
      const squash = lobe === 0 ? [1, 0.5, 0.5] : lobe === 1 ? [0.5, 1, 0.5] : [0.5, 0.5, 1];
      array[i * 3] = r * Math.sin(phi) * Math.cos(theta) * squash[0];
      array[i * 3 + 1] = r * Math.cos(phi) * squash[1];
      array[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) * squash[2];
    }
    return array;
  }, []);
  return <group><points><bufferGeometry><bufferAttribute attach="attributes-position" args={[cloud, 3]} /></bufferGeometry><pointsMaterial size={0.026} color="#8ea8ff" transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} /></points><mesh><sphereGeometry args={[0.42, 48, 48]} /><meshStandardMaterial color="#d8e2ff" emissive="#5b6c9a" emissiveIntensity={1.2} roughness={0.5} /></mesh></group>;
}

function NuclearScene() {
  const nucleons = useMemo(() => Array.from({ length: 118 }, (_, i) => {
    const radius = Math.cbrt(seeded(i + 1)) * 3.15;
    const theta = seeded(i + 100) * Math.PI * 2;
    const phi = Math.acos(2 * seeded(i + 200) - 1);
    return { p: [radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)], proton: i % 2 === 0 };
  }), []);
  return <group>{nucleons.map((n, i) => <mesh key={i} position={n.p}><sphereGeometry args={[0.34, 28, 28]} /><meshStandardMaterial color={n.proton ? '#9f3445' : '#2e6f90'} emissive={n.proton ? '#28080d' : '#061d29'} emissiveIntensity={0.55} roughness={0.56} /></mesh>)}</group>;
}

function ParticleScene() {
  const tracks = useMemo(() => Array.from({ length: 42 }, (_, i) => {
    const angle = seeded(i + 1) * Math.PI * 2;
    const bend = (seeded(i + 90) - 0.5) * 2.4;
    return Array.from({ length: 44 }, (_, step) => {
      const t = step / 43;
      const r = t * 10;
      return [Math.cos(angle + bend * t) * r, (seeded(i + 200) - 0.5) * t * 7, Math.sin(angle + bend * t) * r];
    });
  }), []);
  return <group>{[2,3.4,5,6.8,8.7].map((r,i)=><mesh key={r} rotation={[Math.PI/2,0,0]}><torusGeometry args={[r,0.055,12,240]} /><meshStandardMaterial color={i%2?'#4f6268':'#2f3c42'} metalness={0.86} roughness={0.24} /></mesh>)}{tracks.map((track,i)=><Line key={i} points={track} color={i%5===0?'#d99468':'#82b7ae'} transparent opacity={0.54} lineWidth={0.85} />)}<mesh><sphereGeometry args={[0.18,32,32]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh></group>;
}

function SpacetimeScene() {
  const lines = useMemo(() => {
    const result=[];
    for(let x=-12;x<=12;x+=0.65){const points=[];for(let z=-12;z<=12;z+=0.28){const d=Math.sqrt(x*x+z*z);points.push([x,-5.2/(d+0.72),z]);}result.push(points);}
    for(let z=-12;z<=12;z+=0.65){const points=[];for(let x=-12;x<=12;x+=0.28){const d=Math.sqrt(x*x+z*z);points.push([x,-5.2/(d+0.72),z]);}result.push(points);}
    return result;
  },[]);
  return <group rotation={[0.78,0,0]}>{lines.map((line,i)=><Line key={i} points={line} color="#aebdc4" transparent opacity={0.16} lineWidth={0.4} />)}<mesh position={[0,-5.1,0]}><sphereGeometry args={[1.72,96,96]} /><meshBasicMaterial color="#000000" /></mesh><mesh position={[0,-5.1,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[2.55,0.12,28,320]} /><meshBasicMaterial color="#e9f7ff" transparent opacity={0.56} toneMapped={false} /></mesh></group>;
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

function SceneLayer({ progress, mobile }) {
  return SCALE_SECTIONS.map((section, index) => {
    if (Math.abs(index - progress) > 1.5) return null;
    const Scene = SCENES[section.scene];
    const distance = Math.abs(index - progress);
    const sceneScale = mobile ? 1 : 1 - Math.min(distance, 1) * 0.055;
    return <group key={section.id} position={[0, 0, -index * SECTION_SPACING]} scale={sceneScale}><Scene /></group>;
  });
}

export default function ScaleWorld({ progress, pointer, reducedMotion, onReady, onError }) {
  const mobile = useMobileViewport();
  return (
    <Canvas
      className="scale-world-canvas"
      camera={{ position: [0, 0, -progress * SECTION_SPACING + 14], fov: mobile ? 46 : 44, near: 0.05, far: SECTION_SPACING * 4 }}
      dpr={[1, mobile ? 1.5 : 2]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', logarithmicDepthBuffer: true }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.02;
        onReady?.();
        gl.domElement.addEventListener('webglcontextlost', (event) => { event.preventDefault(); onError?.(); }, { once: true });
      }}
    >
      <color attach="background" args={['#010104']} />
      <fogExp2 attach="fog" args={['#010104', mobile ? 0.01 : 0.007]} />
      <ambientLight intensity={0.08} />
      <directionalLight position={[8, 7, 12]} intensity={3.6} color="#fff4dc" castShadow />
      <Stars radius={140} depth={90} count={mobile ? 4500 : 8000} factor={2.8} saturation={0.08} fade speed={0.16} />
      <CameraRig progress={progress} pointer={pointer} reducedMotion={reducedMotion} mobile={mobile} />
      <SceneLayer progress={progress} mobile={mobile} />
      <EffectComposer multisampling={mobile ? 0 : 4}>
        <Bloom intensity={0.52} luminanceThreshold={0.83} luminanceSmoothing={0.18} mipmapBlur />
        <Noise opacity={0.009} />
        <Vignette offset={0.22} darkness={0.66} />
      </EffectComposer>
    </Canvas>
  );
}
