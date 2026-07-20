"use client";

import { useRef, useMemo } from "react";
import { useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";

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

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const baseT = i / count;
      const t = (baseT + time * 0.003) % 1;

      const springRadius = 3.5;
      const coils = 2;
      const angle = t * Math.PI * 2 * coils;

      const x = Math.sin(angle) * springRadius + 4;
      const y = (0.5 - t) * 22;
      const z = Math.cos(angle) * springRadius;

      dummy.position.set(x, y, z);

      const t2 = t + 0.001;
      const angle2 = t2 * Math.PI * 2 * coils;
      const x2 = Math.sin(angle2) * springRadius + 4;
      const y2 = (0.5 - t2) * 22;
      const z2 = Math.cos(angle2) * springRadius;
      
      target.set(x2, y2, z2);
      dummy.lookAt(target);

      dummy.rotateX(Math.PI / 2);

      const twist = t * Math.PI * 4 - time * 0.005;
      dummy.rotateY(twist);

      const scaleVal = Math.sin(t * Math.PI);
      dummy.scale.set(scaleVal, scaleVal, scaleVal);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, count]} castShadow receiveShadow>
      <roundedBoxGeometry args={[4, 0.3, 4, 2, 0.02]} />
      <meshPhysicalMaterial
        color="#DEDBC8"
        roughness={0.25}
        metalness={0.2}
        clearcoat={0.8}
        clearcoatRoughness={0.2}
      />
    </instancedMesh>
  );
}
