"use client";

import { Canvas } from "@react-three/fiber";
import { SoftShadows } from "@react-three/drei";
import Sculpture from "./Sculpture";

export default function ThreeCanvas() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full bg-white">
      <Canvas
        shadows
        camera={{ position: [0, 0, 20], fov: 45 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <color attach="background" args={["#ffffff"]} />
        
        {/* SoftShadows setup for realistic, ambient occlusion soft shadows */}
        <SoftShadows size={25} samples={10} focus={0.5} />

        {/* Premium Studio Lighting */}
        <ambientLight intensity={1.2} />
        
        {/* Key Directional Light */}
        <directionalLight
          position={[10, 20, 15]}
          intensity={3}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        {/* Fill Lights to eliminate harsh shadows */}
        <directionalLight position={[-10, -10, -10]} intensity={1.5} color="#f8fafc" />
        <directionalLight position={[0, 0, 15]} intensity={1.5} color="#ffffff" />

        {/* The Mathematical Ribbon Sculpture */}
        <Sculpture />
      </Canvas>
    </div>
  );
}
