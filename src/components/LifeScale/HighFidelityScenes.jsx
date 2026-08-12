import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { REALISM_TEXTURES } from './realismTextures';

const SUN = new THREE.Vector3(1, 0.24, 0.82).normalize();
const DEG = Math.PI / 180;

function seeded(index) {
  const value = Math.sin(index * 918.731) * 43758.5453;
  return value - Math.floor(value);
}

function useTexture(url, color = false) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    let alive = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(url, (loaded) => {
      if (!alive) return loaded.dispose();
      loaded.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      loaded.anisotropy = 12;
      loaded.wrapS = THREE.RepeatWrapping;
      setTexture(loaded);
    }, undefined, () => undefined);
    return () => { alive = false; };
  }, [color, url]);
  return texture;
}

function latLon(lat, lon, radius = 4.08) {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
}

function arc(a, b, radius = 4.12, lift = 0.26) {
  const na = a.clone().normalize();
  const nb = b.clone().normalize();
  const angle = Math.acos(THREE.MathUtils.clamp(na.dot(nb), -1, 1));
  const denominator = Math.max(Math.sin(angle), 0.0001);
  return Array.from({ length: 38 }, (_, i) => {
    const t = i / 37;
    return na.clone().multiplyScalar(Math.sin((1 - t) * angle) / denominator)
      .add(nb.clone().multiplyScalar(Math.sin(t * angle) / denominator))
      .normalize().multiplyScalar(radius + Math.sin(Math.PI * t) * lift);
  });
}

function Atmosphere({ radius = 4.18 }) {
  const uniforms = useMemo(() => ({ uSun: { value: SUN.clone() } }), []);
  return (
    <mesh>
      <sphereGeometry args={[radius, 128, 128]} />
      <shaderMaterial
        transparent depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`varying vec3 n; varying vec3 w; void main(){vec4 p=modelMatrix*vec4(position,1.);w=p.xyz;n=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*p;}`}
        fragmentShader={`uniform vec3 uSun; varying vec3 n; varying vec3 w; void main(){vec3 v=normalize(cameraPosition-w);float rim=pow(1.-abs(dot(normalize(n),v)),3.4);float day=smoothstep(-.35,.7,dot(normalize(n),normalize(uSun)));vec3 c=mix(vec3(.015,.055,.16),vec3(.08,.42,1.),day);gl_FragColor=vec4(c,rim*mix(.16,.62,day));}`}
      />
    </mesh>
  );
}

function EarthSurface() {
  const day = useTexture(REALISM_TEXTURES.earthDay, true);
  const night = useTexture(REALISM_TEXTURES.earthNight, true);
  const specular = useTexture(REALISM_TEXTURES.earthSpecular);
  const uniforms = useMemo(() => ({ uDay: { value: day }, uNight: { value: night }, uSpecular: { value: specular }, uSun: { value: SUN.clone() } }), [day, night, specular]);
  if (!day || !night || !specular) return <mesh><sphereGeometry args={[4, 160, 160]} /><meshStandardMaterial map={day} color={day ? '#fff' : '#183a55'} roughness={0.8} /></mesh>;
  return (
    <mesh>
      <sphereGeometry args={[4, 224, 224]} />
      <shaderMaterial uniforms={uniforms}
        vertexShader={`varying vec2 uv0;varying vec3 n;varying vec3 w;void main(){uv0=uv;vec4 p=modelMatrix*vec4(position,1.);w=p.xyz;n=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*p;}`}
        fragmentShader={`uniform sampler2D uDay;uniform sampler2D uNight;uniform sampler2D uSpecular;uniform vec3 uSun;varying vec2 uv0;varying vec3 n;varying vec3 w;void main(){vec3 N=normalize(n);vec3 L=normalize(uSun);vec3 V=normalize(cameraPosition-w);float ndl=dot(N,L);float dayMix=smoothstep(-.16,.24,ndl);vec3 d=texture2D(uDay,uv0).rgb;vec3 city=texture2D(uNight,uv0).rgb;float ocean=texture2D(uSpecular,uv0).r;vec3 c=d*(.08+max(ndl,0.)*1.16)+city*pow(1.-dayMix,2.2)*2.15;vec3 H=normalize(L+V);c+=vec3(.28,.48,.78)*pow(max(dot(N,H),0.),92.)*ocean*dayMix*.82;gl_FragColor=vec4(c,1.);}`}
      />
    </mesh>
  );
}

function CloudLayer() {
  const clouds = useTexture(REALISM_TEXTURES.earthClouds);
  const ref = useRef();
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.0028; });
  if (!clouds) return null;
  return (
    <mesh ref={ref} scale={1.008} rotation={[0.015, 0.2, 0]}>
      <sphereGeometry args={[4.035, 192, 192]} />
      <meshStandardMaterial alphaMap={clouds} color="#fff" transparent opacity={0.43} alphaTest={0.09} depthWrite={false} roughness={1} />
    </mesh>
  );
}

const CITIES = [[40.7,-74],[34,-118.2],[-23.6,-46.6],[51.5,-.1],[48.9,2.4],[30,31.2],[25.2,55.3],[19.1,72.9],[1.3,103.8],[35.7,139.7],[39.9,116.4],[-33.9,151.2]];
const LINKS = [[0,1],[0,3],[0,2],[1,11],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[8,11],[9,10],[10,7]];

function Network() {
  const cities = useMemo(() => CITIES.map(([a,b]) => latLon(a,b)), []);
  const links = useMemo(() => LINKS.map(([a,b]) => arc(cities[a], cities[b])), [cities]);
  return <group>{links.map((p,i)=><Line key={i} points={p} color="#70d8ff" opacity={0.34} transparent lineWidth={0.7} />)}{cities.map((p,i)=><mesh key={i} position={p}><sphereGeometry args={[0.045,12,12]} /><meshBasicMaterial color="#bdf7ff" toneMapped={false} /></mesh>)}</group>;
}

function Earth({ network = false, scale = 1 }) {
  const ref = useRef();
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.007; });
  return <group ref={ref} scale={scale} rotation={[0.12,-1.05,-0.04]}><EarthSurface /><CloudLayer /><Atmosphere />{network && <Network />}</group>;
}

function OrbitalStations() {
  const stations = useMemo(() => Array.from({ length: 86 }, (_, i) => {
    const angle = seeded(i+2)*Math.PI*2;
    const radius = 5.1 + (i%5)*0.42 + seeded(i+90)*0.22;
    const inclination = (i%5-2)*0.075;
    const p = new THREE.Vector3(Math.cos(angle)*radius,Math.sin(angle*1.3)*radius*inclination,Math.sin(angle)*radius);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),p.clone().negate().normalize());
    return {p,q,s:.55+seeded(i+400)*.85,hab:i%19===0};
  }),[]);
  return <group>{stations.map((o,i)=><group key={i} position={o.p} quaternion={o.q} scale={o.s}><mesh><boxGeometry args={[o.hab?.44:.22,.025,o.hab?.78:.38]} /><meshPhysicalMaterial color={o.hab?'#a99566':'#657786'} metalness={.88} roughness={.23} clearcoat={.4} /></mesh><mesh position={[.2,0,0]}><boxGeometry args={[.24,.008,.3]} /><meshStandardMaterial color="#142b4a" roughness={.35} /></mesh></group>)}</group>;
}

export function PresentScene(){return <group><Earth /><mesh position={[7.2,2.1,-3.4]}><sphereGeometry args={[.9,72,72]} /><meshStandardMaterial color="#666970" roughness={1} /></mesh></group>;}
export function ConnectedEarthScene(){return <group><Earth network /><mesh position={[-7,-2,-5]}><sphereGeometry args={[.45,32,32]} /><meshStandardMaterial color="#687078" /></mesh></group>;}
export function PlanetaryScene(){return <group rotation={[0,.18,0]}><Earth network scale={1.08}/><OrbitalStations /><mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[6.35,.035,12,420]} /><meshStandardMaterial color="#788286" metalness={.92} roughness={.2} /></mesh></group>;}

function StarSurface({ radius=3.2 }) {
  const ref=useRef(); const uniforms=useMemo(()=>({t:{value:0}}),[]);
  useFrame((s)=>{if(ref.current)ref.current.uniforms.t.value=s.clock.elapsedTime;});
  return <mesh><sphereGeometry args={[radius,160,160]} /><shaderMaterial ref={ref} uniforms={uniforms} vertexShader={`varying vec3 p;varying vec3 n;void main(){p=position;n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`} fragmentShader={`uniform float t;varying vec3 p;varying vec3 n;float h(vec3 x){return fract(sin(dot(x,vec3(127.1,311.7,74.7)))*43758.5);}float no(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}float fb(vec3 x){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*no(x);x*=2.04;a*=.5;}return v;}void main(){vec3 x=normalize(p)*8.;float a=fb(x+vec3(0,t*.04,0));float b=fb(x*2.3-vec3(0,t*.025,0));float limb=pow(max(dot(n,vec3(0,0,1)),0.),.28);vec3 c=mix(vec3(1.1,.28,.025),vec3(1.8,1.15,.5),smoothstep(.34,.77,a));c*=.55+1.05*limb;c-=smoothstep(.62,.9,b)*.2;gl_FragColor=vec4(c,1.);}`} /></mesh>;
}

export function DysonScene(){
  const swarm=useMemo(()=>Array.from({length:1250},(_,i)=>{const band=i%13;const a=seeded(i+1)*Math.PI*2;const r=6.3+Math.pow(seeded(i+300),.62)*9.5;const inc=(band-6)*.038+(seeded(i+600)-.5)*.025;const p=new THREE.Vector3(Math.cos(a)*r,Math.sin(a*1.37+band)*r*inc,Math.sin(a)*r);const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),p.clone().negate().normalize());return{p,q,s:.1+seeded(i+900)*.28,hab:i%61===0};}),[]);
  return <group><StarSurface /><pointLight intensity={250} distance={100} color="#ffb45c" /><mesh scale={1.09}><sphereGeometry args={[3.2,96,96]} /><meshBasicMaterial color="#ffad58" transparent opacity={.06} side={THREE.BackSide} blending={THREE.AdditiveBlending} /></mesh>{swarm.map((o,i)=><group key={i} position={o.p} quaternion={o.q} scale={o.s}><mesh><boxGeometry args={[o.hab?1.8:1.1,.025,o.hab?.5:.7]} /><meshPhysicalMaterial color={o.hab?'#8e7b58':'#384d60'} metalness={.9} roughness={.22} /></mesh>{!o.hab&&<mesh position={[0,.02,0]}><boxGeometry args={[.92,.006,.56]} /><meshStandardMaterial color="#10263e" /></mesh>}</group>)}<mesh position={[-10,-2,-7]}><sphereGeometry args={[.65,48,48]} /><meshStandardMaterial color="#6d5744" roughness={1} /></mesh></group>;
}

export function GalaxyScene(){
  const data=useMemo(()=>{const count=82000,p=new Float32Array(count*3),c=new Float32Array(count*3);const warm=new THREE.Color('#ffd9a8'),cool=new THREE.Color('#8db4ff'),red=new THREE.Color('#bf6f62');for(let i=0;i<count;i++){const bulge=seeded(i+9)<.22;let r,a,y;if(bulge){r=Math.pow(seeded(i+20),1.8)*5.2;a=seeded(i+30)*Math.PI*2;y=(seeded(i+40)-.5)*(2.5-r*.3);}else{const arm=i%4;r=2.2+Math.pow(seeded(i+50),.56)*17;a=arm*Math.PI/2+r*.47+(seeded(i+70)-.5)*(.25+r*.055);y=(seeded(i+90)-.5)*Math.max(.12,1.3-r*.06);}p[i*3]=Math.cos(a)*r+(seeded(i+110)-.5)*.22;p[i*3+1]=y;p[i*3+2]=Math.sin(a)*r+(seeded(i+130)-.5)*.22;const q=bulge?warm:(seeded(i+150)>.7?cool:(seeded(i+160)>.9?red:warm.clone().lerp(cool,.28)));c.set([q.r,q.g,q.b],i*3);}return{p,c};},[]);const ref=useRef();useFrame((_,d)=>{if(ref.current)ref.current.rotation.y+=d*.0025;});return <group ref={ref} rotation={[.45,0,.08]}><points><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.p,3]} /><bufferAttribute attach="attributes-color" args={[data.c,3]} /></bufferGeometry><pointsMaterial size={.035} vertexColors transparent opacity={.83} depthWrite={false} blending={THREE.AdditiveBlending} /></points>{[4.8,8.2,12.3].map((r,i)=><mesh key={r} rotation={[Math.PI/2,0,i*.3]}><ringGeometry args={[r,r+1.2,256]} /><meshBasicMaterial color="#130b08" transparent opacity={.18-i*.035} side={THREE.DoubleSide} depthWrite={false} /></mesh>)}</group>;
}

function MiniGalaxy({ position, scale=1, rotation=0 }){const pts=useMemo(()=>{const n=360,a=new Float32Array(n*3);for(let i=0;i<n;i++){const arm=i%3,r=Math.pow(seeded(i+position[0]*31),.58)*1.3,t=arm*Math.PI*2/3+r*1.7+(seeded(i+80)-.5)*.4;a[i*3]=Math.cos(t)*r;a[i*3+1]=(seeded(i+90)-.5)*.1;a[i*3+2]=Math.sin(t)*r;}return a;},[position]);return <group position={position} scale={scale} rotation={[.5,rotation,0]}><points><bufferGeometry><bufferAttribute attach="attributes-position" args={[pts,3]} /></bufferGeometry><pointsMaterial size={.045} color="#d8ddff" transparent opacity={.8} depthWrite={false} blending={THREE.AdditiveBlending} /></points></group>;}

export function CosmicWebScene(){const nodes=useMemo(()=>Array.from({length:74},(_,i)=>new THREE.Vector3((seeded(i+1)-.5)*31,(seeded(i+100)-.5)*18,(seeded(i+200)-.5)*25)),[]);const links=useMemo(()=>{const out=[];nodes.forEach((n,i)=>nodes.slice(i+1).map(o=>({o,d:n.distanceTo(o)})).sort((a,b)=>a.d-b.d).slice(0,3).forEach(({o,d})=>{if(d<8.4)out.push([n,o]);}));return out;},[nodes]);return <group>{links.map((l,i)=><Line key={i} points={l} color="#6f7fa4" opacity={.13} transparent lineWidth={.4} />)}{nodes.map((n,i)=><MiniGalaxy key={i} position={n} scale={.25+seeded(i+500)*.55} rotation={seeded(i+700)*Math.PI} />)}</group>;}

export function MultiverseScene(){const bubbles=useMemo(()=>Array.from({length:25},(_,i)=>({p:[(seeded(i+2)-.5)*25,(seeded(i+200)-.5)*15,(seeded(i+400)-.5)*20],s:.65+seeded(i+600)*2.2,c:new THREE.Color().setHSL(.58+seeded(i+800)*.2,.35,.5)})),[]);return <group>{bubbles.map((b,i)=><group key={i} position={b.p} scale={b.s}><mesh><sphereGeometry args={[1,64,64]} /><meshPhysicalMaterial color={b.c} transparent opacity={.08} transmission={.94} roughness={.06} thickness={.8} side={THREE.DoubleSide} /></mesh><MiniGalaxy position={[0,0,0]} scale={.45} rotation={i} /></group>)}</group>;}

export function RealityScene(){const tunnels=useMemo(()=>Array.from({length:9},(_,i)=>({p:[(seeded(i+1)-.5)*15,(seeded(i+20)-.5)*9,(seeded(i+40)-.5)*13],r:1.5+seeded(i+70)*2.6,rot:[seeded(i+90)*Math.PI,seeded(i+100)*Math.PI,seeded(i+110)*Math.PI]})),[]);return <group>{tunnels.map((o,i)=><mesh key={i} position={o.p} rotation={o.rot}><torusKnotGeometry args={[o.r,.035,260,14,2+i%3,3+i%4]} /><meshBasicMaterial color={i%2?'#a68dcc':'#dbe6ff'} transparent opacity={.22} blending={THREE.AdditiveBlending} /></mesh>)}<mesh><icosahedronGeometry args={[2.4,6]} /><meshPhysicalMaterial color="#b8a6d0" wireframe transparent opacity={.13} /></mesh></group>;}

function Dust({ count=2500, spread=[14,10,12], color='#8fa0aa', size=.03, opacity=.22 }){const p=useMemo(()=>{const a=new Float32Array(count*3);for(let i=0;i<count;i++){a[i*3]=(seeded(i+1)-.5)*spread[0];a[i*3+1]=(seeded(i+20)-.5)*spread[1];a[i*3+2]=(seeded(i+40)-.5)*spread[2];}return a;},[count,spread]);return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[p,3]} /></bufferGeometry><pointsMaterial size={size} color={color} opacity={opacity} transparent depthWrite={false} /></points>;}

export function MaterialScene(){const atoms=useMemo(()=>Array.from({length:210},(_,i)=>{const x=(i%15)-7,z=Math.floor(i/15)-6.5;return{x:x*.58+(z%2)*.29,z:z*.5,y:Math.sin(x*.7+z*.5)*.08};}),[]);return <group rotation={[-.34,.5,.05]}><mesh position={[0,-1.05,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[22,18,1,1]} /><meshStandardMaterial color="#191d21" metalness={.82} roughness={.34} /></mesh>{atoms.map((a,i)=><React.Fragment key={i}><mesh position={[a.x,a.y,a.z]}><sphereGeometry args={[.16,24,24]} /><meshPhysicalMaterial color={i%19===0?'#d9a369':'#6f7880'} metalness={.7} roughness={.25} clearcoat={.35} /></mesh>{i%15!==14&&<Line points={[[a.x,a.y,a.z],[atoms[i+1].x,atoms[i+1].y,atoms[i+1].z]]} color="#4f5961" opacity={.7} transparent lineWidth={1.1} />}</React.Fragment>)}<mesh position={[2.4,2.2,1.4]} rotation={[.3,.2,-.5]}><cylinderGeometry args={[.22,.12,4,24]} /><meshStandardMaterial color="#8e969e" metalness={.9} roughness={.2} /></mesh><pointLight position={[2.4,.5,1.4]} color="#ffb36c" intensity={18} distance={8} /><Dust color="#c2c8cc" opacity={.18} /></group>;}

export function BiologyScene(){const helix=useMemo(()=>Array.from({length:220},(_,i)=>{const t=i/219*Math.PI*12-Math.PI*6;return{a:[Math.cos(t)*2.1,t*.27,Math.sin(t)*2.1],b:[Math.cos(t+Math.PI)*2.1,t*.27,Math.sin(t+Math.PI)*2.1]};}),[]);return <group><mesh scale={1.15}><sphereGeometry args={[7,96,96]} /><meshPhysicalMaterial color="#183b48" transparent opacity={.1} transmission={.72} roughness={.48} side={THREE.BackSide} /></mesh><group rotation={[.12,.45,Math.PI/2]}>{helix.map((p,i)=><React.Fragment key={i}><mesh position={p.a}><sphereGeometry args={[.1,16,16]} /><meshPhysicalMaterial color="#b14f72" roughness={.36} /></mesh><mesh position={p.b}><sphereGeometry args={[.1,16,16]} /><meshPhysicalMaterial color="#54a0b5" roughness={.36} /></mesh>{i%4===0&&<Line points={[p.a,p.b]} color="#d6c7de" opacity={.48} transparent lineWidth={1} />}</React.Fragment>)}</group><Dust count={1800} spread={[15,12,14]} color="#6fb6b1" size={.05} opacity={.18} />{Array.from({length:28},(_,i)=><mesh key={i} position={[(seeded(i+2)-.5)*13,(seeded(i+20)-.5)*9,(seeded(i+40)-.5)*11]}><icosahedronGeometry args={[.18+seeded(i+70)*.25,2]} /><meshPhysicalMaterial color="#769599" roughness={.5} /></mesh>)}</group>;}

export function MolecularScene(){const central=useMemo(()=>Array.from({length:55},(_,i)=>({p:[(seeded(i+1)-.5)*7,(seeded(i+30)-.5)*5,(seeded(i+60)-.5)*5],r:.14+seeded(i+90)*.22,c:i%7===0?'#bd404d':i%5===0?'#3868a8':i%3===0?'#ddd':'#444'})),[]);const bonds=useMemo(()=>central.flatMap((a,i)=>central.slice(i+1).map(b=>({a:a.p,b:b.p,d:new THREE.Vector3(...a.p).distanceTo(new THREE.Vector3(...b.p))})).filter(x=>x.d<1.65).slice(0,2)),[central]);return <group><Dust count={4200} spread={[17,12,15]} color="#9bc5d4" size={.035} opacity={.25} />{bonds.map((b,i)=><Line key={i} points={[b.a,b.b]} color="#a9adb4" opacity={.58} transparent lineWidth={1.2} />)}{central.map((a,i)=><mesh key={i} position={a.p}><sphereGeometry args={[a.r,32,32]} /><meshPhysicalMaterial color={a.c} roughness={.3} clearcoat={.35} /></mesh>)}<pointLight position={[4,3,5]} intensity={14} color="#b8dcff" distance={15} /></group>;}

export function AtomicScene(){const cloud=useMemo(()=>{const n=36000,a=new Float32Array(n*3);for(let i=0;i<n;i++){const l=i%4,r=-Math.log(Math.max(.0001,1-seeded(i+1)))*1.05,t=seeded(i+20)*Math.PI*2,p=Math.acos(2*seeded(i+40)-1),s=l===0?[1,.38,.38]:l===1?[.38,1,.38]:l===2?[.38,.38,1]:[.75,.75,.75];a[i*3]=r*Math.sin(p)*Math.cos(t)*s[0];a[i*3+1]=r*Math.cos(p)*s[1];a[i*3+2]=r*Math.sin(p)*Math.sin(t)*s[2];}return a;},[]);return <group><points><bufferGeometry><bufferAttribute attach="attributes-position" args={[cloud,3]} /></bufferGeometry><pointsMaterial size={.026} color="#8db4ff" opacity={.23} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points><mesh><sphereGeometry args={[.48,48,48]} /><meshStandardMaterial color="#e0b24f" emissive="#8b4318" emissiveIntensity={1.4} roughness={.45} /></mesh><Dust count={1000} spread={[14,10,12]} color="#445b78" opacity={.12} /></group>;}

export function NuclearScene(){const nucleons=useMemo(()=>Array.from({length:168},(_,i)=>{const r=Math.cbrt(seeded(i+1))*3.3,t=seeded(i+40)*Math.PI*2,p=Math.acos(2*seeded(i+80)-1);return{p:[r*Math.sin(p)*Math.cos(t),r*Math.cos(p),r*Math.sin(p)*Math.sin(t)],proton:i%2===0};}),[]);return <group><Dust count={3000} spread={[13,10,12]} color="#8c6fff" size={.025} opacity={.18} />{nucleons.map((n,i)=><mesh key={i} position={n.p}><sphereGeometry args={[.34,28,28]} /><meshPhysicalMaterial color={n.proton?'#a53f52':'#326c91'} roughness={.44} clearcoat={.2} emissive={n.proton?'#26070d':'#061923'} emissiveIntensity={.45} /></mesh>)}<pointLight position={[5,4,6]} intensity={12} color="#9fc8ff" /></group>;}

export function ParticleScene(){const tracks=useMemo(()=>Array.from({length:58},(_,i)=>{const a=seeded(i+1)*Math.PI*2,b=(seeded(i+70)-.5)*2.9;return Array.from({length:60},(_,j)=>{const t=j/59,r=t*10;return[Math.cos(a+b*t)*r,(seeded(i+140)-.5)*t*7,Math.sin(a+b*t)*r];});}),[]);return <group rotation={[Math.PI/2,0,0]}>{[2,3.3,4.7,6.2,8].map((r,i)=><mesh key={r}><torusGeometry args={[r,.12,14,220]} /><meshStandardMaterial color={i%2?'#354047':'#1d252b'} metalness={.86} roughness={.26} /></mesh>)}{Array.from({length:26},(_,i)=><mesh key={i} rotation={[0,0,i/26*Math.PI*2]} position={[0,0,0]}><boxGeometry args={[.08,9.2,.18]} /><meshStandardMaterial color="#53616a" metalness={.8} /></mesh>)}{tracks.map((t,i)=><Line key={i} points={t} color={i%7===0?'#f0a062':'#75c5ba'} opacity={.62} transparent lineWidth={1} />)}<pointLight intensity={26} color="#fff3ca" distance={18} /></group>;}

export function SpacetimeScene(){const disk=useMemo(()=>{const n=30000,a=new Float32Array(n*3),c=new Float32Array(n*3);const hot=new THREE.Color('#fff3d0'),red=new THREE.Color('#e17340');for(let i=0;i<n;i++){const r=2.2+Math.pow(seeded(i+1),.72)*8,t=seeded(i+20)*Math.PI*2;a[i*3]=Math.cos(t)*r;a[i*3+1]=(seeded(i+40)-.5)*(.08+r*.012);a[i*3+2]=Math.sin(t)*r;const q=hot.clone().lerp(red,THREE.MathUtils.clamp((r-2.2)/8,0,1));c.set([q.r,q.g,q.b],i*3);}return{a,c};},[]);return <group rotation={[.72,0,0]}><points><bufferGeometry><bufferAttribute attach="attributes-position" args={[disk.a,3]} /><bufferAttribute attach="attributes-color" args={[disk.c,3]} /></bufferGeometry><pointsMaterial size={.035} vertexColors opacity={.76} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points><mesh><sphereGeometry args={[1.75,96,96]} /><meshBasicMaterial color="#000" /></mesh><mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[2.25,.09,22,320]} /><meshBasicMaterial color="#fff" toneMapped={false} /></mesh></group>;}
