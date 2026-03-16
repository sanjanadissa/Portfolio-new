import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LayeredPanels: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panels = gsap.utils.toArray(".panel");

    // Set z-index of panels (topmost has highest z-index)
    gsap.set(panels, {
      zIndex: (i: number, _: any, arr: any[]) => arr.length - i,
    });

    // Animate panels to slide up
    gsap.to(".panel:not(:last-child)", {
      yPercent: -100,
      ease: "none",
      stagger: 0.5,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=300%",
        scrub: true,
        pin: true,
      },
    });
  }, []);

  return (
    <div
      ref={containerRef}
      id="container"
      className="absolute top-0 left-0 w-full h-full overflow-hidden"
    >
      {/* Top Description Panel */}
      <div className="panel flex items-center justify-center bg-white text-black h-screen w-full p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Layered Pinning from Bottom</h1>
          <p className="text-lg mb-6">
            A simple example where overlapping panels reveal from the bottom.
          </p>
          <div className="animate-bounce text-xl">↓ Scroll down</div>
        </div>
      </div>

      {/* Panel 1 */}
      <section className="panel bg-green-500 flex items-center justify-center h-screen w-full">
        <h2 className="text-[30vw] text-white opacity-20">1</h2>
      </section>

      {/* Panel 2 */}
      <section className="panel bg-black flex items-center justify-center h-screen w-full">
        <h2 className="text-[30vw] text-white opacity-20">2</h2>
      </section>

      {/* Panel 3 */}
      <section className="panel bg-purple-700 flex items-center justify-center h-screen w-full">
        <h2 className="text-[30vw] text-white opacity-20">3</h2>
      </section>
    </div>
  );
};

export default LayeredPanels;
