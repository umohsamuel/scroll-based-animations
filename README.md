# Scroll Based Animations

A collection of high-performance, scroll-linked animations built with React, GSAP, Lenis, and React Three Fiber.

This repository serves as the companion codebase to the technical guide on implementing fluid scroll-based animations and handling synchronization between GSAP and Lenis.

## Features

- Smooth scrolling implementation using Lenis.
- Synchronization of GSAP's internal ticker with the Lenis scroll thread.
- Staggered card animations based on scroll progress.
- Horizontal scrolling sections nested inside vertical scroll containers.
- Sticky vertical sections that pin content while adjacent panels scroll.
- 3D model animations using React Three Fiber, tying object rotation and translation directly to scroll events.

## Tech Stack

- React
- TypeScript
- GSAP (with `@gsap/react` and ScrollTrigger)
- Lenis
- Three.js / React Three Fiber
- Tailwind CSS

## Getting Started

### Prerequisites

Ensure you have Bun installed on your machine.

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/umohsamuel/scroll-based-animations.git
cd scroll-based-animations
bun install
```

### Running the Project

Start the development server:

```bash
bun run dev
```

The application will be available at `http://localhost:5173`.

## Architecture Overview

The animation system relies on linking Lenis' custom scroll timeline directly to GSAP's refresh cycle. This prevents the native browser scroll from causing jittering and mismatched frames between the animations and the user's viewport. 

All animations are controlled via GSAP timelines anchored by ScrollTrigger, eliminating the need for hardcoded delays and providing absolute control over animation sequencing.

## License

MIT
