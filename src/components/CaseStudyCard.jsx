import React, { useState, useEffect } from 'react';
import GlassSurface from './GlassSurface';


// ─── colour tokens ────────────────────────────────────────────────────────────
// Text is always white — readable on both dark scenes and the cream background
// because GlassSurface provides enough contrast behind the pill.
// Only the hamburger button and glass opacity shift on light backgrounds.
const DARK = {
  text:         '#ffffff',
  textActive:   '#ffffff',
  burgerBg:     'rgba(255,255,255,0.08)',
  burgerBorder: '1px solid rgba(255,255,255,0.12)',
  burgerBar:    '#e5e5e5',
  brightness:   45,
  bgOpacity:    0.1,
};
const LIGHT = {
  text:         '#ffffff',
  textActive:   '#ffffff',
  burgerBg:     'rgba(20,12,4,0.60)',
  burgerBorder: '1px solid rgba(20,12,4,0.22)',
  burgerBar:    '#1a1208',
  brightness:   28,
  bgOpacity:    0.22,
};

// ─── Component ────────────────────────────────────────────────────────────────
const Navigation = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLightBg, setIsLightBg] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  // ── Detect light-background zone via IntersectionObserver ────────────────
  // Light zone  = #projects or #events visible  AND  #spectral NOT yet visible.
  // Fires once per zone crossing → zero per-frame overhead.
  useEffect(() => {
    let projectsIn = false;
    let eventsIn   = false;
    let spectralIn = false;

    const update = () =>
      setIsLightBg((projectsIn || eventsIn) && !spectralIn);

    const opts = { threshold: 0.05 };

    const observers = [
      ['projects', (v) => { projectsIn = v; update(); }],
      ['events',   (v) => { eventsIn   = v; update(); }],
      ['spectral', (v) => { spectralIn = v; update(); }],
    ].map(([id, cb]) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(([e]) => cb(e.isIntersecting), opts);
      obs.observe(el);
      return obs;
    });

    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  // ── Resize ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Scroll lock when mobile menu open ─────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = !isDesktop && menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen, isDesktop]);

  // active colour token set
  const C = isLightBg ? LIGHT : DARK;

  // ── Section targets ───────────────────────────────────────────────────────
  const sectionTargets = {
    home: 'home', about: 'about', skills: 'skills',
    projects: 'projects', events: 'events', contact: 'spectral',
  };

  const navItems = [
    { id: 'home',     label: 'Home' },
    { id: 'about',    label: 'About' },
    { id: 'skills',   label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'events',   label: 'Events' },
  ];

  const scrollToSection = (itemId) => {
    const el = document.getElementById(sectionTargets[itemId]);
    if (el) {
      // Extra offset only for Skills so the heading isn't too close to the nav pill
      const extraOffset = itemId === 'skills' ? 36 : 0;
      const y = el.getBoundingClientRect().top + window.scrollY - extraOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setActiveSection(itemId);
    setMenuOpen(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Desktop pill (≥1024px)
  // ─────────────────────────────────────────────────────────────────────────
  const desktopNavItems = [...navItems, { id: 'contact', label: 'Contact' }];

  return (
    <>
      {/* ── Desktop pill ──────────────────────────────────────────────────── */}
      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] hidden lg:block">
        <GlassSurface
          width="auto"
          height="auto"
          borderRadius={50}
          brightness={C.brightness}
          opacity={0.85}
          blur={15}
          displace={8}
          backgroundOpacity={C.bgOpacity}
          saturation={1.2}
          distortionScale={-120}
          redOffset={3}
          greenOffset={8}
          blueOffset={15}
          mixBlendMode="screen"
          className="nav-glass-surface rounded-full flex items-center"
          style={{ padding: '12px 24px' }}
        >
          <nav className="flex items-center space-x-6">
            {desktopNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="group relative px-4 py-0 flex items-center justify-center"
              >
                {/*
                  ⚠️  NO Tailwind colour class here — colour is set via
                  inline style only. This lets GSAP's scrubbed animation
                  (bgTimeline.to('.nav-menu-text', { color:'#1a1208' }))
                  work without fighting CSS‑transition conflicts.
                */}
                <span
                  className="nav-menu-text text-sm"
                  style={{
                    color: activeSection === item.id ? C.textActive : C.text,
                    transition: 'color 0.45s ease',
                  }}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </GlassSurface>
      </header>

      {/* ── Mobile hamburger (top-right, <1024px) ─────────────────────────── */}
      {!isDesktop && (
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open Menu"
          style={{
            position: 'fixed',
            top: '1.25rem',
            right: '1.25rem',
            zIndex: 200,
            // background: C.burgerBg,
            // backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            // border: C.burgerBorder,
            // borderRadius: '12px',
            width: '44px',
            height: '44px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            cursor: 'pointer',
            transition: 'background 0.45s ease, border 0.45s ease',
          }}
        >
      <svg
  width="28"
  height="20"
  viewBox="0 0 120 80"
  fill="none"
>
  <rect x="0" y="0" width="120" height="16" rx="8" fill={C.burgerBar}/>
  <rect x="24" y="32" width="96" height="16" rx="8" fill={C.burgerBar}/>
  <rect x="56" y="64" width="64" height="16" rx="8" fill={C.burgerBar}/>
</svg>
        </button>
      )}

      {/* ── Mobile fullscreen overlay ──────────────────────────────────────── */}
      {!isDesktop && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            background: 'rgba(0,0,0,0.97)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: menuOpen ? 1 : 0,
            pointerEvents: menuOpen ? 'auto' : 'none',
            transition: 'opacity 0.28s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: '320px',
              flex: 1,
              justifyContent: 'center',
              paddingBottom: '80px',
            }}
          >
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  style={{
                    width: '100%',
                    padding: '18px 32px',
                    background: isActive ? '#2563EB' : 'transparent',
                    border: 'none',
                    borderRadius: isActive ? '50px' : '0',
                    color: isActive ? '#fff' : 'rgba(200,200,210,0.85)',
                    fontFamily: "'Syne','Inter',sans-serif",
                    fontSize: '1.25rem',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    cursor: 'pointer',
                    transition: 'background 0.22s ease,color 0.22s ease,border-radius 0.22s ease',
                    textAlign: 'center',
                    marginBottom: '4px',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'rgba(200,200,210,0.85)'; }}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Download CV */}
            <a
              href="/CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              style={{
                width: '100%',
                padding: '18px 32px',
                color: 'rgba(200,200,210,0.85)',
                fontFamily: "'Syne','Inter',sans-serif",
                fontSize: '1.25rem',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '12px',
                transition: 'color 0.22s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(200,200,210,0.85)'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download CV
            </a>
          </nav>

          {/* X close button */}
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close Menu"
            style={{
              position: 'absolute',
              bottom: '10.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'rgba(210,210,220,0.8)',
              fontFamily: "'Syne','Inter',sans-serif",
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '8px 24px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(210,210,220,0.8)'; }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
};

export default Navigation;