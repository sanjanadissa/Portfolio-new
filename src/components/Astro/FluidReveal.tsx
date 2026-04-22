import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { vertexShader, fluidFragmentShader, displayFragmentShader } from './fluidShaders';

// Import both images as modules so Vite handles the asset paths correctly
import topImgSrc from '../../assets/withoutcolors.webp';
import bottomImgSrc from '../../assets/withcolors.webp';

interface FluidRevealProps {
  imageScale?: number; // 0.1–1.0, controls how large the images are relative to the viewport
  style?: React.CSSProperties;
  className?: string;
}

const FluidReveal: React.FC<FluidRevealProps> = ({
  imageScale = 0.8,
  style,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      precision: 'highp',
      alpha: true,
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── Scene / Camera ─────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // ── Mouse tracking ─────────────────────────────────────────
    const mouse = new THREE.Vector2(0.5, 0.5);
    const prevMouse = new THREE.Vector2(0.5, 0.5);
    let isMoving = false;
    let lastMoveTime = 0;

    // ── Ping-pong render targets ───────────────────────────────
    const simSize = 512;
    const pingPongTargets = [
      new THREE.WebGLRenderTarget(simSize, simSize, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
      }),
      new THREE.WebGLRenderTarget(simSize, simSize, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
      }),
    ];
    let currentTarget = 0;

    // ── Texture size uniforms ──────────────────────────────────
    const topTextureSize = new THREE.Vector2(1, 1);
    const bottomTextureSize = new THREE.Vector2(1, 1);

    // ── Placeholder textures ───────────────────────────────────
    function createPlaceholderTexture(): THREE.CanvasTexture {
      const c = document.createElement('canvas');
      c.width = 2;
      c.height = 2;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 2, 2);
      const tex = new THREE.CanvasTexture(c);
      tex.minFilter = THREE.LinearFilter;
      return tex;
    }

    // ── Fluid simulation material ──────────────────────────────
    const trailsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPrevTrails: { value: null },
        uMouse: { value: mouse },
        uPrevMouse: { value: prevMouse },
        uResolution: { value: new THREE.Vector2(simSize, simSize) },
        uDecay: { value: 0.97 },
        uIsMoving: { value: false },
      },
      vertexShader,
      fragmentShader: fluidFragmentShader,
    });

    // ── Display material ───────────────────────────────────────
    const displayMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uFluid: { value: null },
        uTopTexture: { value: createPlaceholderTexture() },
        uBottomTexture: { value: createPlaceholderTexture() },
        uResolution: {
          value: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
        },
        uDpr: { value: window.devicePixelRatio },
        uTopTextureSize: { value: topTextureSize },
        uBottomTextureSize: { value: bottomTextureSize },
        uImageScale: { value: imageScale },
      },
      vertexShader,
      fragmentShader: displayFragmentShader,
      transparent: true,
    });

    // ── Image loader ───────────────────────────────────────────
    function loadImage(
      url: string,
      position: 'top' | 'bottom',
      textureSizeVector: THREE.Vector2
    ) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const ow = img.width;
        const oh = img.height;
        textureSizeVector.set(ow, oh);

        const maxSize = 4096;
        let nw = ow,
          nh = oh;
        if (ow > maxSize || oh > maxSize) {
          if (ow > oh) {
            nw = maxSize;
            nh = Math.floor(oh * (maxSize / ow));
          } else {
            nh = maxSize;
            nw = Math.floor(ow * (maxSize / oh));
          }
        }

        const c = document.createElement('canvas');
        c.width = nw;
        c.height = nh;
        c.getContext('2d')!.drawImage(img, 0, 0, nw, nh);

        const tex = new THREE.CanvasTexture(c);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;

        if (position === 'top') {
          displayMaterial.uniforms.uTopTexture.value = tex;
        } else {
          displayMaterial.uniforms.uBottomTexture.value = tex;
        }
      };
      img.onerror = () => console.error('FluidReveal: failed to load image', url);
      img.src = url;
    }

    // "top" = default image (44.png), "bottom" = revealed on hover (22.png)
    loadImage(topImgSrc, 'top', topTextureSize);
    loadImage(bottomImgSrc, 'bottom', bottomTextureSize);

    // ── Geometry / Meshes ──────────────────────────────────────
    const planeGeometry = new THREE.PlaneGeometry(2, 2);
    const displayMesh = new THREE.Mesh(planeGeometry, displayMaterial);
    scene.add(displayMesh);

    const simMesh = new THREE.Mesh(planeGeometry, trailsMaterial);
    const simScene = new THREE.Scene();
    simScene.add(simMesh);

    // Clear both targets
    renderer.setRenderTarget(pingPongTargets[0]);
    renderer.clear();
    renderer.setRenderTarget(pingPongTargets[1]);
    renderer.clear();
    renderer.setRenderTarget(null);

    // ── Event handlers ─────────────────────────────────────────
    function onMouseMove(event: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        prevMouse.copy(mouse);
        mouse.x = (event.clientX - rect.left) / rect.width;
        mouse.y = 1 - (event.clientY - rect.top) / rect.height;
        isMoving = true;
        lastMoveTime = performance.now();
      } else {
        isMoving = false;
      }
    }

    // Do NOT preventDefault — that blocks touch-scroll site-wide on mobile.
    function onTouchMove(event: TouchEvent) {
      if (event.touches.length > 0) {
        const rect = canvas!.getBoundingClientRect();
        const tx = event.touches[0].clientX;
        const ty = event.touches[0].clientY;
        if (
          tx >= rect.left &&
          tx <= rect.right &&
          ty >= rect.top &&
          ty <= rect.bottom
        ) {
          prevMouse.copy(mouse);
          mouse.x = (tx - rect.left) / rect.width;
          mouse.y = 1 - (ty - rect.top) / rect.height;
          isMoving = true;
          lastMoveTime = performance.now();
        } else {
          isMoving = false;
        }
      }
    }

    function onWindowResize() {
      if (!canvas) return;
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      displayMaterial.uniforms.uResolution.value.set(
        canvas.clientWidth,
        canvas.clientHeight
      );
      displayMaterial.uniforms.uDpr.value = window.devicePixelRatio;
    }

    window.addEventListener('mousemove', onMouseMove);
    // passive:true lets the browser scroll natively without waiting for JS
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('resize', onWindowResize);

    // ── Animation loop ─────────────────────────────────────────
    let animFrameId: number;

    function animate() {
      animFrameId = requestAnimationFrame(animate);

      if (isMoving && performance.now() - lastMoveTime > 50) isMoving = false;

      const prevTarget = pingPongTargets[currentTarget];
      currentTarget = (currentTarget + 1) % 2;
      const curTarget = pingPongTargets[currentTarget];

      trailsMaterial.uniforms.uPrevTrails.value = prevTarget.texture;
      trailsMaterial.uniforms.uMouse.value.copy(mouse);
      trailsMaterial.uniforms.uPrevMouse.value.copy(prevMouse);
      trailsMaterial.uniforms.uIsMoving.value = isMoving;

      renderer.setRenderTarget(curTarget);
      renderer.render(simScene, camera);

      displayMaterial.uniforms.uFluid.value = curTarget.texture;
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    }

    animate();

    // ── Cleanup ────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onWindowResize);
      pingPongTargets[0].dispose();
      pingPongTargets[1].dispose();
      trailsMaterial.dispose();
      displayMaterial.dispose();
      planeGeometry.dispose();
      renderer.dispose();
    };
  }, [imageScale]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        ...style,
      }}
    />
  );
};

export default FluidReveal;
