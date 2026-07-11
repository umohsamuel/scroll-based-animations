import { useGSAP } from "@gsap/react";
import "./scroll-zoom.css";
import { gsap } from "gsap";
import { useRef } from "react";

export default function ScrollZoom() {
  const container = useRef(null);

  useGSAP(
    () => {
      const exp = gsap.timeline({
        scrollTrigger: {
          trigger: ".experience",
          start: "top top",
          end: "+=5000",
          scrub: true,
          markers: true,
          pin: ".experience",
        },
      });

      exp.to(".experience-middle", {
        "--progress1": 0.4,
        ease: "none",
      });

      exp.from(".extraBox", {
        scaleX: 0,
        ease: "none",
      });
    },
    { scope: container }
  );

  return (
    <div ref={container} className="w-full h-full m-0">
      <div className="experience">
        <div className="extraBox"></div>
        <div className="experience-show">
          <h1 className="experience-top">Let Me show you</h1>
          <div className="experience-middle-container">
            <h1 className="experience-middle font-panchang">Enter T Enter</h1>
          </div>
          <h1 className="experience-bottom">My Magic Trick</h1>
          <div className="spacer-end"></div>
        </div>
      </div>
      <section>another section</section>
    </div>
  );

  // useGSAP(
  //   () => {
  //     const exp = gsap.timeline({
  //       scrollTrigger: {
  //         trigger: ".experience",
  //         start: "top top",
  //         end: "+=5000",
  //         scrub: true,
  //         markers: true,
  //         pin: ".experience",
  //       },
  //     });

  //     exp.to(".experience-middle", {
  //       "--progress1": 1,
  //       ease: "none",
  //       smoothOrigin: true,
  //     });
  //     exp.from(
  //       ".extraBox",
  //       {
  //         scaleX: 0,
  //         ease: "none",
  //       },
  //       "-=0.4"
  //     );
  //   },
  //   { scope: container }
  // );

  // return (
  //   <div ref={container} className="w-full h-full m-0">
  //     <div className="experience">
  //       <div className="extraBox"></div>
  //       <div className="experience-show">
  //         <h1 className="experience-top">Let Me show you</h1>
  //         <div className="experience-middle-container">
  //           <h1 className="experience-middle font-panchang">Enter T Enter</h1>
  //         </div>
  //         <h1 className="experience-bottom">My Magic Trick</h1>
  //         <div className="spacer-end"></div>
  //       </div>
  //     </div>
  //     <section>another section</section>
  //   </div>
  // );
}
