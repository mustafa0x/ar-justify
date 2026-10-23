export function groupRects(rects) {
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

function rectKey(rect) {
  return `${rect.left},${rect.top},${rect.width},${rect.height}`;
}

export function withoutRects(rects, excluded) {
  if (!excluded.length) return [...rects];
  const keys = new Set(excluded.map(rectKey));
  return [...rects].filter((rect) => !keys.has(rectKey(rect)));
}
