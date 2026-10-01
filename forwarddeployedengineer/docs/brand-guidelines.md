# Brand Guidelines v1.0 — forwarddeployedengineer

> Last updated: 2026-10-01
> Status: Approved for WordPress MVP
> Domain: forwarddeployedengineer.com

## Quick Reference

| Element | Value |
|---------|-------|
| Name | forwarddeployedengineer |
| Tagline | Find, become, hire a Forward Deployed Engineer |
| Primary Color | #1A4DFF — Deploy Blue |
| Accent Color | #FF5C00 — Field Orange |
| Mono Accent | #00E5A0 — Terminal Green (sparingly) |
| Background | #FAFAF8 paper / #0E131A ink for hero |
| Primary Font | Inter (headings + body, WordPress system) |
| Mono Font | JetBrains Mono (salaries, code, labels) |
| Voice | Direct, Field-tested, Technical, No-hype |

---

## 1. Positioning

**What:** The directory + jobs + interview hub for Forward Deployed Engineers.
**Who:** 1) Engineers wanting FDE jobs 2) Founders hiring FDEs
**Promise:** Real salaries, real interview breakdowns, live jobs — no fluff.

Tone examples:
- Hero: "All Forward Deployed Engineer jobs, salaries, and interviews in one place."
- Not: "Revolutionary best-in-class synergy platform"

Prohibited: revolutionary, seamless, synergy, leverage, ninja, rockstar, unlock, supercharge.

## 2. Color Palette

### Primary
| Name | Hex | Usage |
|------|-----|-------|
| Deploy Blue | #1A4DFF | CTAs, links, primary buttons |
| Deploy Dark | #0F33B3 | Hover, emphasis |
| Ink | #0E131A | Text, dark hero bg |

### Accent (use <10%)
| Name | Hex | Usage |
|------|-----|-------|
| Field Orange | #FF5C00 | Apply badges, salary highlights, new tag |
| Terminal Green | #00E5A0 | Success, live dot, code ticks — dark bg only |

### Neutrals
| Name | Hex | Usage |
|------|-----|-------|
| Paper | #FAFAF8 | Page bg |
| Surface | #FFFFFF | Cards |
| Border | #E6E8EE | Dividers, card border |
| Text Secondary | #5B6472 | Meta, captions |

Accessibility: Deploy Blue on white 6.2:1 AA. Orange only for large text/badges, never body text. All buttons WCAG AA.

## 3. Typography (WordPress-native, fast)

- Headings + Body: `Inter, system-ui, -apple-system, Segoe UI, sans-serif`
- Mono: `JetBrains Mono, ui-monospace, SFMono-Regular, monospace` — for `$238k TC`, `Python • RAG • Agents`, job IDs

| Element | Desktop | Mobile | Weight |
|---------|---------|--------|--------|
| H1 | 44px | 32px | 700, -0.02em |
| H2 | 32px | 26px | 650 |
| H3 | 22px | 20px | 600 |
| Body | 17px | 16px | 400, 1.6 |
| Small / meta | 14px | 14px | 500 mono for labels |

Google Fonts load (paste in WP):
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

## 4. Logo Usage (v1 text-only, no designer needed)

- **Primary:** `forwarddeployedengineer` lowercase Inter 800, with `>_ ` in Field Orange prefix: `>_forwarddeployedengineer`
- **Icon:** `>_FDE` in Ink square, orange `>_`
- **Favicon:** orange `>_ ` on ink
- Clear space = height of `>_`. Min width 120px full, 24px icon.
- Don'ts: no gradient, no rotation, no shadow, no serif.

WordPress: set Site Title as text logo initially. Upload SVG icon later.

## 5. Imagery

- No stock handshakes. Use: terminal screenshots, salary tables, architecture diagrams.
- Cards: white, 12px radius, 1px #E6E8EE border, subtle shadow.
- Badges: mono uppercase 12px: `PALANTIR • $215K • NYC`, orange dot for LIVE jobs.

## 6. Components (maps to GeneratePress / Elementor)

| Type | Bg | Text | Radius |
|------|----|------|--------|
| Primary btn | #1A4DFF | #fff | 8px, 16px/24px padding |
| Secondary btn | transparent | #1A4DFF, 1.5px border | 8px |
| Employer CTA | #FF5C00 | #fff | 8px |
| Card | #fff | #0E131A | 12px |
| Input | #fff, border #E6E8EE | #0E131A | 8px |
