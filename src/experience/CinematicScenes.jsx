import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Line, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { REALISM_TEXTURES } from '../components/LifeScale/realismTextures';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const SUN_VECTOR = new THREE.Vector3(0.9, 0.26, 0.7).normalize();

function seeded(index) {
  const value = Math.sin(index * 871.73 + 13.91) * 43758.5453123;
  return value - Math.floor(value);
}

function fibonacciSphere(index, count, radius = 1) {
  const y = 1 - (index / Math.max(count - 1, 1)) * 2;
  const ring = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = GOLDEN_ANGLE * index;
  return new THREE.Vector3(Math.cos(theta) * ring, y, Math.sin(theta) * ring).multiplyScalar(radius);
}

function StarBackdrop({ count = 9000, radius = 90, opacity = 0.7 }) {
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const point = fibonacciSphere(index, count, radius * (0.7 + seeded(index + 9) * 0.3));
      values.set([point.x, point.y, point.z], index * 3);
    }
    return values;
  }, [count, radius]);
  return (
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial size={0.08} color="#dbe7ff" transparent opacity={opacity} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function Atmosphere({ radius = 4.16, color = '#65bfff', intensity = 0.74 }) {
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(color) },
    uIntensity: { value: intensity },
    uSun: { value: SUN_VECTOR.clone() },
  }), [color, intensity]);
  return (
    <mesh scale={1.01}>
      <sphereGeometry args={[radius, 160, 160]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`varying vec3 n; varying vec3 p; void main(){vec4 w=modelMatrix*vec4(position,1.);p=w.xyz;n=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`}
        fragmentShader={`uniform vec3 uColor;uniform float uIntensity;uniform vec3 uSun;varying vec3 n;varying vec3 p;void main(){vec3 v=normalize(cameraPosition-p);float rim=pow(1.-abs(dot(normalize(n),v)),3.4);float day=smoothstep(-.45,.5,dot(normalize(n),normalize(uSun)));gl_FragColor=vec4(uColor*(.3+.9*day),rim*uIntensity*(.24+.76*day));}`}
      />
    </mesh>
  );
}

function EarthGlobe({ mode = 'present' }) {
  const [day, specular, normal, night, clouds] = useTexture([
    REALISM_TEXTURES.earthDay,
    REALISM_TEXTURES.earthSpecular,
    REALISM_TEXTURES.earthNormal,
    REALISM_TEXTURES.earthNight,
    REALISM_TEXTURES.earthClouds,
  ]);
  const earth = useRef();
  const cloudLayer = useRef();
  useFrame((_, delta) => {
    if (earth.current) earth.current.rotation.y += delta * 0.006;
    if (cloudLayer.current) cloudLayer.current.rotation.y += delta * 0.008;
  });

  const cityDensity = mode === 'present' ? 0.35 : mode === 'connected' ? 0.72 : 1;
  const infrastructure = mode === 'planetary';
  const satellites = useMemo(() => Array.from({ length: infrastructure ? 460 : mode === 'connected' ? 110 : 34 }, (_, index) => {
    const shell = infrastructure ? index % 6 : index % 3;
    const radius = 5.05 + shell * (infrastructure ? 0.42 : 0.26) + seeded(index + 41) * 0.18;
    const angle = seeded(index + 300) * Math.PI * 2;
    const tilt = (seeded(index + 600) - 0.5) * (infrastructure ? 0.85 : 0.35);
    return {
      p: [Math.cos(angle) * radius, Math.sin(angle * 1.7) * tilt, Math.sin(angle) * radius],
      r: [0, -angle, tilt * 0.2],
      s: infrastructure ? 0.4 + seeded(index + 900) * 1.2 : 0.18 + seeded(index + 900) * 0.45,
      habitat: infrastructure && index % 41 === 0,
    };
  }), [infrastructure, mode]);

  const cityPositions = useMemo(() => Array.from({ length: Math.round(70 * cityDensity) }, (_, index) => fibonacciSphere(index * 7 + 3, 503, 4.065)), [cityDensity]);

  return (
    <group ref={earth} rotation={[0.12, -0.8, -0.045]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[4, 256, 256]} />
        <meshPhysicalMaterial map={day} normalMap={normal} normalScale={new THREE.Vector2(0.42, 0.42)} roughnessMap={specular} roughness={0.82} metalness={0} clearcoat={0.08} clearcoatRoughness={0.76} />
      </mesh>
      <mesh scale={1.0015}>
        <sphereGeometry args={[4, 196, 196]} />
        <meshBasicMaterial map={night} transparent opacity={mode === 'present' ? 0.26 : mode === 'connected' ? 0.55 : 0.78} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={cloudLayer} scale={1.008}>
        <sphereGeometry args={[4.025, 224, 224]} />
        <meshStandardMaterial alphaMap={clouds} transparent opacity={0.42} alphaTest={0.08} depthWrite={false} roughness={1} color="#ffffff" />
      </mesh>
      <Atmosphere intensity={mode === 'planetary' ? 0.88 : 0.68} />
      {mode !== 'present' && cityPositions.map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[mode === 'planetary' ? 0.045 : 0.026, 10, 10]} />
          <meshBasicMaterial color={mode === 'planetary' ? '#8fffd7' : '#74d9ff'} toneMapped={false} />
        </mesh>
      ))}
      {satellites.map((item, index) => (
        <group key={index} position={item.p} rotation={item.r} scale={item.s}>
          <mesh><boxGeometry args={item.habitat ? [0.34, 0.12, 0.92] : [0.13, 0.035, 0.22]} /><meshStandardMaterial color={item.habitat ? '#b89e76' : '#8897a4'} metalness={0.86} roughness={0.28} /></mesh>
          {!item.habitat && <mesh position={[0.17, 0, 0]}><boxGeometry args={[0.24, 0.008, 0.3]} /><meshStandardMaterial color="#17395c" roughness={0.38} /></mesh>}
        </group>
      ))}
      {infrastructure && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[5.72, 0.045, 16, 640]} /><meshPhysicalMaterial color="#9aa7a4" metalness={0.96} roughness={0.2} /></mesh>
          <mesh rotation={[Math.PI / 2 + 0.24, 0.18, 0]}><torusGeometry args={[6.48, 0.018, 10, 520]} /><meshBasicMaterial color="#8fffd8" transparent opacity={0.32} toneMapped={false} /></mesh>
          {[0, 1, 2].map((index) => <mesh key={index} position={[0, 4.15 - index * 4.15, 0]}><cylinderGeometry args={[0.035, 0.035, 4.3, 12]} /><meshBasicMaterial color="#b5fff0" transparent opacity={0.48} toneMapped={false} /></mesh>)}
        </>
      )}
    </group>
  );
}

function PresentScene({ quality }) {
  return <group><EarthGlobe mode="present" /><mesh position={[7.2, 2, -3]}><sphereGeometry args={[0.93, 128, 128]} /><meshStandardMaterial color="#75777b" roughness={0.94} /></mesh><StarBackdrop count={quality.stars} /></group>;
}

function ConnectedEarthScene({ quality }) {
  return <group><EarthGlobe mode="connected" /><StarBackdrop count={quality.stars} /></group>;
}

function PlanetaryScene({ quality }) {
  return (
    <group>
      <EarthGlobe mode="planetary" />
      <mesh position={[10, 1.4, -5]} rotation={[0.2, -0.7, 0]}><cylinderGeometry args={[1.25, 1.25, 4.2, 48]} /><meshPhysicalMaterial color="#b8aa8a" metalness={0.82} roughness={0.24} clearcoat={0.4} /></mesh>
      <mesh position={[-11, -2.5, -9]}><torusGeometry args={[2.4, 0.28, 20, 180]} /><meshPhysicalMaterial color="#887d68" metalness={0.78} roughness={0.3} /></mesh>
      <StarBackdrop count={quality.stars} />
    </group>
  );
}

function StarSurface({ radius = 3.7 }) {
  const material = useRef();
  useFrame((state) => { if (material.current) material.current.uniforms.time.value = state.clock.elapsedTime; });
  const uniforms = useMemo(() => ({ time: { value: 0 } }), []);
  return (
    <group>
      <mesh>
        <sphereGeometry args={[radius, 196, 196]} />
        <shaderMaterial ref={material} uniforms={uniforms} vertexShader={`varying vec3 p;varying vec3 n;void main(){p=position;n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`} fragmentShader={`uniform float time;varying vec3 p;varying vec3 n;float h(vec3 q){return fract(sin(dot(q,vec3(127.1,311.7,74.7)))*43758.5453);}float no(vec3 q){vec3 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}float fb(vec3 q){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*no(q);q*=2.04;a*=.5;}return v;}void main(){vec3 q=normalize(p)*8.;float a=fb(q+vec3(0,time*.05,0));float b=fb(q*3.-vec3(time*.025,0,0));float limb=pow(max(dot(n,vec3(0,0,1)),0.),.32);vec3 c=mix(vec3(.68,.17,.025),vec3(1.35,.76,.19),smoothstep(.32,.78,a));c*=.52+1.15*limb;c-=smoothstep(.68,.92,b)*.24;gl_FragColor=vec4(c,1.);}`} />
      </mesh>
      {[1.03, 1.08, 1.16].map((scale, index) => <mesh key={scale} scale={scale}><sphereGeometry args={[radius, 96, 96]} /><meshBasicMaterial color="#ffb65c" transparent opacity={[0.08, 0.032, 0.012][index]} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>)}
      <pointLight color="#ffbf70" intensity={260} distance={120} decay={2} />
    </group>
  );
}

function DysonScene({ quality }) {
  const group = useRef();
  useFrame((_, delta) => { if (group.current) group.current.rotation.y += delta * 0.003; });
  const collectors = useMemo(() => Array.from({ length: quality.dysonCollectors }, (_, index) => {
    const shell = index % 17;
    const radius = 6.8 + Math.pow(seeded(index + 11), 0.62) * 11.5;
    const theta = seeded(index + 400) * Math.PI * 2;
    const inclination = (shell - 8) * 0.025 + (seeded(index + 700) - 0.5) * 0.12;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    const y = Math.sin(theta * (1.2 + shell * 0.03)) * radius * inclination;
    return { p: [x, y, z], r: [inclination, -theta, 0], s: 0.08 + seeded(index + 1000) * 0.25, habitat: index % 173 === 0 };
  }), [quality.dysonCollectors]);
  return (
    <group ref={group}>
      <StarSurface />
      {collectors.map((item, index) => (
        <group key={index} position={item.p} rotation={item.r} scale={item.s}>
          <mesh><boxGeometry args={item.habitat ? [2.8, 0.5, 0.8] : [1.4, 0.035, 0.9]} /><meshPhysicalMaterial color={item.habitat ? '#927e5f' : '#41546a'} metalness={0.88} roughness={0.24} clearcoat={0.34} /></mesh>
          {!item.habitat && <mesh position={[0, 0.025, 0]}><boxGeometry args={[1.15, 0.008, 0.7]} /><meshStandardMaterial color="#102a48" roughness={0.36} /></mesh>}
        </group>
      ))}
      <points>
        <sphereGeometry args={[13, 64, 64]} />
        <pointsMaterial size={0.03} color="#c68e57" transparent opacity={0.06} depthWrite={false} />
      </points>
      <StarBackdrop count={quality.stars} radius={120} />
    </group>
  );
}

function GalaxyScene({ quality }) {
  const group = useRef();
  useFrame((_, delta) => { if (group.current) group.current.rotation.y += delta * 0.0017; });
  const { stars, colors } = useMemo(() => {
    const count = quality.galaxyStars;
    const positions = new Float32Array(count * 3);
    const colorValues = new Float32Array(count * 3);
    const warm = new THREE.Color('#ffd7a8');
    const cool = new THREE.Color('#8ab4ff');
    const red = new THREE.Color('#c26c57');
    for (let index = 0; index < count; index += 1) {
      const halo = index < count * 0.08;
      const bulge = !halo && index < count * 0.27;
      let x; let y; let z;
      if (halo) {
        const point = fibonacciSphere(index, Math.ceil(count * 0.08), 8 + seeded(index + 80) * 15);
        x = point.x; y = point.y * 0.48; z = point.z;
      } else if (bulge) {
        const radius = Math.pow(seeded(index + 2), 1.8) * 5.2;
        const point = fibonacciSphere(index, count, radius);
        x = point.x * 1.2; y = point.y * 0.45; z = point.z * 1.2;
      } else {
        const arm = index % 5;
        const radius = 2.5 + Math.pow(seeded(index + 10), 0.72) * 20;
        const branch = seeded(index + 91) > 0.84 ? 0.55 : 0;
        const angle = radius * 0.44 + arm * Math.PI * 0.4 + branch + (seeded(index + 200) - 0.5) * (0.34 + radius * 0.028);
        x = Math.cos(angle) * radius + (seeded(index + 500) - 0.5) * 0.72;
        z = Math.sin(angle) * radius + (seeded(index + 900) - 0.5) * 0.72;
        y = (seeded(index + 1300) - 0.5) * Math.max(0.18, 1.4 - radius * 0.05);
      }
      positions.set([x, y, z], index * 3);
      const random = seeded(index + 1700);
      const color = bulge ? warm : random > 0.78 ? cool : random > 0.66 ? red : warm.clone().lerp(cool, 0.35);
      colorValues.set([color.r, color.g, color.b], index * 3);
    }
    return { stars: positions, colors: colorValues };
  }, [quality.galaxyStars]);
  return (
    <group ref={group} rotation={[0.46, 0, -0.08]}>
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars, 3]} /><bufferAttribute attach="attributes-color" args={[colors, 3]} /></bufferGeometry><pointsMaterial size={0.052} vertexColors transparent opacity={0.84} depthWrite={false} blending={THREE.AdditiveBlending} /></points>
      {[5.5, 9.5, 14.5].map((radius, index) => <mesh key={radius} rotation={[Math.PI / 2, 0, 0]}><ringGeometry args={[radius - 1.2, radius + 1.2, 300]} /><meshBasicMaterial color={index === 0 ? '#4b2c21' : '#201714'} transparent opacity={[0.18, 0.11, 0.06][index]} side={THREE.DoubleSide} depthWrite={false} /></mesh>)}
      <mesh scale={[1.4, 0.5, 1.4]}><sphereGeometry args={[2.4, 96, 96]} /><meshBasicMaterial color="#ffe2b7" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <StarBackdrop count={quality.stars} radius={160} opacity={0.45} />
    </group>
  );
}

function MiniGalaxy({ seed, scale = 1 }) {
  const positions = useMemo(() => {
    const count = 220;
    const values = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const arm = index % 3;
      const radius = Math.pow(seeded(seed + index), 0.7) * scale;
      const angle = radius * 6 + arm * Math.PI * 0.66 + seeded(seed + index + 100) * 0.5;
      values.set([Math.cos(angle) * radius, (seeded(seed + index + 200) - 0.5) * scale * 0.08, Math.sin(angle) * radius], index * 3);
    }
    return values;
  }, [scale, seed]);
  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial size={0.025 * scale} color="#d9e5ff" transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} /></points>;
}

function CosmicWebScene({ quality }) {
  const nodes = useMemo(() => Array.from({ length: quality.cosmicNodes }, (_, index) => {
    const cluster = index % 11;
    const center = new THREE.Vector3((seeded(cluster + 10) - 0.5) * 34, (seeded(cluster + 40) - 0.5) * 18, (seeded(cluster + 80) - 0.5) * 30);
    const scatter = fibonacciSphere(index, quality.cosmicNodes, Math.pow(seeded(index + 500), 2.2) * 5.5);
    return center.add(scatter);
  }), [quality.cosmicNodes]);
  const links = useMemo(() => nodes.flatMap((node, index) => nodes.slice(index + 1).map((other) => ({ other, d: node.distanceTo(other) })).sort((a, b) => a.d - b.d).slice(0, 2).filter(({ d }) => d < 5.8).map(({ other }) => [node, other])), [nodes]);
  return (
    <group>
      {links.map((line, index) => <Line key={index} points={line} color="#6077a3" transparent opacity={0.085} lineWidth={0.3} />)}
      {nodes.map((node, index) => <group key={index} position={node} scale={0.22 + seeded(index + 90) * 0.46}><MiniGalaxy seed={index * 13} scale={1.2} /></group>)}
      <StarBackdrop count={quality.stars} radius={170} opacity={0.35} />
    </group>
  );
}

function VolumetricField({ count, radius, color, opacity = 0.15 }) {
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const point = fibonacciSphere(index, count, Math.pow(seeded(index + 23), 0.5) * radius);
      values.set([point.x, point.y, point.z], index * 3);
    }
    return values;
  }, [count, radius]);
  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial size={0.045} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} /></points>;
}

function MultiverseScene({ quality }) {
  const bubbles = useMemo(() => Array.from({ length: 36 }, (_, index) => ({ p: [(seeded(index + 1) - 0.5) * 26, (seeded(index + 40) - 0.5) * 17, (seeded(index + 90) - 0.5) * 22], s: 0.6 + seeded(index + 130) * 2.6, hue: 0.55 + seeded(index + 180) * 0.28 })), []);
  return <group>{bubbles.map((item, index) => <group key={index} position={item.p} scale={item.s}><mesh><sphereGeometry args={[1, 96, 96]} /><meshPhysicalMaterial color={new THREE.Color().setHSL(item.hue, 0.48, 0.62)} transparent opacity={0.08} transmission={0.9} thickness={1.4} roughness={0.08} iridescence={0.6} side={THREE.DoubleSide} /></mesh><VolumetricField count={120} radius={0.9} color="#d9d7ff" opacity={0.08} /></group>)}<StarBackdrop count={quality.stars} radius={170} opacity={0.28} /></group>;
}

function RealityScene({ quality }) {
  const shells = useMemo(() => Array.from({ length: 28 }, (_, index) => ({ scale: 1.2 + index * 0.38, rotation: [seeded(index + 1) * Math.PI, seeded(index + 30) * Math.PI, seeded(index + 60) * Math.PI] })), []);
  return <group>{shells.map((shell, index) => <mesh key={index} scale={shell.scale} rotation={shell.rotation}><icosahedronGeometry args={[1, index % 3 + 1]} /><meshPhysicalMaterial color={index % 2 ? '#b9c0ff' : '#f4d9ff'} wireframe transparent opacity={0.07 + (index % 5) * 0.008} /></mesh>)}<VolumetricField count={quality.microParticles} radius={12} color="#cabdff" opacity={0.08} /><StarBackdrop count={quality.stars} radius={170} opacity={0.2} /></group>;
}

function MaterialScene({ quality }) {
  const lattice = useMemo(() => Array.from({ length: 620 }, (_, index) => ({ x: (index % 20) - 9.5, y: Math.floor(index / 20) % 10 - 4.5, z: Math.floor(index / 200) - 1, defect: index % 73 === 0 })), []);
  return (
    <group rotation={[0.28, -0.4, 0.08]}>
      <mesh position={[0, -5.2, 0]}><boxGeometry args={[24, 0.7, 15]} /><meshPhysicalMaterial color="#1c2329" metalness={0.76} roughness={0.2} clearcoat={0.45} /></mesh>
      {lattice.map((item, index) => <mesh key={index} position={[item.x * 0.58, item.y * 0.58, item.z * 0.7]} scale={item.defect ? [0.35, 1.8, 0.35] : [0.48, 0.48, 0.48]}><octahedronGeometry args={[0.28, 0]} /><meshPhysicalMaterial color={item.defect ? '#ff8e66' : index % 5 ? '#7b8791' : '#c79a68'} metalness={0.82} roughness={0.24} clearcoat={0.4} /></mesh>)}
      <mesh position={[0, 4.8, 0]}><cylinderGeometry args={[1.7, 0.5, 5.5, 64]} /><meshPhysicalMaterial color="#3b444d" metalness={0.9} roughness={0.18} /></mesh>
      <pointLight position={[0, 2.2, 2]} color="#7fd8ff" intensity={40} distance={18} />
      <VolumetricField count={quality.microParticles / 5} radius={10} color="#5ca1c8" opacity={0.045} />
    </group>
  );
}

function BiologyScene({ quality }) {
  const helix = useMemo(() => Array.from({ length: 300 }, (_, index) => {
    const t = (index / 299) * Math.PI * 14 - Math.PI * 7;
    return { a: [Math.cos(t) * 2.3, t * 0.25, Math.sin(t) * 2.3], b: [Math.cos(t + Math.PI) * 2.3, t * 0.25, Math.sin(t + Math.PI) * 2.3], t };
  }), []);
  return (
    <group rotation={[0.2, 0.45, Math.PI / 2]}>
      <mesh scale={[8.5, 5.8, 5.8]}><sphereGeometry args={[1, 128, 128]} /><meshPhysicalMaterial color="#35142c" transparent opacity={0.16} transmission={0.62} thickness={2.4} roughness={0.34} side={THREE.BackSide} /></mesh>
      {helix.map((pair, index) => <React.Fragment key={index}><mesh position={pair.a}><sphereGeometry args={[0.095, 18, 18]} /><meshStandardMaterial color="#d46b92" roughness={0.5} /></mesh><mesh position={pair.b}><sphereGeometry args={[0.095, 18, 18]} /><meshStandardMaterial color="#5aa9bb" roughness={0.5} /></mesh>{index % 4 === 0 && <Line points={[pair.a, pair.b]} color="#d9cdd9" transparent opacity={0.38} lineWidth={0.8} />}</React.Fragment>)}
      <VolumetricField count={quality.microParticles / 3} radius={7} color="#d06a9a" opacity={0.055} />
      {[0, 1, 2, 3].map((index) => <mesh key={index} position={[Math.cos(index * 1.7) * 4.5, Math.sin(index * 1.3) * 3.5, Math.sin(index) * 3]}><torusKnotGeometry args={[0.7, 0.18, 120, 18]} /><meshStandardMaterial color="#7b536f" roughness={0.58} /></mesh>)}
    </group>
  );
}

function MolecularScene({ quality }) {
  const atoms = useMemo(() => Array.from({ length: 86 }, (_, index) => ({ p: [(seeded(index + 2) - 0.5) * 11, (seeded(index + 60) - 0.5) * 8, (seeded(index + 120) - 0.5) * 7], r: 0.16 + seeded(index + 180) * 0.3, c: index % 9 === 0 ? '#ca4958' : index % 7 === 0 ? '#4d74bd' : index % 3 === 0 ? '#dadde3' : '#4b5058' })), []);
  const bonds = useMemo(() => atoms.flatMap((atom, index) => atoms.slice(index + 1).map((other) => ({ a: atom.p, b: other.p, d: new THREE.Vector3(...atom.p).distanceTo(new THREE.Vector3(...other.p)) })).filter((bond) => bond.d < 1.8).slice(0, 3)), [atoms]);
  return <group>{bonds.map((bond, index) => <Line key={index} points={[bond.a, bond.b]} color="#9da4ad" transparent opacity={0.46} lineWidth={1.05} />)}{atoms.map((atom, index) => <mesh key={index} position={atom.p}><sphereGeometry args={[atom.r, 48, 48]} /><meshPhysicalMaterial color={atom.c} roughness={0.32} clearcoat={0.52} /></mesh>)}<VolumetricField count={quality.microParticles} radius={9} color="#67a8c7" opacity={0.035} /></group>;
}

function AtomicScene({ quality }) {
  const cloud = useMemo(() => {
    const count = quality.microParticles;
    const values = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const orbital = index % 4;
      const radius = -Math.log(Math.max(0.0001, 1 - seeded(index + 4))) * 1.22;
      const theta = seeded(index + 30) * Math.PI * 2;
      const phi = Math.acos(2 * seeded(index + 70) - 1);
      const axes = orbital === 0 ? [1, 0.34, 0.34] : orbital === 1 ? [0.34, 1, 0.34] : orbital === 2 ? [0.34, 0.34, 1] : [0.72, 0.72, 0.72];
      values.set([radius * Math.sin(phi) * Math.cos(theta) * axes[0], radius * Math.cos(phi) * axes[1], radius * Math.sin(phi) * Math.sin(theta) * axes[2]], index * 3);
    }
    return values;
  }, [quality.microParticles]);
  return <group><points><bufferGeometry><bufferAttribute attach="attributes-position" args={[cloud, 3]} /></bufferGeometry><pointsMaterial size={0.034} color="#8da8ff" transparent opacity={0.23} blending={THREE.AdditiveBlending} depthWrite={false} /></points><mesh><sphereGeometry args={[0.44, 64, 64]} /><meshStandardMaterial color="#c8d5ff" emissive="#5368a4" emissiveIntensity={1.4} roughness={0.48} /></mesh><VolumetricField count={quality.microParticles / 4} radius={7} color="#664fbb" opacity={0.04} /></group>;
}

function NuclearScene({ quality }) {
  const nucleons = useMemo(() => Array.from({ length: 176 }, (_, index) => ({ p: fibonacciSphere(index, 176, Math.cbrt(seeded(index + 3)) * 3.4), proton: index % 2 === 0 })), []);
  return <group>{nucleons.map((item, index) => <mesh key={index} position={item.p}><sphereGeometry args={[0.34, 32, 32]} /><meshPhysicalMaterial color={item.proton ? '#a74254' : '#357390'} roughness={0.48} clearcoat={0.28} emissive={item.proton ? '#26090f' : '#071c26'} emissiveIntensity={0.55} /></mesh>)}<mesh scale={3.8}><sphereGeometry args={[1, 96, 96]} /><meshBasicMaterial color="#8e77ff" wireframe transparent opacity={0.04} /></mesh><VolumetricField count={quality.microParticles / 3} radius={6} color="#b273ff" opacity={0.055} /></group>;
}

function ParticleScene({ quality }) {
  const tracks = useMemo(() => Array.from({ length: 78 }, (_, index) => {
    const angle = seeded(index + 8) * Math.PI * 2;
    const bend = (seeded(index + 40) - 0.5) * 2.8;
    return Array.from({ length: 64 }, (_, step) => {
      const t = step / 63;
      const radius = t * 11;
      return [Math.cos(angle + bend * t) * radius, (seeded(index + 80) - 0.5) * t * 8, Math.sin(angle + bend * t) * radius];
    });
  }), []);
  return <group rotation={[0.1, 0.35, 0]}>{[2, 3.1, 4.4, 5.9, 7.6, 9.5].map((radius, index) => <mesh key={radius} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius, 0.18 + index * 0.025, 16, 280]} /><meshPhysicalMaterial color={index % 2 ? '#51656b' : '#29383e'} metalness={0.78} roughness={0.26} /></mesh>)}{tracks.map((track, index) => <Line key={index} points={track} color={index % 6 === 0 ? '#ff9c6b' : index % 5 === 0 ? '#7f9dff' : '#7fd6c7'} transparent opacity={0.58} lineWidth={1.05} />)}<pointLight color="#ffffff" intensity={90} distance={20} /><VolumetricField count={quality.microParticles / 5} radius={11} color="#5d8ea3" opacity={0.025} /></group>;
}

function SpacetimeScene({ quality }) {
  const lines = useMemo(() => {
    const result = [];
    for (let x = -13; x <= 13; x += 0.55) { const points = []; for (let z = -13; z <= 13; z += 0.24) { const d = Math.sqrt(x * x + z * z); points.push([x, -6.4 / (d + 0.65), z]); } result.push(points); }
    for (let z = -13; z <= 13; z += 0.55) { const points = []; for (let x = -13; x <= 13; x += 0.24) { const d = Math.sqrt(x * x + z * z); points.push([x, -6.4 / (d + 0.65), z]); } result.push(points); }
    return result;
  }, []);
  return <group rotation={[0.76, 0, 0]}>{lines.map((line, index) => <Line key={index} points={line} color="#95a8ba" transparent opacity={0.12} lineWidth={0.38} />)}<mesh position={[0, -6.2, 0]}><sphereGeometry args={[1.88, 128, 128]} /><meshBasicMaterial color="#000000" /></mesh>{[2.35, 2.7, 3.2, 3.9].map((radius, index) => <mesh key={radius} position={[0, -6.2, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius, 0.11 + index * 0.04, 28, 360]} /><meshBasicMaterial color={index < 2 ? '#fff0cf' : '#d46a3d'} transparent opacity={[0.88, 0.55, 0.28, 0.12][index]} toneMapped={false} /></mesh>)}<StarBackdrop count={quality.stars} radius={170} /><VolumetricField count={quality.microParticles / 4} radius={10} color="#d77b4f" opacity={0.03} /></group>;
}

export const CINEMATIC_SCENES = {
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
