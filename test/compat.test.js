import assert from "node:assert/strict";
import test from "node:test";

test("loads safely without Intl.Segmenter", async () => {
  const descriptor = Object.getOwnPropertyDescriptor(Intl, "Segmenter");
  Object.defineProperty(Intl, "Segmenter", { configurable: true, value: undefined });

  try {
    const { builtinPatternSet, findKashidaPoints } = await import("../src/raqim.js");
    assert.deepEqual(findKashidaPoints("قال العالم", builtinPatternSet("naskh")), []);
  } finally {
    Object.defineProperty(Intl, "Segmenter", descriptor);
  }
});
