import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './SpectralGhost.css';
import Footer from "../Footer/Footer";


gsap.registerPlugin(ScrollTrigger);

// ── Fluorescent color palette ─────────────────────────────────────────────────
const fluorescentColors: Record<string, number> = {
  cyan: 0x00ffff,
  lime: 0x00ff00,
  magenta: 0xff00ff,
  yellow: 0xffff00,
  orange: 0xff4500,
  pink: 0xff1493,
  purple: 0x9400d3,
  blue: 0x0080ff,
  green: 0x00ff80,
  red: 0xff0040,
  teal: 0x00ffaa,
  violet: 0x8a2be2,
};

// ── Production parameters ─────────────────────────────────────────────────────
const params = {
  bodyColor: 0x0f2027,
  glowColor: 'orange',
  eyeGlowColor: 'green',
  ghostOpacity: 0.58,
  emissiveIntensity: 2.5,
  pulseSpeed: 1.6,
  pulseIntensity: 0.6,
  eyeGlowDecay: 0.95,
  eyeGlowResponse: 0.31,
  rimLightIntensity: 1.8,
  followSpeed: 0.075,
  wobbleAmount: 0.35,
  floatSpeed: 1.6,
  movementThreshold: 0.07,
  particleCount: 250,
  particleDecayRate: 0.005,
  particleColor: 'orange',
  createParticlesOnlyWhenMoving: true,
  particleCreationRate: 5,
  revealRadius: 44,
  fadeStrength: 3,
  baseOpacity: 0.95,
  revealOpacity: 0.5,
  fireflyGlowIntensity: 5.0,
  fireflySpeed: 0.3,
  analogIntensity: 0,
  analogGrain: 0.4,
  analogBleeding: 1.0,
  analogVSync: 1.0,
  analogScanlines: 1.0,
  analogVignette: 1.0,
  analogJitter: 0.4,
  limboMode: false,
};

// ── Analog Decay Shader ───────────────────────────────────────────────────────
const analogDecayShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0.0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uAnalogGrain: { value: params.analogGrain },
    uAnalogBleeding: { value: params.analogBleeding },
    uAnalogVSync: { value: params.analogVSync },
    uAnalogScanlines: { value: params.analogScanlines },
    uAnalogVignette: { value: params.analogVignette },
    uAnalogJitter: { value: params.analogJitter },
    uAnalogIntensity: { value: params.analogIntensity },
    uLimboMode: { value: 0.0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uAnalogGrain;
    uniform float uAnalogBleeding;
    uniform float uAnalogVSync;
    uniform float uAnalogScanlines;
    uniform float uAnalogVignette;
    uniform float uAnalogJitter;
    uniform float uAnalogIntensity;
    uniform float uLimboMode;
    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    float random(float x) {
      return fract(sin(x) * 43758.5453123);
    }
    float gaussian(float z, float u, float o) {
      return (1.0 / (o * sqrt(2.0 * 3.1415))) * exp(-(((z - u) * (z - u)) / (2.0 * (o * o))));
    }
    vec3 grain(vec2 uv, float time, float intensity) {
      float seed = dot(uv, vec2(12.9898, 78.233));
      float noise = fract(sin(seed) * 43758.5453 + time * 2.0);
      noise = gaussian(noise, 0.0, 0.5 * 0.5);
      return vec3(noise) * intensity;
    }

    void main() {
      vec2 uv = vUv;
      float time = uTime * 1.8;

      vec2 jitteredUV = uv;
      if (uAnalogJitter > 0.01) {
        float jitterAmount = (random(vec2(floor(time * 60.0))) - 0.5) * 0.003 * uAnalogJitter * uAnalogIntensity;
        jitteredUV.x += jitterAmount;
        jitteredUV.y += (random(vec2(floor(time * 30.0) + 1.0)) - 0.5) * 0.001 * uAnalogJitter * uAnalogIntensity;
      }

      if (uAnalogVSync > 0.01) {
        float vsyncRoll = sin(time * 2.0 + uv.y * 100.0) * 0.02 * uAnalogVSync * uAnalogIntensity;
        float vsyncChance = step(0.95, random(vec2(floor(time * 4.0))));
        jitteredUV.y += vsyncRoll * vsyncChance;
      }

      vec4 color = texture2D(tDiffuse, jitteredUV);

      if (uAnalogBleeding > 0.01) {
        float bleedAmount = 0.012 * uAnalogBleeding * uAnalogIntensity;
        float offsetPhase = time * 1.5 + uv.y * 20.0;
        vec2 redOffset = vec2(sin(offsetPhase) * bleedAmount, 0.0);
        vec2 blueOffset = vec2(-sin(offsetPhase * 1.1) * bleedAmount * 0.8, 0.0);
        float r = texture2D(tDiffuse, jitteredUV + redOffset).r;
        float g = texture2D(tDiffuse, jitteredUV).g;
        float b = texture2D(tDiffuse, jitteredUV + blueOffset).b;
        color = vec4(r, g, b, color.a);
      }

      if (uAnalogGrain > 0.01) {
        vec3 grainEffect = grain(uv, time, 0.075 * uAnalogGrain * uAnalogIntensity);
        grainEffect *= (1.0 - color.rgb);
        color.rgb += grainEffect;
      }

      if (uAnalogScanlines > 0.01) {
        float scanlineFreq = 600.0 + uAnalogScanlines * 400.0;
        float scanlinePattern = sin(uv.y * scanlineFreq) * 0.5 + 0.5;
        float scanlineIntensity = 0.1 * uAnalogScanlines * uAnalogIntensity;
        color.rgb *= (1.0 - scanlinePattern * scanlineIntensity);
        float horizontalLines = sin(uv.y * scanlineFreq * 0.1) * 0.02 * uAnalogScanlines * uAnalogIntensity;
        color.rgb *= (1.0 - horizontalLines);
      }

      if (uAnalogVignette > 0.01) {
        vec2 vignetteUV = (uv - 0.5) * 2.0;
        float vignette = 1.0 - dot(vignetteUV, vignetteUV) * 0.3 * uAnalogVignette * uAnalogIntensity;
        color.rgb *= vignette;
      }

      if (uLimboMode > 0.5) {
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = vec3(gray);
      }

      gl_FragColor = color;
    }
  `,
};

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════
const SpectralGhost = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  // Cream overlay sits ABOVE the Three.js canvas so GSAP can fade it away
  const colorOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = canvasContainerRef.current;
    if (!section || !container) return;

    const width = section.offsetWidth;
    const height = section.offsetHeight;

    // ── Scene ───────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 20;

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
      premultipliedAlpha: false,
      stencil: false,
      depth: true,
      preserveDrawingBuffer: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── Post-processing ─────────────────────────────────────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.3,   // strength
      1.25,  // radius
      0.0    // threshold
    );
    composer.addPass(bloomPass);

    const analogDecayPass = new ShaderPass(analogDecayShader);
    analogDecayPass.uniforms.uResolution.value.set(width, height);
    composer.addPass(analogDecayPass);
    composer.addPass(new OutputPass());

    // ── Atmosphere plane ────────────────────────────────────────────────────
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ghostPosition: { value: new THREE.Vector3(0, 0, 0) },
        revealRadius: { value: params.revealRadius },
        fadeStrength: { value: params.fadeStrength },
        baseOpacity: { value: params.baseOpacity },
        revealOpacity: { value: params.revealOpacity },
        time: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 ghostPosition;
        uniform float revealRadius;
        uniform float fadeStrength;
        uniform float baseOpacity;
        uniform float revealOpacity;
        uniform float time;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        void main() {
          float dist = distance(vWorldPosition.xy, ghostPosition.xy);
          float dynamicRadius = revealRadius + sin(time * 2.0) * 5.0;
          float reveal = smoothstep(dynamicRadius * 0.2, dynamicRadius, dist);
          reveal = pow(reveal, fadeStrength);
          float opacity = mix(revealOpacity, baseOpacity, reveal);
          gl_FragColor = vec4(0.001, 0.001, 0.002, opacity);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(
      new THREE.PlaneGeometry(300, 300),
      atmosphereMaterial,
    );
    atmosphere.position.z = -50;
    atmosphere.renderOrder = -100;
    scene.add(atmosphere);

    scene.add(new THREE.AmbientLight(0x0a0a2e, 0.08));

    // ── Ghost body ──────────────────────────────────────────────────────────
    const ghostGroup = new THREE.Group();
    scene.add(ghostGroup);

    const ghostGeometry = new THREE.SphereGeometry(2, 40, 40);
    const posAttr = ghostGeometry.getAttribute('position');
    const positions = posAttr.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      if (positions[i + 1] < -0.2) {
        const x = positions[i];
        const z = positions[i + 2];
        positions[i + 1] =
          -2.0 +
          Math.sin(x * 5) * 0.35 +
          Math.cos(z * 4) * 0.25 +
          Math.sin((x + z) * 3) * 0.15;
      }
    }
    ghostGeometry.computeVertexNormals();

    const ghostMaterial = new THREE.MeshStandardMaterial({
      color: params.bodyColor,
      transparent: true,
      opacity: params.ghostOpacity,
      emissive: new THREE.Color(fluorescentColors[params.glowColor]),
      emissiveIntensity: params.emissiveIntensity,
      roughness: 0.02,
      metalness: 0.0,
      side: THREE.DoubleSide,
      alphaTest: 0.1,
    });
    const ghostBody = new THREE.Mesh(ghostGeometry, ghostMaterial);
    ghostGroup.add(ghostBody);

    // Rim lights
    const rim1 = new THREE.DirectionalLight(0x4a90e2, params.rimLightIntensity);
    rim1.position.set(-8, 6, -4);
    scene.add(rim1);
    const rim2 = new THREE.DirectionalLight(0x50e3c2, params.rimLightIntensity * 0.7);
    rim2.position.set(8, -4, -6);
    scene.add(rim2);

    // ── Eyes ─────────────────────────────────────────────────────────────────
    const eyeColor = fluorescentColors[params.eyeGlowColor];
    const socketGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const socketMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const leftSocket = new THREE.Mesh(socketGeo, socketMat);
    leftSocket.position.set(-0.7, 0.6, 1.9);
    leftSocket.scale.set(1.1, 1.0, 0.6);
    ghostGroup.add(leftSocket);

    const rightSocket = new THREE.Mesh(socketGeo, socketMat);
    rightSocket.position.set(0.7, 0.6, 1.9);
    rightSocket.scale.set(1.1, 1.0, 0.6);
    ghostGroup.add(rightSocket);

    const eyeGeo = new THREE.SphereGeometry(0.3, 12, 12);
    const leftEyeMat = new THREE.MeshBasicMaterial({ color: eyeColor, transparent: true, opacity: 0 });
    const leftEye = new THREE.Mesh(eyeGeo, leftEyeMat);
    leftEye.position.set(-0.7, 0.6, 2.0);
    ghostGroup.add(leftEye);

    const rightEyeMat = new THREE.MeshBasicMaterial({ color: eyeColor, transparent: true, opacity: 0 });
    const rightEye = new THREE.Mesh(eyeGeo, rightEyeMat);
    rightEye.position.set(0.7, 0.6, 2.0);
    ghostGroup.add(rightEye);

    const outerGeo = new THREE.SphereGeometry(0.525, 12, 12);
    const leftOuterMat = new THREE.MeshBasicMaterial({ color: eyeColor, transparent: true, opacity: 0, side: THREE.BackSide });
    const leftOuter = new THREE.Mesh(outerGeo, leftOuterMat);
    leftOuter.position.set(-0.7, 0.6, 1.95);
    ghostGroup.add(leftOuter);

    const rightOuterMat = new THREE.MeshBasicMaterial({ color: eyeColor, transparent: true, opacity: 0, side: THREE.BackSide });
    const rightOuter = new THREE.Mesh(outerGeo, rightOuterMat);
    rightOuter.position.set(0.7, 0.6, 1.95);
    ghostGroup.add(rightOuter);

    // ── Fireflies ───────────────────────────────────────────────────────────
    const fireflyGroup = new THREE.Group();
    scene.add(fireflyGroup);

    interface FireflyData {
      velocity: THREE.Vector3;
      phase: number;
      pulseSpeed: number;
      glowMaterial: THREE.MeshBasicMaterial;
      fireflyMaterial: THREE.MeshBasicMaterial;
      light: THREE.PointLight;
    }

    const fireflies: THREE.Mesh[] = [];
    for (let i = 0; i < 20; i++) {
      const fMat = new THREE.MeshBasicMaterial({ color: 0xffff44, transparent: true, opacity: 0.9 });
      const firefly = new THREE.Mesh(new THREE.SphereGeometry(0.02, 2, 2), fMat);
      firefly.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
      );

      const glowMat = new THREE.MeshBasicMaterial({ color: 0xffff88, transparent: true, opacity: 0.4, side: THREE.BackSide });
      firefly.add(new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), glowMat));

      const fLight = new THREE.PointLight(0xffff44, 0.8, 3, 2);
      firefly.add(fLight);

      (firefly.userData as FireflyData) = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * params.fireflySpeed,
          (Math.random() - 0.5) * params.fireflySpeed,
          (Math.random() - 0.5) * params.fireflySpeed,
        ),
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 2 + Math.random() * 3,
        glowMaterial: glowMat,
        fireflyMaterial: fMat,
        light: fLight,
      };

      fireflyGroup.add(firefly);
      fireflies.push(firefly);
    }

    // ── Particle system ─────────────────────────────────────────────────────
    const particleGeometries = [
      new THREE.SphereGeometry(0.05, 6, 6),
      new THREE.TetrahedronGeometry(0.04, 0),
      new THREE.OctahedronGeometry(0.045, 0),
    ];
    const particleBaseMaterial = new THREE.MeshBasicMaterial({
      color: fluorescentColors[params.particleColor],
      transparent: true,
      opacity: 0,
      alphaTest: 0.1,
    });

    const particleGroupObj = new THREE.Group();
    scene.add(particleGroupObj);

    const particlePool: THREE.Mesh[] = [];
    const activeParticles: THREE.Mesh[] = [];

    // Pre-fill pool
    for (let i = 0; i < 100; i++) {
      const gIdx = Math.floor(Math.random() * particleGeometries.length);
      const p = new THREE.Mesh(particleGeometries[gIdx], particleBaseMaterial.clone());
      p.visible = false;
      particleGroupObj.add(p);
      particlePool.push(p);
    }

    function spawnParticle() {
      let p: THREE.Mesh | undefined;
      if (particlePool.length > 0) {
        p = particlePool.pop()!;
        p.visible = true;
      } else if (activeParticles.length < params.particleCount) {
        const gIdx = Math.floor(Math.random() * particleGeometries.length);
        p = new THREE.Mesh(particleGeometries[gIdx], particleBaseMaterial.clone());
        particleGroupObj.add(p);
      } else {
        return;
      }

      const col = new THREE.Color(fluorescentColors[params.particleColor]);
      col.offsetHSL(Math.random() * 0.1 - 0.05, 0, 0);
      (p.material as THREE.MeshBasicMaterial).color = col;

      p.position.copy(ghostGroup.position);
      p.position.z -= 0.8 + Math.random() * 0.6;
      p.position.x += (Math.random() - 0.5) * 3.5;
      p.position.y += (Math.random() - 0.5) * 3.5 - 0.8;

      const s = 0.6 + Math.random() * 0.7;
      p.scale.set(s, s, s);
      p.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);

      p.userData.life = 1.0;
      p.userData.decay = Math.random() * 0.003 + params.particleDecayRate;
      p.userData.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.015,
        z: (Math.random() - 0.5) * 0.015,
      };
      p.userData.velocity = {
        x: (Math.random() - 0.5) * 0.012,
        y: (Math.random() - 0.5) * 0.012 - 0.002,
        z: (Math.random() - 0.5) * 0.012 - 0.006,
      };
      (p.material as THREE.MeshBasicMaterial).opacity = Math.random() * 0.9;
      activeParticles.push(p);
    }

    // Initial particles
    for (let i = 0; i < 10; i++) spawnParticle();

    // ── Mouse tracking (scoped to section) ──────────────────────────────────
    const mouse = new THREE.Vector2(0, 0);
    const prevMouse = new THREE.Vector2(0, 0);
    const mouseSpeed = new THREE.Vector2(0, 0);
    let lastMouseUpdate = 0;
    let isMouseMoving = false;
    let mouseMovementTimer: ReturnType<typeof setTimeout> | null = null;

    const onMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const now = performance.now();
      if (now - lastMouseUpdate > 16) {
        prevMouse.copy(mouse);
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        mouseSpeed.x = mouse.x - prevMouse.x;
        mouseSpeed.y = mouse.y - prevMouse.y;
        isMouseMoving = true;
        if (mouseMovementTimer) clearTimeout(mouseMovementTimer);
        mouseMovementTimer = setTimeout(() => { isMouseMoving = false; }, 80);
        lastMouseUpdate = now;
      }
    };
    section.addEventListener('mousemove', onMouseMove);

    // ── Resize handler ──────────────────────────────────────────────────────
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const onResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const w = section.offsetWidth;
        const h = section.offsetHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        composer.setSize(w, h);
        bloomPass.setSize(w, h);
        analogDecayPass.uniforms.uResolution.value.set(w, h);
      }, 250);
    };
    window.addEventListener('resize', onResize);

    // ── Visibility – pause when out of view ─────────────────────────────────
    let isVisible = false;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0.05 },
    );
    observer.observe(section);

    // ── Animation loop ──────────────────────────────────────────────────────
    let time = 0;
    let currentMovement = 0;
    let lastFrameTime = 0;
    let lastParticleTime = 0;
    let frameCount = 0;
    let rafId: number;

    function animate(timestamp: number) {
      rafId = requestAnimationFrame(animate);

      // Skip if section not visible
      if (!isVisible) { lastFrameTime = timestamp; return; }

      const deltaTime = timestamp - lastFrameTime;
      lastFrameTime = timestamp;
      if (deltaTime > 100) return;

      const timeIncrement = (deltaTime / 16.67) * 0.01;
      time += timeIncrement;
      frameCount++;

      atmosphereMaterial.uniforms.time.value = time;
      analogDecayPass.uniforms.uTime.value = time;

      // Ghost follow mouse
      const targetX = mouse.x * 11;
      const targetY = mouse.y * 7;
      const prevPos = ghostGroup.position.clone();

      ghostGroup.position.x += (targetX - ghostGroup.position.x) * params.followSpeed;
      ghostGroup.position.y += (targetY - ghostGroup.position.y) * params.followSpeed;
      atmosphereMaterial.uniforms.ghostPosition.value.copy(ghostGroup.position);

      const movementAmount = prevPos.distanceTo(ghostGroup.position);
      currentMovement = currentMovement * params.eyeGlowDecay + movementAmount * (1 - params.eyeGlowDecay);

      // Floating
      ghostGroup.position.y +=
        Math.sin(time * params.floatSpeed * 1.5) * 0.03 +
        Math.cos(time * params.floatSpeed * 0.7) * 0.018 +
        Math.sin(time * params.floatSpeed * 2.3) * 0.008;

      // Pulse
      const pulse1 = Math.sin(time * params.pulseSpeed) * params.pulseIntensity;
      const breathe = Math.sin(time * 0.6) * 0.12;
      ghostMaterial.emissiveIntensity = params.emissiveIntensity + pulse1 + breathe;

      // Fireflies
      fireflies.forEach((ff) => {
        const ud = ff.userData as FireflyData;
        const pulse = Math.sin(time + ud.phase * ud.pulseSpeed) * 0.4 + 0.6;
        ud.glowMaterial.opacity = params.fireflyGlowIntensity * 0.4 * pulse;
        ud.fireflyMaterial.opacity = params.fireflyGlowIntensity * 0.9 * pulse;
        ud.light.intensity = params.fireflyGlowIntensity * 0.8 * pulse;
        ud.velocity.x += (Math.random() - 0.5) * 0.001;
        ud.velocity.y += (Math.random() - 0.5) * 0.001;
        ud.velocity.z += (Math.random() - 0.5) * 0.001;
        ud.velocity.clampLength(0, params.fireflySpeed);
        ff.position.add(ud.velocity);
        if (Math.abs(ff.position.x) > 30) ud.velocity.x *= -0.5;
        if (Math.abs(ff.position.y) > 20) ud.velocity.y *= -0.5;
        if (Math.abs(ff.position.z) > 15) ud.velocity.z *= -0.5;
      });

      // Ghost tilt
      const mouseDir = new THREE.Vector2(
        targetX - ghostGroup.position.x,
        targetY - ghostGroup.position.y,
      ).normalize();
      const tiltStr = 0.1 * params.wobbleAmount;
      const tiltDecay = 0.95;
      ghostBody.rotation.z = ghostBody.rotation.z * tiltDecay + -mouseDir.x * tiltStr * (1 - tiltDecay);
      ghostBody.rotation.x = ghostBody.rotation.x * tiltDecay + mouseDir.y * tiltStr * (1 - tiltDecay);
      ghostBody.rotation.y = Math.sin(time * 1.4) * 0.05 * params.wobbleAmount;

      // Scale breathing
      const scaleVar = 1 + Math.sin(time * 2.1) * 0.025 * params.wobbleAmount + pulse1 * 0.015;
      const scaleBreath = 1 + Math.sin(time * 0.8) * 0.012;
      const fs = scaleVar * scaleBreath;
      ghostBody.scale.set(fs, fs, fs);

      // Eye glow
      const isMoving = currentMovement > params.movementThreshold;
      const targetGlow = isMoving ? 1.0 : 0.0;
      const glowSpeed = isMoving ? params.eyeGlowResponse * 2 : params.eyeGlowResponse;
      const newOpacity = leftEyeMat.opacity + (targetGlow - leftEyeMat.opacity) * glowSpeed;
      leftEyeMat.opacity = newOpacity;
      rightEyeMat.opacity = newOpacity;
      leftOuterMat.opacity = newOpacity * 0.3;
      rightOuterMat.opacity = newOpacity * 0.3;

      // Particles
      const normSpeed = Math.sqrt(mouseSpeed.x ** 2 + mouseSpeed.y ** 2) * 8;
      const shouldSpawn = params.createParticlesOnlyWhenMoving
        ? currentMovement > 0.005 && isMouseMoving
        : currentMovement > 0.005;

      if (shouldSpawn && timestamp - lastParticleTime > 100) {
        const rate = Math.min(params.particleCreationRate, Math.max(1, Math.floor(normSpeed * 3)));
        for (let i = 0; i < rate; i++) spawnParticle();
        lastParticleTime = timestamp;
      }

      const pCount = Math.min(activeParticles.length, 60);
      for (let i = 0; i < pCount; i++) {
        const idx = (frameCount + i) % activeParticles.length;
        if (idx >= activeParticles.length) continue;
        const p = activeParticles[idx];
        p.userData.life -= p.userData.decay;
        (p.material as THREE.MeshBasicMaterial).opacity = p.userData.life * 0.85;

        if (p.userData.velocity) {
          p.position.x += p.userData.velocity.x;
          p.position.y += p.userData.velocity.y;
          p.position.z += p.userData.velocity.z;
          p.position.x += Math.cos(time * 1.8 + p.position.y) * 0.0008;
        }
        if (p.userData.rotationSpeed) {
          p.rotation.x += p.userData.rotationSpeed.x;
          p.rotation.y += p.userData.rotationSpeed.y;
          p.rotation.z += p.userData.rotationSpeed.z;
        }
        if (p.userData.life <= 0) {
          p.visible = false;
          (p.material as THREE.MeshBasicMaterial).opacity = 0;
          particlePool.push(p);
          activeParticles.splice(idx, 1);
          i--;
        }
      }

      composer.render();
    }

    rafId = requestAnimationFrame(animate);

    // ── Cleanup ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      section.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (mouseMovementTimer) clearTimeout(mouseMovementTimer);

      // Dispose Three.js resources
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });

      renderer.dispose();
      composer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // ── Colour transition: TestimonialCards cream → SpectralGhost dark ───────────
  //
  // TWO-PHASE APPROACH (fixes the gray-bleed mid-transition):
  // ─────────────────────────────────────────────────────────────
  // Phase 1 (scroll 0–65%): overlay stays fully opaque, backgroundColor goes
  //   cream→black in sync with TestimonialCards and body. Because the overlay
  //   covers the canvas at all times in this phase, the dark Three.js scene can
  //   never bleed through and create a gray tint — seamless color match.
  //
  // Phase 2 (scroll 65–100%): overlay cross-fades transparent, revealing the
  //   ghost scene on the now-black background. Ghost (canvas z:2) is above text
  //   (z:1) so the ghost correctly renders on top of the quote text.

  // ── Colour transition: TestimonialCards cream → SpectralGhost dark ─────────
// Uses the same technique as StickyCards → SkillBento:
// a simple scrubbed bgTimeline that animates body + neighbour sections
useEffect(() => {
  const section = sectionRef.current;
  const overlay = colorOverlayRef.current;
  if (!section || !overlay) return;

  const creamColor = 'rgb(238, 232, 220)';
  const blackColor = 'rgb(0, 0, 0)';

  const testimonialEl = document.querySelector('#events') as HTMLElement | null;
  const prevBodyBg = document.body.style.backgroundColor;

  // Start everyone at cream
  gsap.set(document.body,  { backgroundColor: creamColor });
  gsap.set(overlay,        { backgroundColor: creamColor, opacity: 1 });
  if (testimonialEl) gsap.set(testimonialEl, { backgroundColor: creamColor });

  // ── Single-pass transition: cream → black + overlay fade, all in one tight range ──
  // Starts when the section top hits 60% of the viewport and ends when it
  // reaches the very top. The bg colour + overlay opacity both animate together
  // so the ghost is fully revealed the moment the section pins – no extra scroll.
  const bgTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 60%',
      end:   'top top',
      scrub: 0.6,
    },
  });

  bgTimeline
    .to(document.body, { backgroundColor: blackColor, ease: 'none' }, 0)
    // Phase 1: overlay colour cream → black (first 70% of the scroll range)
    .to(overlay, { backgroundColor: blackColor, ease: 'none' }, 0)
    // Phase 2: overlay opacity 1 → 0 (last 30% of the scroll range)
    .to(overlay, { opacity: 0, ease: 'power1.in' }, 0.7);

  if (testimonialEl) {
    bgTimeline.to(testimonialEl, { backgroundColor: blackColor, ease: 'none' }, 0);
  }

  // Nav transitions
  bgTimeline
    .to('.nav-glass-surface', { backgroundColor: 'rgba(255,255,255,0.08)', ease: 'none' }, 0);

  return () => {
    bgTimeline.scrollTrigger?.kill();
    bgTimeline.kill();
    gsap.set(document.body, { backgroundColor: prevBodyBg || '' });
    gsap.set(overlay,       { clearProps: 'backgroundColor,opacity' });
    if (testimonialEl) gsap.set(testimonialEl, { clearProps: 'backgroundColor' });
    gsap.set('.nav-glass-surface', { clearProps: 'backgroundColor' });
  };
}, []);

  const outerRef = useRef<HTMLDivElement>(null);

  /* ── Pin the SpectralGhost section so footer scrolls over it ── */
  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    const sectionEl = outer.querySelector('.spectral-section') as HTMLElement;
    if (!sectionEl) return;

    const pin = ScrollTrigger.create({
      trigger: sectionEl,
      start: 'top top',
      pin: true,
      pinSpacing: false,
      id: 'spectral-pin',
    });

    return () => { pin.kill(); };
  // run once after the main Ghost useEffect has set up its own triggers
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={outerRef}>
      <section className="spectral-section" ref={sectionRef} id="spectral">
        {/* Three.js canvas mounts here (z-index:2) */}
        <div ref={canvasContainerRef} style={{ position: 'absolute', inset: 0 }} />

        {/* ── Cream-to-transparent overlay (z-index:3, above canvas) ──────────
             Starts as solid #EEE8DC so the section looks identical to the
             TestimonialCards section above it. GSAP fades it to opacity:0 as
             the section scrolls into view, revealing the dark Three.js scene. */}
        <div ref={colorOverlayRef} className="spectral-color-overlay" />

        {/* Quote text (z-index:4, always above overlay and canvas) */}
        <div className="spectral-content" id="main-content">
          <div className="spectral-quote-container">
            <h1 className="spectral-quote">
              Let’s Bring an <br />
              Idea to Life
              
            </h1>
            <span className="spectral-author">Got an idea to build? Reach out below.</span>
          </div>
        </div>
      </section>

      <div className="spectral-footer-bg">
        <Footer />
      </div>
    </div>
  );
};

export default SpectralGhost;