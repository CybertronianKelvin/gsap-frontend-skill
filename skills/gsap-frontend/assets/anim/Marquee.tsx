import type { ReactNode } from "react";

type MarqueeProps = {
  children: ReactNode;
  /** Seconds for one full loop. Larger = slower. */
  speed?: number;
  reverse?: boolean;
  className?: string;
};

/**
 * Infinite horizontal marquee. Pure CSS transform animation (no JS, no layout
 * thrash) and pauses for reduced-motion users via the `motion-reduce` utility.
 * The track is duplicated so the loop is seamless. Requires the `@keyframes
 * marquee` rule from globals-snippet.css.
 *
 * NOTE on speed: the loop moves the track by 100% of ITS OWN width in `speed`
 * seconds. If you make the content wider (more items), raise `speed` to keep
 * the same visual pace — otherwise it speeds up and can look jittery.
 */
export default function Marquee({
  children,
  speed = 28,
  reverse = false,
  className = "",
}: MarqueeProps) {
  return (
    <div className={`group relative flex overflow-hidden ${className}`}>
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden={i === 1}
          className="flex shrink-0 items-center transform-gpu will-change-transform [backface-visibility:hidden] motion-reduce:animate-none"
          style={{
            animation: `marquee ${speed}s linear infinite`,
            animationDirection: reverse ? "reverse" : "normal",
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
