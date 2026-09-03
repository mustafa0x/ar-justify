import { contentWidth, measureTexts } from "./measure.js";

const MARKER = "data-ar-justify-kashida";
const TATWEEL = "ـ";
const MAX_TATWEELS_PER_WORD = 6;
const TATWEELS = Array.from(
  { length: MAX_TATWEELS_PER_WORD + 1 },
  (_, count) => TATWEEL.repeat(count),
);
const ZWNJ = "‌";
const ZWJ = "‍";
const segmenter = new Intl.Segmenter("ar", { granularity: "grapheme" });
const controllers = new WeakMap();

const arabicScript = /\p{Script_Extensions=Arabic}/u;
const letter = /\p{Letter}/u;
const mark = /\p{Mark}/u;
const format = /\p{Cf}/u;

// Joining masks derived from Unicode 17.0 DerivedJoiningType.txt.
// 1: joins the preceding character, 2: joins the following character.
const joiningRanges = [
  [0x0620, 0x0620, 3],
  [0x0622, 0x0625, 1],
  [0x0626, 0x0626, 3],
  [0x0627, 0x0627, 1],
  [0x0628, 0x0628, 3],
  [0x0629, 0x0629, 1],
  [0x062a, 0x062e, 3],
  [0x062f, 0x0632, 1],
  [0x0633, 0x063f, 3],
  [0x0640, 0x0640, 3],
  [0x0641, 0x0647, 3],
  [0x0648, 0x0648, 1],
  [0x0649, 0x064a, 3],
  [0x066e, 0x066f, 3],
  [0x0671, 0x0673, 1],
  [0x0675, 0x0677, 1],
  [0x0678, 0x0687, 3],
  [0x0688, 0x0699, 1],
  [0x069a, 0x06bf, 3],
  [0x06c0, 0x06c0, 1],
  [0x06c1, 0x06c2, 3],
  [0x06c3, 0x06cb, 1],
  [0x06cc, 0x06cc, 3],
  [0x06cd, 0x06cd, 1],
  [0x06ce, 0x06ce, 3],
  [0x06cf, 0x06cf, 1],
  [0x06d0, 0x06d1, 3],
  [0x06d2, 0x06d3, 1],
  [0x06d5, 0x06d5, 1],
  [0x06ee, 0x06ef, 1],
  [0x06fa, 0x06fc, 3],
  [0x06ff, 0x06ff, 3],
  [0x0750, 0x0758, 3],
  [0x0759, 0x075b, 1],
  [0x075c, 0x076a, 3],
  [0x076b, 0x076c, 1],
  [0x076d, 0x0770, 3],
  [0x0771, 0x0771, 1],
  [0x0772, 0x0772, 3],
  [0x0773, 0x0774, 1],
  [0x0775, 0x0777, 3],
  [0x0778, 0x0779, 1],
  [0x077a, 0x077f, 3],
  [0x0870, 0x0882, 1],
  [0x0883, 0x0886, 3],
  [0x0889, 0x088d, 3],
  [0x088e, 0x088e, 1],
  [0x088f, 0x088f, 3],
  [0x08a0, 0x08a9, 3],
  [0x08aa, 0x08ac, 1],
  [0x08ae, 0x08ae, 1],
  [0x08af, 0x08b0, 3],
  [0x08b1, 0x08b2, 1],
  [0x08b3, 0x08b8, 3],
  [0x08b9, 0x08b9, 1],
  [0x08ba, 0x08c8, 3],
  [0x10ec2, 0x10ec2, 1],
  [0x10ec3, 0x10ec4, 3],
  [0x10ec6, 0x10ec7, 3],
  [0x200d, 0x200d, 3],
];

// The project's seven-level placement table. Other connecting letters fall
// through to priority 7.
const priority2 = new Set("سص");
const priority3 = new Set("ةهد");
const priority4 = new Set("اآأإٱطلكکگ");
const priority5 = new Set("ريىی");
const priority6 = new Set("وعقف");
const alefs = new Set("اآأإٱ");

function joiningMask(codePoint) {
  let low = 0;
  let high = joiningRanges.length - 1;

  while (low <= high) {
    const middle = (low + high) >> 1;
    const [start, end, mask] = joiningRanges[middle];
    if (codePoint < start) high = middle - 1;
    else if (codePoint > end) low = middle + 1;
    else return mask;
  }

  return 0;
}

function edgeMask(text, fromEnd) {
  const characters = [...text];
  if (fromEnd) characters.reverse();

  for (const character of characters) {
    if (character === ZWNJ) return 0;
    const mask = joiningMask(character.codePointAt(0));
    if (mask) return mask;
    if (mark.test(character) || format.test(character)) continue;
    return 0;
  }

  return 0;
}

function baseCharacter(text) {
  return [...text].find(
    (character) =>
      character === TATWEEL ||
      (letter.test(character) && arabicScript.test(character)),
  );
}

function isArabicWordCluster(cluster) {
  return [...cluster].some(
    (character) =>
      character === TATWEEL ||
      character === ZWNJ ||
      character === ZWJ ||
      (letter.test(character) && arabicScript.test(character)),
  );
}

function segment(text) {
  return [...segmenter.segment(text)].map(({ segment: value, index }) => ({
    value,
    start: index,
    end: index + value.length,
    base: baseCharacter(value),
  }));
}

function getWords(clusters, text) {
  const words = [];
  let start = 0;

  while (start < clusters.length) {
    if (!isArabicWordCluster(clusters[start].value)) {
      start++;
      continue;
    }

    let end = start + 1;
    while (end < clusters.length && isArabicWordCluster(clusters[end].value)) {
      end++;
    }

    const first = clusters[start];
    const last = clusters[end - 1];
    words.push({
      clusters: clusters.slice(start, end),
      start: first.start,
      end: last.end,
      text: text.slice(first.start, last.end),
    });
    start = end;
  }

  return words;
}

function joins(left, right) {
  return Boolean(
    (edgeMask(left.value, true) & 2) &&
      (edgeMask(right.value, false) & 1),
  );
}

function form(joinedBefore, joinedAfter) {
  if (joinedBefore && joinedAfter) return "medial";
  if (joinedBefore) return "final";
  if (joinedAfter) return "initial";
  return "isolated";
}

function getOpportunities(word) {
  const { clusters } = word;
  const boundaries = clusters.slice(0, -1).map((cluster, index) =>
    joins(cluster, clusters[index + 1]),
  );
  const forms = clusters.map((_, index) =>
    form(boundaries[index - 1] || false, boundaries[index] || false),
  );
  const opportunities = [];

  for (let index = 0; index < boundaries.length; index++) {
    if (!boundaries[index]) continue;

    const left = clusters[index];
    const right = clusters[index + 1];
    if (!left.base || !right.base) continue;
    if (left.base === "ل" && alefs.has(right.base)) continue;

    let priority;
    let offset = left.end;
    if (left.value.includes(TATWEEL)) priority = 1;
    else if (priority2.has(left.base) && ["initial", "medial"].includes(forms[index])) {
      priority = 2;
    } else if (priority3.has(right.base) && forms[index + 1] === "final") {
      priority = 3;
    } else if (priority4.has(right.base) && forms[index + 1] === "final") {
      priority = 4;
    } else if (
      left.base === "ب" &&
      forms[index] === "medial" &&
      priority5.has(right.base) &&
      forms[index + 1] === "final"
    ) {
      priority = 5;
      offset = clusters[index - 1].end;
    } else if (priority6.has(right.base) && forms[index + 1] === "final") {
      priority = 6;
    } else if (forms[index + 1] === "final") {
      priority = 7;
    } else {
      continue;
    }

    opportunities.push({ offset, priority });
  }

  return opportunities.sort(
    (left, right) => left.priority - right.priority || right.offset - left.offset,
  );
}

function getTokens(text) {
  return [...text.matchAll(/\S+/gu)].map((match) => ({
    start: match.index,
    end: match.index + match[0].length,
  }));
}

function analyze(text) {
  const clusters = segment(text);
  const tokens = getTokens(text);
  const candidates = [];
  let tokenIndex = 0;

  for (const word of getWords(clusters, text)) {
    while (tokens[tokenIndex]?.end <= word.start) tokenIndex++;
    const token = tokens[tokenIndex];
    if (!token || token.start > word.start || token.end < word.end) continue;

    const opportunity = getOpportunities(word)[0];
    if (!opportunity) continue;

    const relativeOffset = opportunity.offset - word.start;
    candidates.push({
      ...opportunity,
      tokenIndex,
      variants: TATWEELS.map(
        (tatweels) =>
          word.text.slice(0, relativeOffset) +
          tatweels +
          word.text.slice(relativeOffset),
      ),
    });
  }

  return { candidates, tokens };
}

function textNodeSpans(element) {
  const walker = element.ownerDocument.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
  );
  const spans = [];
  let offset = 0;
  let node;

  while ((node = walker.nextNode())) {
    spans.push({ node, start: offset, end: offset + node.data.length });
    offset += node.data.length;
  }

  return spans;
}

function pointAt(spans, offset, startPoint) {
  let low = 0;
  let high = spans.length;

  while (low < high) {
    const middle = (low + high) >> 1;
    const end = spans[middle].end;
    if (startPoint ? end > offset : end >= offset) high = middle;
    else low = middle + 1;
  }

  const span = spans[low];
  if (
    span &&
    (startPoint
      ? span.start <= offset && offset < span.end
      : span.start < offset && offset <= span.end)
  ) {
    return [span.node, offset - span.start];
  }

  const last = spans.at(-1);
  if (!last) throw new Error("Cannot measure an element without text");
  return [last.node, last.node.data.length];
}

function groupRects(rects) {
  const lines = [];

  for (const rect of rects) {
    if (!rect.width || !rect.height) continue;
    const line = lines.at(-1);
    if (!line || Math.abs(line.top - rect.top) >= 1) {
      lines.push({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        candidates: [],
      });
    } else {
      line.left = Math.min(line.left, rect.left);
      line.right = Math.max(line.right, rect.right);
    }
  }

  return lines;
}

function findLine(lines, top) {
  let low = 0;
  let high = lines.length - 1;

  while (low <= high) {
    const middle = (low + high) >> 1;
    const difference = top - lines[middle].top;
    if (Math.abs(difference) < 1) return middle;
    if (difference < 0) high = middle - 1;
    else low = middle + 1;
  }

  return -1;
}

function detectLines(element, tokens) {
  const document = element.ownerDocument;
  const range = document.createRange();
  range.selectNodeContents(element);
  const lines = groupRects(range.getClientRects());

  if (lines.length <= 1) {
    return {
      lines,
      assignments: tokens.map(() => (lines.length ? "0" : "")),
      tokenLines: tokens.map(() => (lines.length ? 0 : -1)),
    };
  }

  const spans = textNodeSpans(element);
  const assignments = [];
  const tokenLines = [];

  for (const token of tokens) {
    const [startNode, startOffset] = pointAt(spans, token.start, true);
    const [endNode, endOffset] = pointAt(spans, token.end, false);
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);

    const indices = [];
    for (const rect of range.getClientRects()) {
      if (!rect.width || !rect.height) continue;
      const index = findLine(lines, rect.top);
      if (index >= 0 && indices.at(-1) !== index) indices.push(index);
    }

    assignments.push(indices.join(","));
    tokenLines.push(indices.length === 1 ? indices[0] : -1);
  }

  return { lines, assignments, tokenLines };
}

function removeMarkers(element) {
  if (element.firstElementChild) element.textContent = element.textContent;
}

function assertPlainText(element) {
  const invalid = [...element.childNodes].find(
    (node) =>
      node.nodeType !== Node.TEXT_NODE &&
      !(node.nodeType === Node.ELEMENT_NODE && node.hasAttribute(MARKER)),
  );
  if (invalid) throw new TypeError("justifyArabic only supports plain-text elements");
}

function insertMarkers(element, text, counts) {
  if (!counts.size) return;

  const document = element.ownerDocument;
  const fragment = document.createDocumentFragment();
  let start = 0;

  for (const [offset, count] of [...counts].sort(
    ([left], [right]) => left - right,
  )) {
    if (offset > start) fragment.append(text.slice(start, offset));
    const marker = document.createElement("span");
    marker.setAttribute(MARKER, TATWEELS[count]);
    marker.setAttribute("aria-hidden", "true");
    fragment.append(marker);
    start = offset;
  }

  if (start < text.length) fragment.append(text.slice(start));
  element.replaceChildren(fragment);
}

function sameLines(before, after) {
  return (
    before.lines.length === after.lines.length &&
    before.assignments.every(
      (assignment, index) => assignment === after.assignments[index],
    )
  );
}

function normalizeOptions(options = {}) {
  if (!options || typeof options !== "object") {
    throw new TypeError("justifyArabic options must be an object");
  }

  return { justifyLastLine: Boolean(options.justifyLastLine) };
}

export function justifyArabic(element, options) {
  if (!(element instanceof Element)) {
    throw new TypeError("justifyArabic expects an Element");
  }

  const existing = controllers.get(element);
  if (existing) {
    if (options !== undefined) existing.options = normalizeOptions(options);
    existing.controller.refresh();
    return existing.controller;
  }

  const record = { options: normalizeOptions(options), controller: null };
  const originalTextAlign = element.style.textAlign;
  const hadStyleAttribute = element.hasAttribute("style");
  let destroyed = false;
  let analyzedText;
  let analysis;

  const controller = {
    refresh() {
      if (destroyed) return;
      assertPlainText(element);
      const text = element.textContent;
      removeMarkers(element);
      element.style.textAlign = "start";

      try {
        if (!text.trim()) return;

        if (text !== analyzedText) {
          analyzedText = text;
          analysis = analyze(text);
        }

        const styles = getComputedStyle(element);
        const widthLimit = contentWidth(element, styles);
        const natural = detectLines(element, analysis.tokens);
        const { justifyLastLine } = record.options;

        if (
          natural.lines.length < (justifyLastLine ? 1 : 2) ||
          widthLimit <= 0
        ) {
          return;
        }

        const eligible = [];
        for (const candidate of analysis.candidates) {
          const lineIndex = natural.tokenLines[candidate.tokenIndex];
          if (
            lineIndex < 0 ||
            (!justifyLastLine && lineIndex === natural.lines.length - 1)
          ) {
            continue;
          }

          natural.lines[lineIndex].candidates.push({ ...candidate, count: 0 });
          eligible.push(...candidate.variants);
        }

        const widths = measureTexts(element, styles, eligible);
        const counts = new Map();
        const lines = justifyLastLine
          ? natural.lines
          : natural.lines.slice(0, -1);

        for (const line of lines) {
          let width = line.right - line.left;
          line.candidates.sort(
            (left, right) =>
              left.priority - right.priority || right.offset - left.offset,
          );

          for (let round = 1; round <= MAX_TATWEELS_PER_WORD; round++) {
            for (const candidate of line.candidates) {
              if (candidate.count !== round - 1) continue;
              const previousWidth = widths.get(candidate.variants[candidate.count]);
              const nextWidth = widths.get(candidate.variants[round]);
              const addedWidth = nextWidth - previousWidth;
              if (
                addedWidth <= 0 ||
                width + addedWidth > widthLimit - 0.5
              ) {
                continue;
              }

              candidate.count = round;
              counts.set(candidate.offset, round);
              width += addedWidth;
            }
          }
        }

        if (!counts.size) return;

        insertMarkers(element, text, counts);
        element.style.textAlign = "justify";
        if (
          !sameLines(natural, detectLines(element, analysis.tokens)) ||
          element.scrollWidth > element.clientWidth + 1
        ) {
          element.textContent = text;
        }
      } finally {
        element.style.textAlign = "justify";
      }
    },

    destroy() {
      if (destroyed) return;
      removeMarkers(element);
      if (originalTextAlign) element.style.textAlign = originalTextAlign;
      else element.style.removeProperty("text-align");
      if (!hadStyleAttribute && !element.getAttribute("style")) {
        element.removeAttribute("style");
      }
      controllers.delete(element);
      destroyed = true;
    },
  };

  record.controller = controller;
  controllers.set(element, record);
  try {
    controller.refresh();
  } catch (error) {
    controller.destroy();
    throw error;
  }
  return controller;
}
