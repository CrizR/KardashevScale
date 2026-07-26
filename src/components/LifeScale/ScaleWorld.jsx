import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { Bloom, DepthOfField, EffectComposer, Noise, SMAA, Vignette } from '@react-three/postprocessing';
import { CINEMATIC_SCENES } from '../../experience/CinematicScenes';
import { detectQualityTier, getQualityProfile } from '../../experience/quality';
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
    const ease = reducedMotion ? 1 : 1 - Math.exp(-delta * (mobile ? 8.6 : 3.8));
    const nextZ = THREE.MathUtils.lerp(camera.position.z, targetZ, ease);

    if (mobile && targetZ < previousTarget.current) camera.position.z = Math.min(camera.position.z, nextZ);
    else if (mobile && targetZ > previousTarget.current) camera.position.z = Math.max(camera.position.z, nextZ);
    else camera.position.z = nextZ;

    previousTarget.current = targetZ;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.current.x * (mobile ? 0.28 : 1.15), ease * 0.66);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.current.y * (mobile ? 0.16 : 0.64), ease * 0.66);
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, mobile ? 0 : active.camera.roll, ease * 0.48);
    camera.fov = THREE.MathUtils.lerp(camera.fov, mobile ? 45 : active.camera.fov, ease * 0.4);
    camera.updateProjectionMatrix();
    camera.lookAt(pointer.current.x * (mobile ? 0.05 : 0.2), pointer.current.y * (mobile ? 0.03 : 0.12), targetZ - 14);
  });
  return null;
}

const DESKTOP_OFFSETS = {
  present: [4.4, -0.25],
  'connected-earth': [4.2, -0.15],
  planetary: [4.6, -0.2],
  dyson: [3.25, 0],
  galaxy: [2.7, 0],
  'cosmic-web': [1.7, 0],
  multiverse: [1.35, 0],
  reality: [1.1, 0],
  material: [3.1, -0.25],
  biology: [2.9, 0],
  molecular: [2.75, 0],
  atomic: [2.7, 0],
  nuclear: [2.8, 0],
  particle: [2.1, 0],
  spacetime: [1.9, 0],
};

function SceneLayer({ progress, mobile, quality }) {
  return SCALE_SECTIONS.map((section, index) => {
    if (Math.abs(index - progress) > 1.35) return null;
    const Scene = CINEMATIC_SCENES[section.scene];
    const distance = Math.abs(index - progress);
    const scale = mobile ? 0.92 : 1 - Math.min(distance, 1) * 0.035;
    const [x, y] = mobile ? [0, 0] : (DESKTOP_OFFSETS[section.scene] || [2.1, 0]);
    return (
      <group key={section.id} position={[x, y, -index * SECTION_SPACING]} scale={scale}>
        <Scene quality={quality} mobile={mobile} />
      </group>
    );
  });
}

function SceneLighting({ progress }) {
  const section = SCALE_SECTIONS[Math.max(0, Math.min(SCALE_SECTIONS.length - 1, Math.round(progress)))];
  const micro = section.realm === 'micro';
  const speculative = section.realm === 'speculative';
  return (
    <>
      <ambientLight intensity={micro ? 0.11 : 0.035} color={micro ? '#6f7892' : '#ffffff'} />
      <directionalLight position={[8, 7, 12]} intensity={micro ? 4.5 : 2.9} color={micro ? '#d8e4ff' : '#fff0d2'} castShadow />
      {micro && <pointLight position={[-7, -3, 8]} intensity={34} distance={28} color="#7d5cff" />}
      {speculative && <pointLight position={[6, 4, -8]} intensity={28} distance={42} color="#a67dff" />}
    </>
  );
}

export default function ScaleWorld({ progress, pointer, reducedMotion, onReady, onError }) {
  const mobile = useMobileViewport();
  const [tier, setTier] = useState(detectQualityTier);
  const quality = useMemo(() => getQualityProfile(tier), [tier]);

  const lowerQuality = () => setTier((current) => ({ ultra: 'high', high: 'balanced', balanced: 'safe', safe: 'safe' }[current]));
  const raiseQuality = () => setTier((current) => ({ safe: 'balanced', balanced: 'high', high: 'ultra', ultra: 'ultra' }[current]));

  return (
    <Canvas
      className="scale-world-canvas"
      shadows={quality.shadows}
      camera={{ position: [0, 0, -progress * SECTION_SPACING + 14], fov: mobile ? 45 : 44, near: 0.04, far: SECTION_SPACING * 4.5 }}
      dpr={quality.dpr}
      gl={{ antialias: tier !== 'safe', alpha: false, powerPreference: 'high-performance', logarithmicDepthBuffer: true, stencil: false }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.06;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        onReady?.();
        gl.domElement.addEventListener('webglcontextlost', (event) => { event.preventDefault(); onError?.(); }, { once: true });
      }}
    >
      <PerformanceMonitor onDecline={lowerQuality} onIncline={raiseQuality} flipflops={3} bounds={(refreshRate) => refreshRate > 90 ? [55, 85] : [40, 58]} />
      <color attach="background" args={['#010104']} />
      <fogExp2 attach="fog" args={['#010104', mobile ? 0.0065 : 0.0038]} />
      <SceneLighting progress={progress} />
      <CameraRig progress={progress} pointer={pointer} reducedMotion={reducedMotion} mobile={mobile} />
      <SceneLayer progress={progress} mobile={mobile} quality={quality} />
      <EffectComposer multisampling={quality.multisampling} enableNormalPass={tier === 'ultra' || tier === 'high'}>
        <Bloom intensity={quality.bloom} luminanceThreshold={0.83} luminanceSmoothing={0.16} mipmapBlur />
        {!mobile && tier !== 'safe' && <DepthOfField focusDistance={0.012} focalLength={0.028} bokehScale={tier === 'ultra' ? 1.5 : 0.8} height={tier === 'ultra' ? 720 : 480} />}
        {quality.multisampling === 0 && <SMAA />}
        <Noise opacity={0.0035} />
        <Vignette offset={0.27} darkness={0.42} />
      </EffectComposer>
    </Canvas>
  );
}
