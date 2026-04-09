import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './StickyCards.css';
import TextReveal from '../TextReveal/TextReveal';
import img1 from '../../assets/codemart.webp';
import img2 from '../../assets/troud2.jpg';
import img3 from '../../assets/wisper.webp';
import img4 from '../../assets/hr.png';
import img5 from '../../assets/cura.png';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: string;
  tag: string;
  title: string;
  description: string;
  tech: string[];
  image: string;
  color: string;
  link?: string;
}

const projects: Project[] = [
  {
    id: 'card-1',
    tag: 'Full-Stack',
    title: '𝗖𝗼𝗱𝗲𝗠𝗮𝗿𝘁',
    description: 'A full-stack marketplace platform connecting developers with innovative software projects.Features secure authentication, project browsing with advanced filtering, integrated payments, and a modern responsive interface built for seamless developer collaboration.',
    tech: ['REACT', 'ASP.NET', 'PostgreSQL', 'Supabase'],
    image: img1,
    color: '#1a1d29',
    link: 'https://www.linkedin.com/posts/sanjana-dissanayake-b04963302_fullstackdevelopment-aspnetcore-reactjs-activity-7411444979992211456-oLN5?utm_source=share&utm_medium=member_desktop&rcm=ACoAAE1iTHQBbpUX8IAkfdMq4QHeytkqTSkcVR8',
  },
  {
    id: 'card-2',
    tag: 'Machine Learning',
    title: 'CuraNex',
    description: 'An AI-powered full-stack demand forecasting and inventory optimization platform designed for pharmaceutical supply chains. Features advanced time-series models, multi-horizon forecasting, anomaly detection, and intelligent reorder recommendations, supported by a scalable data pipeline, REST APIs, and an interactive dashboard for real-time analytics and decision-making.',
    tech: ['React', 'FastAPI', 'XGBoost', 'LightGBM', 'PyTorch'],
    image: img5,
    color: '#1a1d29',
    link: 'https://www.linkedin.com/posts/sanjana-dissanayake-b04963302_machinelearning-timeseriesforecasting-deeplearning-ugcPost-7447859313710407680-bZfJ?utm_source=share&utm_medium=member_desktop&rcm=ACoAAE1iTHQBbpUX8IAkfdMq4QHeytkqTSkcVR8',
  },
  {
    id: 'card-3',
    tag: 'Machine Learning',
    title: 'TROWD',
    description:
      'A real-time bus tracking and prediction system for Sri Lankan transit that combines machine learning, live GPS data, and crowd-sourced reports to estimate ETAs,confirm arrivals, and predict bus occupancy.',
    tech: ['FastAPI', 'FastAPI', 'XGBOOST', 'Redis'],
    image: img2,
    color: '#1a1d29',
    link: 'https://github.com/Crowd-Based-Bus-Tracking-System',
  },
  {
    id: 'card-4',
    tag: 'Full-Stack',
    title: 'Whisper',
    description:
      'A secure real-time web chat application featuring JWT authentication, OTP-based login, and WebSocket messaging. Designed with a scalable full-stack architecture using Spring Boot, React, and PostgreSQL.',
    tech: ['Spring Boot', 'React', 'PostgreSQL', 'WebSockets'],
    image: img3,
    color: '#1a1d29',
    link: 'https://www.linkedin.com/posts/sanjana-dissanayake-b04963302_fullstackdevelopment-webdevelopment-realtimechat-activity-7364900389671874560-g_fD?utm_source=share&utm_medium=member_desktop&rcm=ACoAAE1iTHQBbpUX8IAkfdMq4QHeytkqTSkcVR8',
  },
  {
    id: 'card-5',
    tag: 'Desktop Application',
    title: 'HR-Management System',
    description:
      'A C# WPF desktop HR management system for managing employees, departments, attendance, leave, and payroll, with role-based authentication, automated payroll, and reporting features.',
    tech: ['C#', 'WPF', 'SQL Server'],
    image: img4,
    color: '#1a1d29',
    link: 'https://github.com/sanjanadissa/HR-Management-System-',
  },
];

const StickyCards = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    const cards = container.querySelectorAll<HTMLElement>('.sc-card');
    const header = headerRef.current;
    const totalCards = cards.length;
    const segmentSize = 1 / totalCards;
    const cardYOffset = 5;
    const cardScaleStep = 0.075;

    cards.forEach((card, i) => {
      gsap.set(card, {
        xPercent: -50,
        yPercent: -50 + i * cardYOffset,
        scale: 1 - i * cardScaleStep,
        rotationX: 0,
      });
    });

    if (header) gsap.set(header, { yPercent: 0 });

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=${window.innerHeight * totalCards}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.5,
      onUpdate: (self) => {
        const progress = self.progress;
        const activeIndex = Math.min(
          Math.floor(progress / segmentSize),
          totalCards - 1,
        );
        const segProgress =
          (progress - activeIndex * segmentSize) / segmentSize;

        cards.forEach((card, i) => {
          if (i < activeIndex) {
            gsap.set(card, { yPercent: -250, rotationX: 35, scale: 0.9 });
          } else if (i === activeIndex) {
            gsap.set(card, {
              yPercent: gsap.utils.interpolate(-50, -250, segProgress),
              rotationX: gsap.utils.interpolate(0, 35, segProgress),
              scale: gsap.utils.interpolate(1, 0.9, segProgress),
            });
          } else {
            const behindIndex = i - activeIndex;
            gsap.set(card, {
              yPercent: -50 + (behindIndex - segProgress) * cardYOffset,
              rotationX: 0,
              scale: 1 - (behindIndex - segProgress) * cardScaleStep,
            });
          }
        });

        if (header) {
          if (activeIndex === 0) {
            gsap.set(header, {
              yPercent: gsap.utils.interpolate(0, -200, segProgress),
            });
          } else {
            gsap.set(header, { yPercent: -200 });
          }
        }
      },
    });

    const originalBg = 'rgb(0, 0, 0)';
    const targetBg = 'rgb(238, 232, 220)';
    const skillBentoEl = document.querySelector('.skill-bento-section') as HTMLElement | null;
    const previousBodyBg = document.body.style.backgroundColor;

    gsap.set(document.body, { backgroundColor: originalBg });
    gsap.set(section, { backgroundColor: originalBg });
    if (skillBentoEl) gsap.set(skillBentoEl, { backgroundColor: originalBg });

    const bgTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        end: 'top top',
        scrub: 0.7,
      },
    });

    bgTimeline
      .to(document.body, { backgroundColor: targetBg, ease: 'none' }, 0)
      .to(section, { backgroundColor: targetBg, ease: 'none' }, 0);

    if (skillBentoEl) {
      bgTimeline.to(skillBentoEl, { backgroundColor: targetBg, ease: 'none' }, 0);
    }

    // Only fade the main section title color with the background change
    bgTimeline.to('.sc-title', {
      color: '#111111',
      ease: 'none',
    }, 0);

    bgTimeline.to('.nav-glass-surface', {
      backgroundColor: 'rgba(20, 15, 5, 0.75)',
      ease: 'none',
    }, 0);

    return () => {
      trigger.kill();
      bgTimeline.scrollTrigger?.kill();
      bgTimeline.kill();
      gsap.set(document.body, { backgroundColor: previousBodyBg || '' });
      gsap.set(section, { backgroundColor: originalBg });
      if (skillBentoEl) gsap.set(skillBentoEl, { clearProps: 'backgroundColor' });
      gsap.set('.nav-glass-surface', { clearProps: 'backgroundColor' });
      // clear only the title color override when leaving section
      gsap.set('.sc-title', { clearProps: 'color' });
    };
  }, []);

  return (
    <div id="projects" className="sc-section" ref={sectionRef}>
      <div className="sc-inner">
        <div className="sc-header" ref={headerRef}>
          <h2 className="sc-title">Projects</h2>
          <TextReveal
            paragraph="Projects I've built recently where ideas and code come together to solve real-world problems."
            className="sc-eyebrow"
            shadowColor=" rgba(255, 255, 255, 0.4)"
            triggerStart="top 90%"
            triggerEnd="top 55%"
          />
        </div>

        <div className="sc-perspective" ref={containerRef}>
          {projects.map((proj, idx) => (
            <article
              key={proj.id}
              id={proj.id}
              className="sc-card"
              style={
                {
                  '--card-bg': proj.color,
                  zIndex: projects.length - idx,
                } as React.CSSProperties
              }
            >
              <div className="sc-card-inner">
                <div className="sc-card-top">
                  <span className="sc-tag">{proj.tag}</span>
                  <span className="sc-num">0{idx + 1}</span>
                </div>
                

                <div className="sc-card-content">
                  <div className="sc-text-section">
                    <h3 className="sc-proj-title">{proj.title}</h3>
                    <p className="sc-desc">{proj.description}</p>

                    <ul className="sc-tech-list">
                      {proj.tech.map((t, techIndex) => (
                        <li key={`${proj.id}-${techIndex}`} className="sc-tech-pill">
                          {t}
                        </li>
                      ))}
                    </ul>
{proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noreferrer"
                        className="sc-details"
                      >
                        View Details
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          className="sc-details-arrow"
                        >
                          <path
                            d="M4 10H16M16 10L10 4M16 10L10 16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    )}
                    
                  </div>

                  <div className="sc-image-section">
                    <div className="sc-image-wrapper">
                      <img src={proj.image} alt={proj.title} />
                    </div>
                    {/* {proj.link && (
                      <a
                        href={proj.link}
                        className="sc-cta"
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Project
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          className="sc-cta-arrow"
                        >
                          <path
                            d="M4 10H16M16 10L10 4M16 10L10 16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    )} */}
                  </div>
                </div>
              </div>
            </article>
          ))}
          
        </div>
      </div>
    </div>
  );
};

export default StickyCards;
