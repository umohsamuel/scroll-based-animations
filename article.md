Scroll Based Animations with GSAP, Lenis, Three.js & Typescript

what are scroll based animations
before we can talk about scroll based animations, we have to first understand what animations are

Animations
in simple terms, animation is the art of making inanimate objects appear to move.
in frontend development, its is intentinoal movement applied to elements that brings interfaces to life and guides user attention.

from this, we can proceed to what scroll based animations are following our understanding of what an animation is

Scroll-based animations are visual effects tied directly to a user's scrolling behavior. As you scroll down the page, the animation plays forward; if you scroll up, it reverses. If you stop scrolling, the animation freezes. They give readers direct control over the pacing of a webpage's experience.

types
Scroll-linked Animations: The animation progress is directly linked to the scrollbar’s position (e.g., cant think of anything specific rn...)

Scroll-triggered Animations: The scrolling act triggers a standard, time-based animation when the element crosses a specific point on the screen (e.g., a "fade-in" effect once a block of text scrolls into view).

the concept between scroll linked and scroll triggered are the same, but scroll triggered animations usually look more choppier and of lower quality as this happens in a prescribed time when the user crosses a certain treshold when scrolling, thats why in this guide wed focus mainly on scroll linked animations as they are the most complex to implement, and knowing these you can easily transfer to scroll triggered

why do we implement them

we use them to guide user attention, which enhances visual storytelling, and helps improve perceived performance by revealing content progressively and not overloading the user with all info at once

building blocks & key things and features you need to understand to be able to perform any form of scoll based animations

there are mainly 3 fundamental concept we need to understand in order to implement any sort of scroll based animatino

the Target, the Timeline, and the Animation Range

1. The Target & Properties: Every scroll animation needs an element to act upon (the target) and the visual properties you want to alter.
2. The Timeline: Instead of playing over a set duration (e.g., 2s), scroll linked animations tie directly to a scroll progress timeline. you can now adjust this timeline to determine how fast or how slow the animations will playout depending on the users scroll speed
3. The Animation Range: Ranges define when the animation starts and when it finishes along the timeline. You can define bounds using keyword pairs like "top top", "top center", "top bottom", "bottom bottom" etc. For example, you can stipulate that an element's animation should only run from the moment it enters the screen up until it is gets to the center. animation ranges can also be specified with percentages or pixel counts

for any form of scroll based animationso we need smooth scroll, what is that?
Smooth scrolling is a feature that replaces instant, jarring page jumps with a gradual, animated transition when you scroll through digital documents, apps, or websites. It makes content easier to track with your eyes and provides a more fluid, visually appealing reading experience.

introducing lenis as our solution for that and why
for our smooth scrolling experince we would be using Lenis
Lenis is a free, open-source library that turns native scroll into a silky, controllable experience in a single line of code.

so yes, i know you might be wondering, why lenis instead of css `{ scroll-behavior: smooth; }` or gsap scrollsmooth
so the short answer to this is
CSS smooth only smooths out programmatic jumps (like clicking an anchor link or calling window.scrollTo()). It does absolutely nothing to smooth out the continuous scrolling a user does with a mouse wheel or trackpad
and as for gsap scrollsmooth its a premium paid gsap plugin, so lenis is our solution to these constraints

introducing GSAP and what its used for
GSAP (GreenSock Animation Platform) is a powerful, high-performance JavaScript animation library used to animate anything JavaScript can touch.

how we can perform and link gsap to lenis to perform scroll based animations

so how lenis works is it intercepts your mouse wheel or trackpad input and applys linear interpolation (lerp) (yeah, ikr, how this math get into this?). in simple terms. it takes over our scroll input to smoothen the scroll effect and sometimes add momentum

so this is where the issue comes in
By default, the browser handles scrolling on its own thread, while GSAP animations update via JavaScript using requestAnimationFrame (the browser's refresh cycle)

without linking them, 1 lags behind the other (usually gsap) and this can cause mismatch in out animations and jumpy/shaky and snappy bugs

while Lenis smoothly glides the entire web page up and down using a custom timeline. GSAP ScrollTrigger reads the raw browser scroll position. Because these two calculations happen milliseconds apart, GSAP is always a frame or two behind Lenis.

so we have to link them so Lenis emits its scroll position updates directly into GSAP's internal ticker. that way They run on the exact same frame loop, making animations perfectly locked to the fluid scroll.

```
// import "./App.css";

import { useEffect, useRef } from "react";

import { type LenisRef, ReactLenis } from "lenis/react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";


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

      if (!isLoaded) {
        lenis.stop();
      } else {
        lenis.start();
      }

      return () => {
        lenis.off("scroll", ScrollTrigger.update);
      };
    },
    { scope: containerRef }
  );

  return (
    <main>
      <Loader isLoaded={isLoaded} />

      <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
        <div ref={containerRef} className="min-h-screen w-full font-panchang ">
         // normal cooking here
          </div>
        </div>
      </ReactLenis>
    </main>
  );
}

export default App;

```

how to animate elements with gsap in react
we will use the gsap react plugin for this `@gsap/react` this helps us not worry about some of the bottlenecks that comes wth animating and cleaning up and all those unmount, remount and rerender issues

let me first introduce a few things

useGSAP() Hook: This is a specialized wrapper around React's useEffect. It handles cleanup automatically. When your component unmounts, GSAP kills the animations and triggers behind the scenes, preventing memory leaks.

Scoping: the gsap hook has a second argument object, one of the fields in it is a scope. It means GSAP will only look for elements inside this specific container passed as the scope. and the animations will only last the scope of this container and will cleanup when this element unmounts

we can use a ref for passing things to gsap instead of id or classname attributes, but we can still use id or classname where we need to, this is just an added convience when working with react

so now how do we create animations?

ususally when working with gsap, especiialy for scrollbased animatino, its best to create a timeline; A Timeline is a powerful sequencing tool that acts as a container for tweens and other timelines, making it simple to control them as a whole and precisely manage their timing. Without Timelines, building complex sequences would be far more cumbersome because you'd need to use a delay for every animation.

a tween, used in that definition is a gsap keyword, conined from inbetween , its represents the animating elemnt or the process of animating an element. A Tween is what does all the animation work - think of it like a high-performance property setter.

when we create a timeline, we can then control the entire sequence in the timeline together with some provided methods

```
tl.pause();
tl.resume();
tl.seek(1.5);
tl.reverse();
```

so now inside a timeline, we can now create tweens with the provided methods

```
tl.to()
tl.from()
tl.fromTo()
```

Positioning animations in a timeline
we do this with the help of the timeline position parameter
This one super-flexible parameter controls the placement of your tweens, labels, callbacks, pauses, and even nested timelines. In other words, it tells the timeline exactly where to insert the animation. It typically comes after the vars parameter and it has multiple behaviors:

well, a mortal man like me can not exhaustively explain all these to you in this blog post, so if youre not already familar with them, the gsap docs does a fantastic job at explaining them and even has a video explanatino for those that prefer that find that here `https://gsap.com/resources/position-parameter/`

so for a quick summart of these position parameters
Position Description
3 Start exactly 3 seconds from the beginning of the timeline.
"label" Start at the specified timeline label (creates it if missing).
"<" Start at the same time the previous animation starts.
">" Start when the previous animation ends.
"+=1" Start 1 second after the end of the timeline (adds a gap).
"-=1" Start 1 second before the end of the timeline (creates overlap).
"label+=2" Start 2 seconds after the specified label.
"<+=3" / "<3" Start 3 seconds after the previous animation starts.
">-0.5" Start 0.5 seconds before the previous animation ends.
"-=25%" Overlap the timeline end by 25% of the current animation's duration.
"+=50%" Start 50% of the current animation's duration after the timeline ends.
"<25%" Start 25% into the previous animation (based on its duration).
"<+=25%" Start 25% of the current animation's duration after the previous animation starts.
"label+=30%" Start 30% of the current animation's duration after the label.

and this is where a positional parameter lives in a timeline tween

```
tl.to(".class", { x: 100 }, "<1");

```

the "<1" is the positional parameter

you can also pass some special properites and callbacks to the timeline
Special Properties and Callbacks
you can add any of the provided vars object to further customize your animatino:

```
gsap.timeline({
  onComplete: myFunction,
  repeat: 2,
  repeatDelay: 1,
  yoyo: true,
});

```

heres a link t all the vars provided by gsap for more reference `https://gsap.com/docs/v3/GSAP/Timeline/#special-properties-and-callbacks`

for more extended readings on gsap timeline please check here `https://gsap.com/docs/v3/GSAP/Timeline/`

so now that we have understood most parts of creating an animatino
lets create a basic timeline animation. ill provide the code and walk you through it to better understand it

```
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
```

The example below creates a stack of cards that animate into place as you scroll. I'll walk through the important parts so you can see how the timeline controls the entire sequence.

1. Creating the timeline

first, we create a timeline

const tl = gsap.timeline({
scrollTrigger: {
trigger: container.current,
start: "top top",
end: "+=4000px",
pin: true,
scrub: true,
},
});

Instead of creating several independent animations, we create a single timeline. lets think of it as a container that stores the animations in the order they should play.

Because we've attached a ScrollTrigger, the timeline's progress is now controlled by scrolling instead of time. As the user scrolls, the timeline advances, and every animation inside it plays accordingly.

2. Looping through the cards

Next, we grab every card and loop through them.

```
cards.forEach((card, index) => {
  ...
});
```

so we are making the same animation for each card, just using the index to alter how it performs for each specific card dyg?

thats what were doing with

```
const targetY = index * 50;
const targetX = index * 150;
```

3. Defining where each card animation starts and ends

For every card, we use fromTo().

```
tl.fromTo(card, from, to);
```

the card is the card element, the from is where we will provide the inital state, and then the to is where we will provide the final output where we want the animatino to animate to

so we have this

```
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
```

from the provided form, we understand that Initially, every card:

starts below the viewport,
starts slightly off to the right,
is rotated left or right,
and is mostly transparent.

and the 2 describes where we animate the card to

The final argument is the timeline position parameter.

```
index === 0 ? undefined : "-=0.4"
```

The first card is added normally, so it starts at the beginning of the timeline.

Every other card is inserted 0.4 seconds before the previous animation finishes.

you can now see the usefullness of a timeline
notice that we never manually delay any animations.

We simply add each animation to the timeline, and GSAP handles all the sequencing for us. If we want animations to overlap, start together, or begin after a label, we only need to change the position parameter

how can we also perform scroll based animations with 3d elements?
so wether your animating html elements or 3d elements or donkeys, gsap doesnt care. the concepts are exactly the same, we just animate the 3d element three.js properties instead of the css properties dyg?

so instead of animating CSS properties such as x, y, opacity, or scale, we'll animate properties on a Three.js object like its position, rotation, and scale.

im assuming you have worked with 3d models or etc in react and know basic three.js or r3f here, but if you dont you can skips this section as explaining three.js in itself is beyound the scope of this already lengthy article

so moving on my learned three.js fellows

heres the code wed be working with

```
import { useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { type GLTF } from "three-stdlib";
import * as THREE from "three";

import { useGLTF, useAnimations, Center } from "@react-three/drei";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const MODEL_URL = "/models/3d/priest.glb";

useGLTF.preload(MODEL_URL, false, false, async (loader) => {
  loader.setMeshoptDecoder(MeshoptDecoder);
});

export default function ModelAnimation() {
  const scrollSectionRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={scrollSectionRef}
      className=" relative h-[400vh] bg-linear-to-b from-light to-dark text-dark w-full"
    >
      <div className="sticky top-0 h-[100vh] w-full overflow-hidden">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} />

          <AnimatedModel scrollSectionRef={scrollSectionRef} />
        </Canvas>
      </div>
    </div>
  );
}

interface ModelProps {
  scrollSectionRef: React.RefObject<HTMLDivElement | null>;
}

type GLTFResult = GLTF & {
  nodes: Record<string, THREE.Object3D>;
  materials: Record<string, THREE.Material>;
};

function AnimatedModel({ scrollSectionRef }: ModelProps) {
  const modelRef = useRef<THREE.Group | null>(null);

  const { scene, animations } = useGLTF(MODEL_URL, false, false, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  }) as GLTFResult;

  const { actions, names } = useAnimations(animations, modelRef);
  const { viewport } = useThree();

  useGSAP(
    () => {
      if (!modelRef.current || !scrollSectionRef.current) return;

      ScrollTrigger.refresh();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollSectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        modelRef.current.position,
        {
          x: -(viewport.width / 2) + 2.5,
          z: 0,
        },
        {
          x: viewport.width / 2 + 1,
          z: -2.5,
          ease: "power1.inOut",
        },
        0
      );

      tl.fromTo(
        modelRef.current.rotation,
        {
          y: 0,
        },
        {
          y: Math.PI * 2,
          ease: "none",
        },
        0
      );

      if (names.length > 0 && actions) {
        const primaryAction = actions[names[0]];
        if (primaryAction) primaryAction.play();
      }
    },
    { scope: scrollSectionRef, dependencies: [scene, actions, names, modelRef] }
  );

  return (
    <group ref={modelRef}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}
```

First we create a normal 3d scene with React Three Fiber.

Next, we load the GLTF model.

We then render it inside a group.

```
<group ref={modelRef}>
  <Center>
    <primitive object={scene} />
  </Center>
</group>
```

Notice that our ref is attached to the group, not the model itself. This gives GSAP a single object to animate regardless of how many meshes the model contains.

Creating the timeline

Just like our previous example, we create a timeline with a ScrollTrigger.

```
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: scrollSectionRef.current,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
  },
});

```

Again, scrolling controls the timeline's progress instead of time.

Animating the model's position

Our first animation moves the model across the viewport.

```
tl.fromTo(
  modelRef.current.position,
  {
    x: -(viewport.width / 2) + 2.5,
    z: 0,
  },
  {
    x: viewport.width / 2 + 1,
    z: -2.5,
  },
  0
);
```

im sure you noticed it

Previously when we animated our react/html element we simply did

```
gsap.to(".card", { x: 200 });
```

Now we're animating a Three.js Vector3.

so we could have to reference the position object

like `modelRef.current.position`

Since position is simply an object with x, y, and z values, GSAP can interpolate those numbers just like it would CSS transforms.

As the timeline progresses:

the model moves from the left side of the screen,
travels to the right,
and moves slightly backwards along the z-axis, to zoom out the model.

Animating the rotation

Next, we animate the model's rotation.

```
tl.fromTo(
  modelRef.current.rotation,
  {
    y: 0,
  },
  {
    y: Math.PI * 2,
    ease: "none",
  },
  0
);
```

Here we're animating the model's Y rotation.

Three.js stores rotations in radians, not degrees.

Some common values are:

Value Rotation
Math.PI / 2 90°
Math.PI 180°
Math.PI \* 2 360°

So Math.PI \* 2 causes the model to complete one full spin.

The ease: "none" is also important. Since this animation is tied directly to scrolling, using no easing makes the rotation feel perfectly synchronized with the user's scroll position.

notice we use 0 as the position parameter for both tween animatinos, this is cause we want both animatinos to start together at the begining of the animation timeline

yes, thats how we animate a 3d model, this is the foundation of it, any other code there is specific to 3d rendering and r3f like playing the model embedded animatino and etc

putting it all together to build a sample awwwards like 3d animation website combining everything we've learnt

i put all concepts together to build a basic awwwards style website with scroll based animatinos, most of this animations were inspired my lenis homepage design (those guys are crazy talented), so i have tried to build them with what we have explored so far

## Demo

Here is a video showing our scroll based animation:

<video src="https://res.cloudinary.com/db6nohcui/video/upload/v1783856106/compressed-scroll-based-animations_kwhl9f.mp4" controls playsinline width="100%"></video>

conclusion
