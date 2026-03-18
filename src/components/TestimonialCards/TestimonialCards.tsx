import { useState, useEffect } from "react";
import TextReveal from '../TextReveal/TextReveal';
import event1 from '../../assets/event1.jpg';
import event2 from '../../assets/event2.jpg';
import event3 from '../../assets/event3.jpg';
import event4 from '../../assets/event4.jpg';
import event5 from '../../assets/event5.jpg';

// ── Data with links ───────────────────────────────────────────────────────────
const testimonials = [
  {
    id: 1,
    text: "Led sponsorship efforts for a developer summit by FOSS Community, bringing together industry experts and students for workshops and technical talks.",
    name: "Théo Cesarini",
    role: "CEO & Co-Founder @Incard & @Fundree",
    avatar: "TC",
    avatarBg: "#8B7B5E",
    dark: false,
    image: event1,
    link: "https://www.linkedin.com/posts/sanjana-dissanayake-b04963302_opendevsummit25-fosscommunityuok-techsummit-activity-7334817017251643393-BG62?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEcKvnoBi58E60iA-cGauBcZTTt61q9-wXg",
  },
  {
    id: 2,
    text: "Won the championship in a 5-hour programming competition organized by the IEEE Student Branch of the University of Kelaniya.",
    name: "David Katz",
    role: "CEO & Founder @Notez-Nous",
    avatar: "DK",
    avatarBg: "#5C5C6E",
    dark: true,
    image: event2,
    link: "https://web.facebook.com/cssauok/posts/1387909713336846?ref=embed_post",
  },
  {
    id: 3,
    text: "Recognized as a Volunteer of the Month by the IEEE Student Branch, University of Kelaniya, for contributions and dedication to the community.",
    name: "Thomas Lemaitre",
    role: "Head of Marketing @Jalao",
    avatar: "TL",
    avatarBg: "#5E7A62",
    dark: false,
    image: event3,
    link: "https://www.linkedin.com/posts/sanjana-dissanayake-b04963302_ieee-uok-ieeeuok-activity-7193543204984565760-TM2Z?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEcKvnoBi58E60iA-cGauBcZTTt61q9-wXg",
  },
  {
    id: 4,
    text: "Advanced to the Semi Finals with Team Luminati, collaborating on innovative solutions through intensive teamwork and problem-solving.",
    name: "Antoine Salmon Peugnet",
    role: "CMO @Forbes, Founder @Rives",
    avatar: "AP",
    avatarBg: "#8B7B5E",
    dark: true,
    image: event4,
    link: "https://www.linkedin.com/posts/sanjana-dissanayake-b04963302_with-immense-excitement-we-are-thrilled-activity-7205850865071448065-JDyA?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEcKvnoBi58E60iA-cGauBcZTTt61q9-wXg",
  },
  {
    id: 5,
    text: "Selected and presented our project \u201CNexus\u201D at the Students Research Symposium 2025, University of Kelaniya.",
    name: "Thomas Gonnet",
    role: "Founder @Dermis.ai",
    avatar: "TG",
    avatarBg: "#3D3D3D",
    dark: false,
    image: event5,
    link: "https://www.linkedin.com/posts/sanjana-dissanayake-b04963302_fctsrs2025-universityofkelaniya-research-activity-7387714776539385856-Qysq?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEcKvnoBi58E60iA-cGauBcZTTt61q9-wXg",
  },
];

const fanBase = [
  { x: -520, rot: 24, y: -10, z: 1 },
  { x: -260, rot: -8, y: -25, z: 4 },
  { x: 0,   rot: 0,  y: 20,  z: 3 },
  { x: 260, rot: 8,  y: -25, z: 2 },
  { x: 520, rot: -24, y: -10, z: 3 },
];

// ── Card Component ────────────────────────────────────────────────────────────
function TestimonialImageCard({
  t,
}: {
  t: (typeof testimonials)[0];
  isHovered?: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "24px",
        overflow: "hidden",
        position: "relative",
        // boxShadow: isHovered
        //   ? "0 32px 80px rgba(0,0,0,0.38)"
        //   : "0 8px 32px rgba(0,0,0,0.22)",
        transition: "box-shadow 0.35s ease",
      }}
    >
      <img
        src={t.image}
        alt={t.name}
        style={{
          width: "100%",
          height: "80%",
          objectFit: "cover",
          position: "absolute",
          inset: 0,
        }}
      />

      <img
        src={t.image}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(20px)",
          maskImage:
            "linear-gradient(to bottom, transparent 38%, rgba(0,0,0,0.2) 50%, black 75%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 38%, rgba(0,0,0,0.2) 50%, black 75%, black 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4) 65%, rgba(0,0,0,0.92) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "0 24px 36px",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <p
          style={{
            fontFamily: "'Satoshi', sans-serif",
            fontSize: 14.5,
            fontWeight: 500,
            lineHeight: 1.48,
            margin: "0 0 22px 0",
          }}
        >
          {t.text}
        </p>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <a
            href={t.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
            }}
          >
            <button
              style={{
                border: "none",
                padding: "13px 32px",
                borderRadius: "50px",
                fontSize: "14.5px",
                fontWeight: 600,
                cursor: "pointer",
                background: "white",
                color: "#111",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 3px 12px rgba(0,0,0,0.15)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,0,0,0.15)";
              }}
            >
              See Details
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Desktop fan view (320×500 px cards) ──────────────────────────────────────
function DesktopFan({ mounted }: { mounted: boolean }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getCardStyle = (index: number): React.CSSProperties => {
    const base = fanBase[index];
    const isHovered = hoveredIndex === index;

    let x = mounted ? base.x : 0;
    let y = mounted ? base.y : 140;
    let rot = mounted ? base.rot : 0;
    let scale = mounted ? 1 : 0.92;
    let z = base.z;
    let shadow = "0 8px 32px rgba(0,0,0,0.22)";

    if (hoveredIndex !== null) {
      if (isHovered) {
        rot = 0;
        y = base.y - 50;
        scale = 1.08;
        z = 30;
        shadow = "0 40px 100px rgba(0,0,0,0.4)";
      } else {
        const dir = index < hoveredIndex ? -1 : 1;
        const dist = Math.abs(index - hoveredIndex);
        const pushAmount = 120 + (3 - Math.min(dist, 3)) * 40;

        x = base.x + dir * pushAmount;
        rot = base.rot * 1.35;
        y = base.y + 18;
        scale = 0.95;
        shadow = "0 6px 24px rgba(0,0,0,0.16)";
      }
    }

    return {
      position: "absolute",
      left: "50%",
      top: "50%",
      marginLeft: "-160px",
      marginTop: "-250px",
      transform: `translateX(${x}px) translateY(${y}px) rotate(${rot}deg) scale(${scale})`,
      zIndex: z,
      transition: `transform 0.65s cubic-bezier(0.34, 1.4, 0.64, 1) ${mounted ? 0 : index * 60}ms, box-shadow 0.35s ease`,
      cursor: "pointer",
      boxShadow: shadow,
      borderRadius: "24px",
      width: 320,
      height: 500,
    };
  };

  return (
    <div style={{ position: "relative", width: "1180px", height: "620px" }}>
      {testimonials.map((t, i) => (
        <div
          key={t.id}
          style={getCardStyle(i)}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <TestimonialImageCard t={t} isHovered={hoveredIndex === i} />
        </div>
      ))}
    </div>
  );
}

// ── Modern Mobile Carousel ───────────────────────────────────────────────────
function MobileCarousel({  }: { mounted: boolean }) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const n = testimonials.length;

  const goTo = (index: number) => {
    if (isAnimating || index === current) return;
    setIsAnimating(true);
    setCurrent(index);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const prev = () => goTo((current - 1 + n) % n);
  const next = () => goTo((current + 1) % n);

  return (
    <div style={{ width: "100%", maxWidth: "360px", margin: "0 auto" }}>
      <div
        style={{
          position: "relative",
          height: "520px",
          overflow: "hidden",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: `translateX(-${current * 100}%)`,
            height: "100%",
          }}
        >
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              style={{
                minWidth: "100%",
                height: "100%",
                padding: "0 12px",
                boxSizing: "border-box",
                opacity: Math.abs(i - current) === 1 ? 0.65 : 1,
                transform: `scale(${Math.abs(i - current) === 1 ? 0.92 : 1})`,
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}
            >
              <TestimonialImageCard t={t} isHovered={false} />
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <button
          onClick={prev}
          disabled={isAnimating}
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.08)",
            border: "none",
            color: "#333",
            fontSize: "18px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
        >
          ←
        </button>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? 24 : 10,
                height: 10,
                borderRadius: i === current ? 12 : 5,
                background: i === current ? "#1a1a1a" : "rgba(0,0,0,0.2)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={isAnimating}
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.08)",
            border: "none",
            color: "#333",
            fontSize: "18px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
        >
          →
        </button>
      </div>

      <p
        style={{
          textAlign: "center",
          marginTop: "16px",
          fontFamily: "'Satoshi', sans-serif",
          fontSize: "13px",
          fontWeight: 400,
          color: "rgba(0,0,0,0.5)",
          textTransform: "uppercase",
        }}
      >
        {current + 1} / {n}
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TestimonialCards() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    const timer = setTimeout(() => setMounted(true), 80);
    return () => {
      window.removeEventListener("resize", check);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section
      id="events"
      style={{
        background: "#EEE8DC",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "0px 16px" : "0px 20px",
        overflow: "hidden",
        minHeight: "100vh",
      }}
    >
      <h2
        style={{
          fontFamily: "'Clash Grotesk','Arial Black', sans-serif",
          fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
          textTransform: "uppercase",
          color: "#1a1208",
          margin: "0 0 0.6rem",
          textAlign: "center",
          lineHeight: 1,
        }}
      >
        Events
      </h2>

      <TextReveal
        paragraph="Moments, competitions and experiences from my journey so far that have shaped my journey."
        style={{
          display: "block",
          fontFamily: "'Inter', 'Arial', sans-serif",
          fontSize: "clamp(1rem, 1.5vw, 1.1rem)",
          color: "rgba(30,20,10,0.5)",
          letterSpacing: "0.03em",
          textAlign: "center",
          margin: "30px 35px",
           fontWeight: 500,
          
 
        }}
        shadowColor="rgba(30,20,10,0.15)"
        triggerStart="top 85%"
        triggerEnd="top 55%"
      />

      {isMobile ? <MobileCarousel mounted={mounted} /> : <DesktopFan mounted={mounted} />}
    </section>
  );
}