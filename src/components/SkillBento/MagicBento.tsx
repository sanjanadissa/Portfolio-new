import { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';


import iconGit      from '../../assets/git.png';

// Simple-Icons CDN helper – white monochrome SVG logos by slug
const si = (name: string) => `https://cdn.simpleicons.org/${name}`;

// git.png is used as filler wherever a real icon isn't available locally
const FILLER = iconGit;

// Remix Icon CDN helper
const ri = (path: string) => `https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/${path}.svg`;

// ── Tech icon type ──────────────────────────────────────
interface Tech { name: string; icon: string }

// ── Card categories ─────────────────────────────────────
interface CardCategory { label: string; icon: string; techs: Tech[] }

const cardData: CardCategory[] = [
  {
    label: 'Database',
    icon: ri('Device/database-2-fill'),
    techs: [
      { name: 'PostgreSQL', icon: si('postgresql') },
      { name: 'MongoDB',    icon: si('mongodb') },
      { name: 'MySQL',      icon: si('mysql') },
      { name: 'Redis',      icon: si('redis') },
      { name: 'Supabase',   icon: si('supabase') },
      
    ],
  },
   {
    label: 'Backend',
    icon: ri('Device/server-fill'),
    techs: [
        
      { name: 'DotNet',     icon: si('dotnet') },
      { name: 'Node.js',    icon: si('nodedotjs') },
      { name: 'Express',    icon: si('express') },
      { name: 'SpringBoot',         icon: si('springboot') },

    
    ],
  },
  {
    label: 'Tools',
    icon: ri('System/settings-3-fill'),
    techs: [
      { name: 'Docker',  icon: si('docker') },
      { name: 'Cloud',     icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg"  },
      { name: 'GitHub',  icon: si('github') },
      { name: 'Git',  icon: si('git') },
      { name: 'Linux',   icon: si('linux') },
      { name: 'Figma',   icon: si('figma') },
    ],
  },

 
  {
    label: 'Frontend',
    icon: ri('Device/computer-fill'),
    techs: [
      { name: 'JavaScript',  icon: si('javascript') },
      { name: 'HTML',  icon: si('html5') },
      { name: 'CSS',  icon: si('css') },
      { name: 'TailwindCSS', icon: si('tailwindcss') },
      { name: 'Vite',  icon: si('vite') },
      { name: 'GSAP',  icon: si('gsap') },
      { name: 'TypeScript',  icon: si('typescript') },
      { name: 'React',       icon: si('react') },
       { name: 'Bootstrap',  icon: si('bootstrap') },
      
    ],
  },
  {
    label: 'PROGRAMMING',
    icon: ri('Document/file-code-fill'),
    techs: [
      { name: 'Python',     icon: si('python') },
      { name: 'C#',     icon:"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg" },
      { name: 'JAVA',     icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg" },
    { name: 'C',     icon: si('c') },
    ],
  },
  
    {
    label: 'AI / ML',
    icon: ri('Health & Medical/brain-fill'),
    techs: [
        { name: 'PyTorch',      icon: si('pytorch') },
      { name: 'TensorFlow',   icon: si('tensorflow') },
      { name: 'HuggingFace',  icon: si('huggingface') },
      { name: 'Scikit-learn',       icon: si('scikitlearn') },
      { name: 'Colab',        icon: si('googlecolab') },
    
    ],
  },
  
];

// ── Tooltip icon component ──────────────────────────────
const TechIcon = ({ tech }: { tech: Tech }) => (
  <div className="tech-icon-wrap">
    <img
      src={tech.icon}
      alt={tech.name}
      className="tech-icon-img"
      onError={(e) => {
        // Fallback to filler if CDN icon fails to load
        (e.currentTarget as HTMLImageElement).src = FILLER;
      }}
    />
    <span className="tech-icon-tooltip">{tech.name}</span>
  </div>
);

// ═══════════════════════════════════════════════════════
//  Everything below – particle / spotlight / tilt logic
//  (unchanged from the performance-optimised version)
// ═══════════════════════════════════════════════════════

const DEFAULT_PARTICLE_COUNT  = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR       = '132, 0, 255';
const MOBILE_BREAKPOINT        = 768;

const createParticleElement = (x: number, y: number, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity:    radius * 0.5,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (
  card: HTMLElement, mouseX: number, mouseY: number, glow: number, radius: number
) => {
  const rect      = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width)  * 100;
  const relativeY = ((mouseY - rect.top)  / rect.height) * 100;
  card.style.setProperty('--glow-x',         `${relativeX}%`);
  card.style.setProperty('--glow-y',         `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius',    `${radius}px`);
};

// ── ParticleCard ────────────────────────────────────────
interface ParticleCardProps {
  children: React.ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: React.CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}

const ParticleCard = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount  = DEFAULT_PARTICLE_COUNT,
  glowColor      = DEFAULT_GLOW_COLOR,
  enableTilt     = true,
  clickEffect    = false,
  enableMagnetism = false,
}: ParticleCardProps) => {
  const cardRef              = useRef<HTMLDivElement>(null);
  const particlesRef         = useRef<HTMLElement[]>([]);
  const timeoutsRef          = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isHoveredRef         = useRef(false);
  const memoizedParticles    = useRef<HTMLElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimRef     = useRef<gsap.core.Tween | null>(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimRef.current?.kill();
    particlesRef.current.forEach(p => {
      gsap.to(p, {
        scale: 0, opacity: 0, duration: 0.3, ease: 'back.in(1.7)',
        onComplete: () => { p.parentNode?.removeChild(p); },
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    if (!particlesInitialized.current) initializeParticles();

    memoizedParticles.current.forEach((particle, i) => {
      const id = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;
        const clone = particle.cloneNode(true) as HTMLElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
        gsap.to(clone, { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100, rotation: Math.random() * 360, duration: 2 + Math.random() * 2, ease: 'none', repeat: -1, yoyo: true });
        gsap.to(clone, { opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true });
      }, i * 100);
      timeoutsRef.current.push(id);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    const el = cardRef.current;

    const onEnter = () => {
      isHoveredRef.current = true;
      animateParticles();
      if (enableTilt) gsap.to(el, { rotateX: 5, rotateY: 5, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 });
    };

    const onLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();
      if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
      if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
    };

    const onMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;
      const rect    = el.getBoundingClientRect();
      const x       = e.clientX - rect.left;
      const y       = e.clientY - rect.top;
      const cx      = rect.width  / 2;
      const cy      = rect.height / 2;
      if (enableTilt) {
        gsap.to(el, { rotateX: ((y - cy) / cy) * -10, rotateY: ((x - cx) / cx) * 10, duration: 0.08, ease: 'power2.out', transformPerspective: 1000, overwrite: true });
      }
      if (enableMagnetism) {
        magnetismAnimRef.current = gsap.to(el, { x: (x - cx) * 0.05, y: (y - cy) * 0.05, duration: 0.25, ease: 'power2.out', overwrite: true });
      }
    };

    const onClick = (e: MouseEvent) => {
      if (!clickEffect) return;
      const rect = el.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      const d    = Math.max(Math.hypot(x, y), Math.hypot(x - rect.width, y), Math.hypot(x, y - rect.height), Math.hypot(x - rect.width, y - rect.height));
      const rip  = document.createElement('div');
      rip.style.cssText = `position:absolute;width:${d*2}px;height:${d*2}px;border-radius:50%;background:radial-gradient(circle,rgba(${glowColor},0.4)0%,rgba(${glowColor},0.2)30%,transparent 70%);left:${x-d}px;top:${y-d}px;pointer-events:none;z-index:1000;`;
      el.appendChild(rip);
      gsap.fromTo(rip, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => rip.remove() });
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('mousemove',  onMove);
    el.addEventListener('click',      onClick);
    return () => {
      isHoveredRef.current = false;
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('mousemove',  onMove);
      el.removeEventListener('click',      onClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <div ref={cardRef} className={`${className} particle-container`}
      style={{ ...style, position: 'relative', overflow: 'hidden', willChange: 'transform' }}>
      {children}
    </div>
  );
};

// ── GlobalSpotlight ─────────────────────────────────────
interface GlobalSpotlightProps {
  gridRef: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}

const GlobalSpotlight = ({
  gridRef,
  disableAnimations = false,
  enabled           = true,
  spotlightRadius   = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor         = DEFAULT_GLOW_COLOR,
}: GlobalSpotlightProps) => {
  const spotRef          = useRef<HTMLDivElement | null>(null);
  const isInsideRef      = useRef(false);
  const rafRef           = useRef<number | null>(null);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spot = document.createElement('div');
    spot.className = 'global-spotlight';
    spot.style.cssText = `position:fixed;width:800px;height:800px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(${glowColor},0.15)0%,rgba(${glowColor},0.08)15%,rgba(${glowColor},0.04)25%,rgba(${glowColor},0.02)40%,rgba(${glowColor},0.01)65%,transparent 70%);z-index:200;opacity:0;will-change:transform,opacity,left,top;transform:translate(-50%,-50%);mix-blend-mode:screen;`;
    document.body.appendChild(spot);
    spotRef.current = spot;

    const onMove = (e: MouseEvent) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (!spotRef.current || !gridRef.current) return;

        const section     = gridRef.current.closest('.bento-section');
        const rect        = section?.getBoundingClientRect();
        const inside      = rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
        isInsideRef.current = inside || false;

        const cards = gridRef.current.querySelectorAll<HTMLElement>('.magic-bento-card');

        if (!inside) {
          gsap.to(spotRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out', overwrite: true });
          cards.forEach(c => c.style.setProperty('--glow-intensity', '0'));
          return;
        }

        spotRef.current.style.left = `${e.clientX}px`;
        spotRef.current.style.top  = `${e.clientY}px`;

        const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
        let minDist = Infinity;

        cards.forEach(card => {
          const cr   = card.getBoundingClientRect();
          const dist = Math.max(0, Math.hypot(e.clientX - (cr.left + cr.width/2), e.clientY - (cr.top + cr.height/2)) - Math.max(cr.width, cr.height) / 2);
          minDist    = Math.min(minDist, dist);
          const glow = dist <= proximity ? 1 : dist <= fadeDistance ? (fadeDistance - dist) / (fadeDistance - proximity) : 0;
          updateCardGlowProperties(card, e.clientX, e.clientY, glow, spotlightRadius);
        });

        const tgt = minDist <= proximity ? 0.8 : minDist <= fadeDistance ? ((fadeDistance - minDist) / (fadeDistance - proximity)) * 0.8 : 0;
        gsap.to(spotRef.current, { opacity: tgt, duration: tgt > 0 ? 0.15 : 0.4, ease: 'power2.out', overwrite: true });
      });
    };

    const onLeave = () => {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      isInsideRef.current = false;
      gridRef.current?.querySelectorAll<HTMLElement>('.magic-bento-card').forEach(c => c.style.setProperty('--glow-intensity', '0'));
      if (spotRef.current) gsap.to(spotRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out', overwrite: true });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      spotRef.current?.parentNode?.removeChild(spotRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

// ── BentoCardGrid ───────────────────────────────────────
const BentoCardGrid = ({ children, gridRef }: { children: React.ReactNode; gridRef: React.RefObject<HTMLDivElement | null> }) => (
  <div className="card-grid bento-section" ref={gridRef}>{children}</div>
);

// ── Mobile detection hook ───────────────────────────────
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

// ── MagicBento ─────────────────────────────────────────
interface MagicBentoProps {
  textAutoHide?:      boolean;
  enableStars?:       boolean;
  enableSpotlight?:   boolean;
  enableBorderGlow?:  boolean;
  disableAnimations?: boolean;
  spotlightRadius?:   number;
  particleCount?:     number;
  enableTilt?:        boolean;
  glowColor?:         string;
  clickEffect?:       boolean;
  enableMagnetism?:   boolean;
}

const MagicBento = ({
  enableStars      = true,
  enableSpotlight  = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius  = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount    = DEFAULT_PARTICLE_COUNT,
  enableTilt       = false,
  glowColor        = DEFAULT_GLOW_COLOR,
  clickEffect      = true,
  enableMagnetism  = false,
}: MagicBentoProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const shouldDisable = disableAnimations || isMobile;

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisable}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <BentoCardGrid gridRef={gridRef}>
        {cardData.map((card, index) => {
          const cls = `magic-bento-card ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''}`;
          const sty: React.CSSProperties = { backgroundColor: '#060010' };

          const inner = (
            <>
              <div className="magic-bento-card__header">
                <img
                  className="magic-bento-card__label-icon"
                  src={card.icon}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                />
                <span className="magic-bento-card__label">{card.label}</span>
              </div>
              <div className="magic-bento-card__icons">
                {card.techs.map((t, ti) => <TechIcon key={ti} tech={t} />)}
              </div>
            </>
          );

          return enableStars ? (
            <ParticleCard key={index} className={cls} style={sty}
              disableAnimations={shouldDisable} particleCount={particleCount}
              glowColor={glowColor} enableTilt={enableTilt}
              clickEffect={clickEffect} enableMagnetism={enableMagnetism}>
              {inner}
            </ParticleCard>
          ) : (
            <div key={index} className={cls} style={sty}>{inner}</div>
          );
        })}
      </BentoCardGrid>
    </>
  );
};

export default MagicBento;
