# A proposal for native Arabic justification on the Web

This document sketches an author-facing CSS capability, required text semantics, implementation path, and standards strategy for native Arabic justification. For the typographic and software background behind it, see [A history of Arabic text justification](HISTORY.md).

A useful Web feature should not freeze one historical algorithm into CSS. It should define an author-facing preference, required semantics, and fallback behavior while leaving room for fonts and engines to improve.

## Minimum author capability

The smallest useful control would let an author say:

> Prefer cursive elongation for this justified Arabic text; use space expansion only as a fallback or residual mechanism.

Historically this was expressed as:

```css
text-justify: kashida;
```

Reviving that exact token is one option, but the important point is the semantic contract, not nostalgia for the old grammar. Alternatives could allow an ordered strategy or an explicit preference layered on `text-justify: auto`.

A first proposal should avoid an elaborate set of knobs. One dependable preference is more valuable than several underspecified strengths.

## A secondary blend control

The old `text-kashida-space` property recognized a real need: typography often benefits from a blend of elongation and moderate whitespace adjustment. A modern design might eventually expose a balance or maximum, but only after the basic strategy is interoperable.

Any blend control should avoid implying that “75%” has an obvious geometric meaning across fonts. Possible models include:

- a preference strength rather than a literal ratio;
- a maximum permitted inter-word expansion before elongation is required;
- a maximum elongation per opportunity or word;
- an ordered list of strategies;
- named quality presets whose exact realization remains font-sensitive.

These require experimentation. They should not block the first step.

## Required semantics

The specification and Web Platform Tests should require that layout-only elongation:

- does not mutate DOM text;
- is omitted from copied plain text;
- does not alter Find-in-page matching;
- does not add caret positions;
- is omitted from accessibility text;
- participates visually in selection highlighting;
- is represented correctly in printing and PDF output;
- is recomputed after font and layout changes;
- respects `lang`, directionality, grapheme clusters, and join controls.

These semantics are as important as the appearance. A browser feature that merely inserts U+0640 into text nodes would not be an acceptable implementation.

## Font- and shaper-aware realization

The specification should allow a range of implementations:

1. use JSTF or justification alternates when the font provides reliable data;
2. use variable-font or parametric expansion where available;
3. use shaping-engine safety metadata for fallback extenders;
4. distribute opportunities with script- and language-sensitive priorities;
5. retain modest inter-word adjustment for residual width;
6. fall back gracefully when the active font cannot support elongation well.

CSS should state the author's preference and observable behavior. It should not require every browser to insert the same number of U+0640 glyphs at the same code-point offsets.

## Language and style scope

A proposal must not define “Arabic” as one language-font pair. It should be reviewed against Arabic, Persian, Urdu, Kurdish, Uyghur, Jawi, and other Arabic-script use. It should also distinguish writing styles: a strategy suitable for Naskh may be inappropriate for Nastaliq or Ruqʿah.

The `lang` attribute and font's script/language systems can guide the engine. Authors may still need the ability to decline elongation in a particular design.

## Implementation and advocacy plan

The historical record suggests that a successful proposal needs more than a property name. It needs evidence, a small interoperable target, and tests that connect typography to Web semantics.

### 1. Write a focused use-case and requirements document

Start with concrete publishing scenarios:

- long-form Arabic reading pages;
- Qurʾanic and classical-text editions;
- newspapers and magazines;
- educational material;
- dictionaries and reference works;
- government and legal publishing;
- Arabic poetry, including paired hemistichs.

Show the same paragraphs under space-only justification and competent elongation. Explain why the former harms texture and reading rhythm rather than merely saying it looks unattractive.

The requirements document should distinguish:

- baseline functionality suitable for ordinary fonts;
- advanced functionality enabled by rich fonts;
- author control;
- font/shaper responsibilities;
- selection, copy, search, accessibility, and print semantics.

### 2. Build a public, reusable test corpus

A small open corpus will make browser work much easier. It should include:

- unvocalized Arabic prose;
- fully vocalized classical Arabic;
- Qurʾanic combining marks;
- Persian and Urdu samples;
- ZWJ, ZWNJ, and authored tatweels;
- mixed Arabic, Latin, numbers, and punctuation;
- short and long measures;
- lines with many and few valid opportunities;
- ordinary paragraphs and isolated justified lines;
- poetry as a separate layout use case.

Use redistributable fonts such as Amiri, Noto Naskh Arabic, and Scheherazade New, and include reference images reviewed by qualified Arabic typographers. Record the font version, browser version, width, size, language, and expected fallback.

### 3. Separate safety from quality

A tractable browser milestone could begin with:

- shaping-engine-confirmed safe opportunities;
- a conservative priority policy;
- one elongation pass across words;
- residual space expansion;
- no source-text mutation.

That would not reproduce master calligraphy, but it could be substantially better than extreme word spaces. Richer JSTF, `jalt`, and variable-font behavior can follow.

This staged model makes implementation review easier: first ensure that the browser never breaks joining or semantics, then improve typographic ranking.

### 4. File aligned issues in the right venues

The work crosses several communities:

- [W3C Arabic and Persian Layout Requirements](https://github.com/w3c/alreq) for script requirements and terminology;
- [CSS Working Group](https://github.com/w3c/csswg-drafts) for author-facing properties and normative behavior;
- [Web Platform Tests](https://github.com/web-platform-tests/wpt) for interoperable tests;
- Chromium, Gecko, and WebKit issue trackers for implementation prototypes;
- HarfBuzz and font-tool communities for shaping metadata and font support.

Open issues should link to one canonical explainer and test corpus rather than repeating slightly different proposals. Cross-reference the historical CSS3 Text design, but do not ask implementers to restore it verbatim without addressing the last two decades of shaping and semantics work.

### 5. Ask for a preference, not pixel-identical output

Browser vendors will reasonably resist a requirement that every engine and font produce identical elongation geometry. CSS rarely promises that for text shaping.

The proposal should instead define:

- when the author has requested elongation-preferred justification;
- the required fallback order at a high level;
- which text and accessibility semantics must remain invariant;
- that unsafe joining changes are forbidden;
- that extreme inter-word spacing should be avoided when suitable elongation is available.

Reference rendering tests can use tolerances and invariants—no overflow, no broken joins, no altered source—alongside a smaller set of exact tests for property parsing and computed values.

### 6. Produce a browser prototype

A prototype in one engine would clarify the architecture:

1. line breaker computes a deficit;
2. shaping layer returns safe or preferred opportunities;
3. formatter distributes expansion across words;
4. shaper produces the final glyph sequence;
5. selection and hit testing map the extra glyph geometry to adjacent source positions;
6. clipboard and accessibility expose only source characters.

The prototype should compare:

- ordinary OpenType fonts with no JSTF data;
- a font with `jalt` or useful alternates;
- a parametric or variable demonstration font;
- fallback behavior when no safe opportunity exists.

### 7. Turn semantics into Web Platform Tests early

Tests should cover more than screenshots. Useful assertions include:

- `element.textContent` is unchanged;
- copied plain text is unchanged;
- Find-in-page crosses a visually elongated connection;
- selection painting covers the extension;
- DOM range offsets remain source offsets;
- layout recomputes after a web font loads;
- changing container width removes obsolete elongation;
- ZWNJ boundaries are never elongated;
- combining marks remain attached to their base;
- print output matches screen layout within expected pagination differences.

These are exactly the places where a JavaScript polyfill reveals platform limitations.

### 8. Demonstrate sustained demand

The strongest historical argument is continuity:

- Arabic typography has always required line fitting beyond space expansion;
- mechanized systems have automated it since at least the 1960s;
- Word has preserved multiple kashida modes for more than twenty years;
- Internet Explorer and CSS3 Text already exposed a Web-facing model;
- modern specialist systems prove higher-quality approaches;
- authors continue to seek workarounds and publish JavaScript libraries because the native gap remains.

Collecting endorsements and real production examples from publishers, Arabic type designers, educational platforms, Qurʾanic projects, and accessibility experts will make the feature harder to dismiss as decorative.

### 9. Keep the initial CSS proposal small

A credible first proposal might contain only:

- one elongation-preferred `text-justify` value or companion preference;
- a defined fallback to inter-word expansion;
- language-sensitive behavior;
- source-preserving selection/copy/search semantics;
- explicit non-goals for exact glyph geometry and advanced font controls.

Once two engines can implement and test that core, the group can consider blend controls, maximum expansion, font-feature interaction, and more advanced style selection.

## Open design questions

Several questions deserve experiments rather than confident answers:

1. Should the author preference be a new `text-justify` value, a companion property, or an ordered strategy list?
2. Should `auto` be strengthened for Arabic even without a new author control?
3. How should a browser choose between JSTF, `jalt`, variable-font axes, and fallback extenders?
4. What is the best cross-font limit on elongation: glyph count, physical width, em units, or font-provided constraints?
5. Should the browser expose named strength levels similar to Word, or leave strength entirely to the font and UA?
6. How should `text-align-last` interact with isolated Arabic lines and poetry?
7. How should elongation work across inline element boundaries without changing shaping?
8. What selection geometry should a layout-only extender map to when the user drags through it?
9. How should browser devtools expose layout-only justification glyphs?
10. Can paragraph-wide optimum breaking be introduced incrementally without making ordinary layout prohibitively expensive?

These questions are reasons to prototype, not reasons to leave the feature undefined indefinitely.
