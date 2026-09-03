import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (await readFile(new URL("../kashida.js", import.meta.url), "utf8")).replace(/^import .*?;\n\n/, "");
const testSource = `${source}\nexport { getOpportunities, getWords, joiningMask, segment };`;
const moduleUrl = `data:text/javascript;base64,${Buffer.from(testSource).toString("base64")}`;
const { getOpportunities, getWords, joiningMask, segment } = await import(moduleUrl);

function opportunities(text) {
  const clusters = segment(text);
  const [word] = getWords(clusters, text);
  return word ? getOpportunities(word) : [];
}

test("uses Unicode joining behavior", () => {
  assert.equal(joiningMask("ب".codePointAt(0)), 3);
  assert.equal(joiningMask("ا".codePointAt(0)), 1);
  assert.equal(joiningMask("ء".codePointAt(0)), 0);
  assert.equal(joiningMask("ـ".codePointAt(0)), 3);
  assert.equal(joiningMask("ک".codePointAt(0)), 3);
});

test("rejects non-joining and lam-alef boundaries", () => {
  assert.deepEqual(opportunities("دار"), []);
  assert.deepEqual(opportunities("لا"), []);
  assert.deepEqual(opportunities("لَا"), []);
});

test("keeps marks attached to their base character", () => {
  assert.equal(segment("سَلام")[0].value, "سَ");
  assert.deepEqual(opportunities("سَلام"), [{ offset: 2, priority: 2 }]);
});

test("honors ZWNJ only at the boundary it breaks", () => {
  const offsets = opportunities("می‌خواهم").map(({ offset }) => offset);
  assert.ok(offsets.includes(1));
  assert.ok(!offsets.includes("می‌".length));
});

test("implements the seven project priorities", () => {
  assert.equal(opportunities("سـلام")[0].priority, 1);
  assert.equal(opportunities("سلام")[0].priority, 2);
  assert.equal(opportunities("بدر")[0].priority, 3);
  assert.equal(opportunities("با")[0].priority, 4);
  assert.deepEqual(opportunities("عبر")[0], { offset: 1, priority: 5 });
  assert.equal(opportunities("بو")[0].priority, 6);
  assert.equal(opportunities("تم")[0].priority, 7);
});

test("does not treat a standalone join control as a glyph", () => {
  assert.deepEqual(opportunities("‍ب"), []);
});
