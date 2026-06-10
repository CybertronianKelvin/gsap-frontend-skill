# Design languages — a styles catalog

A menu of visual directions to choose from. Each entry lists the vibe, palette approach,
typography, layout backbone, and the **motion vocabulary** (which recipes from
`patterns.md` to use). Reference screenshots live in `../assets/references/`. When the
direction is open, offer the user 2–4 of these.

Brand-token recipe (applies to all): define colours/fonts once in Tailwind `@theme`
(see `../assets/anim/globals-snippet.css`); components reference tokens (`bg-navy`,
`text-lime`, …). Re-skinning = change the token values only.

---

## Reference-site languages (with bundled screenshots)

### 1. Cash App — kinetic & bold
- **Screenshots:** `../assets/references/cashapp-hero.png`, `cashapp-scroll1.png`
- **Vibe:** playful, confident, high-energy; full-bleed colour blocks.
- **Palette:** one or two saturated brand colours used as full-section backgrounds, flipping
  between sections (e.g. brand-green ↔ near-black ↔ white).
- **Type:** oversized, heavy display headings; tight leading.
- **Layout:** stacked full-viewport colour sections; big statements; minimal chrome.
- **Motion:** colour-flip pinned statements (§6), word-by-word headline reveal (§1), marquee
  (§8), count-up (§7).
- **Worked example:** Lazybooks `/v1` (KineticHome).

### 2. getDuel / DUELR — bold dark
- **Screenshots:** `../assets/references/getduel-hero.png`, `getduel-scroll1.png`
- **Vibe:** premium, gym/tech energy, "compete and win".
- **Palette:** near-black or deep-navy base; one vivid accent (lime/chartreuse); dark bordered
  cards (`bg-white/[0.03]`, `border-white/10`).
- **Type:** huge UPPERCASE display, often two-tone (accent gradient + white); wide tracking on labels.
- **Layout:** glowing pill badge; centered hero; 4-up stat strip; icon-tile feature grid;
  numbered "how it works"; big final CTA.
- **Motion:** line-by-line headline reveal (§1), staggered `Reveal` cards (§2), parallax device
  float (§5), two-tone headings (§10), glowing accents.
- **Worked example:** Lazybooks `/v4` (DuelHome); the `/v2` sticky-product layout shares the backbone.

### 3. magic-receipt / pushapp — cinematic app
- **Screenshots:** `../assets/references/magic-receipt-hero.png`, `magic-receipt-scroll1.png`,
  `pushapp-hero.png`, `pushapp-scroll1.png`
- **Vibe:** sleek, modern, app/product showcase; dark and atmospheric.
- **Palette:** dark base with soft gradient-mesh glow (brand colour + a cool tone); glassmorphism surfaces.
- **Type:** clean sans display; gradient text accents.
- **Layout:** dark hero with floating device + ambient mesh; glass feature cards (sometimes bento);
  app-store CTAs.
- **Motion:** gradient-mesh blobs + glass cards (§9), multi-layer parallax floaters (§5), device
  entrance + parallax (§5), staggered reveals (§2), count-up (§7).
- **Worked example:** Lazybooks `/v3` (CinematicHome).

---

## Additional general styles (so it's not limited to four)

Each is buildable with the same recipes — pick a palette/type/layout and a motion subset.

### 4. Sticky product story
Story-driven feature walkthrough. A pinned product/device frame swaps as text steps scroll
past. **Motion:** sticky product story (§4), pinned horizontal gallery (§3), subtle parallax (§5).
**Example:** Lazybooks `/v2` (StickyHome) — `lazybooks-v2-hero.png`.

### 5. Minimal / Swiss / editorial
Restrained, content-led, trustworthy. Generous whitespace, strong grid, 1–2 typefaces, muted
palette + one accent. **Motion:** light `Reveal` (§2, `variant="up"`/`fade`), gentle parallax,
maybe one count-up. Keep it subtle.

### 6. Bento grid
Modular tile grid of varied sizes showcasing many features at once. **Motion:** staggered
`Reveal` of tiles (§2), hover lifts (`card-hover`), small count-up stats in tiles (§7).

### 7. Brutalist / neo-brutalist
High-contrast, raw, thick borders, hard shadows, oversized type, clashing accents. **Motion:**
snappy reveals, marquee tickers (§8), kinetic headline (§1) — keep easing punchy (`power4`/`expo`).

### 8. Glassmorphism
Frosted translucent panels over a colourful/gradient backdrop; soft depth. **Motion:** glass
cards (§9), reveal-on-scroll (§2), subtle parallax of the backdrop (§5).

### 9. Dark gradient-mesh
Dark canvas with large blurred gradient blobs drifting behind crisp content. **Motion:** mesh
blobs (§9), reveals (§2), parallax floaters (§5). (Core of the cinematic language above.)

### 10. Kinetic typography
Type *is* the hero. Oversized words that clip, slide, and react to scroll. **Motion:** headline
clip reveal (§1), colour-flip statements (§6), marquee (§8).

### 11. Full-bleed colour-flip
Each section is a full-viewport solid colour that snaps to the next as you scroll. **Motion:**
colour-flip pinned statements (§6), big count-up (§7).

### 12. Parallax-photo hero
Photography-led; layered images move at different depths. **Motion:** single + multi-layer
parallax (§5), reveal-on-scroll captions (§2). Mind `object-position` crops (gotcha G).

### 13. Claymorphism / soft-3D
Soft, rounded, pastel "clay" surfaces with puffy shadows; friendly. **Motion:** gentle scale/blur
reveals (§2, `variant="scale"`/`blur"`), soft hover lifts. Avoid harsh motion.

---

## Live worked examples
These archetypes were all built with this skill — browse them live to see the patterns and
design languages in action (screenshots are in `../assets/references/lazybooks-*.png`):
- https://lazybooks-nextjs.vercel.app/ and `/v1`, `/v2`, `/v3`, `/v4`, `/versions`.

## Resources
- GSAP docs: https://gsap.com/docs/v3/
- ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- useGSAP (React): https://gsap.com/resources/React/
- Easing visualizer: https://gsap.com/docs/v3/Eases/
- Reference sites: https://cash.app/ · https://www.getduel.co.uk/ · https://magic-receipt.ai/ · https://www.pushapp.co.uk/
