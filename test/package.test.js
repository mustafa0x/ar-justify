import assert from "node:assert/strict";
import test from "node:test";
import { justifyArabic, layoutArabicPoem } from "../src/index.js";

test("exports the public API", () => {
  assert.equal(typeof justifyArabic, "function");
  assert.equal(typeof layoutArabicPoem, "function");
});
