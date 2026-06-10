# Pattern recipes

Copy-paste GSAP/ScrollTrigger recipes. Every recipe assumes the component skeleton from
`setup.md` (a `useGSAP(() => {…}, { scope: root })` with `gsap.matchMedia()` and
`refreshAfterAssets(root.current)`). Place the shown code **inside** the appropriate
`mm.add(...)` block. All recipes are plain GSAP, so they port to any framework.

Scrub guide: `scrub: true` = 1:1 with scroll (parallax); `scrub: 0.6` = snappy; `scrub: 1.2`
= smooth glide (pinned/horizontal). Higher = smoother but laggier.

---

## 1. Headline clip reveal (word- or line-by-line)

Words/lines rise into view from behind a mask. The signature "premium" hero entrance.

**Markup** — wrap each word/line in an `overflow-hidden` mask; the inner span animates:
```tsx
<h1 className="font-display text-6xl font-extrabold">
  {["Invoicing", "&", "expenses,", "finally"].map((w) => (
    <span key={w} className="mr-3 inline-block overflow-hidden align-bottom">
      <span className="hero-word inline-block">{w}</span>
    </span>
  ))}
  <span className="inline-block overflow-hidden align-bottom">
    <span className="hero-word inline-block text-lime-dark">effortless.</span>
  </span>
</h1>
```

**Motion** (inside `(prefers-reduced-motion: no-preference)`):
```ts
gsap.timeline({ defaults: { ease: "power4.out" } })
  .from(".hero-word", { yPercent: 120, opacity: 0, duration: 1, stagger: 0.08 })
  // optionally fade the subhead/CTA in after:
  .from(".hero-fade", { y: 24, opacity: 0, duration: 0.8, stagger: 0.12 }, "-=0.5");
```
- Use scoped class selectors (`.hero-word`), never a ref array mutated in render.
- For line-by-line, wrap whole lines instead of words and use `yPercent: 115, stagger: 0.1`.
- Reduced-motion: no tween runs → words sit at natural position, fully visible.

---

## 2. Reveal-on-scroll (the `Reveal` primitive)

Use the bundled `Reveal` component for fade/slide/scale/blur entrances; no per-section GSAP.

```tsx
import Reveal from "@/components/anim/Reveal";

<Reveal variant="up">          {/* up | fade | scale | blur | left | right */}
  <h2>Section title</h2>
</Reveal>

<Reveal stagger={0.1} className="grid gap-6 md:grid-cols-3">
  {cards.map((c) => <Card key={c.id} {...c} />)}   {/* direct children stagger in */}
</Reveal>
```
`stagger` animates direct children in sequence. `start` (0–1) sets the trigger point.

---

## 3. Pinned horizontal-scroll gallery

Vertical scroll drives a horizontal slide of a card row. Pin the **whole section** (heading
+ row) so the heading stays visible.

**Markup:**
```tsx
<section className="bg-white">
  <div ref={pin} className="py-16">
    <Container><Reveal variant="up"><h2>Loved by thousands</h2></Reveal></Container>
    <div ref={wrap} className="mt-10 overflow-x-auto px-6 sm:overflow-x-hidden">
      <div ref={track} className="flex gap-6 will-change-transform">
        {cards.map((c) => (
          <article key={c.id} className="w-[80vw] shrink-0 sm:w-[26rem]">…</article>
        ))}
      </div>
    </div>
  </div>
</section>
```

**Motion** (desktop + motion only):
```ts
mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
  const tt = track.current!;
  const dist = () => Math.max(0, tt.scrollWidth - wrap.current!.offsetWidth);
  gsap.to(tt, {
    x: () => -dist(),
    ease: "none",
    scrollTrigger: {
      trigger: pin.current,
      start: "top 120px",                       // clears a sticky header
      end: () => "+=" + Math.max(1, dist() * 1.35), // 1.35× runway = smoother + ultrawide-safe
      pin: true,
      scrub: 1.2,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });
});
```
- `Math.max(0, …)` + `Math.max(1, …)` clamp so it never breaks when content ≤ viewport (ultrawide).
- Mobile fallback: `overflow-x-auto` makes the row swipeable (no pin).

---

## 4. Sticky product story (scroll-synced steps + swapping frame)

A sticky product frame on one side; text "steps" scroll past on the other. As each step
hits center, the frame swaps. Great for feature walkthroughs / device screen tours.

**Markup:** a 2-col grid; left column `sticky top-28` holds stacked frames (only the active
one visible); right column is the tall list of `.story-step` blocks.
```tsx
<div className="grid lg:grid-cols-2">
  <div className="hidden lg:block">
    <div className="sticky top-28">
      {SCREENS.map((src, i) => (
        <img key={src} src={src} alt=""
          className={`absolute inset-0 object-cover transition-all duration-500 motion-reduce:transition-none
            ${i === active ? "translate-y-0 opacity-100"
              : i < active ? "-translate-y-[10%] opacity-0" : "translate-y-[10%] opacity-0"}`} />
      ))}
    </div>
  </div>
  <div ref={steps}>
    {STEPS.map((s) => <div key={s.id} className="story-step min-h-[80vh]">…</div>)}
  </div>
</div>
```

**Logic** (runs regardless of motion — it's a content swap, not motion):
```ts
gsap.utils.toArray<HTMLElement>(".story-step").forEach((el, i) => {
  ScrollTrigger.create({
    trigger: el,
    start: "top center",
    end: "bottom center",
    onToggle: (self) => self.isActive && setActive(i), // React state drives the CSS swap
  });
});
```
- The frame swap uses CSS transitions (cheap), gated by `motion-reduce:transition-none`.
- For a phone mockup, wrap the frames in a device bezel (`rounded-[2.75rem] border-[10px]`)
  and give screens `aspect-[9/19.5]`.

---

## 5. Parallax — single layer and multi-layer floaters

**Single layer** (e.g. hero image drifts as you scroll):
```ts
gsap.to(art.current, {
  yPercent: -14, ease: "none",
  scrollTrigger: { trigger: art.current, start: "top top", end: "bottom top", scrub: true },
});
```

**Multi-layer floaters** — absolutely-positioned images each with a `data-speed`:
```tsx
{FLOATERS.map((f) => (
  <div key={f.src} data-speed={f.speed}
       className="floater absolute will-change-transform" style={{…position…}}>
    <img src={f.src} alt="" />
  </div>
))}
```
```ts
gsap.utils.toArray<HTMLElement>(".floater").forEach((el) => {
  gsap.to(el, {
    yPercent: Number(el.dataset.speed),     // mix +/- values for depth, e.g. -40, 30, 55, -25
    ease: "none",
    scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
  });
});
```
Always add `will-change-transform` to parallax layers.

---

## 6. Colour-flip pinned statements

Pin a section; as you scroll, the background colour and centered statement swap. Bold,
Cash-App-style storytelling.

```ts
mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
  const panels = gsap.utils.toArray<HTMLElement>(".flip-panel"); // absolute, stacked
  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top top",
      end: "+=" + panels.length * 100 + "%", pin: true, scrub: 0.6 },
  });
  panels.forEach((p, i) => {
    const s = STATEMENTS[i]; // { bg, fg }
    tl.set(section, { backgroundColor: s.bg, color: s.fg });
    tl.fromTo(p, { opacity: 0, scale: 0.85, yPercent: 12 },
                 { opacity: 1, scale: 1, yPercent: 0, duration: 0.4 });
    if (i < panels.length - 1)
      tl.to(p, { opacity: 0, scale: 1.1, yPercent: -12, duration: 0.4 }, "+=0.5");
  });
});
```
Default the first panel visible in CSS (others `opacity-0`) so reduced-motion shows one statement.

---

## 7. Count-up stats (the `Counter` primitive)

```tsx
import Counter from "@/components/anim/Counter";
<div className="font-display text-6xl font-extrabold text-lime">
  <Counter value={4200} prefix="£" />
</div>
<Counter value={350} suffix=" hrs" />
<Counter value={50} suffix="+" />
```
Counts from 0 on scroll-in; reduced-motion shows the final number immediately.

---

## 8. CSS GPU marquee (the `Marquee` primitive)

Infinite logo/text/review ticker — pure CSS, no JS.
```tsx
import Marquee from "@/components/anim/Marquee";
<Marquee speed={40}>            {/* seconds per loop; larger = slower */}
  {items.map((x) => <span key={x} className="mx-8 whitespace-nowrap">{x}</span>)}
</Marquee>
```
- Requires the `@keyframes marquee` rule (in `globals-snippet.css`).
- If you widen the content (more items / wider cards), **raise `speed`** proportionally —
  the loop moves 100% of the track's own width per cycle, so wider content runs faster.
- Already GPU-composited (`transform-gpu`, `will-change`, `translate3d`) and pauses for
  reduced motion (`motion-reduce:animate-none`).

---

## 9. Ambient gradient mesh + glassmorphism cards

**Mesh** — drifting blurred blobs behind a dark hero (needs `@keyframes blob-drift`):
```tsx
<div className="absolute inset-0 -z-10 overflow-hidden">
  <div className="blob absolute -left-20 top-0 h-[32rem] w-[32rem] rounded-full bg-lime/20 blur-[130px]"
       style={{ animation: "blob-drift 18s ease-in-out infinite" }} />
  <div className="blob absolute right-0 top-40 h-[34rem] w-[34rem] rounded-full bg-navy-light/50 blur-[130px]"
       style={{ animation: "blob-drift 22s ease-in-out infinite reverse" }} />
</div>
```
The `.blob` class is auto-paused under reduced motion by the CSS guard.

**Glass cards:**
```tsx
<div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-7 backdrop-blur
                transition hover:border-lime/40 hover:bg-white/[0.07]">…</div>
```

---

## 10. Two-tone / gradient headings

Split a heading so leading words are a brand gradient, the rest plain:
```tsx
<h2 className="font-display font-extrabold uppercase text-white">
  <span className="bg-gradient-to-r from-lime to-lime-dark bg-clip-text text-transparent">
    Level up
  </span>{" "}
  your finances
</h2>
```
On dark sections remember the explicit `text-white` (see gotchas, item L).

---

## Composition notes

- Keep page content in one data module (arrays of features/testimonials/stats) so sections
  stay declarative — see the live example's `src/lib/home-content.ts`.
- One `useGSAP` per major section, each scoped to its own root.
- Alternate section backgrounds (light → dark → light) for rhythm; mind the heading-colour
  gotcha on dark bands.
- For responsive reordering (e.g. image between headline and subhead on mobile only), see
  the `display:contents` + `order` technique in `gotchas.md` (item C).
