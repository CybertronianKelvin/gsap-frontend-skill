"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";

type CounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  /** BCP-47 locale for number grouping (default "en-GB"). */
  locale?: string;
  className?: string;
};

/**
 * Counts up to `value` when scrolled into view. Reduced-motion users see the
 * final number immediately (rendered as the initial text content).
 */
export default function Counter({
  value,
  prefix = "",
  suffix = "",
  locale = "en-GB",
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) =>
    `${prefix}${Math.round(n).toLocaleString(locale)}${suffix}`;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = ref.current!;
        const obj = { n: 0 };
        gsap.to(obj, {
          n: value,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = format(obj.n);
          },
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
