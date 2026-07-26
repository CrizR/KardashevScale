import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { REALISM_TEXTURES } from './realismTextures';
import { SCALE_SECTIONS, SECTION_SPACING } from './scaleConfig';

const SUN_DIRECTION = new THREE.Vector3(1, 0.28, 0.85).normalize();
const DEG_TO_RAD = Math.PI / 180;

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

function useOptionalTexture(url, colorTexture = false) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    let active = true;
    let loadedTexture = null;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      url,
      (loaded) => {
        loadedTexture = loaded;
        if (!active) {
          loaded.dispose();
          return;
        }
        loaded.colorSpace = colorTexture ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        loaded.anisotropy = 12;
        loaded.wrapS = THREE.RepeatWrapping;
        loaded.needsUpdate = true;
        setTexture(loaded);
      },
      undefined,
      () => undefined,
    );

    return () => {
      active = false;
      loadedTexture?.dispose();
    };
  }, [colorTexture, url]);

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
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.current.x * (mobile ? 0.55 : 1.45), ease * 0.7);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.current.y * (mobile ? 0.35 : 0.82), ease * 0.7);
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, mobile ? 0 : active.camera.roll, ease * 0.55);
    camera.fov = THREE.MathUtils.lerp(camera.fov, mobile ? 46 : active.camera.fov, ease * 0.45);
    camera.updateProjectionMatrix();
    camera.lookAt(pointer.current.x * (mobile ? 0.12 : 0.3), pointer.current.y * (mobile ? 0.08 : 0.2), targetZ - 14);
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
      <sphereGeometry args={[radius, 160, 160]} />
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

          float hash(vec3 p) {
            return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
          }

          float noise(vec3 p) {
            vec3 i = floor(p);
            vec3 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
              mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
              f.z
            );
          }

          float fbm(vec3 p) {
            float value = 0.0;
            float amplitude = 0.5;
            for (int i = 0; i < 6; i++) {
              value += amplitude * noise(p);
              p *= 2.03;
              amplitude *= 0.5;
            }
            return value;
          }

          void main() {
            vec3 p = normalize(vPosition) * 7.5;
            float granulation = fbm(p + vec3(0.0, uTime * 0.045, 0.0));
            float secondary = fbm(p * 2.4 - vec3(0.0, uTime * 0.025, 0.0));
            float cells = smoothstep(0.36, 0.78, granulation);
            float darkLane = smoothstep(0.56, 0.88, secondary) * 0.22;
            float limb = pow(max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 0.3);
            vec3 hot = mix(uColor * 0.5, vec3(1.42, 0.94, 0.53), cells);
            vec3 finalColor = hot * (0.54 + limb * 1.08) - darkLane;
            gl_FragColor = vec4(finalColor, 1.0);
          }
        `}
      />
      <pointLight color={color} intensity={230} distance={95} decay={2} />
    </mesh>
  );
}

function Corona({ radius = 4.35, color = '#ffc980' }) {
  return (
    <group>
      {[1, 1.04, 1.1].map((scale, index) => (
        <mesh key={scale} scale={scale}>
          <sphereGeometry args={[radius, 96, 96]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={[0.07, 0.032, 0.012][index]}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function Sun({ radius = 4, color = '#ffb45c' }) {
  return (
    <group>
      <StellarSurface radius={radius} color={color} />
      <Corona radius={radius * 1.09} color={color} />
    </group>
  );
}

function EarthAtmosphere({ radius = 4.18 }) {
  const uniforms = useMemo(() => ({
    uSunDirection: { value: SUN_DIRECTION.clone() },
  }), []);

  return (
    <mesh>
      <sphereGeometry args={[radius, 160, 160]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vWorldNormal;
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            vWorldNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 uSunDirection;
          varying vec3 vWorldNormal;
          varying vec3 vWorldPosition;
          void main() {
            vec3 normal = normalize(vWorldNormal);
            vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
            float rim = pow(1.0 - abs(dot(normal, viewDirection)), 3.15);
            float sunlight = smoothstep(-0.35, 0.65, dot(normal, normalize(uSunDirection)));
            vec3 nightBlue = vec3(0.035, 0.14, 0.32);
            vec3 dayBlue = vec3(0.16, 0.58, 1.0);
            vec3 color = mix(nightBlue, dayBlue, sunlight);
            float alpha = rim * mix(0.18, 0.62, sunlight);
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}

function EarthSurface({ day, night, specular }) {
  const uniforms = useMemo(() => ({
    uDayMap: { value: day },
    uNightMap: { value: night },
    uSpecularMap: { value: specular },
    uSunDirection: { value: SUN_DIRECTION.clone() },
  }), [day, night, specular]);

  if (!day || !night || !specular) {
    return (
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[4, 192, 192]} />
        <meshStandardMaterial
          map={day}
          color={day ? '#ffffff' : '#16334a'}
          roughness={0.78}
          metalness={0}
        />
      </mesh>
    );
  }

  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[4, 224, 224]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vWorldNormal;
          varying vec3 vWorldPosition;
          void main() {
            vUv = uv;
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            vWorldNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
          }
        `}
        fragmentShader={`
          uniform sampler2D uDayMap;
          uniform sampler2D uNightMap;
          uniform sampler2D uSpecularMap;
          uniform vec3 uSunDirection;
          varying vec2 vUv;
          varying vec3 vWorldNormal;
          varying vec3 vWorldPosition;

          void main() {
            vec3 normal = normalize(vWorldNormal);
            vec3 sunDirection = normalize(uSunDirection);
            vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
            float sunlight = dot(normal, sunDirection);
            float dayMix = smoothstep(-0.16, 0.22, sunlight);
            vec3 dayColor = texture2D(uDayMap, vUv).rgb;
            vec3 nightColor = texture2D(uNightMap, vUv).rgb;
            float oceanMask = texture2D(uSpecularMap, vUv).r;
            float diffuse = 0.11 + max(sunlight, 0.0) * 1.12;
            vec3 color = dayColor * diffuse;
            color += nightColor * pow(1.0 - dayMix, 2.1) * 2.15;
            vec3 halfDirection = normalize(sunDirection + viewDirection);
            float specular = pow(max(dot(normal, halfDirection), 0.0), 84.0) * oceanMask * dayMix;
            color += vec3(0.38, 0.58, 0.82) * specular * 0.78;
            float limb = pow(1.0 - max(dot(normal, viewDirection), 0.0), 4.2);
            color += vec3(0.02, 0.09, 0.18) * limb;
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

function latLonToVector3(latitude, longitude, radius = 4.09) {
  const phi = (90 - latitude) * DEG_TO_RAD;
  const theta = (longitude + 180) * DEG_TO_RAD;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function greatCircleArc(start, end, radius = 4.13, lift = 0.32, segments = 34) {
  const a = start.clone().normalize();
  const b = end.clone().normalize();
  const angle = Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1));
  const denominator = Math.max(Math.sin(angle), 0.0001);

  return Array.from({ length: segments }, (_, index) => {
    const t = index / (segments - 1);
    const point = a.clone()
      .multiplyScalar(Math.sin((1 - t) * angle) / denominator)
      .add(b.clone().multiplyScalar(Math.sin(t * angle) / denominator))
      .normalize();
    return point.multiplyScalar(radius + Math.sin(Math.PI * t) * lift);
  });
}

const CITY_COORDINATES = [
  [40.7, -74.0], [34.0, -118.2], [19.4, -99.1], [-23.6, -46.6], [51.5, -0.1],
  [48.9, 2.4], [6.5, 3.4], [30.0, 31.2], [25.2, 55.3], [19.1, 72.9],
  [1.3, 103.8], [35.7, 139.7], [37.6, 127.0], [39.9, 116.4], [-33.9, 151.2],
];

const CITY_CONNECTIONS = [
  [0, 1], [0, 4], [0, 6], [1, 2], [1, 14], [2, 3], [3, 6], [4, 5], [4, 7],
  [5, 8], [6, 7], [7, 8], [8, 9], [8, 10], [9, 10], [9, 13], [10, 11], [10, 14],
  [11, 12], [11, 13], [12, 13],
];

function CityNetwork() {
  const cities = useMemo(() => CITY_COORDINATES.map(([lat, lon]) => latLonToVector3(lat, lon)), []);
  const routes = useMemo(() => CITY_CONNECTIONS.map(([from, to]) => greatCircleArc(cities[from], cities[to])), [cities]);

  return (
    <group>
      {routes.map((route, index) => (
        <Line key={index} points={route} color="#88e8ff" transparent opacity={0.24} lineWidth={0.55} />
      ))}
      {cities.map((city, index) => (
        <mesh key={index} position={city}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color="#b6f6ff" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function OrbitalInfrastructure() {
  const stations = useMemo(() => Array.from({ length: 132 }, (_, index) => {
    const band = index % 4;
    const angle = seeded(index + 11) * Math.PI * 2;
    const radius = 5.15 + band * 0.55 + seeded(index + 301) * 0.35;
    const inclination = (band - 1.5) * 0.1 + (seeded(index + 701) - 0.5) * 0.05;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.sin(angle + band) * radius * inclination;
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(-x, -y, -z).normalize(),
    );
    return {
      position: [x, y, z],
      quaternion,
      scale: 0.45 + seeded(index + 1201) * 0.9,
      habitat: index % 17 === 0,
    };
  }), []);

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[5.62, 0.025, 12, 420]} />
        <meshStandardMaterial color="#768486" metalness={0.92} roughness={0.24} transparent opacity={0.58} />
      </mesh>
      {stations.map((station, index) => (
        <group key={index} position={station.position} quaternion={station.quaternion} scale={station.scale}>
          <mesh>
            <boxGeometry args={[station.habitat ? 0.28 : 0.16, 0.035, station.habitat ? 0.6 : 0.32]} />
            <meshPhysicalMaterial color={station.habitat ? '#c4b68b' : '#526674'} metalness={0.9} roughness={0.22} clearcoat={0.45} />
          </mesh>
          {!station.habitat && (
            <mesh position={[0.16, 0, 0]}>
              <boxGeometry args={[0.16, 0.012, 0.28]} />
              <meshStandardMaterial color="#182c48" metalness={0.3} roughness={0.42} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function Earth({ connected = false, industrial = false }) {
  const day = useOptionalTexture(REALISM_TEXTURES.earthDay, true);
  const night = useOptionalTexture(REALISM_TEXTURES.earthNight, true);
  const specular = useOptionalTexture(REALISM_TEXTURES.earthSpecular, false);
  const clouds = useOptionalTexture(REALISM_TEXTURES.earthClouds, false);
  const group = useRef();
  const cloudRef = useRef();

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.011;
    if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.004;
  });

  return (
    <group ref={group} rotation={[0.12, -1.02, -0.045]}>
      <EarthSurface day={day} night={night} specular={specular} />
      {clouds && (
        <mesh ref={cloudRef} scale={1.007} rotation={[0.02, 0.1, 0]}>
          <sphereGeometry args={[4.035, 180, 180]} />
          <meshStandardMaterial
            color="#ffffff"
            alphaMap={clouds}
            transparent
            opacity={0.62}
            alphaTest={0.018}
            depthWrite={false}
            roughness={1}
          />
        </mesh>
      )}
      <EarthAtmosphere />
      {connected && <CityNetwork />}
      {industrial && <OrbitalInfrastructure />}
    </group>
  );
}

function PresentScene() {
  return (
    <group>
      <Earth />
      <mesh position={[7.4, 2.1, -3.1]}>
        <sphereGeometry args={[0.92, 96, 96]} />
        <meshStandardMaterial color="#686b70" roughness={0.96} metalness={0} />
      </mesh>
    </group>
  );
}

function ConnectedEarthScene() {
  return <Earth connected />;
}

function PlanetaryScene() {
  return <Earth connected industrial />;
}

function DysonScene() {
  const collectors = useMemo(() => Array.from({ length: 980 }, (_, index) => {
    const band = index % 9;
    const inclination = (band - 4) * 0.055 + (seeded(index + 7) - 0.5) * 0.035;
    const theta = seeded(index + 500) * Math.PI * 2;
    const radius = 7.0 + Math.pow(seeded(index + 900), 0.54) * 8.2;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    const y = Math.sin(theta + band * 0.7) * inclination * radius;
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(-x, -y, -z).normalize(),
    );
    return {
      position: [x, y, z],
      quaternion,
      size: 0.14 + seeded(index + 1400) * 0.34,
      habitat: index % 43 === 0,
    };
  }), []);

  return (
    <group>
      <Sun radius={3.65} />
      {collectors.map((collector, index) => (
        <group key={index} position={collector.position} quaternion={collector.quaternion} scale={collector.size}>
          <mesh>
            <boxGeometry args={[collector.habitat ? 1.5 : 1.15, 0.035, collector.habitat ? 0.42 : 0.72]} />
            <meshPhysicalMaterial
              color={collector.habitat ? '#8f8269' : '#40566c'}
              metalness={0.86}
              roughness={0.24}
              clearcoat={0.48}
            />
          </mesh>
          {!collector.habitat && (
            <mesh position={[0, 0.022, 0]}>
              <boxGeometry args={[0.98, 0.008, 0.58]} />
              <meshStandardMaterial color="#14263f" metalness={0.28} roughness={0.34} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function GalaxyScene() {
  const { positions, colors, sizes } = useMemo(() => {
    const count = 52000;
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const s = new Float32Array(count);
    const warm = new THREE.Color('#ffd7a6');
    const cool = new THREE.Color('#8fb7ff');
    const neutral = new THREE.Color('#e8ddd0');

    for (let index = 0; index < count; index += 1) {
      const arm = index % 4;
      const radius = Math.pow(seeded(index + 10), 0.5) * 18;
      const armScatter = (seeded(index + 100) - 0.5) * (0.34 + radius * 0.04);
      const angle = radius * 0.55 + arm * Math.PI / 2 + armScatter;
      const thickness = Math.max(0.14, 1.4 - radius * 0.062);
      p[index * 3] = Math.cos(angle) * radius + (seeded(index + 901) - 0.5) * 0.42;
      p[index * 3 + 1] = (seeded(index + 500) - 0.5) * thickness;
      p[index * 3 + 2] = Math.sin(angle) * radius + (seeded(index + 1201) - 0.5) * 0.42;

      const random = seeded(index + 2200);
      const color = radius < 3.7 ? warm : random > 0.74 ? cool : random > 0.48 ? neutral : warm.clone().lerp(cool, 0.3);
      c.set([color.r, color.g, color.b], index * 3);
      s[index] = 0.5 + seeded(index + 2900) * 1.6;
    }

    return { positions: p, colors: c, sizes: s };
  }, []);

  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.004;
  });

  return (
    <group ref={ref} rotation={[0.38, 0, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial size={0.046} vertexColors transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 14.8, 300]} />
        <meshBasicMaterial color="#241914" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.2, 96, 96]} />
        <meshBasicMaterial color="#ffe4ba" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <Sun radius={0.78} color="#fff1cf" />
    </group>
  );
}

function CosmicWebScene() {
  const nodes = useMemo(() => Array.from({ length: 220 }, (_, index) => new THREE.Vector3(
    (seeded(index + 1) - 0.5) * 34,
    (seeded(index + 301) - 0.5) * 20,
    (seeded(index + 701) - 0.5) * 30,
  )), []);

  const links = useMemo(() => {
    const result = [];
    nodes.forEach((node, index) => {
      nodes.slice(index + 1)
        .map((other) => ({ other, distance: node.distanceTo(other) }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3)
        .forEach(({ other, distance }) => {
          if (distance < 7.2) result.push([node, other]);
        });
    });
    return result;
  }, [nodes]);

  return (
    <group>
      {links.map((line, index) => <Line key={index} points={line} color="#7183aa" transparent opacity={0.095} lineWidth={0.34} />)}
      {nodes.map((node, index) => (
        <mesh key={index} position={node}>
          <sphereGeometry args={[0.05 + seeded(index + 88) * 0.15, 10, 10]} />
          <meshBasicMaterial color={index % 13 === 0 ? '#eee8ff' : '#8492b3'} transparent opacity={0.68} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function MultiverseScene() {
  const bubbles = useMemo(() => Array.from({ length: 30 }, (_, index) => ({
    position: [(seeded(index + 2) - 0.5) * 26, (seeded(index + 202) - 0.5) * 16, (seeded(index + 402) - 0.5) * 21],
    scale: 0.7 + seeded(index + 802) * 2.5,
    color: new THREE.Color().setHSL(0.61 + seeded(index + 1200) * 0.18, 0.32, 0.5),
  })), []);

  return (
    <group>
      {bubbles.map((bubble, index) => (
        <mesh key={index} position={bubble.position} scale={bubble.scale}>
          <sphereGeometry args={[1, 72, 72]} />
          <meshPhysicalMaterial color={bubble.color} transparent opacity={0.06} transmission={0.94} thickness={0.9} roughness={0.08} iridescence={0.35} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function RealityScene() {
  const rings = useMemo(() => Array.from({ length: 22 }, (_, index) => ({
    radius: 1.5 + index * 0.52,
    rotation: [seeded(index + 10) * Math.PI, seeded(index + 30) * Math.PI, seeded(index + 60) * Math.PI],
  })), []);

  return (
    <group>
      {rings.map((ring, index) => (
        <mesh key={index} rotation={ring.rotation}>
          <torusKnotGeometry args={[ring.radius, 0.012 + index * 0.0006, 220, 10, 2 + index % 4, 3 + index % 5]} />
          <meshBasicMaterial color={index % 2 ? '#b7a8cc' : '#d9d9dc'} transparent opacity={0.15} toneMapped={false} />
        </mesh>
      ))}
      <mesh>
        <icosahedronGeometry args={[2.2, 6]} />
        <meshPhysicalMaterial color="#c6bbcf" wireframe transparent opacity={0.09} />
      </mesh>
    </group>
  );
}

function MaterialScene() {
  const blocks = useMemo(() => Array.from({ length: 144 }, (_, index) => ({
    position: [((index % 12) - 5.5) * 0.8, (Math.floor(index / 12) % 6 - 2.5) * 0.8, (Math.floor(index / 72) - 0.5) * 2.1],
    height: 0.45 + seeded(index + 5) * 1.25,
  })), []);

  return (
    <group rotation={[0.2, 0.5, 0]}>
      {blocks.map((block, index) => (
        <mesh key={index} position={block.position} scale={[0.63, block.height, 0.63]}>
          <boxGeometry />
          <meshStandardMaterial color={index % 5 ? '#69717a' : '#a97858'} metalness={0.78} roughness={0.28} />
        </mesh>
      ))}
    </group>
  );
}

function BiologyScene() {
  const helix = useMemo(() => Array.from({ length: 190 }, (_, index) => {
    const t = (index / 189) * Math.PI * 11 - Math.PI * 5.5;
    return {
      a: [Math.cos(t) * 2.25, t * 0.29, Math.sin(t) * 2.25],
      b: [Math.cos(t + Math.PI) * 2.25, t * 0.29, Math.sin(t + Math.PI) * 2.25],
    };
  }), []);

  return (
    <group rotation={[0.1, 0.4, Math.PI / 2]}>
      {helix.map((pair, index) => (
        <React.Fragment key={index}>
          <mesh position={pair.a}>
            <sphereGeometry args={[0.085, 14, 14]} />
            <meshStandardMaterial color="#91445e" roughness={0.52} />
          </mesh>
          <mesh position={pair.b}>
            <sphereGeometry args={[0.085, 14, 14]} />
            <meshStandardMaterial color="#477d8d" roughness={0.52} />
          </mesh>
          {index % 5 === 0 && <Line points={[pair.a, pair.b]} color="#aaa5b1" transparent opacity={0.32} lineWidth={0.75} />}
        </React.Fragment>
      ))}
    </group>
  );
}

function MolecularScene() {
  const atoms = useMemo(() => Array.from({ length: 42 }, (_, index) => ({
    position: [(seeded(index + 2) - 0.5) * 9, (seeded(index + 52) - 0.5) * 7, (seeded(index + 102) - 0.5) * 6],
    radius: 0.16 + seeded(index + 300) * 0.24,
    color: index % 7 === 0 ? '#a43946' : index % 5 === 0 ? '#31558d' : index % 3 === 0 ? '#c5c5c7' : '#404349',
  })), []);

  const bonds = useMemo(() => atoms.flatMap((atom, index) => atoms.slice(index + 1)
    .map((other) => ({
      a: atom.position,
      b: other.position,
      distance: new THREE.Vector3(...atom.position).distanceTo(new THREE.Vector3(...other.position)),
    }))
    .filter((bond) => bond.distance < 2.15)
    .slice(0, 2)), [atoms]);

  return (
    <group>
      {bonds.map((bond, index) => <Line key={index} points={[bond.a, bond.b]} color="#7c7e84" transparent opacity={0.42} lineWidth={0.9} />)}
      {atoms.map((atom, index) => (
        <mesh key={index} position={atom.position}>
          <sphereGeometry args={[atom.radius, 40, 40]} />
          <meshPhysicalMaterial color={atom.color} roughness={0.4} metalness={0.01} clearcoat={0.32} />
        </mesh>
      ))}
    </group>
  );
}

function AtomicScene() {
  const cloud = useMemo(() => {
    const count = 22000;
    const array = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const radius = -Math.log(Math.max(0.0001, 1 - seeded(index + 10))) * 1.18;
      const theta = seeded(index + 50) * Math.PI * 2;
      const phi = Math.acos(2 * seeded(index + 70) - 1);
      const lobe = index % 3;
      const squash = lobe === 0 ? [1, 0.46, 0.46] : lobe === 1 ? [0.46, 1, 0.46] : [0.46, 0.46, 1];
      array[index * 3] = radius * Math.sin(phi) * Math.cos(theta) * squash[0];
      array[index * 3 + 1] = radius * Math.cos(phi) * squash[1];
      array[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) * squash[2];
    }
    return array;
  }, []);

  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[cloud, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.024} color="#91a7de" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <mesh>
        <sphereGeometry args={[0.4, 48, 48]} />
        <meshStandardMaterial color="#c8d1e7" emissive="#3f4e72" emissiveIntensity={0.85} roughness={0.58} />
      </mesh>
    </group>
  );
}

function NuclearScene() {
  const nucleons = useMemo(() => Array.from({ length: 132 }, (_, index) => {
    const radius = Math.cbrt(seeded(index + 1)) * 3.18;
    const theta = seeded(index + 100) * Math.PI * 2;
    const phi = Math.acos(2 * seeded(index + 200) - 1);
    return {
      position: [radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)],
      proton: index % 2 === 0,
    };
  }), []);

  return (
    <group>
      {nucleons.map((nucleon, index) => (
        <mesh key={index} position={nucleon.position}>
          <sphereGeometry args={[0.33, 28, 28]} />
          <meshStandardMaterial
            color={nucleon.proton ? '#873542' : '#32657c'}
            emissive={nucleon.proton ? '#1d080c' : '#06161f'}
            emissiveIntensity={0.42}
            roughness={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

function ParticleScene() {
  const tracks = useMemo(() => Array.from({ length: 46 }, (_, index) => {
    const angle = seeded(index + 1) * Math.PI * 2;
    const bend = (seeded(index + 90) - 0.5) * 2.4;
    return Array.from({ length: 48 }, (_, step) => {
      const t = step / 47;
      const radius = t * 10;
      return [Math.cos(angle + bend * t) * radius, (seeded(index + 200) - 0.5) * t * 7, Math.sin(angle + bend * t) * radius];
    });
  }), []);

  return (
    <group>
      {[2, 3.4, 5, 6.8, 8.7].map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.055, 12, 240]} />
          <meshStandardMaterial color={index % 2 ? '#4b5a5f' : '#2c373c'} metalness={0.86} roughness={0.24} />
        </mesh>
      ))}
      {tracks.map((track, index) => <Line key={index} points={track} color={index % 5 === 0 ? '#b87d5a' : '#6f9c95'} transparent opacity={0.52} lineWidth={0.82} />)}
      <mesh>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
    </group>
  );
}

function SpacetimeScene() {
  const lines = useMemo(() => {
    const result = [];
    for (let x = -12; x <= 12; x += 0.65) {
      const points = [];
      for (let z = -12; z <= 12; z += 0.28) {
        const distance = Math.sqrt(x * x + z * z);
        points.push([x, -5.2 / (distance + 0.72), z]);
      }
      result.push(points);
    }
    for (let z = -12; z <= 12; z += 0.65) {
      const points = [];
      for (let x = -12; x <= 12; x += 0.28) {
        const distance = Math.sqrt(x * x + z * z);
        points.push([x, -5.2 / (distance + 0.72), z]);
      }
      result.push(points);
    }
    return result;
  }, []);

  return (
    <group rotation={[0.78, 0, 0]}>
      {lines.map((line, index) => <Line key={index} points={line} color="#98a6ad" transparent opacity={0.15} lineWidth={0.4} />)}
      <mesh position={[0, -5.1, 0]}>
        <sphereGeometry args={[1.72, 96, 96]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0, -5.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.55, 0.12, 28, 320]} />
        <meshBasicMaterial color="#d8e4ea" transparent opacity={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
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

const DESKTOP_SCENE_OFFSETS = {
  present: [4.25, -0.1],
  'connected-earth': [4.25, -0.05],
  planetary: [4.25, -0.05],
  dyson: [3.05, 0],
  galaxy: [2.6, 0],
  'cosmic-web': [1.8, 0],
  multiverse: [1.4, 0],
  reality: [1.2, 0],
  material: [3.2, 0],
  biology: [3.0, 0],
  molecular: [2.8, 0],
  atomic: [2.8, 0],
  nuclear: [3.0, 0],
  particle: [2.2, 0],
  spacetime: [2.0, 0],
};

function SceneLayer({ progress, mobile }) {
  return SCALE_SECTIONS.map((section, index) => {
    if (Math.abs(index - progress) > 1.5) return null;
    const Scene = SCENES[section.scene];
    const distance = Math.abs(index - progress);
    const sceneScale = mobile ? 1 : 1 - Math.min(distance, 1) * 0.045;
    const [offsetX, offsetY] = mobile ? [0, 0] : (DESKTOP_SCENE_OFFSETS[section.scene] || [2.2, 0]);

    return (
      <group
        key={section.id}
        position={[offsetX, offsetY, -index * SECTION_SPACING]}
        scale={sceneScale}
      >
        <Scene />
      </group>
    );
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
        gl.toneMappingExposure = 1.08;
        onReady?.();
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          onError?.();
        }, { once: true });
      }}
    >
      <color attach="background" args={['#010104']} />
      <fogExp2 attach="fog" args={['#010104', mobile ? 0.01 : 0.006]} />
      <ambientLight intensity={0.055} />
      <directionalLight position={[8, 7, 12]} intensity={3.2} color="#fff4dc" castShadow />
      <Stars radius={150} depth={95} count={mobile ? 4200 : 8500} factor={2.6} saturation={0.06} fade speed={0.13} />
      <CameraRig progress={progress} pointer={pointer} reducedMotion={reducedMotion} mobile={mobile} />
      <SceneLayer progress={progress} mobile={mobile} />
      <EffectComposer multisampling={mobile ? 0 : 4}>
        <Bloom intensity={0.44} luminanceThreshold={0.86} luminanceSmoothing={0.16} mipmapBlur />
        <Noise opacity={0.005} />
        <Vignette offset={0.24} darkness={0.52} />
      </EffectComposer>
    </Canvas>
  );
}
