# Setup

## Versions (known-good)

```
gsap            ^3.13   (3.15 used in the worked example)
@gsap/react     ^2.1
next            16.x    (App Router)
react           19.x
tailwindcss     ^4      (@tailwindcss/postcss)
```

GSAP is fully free as of 2024 — all plugins (ScrollTrigger, etc.) ship in the core `gsap`
package. `@gsap/react` provides the `useGSAP` hook (proper React 18/19 integration with
automatic cleanup).

```bash
npm i gsap @gsap/react
```

## The central registrar (`anim/gsap.ts`)

Import GSAP **only** through this module so plugins are registered before use and config
is applied once. Source in `assets/anim/gsap.ts`. Key parts:

```ts
"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  ScrollTrigger.config({ ignoreMobileResize: true }); // fewer mobile URL-bar recalcs
  ScrollTrigger.defaults({ anticipatePin: 1 });        // smoother pin engagement
}
export { gsap, ScrollTrigger, useGSAP };
```

### `refreshAfterAssets(scope)` — the anti-jank helper

Async images (e.g. `next/image` with `fill`) change section heights *after* first paint,
leaving ScrollTrigger start/end positions stale → "jumpy" scroll. This helper re-measures
after layout settles, on every image load, and on window `load`:

```ts
export function refreshAfterAssets(scope: HTMLElement | null): () => void {
  if (!scope) return () => {};
  const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
  const onLoad = () => ScrollTrigger.refresh();
  window.addEventListener("load", onLoad);
  const pending = Array.from(scope.querySelectorAll("img")).filter((i) => !i.complete);
  let left = pending.length;
  const done = () => { if (--left <= 0) ScrollTrigger.refresh(); };
  pending.forEach((img) => {
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });
  return () => { cancelAnimationFrame(raf); window.removeEventListener("load", onLoad); };
}
```

## The component skeleton (every animated section)

```tsx
"use client";
import { useRef } from "react";
import { gsap, useGSAP, refreshAfterAssets } from "@/components/anim/gsap";

export default function Section() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // All motion lives inside a no-preference match → reduced-motion users get none.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // ...gsap.from / gsap.to / timelines / ScrollTriggers here...
      });

      // Optional: desktop-only heavy effects (pins, horizontal scroll)
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        // ...pinned / scrubbed effects...
      });

      const cleanupRefresh = refreshAfterAssets(root.current);
      return () => {
        cleanupRefresh();
        mm.revert(); // tears down all matchMedia tweens + ScrollTriggers
      };
    },
    { scope: root }, // scopes selector strings like ".hero-word" to this subtree
  );

  return <div ref={root}>{/* ... */}</div>;
}
```

Rules this skeleton encodes:
- One `useGSAP` per section, scoped to `root`.
- `gsap.matchMedia()` gates motion by media query; `mm.revert()` cleans up.
- `{ scope: root }` lets you target elements with class strings (`gsap.from(".x", …)`)
  instead of refs — and keeps it scoped to this component.

## Next.js App Router: server page wraps client component

Animated components are Client Components (`"use client"`). Keep the route a Server
Component so it can export `metadata`:

```tsx
// app/page.tsx (server)
import Hero from "@/components/home/Hero";
export const metadata = { title: "…", description: "…" };
export default function Page() { return <Hero />; }
```

## Tailwind v4 tokens

Define brand tokens once in `@theme` (see `assets/anim/globals-snippet.css`); components
reference `bg-navy`, `text-lime`, etc. To re-skin for a new brand, change only the token
hexes/fonts. Paste the snippet's `@keyframes` (marquee, blob-drift) and the reduced-motion
`.blob` guard too — the bundled components depend on them.

## Adapting to other stacks

- **Vite / plain React:** identical — keep `anim/gsap.ts`, `useGSAP`, and the skeleton.
  Replace `next/image` with `<img>` (or your image lib); `refreshAfterAssets` still works.
- **Vanilla JS / other frameworks:** drop `@gsap/react`/`useGSAP`; register plugins once,
  create ScrollTriggers on `DOMContentLoaded`, call `ScrollTrigger.refresh()` after images
  load, and gate with `window.matchMedia("(prefers-reduced-motion: reduce)")`. All pattern
  configs in `patterns.md` are plain GSAP and port directly.
