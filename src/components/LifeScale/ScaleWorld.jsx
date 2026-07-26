import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import {
  AtomicScene,
  BiologyScene,
  ConnectedEarthScene,
  CosmicWebScene,
  DysonScene,
  GalaxyScene,
  MaterialScene,
  MolecularScene,
  MultiverseScene,
  NuclearScene,
  ParticleScene,
  PlanetaryScene,
  PresentScene,
  RealityScene,
  SpacetimeScene,
} from './HighFidelityScenes';
import { SCALE_SECTIONS, SECTION_SPACING } from './scaleConfig';

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

function CameraRig({ progress, pointer, reducedMotion, mobile }) {
  const { camera } = useThree();
  const previousTarget = useRef(-progress * SECTION_SPACING + 14);

  useFrame((_, delta) => {
    const targetZ = -progress * SECTION_SPACING + 14;
    const active = SCALE_SECTIONS[Math.max(0, Math.min(SCALE_SECTIONS.length - 1, Math.round(progress)))];
    const ease = reducedMotion ? 1 : 1 - Math.exp(-delta * (mobile ? 7.5 : 3.6));
    const nextZ = THREE.MathUtils.lerp(camera.position.z, targetZ, ease);

    if (mobile && targetZ < previousTarget.current) camera.position.z = Math.min(camera.position.z, nextZ);
    else if (mobile && targetZ > previousTarget.current) camera.position.z = Math.max(camera.position.z, nextZ);
    else camera.position.z = nextZ;

    previousTarget.current = targetZ;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.current.x * (mobile ? 0.4 : 1.25), ease * 0.68);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.current.y * (mobile ? 0.24 : 0.72), ease * 0.68);
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, mobile ? 0 : active.camera.roll, ease * 0.5);
    camera.fov = THREE.MathUtils.lerp(camera.fov, mobile ? 46 : active.camera.fov, ease * 0.42);
    camera.updateProjectionMatrix();
    camera.lookAt(pointer.current.x * (mobile ? 0.08 : 0.24), pointer.current.y * (mobile ? 0.05 : 0.16), targetZ - 14);
  });
  return null;
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

const DESKTOP_OFFSETS = {
  present: [4.1, -0.15],
  'connected-earth': [4.1, -0.15],
  planetary: [4.35, -0.1],
  dyson: [3.5, 0],
  galaxy: [2.8, 0],
  'cosmic-web': [2.1, 0],
  multiverse: [1.7, 0],
  reality: [1.5, 0],
  material: [3.25, -0.15],
  biology: [3.0, 0],
  molecular: [2.9, 0],
  atomic: [2.9, 0],
  nuclear: [3.0, 0],
  particle: [2.3, 0],
  spacetime: [2.1, 0],
};

function SceneLayer({ progress, mobile }) {
  return SCALE_SECTIONS.map((section, index) => {
    if (Math.abs(index - progress) > 1.45) return null;
    const Scene = SCENES[section.scene];
    const distance = Math.abs(index - progress);
    const scale = mobile ? 1 : 1 - Math.min(distance, 1) * 0.04;
    const [x, y] = mobile ? [0, 0] : (DESKTOP_OFFSETS[section.scene] || [2.2, 0]);
    return <group key={section.id} position={[x, y, -index * SECTION_SPACING]} scale={scale}><Scene /></group>;
  });
}

export default function ScaleWorld({ progress, pointer, reducedMotion, onReady, onError }) {
  const mobile = useMobileViewport();
  return (
    <Canvas
      className="scale-world-canvas"
      camera={{ position: [0, 0, -progress * SECTION_SPACING + 14], fov: mobile ? 46 : 44, near: 0.04, far: SECTION_SPACING * 4 }}
      dpr={[1, mobile ? 1.65 : 2]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', logarithmicDepthBuffer: true }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.04;
        onReady?.();
        gl.domElement.addEventListener('webglcontextlost', (event) => { event.preventDefault(); onError?.(); }, { once: true });
      }}
    >
      <color attach="background" args={['#010104']} />
      <fogExp2 attach="fog" args={['#010104', mobile ? 0.0075 : 0.0048]} />
      <ambientLight intensity={0.045} />
      <directionalLight position={[8, 7, 12]} intensity={3.6} color="#fff1d5" />
      <Stars radius={170} depth={110} count={mobile ? 5000 : 10000} factor={2.4} saturation={0.08} fade speed={0.1} />
      <CameraRig progress={progress} pointer={pointer} reducedMotion={reducedMotion} mobile={mobile} />
      <SceneLayer progress={progress} mobile={mobile} />
      <EffectComposer multisampling={mobile ? 0 : 4}>
        <Bloom intensity={0.48} luminanceThreshold={0.86} luminanceSmoothing={0.18} mipmapBlur />
        <Noise opacity={0.004} />
        <Vignette offset={0.25} darkness={0.46} />
      </EffectComposer>
    </Canvas>
  );
}
