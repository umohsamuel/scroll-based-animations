import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
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
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          className="z-30 relative"
        >
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
          x: -1.4,
          z: 0,
        },
        {
          x: 2.5,
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
    <group ref={modelRef} position={[0, 0, 0]}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}
