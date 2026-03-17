import  { useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import "./MarqueeHover.css";

/* ── helpers (ported from original utils.js) ─────────────────────────── */
function distMetric(x: number, y: number, x2: number, y2: number) {
  return (x - x2) ** 2 + (y - y2) ** 2;
}
function closestEdge(
  x: number,
  y: number,
  w: number,
  h: number
): "top" | "bottom" {
  const top = distMetric(x, y, w / 2, 0);
  const bot = distMetric(x, y, w / 2, h);
  return top <= bot ? "top" : "bottom";
}

/* ── single item ─────────────────────────────────────────────────────── */
interface ItemProps {
  label: string;
  href: string;
  marqueeText: string[];
  paddingTop?: string;
}

function MarqueeItem({ label, marqueeText, paddingTop, href }: ItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const innerWrapRef = useRef<HTMLDivElement>(null);
  const defaults = { duration: 0.6, ease: "expo" };

  const getEdge = useCallback((ev: MouseEvent) => {
    const el = itemRef.current!;
    const x = ev.pageX - el.getBoundingClientRect().left - window.scrollX;
    const y = ev.pageY - el.getBoundingClientRect().top - window.scrollY;
    return closestEdge(x, y, el.clientWidth, el.clientHeight);
  }, []);

  useEffect(() => {
    const link = itemRef.current?.querySelector(".mh-link") as HTMLElement;
    if (!link) return;

    const onEnter = (ev: MouseEvent) => {
      const edge = getEdge(ev);
      gsap
        .timeline({ defaults })
        .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
        .set(
          innerWrapRef.current,
          { y: edge === "top" ? "101%" : "-101%" },
          0
        )
        .to([marqueeRef.current, innerWrapRef.current], { y: "0%" }, 0);
    };

    const onLeave = (ev: MouseEvent) => {
      const edge = getEdge(ev);
      gsap
        .timeline({ defaults })
        .to(
          marqueeRef.current,
          { y: edge === "top" ? "-101%" : "101%" },
          0
        )
        .to(
          innerWrapRef.current,
          { y: edge === "top" ? "101%" : "-101%" },
          0
        );
    };

    link.addEventListener("mouseenter", onEnter);
    link.addEventListener("mouseleave", onLeave);
    return () => {
      link.removeEventListener("mouseenter", onEnter);
      link.removeEventListener("mouseleave", onLeave);
    };
  }, [getEdge]);

  /* duplicate text for seamless loop */
  const doubled = [...marqueeText, ...marqueeText];

  return (
    <div className="mh-item" ref={itemRef} style={paddingTop ? { paddingTop } : undefined}>
      <a className="mh-link" href={href} target={href.startsWith("mailto") ? "_self" : "_blank"} rel="noopener noreferrer">
        {label}
      </a>
      <div className="mh-marquee" ref={marqueeRef}>
        <div className="mh-marquee-inner-wrap" ref={innerWrapRef}>
          <div className="mh-marquee-inner" aria-hidden="true">
            {doubled.map((word, i) => (
              <span key={i}>{word}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── data ────────────────────────────────────────────────────────────── */
const ITEMS: ItemProps[] = [
  {
    label: "Email",
    href: "mailto:sanjanadissanayake22@gmail.com",
    marqueeText: [
      "Reach",
      "Me",
      "At",
      "—",
      "sanjanadissanayake22@gmail.com",
      "And",
      "let’s",
      "talk.",
      "✦",
    ],
  },
  {
    label: "GitHub",
    href: "https://github.com/sanjanadissa",
    marqueeText: [
      "Check",
      "Out",
      "My",
      "Work",
      "On",
      "GitHub",
      "—",
      "sanajnadissa",
      "✦",
    ],
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/sanjana-dissanayake-b04963302/",
    marqueeText: [
      "Connect",
      "With",
      "Me",
      "On",
      "LinkedIn",
      "—",
      "Let's",
      "✦",
    ],
  },
  
];

/* ── public component ─────────────────────────────────────────────────── */
export default function MarqueeHover() {
  return (
    <div className="mh-wrap">
      {ITEMS.map((item, i) => (
        <MarqueeItem
          key={item.label}
          {...item}
          paddingTop={i === 0 ? '15px' : undefined}
        />
      ))}
      {/* Footer email pill uses the same simple mailto URL */}
   
    </div>
  );
}
