# Gotchas & fixes

Real bugs hit while building animated sites, each as **symptom → cause → fix**. Skim this
before finishing any animated page.

---

### A. `position: sticky` does nothing
- **Symptom:** a `sticky top-…` element scrolls away instead of sticking.
- **Cause:** an ancestor has `overflow: hidden` (often added to hide horizontal bleed).
  Any `overflow` value other than `visible`/`clip` on an ancestor breaks sticky.
- **Fix:** use `overflow-x-clip` instead of `overflow-hidden` on that ancestor. `clip` hides
  bleed without creating a scroll container, so sticky keeps working.

### B. Pinned section's heading scrolls out of view
- **Symptom:** during a pinned horizontal scroll, the section title disappears under the header.
- **Cause:** only the card row was pinned; the heading (above it) scrolled away.
- **Fix:** pin the **whole section** (heading + content wrapper), `start: "top 120px"` to clear
  a sticky header. Translate only the inner track. (See patterns.md §3.)

### C. Need different element order on mobile vs desktop (across a grid boundary)
- **Symptom:** e.g. headline + subhead must be one tight column on desktop, but on mobile the
  image/button must sit *between* them.
- **Cause:** the items live in different columns on desktop but must interleave on mobile.
- **Fix:** wrap the text group in `className="contents lg:block"`. On mobile `display:contents`
  flattens it so its children become flex items that can be reordered with `order-*` alongside
  siblings; on desktop `lg:block` restores it as one grid cell. No DOM duplication.

### D. Scroll animations are "jumpy" / fire at the wrong place
- **Symptom:** triggers fire too early/late; pinned sections jump; positions drift after load.
- **Cause:** async images change section heights after first paint, so ScrollTrigger's cached
  start/end positions go stale.
- **Fix:** call `refreshAfterAssets(root.current)` inside `useGSAP` (re-runs `ScrollTrigger.refresh()`
  after RAF, each image load, and window load). Also set `invalidateOnRefresh: true` on scrubbed pins.

### E. Marquee stutters / jitters
- **Symptom:** the marquee judders, flickers, or hitches at the loop seam.
- **Cause:** not GPU-composited, and/or content too wide for the chosen speed.
- **Fix:** animate `translate3d(...)` (not `translateX`), add `transform-gpu`,
  `will-change-transform`, `[backface-visibility:hidden]` to the track. Two identical
  duplicated tracks give a seamless loop. Raise `speed` (seconds/loop) when content is wider.

### F. Horizontal scroll breaks / overshoots on ultrawide
- **Symptom:** on wide monitors the track moves the wrong way or scroll "runs out".
- **Cause:** the pin distance went ≤ 0 (track narrower than viewport) or `end` == pixel width
  (1 scroll unit = 1px → too fast).
- **Fix:** clamp distance: `dist = Math.max(0, scrollWidth - wrapWidth)` and
  `end: () => "+=" + Math.max(1, dist() * 1.35)`. The 1.35× also smooths per-pixel motion.

### G. Hero image crops the subject's face/screen off
- **Symptom:** an image constrained to an aspect ratio cuts off the important part.
- **Cause:** `object-cover` defaults to centre crop.
- **Fix:** set `object-position`, e.g. `object-cover object-[50%_38%]` to bias the crop upward
  and keep faces/screens in frame. Match the frame aspect to the source where possible.

### H. Animation still plays for reduced-motion users
- **Symptom:** motion persists when the OS "reduce motion" setting is on.
- **Cause:** the animation wasn't gated.
- **Fix:** double-guard. GSAP: wrap in `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`.
  CSS animations: add `motion-reduce:animate-none` / `motion-reduce:transition-none` (and a
  `@media (prefers-reduced-motion: reduce)` rule for raw keyframes). Content must be fully
  visible by default — set hidden states only inside the GSAP match.

### I. Lint error: "Cannot access refs during render" (`react-hooks/refs`)
- **Symptom:** collecting elements into a ref array via callback refs trips the lint rule.
- **Cause:** mutating `ref.current` during render to gather targets.
- **Fix:** give the elements a class and select them inside `useGSAP` with a scoped string
  (`gsap.from(".hero-word", …)`). `{ scope: root }` scopes the selector to the component.

### J. Pin "jumps" when it engages
- **Symptom:** a visible jolt as a pinned section starts.
- **Cause:** layout shift at pin start.
- **Fix:** `anticipatePin: 1` (set globally via `ScrollTrigger.defaults` in `gsap.ts`, and/or per
  trigger). Combined with `invalidateOnRefresh: true` for image-driven height changes.

### K. (see D + J) — pinned + image-heavy sections
- Always pair `invalidateOnRefresh: true` (recalc on refresh) with `refreshAfterAssets` so pin
  spacing is correct once images load.

### L. White headline invisible on a dark section
- **Symptom:** a heading on a dark/navy background shows nothing (or brand-coloured fragment only).
- **Cause:** global CSS sets a heading `color` (e.g. `h1{color:navy}`); inherited white from a
  parent doesn't override a directly-set heading colour.
- **Fix:** put an explicit `text-white` (or brand colour) on headings in dark sections.

### M. Scrub feels wrong (twitchy or laggy)
- **Cause/fix (tuning):** `scrub: true` = exact 1:1 (best for parallax); `scrub: 0.6` = snappy;
  `scrub: 1.2` = smooth glide (best for pinned/horizontal). Pick per effect; don't reuse one value everywhere.

### N. CSS grid `row-span` stretches content apart
- **Symptom:** big empty gap between a heading and the text below it on desktop.
- **Cause:** a tall item spanning multiple auto rows (e.g. `lg:row-span-2` image) forces those
  rows to grow and distributes the extra space, pushing stacked left-column content apart.
- **Fix:** don't span the tall item across content rows. Keep the text column as one cell
  (group it, e.g. with the `display:contents` trick from C) and let the image occupy the other
  column in a single row with `items-center`.

---

## Pre-ship checklist
- [ ] Every GSAP animation is inside a `matchMedia("(prefers-reduced-motion: no-preference)")` block.
- [ ] `refreshAfterAssets(root.current)` called in each image-heavy animated section.
- [ ] `overflow-x-clip` (not `overflow-hidden`) above any sticky element.
- [ ] Pinned sections pin the heading too; distances clamped; `invalidateOnRefresh` set.
- [ ] Dark-section headings have explicit text colour.
- [ ] Scrubbed/parallax/marquee layers have `will-change-transform`/`transform-gpu`.
- [ ] Prod build passes; reduced-motion shows all content statically; ~390px mobile has no overflow.
