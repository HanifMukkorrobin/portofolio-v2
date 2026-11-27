---
name: Editorial Issue Grid Portfolio
description: Bilingual (EN/ID) full-stack engineering portfolio and single-owner admin panel built on a sharp editorial spine, heavy horizontal rules, and one vermilion spot accent.
colors:
  spot-vermilion: "#c6370a"
  spot-vermilion-dark: "#ff5a1f"
  mineral-paper: "#f4f3ef"
  coated-white: "#ffffff"
  obsidian-ink: "#0e0f11"
  obsidian-surface: "#15171a"
  smooth-ink: "#0d0d0d"
  offwhite-ink: "#f3f2ee"
  graphite-secondary: "#3f3e3b"
  stone-muted: "#5c5b56"
  hairline-rule-subtle: "#cfcdc4"
  hairline-rule-dark: "#3e434b"
  heavy-rule-dark: "#6e737d"
  warning-amber: "#d97706"
typography:
  display:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "4.25rem"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Hanken Grotesk, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0em"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.12em"
rounded:
  none: "0px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "56px"
components:
  button-primary:
    backgroundColor: "{colors.spot-vermilion}"
    textColor: "{colors.coated-white}"
    rounded: "{rounded.none}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "{colors.mineral-paper}"
    textColor: "{colors.smooth-ink}"
    rounded: "{rounded.none}"
    padding: "10px 18px"
  badge-nda:
    backgroundColor: "{colors.spot-vermilion}"
    textColor: "{colors.coated-white}"
    rounded: "{rounded.none}"
    padding: "2px 10px"
  input-field:
    backgroundColor: "{colors.mineral-paper}"
    textColor: "{colors.smooth-ink}"
    rounded: "{rounded.none}"
    padding: "10px 14px"
---

# Design System: Editorial Issue Grid Portfolio

## Overview

**Creative North Star: "The Printed Engineering Monograph"**

This system adapts mid-century editorial magazine grids into a bilingual (`EN`/`ID`) technical portfolio and single-owner `/admin` workspace. Rather than dark-SaaS glowing cards or generic centered developer heroes, pages are organized like printed architectural folios: crisp serif display headlines, structured two-column indexes separated by decisive 1px and 3px horizontal rules, and a permanent left editorial spine on desktop viewports that anchors navigation, locale/theme controls, direct contact links, and CV download.

The palette operates in strict Light (coated mineral paper) and Dark (smooth obsidian ink) modes with one vivid vermilion spot accent reserved strictly for primary actions, active navigation/availability markers, and NDA confidentiality badges.

**Key Characteristics:**
- Permanent 264px left editorial spine on desktop (`lg+`), collapsing into a sticky compact utility header and drawer on mobile.
- Sharp rectangular geometry (0px border radius) with zero decorative drop shadows; structure is expressed purely through hairline (`1px`) and section-break (`3px`) rules.
- Self-hosted typography pairing high-contrast Didone serif display (*Bodoni Moda*), clean grotesk body (*Hanken Grotesk*), and tabular monospace metadata (*JetBrains Mono*).
- Shared semantic tokens across public `/en` & `/id` routes and the utilitarian `/admin` dashboard.

## Colors

High-contrast monochrome ink and paper grounds in both Light and Dark themes, punctuated by one disciplined vermilion spot ink.

### Primary
- **Spot Vermilion (Light)** (`#c6370a`, hover `#a82d06`) / **Spot Vermilion (Dark)** (`#ff5a1f`, hover `#ff703d`): Reserved exclusively for primary actions (`Download CV`, `Inspect Case Studies`, form submit), active status dots, section index markers, and `NDA Restricted` badges. Both themes pass WCAG 1.4.3 AA (`≥4.79:1` on canvas and `≥5.31:1` on primary buttons).

### Neutral
- **Mineral Paper** (`#f4f3ef`) / **Obsidian Ink** (`#0e0f11`): Primary page canvas ground in Light (default) / Dark modes.
- **Coated White** (`#ffffff`) / **Obsidian Surface** (`#15171a`): Elevated flat surface panels (project media frames, empty states, admin form cards).
- **Smooth Ink** (`#0d0d0d`) / **Off-White Ink** (`#f3f2ee`): Primary text and Light-mode rules.
- **Graphite Secondary** (`#3f3e3b`) / **Warm Silver** (`#c8c6be`): Body paragraphs and secondary editorial copy.
- **Hairline & Heavy Rules**: `#1a1a1a` (Light 1px/3px) vs `#3e434b` (Dark 1px) and `#6e737d` (Dark 3px section dividers); `#cfcdc4` light / `#282c32` dark for subtle interior dividers.
- **Warning Amber** (`#d97706` light / `#f59e0b` dark): Reserved exclusively in `/admin` for untranslated Indonesian (`ID`) fallback indicators.

### Named Rules
**The One Spot Rule.** Vermilion is reserved strictly for active markers, primary CTAs, and NDA seals—never as a background wash or decorative border on non-critical containers.

**The Dual-Ground Parity Rule.** Every surface, border, and text token maps 1-to-1 between `:root` (Light) and `:root[data-theme='dark']` (Dark) with ≥4.5:1 body contrast.

## Typography

**Display Font:** Bodoni Moda (self-hosted variable WOFF2, Georgia fallback)
**Body Font:** Hanken Grotesk (self-hosted variable WOFF2, system sans fallback)
**Label/Mono Font:** JetBrains Mono (self-hosted variable WOFF2, ui-monospace fallback)

**Character:** High-contrast editorial serif authority for titles and mastheads paired with neutral workhorse grotesk readability and tabular monospace precision for index numbers, periods, tech stacks, and UI controls.

### Hierarchy
- **Display** (400, `3rem`–`4.25rem`, line-height `0.98`, tracking `-0.02em`): Hero positioning headline and case study H1.
- **Headline** (400, `1.875rem`–`2.25rem`, line-height `1.1`): Major section titles (`Shipped Projects & Case Studies`, `Services & Freelance`, Admin page titles).
- **Title** (400, `1.5rem`–`2.15rem`, line-height `1.08`–`1.15`): Numbered project entries (`01 / ...`), work history roles, empty state headings.
- **Body** (400, `0.9375rem`–`1.125rem`, line-height `1.65`–`1.72`, measure `60ch`–`70ch`): Bio, project summaries, and Markdown case study prose.
- **Label** (500, `0.6875rem`–`0.75rem`, uppercase, tracking `0.08em`–`0.14em`, `tabular-nums`): Navigation items, segmented controls, badges, metadata keys, and buttons.

### Named Rules
**The No-Eyebrow Rule.** Headings carry their own weight without decorative kicker labels stacked above them.

## Layout

Desktop viewports (`≥1024px`) use a two-region editorial split: a sticky `264px` full-height left spine separated by a `1px` ink rule, paired with a fluid main reading canvas (`flex-1 min-w-0`). Major sections on the main canvas are demarcated by `3px` horizontal rules (`border-t-[3px]`). Shipped projects flow in a strict 2-column ruled grid on desktop and stack cleanly in 1 column below `1024px`. Mobile viewports (`<1024px`) replace the left spine with a sticky single-row masthead carrying `EN | ID`, theme switch, and expandable navigation drawer.

## Elevation & Depth

This system uses **zero drop shadows**. Hierarchy and separation are conveyed strictly through flat tonal steps (`--bg-page` vs `--bg-surface`), `1px` crisp structural borders, and `3px` section divider rules.

### Named Rules
**The Flat-Rule Rule.** Never add drop shadows, glowing borders, or blurred glass cards; separate planes with crisp `1px` or `3px` rules and clean surface contrast.

## Shapes

All buttons, badges, inputs, segmented switches, project media frames, and admin containers use **sharp `0px` rectangular corners** (`rounded: 0px`). Focus rings use a crisp `2px solid var(--spot-accent)` outline with `2px` offset.

## Components

### Buttons
- **Shape:** Sharp rectangular (`0px` radius).
- **Primary:** Solid vermilion fill (`--spot-accent`), high-contrast ink (`--spot-ink`), uppercase `JetBrains Mono` `12px`, padding `12px 24px`.
- **Secondary:** Transparent background, `1px solid var(--border-hairline)`, uppercase `JetBrains Mono`, inverting to solid ink fill on hover.

### Badges & Stack Tags
- **NDA Badge:** Solid vermilion fill with inline 11px lock SVG and uppercase label.
- **Tech Stack Tag:** `1px solid var(--border-hairline)` rectangular frame, `11px` uppercase monospace, `2px 8px` padding.
- **Untranslated ID Indicator (`/admin`):** Subtle amber tint (`--warn-bg`) with crisp amber border (`--warn-border`) and dark/light legible amber ink (`--warn-ink`).

### Inputs / Fields (`/admin`)
- **Style:** `1px solid var(--border-hairline)`, `--bg-page` fill inside `--bg-surface` form sections, `0px` radius, `var(--spot-accent)` caret color.
- **Focus:** `2px solid var(--spot-accent)` outline with `2px` offset.

### Navigation (`EditorialSpine`)
- Desktop sticky left rail (`264px`) holding serif masthead, vertical anchor index with vermilion square indicator, segmented `EN | ID` toggle, Light/Dark switch, bordered direct contact links (`Email`, `GitHub`, `LinkedIn`), and full-width vermilion `Download CV` button.

## Do's and Don'ts

### Do:
- **Do** preserve `0px` rectangular corners and crisp `1px`/`3px` rules across both public and `/admin` views.
- **Do** keep all typography self-hosted under `apps/web/static/fonts/` with `@font-face` rules in `apps/web/src/app.css`.
- **Do** use authored inline SVG icons (`Icon.svelte`) with uniform `1.75` stroke weight rather than Unicode glyphs or emoji.
- **Do** keep empty states clean and honest when no projects, work history, or profile copy have been populated.

### Don't:
- **Don't** introduce drop shadows, gradient text, pill-shaped marketing cards, or glassmorphism.
- **Don't** place kicker/eyebrow labels above section headings.
- **Don't** expose `repoUrl` or `liveUrl` in public payloads or UI when `isNda` is true.
