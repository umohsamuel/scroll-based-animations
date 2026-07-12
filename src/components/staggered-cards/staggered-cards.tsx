import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

export default function StaggeredCards() {
  const container = useRef(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".card");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: `+=4000px`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card, index) => {
        const targetY = index * 50;
        const targetX = index * 150;

        tl.fromTo(
          card,
          {
            y: window.innerHeight + 100,
            x: window.innerWidth - index * 100,
            rotation: index % 2 === 0 ? -15 : 15,
            opacity: 0.15,
          },
          {
            y: targetY,
            x: targetX,
            rotation: 0,
            opacity: 1,
            ease: "power1.out",
            duration: 1,
            lazy: true,
            willChange: "transform, opacity",
          },
          index === 0 ? undefined : `-=0.4`
        );
      });
    },
    { scope: container }
  );

  return (
    <div ref={container} className="relative w-full h-[100vh] overflow-hidden">
      <div className="card-container h-screen w-full overflow-hidden">
        {cardsArr.map((v, i) => (
          <div
            key={v + i}
            className="card absolute top-10 left-10 w-[500px] h-[500px] border-2 border-solid border-dark shadow-xl flex justify-center items-center bg-light text-dark font-bold font-panchang text-5xl opacity-15"
          >
            <span className="absolute top-[5%] left-[5%] font-archiDaughter text-6xl font-extrabold">
              {normalizeNumber(i + 1)}
            </span>
            <span className="uppercase italic">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const cardsArr = ["this", "is", "a", "vertically", "staggered", "stack"];

function normalizeNumber(num: number): string {
  if (num === 0) return "0";

  if (num > 9) return `${num}`;

  return `0${num}`;
}
