import assert from "node:assert/strict";
import test from "node:test";
import * as api from "../src/index.js";

test("exports the public API", () => {
  assert.deepEqual(Object.keys(api), ["justifyArabic", "layoutArabicPoem"]);
  assert.equal(typeof api.justifyArabic, "function");
  assert.equal(typeof api.layoutArabicPoem, "function");
});
