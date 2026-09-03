const CACHE_LIMIT = 4096;
const caches = new WeakMap();
const STYLE_PROPERTIES = [
  "direction",
  "font",
  "fontFeatureSettings",
  "fontKerning",
  "fontOpticalSizing",
  "fontVariationSettings",
  "letterSpacing",
  "textRendering",
  "wordSpacing",
];

export function contentWidth(element, styles = getComputedStyle(element)) {
  return (
    element.clientWidth -
    parseFloat(styles.paddingLeft) -
    parseFloat(styles.paddingRight)
  );
}

export function typographyKey(styles) {
  return STYLE_PROPERTIES.map((property) => styles[property]).join("\0");
}

function getCache(document) {
  let cache = caches.get(document);
  if (cache) return cache;

  cache = new Map();
  caches.set(document, cache);
  document.fonts?.addEventListener?.("loadingdone", () => cache.clear());
  document.fonts?.addEventListener?.("loadingerror", () => cache.clear());
  return cache;
}

export function measureTexts(element, styles, texts) {
  const unique = [...new Set(texts)];
  if (!unique.length) return new Map();

  const document = element.ownerDocument;
  const lang = element.closest("[lang]")?.lang || "";
  const prefix = `${lang}\0${typographyKey(styles)}\0`;
  const cache = getCache(document);
  let missing = unique.filter((text) => !cache.has(prefix + text));

  if (cache.size + missing.length > CACHE_LIMIT) {
    cache.clear();
    missing = unique;
  }

  if (missing.length) {
    const tester = document.createElement("span");
    tester.lang = lang;
    Object.assign(tester.style, {
      all: "initial",
      contain: "layout style paint",
      direction: styles.direction,
      display: "block",
      font: styles.font,
      fontFeatureSettings: styles.fontFeatureSettings,
      fontKerning: styles.fontKerning,
      fontOpticalSizing: styles.fontOpticalSizing,
      fontVariationSettings: styles.fontVariationSettings,
      left: "-100000px",
      letterSpacing: styles.letterSpacing,
      position: "fixed",
      textRendering: styles.textRendering,
      visibility: "hidden",
      whiteSpace: "nowrap",
      wordSpacing: styles.wordSpacing,
    });

    const samples = missing.map((text) => {
      const sample = document.createElement("span");
      sample.textContent = text;
      sample.style.display = "inline-block";
      tester.append(sample);
      return sample;
    });

    document.body.append(tester);
    missing.forEach((text, index) => {
      cache.set(prefix + text, samples[index].getBoundingClientRect().width);
    });
    tester.remove();
  }

  return new Map(unique.map((text) => [text, cache.get(prefix + text)]));
}
