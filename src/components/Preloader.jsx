import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const welcomeWords = [
  'Hello',
  'Bonjour',
  'स्वागत हे',
  'Ciao',
  'Olá',
  'おい',
  'Hallå',
  'Guten tag',
  'Hallo',
  'স্বাগতম',
];

const Preloader = ({ onComplete }) => {
  const loadingRef = useRef(null);
  const loadingRoundRef = useRef(null);
  const textRef = useRef(null);
  const welcomeRefs = useRef([]);
  const [ready, setReady] = useState(false);

  // Wait for real loading: window "load" and key images
  useEffect(() => {
    let loaded = false;

    const markLoaded = () => {
      if (loaded) return;
      loaded = true;
      setReady(true);
    };

    // 1) window load (all resources finished)
    if (document.readyState === 'complete') {
      markLoaded();
    } else {
      window.addEventListener('load', markLoaded, { once: true });
    }

    // 2) Optional: ensure hero image has loaded (if present in DOM)
    const heroImg = document.querySelector('.mobile-hero-img, .fluid-hero-img');
    if (heroImg && heroImg.complete) {
      markLoaded();
    } else if (heroImg) {
      heroImg.addEventListener('load', markLoaded, { once: true });
      heroImg.addEventListener('error', markLoaded, { once: true });
    }

    // Failsafe: if something hangs, complete after 8s max
    const timeoutId = setTimeout(markLoaded, 8000);

    return () => {
      window.removeEventListener('load', markLoaded);
      if (heroImg) {
        heroImg.removeEventListener('load', markLoaded);
        heroImg.removeEventListener('error', markLoaded);
      }
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    const timeline = gsap.timeline({ defaults: { ease: 'power2.inOut' } });

    welcomeRefs.current.forEach((el, index) => {
      if (!el) return;
      const isFirst = index === 0;
      const isLast = index === welcomeRefs.current.length - 1;
      const holdTime = isFirst ? 0.6 : isLast ? 0.6 : 0.12;

      if (isFirst) {
        timeline.to(el, { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.8 });
      } else {
        timeline.set(el, { opacity: 1 });
      }

      if (!isLast) timeline.set(el, { opacity: 0 }, `+=${holdTime}`);
    });

    timeline.to(textRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.inOut',
    }, '+=0.3');

    timeline
      .to(loadingRef.current, { y: '-100%', duration: 0.8, ease: 'expo.out' }, '-=0.1')
      .to(loadingRoundRef.current, { height: 0, ease: 'expo.out' }, '-=0.5')
      .call(() => {
        if (onComplete) onComplete();
      });

    return () => {
      timeline.kill();
    };
  }, [ready, onComplete]);

  return (
    <>
      <style>{`
        .preloader-loading {
          width: 100vw;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
          background: #1C1D20;
        }
        .preloader-loading-round {
          position: absolute;
          height: 20vh;
          width: 100vw;
          top: 99%;
          overflow: hidden;
        }
        .preloader-curve {
          height: 200%;
          width: 150%;
          background: #1C1D20;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -100%);
        }
        .preloader-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
        }
        .preloader-welcome-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          gap: 1rem;
          opacity: 0;
          font-family: 'Raleway', sans-serif;
        }
        .preloader-welcome-text .preloader-dot {
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .preloader-welcome-text h2 {
          color: white;
          font-size: 2.5rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          white-space: nowrap;
          margin: 0;
          padding: 0;
        }
      `}</style>

      <div className="preloader-loading" ref={loadingRef}>
        <div className="preloader-text" ref={textRef}>
          {welcomeWords.map((word, i) => (
            <div
              key={i}
              className="preloader-welcome-text"
              ref={(el) => (welcomeRefs.current[i] = el)}
            >
              <div className="preloader-dot"></div>
              <h2>{word}</h2>
            </div>
          ))}
        </div>
        <div className="preloader-loading-round" ref={loadingRoundRef}>
          <div className="preloader-curve"></div>
        </div>
      </div>
    </>
  );
};

export default Preloader;
