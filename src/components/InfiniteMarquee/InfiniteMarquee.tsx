import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './InfiniteMarquee.css';

interface MarqueeRowProps {
  items: { text: string; accent: string }[];
  direction?: 'left' | 'right';
  speed?: number;
  dark?: boolean;
}

const MarqueeRow = ({ items, direction = 'left', speed = 40, dark = false }: MarqueeRowProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const content = contentRef.current;
    if (!wrap || !content) return;

    // Clone content for seamless looping
    const clone1 = content.cloneNode(true) as HTMLElement;
    const clone2 = content.cloneNode(true) as HTMLElement;
    wrap.appendChild(clone1);
    wrap.appendChild(clone2);

    const startTween = () => {
      const totalWidth = content.offsetWidth + 60; // include gap
      const duration = totalWidth / speed;
      const startX = direction === 'right' ? -totalWidth : 0;
      const endX = direction === 'right' ? 0 : -totalWidth;

      tweenRef.current = gsap.fromTo(
        wrap,
        { x: startX },
        {
          x: endX,
          duration,
          ease: 'none',
          repeat: -1,
        }
      );
    };

    requestAnimationFrame(startTween);

    return () => {
      tweenRef.current?.kill();
      // Remove clones on cleanup
      [clone1, clone2].forEach(c => c.parentNode?.removeChild(c));
    };
  }, [direction, speed]);

  return (
    <div className={`marquee-ticker ${dark ? 'marquee-ticker--dark' : 'marquee-ticker--light'}`}>
      <div className="marquee-wrap" ref={wrapRef}>
        <div className="marquee-text" ref={contentRef}>
          {items.map((item, i) => (
            <span key={i} className="marquee-item">
              <span className="marquee-bullet">✦</span>
              {' '}{item.text}
              <span className="marquee-accent">{item.accent}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const topItems = [
  { text: 'Full Stack', accent: 'Developer' },
   { text: 'Computer Science ', accent: 'Undergraduate' },
  { text: 'Software', accent: 'Developer' },
  { text: 'AI ', accent: 'Enthusiast' },
  // { text: 'APIs & ', accent: 'Microservices' },
  // { text: 'Database ', accent: 'Schemas' },
  // { text: 'Automation ', accent: 'Scripts' },
  // { text: 'Full-Stack ', accent: 'Projects' },
  // { text: 'DevOps ', accent: 'Tools' },
];

const InfiniteMarquee = () => {
  return (
    <div className="marquee-section">
      {/* <MarqueeRow items={topItems} direction="left" speed={55} dark={false} /> */}
      <MarqueeRow items={topItems} direction="left" speed={50} dark={true} />
    </div>
  );
};

export default InfiniteMarquee;
