"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { usePathname } from "next/navigation";

export default function SmoothScroll({ children }: { children: any }) {
  const pathname = usePathname();

  // Disable smooth scrolling on dashboard and onboarding where we use inner scroll containers
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/onboarding")) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 0.8, smoothWheel: true } as any}>
      {children}
    </ReactLenis>
  );
}
