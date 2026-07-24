"use client";

import { ReactLenis } from "@studio-freight/react-lenis";

export default function SmoothScroll({ children }: { children: any }) {
  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 0.8, smoothWheel: true } as any}>
      {children}
    </ReactLenis>
  );
}
