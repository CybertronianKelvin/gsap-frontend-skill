// Central GSAP setup. Registers plugins once on the client and re-exports the
// pieces the animation components need. Importing from here (rather than "gsap"
// directly) guarantees ScrollTrigger + useGSAP are registered before use.
"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Smoother pinning and fewer mobile-URL-bar resize recalcs.
  ScrollTrigger.config({ ignoreMobileResize: true });
  ScrollTrigger.defaults({ anticipatePin: 1 });
}

/**
 * Re-measures ScrollTrigger positions once the scope's images have loaded.
 * Async images (e.g. next/image with `fill`) change section heights after first
 * paint, which otherwise leaves trigger start/end points stale — the usual
 * cause of "jumpy" scroll animations. Call inside useGSAP and return its
 * cleanup. Safe to call repeatedly.
 */
export function refreshAfterAssets(scope: HTMLElement | null): () => void {
  if (!scope) return () => {};
  // Refresh after layout settles, and again on full window load.
  const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
  const onLoad = () => ScrollTrigger.refresh();
  window.addEventListener("load", onLoad);

  const imgs = Array.from(scope.querySelectorAll("img"));
  const pending = imgs.filter((img) => !img.complete);
  let left = pending.length;
  const done = () => {
    if (--left <= 0) ScrollTrigger.refresh();
  };
  pending.forEach((img) => {
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("load", onLoad);
  };
}

export { gsap, ScrollTrigger, useGSAP };
