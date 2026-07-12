# Scroll Based Animations with GSAP, Lenis, Three.js & TypeScript

> A practical guide to implementing high-performance scroll-based animations in React. Learn the core concepts behind scroll timelines, how to synchronize GSAP with Lenis smooth scrolling, and how to sequence complex animations for both DOM elements and 3D models.

## Prerequisites

What do you need to follow this article?

1. Working understanding of frontend development with React and TypeScript.
2. Knowledge of GSAP.
3. Optional knowledge of Three.js and React Three Fiber.

## What are Scroll-Based Animations?

Before we can explore scroll-based animations, we need to first understand what animations are.

### Animations

In simple terms, animation is the art of making inanimate objects appear to move. In frontend development, it is the intentional movement applied to elements that brings interfaces to life and guides user attention.

Now that we understand what animations are, let's talk about how scrolling ties into this.

Scroll-based animations are visual effects tied directly to a user's scrolling behavior. As you scroll down the page, the animation plays forward. If you scroll up, it reverses. If you stop scrolling, the animation freezes. This give users direct control over the pacing of a webpage's experience.

### Types of Scroll Animations

**Scroll-linked Animations:** The animation progress is directly tied to your scrollbar's position (e.g., a reading progress bar at the top of a blog post that grows exactly as you scroll down).

**Scroll-triggered Animations:** The scrolling act triggers a standard, time-based animation when the element crosses a specific point on the screen (e.g., a "fade-in" effect once a block of text scrolls into view).

The concept between scroll-linked and scroll-triggered animations is the same, but scroll-triggered animations usually look choppier and of lower quality. This happens because they execute in a prescribed time when the user crosses a certain threshold while scrolling.

That is why in this guide we will focus mainly on scroll-linked animations. It is the most complex to implement, and knowing this, you can easily transfer the knowledge to scroll-triggered animations.

## Why Do We Implement Them?

We use them to guide user attention, which enhances visual storytelling. It also helps improve perceived performance by revealing content progressively and not overloading the user with all the information at once.

## Core Building Blocks

There are mainly three fundamental concepts you need to grasp to build any sort of scroll-based animation: the target, the timeline, and the animation range.

1. **The Target & Properties:** Every scroll animation needs an element to act upon (the target) and the visual properties you want to alter.
2. **The Timeline:** Instead of playing over a set duration (e.g., 2s), scroll-linked animations tie directly to a scroll progress timeline. You can adjust this timeline to determine how fast or how slow the animations will play out, depending on the user's scroll speed.
3. **The Animation Range:** Ranges define when the animation starts and when it finishes along the timeline. You can define bounds using keyword pairs like "top top", "top center", "top bottom", and "bottom bottom". For example, you can specify that an element's animation should only run from the moment it enters the screen up until it gets to the center. Animation ranges can also be specified with percentages or pixel counts.

## Smooth Scrolling: What Is It?

For any form of scroll-based animation, we need smooth scroll. Smooth scrolling is a feature that replaces instant, jarring page jumps with a gradual, animated transition when you scroll through apps, or websites. It makes content easier to track with your eyes and provides a more fluid, visually appealing reading experience.

### Introducing Lenis

For our smooth scrolling experience, we would be using Lenis. Lenis is a free, open-source library that turns native scroll into a silky and controllable experience.

I know you might be wondering, why Lenis instead of CSS `{ scroll-behavior: smooth; }` or GSAP ScrollSmoother?

The short answer to this is that CSS smooth scrolling only smooths out programmatic jumps (like clicking an anchor link or calling window.scrollTo()). It does absolutely nothing to smooth out the continuous scrolling a user does with a mouse wheel or trackpad. As for GSAP ScrollSmoother, it is a premium paid GSAP plugin. Therefore, Lenis is our best solution to these constraints.

## Introducing GSAP

GSAP (GreenSock Animation Platform) is a powerful, high-performance JavaScript animation library used to animate anything JavaScript can touch.

### Linking GSAP to Lenis

How Lenis works is it intercepts your mouse wheel or trackpad input and applies linear interpolation (lerp). Yes, I know, how did math get into this? In simple terms, it takes over your native scroll input to smoothen the scrolling effect and sometimes add momentum.

This is exactly where the conflict happens. By default, GSAP ScrollTrigger reads the raw, native browser scroll position to trigger its animations. Meanwhile, Lenis is bypassing the native scroll to smoothly glide the web page up and down on its own custom timeline. Because GSAP is reading the native scroll and Lenis is managing a custom smooth scroll, the two end up completely out of sync. GSAP ends up being a frame or two behind Lenis, which leads to jumpy, shaky, and snappy bugs in your animations.

To fix this, we have to link them. We need to tell Lenis to emit its scroll position updates directly into GSAP's internal ticker. That way, they run on the exact same frame loop, and your animations stay perfectly locked to the fluid scroll.

```tsx
// App.tsx

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

      return () => {
        lenis.off("scroll", ScrollTrigger.update);
      };
    },
    { scope: containerRef }
  );

  return (
    <main>
      <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
        <div ref={containerRef} className="min-h-screen w-full font-panchang">
          {/* normal cooking here */}
        </div>
      </ReactLenis>
    </main>
  );
}

export default App;
```

## Animating Elements with GSAP in React

To handle animations in React, we will use the official `@gsap/react` plugin. If you have ever tried animating things in React before, you know how messy it gets with `useEffect`, strict mode double-renders, and cleanup functions. This plugin handles all that unmount, remount, and memory leak stress behind the scenes so we can just focus on animating.

First, I'll introduce a few things.

**useGSAP() Hook:** This is a specialized wrapper around React's `useEffect`. It handles cleanup automatically. When your component unmounts, GSAP kills the animations and triggers behind the scenes, preventing memory leaks.

**Scoping:** The GSAP hook has a second argument object, and one of the fields in it is a `scope`. It means GSAP will only look for elements inside this specific container passed as the `scope`. The animations will only last for the `scope` of this container and will clean up when this element unmounts.

We can use a `ref` for passing things to GSAP instead of ID or className attributes, but we can still use ID or className where we need to. This is just an added convenience when working with React.

### How Do We Create Animations?

Usually when working with GSAP, especially for scroll-based animations, it is best to create a `timeline`. A `timeline` is a powerful sequencing tool that acts as a container for tweens and other timelines, making it simple to control them as a whole and precisely manage their timing. Without timelines, building complex sequences would be far more cumbersome because you would need to use a delay for every animation.

A tween, used in that definition, is a GSAP keyword coined from "in-between". It represents the animating element or the process of animating an element. A tween is what does all the animation work; think of it like a high-performance property setter.

When we create a `timeline`, we can then control the entire sequence in the `timeline` together with some provided methods:

```javascript
tl.pause();
tl.resume();
tl.seek(1.5);
tl.reverse();
```

Inside a `timeline`, we can create tweens with the provided methods:

```javascript
tl.to();
tl.from();
tl.fromTo();
```

### Positioning Animations in a Timeline

We do this with the help of the timeline `position parameter`. This one super-flexible parameter controls the placement of your tweens, labels, callbacks, pauses, and even nested timelines. In other words, it tells the `timeline` exactly where to insert the animation. It typically comes after the `vars` parameter, and it has multiple behaviors.

Well, a mortal man like me cannot exhaustively explain all these to you in this article. So if you are not already familiar with them, the GSAP docs does a fantastic job at explaining them and even have a video explanation for those who prefer that. You can find that resource here: [GSAP Position Parameter Guide](https://gsap.com/resources/position-parameter/).

For a quick summary of these position parameters:

| Position          | Description                                                                        |
| ----------------- | ---------------------------------------------------------------------------------- |
| `3`               | Start exactly 3 seconds from the beginning of the timeline.                        |
| `"label"`         | Start at the specified timeline label (creates it if missing).                     |
| `"<"`             | Start at the same time the previous animation starts.                              |
| `">"`             | Start when the previous animation ends.                                            |
| `"+=1"`           | Start 1 second after the end of the timeline (adds a gap).                         |
| `"-=1"`           | Start 1 second before the end of the timeline (creates overlap).                   |
| `"label+=2"`      | Start 2 seconds after the specified label.                                         |
| `"<+=3"` / `"<3"` | Start 3 seconds after the previous animation starts.                               |
| `">-0.5"`         | Start 0.5 seconds before the previous animation ends.                              |
| `"-=25%"`         | Overlap the timeline end by 25% of the current animation's duration.               |
| `"+=50%"`         | Start 50% of the current animation's duration after the timeline ends.             |
| `"<25%"`          | Start 25% into the previous animation (based on its duration).                     |
| `"<+=25%"`        | Start 25% of the current animation's duration after the previous animation starts. |
| `"label+=30%"`    | Start 30% of the current animation's duration after the label.                     |

This is where a `positional parameter` lives in a timeline tween:

```javascript
tl.to(".class", { x: 100 }, "<1");
```

The `"<1"` is the `positional parameter`.

### Special Properties and Callbacks

You can also pass some special properties and callbacks to the timeline. You can add any of the provided `vars` objects to further customize your animation:

```javascript
gsap.timeline({
  onComplete: myFunction,
  repeat: 2,
  repeatDelay: 1,
  yoyo: true,
});
```

The `vars` parameter is a configuration object passed into the timeline which contains all the properties/values you want to animate, along with any of the optional special properties.

Here is a link to all the `vars` provided by GSAP for more reference: [GSAP Timeline Special Properties and Callbacks](https://gsap.com/docs/v3/GSAP/Timeline/#special-properties-and-callbacks).

For more extended readings on GSAP timelines, you can also check out the official docs here: [GSAP Timeline Documentation](https://gsap.com/docs/v3/GSAP/Timeline/).

## Creating a Staggered Scroll Animation

Now that we understand most parts of creating an animation, let us create a basic timeline animation. Let's look at the code first, and then we'll break it down so we'll know exactly what is going on.

```tsx
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
          end: "+=4000px",
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
          index === 0 ? undefined : "-=0.4"
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

The example above creates a stack of cards that animate into place as you scroll. Let's walk through the important parts so we can see how the timeline controls the entire sequence.

### 1. Creating the Timeline

First, we create a timeline.

```javascript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: container.current,
    start: "top top",
    end: "+=4000px",
    pin: true,
    scrub: true,
  },
});
```

Instead of creating several independent animations, we create a single timeline. Think of it as a container that stores the animations in the order they should play.

Because we have attached a ScrollTrigger, the timeline's progress is now controlled by scrolling instead of time. As the user scrolls, the timeline advances, and every animation inside it plays accordingly.

### 2. Looping Through the Cards

Next, we grab every card and loop through them.

```javascript
cards.forEach((card, index) => {
  // ...
});
```

We are making the same animation for each card, just using the index to alter how it performs for each specific card. That is what we are doing with:

```javascript
const targetY = index * 50;
const targetX = index * 150;
```

### 3. Defining Where Each Card Animation Starts and Ends

For every card, we use `fromTo()`.

```javascript
tl.fromTo(card, from, to);
```

The `card` is the card element, the `from` is where we will provide the initial state, and then the `to` is where we will provide the final output where we want the animation to animate to.

So we have this:

```javascript
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
  index === 0 ? undefined : "-=0.4"
);
```

From what we have above, the `form` object fields (`y`, `x`, `rotation`, `opacity`), we initially set every card to start below the viewport, slightly off to the right, rotated left or right depending on the index, and mostly transparent.

The `to` object fields describes where we want to animate the card to.

The final argument is the timeline `position parameter`:

```javascript
index === 0 ? undefined : "-=0.4";
```

The first card is added normally, so it starts at the beginning of the timeline (that's why it's `undefined`, we can also use `0` for this). Every other card is inserted `0.4 seconds` before the previous animation finishes.

You can now see the usefulness of a `timeline`. Notice that we never manually delay any animations. We simply add each animation to the `timeline`, and GSAP handles all the sequencing for us. If we want animations to overlap, start together, or begin after a label, we only need to change the `position parameter`.

## Scroll-Based Animations with 3D Elements

Whether you are animating HTML elements, 3D elements, or donkeys, GSAP does not care. The concepts are exactly the same, we just animate the Three.js properties instead of the CSS properties.

So instead of animating CSS properties such as `x`, `y`, `opacity`, or `scale`, we will animate properties on a Three.js object like its `position`, `rotation`, and `scale`.

For this next part, I am assuming you have already worked with 3D models in React and know your way around basic Three.js or React Three Fiber (R3F). Explaining how to set up a 3D scene from scratch is way beyond the scope of this already lengthy article, so if you are new to 3D on the web, feel free to skip this section.

But for my learned Three.js fellows, let's get straight to the code we will be working with:

```tsx
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
      className="relative h-[400vh] bg-linear-to-b from-light to-dark text-dark w-full"
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

First, we create a normal 3D scene with React Three Fiber. Next, we load the GLTF model. We then render it inside a group.

```tsx
<group ref={modelRef}>
  <Center>
    <primitive object={scene} />
  </Center>
</group>
```

Notice that our `ref` is attached to the group, not the model itself. This gives GSAP a single object to animate regardless of how many meshes the model contains.

### Creating the Timeline

Just like our previous example, we create a `timeline` with a `ScrollTrigger`.

```javascript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: scrollSectionRef.current,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
  },
});
```

Remember, scrolling will control the timeline's progress, not time.

### Animating the Model's Position

Our first animation moves the model across the viewport.

```javascript
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

I am sure you noticed. Previously when we animated our React HTML element, we simply did something like:

```javascript
gsap.to(".card", { x: 200 });
```

Now we are animating a Three.js Vector3. So we have to reference the position object, like `modelRef.current.position`. Since position is simply an object with `x`, `y`, and `z` values, GSAP can interpolate those numbers just like it would CSS transforms.

As the timeline progresses, the model moves from the left side of the screen, travels to the right, and moves slightly backwards along the `z-axis` to zoom out the model.

### Animating the Rotation

Next, we animate the model's rotation.

```javascript
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

Here we are animating the model's Y rotation. Three.js stores rotations in radians, not degrees.

Some common values are:

- `Math.PI / 2` = 90°
- `Math.PI` = 180°
- `Math.PI * 2` = 360°

So `Math.PI * 2` causes the model to complete one full spin.

Notice we use `0` as the `position parameter` for both tween animations. This is because we want both animations to start together at the beginning of the animation timeline.

And just like that, we have successfully animated a 3D model using scroll.

Any other lines of code you see in there are just specific to R3F and standard 3D rendering stuff, like triggering the 3D model embedded animations, but the scroll logic remains exactly the same.

## Putting It All Together

To show you what is possible when you stack these concepts together, I built a basic Awwwards-style website with scroll-based animations. I took some inspiration from the official Lenis website design (those guys are crazy talented by the way), so I tried to replicate some of those fluid experiences using everything we just explored.

### Demo

Here is a demo of how all these concepts come together in the final build:

<video src="https://res.cloudinary.com/db6nohcui/video/upload/v1783856106/compressed-scroll-based-animations_kwhl9f.mp4" controls playsinline width="100%"></video>

## Conclusion

Scroll-based animations can completely transform how users experience your website, changing it from a static document into an interactive journey. By connecting GSAP and Lenis, and understanding how to map scroll progress to a timeline, you have all the tools you need to animate everything from text to 3D models.

(If you want to see the full codebase, check the [repository](https://github.com/umohsamuel/scroll-based-animations). Play around with it and lmk what you think)
