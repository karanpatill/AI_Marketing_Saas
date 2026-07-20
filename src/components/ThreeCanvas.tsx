"use client";

import { Canvas } from "@react-three/fiber";
import { SoftShadows } from "@react-three/drei";
import Sculpture from "./Sculpture";

export default function ThreeCanvas() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full bg-black">
      <Canvas
        shadows
        camera={{ position: [0, 0, 20], fov: 45 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <color attach="background" args={["#000000"]} />
        
        {/* SoftShadows setup for realistic soft shadows */}
        <SoftShadows size={25} samples={10} focus={0.5} />

        {/* Studio Lighting */}
        <ambientLight intensity={0.6} />
        
        {/* Key Directional Light */}
        <directionalLight
          position={[10, 20, 15]}
          intensity={2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        {/* Fill Lights */}
        <directionalLight position={[-10, -10, -10]} intensity={0.8} color="#DEDBC8" />
        <directionalLight position={[0, 0, 15]} intensity={0.8} color="#E1E0CC" />

        {/* The Mathematical Ribbon Sculpture */}
        <Sculpture />
      </Canvas>
    </div>
  );
}
