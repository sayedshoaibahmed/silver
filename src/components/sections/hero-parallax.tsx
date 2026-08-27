"use client";

import { type ReactNode } from "react";

/**
 * Parallax effect has been removed to reduce animation and improve performance,
 * as per the new coastal boutique design system guidelines.
 */
export function HeroParallax({ children }: { children: ReactNode }) {
  return (
    <div className="hero-parallax">
      {children}
    </div>
  );
}
