import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import newFluidShaders from './newFluidShaders';

interface NewFluidBgConfig {
  simResolution?: number;
  dyeResolution?: number;
  curl?: number;
  pressureIterations?: number;
  velocityDissipation?: number;
  dyeDissipation?: number;
  splatRadius?: number;
  forceStrength?: number;
  pressureDecay?: number;
  threshold?: number;
  edgeSoftness?: number;
  inkColor?: THREE.Color;
}

interface NewFluidBgProps {
  config?: NewFluidBgConfig;
  style?: React.CSSProperties;
  className?: string;
}

const DEFAULT_CONFIG: Required<NewFluidBgConfig> = {
  simResolution: 256,
  dyeResolution: 1024,
  curl: 25,
  pressureIterations: 50,
  velocityDissipation: 0.95,
  dyeDissipation: 0.95,
  splatRadius: 0.275,
  forceStrength: 7.5,
  pressureDecay: 0.75,
  threshold: 1.0,
  edgeSoftness: 0.0,
  inkColor: new THREE.Color(1, 1, 1),
};

const NewFluidBg: React.FC<NewFluidBgProps> = ({ config = {}, style, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cfg = { ...DEFAULT_CONFIG, ...config };

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: false });
    renderer.setClearColor(0x000000, 0);
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    let width = canvas.clientWidth * dpr;
    let height = canvas.clientHeight * dpr;

    // ── Scene / Camera ─────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    scene.add(quad);

    // ── Render Targets ─────────────────────────────────────────
    const options: THREE.RenderTargetOptions = { type: THREE.HalfFloatType, depthBuffer: false };
    const single = (w: number, h: number) => new THREE.WebGLRenderTarget(w, h, options);
    const double = (w: number, h: number) => {
      const obj = {
        read: single(w, h),
        write: single(w, h),
        swap() { [obj.read, obj.write] = [obj.write, obj.read]; },
      };
      return obj;
    };

    const aspect = width / height;
    const simSize = { w: cfg.simResolution, h: Math.round(cfg.simResolution / aspect) };
    const dyeSize = { w: cfg.dyeResolution, h: Math.round(cfg.dyeResolution / aspect) };

    const velocity  = double(simSize.w, simSize.h);
    const dye       = double(dyeSize.w, dyeSize.h);
    const divergence = single(simSize.w, simSize.h);
    const curlTarget = single(simSize.w, simSize.h);
    const pressure  = double(simSize.w, simSize.h);

    // ── Materials ──────────────────────────────────────────────
    const make = ([vert, frag]: string[], uniforms: { [key: string]: { value: unknown } }) =>
      new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms });

    const tex = () => ({ value: null as unknown });
    const num = (v = 0) => ({ value: v });
    const vec2 = () => ({ value: new THREE.Vector2() });

    const material = {
      splat: make(newFluidShaders.splat, {
        uTarget: tex(), aspectRatio: num(), radius: num(),
        color: { value: new THREE.Vector3() }, point: { value: new THREE.Vector2() },
      }),
      advection: make(newFluidShaders.advection, {
        uVelocity: tex(), uSource: tex(), texelSize: vec2(), dt: num(), dissipation: num(),
      }),
      divergence: make(newFluidShaders.divergence, { uVelocity: tex(), texelSize: vec2() }),
      curl: make(newFluidShaders.curl, { uVelocity: tex(), texelSize: vec2() }),
      vorticity: make(newFluidShaders.vorticity, {
        uVelocity: tex(), uCurl: tex(), texelSize: vec2(), curlStrength: num(), dt: num(),
      }),
      pressure: make(newFluidShaders.pressure, {
        uPressure: tex(), uDivergence: tex(), texelSize: vec2(),
      }),
      gradientSubtract: make(newFluidShaders.gradientSubtract, {
        uPressure: tex(), uVelocity: tex(), texelSize: vec2(),
      }),
      clear: make(newFluidShaders.clear, { uTexture: tex(), value: num() }),
      display: make(newFluidShaders.display, {
        uTexture: tex(), threshold: num(), edgeSoftness: num(),
        inkColor: { value: new THREE.Color() },
      }),
    };

    // ── Mouse tracking ─────────────────────────────────────────
    const mouse = { x: 0, y: 0, velocityX: 0, velocityY: 0, moved: false };

    const onMove = (x: number, y: number) => {
      mouse.velocityX = (x * dpr - mouse.x) * cfg.forceStrength;
      mouse.velocityY = (y * dpr - mouse.y) * cfg.forceStrength;
      mouse.x = x * dpr;
      mouse.y = y * dpr;
      mouse.moved = true;
    };

    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    // Do NOT preventDefault — that would block touch-scroll on mobile.
    // Passive listener so the browser can scroll natively without waiting for JS.
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // ── Resize ─────────────────────────────────────────────────
    const onResize = () => {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      width = canvas.clientWidth * dpr;
      height = canvas.clientHeight * dpr;
    };
    window.addEventListener('resize', onResize);

    // ── Helpers ────────────────────────────────────────────────
    const pass = (mat: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget | null) => {
      quad.material = mat;
      renderer.setRenderTarget(target ?? null);
      renderer.render(scene, camera);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const set = (mat: THREE.ShaderMaterial, values: Record<string, any>) => {
      Object.entries(values).forEach(([k, v]) => (mat.uniforms[k].value = v));
      return mat;
    };

    const splat = (x: number, y: number, vx: number, vy: number) => {
      set(material.splat, { aspectRatio: width / height, point: new THREE.Vector2(x / width, 1 - y / height), radius: cfg.splatRadius / 100 });
      set(material.splat, { uTarget: velocity.read.texture, color: new THREE.Vector3(vx, -vy, 0) });
      pass(material.splat, velocity.write); velocity.swap();
      set(material.splat, { uTarget: dye.read.texture, color: new THREE.Vector3(3, 3, 3) });
      pass(material.splat, dye.write); dye.swap();
    };

    const simulate = (dt: number) => {
      const simTexel = new THREE.Vector2(1 / simSize.w, 1 / simSize.h);
      pass(set(material.curl, { uVelocity: velocity.read.texture, texelSize: simTexel }), curlTarget);
      pass(set(material.vorticity, { uVelocity: velocity.read.texture, uCurl: curlTarget.texture, texelSize: simTexel, curlStrength: cfg.curl, dt }), velocity.write); velocity.swap();
      pass(set(material.divergence, { uVelocity: velocity.read.texture, texelSize: simTexel }), divergence);
      pass(set(material.clear, { uTexture: pressure.read.texture, value: cfg.pressureDecay }), pressure.write); pressure.swap();
      set(material.pressure, { uDivergence: divergence.texture, texelSize: simTexel });
      for (let i = 0; i < cfg.pressureIterations; i++) {
        material.pressure.uniforms.uPressure.value = pressure.read.texture;
        pass(material.pressure, pressure.write); pressure.swap();
      }
      pass(set(material.gradientSubtract, { uPressure: pressure.read.texture, uVelocity: velocity.read.texture, texelSize: simTexel }), velocity.write); velocity.swap();
      set(material.advection, { uVelocity: velocity.read.texture, uSource: velocity.read.texture, texelSize: simTexel, dt, dissipation: cfg.velocityDissipation });
      pass(material.advection, velocity.write); velocity.swap();
      set(material.advection, { uSource: dye.read.texture, texelSize: new THREE.Vector2(1 / dyeSize.w, 1 / dyeSize.h), dissipation: cfg.dyeDissipation });
      pass(material.advection, dye.write); dye.swap();
    };

    const renderFluid = () => {
      pass(set(material.display, { uTexture: dye.read.texture, threshold: cfg.threshold, edgeSoftness: cfg.edgeSoftness, inkColor: cfg.inkColor }), null);
    };

    // ── Animation loop ─────────────────────────────────────────
    let animId: number;
    let lastTime = Date.now();

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const dt = Math.min((Date.now() - lastTime) / 1000, 0.016);
      lastTime = Date.now();

      if (mouse.moved) {
        splat(mouse.x, mouse.y, mouse.velocityX, mouse.velocityY);
        mouse.moved = false;
      }

      simulate(dt);
      renderFluid();
    };

    tick();

    // ── Cleanup ────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onResize);
      velocity.read.dispose(); velocity.write.dispose();
      dye.read.dispose(); dye.write.dispose();
      divergence.dispose(); curlTarget.dispose();
      pressure.read.dispose(); pressure.write.dispose();
      Object.values(material).forEach(m => m.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        mixBlendMode: 'difference',
        display: 'block',
        ...style,
      }}
    />
  );
};

export default NewFluidBg;
