import assert from "node:assert/strict";
import test from "node:test";
import {
  builtinPatternSet,
  compilePatternText,
  findKashidaPoints,
  formOf,
  joiningInfo,
  splitGraphemes,
} from "../src/raqim.js";

function points(text, patterns) {
  return findKashidaPoints(text, patterns).map(({ offset, priority }) => [
    offset,
    priority,
  ]);
}

function builtin(style, text) {
  return points(text, builtinPatternSet(style));
}

test("uses Unicode joining types and groups", () => {
  assert.equal(joiningInfo("ب").type, 3);
  assert.equal(joiningInfo("ا").type, 1);
  assert.equal(joiningInfo("ء").type, 0);
  assert.equal(joiningInfo("ـ").type, 4);
  assert.equal(joiningInfo("ک").type, 3);
});

test("derives positional forms", () => {
  const graphemes = splitGraphemes("بنت");
  assert.equal(formOf(graphemes, 0), "initial");
  assert.equal(formOf(graphemes, 1), "medial");
  assert.equal(formOf(graphemes, 2), "final");
  assert.equal(formOf(splitGraphemes("ب"), 0), "isolated");
});

test("returns JavaScript offsets after complete grapheme clusters", () => {
  assert.deepEqual(builtin("simple", "سَلام"), [[2, 8]]);
});

test("honors ZWNJ and ZWJ", () => {
  const patterns = compilePatternText("ب2ت");
  assert.deepEqual(points("ب‌ت", patterns), []);
  assert.deepEqual(points("ب‍ت", patterns), [[2, 2]]);
  assert.deepEqual(points("ب‍‌ت", patterns), []);
});

test("the last matching rule wins", () => {
  assert.deepEqual(points("بت", compilePatternText("ب2ت\nب5ت")), [[1, 5]]);
  assert.deepEqual(points("بت", compilePatternText("ب5ت\nب2ت")), [[1, 2]]);
  assert.deepEqual(points("بت", compilePatternText("ب5ت\nب!ت")), []);
});

test("supports length-dependent priorities", () => {
  const patterns = compilePatternText("[:4:]ب6\\3ت");
  assert.deepEqual(points("بت", patterns), [[1, 4]]);
  assert.deepEqual(points("بتن", patterns), [[1, 5]]);
  assert.deepEqual(points("بتنن", patterns), [[1, 6]]);
  assert.deepEqual(points("بتننن", patterns), [[1, 5]]);
  assert.deepEqual(points("بتننننن", patterns), [[1, 3]]);
});

test("folds joining groups by positional rasm", () => {
  const patterns = compilePatternText("@Beh 5 ت");
  assert.deepEqual(points("بت", patterns), [[1, 5]]);
  assert.deepEqual(points("نت", patterns), [[1, 5]]);
  assert.deepEqual(points("بنت", patterns), [[2, 5]]);
  assert.deepEqual(points("صت", patterns), []);
});

test("exact group references do not fold", () => {
  const patterns = compilePatternText("=Beh 5 ت");
  assert.deepEqual(points("بت", patterns), [[1, 5]]);
  assert.deepEqual(points("نت", patterns), []);
});

test("simple patterns reproduce the Microsoft-style priorities", () => {
  assert.deepEqual(builtin("simple", "سـلام"), [[1, 8], [2, 9]]);
  assert.deepEqual(builtin("simple", "سلام"), [[1, 8]]);
  assert.deepEqual(builtin("simple", "بدر"), [[1, 7]]);
  assert.deepEqual(builtin("simple", "با"), [[1, 6]]);
  assert.deepEqual(builtin("simple", "عبر"), [[1, 5], [2, 3]]);
  assert.deepEqual(builtin("simple", "بو"), [[1, 4]]);
  assert.deepEqual(builtin("simple", "تم"), [[1, 3]]);
});

test("built-ins suppress lam-alef", () => {
  assert.deepEqual(builtin("simple", "لا"), []);
  assert.deepEqual(builtin("naskh", "لا"), []);
});

test("naskh implements its priority matrix", () => {
  assert.deepEqual(builtin("naskh", "بط"), [[1, 7]]);
  assert.deepEqual(builtin("naskh", "مبط"), [[2, 8]]);
  assert.deepEqual(builtin("naskh", "ممبط"), [[1, 3], [3, 9]]);
  assert.deepEqual(builtin("naskh", "مممبط"), [[1, 2], [2, 2], [4, 8]]);
  assert.deepEqual(builtin("naskh", "بحه"), [[2, 9]]);
  assert.deepEqual(builtin("naskh", "سعي"), []);
});

test("nastaliq applies its naskh overrides", () => {
  assert.deepEqual(builtin("naskh", "يهتم"), [[1, 6], [2, 6], [3, 6]]);
  assert.deepEqual(builtin("nastaliq", "يهتم"), [[2, 6], [3, 6]]);
  assert.deepEqual(builtin("naskh", "سقتم"), [[1, 3], [3, 6]]);
  assert.deepEqual(builtin("nastaliq", "سقتم"), [[3, 6]]);
});
