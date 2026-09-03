import { justifyArabic } from "./kashida.js";
import { contentWidth, measureTexts, typographyKey } from "./measure.js";

const poems = new WeakMap();
const SHATR = "[data-sadr], [data-ajz]";

function restoreProperty(style, name, value, priority) {
  if (value) style.setProperty(name, value, priority);
  else style.removeProperty(name);
}

export function layoutArabicPoem(
  poem,
  { gutterEm = 2.5, stretchEm = 0.25, observe = true } = {},
) {
  if (!(poem instanceof Element)) {
    throw new TypeError("layoutArabicPoem expects an Element");
  }

  const existing = poems.get(poem);
  if (existing) {
    existing.refresh();
    return existing;
  }

  const original = {
    layout: poem.getAttribute("data-layout"),
    columnWidth: poem.style.getPropertyValue("--ar-poem-column-width"),
    columnWidthPriority: poem.style.getPropertyPriority("--ar-poem-column-width"),
    gutter: poem.style.getPropertyValue("--ar-poem-gutter"),
    gutterPriority: poem.style.getPropertyPriority("--ar-poem-gutter"),
  };
  let controllers = [];
  let controllerElements = [];
  let destroyed = false;
  let frame;
  let observer;
  let observedWidth;
  let pendingForce = false;
  let renderKey;
  const resizeTarget = poem.parentElement || poem;
  let metrics = {
    layout: "stacked",
    availableWidth: 0,
    requiredWidth: 0,
    columnWidth: 0,
    gutterWidth: 0,
    markers: 0,
  };

  function clearControllers() {
    controllers.forEach((controller) => controller.destroy());
    controllers = [];
    controllerElements = [];
    renderKey = undefined;
  }

  function setStacked() {
    clearControllers();
    poem.dataset.layout = "stacked";
  }

  function refresh(force) {
    if (destroyed) return;

    const hemistichs = [...poem.querySelectorAll(SHATR)];
    if (!hemistichs.length) {
      setStacked();
      return;
    }

    const styles = getComputedStyle(hemistichs[0]);
    const texts = hemistichs.map((element) => element.textContent);
    const widths = measureTexts(hemistichs[0], styles, texts);
    const naturalColumnWidth = Math.max(...texts.map((text) => widths.get(text)));
    const fontSize = parseFloat(styles.fontSize);
    const preferredStretchWidth = stretchEm * fontSize;
    const gutterWidth = gutterEm * fontSize;

    // Measure the full layout box, not the narrower stacked presentation.
    poem.dataset.layout = "paired";
    const availableWidth = contentWidth(poem);
    const requiredWidth = naturalColumnWidth * 2 + gutterWidth;
    const paired = requiredWidth <= availableWidth + 0.5;
    const availableColumnWidth = (availableWidth - gutterWidth) / 2;
    const columnWidth = paired
      ? Math.min(
          Math.ceil(naturalColumnWidth + preferredStretchWidth),
          availableColumnWidth,
        )
      : Math.ceil(naturalColumnWidth);
    const stretchWidth = Math.max(0, columnWidth - naturalColumnWidth);
    const columnValue = `${columnWidth}px`;
    const gutterValue = `${gutterWidth}px`;

    if (poem.style.getPropertyValue("--ar-poem-column-width") !== columnValue) {
      poem.style.setProperty("--ar-poem-column-width", columnValue);
    }
    if (poem.style.getPropertyValue("--ar-poem-gutter") !== gutterValue) {
      poem.style.setProperty("--ar-poem-gutter", gutterValue);
    }
    poem.dataset.layout = paired ? "paired" : "stacked";

    if (paired) {
      const sameElements =
        controllerElements.length === hemistichs.length &&
        controllerElements.every((element, index) => element === hemistichs[index]);
      const nextRenderKey = `${columnWidth}\0${typographyKey(styles)}\0${texts.join("\0")}`;

      if (!sameElements) clearControllers();
      if (force || !sameElements || renderKey !== nextRenderKey) {
        controllers = hemistichs.map((element) =>
          justifyArabic(element, { justifyLastLine: true }),
        );
        controllerElements = hemistichs;
        renderKey = nextRenderKey;
      }

      if (hemistichs.some((element) => element.scrollWidth > element.clientWidth + 1)) {
        setStacked();
      }
    } else {
      setStacked();
    }

    metrics = {
      layout: poem.dataset.layout,
      availableWidth,
      requiredWidth,
      columnWidth,
      naturalColumnWidth,
      stretchWidth,
      preferredStretchWidth,
      gutterWidth,
      markers: poem.querySelectorAll("[data-ar-justify-kashida]").length,
    };
    poem.dispatchEvent(
      new CustomEvent("ar-poem-layout", { detail: { ...metrics } }),
    );
  }

  const controller = {
    refresh() {
      refresh(true);
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
      clearControllers();

      if (original.layout === null) poem.removeAttribute("data-layout");
      else poem.setAttribute("data-layout", original.layout);
      restoreProperty(
        poem.style,
        "--ar-poem-column-width",
        original.columnWidth,
        original.columnWidthPriority,
      );
      restoreProperty(
        poem.style,
        "--ar-poem-gutter",
        original.gutter,
        original.gutterPriority,
      );
      poems.delete(poem);
    },

    get layout() {
      return metrics.layout;
    },

    get metrics() {
      return { ...metrics };
    },
  };

  function scheduleRefresh(force = false) {
    if (destroyed) return;
    pendingForce ||= force;
    if (frame) return;

    frame = requestAnimationFrame(() => {
      frame = undefined;
      const force = pendingForce;
      pendingForce = false;
      refresh(force);
    });
  }

  poems.set(poem, controller);
  if (observe && "ResizeObserver" in window) {
    observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (observedWidth !== undefined && Math.abs(width - observedWidth) < 0.5) {
        return;
      }
      observedWidth = width;
      scheduleRefresh();
    });
    observedWidth = resizeTarget.getBoundingClientRect().width;
    observer.observe(resizeTarget);
  }
  poem.ownerDocument.fonts?.ready.then(() => scheduleRefresh(true));
  refresh(true);
  return controller;
}
