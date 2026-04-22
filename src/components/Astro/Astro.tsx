import React, { useEffect, useRef, useState } from 'react';
import { StarsBackground } from './StarsBackground';
import FluidReveal from './FluidReveal';
import NewFluidBg from './NewFluidBg';
import mobileImg from '../../assets/withcolors.webp';
import './astro.css';

/** Returns true when the viewport is ≤ 768 px wide, reactive to resize. */
function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= breakpoint
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}

const HelmetRevealAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const starsCanvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    let starsInstance: StarsBackground | null = null;

    if (starsCanvasRef.current) {
      starsInstance = new StarsBackground(starsCanvasRef.current);
    }

    return () => {
      if (starsInstance) {
        starsInstance.destroy();
      }
    };
  }, []);

  return (
   <div style={{ 
  margin: 0,
  padding: 0,
  width: '100%',
  maxWidth: '100%',
  overflowX: 'hidden',
  background: 'black',
  fontFamily: "'Arial', sans-serif"
}}>

     
      
 

      <div className="container" ref={containerRef}>
        <canvas className="stars-canvas" id="starsCanvas" ref={starsCanvasRef}></canvas>

        {/* ── Scrolling text: sits in container stacking context so fluid blends with it ── */}
        <div className="scrolling-text">
          <span>SANJANA DISSANAYAKA</span>
        </div>

        {/* ── New fluid effect: blends with background + scrolling text, NOT the image ── */}
        <NewFluidBg />

        {/* ── Image wrapper isolated so fluid blend-mode cannot affect FluidReveal ── */}
        <div className="image-wrapper">
          <div className="image-stack">
            {isMobile ? (
              /* ── Mobile: plain static image, no WebGL ── */
              <img
                src={mobileImg}
                alt="Sanjana Dissanayaka"
                className="mobile-hero-img"
              />
            ) : (
              /* ── Desktop: full fluid reveal animation ── */
              <FluidReveal imageScale={1} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelmetRevealAnimation;