# Balanced prose line breaking

## Status

Planned. The current public behavior remains unchanged: `justifyArabic()` accepts the browser's line breaks and adds visual kashidas without allowing those breaks to move.

## Problem

Browsers normally choose line breaks greedily. `ar-justify` then detects those lines and allocates kashidas inside them. This preserves line stability, but a locally valid early break can leave a very short final line.

The vocalized demo sample at the current desktop measure demonstrates the failure:

- browser wrapping: 13 / 12 / 3 words;
- CSS balanced wrapping in Chromium: 10 / 9 / 9 words.

The demo must not conceal this by justifying the final prose line. Arabic Layout Requirements states that the lines of a justified paragraph meet the measure except for the final line. Poetry and explicitly requested single-line fitting remain separate cases.

## Goal

Add an opt-in, paragraph-level line breaker that considers the whole paragraph before allocating kashidas. It should avoid pathological final lines while preserving the library's existing source, copying, rendering, refresh, teardown, and performance guarantees.

Proposed API:

```js
justifyArabic(element, {
  style: "simple",
  lineBreaking: "balanced", // "browser" | "balanced"
});
```

`"browser"` remains the default for compatibility. The option name and values should be confirmed before making the API public.

## Non-goals

The first version will not:

- hyphenate Arabic or split words;
- implement font-specific OpenType `JSTF`, `jalt`, or variable-font justification;
- alter authored U+0640 tatweels;
- support rich text or `contenteditable`;
- replace `layoutArabicPoem()`;
- guarantee identical breaks across different fonts or browser shaping engines;
- add a runtime dependency, WASM module, worker, or asynchronous initialization step.

## Findings

### CSS balancing is useful but insufficient

`text-wrap: balance` proves that reselecting the breakpoints fixes the example, and it preserves source text. It is not a complete library solution:

- Chromium limits balancing to six lines and Firefox to ten lines;
- CSS permits user agents to treat longer content as ordinary wrapping;
- the exact balancing algorithm is user-agent-defined;
- Chromium balances by searching for a narrower effective measure, without knowing Raqim priorities or kashida capacity;
- inserting kashidas changes inline widths and can make the browser rebalance a second time;
- the current `sameLines()` safety check then removes markers, correctly refusing an unstable result;
- `text-wrap: pretty` did not improve the reproduced 13 / 12 / 3 case in Chromium.

Use native balancing as a reference and test oracle for short paragraphs, not as the core implementation.

### Paragraph optimization is established practice

A Knuth–Plass-style line breaker models words as fixed boxes, spaces as stretchable or shrinkable glue, and legal breaks as penalties. Dynamic programming chooses the lowest-cost path through all legal breakpoints rather than committing to each line greedily.

For Arabic, prospective-line cost must include more than spaces:

- natural shaped width;
- available Raqim kashida points;
- pattern priority and placement style;
- finite measured width for one through six tatweels at each point;
- distribution rounds, so one connection is not exhausted before others participate;
- remaining inter-word expansion;
- repeated or weak elongation penalties;
- line-to-line density changes;
- a penalty for an excessively short final line.

W3C Arabic Layout Requirements recommends combining available mechanisms and warns that excessive spaces or kashidas create uneven text color.

References:

- [CSS Text Level 4: `text-wrap-style: balance`](https://drafts.csswg.org/css-text-4/#valdef-text-wrap-style-balance)
- [MDN: `text-wrap-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap-style)
- [Chrome's balancing implementation](https://developer.chrome.com/docs/css-ui/css-text-wrap-balance)
- [W3C Arabic Layout Requirements: text alignment and justification](https://www.w3.org/TR/alreq/#h_alignment)
- [DigitalKhatt LuaLaTeX package](https://github.com/DigitalKhatt/lualatexpackage), which combines TeX line breaking with post-line-break Arabic reshaping and justification

## Design

### 1. Separate planning from DOM rendering

Keep paragraph planning pure and deterministic. A private planner should receive measured tokens and return source offsets at which visual lines end.

Suggested internal shape:

```js
planBalancedLines({
  tokens,
  targetWidth,
  greedyLineCount,
  evaluateLine,
});
```

The planner should not access `Element`, `Range`, or global browser state. This allows exhaustive unit tests with synthetic metrics.

### 2. Reuse the existing analysis and measurement work

`src/index.js` already provides the necessary primitives:

- `getTokens()` records UTF-16 source offsets;
- `analyze()` associates Raqim candidates with tokens;
- `measureTexts()` batches and caches shaped widths by typography;
- candidate `variants` represent zero through six tatweels;
- the existing allocator supplies the distribution order.

Refactor only enough to let prospective lines share these measurements. Do not introduce a second Arabic analyzer or candidate-ranking implementation.

Measure each distinct word, source gap, and candidate variant once. Use prefix sums for natural line width so evaluating a token range does not repeatedly measure complete substrings.

### 3. Establish the line count

First detect the browser's ordinary greedy line count for each authored paragraph. The initial balanced implementation should keep that count fixed.

Reasons:

- it prevents balancing from making the paragraph unexpectedly taller;
- it matches the CSS balancing requirement for short blocks;
- it bounds the dynamic-programming state;
- it keeps pagination and surrounding layout more stable.

A later version may evaluate adjacent line counts, but only with an explicit policy and tests.

### 4. Evaluate prospective lines

For every feasible token range:

1. Compute its natural shaped width.
2. Reject non-final lines that already exceed the target measure.
3. Gather the Raqim candidates contained entirely in the range.
4. Simulate the round-based allocator to estimate useful kashida expansion without overflow.
5. Compute the width still owed to inter-word spacing.
6. Assign a badness score.

The score should increase sharply for:

- large per-space expansion;
- using low-quality candidate points when stronger layouts exist;
- high tatweel rounds at one connection;
- adjacent lines with very different expansion profiles;
- a final line below the accepted fullness range;
- a one-word or otherwise visibly orphaned final line.

The final line remains ragged and receives no requirement to reach the measure. Its score only influences where earlier lines break.

Avoid encoding aesthetic thresholds before collecting examples. Start with named constants, a representative corpus, and snapshot the selected break offsets so tuning remains deliberate.

### 5. Select breaks with dynamic programming

Use a shortest-path/dynamic-programming pass over token boundaries. A state should minimally include:

- next token index;
- number of lines already committed;
- previous line's fitness class, if abrupt density changes are penalized.

Memoize prospective-line evaluations by start and end token. Prune an end position once natural width exceeds the measure and adding more tokens cannot make it fit.

Expected complexity is quadratic in the worst case, but the width-based pruning window should keep ordinary paragraphs much smaller. Establish benchmarks before setting a hard performance budget.

### 6. Freeze the selected visual lines without changing source text

The browser must not be allowed to greedily recompute the planner's selected breaks after kashidas are inserted.

Promising representation:

```html
<span data-ar-justify-line>first source slice</span>
<!-- the exact authored whitespace remains here -->
<span data-ar-justify-line>second source slice</span>
```

Generated line spans can be full-width inline blocks. The exact source whitespace between them remains as text nodes. This has three useful properties in an initial browser experiment:

- the parent element's `textContent` remains byte-for-byte equivalent at the JavaScript string level;
- selecting the rendered parent preserved the original separating space;
- each generated line can use the existing one-line kashida allocator independently.

This representation is not approved until browser tests cover repeated spaces, tabs, explicit newlines, bidi runs, punctuation, selection, clipboard serialization, accessibility trees, and printing.

Do not use generated `<br>` elements: although they do not change `textContent`, browser selection serializes them as newlines and would violate source-preserving copy behavior.

### 7. Preserve hard paragraph boundaries

Treat authored newline sequences as forced boundaries. Plan each paragraph independently, then restore the exact original newline text between generated groups.

Whitespace behavior must remain consistent with the element's computed `white-space` mode. If an exact source-preserving wrapper representation cannot reproduce a supported whitespace mode, balanced breaking should fall back to `"browser"` rather than silently alter content.

### 8. Apply kashidas after breaks are fixed

Once wrappers represent the selected lines:

- justify every non-final prose line;
- leave the final prose line natural;
- honor `justifyLastLine: true` only when the caller explicitly requests it;
- retain `simple`, `naskh`, and `nastaliq` candidate behavior exactly;
- keep marker spans empty and `aria-hidden`;
- retain overflow and line-stability checks within each wrapper.

### 9. Refresh and teardown

A balanced controller must own both generated line wrappers and their child justification controllers.

On `refresh()`:

1. recover the canonical source string;
2. remove generated lines and markers;
3. reuse text analysis when source and style are unchanged;
4. remeasure only when typography or width requires it;
5. replan and render once.

On `destroy()`:

- restore one canonical text node;
- restore every inline style changed by the controller;
- remove all generated line and marker elements;
- preserve the existing controller idempotency guarantees.

## Tests

### Pure planner tests

Add deterministic tests for:

- the greedy-orphan shape selecting a less pathological final line;
- exact expected break offsets, not merely line counts;
- fixed line-count behavior;
- hard breaks creating independent planning groups;
- final-line penalty not forcing every line to equal natural width;
- candidate capacity changing the selected break;
- stronger Raqim opportunities beating an otherwise similar weak layout;
- no feasible improved path returning the greedy plan;
- one-line and empty input;
- long unbreakable tokens;
- mixed Arabic, Latin text, punctuation, and numbers.

### Browser integration tests

Verify in a real browser that:

- `textContent` is unchanged before justification, after justification, after refresh, and after destroy;
- selected and copied plain text equals the source exactly;
- no generated line overflows;
- planned break assignments survive marker insertion;
- resizing replans deterministically;
- font loading invalidates affected measurements;
- `simple`, `naskh`, and `nastaliq` all preserve planned breaks;
- explicit multiple spaces and newlines survive;
- bidi mixed-script content remains in logical order;
- the accessibility tree does not announce generated structure or tatweels;
- default `lineBreaking: "browser"` output remains unchanged.

### Visual corpus

Exercise at least:

- the current classical and vocalized Arabic samples;
- short, medium, and long prose;
- paragraphs ending with one short word, several short words, and a long word;
- Persian and mixed-script samples;
- narrow and wide measures;
- vocalized and unvocalized text;
- fonts with materially different tatweel widths.

Record before/after line assignments, kashida rounds, remaining space expansion, and total planning time. Screenshots supplement assertions; they do not replace them.

## Delivery sequence

1. Add the pure planner contract and synthetic failing tests.
2. Add measured prospective-line scoring without changing public rendering.
3. Implement dynamic programming and validate break offsets against the corpus.
4. Prototype source-preserving line wrappers behind a private flag.
5. Add clipboard, selection, accessibility, whitespace, and teardown browser tests.
6. Expose the opt-in public option and document it.
7. Enable balanced prose in the live demo only after the library path passes all invariants.
8. Benchmark resize, repeated refresh, and long paragraphs before release.

## Acceptance criteria

The feature is ready when:

- the reproduced short-final-line case is materially improved without increasing its line count;
- the final prose line remains natural rather than forcibly justified;
- line selection incorporates measured kashida capacity and style priorities;
- canonical source, `textContent`, selection, and copied text remain exact;
- explicit hard breaks and whitespace remain exact;
- marker insertion cannot change the selected breaks;
- overflow prevention, refresh, destroy, poetry behavior, and default behavior do not regress;
- the implementation remains synchronous and dependency-free;
- corpus results and performance are documented with reproducible tests.

## Open decisions

Resolve these from corpus results rather than intuition:

- the final public option name;
- the minimum desirable final-line fullness;
- how strongly to penalize a weak candidate versus additional word-space expansion;
- whether adjacent-line fitness classes materially improve Arabic text color;
- whether balanced mode should ever add or remove a line;
- which computed `white-space` modes can be supported without compromising source fidelity;
- whether native `text-wrap: balance` is useful as an optional short-paragraph fast path once breaks are frozen.
