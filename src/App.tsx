import CaseStudyCard from "./components/CaseStudyCard.jsx";
import SimplePinnedScroll from './components/SimplePinnedScroll';
import SkillBento from './components/SkillBento/SkillBento.js';
import StickyCards from './components/StickyCards/StickyCards';
import TestimonialCards from './components/TestimonialCards/TestimonialCards';
import SpectralGhost from './components/SpectralGhost/SpectralGhost';
import About from './components/About/About';
import { useState, useEffect } from 'react';
import Preloader from './components/Preloader.jsx';
import ChatAssistant from "./components/ChatAssistant/ChatAssistant.js";
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  // ── Lenis smooth scrolling ──────────────────────────────────────────────────
  // Creates a Lenis instance and syncs it with GSAP's ticker so that all
  // existing ScrollTrigger animations update correctly during smooth scrolling.
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;

    const lenis = new Lenis({
      duration: isMobile ? 1 : 1.2,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1,
      lerp: isMobile ? 0.08 : 0.1,
    });

    // Sync Lenis scroll events with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Single shared RAF callback — prevents duplicate loops
    const rafCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafCallback);

    // Disable GSAP's built-in lag smoothing so Lenis handles all timing
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(rafCallback);
      lenis.destroy();
    };
  }, []);


  return (
    <div className="min-h-screen bg-projects-bg">
      {!preloaderDone && <Preloader onComplete={() => setPreloaderDone(true)} />}

      {/* Navigation overlay is always mounted; its own CSS handles visibility.
          This avoids any extra delay after the preloader finishes. */}
      <CaseStudyCard />

      {/* ── HOME section – pinned panel (pinSpacing:false) ── */}
      <section id="home">
        <SimplePinnedScroll
          preloaderDone={preloaderDone}
          onPreloaderDone={() => setPreloaderDone(true)}
        />
      </section>

      {/* ── SCROLL-OVER WRAPPER ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          visibility: preloaderDone ? 'visible' : 'hidden',
          pointerEvents: preloaderDone ? 'auto' : 'none',
        }}
      >

        {/* ── ABOUT section ─────────────────────────── */}
        <About />

        {/* ── INFINITE MARQUEE – before skills ─────── */}
       

        {/* ── SKILLS section – MagicBento ─────────── */}
        <section id="skills">
          <SkillBento />
        </section>

        {/* ── PROJECTS section – Stacking Cards ───── */}
        {/* StickyCards renders its own id="projects" outer wrapper */}
        <StickyCards />

        {/* ── EVENTS section – Testimonial fan cards ──────── */}
        {/* margin-top offset is controlled via .events-offset so we can tweak
            it per-breakpoint without touching GSAP logic. */}
        <div className="events-offset" style={{ position: 'relative', zIndex: 10 }}>
          <TestimonialCards />
        </div>

        {/* ── SPECTRAL GHOST section ────────────────── */}
        <SpectralGhost />
        <ChatAssistant />

      </div>

    </div>
  );
}

export default App;
