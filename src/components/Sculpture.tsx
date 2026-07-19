"use client";

import { useRef, useMemo } from "react";
import { useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";

// Extend fiber with RoundedBoxGeometry
extend({ RoundedBoxGeometry });

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        roundedBoxGeometry: any;
      }
    }
  }
}

export default function Sculpture() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 150;

  // Pre-allocated dummy object for matrix operations
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-allocated vector for target look-at points
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const baseT = i / count;
      // Animated position progression along the curve
      const t = (baseT + time * 0.003) % 1;

      // Mathematical spring path coordinates
      const springRadius = 3.5;
      const coils = 2;
      const angle = t * Math.PI * 2 * coils;

      // Positions
      const x = Math.sin(angle) * springRadius + 4; // Shifted right to leave text space
      const y = (0.5 - t) * 22;
      const z = Math.cos(angle) * springRadius;

      dummy.position.set(x, y, z);

      // Orientation: Look ahead at the next point on the tangent curve
      const t2 = t + 0.001;
      const angle2 = t2 * Math.PI * 2 * coils;
      const x2 = Math.sin(angle2) * springRadius + 4;
      const y2 = (0.5 - t2) * 22;
      const z2 = Math.cos(angle2) * springRadius;
      
      target.set(x2, y2, z2);
      dummy.lookAt(target);

      // Rotations to stack overlapping flat panels
      dummy.rotateX(Math.PI / 2);

      // Continuous twist along the spring path
      const twist = t * Math.PI * 4 - time * 0.005;
      dummy.rotateY(twist);

      // Scale transition: Scale down near entry (t=0) and exit (t=1) for a seamless loop
      const scaleVal = Math.sin(t * Math.PI);
      dummy.scale.set(scaleVal, scaleVal, scaleVal);

      // Update transformation matrix
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, count]} castShadow receiveShadow>
      <roundedBoxGeometry args={[4, 0.3, 4, 2, 0.02]} />
      <meshPhysicalMaterial
        color="#ffffff"
        roughness={0.15}
        metalness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </instancedMesh>
  );
}
