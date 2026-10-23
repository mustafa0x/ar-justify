import assert from "node:assert/strict";
import test from "node:test";
import { groupRects, withoutRects } from "../src/lines.js";

function rect(left, top, width, height) {
  return { left, top, width, height, right: left + width, bottom: top + height };
}

// One hemistich with a marker after the first letters, as measured in each browser.
const firefox = {
  marker: rect(1003.4, 1422.32, 4.4, 33),
  rects: [
    rect(995.9, 1420.32, 7.5, 47),
    rect(1003.4, 1422.32, 4.4, 33),
    rect(755.5, 1420.32, 240.4, 47),
  ],
};
const chrome = {
  marker: rect(992.9, 1422.67, 4.4, 31),
  rects: [
    rect(985.4, 1422.67, 7.5, 31),
    rect(992.9, 1422.67, 4.4, 31),
    rect(761.8, 1422.67, 231.1, 31),
  ],
};

test("a marker box offset from its text reads as extra lines", () => {
  assert.equal(groupRects(firefox.rects).length, 3);
});

test("leaving markers out keeps one line in Firefox", () => {
  assert.equal(groupRects(withoutRects(firefox.rects, [firefox.marker])).length, 1);
});

test("Chrome keeps one line with or without markers", () => {
  assert.equal(groupRects(chrome.rects).length, 1);
  assert.equal(groupRects(withoutRects(chrome.rects, [chrome.marker])).length, 1);
});

test("leaving markers out keeps real lines and their extents", () => {
  const marker = rect(950, 2, 4, 33);
  const rects = [rect(900, 0, 50, 47), marker, rect(700, 0, 196, 47), rect(720, 52, 280, 47)];
  const lines = groupRects(withoutRects(rects, [marker]));

  assert.equal(lines.length, 2);
  assert.deepEqual([lines[0].left, lines[0].right], [700, 950]);
  assert.deepEqual([lines[1].left, lines[1].right], [720, 1000]);
});

test("rects are unchanged when there are no markers", () => {
  const rects = [rect(0, 0, 10, 20), rect(10, 0, 10, 20)];
  assert.deepEqual(withoutRects(rects, []), rects);
});

test("only exact marker boxes are left out", () => {
  const marker = rect(10, 2, 4, 33);
  const neighbour = rect(20, 2, 4, 33);
  assert.deepEqual(withoutRects([marker, neighbour], [marker]), [neighbour]);
});
