---
version: "2.2"
name: "Webflow"
description: "Create custom, responsive websites with the power of code — visually."
defaultMode: "dark"
supportsDark: false
archetype: "agent-ready"
chips:
  - "Primary CTA #146ef51a"
  - "Accent #146ef5"
  - "Radius 2px"

consumer_contract:
  standalone: true
  goal: "Generate Webflow-style interfaces from this file alone."
  priority_order:
    - "Use semantic tokens first: colors, dark, typography, spacing, rounded, shadows, motion."
    - "Apply component recipes exactly before inventing variants."
    - "Use prose sections for judgment when a token is ambiguous."
    - "Respect Do's and Don'ts over generic framework defaults."
  mode_rule: "Light-only system. Use the primary slot for CTAs (#146ef51a); inverse sections may flip to surface-inverse + foreground for editorial contrast."
  font_rule: "Use WF Visual Sans Variable / ui-monospace when available; otherwise apply the declared CSS fallbacks without blocking implementation."
  asset_rule: "Do not require logos, photography, or proprietary assets. Use typography, color, spacing, and component behavior to express the system."
  accessibility_rule: "Ship WCAG AA contrast, visible focus rings, keyboard-operable controls, and no body text below 16px."

colors:
  # Semantic UI color slots
  primary: "#146ef51a"
  primary-foreground: null  # extraction_gap(colors.primary-foreground)
  secondary: "#7a3dff"
  secondary-foreground: "#080808"  # recovered from broken extraction (used near-black); inference=semantic_alias
  tertiary: "#146ef5"
  neutral: "#d8d8d8"
  background: "#ffffff"  # aliased from "surface"; inference=semantic_alias
  foreground: "#080808"  # recovered from broken extraction (used near-black); inference=semantic_alias
  surface: "#ffffff"
  surface-foreground: "#080808"  # recovered from broken extraction (used near-black); inference=semantic_alias
  card: "#ffffff"  # source=colors.surface; curated_from=extract_sidecar
  card-foreground: "#080808"  # recovered from broken extraction (used near-black); inference=semantic_alias
  popover: "#ffffff"  # source=colors.surface; curated_from=extract_sidecar
  popover-foreground: "#080808"  # recovered from broken extraction (used near-black); inference=semantic_alias
  muted: null  # extraction_gap(colors.muted)
  muted-foreground: "#d8d8d8"  # aliased from "text-muted"; inference=semantic_alias
  accent: "#146ef5"
  accent-foreground: null  # extraction_gap(colors.accent-foreground)
  destructive: "#ed52cb"  # aliased from "error"; inference=semantic_alias
  destructive-foreground: null  # extraction_gap(colors.destructive-foreground)
  border: "#d8d8d8"
  input: "#ffffff"  # source=colors.surface; curated_from=extract_sidecar
  ring: "#146ef5"  # aliased from "accent"; inference=semantic_alias
  success: "#00d722"
  warning: null  # extraction_gap(colors.warning)
  info: "#146ef51a"  # source=colors.primary; curated_from=extract_sidecar
  chart-1: "#146ef5"  # derived from brand palette
  chart-2: "#146ef51a"  # derived from brand palette
  chart-3: "#146ef5"  # derived from brand palette
  chart-4: "#d8d8d8"  # source=colors.neutral; curated_from=extract_sidecar
  chart-5: "#d8d8d8"  # source=colors.neutral; curated_from=extract_sidecar

  # M3 surface ladder
  surface-container-low: "#ffffff"  # aliased from "surface"; inference=semantic_alias
  surface-container: "#ffffff"  # source=colors.surface; curated_from=extract_sidecar
  surface-container-high: "#d8d8d8"  # aliased from "border"; inference=semantic_alias
  surface-container-highest: "#d8d8d8"  # source=colors.border; curated_from=extract_sidecar
  surface-bright: "#146ef5"  # aliased from "accent"; inference=semantic_alias
  surface-dim: "#d8d8d8"  # aliased from "neutral"; inference=semantic_alias
  surface-inverse: "#146ef5"  # aliased from "text"; inference=semantic_alias
  surface-inverse-foreground: "#ffffff"  # aliased from "surface"; inference=semantic_alias

  # Semantic aliases (auto-derived when canonical target exists)
  primary-deep: "#146ef51a"  # aliased from "primary"
  primary-soft: "#146ef51a"  # aliased from "primary"
  paper: "#ffffff"  # source=colors.surface; curated_from=extract_sidecar
  paper-deep: "#d8d8d8"  # aliased from "border"
  ink: "#080808"  # recovered from broken extraction (used near-black)
  ink-soft: "#080808"  # recovered from broken extraction (used near-black)
  ink-muted: "#d8d8d8"  # aliased from "text-muted"

  # Extended brand swatches — distinctive named colors from the source
  near-black: "#080808"
  webflow-blue: "#146ef5"
  blue-400: "#3b89ff"
  blue-300: "#006acc"
  button-hover-blue: "#0055d4"
  purple: "#7a3dff"
  pink: "#ed52cb"
  green: "#00d722"
  orange: "#ff6b00"
  yellow: "#ffae13"

dark:
  # Auto-derived from light-mode inversion — brand has no dark CSS detected, use as starting point only
  background: "#000000"
  foreground: "#f7f7f7"
  primary: "#146ef51a"
  card: "#080808"
  card-foreground: "#f7f7f7"
  muted: "#121212"
  muted-foreground: "#b7b7b7"
  border: "#f7f7f71a"

fonts:
  display: "'WF Visual Sans Variable', Arial, sans-serif"  # source=@font-face; inference=font_slot
  body: "'WF Visual Sans Variable', Arial, sans-serif"  # source=@font-face; inference=font_slot
  eyebrow: "'WF Visual Sans Variable', Arial, sans-serif"  # source=@font-face; inference=font_slot
  mono: "'WFVisualSans-Mono', ui-monospace, monospace"  # source=@font-face; inference=font_slot
  sans: "'WF Visual Sans Variable', Arial, sans-serif"  # source=@font-face; inference=font_slot
  serif: null  # extraction_gap(fonts.serif — available families: webflow-icons, WF Visual Sans Variable, swiper-icons, WFVisualSans-Mono)

typography:
  h1:
    fontFamily: "WF Visual Sans Variable"
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.04em"
  h2:
    fontFamily: "WF Visual Sans Variable"
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  h3:
    fontFamily: "WF Visual Sans Variable"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "WF Visual Sans Variable"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.08em"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0em"

spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "1rem"
  "5": "20px"
  "6": "1.5rem"
  "8": "2rem"
  "10": "40px"
  xs: "4px"
  sm: "5px"
  md: "6px"
  lg: "8px"
  xl: "10px"
  "2xl": "12px"
  "3xl": "15px"
  "4xl": "1rem"
  "1.5": "6px"
  "2.5": "10px"

rounded:
  none: "0px"
  sm: "2px"
  md: "2px"
  lg: "12px"
  xl: "18px"  # auto-derived from lg radius
  full: "9999px"
  button: ".5rem"  # from button rules
  card: "0"  # from card rules
  input: "0"  # from input rules

shadows:
  # Brand-named shadows (paper/soft/clay/etc) appear inline below if extracted from CSS vars.
  # Below: top extracted box-shadow values (filtered + ranked by frequency).
  xs: "inset 0 0 0 0 var(--colors--background)"  # used 3× in source
  sm: "rgba(8, 8, 8, 0.08) 0px 1px 1px 0px,
      rgba(8, 8, 8, 0.2) 0px 1px 1px 0px,
      rgba(255, 255, 255, 0.12) 0px 6px 12px 0px inset,
      rgba(255, 255, 255, 0.2) 0px 1px 1px 0px inset"  # used 3× in source
  md: "0 105px 30px #0000,0 67px 27px #00000005,0 38px 23px #0000000f,0 17px 17px #0000001a,0 4px 9px #0000001f"  # used 2× in source
  lg: "0 0 0 1px #0000001a,0 1px 3px #0000001a"  # used 1× in source
  xl: "inset 0 0 0 100px #00000026"  # used 1× in source
  "2xl": "0 84px 24px #0000,0 54px 22px #00000003,0 30px 18px #0000000a,0 13px 13px #00000014,0 3px 7px #00000017"  # used 1× in source

shadows_inset:
  # Inset shadows — hairline-style borders (Linear/Anthropic pattern).
  hairline: "inset 0 0 0 0 var(--colors--background)"
  ring: "inset 0 0 0 100px #00000026"

motion:
  duration-faster: "150ms"
  duration-fast: "200ms"
  duration-normal: "300ms"
  duration-gentle: "450ms"
  duration-slow: "750ms"
  duration-slower: "1000ms"
  ease-out: "cubic-bezier(0, 0, 0.2, 1)"
  ease-easy-ease: "cubic-bezier(0.455,0.03,0.515,0.955)"
  ease-decelerate-mid: "cubic-bezier(0.645,0.045,0.355,1)"

elevation:
  raised: "0 0 0 1px #0000001a,0 1px 3px #0000001a"
  floating: "rgba(8, 8, 8, 0.08) 0px 1px 1px 0px,
      rgba(8, 8, 8, 0.2) 0px 1px 1px 0px,
      rgba(255, 255, 255, 0.12) 0px 6px 12px 0px inset,
      rgba(255, 255, 255, 0.2) 0px 1px 1px 0px inset"
  modal: "0 105px 30px #0000,0 67px 27px #00000005,0 38px 23px #0000000f,0 17px 17px #0000001a,0 4px 9px #0000001f"

components:
  button-primary:
    backgroundColor: "#146ef51a"
    textColor: "#ffffff"  # source=preview_tokens.button_primary_text; curated_from=extract_sidecar
    borderColor: "#146ef51a"
    typography: "ui-monospace 12px/1.25 600"
    rounded: ".5rem"
    padding: "1.5rem"
    height: null  # extraction_gap(button-primary.height — no height extracted)
    shadow: "none"
  button-primary-hover:
    backgroundColor: "#0000"
    textColor: "var(--_color---neutral--white)"
    borderColor: "#146ef51a"
    shadow: "none"
  button-secondary:
    backgroundColor: "#ffffff"
    textColor: "#080808"
    borderColor: "#080808"
    typography: "ui-monospace 12px/1.25 600"
    rounded: ".5rem"
    padding: "0"
    height: null  # extraction_gap(button-secondary.height)
  button-secondary-hover:
    backgroundColor: "#0000"
    textColor: "var(--_color---neutral--white)"
    borderColor: "#080808"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "#080808"
    borderColor: "transparent"
    typography: "ui-monospace 12px/1.25 600"
    rounded: "var(--_components---button--border-radius)"
    padding: "1.5rem"
  card:
    backgroundColor: "var(--colors--secondary-background)"
    textColor: "var(--_color---neutral--white)"
    borderColor: "#d8d8d8"
    rounded: "0"
    padding: "1.5rem"
    shadow: "0 0 0 1px #0000001a,0 1px 3px #0000001a"
  card-hover:
    backgroundColor: "var(--colors--border)"
    textColor: "#080808"
    rounded: "0"
    shadow: "rgba(8, 8, 8, 0.08) 0px 1px 1px 0px,
      rgba(8, 8, 8, 0.2) 0px 1px 1px 0px,
      rgba(255, 255, 255, 0.12) 0px 6px 12px 0px inset,
      rgba(255, 255, 255, 0.2) 0px 1px 1px 0px inset"
  input-text:
    backgroundColor: "var(--colors--background) !important"
    textColor: "inherit"
    borderColor: "#d8d8d8"
    typography: "WF Visual Sans Variable 16px/1.5 400"
    rounded: "0"
    padding: "0"
    focusBorderColor: "#146ef5"
    focusRing: "0"
  badge-default:
    backgroundColor: "unset"
    textColor: "var(--colors--text-secondary)"
    borderColor: "#d8d8d8"
    typography: "ui-monospace 12px/1.25 600"
    rounded: "unset"
    padding: "unset"
  nav-header:
    backgroundColor: "var(--colors--background)"
    textColor: "#fff"
    borderColor: "#d8d8d8"
    typography: "ui-monospace 12px/1.25 600"
    height: null  # extraction_gap(nav-header.height)
  inverse-section:
    backgroundColor: "#080808"
    textColor: "#ffffff"
    rounded: "0px"  # source=rounded.none; curated_from=extract_sidecar
    padding: "10px"
  editorial-hero:
    backgroundColor: "#ffffff"
    textColor: "#080808"
    typography: "WF Visual Sans Variable 48px/1.1 600"
    rounded: "0px"  # source=rounded.none; curated_from=extract_sidecar
    padding: "10px"

preview_tokens:
  button_primary_bg: "#146ef51a"
  button_primary_text: "#ffffff"  # source=preview_tokens.button_primary_text; curated_from=extract_sidecar
  button_primary_border: "#146ef51a"
  button_secondary_bg: "#ffffff"
  button_secondary_text: "#080808"
  button_secondary_border: "#080808"
  button_tertiary_text: "#080808"
  surface_bg: "#ffffff"
  card_bg: "#ffffff"
  text: "#080808"
  text_muted: "#d8d8d8"
  border: "#d8d8d8"
  accent: "#146ef5"
  button_radius: ".5rem"
  card_radius: "0"
  input_radius: "0"

brand_primitives:
  # Typographic case — sentence vs uppercase per role
  case-eyebrow: "none"
  case-btn: "none"
  case-marquee: "none"
  case-nav-brand: "none"
  case-section-heading: "none"
  # Motion brand primitives
  motion-press: "scale(0.98)"
  motion-hover-opacity: "0.9"
  # Button geometry — only fields we extracted are filled
  btn-height: null  # extraction_gap(brand_primitives.btn-height — extracted button height unavailable)
  btn-padx: "1rem"
  btn-pady: "8px"
  btn-shadow: "none"
  btn-shadow-hover: "none"
  btn-active-bg: "#0000"
  btn-border-width: "2px"
  btn-secondary-border-width: "2px"
  nav-cta-height: null  # extraction_gap(brand_primitives.nav-cta-height)
  nav-cta-padx: "1rem"
  # Card geometry
  card-pad: "1.5rem"  # source=components.card.padding; curated_from=extract_sidecar
  card-pad-sm: "1.5rem"  # source=components.card.padding; curated_from=extract_sidecar
  card-shadow: "0 0 0 1px #0000001a,0 1px 3px #0000001a"  # source=components.card.shadow; curated_from=extract_sidecar
  card-shadow-hover: "rgba(8, 8, 8, 0.08) 0px 1px 1px 0px, rgba(8, 8, 8, 0.2) 0px 1px 1px 0px, rgba(255, 255, 255, 0.12) 0px 6px 12px 0px inset, rgba(255, 255, 255, 0.2) 0px 1px 1px 0px inset"  # source=components.card-hover.shadow; curated_from=extract_sidecar
  # Hairline
  hairline-width: "1px"
  hairline-style: "solid"
  hairline-color: "#d8d8d8"
  hairline-card: "#d8d8d8"
  hairline-input: "#d8d8d8"
  hairline-table: "#d8d8d8"
  # Layout
  nav-height: null  # extraction_gap(brand_primitives.nav-height)
  nav-padx: "1.5rem"
  section-padx: "1.5rem"
  section-pady: "40px"
  surface-pad: "1.5rem"
  surface-min-h: null  # extraction_gap(brand_primitives.surface-min-h)
  container-max: null  # extraction_gap(brand_primitives.container-max — typically 1200-1400px)
  spacing: "4px"

aliases:
  # Layer 4 — block aliases mapped to M3 surface ladder (per ADR-022 v2)
  "--block-1": "--surface-bright"
  "--block-2": "--surface-container-low"
  "--block-3": "--surface-container"
  "--block-4": "--surface-container-high"
  "--block-5": "--surface-container-highest"
  "--block-6": "--surface-dim"
  "--block-7": "--surface-inverse"
  "--block-7-foreground": "--surface-inverse-foreground"
  # Type-role aliases (h1/h2/h3 → semantic role tokens)
  "--text-h1": "--text-heading"
  "--text-h2": "--text-title"
  "--text-h3": "--text-subtitle"
  "--text-card-title": "--text-title"
  "--text-lead": "--text-body"
  "--text-nav": "--text-label"
  "--text-btn": "--text-label"
  "--text-btn-sm": "--text-caption"
  "--text-eyebrow": "--text-caption"
  "--text-meta": "--text-caption"
  # Shadow aliases (legacy numeric → semantic elevation)
  "--shadow-1": "--elevation-flat"
  "--shadow-2": "--elevation-raised"
  "--shadow-3": "--elevation-floating"
  "--shadow-4": "--elevation-overlay"
  "--duration-base": "--duration-normal"
  "--radius-pill": "--radius-full"
  # Role-coupled aliases — values derived from typography when present
  "--font-weight-display": "600"  # from typography.h1.fontWeight
  "--font-weight-heading": "600"  # from typography.h1.fontWeight
  "--font-weight-body": "400"  # from typography.body.fontWeight
  "--font-weight-lead": "400"  # from typography.body.fontWeight
  "--font-weight-nav": "600"  # from typography.label.fontWeight
  "--font-weight-brand": "600"  # from typography.h1.fontWeight
  "--font-weight-btn": "600"  # from typography.label.fontWeight
  "--font-weight-emphasis": "600"  # from typography.h2.fontWeight
  "--font-weight-eyebrow": "600"  # from typography.label.fontWeight
  "--tracking-display": "-0.04em"  # from typography.h1.letterSpacing
  "--tracking-h1": "-0.04em"  # from typography.h1.letterSpacing
  "--tracking-h2": "-0.03em"  # from typography.h2.letterSpacing
  "--tracking-h3": "-0.02em"  # from typography.h3.letterSpacing
  "--tracking-lead": "0em"  # from typography.body.letterSpacing
  "--tracking-body": "0em"  # from typography.body.letterSpacing
  "--tracking-btn": "0.08em"  # from typography.label.letterSpacing
  "--tracking-eyebrow": "0.08em"  # from typography.label.letterSpacing
  "--tracking-marquee": "0.08em"  # from typography.label.letterSpacing
  "--leading-display": "1.1"  # from typography.h1.lineHeight
  "--leading-heading": "1.1"  # from typography.h1.lineHeight
  "--leading-body": "1.5"  # from typography.body.lineHeight
  "--leading-lead": "1.5"  # from typography.body.lineHeight
  "--leading-tight": "1.15"  # from typography.h2.lineHeight
  # Legacy color synonyms (auto-derived when canonical target exists)

showcase:
  kicker: null
  headline: "Make your website a growth engine"
  lead: "Build your brand. Rank in AI search. Drive real revenue. All with Webflow."
  primary_cta: "Get started"
  secondary_cta: "Talk to sales"
  tertiary_cta: null  # extraction_gap(showcase.tertiary_cta)

assets:
  logo:
    kind: "svg-inline"
    mime: "image/svg+xml"
    size_bytes: 5198
    detected_via: "<a> > <svg>"
  favicon:
    url: "https://cdn.prod.website-files.com/686294e263eb7e215bd232f7/686d53d0446d4237b2f38c5f_webclip.png"
    mime: "image/png"
    size_bytes: 2661
  og_image: "https://cdn.prod.website-files.com/66e88746834b80507cdf7933/6706ef3c7215a769229d7aad_features-OG.jpg"
  apple_touch_icon: "https://cdn.prod.website-files.com/686294e263eb7e215bd232f7/686d53d0446d4237b2f38c5f_webclip.png"
  theme_color: "#146EF5"
  twitter_image: "https://cdn.prod.website-files.com/66e88746834b80507cdf7933/6706ef3c7215a769229d7aad_features-OG.jpg"
  twitter_card: "summary_large_image"
  canonical_url: "https://webflow.com"
---

## 1. Visual Theme & Atmosphere

Webflow reads as a **agent-ready** system. Create custom, responsive websites with the power of code — visually. The visual language is anchored by the primary CTA color `#146ef51a` paired with the `#146ef5` accent for editorial moments. Surfaces sit on `#ffffff` with text in `#080808`. Depth is communicated through a layered shadow ladder rather than aggressive contrast.

## 2. Color Palette & Roles

Primary actions use `#146ef51a`. secondary surfaces use `#7a3dff`. brand accent `#146ef5` reserves for editorial highlights, not generic CTAs. destructive uses `#ed52cb` (never reuse the accent for errors).

## 3. Typography Rules

The primary face (`WF Visual Sans Variable`) carries UI text, labels, and headings. Mono (`ui-monospace`) marks code and technical labels. Display sits at 48px/1.1, body at 16px/1.5.

## 4. Components

Primary buttons fill solid (`#146ef51a`) with `.5rem` radius. Secondary buttons render transparent on surface with a hairline border. Ghost buttons hold text-only on surface for tertiary actions. Cards are flat surfaces unless elevated for hover; inputs ride on the input slot with a focus ring tied to the primary color.

## 5. Layout Principles

section padding uses the `10px` step. Spacing follows the extracted scale; mobile collapses by halving section padding and stacking grid columns.

## 6. Depth & Elevation

The elevation ladder spans raised, floating, modal — flat surfaces dominate; raise only for floating UI. inset shadows (hairline, ring) act as hairline borders rather than depth.

## 7. Do's and Don'ts

**Do** use the primary slot (`#146ef51a`) for the dominant CTA on every surface. **Don't** reuse the accent (#146ef5) for destructive states — that role belongs to `#ed52cb`. **Do** hold the type scale tight; **don't** invent intermediate sizes outside the extracted scale.

## 8. Responsive Behavior

Spacing collapses by halving section padding at the medium breakpoint. Type scale clamps display headings to ~75% of desktop size on mobile. Container width consumes the viewport with a 1.5rem inset. Cards stack vertically; horizontal grids fall to single column.

## 9. Accessibility & Interaction

WCAG AA contrast across all text + background pairings. Focus rings use the brand ring slot at 2-3px outline. Tap targets minimum 44x44px. `prefers-reduced-motion` disables non-essential transitions. Keyboard navigation traverses all interactive surfaces in a logical order.

## 10. Agent Prompt Guide

### Quick Color Reference

- Primary CTA: `#146ef51a`
- Brand accent: `#146ef5`
- Surface canvas: `#ffffff`
- Foreground / ink: `#080808`

### Example Component Prompt

Generate a hero with Webflow's layout. Use `#ffffff` as the canvas, Sans for headlines, and a primary CTA with `#146ef51a` background and `.5rem` radius.

### Iteration Guide

1. Start from the extracted tokens — don't invent.
2. Apply component recipes exactly before introducing variants.
3. Match the brand's spacing rhythm; avoid arbitrary stops.
4. Keep type weights tight — display, heading, body only.

## 11. Implementation

Stack: Next.js 16 + Tailwind v4 + shadcn/ui (or equivalent). Tailwind config maps each `colors.*` slot to a CSS variable mounted on `:root`. Components consume `var(--primary)` etc. directly via shadcn naming. Build pipeline: tokens.json → globals.css → component library.