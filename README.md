# ar-justify

A small, dependency-free browser library for Arabic kashida justification. It supports ordinary prose and adaptive two-column poetry while keeping the source text unchanged.

![Arabic poetry justified into balanced columns](https://raw.githubusercontent.com/mustafa0x/ar-justify/main/assets/sample.png)

[Try the live Arabic text justifier](https://mustafa0x.github.io/ar-justify/) with prose, poetry, or any plain text.

For the background—from manuscript practice and mechanized composition through Microsoft Word, Internet Explorer, early CSS proposals, and the modern browser gap—see [A history of Arabic text justification](HISTORY.md).

## Install

```sh
npm install ar-justify
```

Import the JavaScript and the single stylesheet:

```js
import { justifyArabic, layoutArabicPoem } from "ar-justify";
import "ar-justify/style.css";
```

## Prose

```html
<p id="text" dir="rtl">
  قال العالم لتلميذه إن حسن الكلام ليس في كثرته، ولكن في وضوح معناه.
</p>
```

```js
const controller = justifyArabic(document.querySelector("#text"));

controller.refresh(); // after changing text, width, font, or font size
controller.destroy(); // removes generated markers and restores text-align
```

The final visual line is left natural by default. To justify a single line or the final line too:

```js
justifyArabic(element, { justifyLastLine: true });
```

Candidate placement uses the `simple` style by default. Choose a calligraphic pattern set when the typeface calls for it:

```js
justifyArabic(element, {
  style: "naskh", // "simple" | "naskh" | "nastaliq"
});
```

The analyzer is a JavaScript port of [Raqim Kashida](https://github.com/aliftype/raqim-kashida). It returns every matching insertion point and prioritizes them using Raqim's built-in patterns. `simple` follows newspaper and Microsoft-style rules, while `naskh` and `nastaliq` apply their respective calligraphic rules.

## Poetry

Represent each verse as an explicit pair of hemistichs:

```html
<div id="poem" data-ar-poem data-layout="stacked" dir="rtl">
  <div data-bayt>
    <span data-sadr>عَلَى قَدْرِ أَهْلِ العَزْمِ تَأْتِي العَزَائِمُ</span>
    <span data-ajz>وَتَأْتِي عَلَى قَدْرِ الكِرَامِ المَكَارِمُ</span>
  </div>

  <div data-bayt>
    <span data-sadr>وَتَعْظُمُ فِي عَيْنِ الصَّغِيرِ صِغَارُهَا</span>
    <span data-ajz>وَتَصْغُرُ فِي عَيْنِ العَظِيمِ العَظَائِمُ</span>
  </div>
</div>
```

```js
const controller = layoutArabicPoem(document.querySelector("#poem"));

controller.refresh();
controller.destroy();
```

The poetry adapter:

- measures the longest natural hemistich;
- uses equal-width paired columns while every hemistich still fits;
- reduces optional stretch before abandoning the paired layout;
- stacks the entire poem when two columns no longer fit;
- observes container resizes by default.

Its small option set is:

```js
layoutArabicPoem(poem, {
  gutterEm: 2.5,
  stretchEm: 0.25,
  observe: true,
  style: "simple",
});
```

Set `observe: false` when the application owns refresh timing. The controller exposes read-only `layout` and `metrics` properties.

## Performance

Text analysis is reused while the source is unchanged. Widths are measured in batches, cached by typography, and cleared when fonts finish loading. The poetry observer coalesces resizes into one animation frame and skips refitting when its effective column width did not change.

For long readers, initialize only the rendered pages and call `refresh()` only after a real text, width, or typography change.

## Scope

- Modern browsers with `Intl.Segmenter`; grapheme boundaries follow the browser's Unicode version
- Pinned Unicode 17 joining data and Raqim's Arabic pattern sets
- Horizontal, plain-text elements only
- No dependencies, WASM, or build step
- No document scanning or global mutation observer
- No rich text or `contenteditable` support

Visible elongations are rendered by empty, `aria-hidden` marker elements. They are not inserted into `textContent`, copied text, or the canonical source string.

## Development

```sh
npm test
npm pack
```
