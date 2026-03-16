import React, { useRef, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Types ───────────────────────────────────────────────────────────────────
interface TextRevealProps {
  /** The text string to animate character-by-character */
  paragraph: string;
  /** Inline styles applied to the outer <p> wrapper */
  style?: React.CSSProperties;
  /** Optional className on the outer <p> */
  className?: string;
  /** Colour of the dim "shadow" characters behind the reveal (default: rgba(255,255,255,0.2)) */
  shadowColor?: string;
  /** ScrollTrigger `start` value  (default: 'top 90%') */
  triggerStart?: string;
  /** ScrollTrigger `end` value    (default: 'top 25%') */
  triggerEnd?: string;
}

// ─── Char ────────────────────────────────────────────────────────────────────
const Char: React.FC<{ char: string; shadowColor: string }> = ({ char, shadowColor }) => (
  <span style={{ position: 'relative', display: 'inline-block' }}>
    {/* dim background copy – always visible */}
    <span
      style={{
        position: 'absolute',
        inset: 0,
        color: shadowColor,
        userSelect: 'none',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {char}
    </span>

    {/* animated foreground copy — class is scoped via container query */}
    <span
      className="tr-char"
      style={{ opacity: 0, position: 'relative' }}
    >
      {char}
    </span>
  </span>
);

// ─── Word ────────────────────────────────────────────────────────────────────
const Word: React.FC<{ word: string; shadowColor: string }> = ({ word, shadowColor }) => (
  <span style={{ display: 'inline-block', marginRight: '0.25em' }}>
    {word.split('').map((char, i) => (
      <Char key={i} char={char} shadowColor={shadowColor} />
    ))}
  </span>
);

// ─── TextReveal ──────────────────────────────────────────────────────────────
const TextReveal: React.FC<TextRevealProps> = ({
  paragraph,
  style,
  className,
  shadowColor = 'rgba(255,255,255,0.2)',
  triggerStart = 'top 90%',
  triggerEnd = 'top 25%',
}) => {
  const containerRef = useRef<HTMLParagraphElement>(null);

  const words = useMemo(() => paragraph.split(' '), [paragraph]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scope the selector to this container so multiple instances don't clash
    const chars = gsap.utils.toArray<HTMLElement>('.tr-char', container);
    const total = chars.length;
    if (total === 0) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: triggerStart,
        end: triggerEnd,
        scrub: true,
      },
    });

    chars.forEach((char, i) => {
      const start = i / total;
      const end = (i + 1) / total;

      tl.fromTo(
        char,
        { opacity: 0 },
        { opacity: 1, ease: 'none', duration: end - start },
        start,
      );
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [paragraph, triggerStart, triggerEnd]);

  return (
    <p ref={containerRef} className={className} style={style}>
      {words.map((word, i) => (
        <Word key={i} word={word} shadowColor={shadowColor} />
      ))}
    </p>
  );
};

export default TextReveal;
