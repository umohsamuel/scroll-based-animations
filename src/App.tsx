// import "./App.css";

import { useEffect, useRef } from "react";

import { type LenisRef, ReactLenis } from "lenis/react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollZoom from "./components/scroll-zoom/scroll-zoom";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);

function App() {
  const lenisRef = useRef<LenisRef | null>(null);
  const containerRef = useRef(null);

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

      return () => {
        lenis.off("scroll", ScrollTrigger.update);
      };
    },
    { scope: containerRef }
  );

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      <div
        ref={containerRef}
        className="flex justify-center min-h-screen items-center w-full h-full"
      >
        <ScrollZoom />
      </div>
    </ReactLenis>
  );
}

export default App;
