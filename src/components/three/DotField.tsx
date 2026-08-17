"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getAudioLevels } from "@/lib/audioAnalyser";

interface DotFieldProps {
  /** Nombre de points formant la sphère organique */
  count?: number;
  /** Rayon de base de la forme */
  radius?: number;
  /** Taille aléatoire des points (avant modulation par le shader) */
  sizeRange?: [number, number];
  color?: string;
  /** Intensité de la déformation (0 = sphère lisse, 1+ = très bosselée) */
  amplitude?: number;
  /** Échelle spatiale du bruit — plus haut = bosses plus petites et nombreuses */
  noiseFrequency?: number;
  /** Vitesse de la respiration organique au repos (sans musique) */
  noiseSpeed?: number;
  /** Vitesse de rotation globale de la forme */
  rotationSpeed?: number;
}

// --- Simplex noise 3D (Ashima Arts / Ian McEwan — implémentation standard GLSL) ---
const SIMPLEX_GLSL = `
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

export function DotField({
  count = 5000,
  radius = 1.7,
  // je voudrais que la size soit un random entre 0.1 et 0.5
  sizeRange = [0.1, 0.5],
  color = "#fff",
  amplitude = 0.35,
  noiseFrequency = 1.4,
  noiseSpeed = 0.15,
  rotationSpeed = 0.06,
}: DotFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const rotationY = useRef(0);

  // Distribution "sphère de Fibonacci" : répartition homogène des points
  // sur une sphère unitaire — c'est la base organique qu'on déforme ensuite.
  const { positions, seeds } = useMemo(() => {
    const positionsArray = new Float32Array(count * 3);
    const seedsArray = new Float32Array(count);
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;

      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      positionsArray[i * 3] = x;
      positionsArray[i * 3 + 1] = y;
      positionsArray[i * 3 + 2] = z;
      seedsArray[i] = Math.random();
    }
    return { positions: positionsArray, seeds: seedsArray };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return geo;
  }, [positions, seeds]);

  // Cleanup GPU memory quand le composant est démonté/remonté
  useEffect(() => {
    return () => {
      geometry.dispose();
      if (pointsRef.current) {
        const mat = pointsRef.current.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    };
  }, [geometry]);

  const timer = useMemo(() => new THREE.Timer(), []);

  useFrame((_, delta) => {
    const mat = pointsRef.current?.material;
    if (!(mat instanceof THREE.ShaderMaterial)) return;

    timer.update();
    const t = timer.getElapsed();
    const levels = getAudioLevels(); // { bass, mid, treble, overall } — tout à 0 si rien ne joue

    mat.uniforms.uTime.value = t * noiseSpeed;

    // Lissage (lerp) pour éviter des à-coups trop nerveux frame à frame
    mat.uniforms.uBass.value = THREE.MathUtils.lerp(
      mat.uniforms.uBass.value,
      levels.bass,
      0.25,
    );
    mat.uniforms.uMid.value = THREE.MathUtils.lerp(
      mat.uniforms.uMid.value,
      levels.mid,
      0.25,
    );
    mat.uniforms.uTreble.value = THREE.MathUtils.lerp(
      mat.uniforms.uTreble.value,
      levels.treble,
      0.25,
    );

    if (pointsRef.current) {
      // La rotation accélère légèrement avec l'énergie globale du son
      rotationY.current += delta * rotationSpeed * (1 + levels.overall * 0.8);
      pointsRef.current.rotation.y = rotationY.current;
      pointsRef.current.rotation.x = Math.sin(t * 0.15) * 0.15;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={{
          uTime: { value: 0 },
          uRadius: { value: radius },
          uAmplitude: { value: amplitude },
          uFrequency: { value: noiseFrequency },
          uSizeRange: { value: new THREE.Vector2(sizeRange[0], sizeRange[1]) },
          uColor: { value: new THREE.Color(color) },
          uBass: { value: 0 },
          uMid: { value: 0 },
          uTreble: { value: 0 },
        }}
        vertexShader={`
          ${SIMPLEX_GLSL}

          uniform float uTime;
          uniform float uRadius;
          uniform float uAmplitude;
          uniform float uFrequency;
          uniform vec2 uSizeRange;
          uniform float uBass;
          uniform float uMid;
          uniform float uTreble;

          attribute float aSeed;

          varying float vFace;

          void main() {
            // Direction radiale (la géométrie de base est déjà une sphère unitaire)
            vec3 p = normalize(position);

            // Deux octaves de bruit 3D : une grande vague lente + un détail plus fin
            // piloté par les aigus, pour un mouvement organique jamais identique
            // d'un point à l'autre (déphasage via aSeed).
            float n1 = snoise(p * uFrequency + uTime + aSeed * 10.0);
            float n2 = snoise(p * uFrequency * 2.6 + uTime * 1.7 + aSeed * 20.0);

            // Les basses gonflent l'ensemble de la forme (pulsation globale)
            float pulse = 1.0 + uBass * 0.9;
            float bump = (n1 * 0.7 + n2 * 0.3 * (0.4 + uTreble)) * pulse;

            float r = uRadius * (1.0 + uAmplitude * bump);
            vec3 displaced = p * r;

            vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
            vec4 mvPosition = viewMatrix * worldPos;

            // Fait varier discrètement la taille avec les médiums + le relief local
            float sizePulse = 1.0 + uMid * 0.6 + bump * 0.15;
            float size = mix(uSizeRange.x, uSizeRange.y, fract(aSeed * 100.0));
            gl_PointSize = size * sizePulse * (300.0 / max(1.0, -mvPosition.z));

            gl_Position = projectionMatrix * mvPosition;

            // Estompe légèrement les points à l'arrière pour donner du volume
            vec3 viewDir = normalize(cameraPosition - worldPos.xyz);
            vFace = dot(p, viewDir);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying float vFace;

          void main() {
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);
            if (dist > 0.5) discard;

            float edge = 1.0 - smoothstep(0.4, 0.5, dist);
            float faceAlpha = mix(0.1, 1.0, smoothstep(-0.5, 0.6, vFace));

            gl_FragColor = vec4(uColor, edge * faceAlpha);
          }
        `}
      />
    </points>
  );
}
