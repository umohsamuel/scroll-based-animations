import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef } from "react";

const SCROLL_DURATION = 1500;

export default function HorizontalScroll({
  scrollDuration = SCROLL_DURATION,
}: {
  scrollDuration?: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!container.current || !contentRef.current) return;

      const box_items = gsap.utils.toArray<HTMLElement>(".horizontal_item");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: `+=${scrollDuration}px`,
          pin: true,
          scrub: 1,
          snap: {
            snapTo: 1 / (box_items.length - 1),
            duration: { min: 0.2, max: 0.4 },
            delay: 0.2,
            ease: "power1.inOut",
          },
          invalidateOnRefresh: true,
        },
      });

      const getScrollAmount = () => {
        const contentWidth = contentRef.current!.scrollWidth;
        return -(contentWidth - window.innerWidth);
      };

      tl.to(contentRef.current, {
        x: getScrollAmount,
        ease: "none",
      });
    },
    { scope: container, dependencies: [scrollDuration] }
  );

  return (
    <div ref={container} className="relative w-full h-[100vh] overflow-hidden">
      <div className="flex h-screen items-center text-light pl-12 pr-12">
        <div ref={contentRef} className=" flex will-change-transform">
          {itemsArr.map((v, i) => (
            <div
              key={v + i}
              className="horizontal_item shrink-0 mr-36 border border-solid border-light h-[420px] text-dark bg-light w-[550px] flex justify-center items-center shadow-xl text-5xl uppercase font-panchang italic font-bold"
            >
              {v}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const itemsArr = ["this", "is", "a", "controlled", "horizontal", "scroll"];
