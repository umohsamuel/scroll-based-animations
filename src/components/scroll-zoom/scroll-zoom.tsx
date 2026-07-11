import { useGSAP } from "@gsap/react";
import "./scroll-zoom.css";
import { gsap } from "gsap";
import { useRef } from "react";

export default function ScrollZoom() {
  const container = useRef(null);

  useGSAP(
    () => {
      gsap.to(".animation-bottom", {
        y: -15,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".animation",
          start: "top top",
          end: "+=5000",
          scrub: true,
          pin: ".animation",
        },
      });

      tl.to(".animation-middle", {
        "--progress1": 0.6,
        ease: "none",
        duration: 1.5,
      });

      tl.to(
        ".animation-top",
        {
          xPercent: -250,
          ease: "power4.out",
          duration: 1.5,
        },
        0
      );

      tl.to(
        ".animation-bottom",
        {
          xPercent: 250,
          ease: "power4.out",
          duration: 1.5,
        },
        0
      );

      tl.from(
        ".extraBox",
        {
          scaleX: 0,
          ease: "power1.out",
          duration: 0.5,
        },
        "-=0.3"
      );

      return () => {
        tl.kill();
      };
    },
    { scope: container }
  );

  return (
    <div ref={container} className="w-full h-full m-0 bg-dark text-light">
      <div className="animation relative w-full h-[100vh] z-10 overflow-hidden">
        <div className="extraBox absolute inset-0 w-full h-full z-10 pointer-events-none origin-center bg-light" />
        <div className="text-6xl font-bold uppercase">
          <h1 className="animation-top absolute top-[5%] tracking-wide left-[2.5%]">
            scroll <span className="text-light/60">based</span> <br />{" "}
            <span className="font-archiDaughter tracking-widest">
              animations
            </span>
          </h1>
          <div className="inset-0 absolute grid place-items-center pointer-events-none">
            <h1 className="animation-middle origin-center font-black whitespace-nowrap text-[clamp(4rem,18vw,15rem)] text-center ">
              <br />
              enter
              <br />
              umoh
              <br />
            </h1>
          </div>
          <h1 className="animation-bottom right-[2.5%] bottom-[5%] absolute font-archiDaughter tracking-widest ">
            Scroll down to see
          </h1>
          <div className="spacer-end"></div>
        </div>
      </div>
    </div>
  );
}
