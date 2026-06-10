# Extending the skill — add sites you like

This skill is **self-extending**: point it at URLs of sites whose look you like, and it adds
them to the styles catalog (`design-languages.md`) with bundled screenshots, so future
builds can draw on them. It edits its own files in whatever location it's installed.

Trigger phrases: "add these sites to gsap-frontend", "I like <url>, add it to the catalog",
"learn this site's style", "extend the styles catalog with …".

## Workflow (per site)

1. **Search for context (optional but recommended).** WebSearch the brand/site to confirm the
   correct URL and gather descriptors ("<brand> design", "<brand> rebrand", awards) — helps
   name the aesthetic accurately.

2. **Fetch & analyse the page.** WebFetch the URL and extract the design language:
   - **Palette:** dominant background(s), primary accent(s), surface/border treatment. Pull hex
     values from inline styles / CSS where visible.
   - **Typography:** display vs body feel (geometric/grotesk/serif), weight, casing, tracking.
   - **Layout backbone:** hero shape, section rhythm, grid/bento, nav/CTA style.
   - **Motion cues:** does it use scroll-pinning, parallax, marquees, kinetic type, reveals,
     gradient mesh, sticky product frames? Map each to a recipe in `patterns.md`.

3. **Capture screenshots** with the bundled script (hero + a scrolled section):
   ```bash
   python3 scripts/capture-screenshots.py \
     --url <URL> --name <slug> --out assets/references --offsets 0 1400
   ```
   Playwright is optional and only needed here. If it isn't installed, add `--install` (the
   script bootstraps Playwright + Chromium), or install it first with the user's go-ahead:
   `python3 -m pip install playwright && python3 -m playwright install chromium`.
   Use a kebab-case `<slug>` (e.g. `stripe`, `linear`, `vercel`). For several at once:
   ```bash
   python3 scripts/capture-screenshots.py --out assets/references --offsets 0 1400 \
     --sites stripe=https://stripe.com/ linear=https://linear.app/
   ```
   If a site blocks headless or is JS-heavy and times out, the script falls back to
   `domcontentloaded`; if it still fails, write a concise text-only catalog entry (no broken
   image links).

4. **Append a catalog entry** to `references/design-languages.md` under "Additional general
   styles", following the existing entry shape:
   ```md
   ### <N>. <Site / style name>
   - **Screenshots:** `../assets/references/<slug>-hero.png`, `<slug>-scroll1.png`
   - **Vibe:** …
   - **Palette:** … (optionally list hexes / a ready `@theme` block)
   - **Type / Layout:** …
   - **Motion:** which `patterns.md` recipes (§ numbers).
   ```
   Optionally add a brand `@theme` token block derived from the palette so the style is
   instantly buildable.

5. **(Maintainers) share it.** If this install is the shared repo, commit and push so others
   get the new reference:
   ```bash
   git add assets/references references/design-languages.md
   git commit -m "catalog: add <slug>"
   git push
   ```

## Notes
- Keep screenshots reasonably sized; they're visual references, not assets shipped to a site.
- Respect sites' terms — these are personal/internal design references, not redistribution of
  their content.
- Don't duplicate an existing entry; if a site matches an existing language, add it as another
  example under that entry instead of a new one.
