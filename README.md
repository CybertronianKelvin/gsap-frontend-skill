# gsap-frontend — a Claude Code skill

Build distinctive, production-grade **animated frontends with GSAP + ScrollTrigger**. This
skill teaches Claude Code how to set up GSAP, which scroll-animation patterns to use, how to
keep them fast and accessible (`prefers-reduced-motion`), and how to pick a design language —
and it's **self-extending**: point it at sites you like and it adds them to its catalog.

Default stack: **Next.js (App Router) + React + Tailwind v4**. The GSAP core and every
pattern are framework-agnostic (notes for Vite / vanilla JS included).

## What's inside

```
skills/gsap-frontend/
├── SKILL.md                      # workflow + golden rules + design-language map
├── references/
│   ├── setup.md                  # GSAP install, central registrar, useGSAP/matchMedia, refreshAfterAssets
│   ├── patterns.md               # copy-paste recipes: reveal, pinned/horizontal, sticky story, parallax, marquee…
│   ├── gotchas.md                # symptom→cause→fix for the real bugs (sticky, jumpy scroll, ultrawide…)
│   ├── design-languages.md       # catalog of 13+ styles, each mapped to patterns + reference screenshots
│   ├── verify.md                 # Playwright verification playbook (build, reduced-motion, mobile)
│   └── extending.md              # how to add sites you like to the catalog
├── assets/
│   ├── anim/                     # drop-in gsap.ts, Reveal/Counter/Marquee + globals-snippet.css
│   └── references/               # reference screenshots (cash.app, getduel, magic-receipt, pushapp, examples)
└── scripts/
    └── capture-screenshots.py    # self-contained Playwright capture CLI
```

## Install

### Option A — Claude Code plugin (recommended)

Self-hosted marketplace; **no Anthropic approval required** — installers just trust it locally.

```
/plugin marketplace add CybertronianKelvin/gsap-frontend-skill
/plugin install gsap-frontend@gsap-frontend-skill
```

### Option B — plain copy

```bash
git clone https://github.com/CybertronianKelvin/gsap-frontend-skill.git
cp -r gsap-frontend-skill/skills/gsap-frontend ~/.claude/skills/
# or into a project: cp -r .../skills/gsap-frontend <project>/.claude/skills/
```

Either way the skill is then available as **`/gsap-frontend`** and triggers automatically when
you ask Claude to build animated landing pages, scroll animations, parallax, etc.

## Use

- **Build:** *"build me an animated landing page like cash.app"* → the skill picks a design
  language, scaffolds the GSAP engine, composes sections from the pattern recipes, and applies
  the performance/accessibility golden rules.
- **Extend (add sites you like):** *"add stripe.com and linear.app to the gsap-frontend catalog"*
  → it web-searches/fetches each site, screenshots it, and appends a catalog entry. See
  `skills/gsap-frontend/references/extending.md`. If this is your fork, commit + push to share.
- **Verify:** see `references/verify.md`.

## Requirements

- **To build sites:** just `npm i gsap @gsap/react` in the target project. No Python needed.
- **Screenshot/verify/extend tooling (optional):** Playwright. Install with
  `python3 -m pip install playwright && python3 -m playwright install chromium`, or run
  `scripts/capture-screenshots.py --install` and it bootstraps itself. The skill will offer to
  install it when a screenshot/verify step needs it.

## Licence

MIT © cybertroniankelvin. Bundled reference screenshots are third-party site captures included
for design reference only and remain the property of their owners.
