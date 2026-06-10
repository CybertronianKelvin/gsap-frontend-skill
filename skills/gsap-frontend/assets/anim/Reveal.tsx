"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "./gsap";

type Variant = "up" | "fade" | "scale" | "blur" | "left" | "right";

const FROM: Record<Variant, gsap.TweenVars> = {
  up: { y: 48, opacity: 0 },
  fade: { opacity: 0 },
  scale: { scale: 0.9, opacity: 0 },
  blur: { y: 24, opacity: 0, filter: "blur(12px)" },
  left: { x: -56, opacity: 0 },
  right: { x: 56, opacity: 0 },
};

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  variant?: Variant;
  /** Seconds before the tween starts once in view. */
  delay?: number;
  /** When set, animates direct children in sequence instead of the wrapper. */
  stagger?: number;
  /** Fraction of the viewport that must be crossed to fire (0–1, default 0.85). */
  start?: number;
  className?: string;
};

/**
 * Scroll-triggered reveal. Content is fully visible for reduced-motion users
 * and when JS is unavailable — the hidden start state is only applied through
 * GSAP inside a `(prefers-reduced-motion: no-preference)` match, before paint.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  variant = "up",
  delay = 0,
  stagger,
  start = 0.85,
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = ref.current!;
        const targets =
          stagger != null ? (Array.from(el.children) as HTMLElement[]) : el;
        const from = FROM[variant];

        gsap.set(targets, from);
        gsap.to(targets, {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.9,
          delay,
          ease: "power3.out",
          stagger: stagger ?? 0,
          scrollTrigger: {
            trigger: el,
            start: `top ${start * 100}%`,
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
