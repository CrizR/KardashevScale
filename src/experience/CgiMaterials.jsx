import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const SUN_DIRECTION = new THREE.Vector3(0.88, 0.24, 0.72).normalize();

export function CgiEarthSurface({ dayMap, nightMap, specularMap, normalMap, civilization = 0 }) {
  const uniforms = useMemo(() => ({
    uDayMap: { value: dayMap },
    uNightMap: { value: nightMap },
    uSpecularMap: { value: specularMap },
    uNormalMap: { value: normalMap },
    uSunDirection: { value: SUN_DIRECTION.clone() },
    uCivilization: { value: civilization },
  }), [dayMap, nightMap, specularMap, normalMap, civilization]);

  return (
    <shaderMaterial
      uniforms={uniforms}
      vertexShader={`
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        varying vec3 vTangent;
        varying vec3 vBitangent;
        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vec3 tangent = normalize(cross(vec3(0.0, 1.0, 0.0), vWorldNormal));
          if (length(tangent) < 0.01) tangent = vec3(1.0, 0.0, 0.0);
          vTangent = tangent;
          vBitangent = normalize(cross(vWorldNormal, tangent));
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `}
      fragmentShader={`
        uniform sampler2D uDayMap;
        uniform sampler2D uNightMap;
        uniform sampler2D uSpecularMap;
        uniform sampler2D uNormalMap;
        uniform vec3 uSunDirection;
        uniform float uCivilization;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        varying vec3 vTangent;
        varying vec3 vBitangent;

        float saturate(float x) { return clamp(x, 0.0, 1.0); }

        void main() {
          vec3 baseNormal = normalize(vWorldNormal);
          vec3 normalTex = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
          normalTex.xy *= 0.42;
          vec3 normal = normalize(
            vTangent * normalTex.x +
            vBitangent * normalTex.y +
            baseNormal * max(normalTex.z, 0.35)
          );

          vec3 sun = normalize(uSunDirection);
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float ndl = dot(normal, sun);
          float dayWeight = smoothstep(-0.12, 0.18, ndl);
          float diffuse = 0.06 + max(ndl, 0.0) * 1.18;

          vec3 dayColor = texture2D(uDayMap, vUv).rgb;
          vec3 nightColor = texture2D(uNightMap, vUv).rgb;
          float water = texture2D(uSpecularMap, vUv).r;

          vec3 color = dayColor * diffuse;
          float nightMask = pow(1.0 - dayWeight, 2.2);
          float cityBoost = 1.15 + uCivilization * 2.7;
          color += nightColor * nightMask * cityBoost;

          vec3 halfVector = normalize(sun + viewDirection);
          float broadOcean = pow(saturate(dot(normal, halfVector)), 52.0);
          float tightOcean = pow(saturate(dot(normal, halfVector)), 180.0);
          float oceanMask = smoothstep(0.12, 0.82, water) * dayWeight;
          color += vec3(0.13, 0.28, 0.48) * broadOcean * oceanMask * 0.52;
          color += vec3(0.78, 0.9, 1.0) * tightOcean * oceanMask * 0.88;

          float fresnel = pow(1.0 - saturate(dot(normal, viewDirection)), 4.2);
          color += vec3(0.012, 0.045, 0.11) * fresnel;

          float terminatorWarmth = exp(-pow((ndl + 0.02) * 9.0, 2.0));
          color += vec3(0.34, 0.075, 0.018) * terminatorWarmth * 0.16;

          gl_FragColor = vec4(color, 1.0);
        }
      `}
    />
  );
}

export function CgiCloudMaterial({ cloudMap, opacity = 0.46 }) {
  const material = useRef();
  const uniforms = useMemo(() => ({
    uCloudMap: { value: cloudMap },
    uSunDirection: { value: SUN_DIRECTION.clone() },
    uOpacity: { value: opacity },
    uTime: { value: 0 },
  }), [cloudMap, opacity]);

  useFrame((state) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <shaderMaterial
      ref={material}
      transparent
      depthWrite={false}
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
        uniform sampler2D uCloudMap;
        uniform vec3 uSunDirection;
        uniform float uOpacity;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec2 uvA = vec2(fract(vUv.x + uTime * 0.00055), vUv.y);
          vec2 uvB = vec2(fract(vUv.x - uTime * 0.00027 + 0.37), clamp(vUv.y * 0.997 + 0.0015, 0.0, 1.0));
          float a = texture2D(uCloudMap, uvA).r;
          float b = texture2D(uCloudMap, uvB).r;
          float density = smoothstep(0.28, 0.83, max(a, b * 0.76));
          density *= smoothstep(0.0, 0.025, vUv.y) * smoothstep(1.0, 0.975, vUv.y);
          vec3 normal = normalize(vWorldNormal);
          float light = 0.18 + max(dot(normal, normalize(uSunDirection)), 0.0) * 0.94;
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float silver = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.6);
          vec3 cloudColor = vec3(0.72, 0.77, 0.82) * light + vec3(0.42, 0.55, 0.74) * silver * 0.3;
          gl_FragColor = vec4(cloudColor, density * uOpacity);
        }
      `}
    />
  );
}

export function CgiAtmosphere({ color = '#52aaff', intensity = 1 }) {
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(color) },
    uSunDirection: { value: SUN_DIRECTION.clone() },
    uIntensity: { value: intensity },
  }), [color, intensity]);

  return (
    <shaderMaterial
      transparent
      depthWrite={false}
      side={THREE.BackSide}
      blending={THREE.AdditiveBlending}
      toneMapped={false}
      uniforms={uniforms}
      vertexShader={`
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `}
      fragmentShader={`
        uniform vec3 uColor;
        uniform vec3 uSunDirection;
        uniform float uIntensity;
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        void main() {
          vec3 normal = normalize(vWorldNormal);
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float horizon = pow(1.0 - abs(dot(normal, viewDirection)), 4.4);
          float sunAmount = smoothstep(-0.42, 0.72, dot(normal, normalize(uSunDirection)));
          float forward = pow(max(dot(viewDirection, normalize(uSunDirection)), 0.0), 18.0);
          vec3 nightColor = vec3(0.015, 0.07, 0.2);
          vec3 dayColor = uColor;
          vec3 scatter = mix(nightColor, dayColor, sunAmount);
          scatter += vec3(1.0, 0.22, 0.045) * forward * 0.35;
          float alpha = horizon * mix(0.12, 0.72, sunAmount) * uIntensity;
          gl_FragColor = vec4(scatter, alpha);
        }
      `}
    />
  );
}

export function CgiSunMaterial() {
  const material = useRef();
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((state) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <shaderMaterial
      ref={material}
      uniforms={uniforms}
      toneMapped={false}
      vertexShader={`
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        uniform float uTime;
        varying vec3 vPosition;
        varying vec3 vNormal;
        float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123); }
        float noise(vec3 p) {
          vec3 i = floor(p); vec3 f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
        }
        float fbm(vec3 p) { float value=0.0; float amplitude=0.5; for(int i=0;i<7;i++){value+=amplitude*noise(p);p=p*2.03+vec3(0.17);amplitude*=0.5;} return value; }
        void main() {
          vec3 p = normalize(vPosition);
          float macro = fbm(p * 5.2 + vec3(0.0, uTime * 0.025, 0.0));
          float granulation = fbm(p * 24.0 - vec3(uTime * 0.017, 0.0, 0.0));
          float cells = smoothstep(0.38, 0.72, granulation);
          float lanes = smoothstep(0.62, 0.89, fbm(p * 11.0 + vec3(uTime * 0.01)));
          float spots = smoothstep(0.67, 0.84, fbm(p * 3.5 - vec3(0.0, uTime * 0.008, 0.0))) * smoothstep(0.42, 0.62, macro);
          float limb = pow(max(dot(normalize(vNormal), vec3(0.0,0.0,1.0)), 0.0), 0.31);
          vec3 low = vec3(0.62, 0.075, 0.006);
          vec3 high = vec3(1.6, 0.73, 0.12);
          vec3 color = mix(low, high, cells * 0.72 + macro * 0.38);
          color *= 0.45 + limb * 1.25;
          color -= lanes * vec3(0.2, 0.06, 0.01);
          color *= 1.0 - spots * 0.52;
          gl_FragColor = vec4(color, 1.0);
        }
      `}
    />
  );
}

export function CgiPointMaterial({ size = 0.05, opacity = 0.8, useVertexColors = false }) {
  const uniforms = useMemo(() => ({
    uSize: { value: size },
    uOpacity: { value: opacity },
  }), [size, opacity]);

  return (
    <shaderMaterial
      transparent
      depthWrite={false}
      blending={THREE.AdditiveBlending}
      vertexColors={useVertexColors}
      toneMapped={false}
      uniforms={uniforms}
      vertexShader={`
        uniform float uSize;
        varying vec3 vColor;
        void main() {
          ${useVertexColors ? 'vColor = color;' : 'vColor = vec3(0.82, 0.89, 1.0);'}
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float perspective = clamp(180.0 / max(1.0, -mvPosition.z), 0.45, 3.5);
          gl_PointSize = uSize * 90.0 * perspective;
          gl_Position = projectionMatrix * mvPosition;
        }
      `}
      fragmentShader={`
        uniform float uOpacity;
        varying vec3 vColor;
        void main() {
          vec2 centered = gl_PointCoord - 0.5;
          float r = length(centered);
          if (r > 0.5) discard;
          float core = exp(-r * r * 85.0);
          float halo = exp(-r * r * 15.0) * 0.36;
          float alpha = (core + halo) * uOpacity;
          gl_FragColor = vec4(vColor * (1.0 + core * 1.8), alpha);
        }
      `}
    />
  );
}
