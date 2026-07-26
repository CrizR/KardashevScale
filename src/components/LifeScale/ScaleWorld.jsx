import React, { Component, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, SMAA, Vignette } from '@react-three/postprocessing';
import { PRODUCTION_SCENES } from '../../experience/ProductionScenes';
import { detectQualityTier, getQualityProfile } from '../../experience/quality';
import { SCALE_SECTIONS, SECTION_SPACING } from './scaleConfig';

class SceneBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { this.props.onError?.(error); }
  componentDidUpdate(previousProps) {
    if (previousProps.sceneKey !== this.props.sceneKey && this.state.failed) this.setState({ failed: false });
  }
  render() {
    if (this.state.failed) return <mesh><sphereGeometry args={[1.2, 24, 24]} /><meshBasicMaterial color="#33151b" wireframe /></mesh>;
    return this.props.children;
  }
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
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.current.x * (mobile ? 0.2 : 1.05), ease * 0.65);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.current.y * (mobile ? 0.12 : 0.58), ease * 0.65);
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, mobile ? 0 : active.camera.roll, ease * 0.45);
    camera.fov = THREE.MathUtils.lerp(camera.fov, mobile ? 45 : active.camera.fov, ease * 0.38);
    camera.updateProjectionMatrix();
    camera.lookAt(pointer.current.x * (mobile ? 0.04 : 0.18), pointer.current.y * (mobile ? 0.02 : 0.1), targetZ - 14);
  });
  return null;
}

const DESKTOP_OFFSETS = {
  present: [4.4, -0.25], 'connected-earth': [4.2, -0.15], planetary: [4.7, -0.2],
  dyson: [3.2, 0], galaxy: [2.6, 0], 'cosmic-web': [1.6, 0], multiverse: [1.3, 0],
  reality: [1.1, 0], material: [3.0, -0.25], biology: [2.8, 0], molecular: [2.7, 0],
  atomic: [2.7, 0], nuclear: [2.8, 0], particle: [2.0, 0], spacetime: [1.9, 0],
};

function ActiveScene({ progress, mobile, quality, onSceneError }) {
  const index = Math.max(0, Math.min(SCALE_SECTIONS.length - 1, Math.round(progress)));
  const section = SCALE_SECTIONS[index];
  const Scene = PRODUCTION_SCENES[section.scene];
  const [x, y] = mobile ? [0, 0] : (DESKTOP_OFFSETS[section.scene] || [2, 0]);
  return (
    <group position={[x, y, -index * SECTION_SPACING]} scale={mobile ? 0.9 : 1}>
      <SceneBoundary sceneKey={section.id} onError={onSceneError}>
        <Scene quality={quality} mobile={mobile} />
      </SceneBoundary>
    </group>
  );
}

function SceneLighting({ progress }) {
  const section = SCALE_SECTIONS[Math.max(0, Math.min(SCALE_SECTIONS.length - 1, Math.round(progress)))];
  const micro = section.realm === 'micro';
  const speculative = section.realm === 'speculative';
  return (
    <>
      <ambientLight intensity={micro ? 0.1 : 0.03} color={micro ? '#77819a' : '#ffffff'} />
      <directionalLight position={[8, 7, 12]} intensity={micro ? 3.8 : 2.7} color={micro ? '#d8e4ff' : '#fff0d2'} />
      {micro && <pointLight position={[-7, -3, 8]} intensity={26} distance={28} color="#7458e8" />}
      {speculative && <pointLight position={[6, 4, -8]} intensity={22} distance={42} color="#9b74e8" />}
    </>
  );
}

export default function ScaleWorld({ progress, pointer, reducedMotion, onReady, onError }) {
  const mobile = useMobileViewport();
  const [tier, setTier] = useState(detectQualityTier);
  const quality = useMemo(() => getQualityProfile(tier), [tier]);
  const lowerQuality = () => setTier((current) => ({ ultra: 'high', high: 'balanced', balanced: 'safe', safe: 'safe' }[current]));

  return (
    <Canvas
      className="scale-world-canvas"
      shadows={quality.shadows}
      camera={{ position: [0, 0, -progress * SECTION_SPACING + 14], fov: mobile ? 45 : 44, near: 0.05, far: SECTION_SPACING * 3 }}
      dpr={quality.dpr}
      gl={{ antialias: tier !== 'safe', alpha: false, powerPreference: 'high-performance', logarithmicDepthBuffer: false, stencil: false, depth: true }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.04;
        gl.info.autoReset = true;
        onReady?.();
        gl.domElement.addEventListener('webglcontextlost', (event) => { event.preventDefault(); lowerQuality(); onError?.(); }, { once: true });
      }}
    >
      <PerformanceMonitor onDecline={lowerQuality} flipflops={2} bounds={(refreshRate) => refreshRate > 90 ? [52, 82] : [38, 57]} />
      <color attach="background" args={['#010104']} />
      <fogExp2 attach="fog" args={['#010104', mobile ? 0.006 : 0.0034]} />
      <SceneLighting progress={progress} />
      <CameraRig progress={progress} pointer={pointer} reducedMotion={reducedMotion} mobile={mobile} />
      <ActiveScene progress={progress} mobile={mobile} quality={quality} onSceneError={() => { lowerQuality(); onError?.(); }} />
      <EffectComposer multisampling={quality.multisampling} enableNormalPass={false}>
        <Bloom intensity={quality.bloom} luminanceThreshold={0.86} luminanceSmoothing={0.15} mipmapBlur />
        {quality.multisampling === 0 && <SMAA />}
        {!mobile && <Noise opacity={0.0025} />}
        <Vignette offset={0.28} darkness={0.38} />
      </EffectComposer>
    </Canvas>
  );
}
