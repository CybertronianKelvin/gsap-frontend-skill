# Verification

Always verify an animated build before calling it done. Animations break in ways static
UIs don't (jumpy scroll, motion that ignores accessibility settings, mobile overflow). Run
these checks; fix anything against `gotchas.md`.

## Tooling (optional — only for screenshots/automation)

Building animated sites needs **no Python** — just `npm i gsap @gsap/react`. Playwright is
only used by the bundled `scripts/capture-screenshots.py` for the automated screenshot/verify
checks below. You can always verify by hand in a browser instead.

If you do want the automated checks and Playwright isn't installed, **install it for the user**
(with their go-ahead):

```bash
python3 -m pip install playwright
python3 -m playwright install chromium
```

Shortcuts: the `webapp-testing` skill's environment already has Playwright if it's installed;
or run the capture script with `--install` and it bootstraps Playwright + Chromium itself.
`scripts/capture-screenshots.py --help` shows usage — it drives a headless Chromium, waits for
`networkidle` (falling back to `domcontentloaded`), and writes PNGs.

## Gates (run in order)

1. **Build + types + lint.** For Next.js: `npx next build`, `npx tsc --noEmit`, `npx eslint .`.
   The build must pass and prerender pages without errors.

2. **Console + page errors.** Load the page headless and assert zero errors:
   ```python
   from playwright.sync_api import sync_playwright
   with sync_playwright() as p:
       b = p.chromium.launch(headless=True)
       pg = b.new_page(viewport={"width": 1440, "height": 900})
       errs = []
       pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
       pg.on("pageerror", lambda e: errs.append(str(e)))
       pg.goto("http://localhost:3000", wait_until="networkidle"); pg.wait_for_timeout(1500)
       print("errors:", len(errs), errs[:5]); b.close()
   ```

3. **Scroll through (forward and reverse).** Step the scroll position down to the bottom and
   back up. This exercises pinned sections and `ScrollTrigger.create … onToggle` handlers in
   both directions and surfaces jumpy refresh bugs (see gotchas D/F). Screenshot a few
   positions and eyeball that pinned headings stay visible and content slides smoothly.

4. **`prefers-reduced-motion`.** The most-missed check. Emulate reduced motion and confirm
   **all content is fully visible with no animation** (nothing stuck at opacity 0):
   ```python
   pg = b.new_page(viewport={"width": 1440, "height": 900},
                   reduced_motion="reduce")
   pg.goto(url, wait_until="networkidle"); pg.wait_for_timeout(800)
   pg.screenshot(path="/tmp/reduced.png", full_page=True)
   ```
   Every heading, paragraph, card and image must render. If anything is invisible, a hidden
   start state leaked outside a `matchMedia` guard (gotcha H).

5. **Mobile width (~390px).** Capture at `viewport={"width": 390, "height": 844}` and check:
   no horizontal scrollbar/overflow, headings wrap cleanly, tap targets aren't tiny, and any
   responsive reordering (hero image/CTA order) is correct.

6. **Marquee / parallax smoothness.** Capture two frames ~1.5s apart and confirm marquees
   advanced (and aren't jittering); confirm parallax layers have `will-change-transform`.

## Quick capture for visual review

```bash
# verify a running local build at several scroll depths
python3 scripts/capture-screenshots.py --url http://localhost:3000 --name verify \
    --out /tmp/verify --offsets 0 1200 2600 4000
```

## Sign-off checklist (mirror of gotchas.md)
- [ ] build / types / lint pass; zero console & page errors.
- [ ] forward + reverse scroll smooth; pinned headings stay visible.
- [ ] reduced-motion: all content visible, no motion.
- [ ] ~390px mobile: no overflow; reorder correct; tap targets fine.
- [ ] scrubbed/parallax/marquee layers GPU-hinted; marquee advances without jitter.
