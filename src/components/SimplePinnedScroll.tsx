import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HelmetReveal from './Astro/Astro.tsx';
import Preloader from './Preloader';
import GlassSurface from './GlassSurface';
import cvPdf from "../../src/assets/CV.pdf";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  onPreloaderDone: () => void;
  preloaderDone: boolean;
}

const SimplePinnedScroll = ({ onPreloaderDone, preloaderDone }: Props) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    // Isolated GSAP context — won't bleed into StickyCards or any other trigger
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        // pinSpacing: false → no spacer added, so the NEXT section scrolls
        // directly on top of this pinned panel (layered-pinning pattern)
        pin: true,
        pinSpacing: false,
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    // This wrapper must be position:relative so it stacks correctly in the flow
    <div ref={wrapperRef} style={{ position: 'relative', zIndex: 0 }}>
      {!preloaderDone && <Preloader onComplete={onPreloaderDone} />}
      <HelmetReveal />

      {/* Download CV button — top-right corner, hidden on lg and below (lives in hamburger menu there) */}
      <div className="hidden lg:block" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 20 }}>
        <GlassSurface
          width="auto"
          height="auto"
          borderRadius={50}
          brightness={45}
          opacity={0.85}
          blur={15}
          displace={8}
          backgroundOpacity={0.1}
          saturation={1.2}
          distortionScale={-120}
          redOffset={3}
          greenOffset={8}
          blueOffset={15}
          mixBlendMode="screen"
          className="rounded-full"
          style={{ padding: '12px 24px' }}
        >
          <a
            href={cvPdf}
             target="_blank"
             rel="noopener noreferrer"
            className="nav-menu-text text-sm text-gray-300 hover:text-white transition-colors duration-300 flex items-center gap-2 whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download CV
          </a>
        </GlassSurface>
      </div>
    </div>
  );
};

export default SimplePinnedScroll;
