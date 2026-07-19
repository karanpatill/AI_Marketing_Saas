"use client";

import { ReactLenis } from "@studio-freight/react-lenis";

export default function SmoothScroll({ children }: { children: any }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5 } as any}>
      {children}
    </ReactLenis>
  ) as any;
}
