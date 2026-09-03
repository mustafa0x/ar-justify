# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People working with Arabic text—typographers, designers, developers, and readers—who need to inspect or demonstrate kashida-based justification directly in a browser.

## Product Purpose

`ar-justify` is a small, dependency-free browser library and live demonstration tool for justifying Arabic prose and poetry with visual kashidas while preserving the canonical source text. Success means the effect is immediate, readable, adjustable, and safe to copy or remove.

## Positioning

The library analyzes Arabic joining behavior and applies prioritized Raqim-style insertion points without dependencies, WASM, document-wide mutation, or changes to `textContent`.

## Operating Context

Visitors choose from a compact Arabic-script test corpus or paste their own text, switch between prose and adaptive poetry composition, adjust the preview width and type size, choose a placement style, inspect inserted kashidas, restore the active sample, and copy the unchanged source. Developers may continue to the GitHub repository or install the package from npm.

## Capabilities and Constraints

- Preserve the existing static HTML/CSS/JavaScript stack and GitHub Pages deployment.
- Keep the existing live input, responsive preview, width and size controls, marker display, sample restore, and copy behavior.
- Demonstrate classical prose, vocalized Arabic, Persian, mixed-script text, and properly paired Arabic poetry.
- Expose `simple`, `naskh`, and `nastaliq` placement styles; `simple` remains the default.
- Modern browsers with `Intl.Segmenter`; horizontal plain-text content only.
- No dependencies, WASM, build step, rich-text editing, fabricated benchmarks, or commercial claims.
- Arabic text is right-to-left; surrounding product controls remain clear in English.

## Brand Commitments

The product name is `ar-justify`. Its voice is precise, restrained, and educational rather than promotional. Arabic typography itself is the primary evidence and must remain visually authoritative.

## Evidence on Hand

- Working library implementation in `src/index.js`, `src/raqim.js`, and `src/arabic-shaping.js`.
- Current live demo behavior and sample text in `index.html`.
- Poetry output sample at `assets/sample.png`.
- Technical documentation and verified capability claims in `README.md` and `HISTORY.md`.
- No testimonials, customer logos, usage figures, or benchmark claims are available and none should be invented.

## Product Principles

- Make the transformation visible without altering the source.
- Put Arabic readability ahead of decorative interface styling.
- Keep advanced calligraphic behavior explicit and understandable.
- Let visitors learn by manipulating a real result, not by reading claims.
- Preserve a lightweight, dependency-free path from demo to implementation.

## Accessibility & Inclusion

Maintain semantic controls, keyboard operation, visible focus, status announcements, adequate contrast, motion-reduction support, and correct RTL handling for Arabic content.
