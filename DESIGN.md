---
name: ar—justify
description: A measured type-foundry interface for Arabic line fitting.
colors:
  proof-blue: "#2448ff"
  proof-blue-soft: "#dce2ff"
  mineral-paper: "#f3f4f1"
  specimen-surface: "#fafbf8"
  carbon-ink: "#111214"
  measured-muted: "#5f6362"
  hairline: "#c8cbc8"
  hairline-strong: "#8d918f"
  error-red: "#ae2a2a"
typography:
  display:
    fontFamily: "Archivo, Arial Narrow, Arial, sans-serif"
    fontSize: "clamp(2.75rem, 4.6vw, 4.25rem)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-0.045em"
  body:
    fontFamily: "Archivo, Arial Narrow, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Fragment Mono, SFMono-Regular, Consolas, monospace"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.05em"
  arabic:
    fontFamily: "Kitab, Traditional Arabic, serif"
    fontSize: "var(--text-size)"
    fontWeight: 400
    lineHeight: 2.05
rounded:
  square: "0px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
components:
  button-primary:
    backgroundColor: "{colors.proof-blue}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 17px"
    height: "48px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.carbon-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 17px"
    height: "48px"
  text-field:
    backgroundColor: "{colors.specimen-surface}"
    textColor: "{colors.carbon-ink}"
    typography: "{typography.arabic}"
    rounded: "{rounded.square}"
    padding: "13px 15px"
---

# Design System: ar—justify

## Overview

**Creative North Star: "The Measured Proof"**

The interface behaves like a working type-foundry specimen: exact, spacious, and visibly concerned with measure. Arabic composition is the dominant visual evidence, while controls read as instruments around it rather than as generic application chrome. Cool paper, black ink, blue measuring marks, and a fine ruled grid make the page feel printed and computational at once.

The system is dense where a typographer needs precision and quiet where the proof needs room. It rejects warm manuscript nostalgia and generic rounded dashboard furniture; the character comes from scale, alignment, and live typographic behavior.

**Key Characteristics:**
- Arabic text is always the largest and most authoritative content in the workspace.
- Ultramarine is reserved for active state, measurement, selection, and source-safe actions.
- Hairlines and grid divisions organize the page without cards or shadows.
- English utility copy is compact and technical; Arabic remains calligraphic and generous.
- Controls use square, foundry-like geometry except where a circular thumb or pill track communicates movement.

## Colors

A restrained cool-neutral field uses one saturated blue to make measurement and active state unmistakable.

### Primary
- **Proof Blue:** The sole action and measurement color. Use it for selected styles, slider progress, measure rails, focus, and the primary copy action.
- **Proof Blue Soft:** A temporary support tint for insertion markers and quiet hover feedback; never a competing page field.

### Neutral
- **Mineral Paper:** The page ground, slightly cooler and denser than white.
- **Specimen Surface:** The proof and input surface, close enough to paper to preserve a flat sheet while remaining distinguishable.
- **Carbon Ink:** Primary text, structural controls, and decisive rules.
- **Measured Muted:** Explanatory text and secondary metadata.
- **Hairline / Hairline Strong:** Grid, section, and control boundaries; use the stronger rule only where the control must read as interactive.

### Named Rules

**The One Blue Rule.** Proof Blue is the only saturated color in normal operation; adding another accent weakens the measured state language.

**The Ink-on-Paper Rule.** Large regions remain cool neutral. Blue measures and activates; it does not become decorative atmosphere.

## Typography

**Display Font:** Archivo, with Arial Narrow and Arial fallbacks  
**Body Font:** Archivo, with Arial fallbacks  
**Label/Mono Font:** Fragment Mono, with system monospace fallbacks  
**Arabic Font:** Kitab, with Traditional Arabic fallback

**Character:** A compact grotesque and practical mono form the instrument panel around an expansive traditional Arabic face. Hierarchy comes from extreme scale contrast, not from a large family of weights or styles.

### Hierarchy
- **Display** (800, fluid 44–68px, 0.96): Page thesis; compressed tracking and width keep it forceful.
- **Body** (400, 16px, 1.45): General English text when needed.
- **Technical copy** (400, 12px, 1.65): Explanations and compact instructional prose, set in mono.
- **Label** (400, 10px, 0.05em, uppercase): Axes, values, statuses, and metadata.
- **Arabic proof** (400, user-controlled 20–48px, 2.05): The live result; retain generous vertical rhythm for diacritics.

### Named Rules

**The Proof Leads Rule.** English explains the instrument; Arabic demonstrates it and receives the greatest visual scale.

**The Mono Has a Job Rule.** Monospace is reserved for labels, values, status, and instructions tied to the typographic instrument.

## Layout

Desktop uses an edge-to-edge split sheet: a roughly one-third control rail and a two-thirds proof stage separated by one full-height hairline. The stage uses a six-column visual grid; its top metadata and bottom data strip align to that field. The live Arabic measure remains centered between blue rails and honors the selected maximum width.

At 820px and below, the rail becomes a complete first section and the proof follows beneath it. Intermediate layouts place related controls in two columns; phone layouts return to one column, stack actions, hide nonessential navigation, and let the proof reflow to the available width. Spacing follows an 8/16/24/40px family, with larger fluid gaps used only to preserve the desktop sheet composition.

**The No Floating Panel Rule.** Structure comes from shared edges and full-length rules, never from detached cards.

## Elevation & Depth

The world is completely flat. There are no shadows. Hierarchy is produced by neutral surface shifts, ruled boundaries, scale, and the contrast between dense controls and open proof space.

**The Printed Sheet Rule.** A component may change ink or surface color in response to state, but it never lifts off the page.

## Shapes

The default corner language is square (0px). Text fields, segmented controls, buttons, and structural regions meet the grid directly. Circular geometry is functional and limited to slider thumbs, status dots, and the marker toggle's pill track.

Borders are one pixel. Stronger hierarchy uses darker line color, not thicker strokes. Icons are authored SVG with square caps and mitered joins to match the typographic grid.

## Components

### Buttons
- **Shape:** Square, 48px high, with compact mono labels.
- **Primary:** Proof Blue field with white text and an authored line arrow; reserved for the source-safe copy action.
- **Secondary:** Transparent field with Carbon Ink border and text.
- **Hover / Focus:** Both invert to Carbon Ink on hover; keyboard focus uses a 3px Proof Blue outline offset from the edge.
- **Disabled:** Hairline color and muted text, no filled surface.

### Inputs / Fields
- **Style:** Square Specimen Surface with a 1px strong hairline. Arabic text uses Kitab and `unicode-bidi: plaintext`; corpus selection uses a square mono select with an authored SVG chevron.
- **Focus:** The border turns Proof Blue and the surface becomes white; the caret is Proof Blue.
- **Metadata:** Source length, corpus role, and source-preservation notes sit outside fields in mono labels.

### Segmented Controls
- Equal-width square segments share one outer rule. The active segment becomes a solid Proof Blue field; hover uses Proof Blue Soft.
- The composition control names Prose and Poetry. The placement control names the three real styles: Simple, Naskh, and Nastaliq.

### Range Axes
- A 2px line uses Proof Blue up to the current value and Hairline after it. The thumb is an 18px blue circle. The label and tabular value sit above the axis.

### Navigation
- The brand and descriptor occupy the left of a 76px ruled header; project links and a blue-dot LIVE indicator sit on the right. On phones, only the brand and LIVE state remain.

### Measured Proof
- The proof is centered within its chosen measure and bounded by thin blue vertical rails with short end ticks. Axis metadata sits above, a ruled data strip sits below, and a vertical proof identifier may mark the outer edge on large screens.
- Prose fills one continuous measure. Poetry uses equal paired hemistich columns on wide screens and stacks every verse on narrow screens; the rails describe the overall proof field.

### Insertion Toggle
- A black-outlined pill contains a circular thumb. The enabled state turns the track blue and moves the thumb; its purpose is always stated in a neighboring mono label.

## Do's and Don'ts

### Do:
- **Do** give the Arabic proof enough space to be read before adding explanation.
- **Do** align metadata, controls, and ruled boundaries to the shared sheet grid.
- **Do** reserve Proof Blue for actions, measurement, focus, and active state.
- **Do** preserve source-safe language wherever users might confuse a visual insertion with text mutation.
- **Do** adapt the desktop split into a clear controls-then-proof sequence on phones.

### Don't:
- **Don't** add rounded cards, shadows, glass, gradients, or warm parchment effects.
- **Don't** use decorative color where a hairline, scale change, or ink weight can carry hierarchy.
- **Don't** reduce the Arabic proof to a preview thumbnail inside surrounding chrome.
- **Don't** use monospace as display decoration or replace authored SVG controls with Unicode icon glyphs.
- **Don't** introduce claims, metrics, or ornamental specimens that are not produced by the real tool.
