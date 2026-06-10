#!/usr/bin/env python3
"""
capture-screenshots.py — grab reference screenshots of any site with Playwright.

Used by the gsap-frontend skill to (a) capture design-language references for the
catalog and (b) verify a freshly built page. Black-box: run with --help, don't read
the source into context.

Requirements (fresh machine):
    pip install playwright
    playwright install chromium

Examples:
    # One reference site → hero + a scrolled section into the skill's catalog folder
    python3 capture-screenshots.py --url https://cash.app/ --name cashapp \\
        --out ../assets/references --offsets 0 1400

    # Capture several sites in one go ("name=url" pairs)
    python3 capture-screenshots.py --out ../assets/references --offsets 0 1400 \\
        --sites stripe=https://stripe.com/ linear=https://linear.app/

    # Verify a locally running build (full page)
    python3 capture-screenshots.py --url http://localhost:3000 --name home \\
        --out /tmp/verify --full-page
"""
import argparse
import os
import subprocess
import sys

PIP_CMD = [sys.executable, "-m", "pip", "install", "playwright"]
BROWSER_CMD = [sys.executable, "-m", "playwright", "install", "chromium"]
INSTALL_HINT = (
    "Playwright tooling is missing. Install it with:\n"
    f"    {' '.join(PIP_CMD)}\n"
    f"    {' '.join(BROWSER_CMD)}\n"
    "(or re-run this script with --install to do it automatically)."
)


def ensure_playwright(auto_install):
    """Return sync_playwright, installing Playwright + Chromium if needed."""
    try:
        from playwright.sync_api import sync_playwright
        return sync_playwright
    except ImportError:
        if not auto_install:
            print(INSTALL_HINT, file=sys.stderr)
            sys.exit(2)
        print("Installing Playwright …", file=sys.stderr)
        subprocess.run(PIP_CMD, check=True)
        subprocess.run(BROWSER_CMD, check=True)
        from playwright.sync_api import sync_playwright
        return sync_playwright


def capture(page, name, out, offsets, full_page):
    saved = []
    if full_page:
        path = os.path.join(out, f"{name}.png")
        page.screenshot(path=path, full_page=True)
        return [path]
    for i, y in enumerate(offsets):
        if y:
            page.evaluate(f"window.scrollTo(0,{int(y)})")
            page.wait_for_timeout(1200)
        suffix = "hero" if i == 0 else f"scroll{i}"
        path = os.path.join(out, f"{name}-{suffix}.png")
        page.screenshot(path=path)
        saved.append(path)
    return saved


def main():
    ap = argparse.ArgumentParser(
        description="Capture reference/verification screenshots with Playwright.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    ap.add_argument("--url", help="Single target URL.")
    ap.add_argument("--name", help="Filename prefix for --url (e.g. 'cashapp').")
    ap.add_argument(
        "--sites", nargs="+", default=[],
        help="Multiple targets as name=url pairs (e.g. stripe=https://stripe.com).",
    )
    ap.add_argument("--out", default="./screenshots", help="Output directory.")
    ap.add_argument(
        "--offsets", nargs="+", type=int, default=[0, 1400],
        help="Scroll Y offsets to capture; first (0) = hero. Default: 0 1400.",
    )
    ap.add_argument("--full-page", action="store_true", help="Single full-page shot instead of offsets.")
    ap.add_argument("--width", type=int, default=1440, help="Viewport width (default 1440).")
    ap.add_argument("--height", type=int, default=900, help="Viewport height (default 900).")
    ap.add_argument("--timeout", type=int, default=30, help="networkidle timeout, seconds (default 30).")
    ap.add_argument("--install", action="store_true",
                    help="If Playwright/Chromium is missing, install it automatically.")
    args = ap.parse_args()

    targets = []
    if args.url:
        targets.append((args.name or "screenshot", args.url))
    for pair in args.sites:
        if "=" not in pair:
            print(f"skip (need name=url): {pair}", file=sys.stderr)
            continue
        n, u = pair.split("=", 1)
        targets.append((n, u))
    if not targets:
        ap.error("provide --url (with --name) or --sites name=url ...")

    os.makedirs(args.out, exist_ok=True)

    sync_playwright = ensure_playwright(args.install)

    results = {}
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=True)
        except Exception as e:
            # Most common cause: the Chromium browser binary isn't installed.
            if args.install:
                print("Installing Chromium …", file=sys.stderr)
                subprocess.run(BROWSER_CMD, check=True)
                browser = p.chromium.launch(headless=True)
            else:
                print(f"Could not launch Chromium ({str(e)[:80]}).\n"
                      f"Install it with: {' '.join(BROWSER_CMD)}  (or re-run with --install)",
                      file=sys.stderr)
                sys.exit(2)
        for name, url in targets:
            try:
                page = browser.new_page(viewport={"width": args.width, "height": args.height})
                try:
                    page.goto(url, wait_until="networkidle", timeout=args.timeout * 1000)
                except Exception:
                    page.goto(url, wait_until="domcontentloaded", timeout=args.timeout * 1000)
                page.wait_for_timeout(2500)
                saved = capture(page, name, args.out, args.offsets, args.full_page)
                results[name] = "OK " + ", ".join(os.path.basename(s) for s in saved)
                page.close()
            except Exception as e:
                results[name] = f"FAIL {str(e)[:80]}"
        browser.close()

    for k, v in results.items():
        print(f"{k:20s} {v}")
    if all(v.startswith("FAIL") for v in results.values()):
        sys.exit(1)


if __name__ == "__main__":
    main()
