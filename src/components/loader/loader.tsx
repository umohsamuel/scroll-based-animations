import { useGSAP } from "@gsap/react";
import { useProgress } from "@react-three/drei";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import WojakGif from "../../assets/gifs/brainlet-wojak.gif";

export default function Loader({ isLoaded }: { isLoaded: boolean }) {
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const { progress } = useProgress();

  useGSAP(() => {
    if (isLoaded && loaderRef.current) {
      gsap.to(loaderRef.current, {
        opacity: 0,
        y: "-100%",
        duration: 0.8,
        ease: "power3.inOut",
        onComplete: () => {
          if (loaderRef.current) loaderRef.current.style.display = "none";
          ScrollTrigger.refresh();
        },
      });
    }
  }, [isLoaded]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-dark"
    >
      <div className="flex flex-col items-center space-y-4 font-mono">
        <img
          src={WojakGif}
          alt="wojak-loader"
          className="max-h-[300px] w-auto"
        />
        <h2 className="text-xl font-medium tracking-widest">
          LOADING 3D MODEL
        </h2>
        <div className="relative w-full h-6  overflow-hidden">
          <div
            className="text-sm absolute inset-0 bg-black h-full flex justify-center items-center text-light transition-colors duration-300 ease-linear text-center"
            style={{ width: `${progress}%` }}
          >
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
}
