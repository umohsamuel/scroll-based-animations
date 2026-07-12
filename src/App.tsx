// import "./App.css";

import { useEffect, useRef, useState } from "react";

import { type LenisRef, ReactLenis } from "lenis/react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollZoom from "./components/scroll-zoom/scroll-zoom.tsx";
import ModelAnimation from "./components/model-animation/model-animation.tsx";
import { useProgress } from "@react-three/drei";
import Loader from "./components/loader/loader.tsx";
import StaggeredCards from "./components/staggered-cards/staggered-cards.tsx";
import StickyVertical from "./components/sticky-vertical/sticky-vertical.tsx";
import HorizontalScroll from "./components/horizontal-scroll/horizontal-scroll.tsx";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);

function App() {
  const lenisRef = useRef<LenisRef | null>(null);
  const containerRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);

  const { active } = useProgress();

  useEffect(() => {
    if (!active) {
      setIsLoaded(true);
    }
  }, [active]);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => gsap.ticker.remove(update);
  }, []);

  useGSAP(
    () => {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) return;

      lenis.on("scroll", ScrollTrigger.update);

      if (!isLoaded) {
        lenis.stop();
      } else {
        lenis.start();
      }

      return () => {
        lenis.off("scroll", ScrollTrigger.update);
      };
    },
    { scope: containerRef, dependencies: [isLoaded] }
  );

  return (
    <main>
      <Loader isLoaded={isLoaded} />

      <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
        <div ref={containerRef} className="min-h-screen w-full font-panchang ">
          <ScrollZoom />
          <ModelAnimation />
          <div className="bg-linear-to-b from-dark via-light  to-dark">
            <StaggeredCards />
            <StickyVertical />
            <HorizontalScroll />
          </div>
        </div>
      </ReactLenis>
    </main>
  );
}

export default App;
