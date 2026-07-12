import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

// Adjust this value to change how fast or slow the vertical scroll happens.
// Higher value (e.g., 5000) = slower scrolling (requires more mouse wheel movement).
// Lower value (e.g., 1500) = faster scrolling.
const SCROLL_DURATION = 3000;

export default function StickyVertical({
  scrollDuration = SCROLL_DURATION,
}: {
  scrollDuration?: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const leftCol = useRef<HTMLDivElement>(null);
  const rightCol = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!container.current || !leftCol.current || !rightCol.current) return;

      const rightHeight = rightCol.current.scrollHeight;
      const windowHeight = window.innerHeight;

      if (rightHeight <= windowHeight) return;

      const timeln = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: `+=${scrollDuration}px`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      timeln.to(rightCol.current, {
        y: -(rightHeight - windowHeight),
        ease: "none",
      });
    },
    { scope: container, dependencies: [scrollDuration] }
  );

  return (
    <section
      ref={container}
      className="h-[100vh] w-full relative overflow-hidden"
    >
      <div className="vertical_content flex justify-center items-start h-full w-full">
        <div
          ref={leftCol}
          className="w-1/2 h-full flex flex-col justify-center items-center col_left"
        >
          <div className="vertical_heading h-[500px] w-[500px] bg-light border-2 border-solid border-dark text-7xl font-black text-dark flex flex-col items-center justify-center gap-4 uppercase font-archiDaughter">
            <span>Chill</span>
            <span>Sticky</span>
            <span>Guy</span>
          </div>
        </div>

        <div
          ref={rightCol}
          className="w-[40%] col_right flex flex-col items-center pt-[10vh] pb-[10vh] will-change-transform"
        >
          {itemsArr.map((v, i) => (
            <div
              key={v + i}
              className="vertical_item mb-60 border border-solid border-dark bg-dark text-light font-bold font-panchang italic text-5xl h-[500px] w-[400px] shadow-xl uppercase text-center flex justify-center items-center"
            >
              {v}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const itemsArr = ["this", "is", "a", "sticky", "vertical", "scroll"];
