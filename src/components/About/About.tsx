import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './About.css';
import InfiniteMarquee from '../InfiniteMarquee/InfiniteMarquee';

gsap.registerPlugin(ScrollTrigger);

// ── Education data ─────────────────────────────────────────
const education = [
  {
    year: '2012 – 2022',
    school: 'D.S. Senanayake College',
    degree: 'Advanced Level · Physical Science stream',
    badge: 'Former Student',
  },
  {
    year: '2023 – Present',
    school: 'University of Kelaniya',
    degree: 'BSc (Hons) in Computer Science — Specialisation: Artificial Intelligence',
    badge: 'Undergraduate',
  },
];

// ── Component ──────────────────────────────────────────────
export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
        },
        defaults: { ease: 'power3.out' },
      });

      tl.fromTo('.about-heading',   { opacity: 0, y: 40, skewY: 1.5 }, { opacity: 1, y: 0, skewY: 0, duration: 0.9 })
        .fromTo('.about-eyebrow',   { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 }, '-=0.4')
        .fromTo('.about-bio-para',  { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.18 }, '-=0.35');

      gsap.fromTo(
        '.about-edu__item',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.8, stagger: 0.25, ease: 'power3.out',
          scrollTrigger: { trigger: '.about-right', start: 'top 80%', once: true },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="about-section" ref={sectionRef}>
      {/* Ambient glow blobs */}
      <div className="about-glow about-glow--purple" />
      <div className="about-glow about-glow--cyan" />

      {/* ── Inner container ─────────────────────────────────── */}
      <div className="about-inner">

        {/* ── ROW 1 — Full-width heading ───────────────────── */}
        <div className="about-heading-row">
          <h2 className="about-heading">
            <span className="about-heading__name">About</span> Me
          </h2> 
        </div>

        {/* ── ROW 2 — Two-column content ───────────────────── */}
        <div className="about-columns">

          {/* LEFT — 2/3 width: eyebrow + bio */}
          <div className="about-left">
            <p className="about-eyebrow">
              <span className="about-eyebrow__line" />
              Who am I?
            </p>

            <div className="about-bio">
              <p className="about-bio-para">
                Hi, I'm Sanjana Dissanayaka — a Computer Science undergraduate at the
                University of Kelaniya, currently specialising in Artificial Intelligence.
                I'm passionate about building intelligent systems using machine learning
                and deep learning, while also enjoying full-stack development. I like
                working across the whole software stack — from crafting clean and
                interactive frontends to building reliable backend systems.
              </p>
              <p className="about-bio-para">
                I frequently work with technologies like React, .NET, and Spring Boot,
                focusing on writing clean, maintainable code and building practical
                applications. Whether I'm experimenting with an AI model, developing a
                web application, or designing a REST API, I enjoy turning ideas into real
                projects and continuously learning new technologies along the way.
              </p>
            </div>
          </div>

          {/* Vertical divider line */}
          <div className="about-divider" aria-hidden="true" />

          {/* RIGHT — 1/3 width: Education eyebrow + timeline */}
          <div className="about-right">
            <p className="about-eyebrow">
              <span className="about-eyebrow__line" />
              Education
            </p>

            <div className="about-edu__timeline">
              {education.map((e, i) => (
                <div key={i} className="about-edu__item">
                  <div className="about-edu__year">{e.year}</div>
                  <div className="about-edu__line">
                    <div className="about-edu__dot" />
                  </div>
                  <div className="about-edu__content">
                    <div className="about-edu__school">{e.school}</div>
                    <div className="about-edu__degree">{e.degree}</div>
                    <span className="about-edu__badge">{e.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── InfiniteMarquee live inside About section ─────── */}
      <InfiniteMarquee />
    </section>
  );
}
