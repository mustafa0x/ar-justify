// Ported from Raqim Kashida 0.2.5 by Khaled Hosny.
import { joiningGroups, joiningRanges } from "./arabic-shaping.js";

const NON_JOINING = 0;
const RIGHT_JOINING = 1;
const LEFT_JOINING = 2;
const DUAL_JOINING = 3;
const JOIN_CAUSING = 4;
const TRANSPARENT = 5;
const TATWEEL = "ـ";
const segmenter = new Intl.Segmenter("ar", { granularity: "grapheme" });

const SIMPLE_PATTERNS = `
3 * .
4 {@Waw @Ain @Qaf @Feh} .
5 @Beh {@Reh @Yeh @Yeh_Barree} .
6 {@Alef @Tah @Lam @Kaf @Gaf} .
7 {@Heh @Dal} .
{@Seen @Sad} 8 *
@Tatweel 9
@Lam ! @Alef
`;

const NASKH_PATTERNS = `
[:4:] @Beh 9\\6 @Tah
[:4:] @Beh 6\\3 {@Alef @Meem @Noon @Heh}
[:4:] @Beh 3\\0 {@Hah @Dal @Reh @Lam}
[:4:] @Hah 9\\6 @Tah
[:4:] @Hah 3\\0 {@Alef @Hah @Dal @Reh @Ain @Kaf @Lam @Meem @Noon @Heh @Waw}
[:4:] @Ain 9\\6 @Tah
[:4:] @Ain 3\\0 {@Alef @Hah @Dal @Reh @Ain @Lam @Meem @Noon @Heh}
[:4:] {@Seen @Sad @Tah} 6\\3 {@Alef @Beh @Reh @Seen @Sad @Tah @Kaf @Lam @Noon}
[:4:] {@Seen @Sad @Tah} 3\\0 {@Hah @Dal @Ain @Feh @Qaf @Meem @Heh @Waw}
[:4:] @Feh 9\\6 @Tah
[:4:] @Feh 6\\3 @Alef
[:4:] @Feh 3\\0 {@Hah @Dal @Reh @Ain @Lam @Meem @Waw}
[:4:] @Meem 6\\3 {@Tah @Dal @Reh}
[:4:] @Meem 3\\0 {@Alef @Hah @Ain @Kaf @Lam @Meem @Noon @Heh @Waw}
[:4:] @Heh 6\\3 @Beh
[:4:] @Heh 3\\0 {@Alef @Seen @Reh @Dal @Lam @Heh}
* 9 @Heh .
! {@Hah @Sad @Ain @Waw}
! {@Feh @Qaf @Yeh @Yeh_Barree} .
{@Kaf @Lam} !
. @Beh 2 @Beh {@Beh @Seen}
. @Beh 6 @Beh {@Noon @Reh} .
. @Beh ! @Beh @Beh {@Reh @Noon} .
`;

const NASTALIQ_PATTERNS = `
use arabic-naskh
* 6\\3 @Heh .
@Seen 9
{@Kaf @Lam} !
. @Beh !
! {@Ain @Feh @Qaf @Tah @Hah @Sad @Waw}
! @Heh *
! {@Yeh @Yeh_Barree} .
`;

const patternTexts = new Map([
  ["simple", SIMPLE_PATTERNS],
  ["naskh", NASKH_PATTERNS],
  ["nastaliq", NASTALIQ_PATTERNS],
]);
const patternSets = new Map();

function joiningInfo(character) {
  const codePoint = character.codePointAt(0);
  let low = 0;
  let high = joiningRanges.length - 1;

  while (low <= high) {
    const middle = (low + high) >> 1;
    const [start, end, type, group] = joiningRanges[middle];
    if (codePoint < start) high = middle - 1;
    else if (codePoint > end) low = middle + 1;
    else return { type, group };
  }

  return { type: NON_JOINING, group: 0 };
}

function isJoiningType(type) {
  return type >= RIGHT_JOINING && type <= JOIN_CAUSING;
}

function splitGraphemes(text) {
  const graphemes = Array.from(segmenter.segment(text), ({ segment, index }) => {
    const characters = [...segment];
    const base = characters[0];
    const info = joiningInfo(base);
    let type = info.type;
    const tailTypes = characters.slice(1).map((character) => joiningInfo(character).type);

    if (tailTypes.includes(NON_JOINING)) {
      if (type === DUAL_JOINING || type === JOIN_CAUSING) type = RIGHT_JOINING;
      else if (type === LEFT_JOINING || type === TRANSPARENT) type = NON_JOINING;
    } else if (type === DUAL_JOINING && tailTypes.includes(JOIN_CAUSING)) {
      type = JOIN_CAUSING;
    }

    return {
      base: base.codePointAt(0),
      end: index + segment.length,
      group: info.group,
      isMarkSeat: base === TATWEEL && tailTypes.includes(TRANSPARENT),
      type,
    };
  });
  graphemes.forEach((grapheme, index) => {
    grapheme.form = formOf(graphemes, index);
  });
  return graphemes;
}

function joinsLeft(graphemes, index) {
  const current = graphemes[index];
  const next = graphemes[index + 1];
  return Boolean(
    isJoiningType(current.type) &&
      current.type !== RIGHT_JOINING &&
      next &&
      isJoiningType(next.type) &&
      next.type !== LEFT_JOINING,
  );
}

function joinsRight(graphemes, index) {
  const current = graphemes[index];
  const previous = graphemes[index - 1];
  return Boolean(
    isJoiningType(current.type) &&
      current.type !== LEFT_JOINING &&
      previous &&
      isJoiningType(previous.type) &&
      previous.type !== RIGHT_JOINING,
  );
}

function formOf(graphemes, index) {
  const right = joinsRight(graphemes, index);
  const left = joinsLeft(graphemes, index);
  if (right && left) return "medial";
  if (right) return "final";
  if (left) return "initial";
  return "isolated";
}

function joinedRuns(graphemes) {
  const runs = [];
  let current = [];

  for (let index = 0; index < graphemes.length; index++) {
    const grapheme = graphemes[index];
    if (grapheme.type === TRANSPARENT || grapheme.isMarkSeat) continue;
    if (!isJoiningType(grapheme.type)) {
      if (current.length) runs.push(current);
      current = [];
      continue;
    }

    const previous = graphemes[current.at(-1)];
    if (
      previous &&
      (previous.type === RIGHT_JOINING || grapheme.type === LEFT_JOINING)
    ) {
      runs.push(current);
      current = [];
    }
    current.push(index);
  }

  if (current.length) runs.push(current);
  return runs;
}

const rasmClasses = [
  [["Beh", "Noon", "African_Noon", "Nya", "Yeh", "Farsi_Yeh"], ["initial", "medial"]],
  [["Feh", "African_Feh", "Qaf", "African_Qaf"], ["initial", "medial"]],
  [["Feh", "African_Feh"], ["final", "isolated"]],
  [["Qaf", "African_Qaf"], ["final", "isolated"]],
  [["Heh", "Heh_Goal", "Teh_Marbuta", "Teh_Marbuta_Goal"], ["final", "isolated"]],
  [["Noon", "African_Noon", "Nya"], ["final", "isolated"]],
  [["Yeh", "Farsi_Yeh", "Yeh_With_Tail"], ["final", "isolated"]],
  [["Yeh_Barree", "Burushaski_Yeh_Barree"], ["final", "isolated"]],
  [["Kaf", "Gaf"], ["initial", "medial"]],
].map(([groups, forms]) => [groups.map((name) => joiningGroups.get(name)), forms]);

function rasmMatches(tokenGroup, graphemeGroup, form) {
  for (const [groups, forms] of rasmClasses) {
    if (!forms.includes(form) || !groups.includes(tokenGroup)) continue;
    return groups[0] === tokenGroup && groups.includes(graphemeGroup);
  }
  return tokenGroup === graphemeGroup;
}

function groupToken(reference) {
  const kind = reference[0] === "@" ? "group" : "exact";
  const name = reference.slice(1);
  if (name === "Tatweel") return { kind: "literal", value: TATWEEL.codePointAt(0) };
  const group = joiningGroups.get(name);
  if (!group) throw new SyntaxError(`Unknown Unicode Joining_Group name “${reference}”`);
  return { kind, group };
}

function setToken(body, negate) {
  if (!body.trim()) throw new SyntaxError("Empty group set");
  const members = [];
  for (const part of body.trim().split(/\s+/u)) {
    if (part.startsWith("@") || part.startsWith("=")) members.push(groupToken(part));
    else {
      for (const character of part) {
        if (!isJoiningType(joiningInfo(character).type)) {
          throw new SyntaxError(`Stray character ${JSON.stringify(character)}`);
        }
        members.push({ kind: "literal", value: character.codePointAt(0) });
      }
    }
  }
  return { kind: negate ? "not-set" : "set", members };
}

function parseGuard(characters, state) {
  const start = ++state.position;
  while (characters[state.position] && characters[state.position] !== "]") {
    state.position++;
  }
  if (characters[state.position] !== "]") throw new SyntaxError("Unterminated length guard");
  const body = characters.slice(start, state.position++).join("").trim();
  const bound = (value) => {
    if (!/^\d+$/u.test(value)) throw new SyntaxError(`Invalid length guard “[${body}]”`);
    return Number(value);
  };

  let guard;
  if (body.startsWith(":") && body.endsWith(":")) {
    guard = { kind: "open", value: bound(body.slice(1, -1)) };
  } else if (body.endsWith(":")) {
    guard = { kind: "min", value: bound(body.slice(0, -1)) };
  } else if (body.includes(":")) {
    const [low, high, ...extra] = body.split(":");
    if (extra.length) throw new SyntaxError(`Invalid length guard “[${body}]”`);
    guard = { kind: "range", low: bound(low), high: bound(high) };
  } else {
    guard = { kind: "exact", value: bound(body) };
  }

  const valid = guard.kind === "range"
    ? guard.low >= 2 && guard.low <= guard.high
    : guard.value >= 2;
  if (!valid) throw new SyntaxError(`Invalid length guard “[${body}]”`);
  return guard;
}

function parsePattern(line) {
  const characters = [...line];
  const state = { position: 0 };
  const guard = characters[0] === "[" ? parseGuard(characters, state) : null;
  const tokens = [];
  const weights = [];
  let leadingBoundary = false;
  let trailingBoundary = false;

  const setWeight = (weight) => {
    if (weights[tokens.length]) throw new SyntaxError("Conflicting weights at one connection");
    weights[tokens.length] = weight;
  };

  while (state.position < characters.length) {
    while ([" ", "\t"].includes(characters[state.position])) state.position++;
    if (state.position >= characters.length) break;
    const character = characters[state.position];

    if (character === ".") {
      state.position++;
      if (!tokens.length) leadingBoundary = true;
      else trailingBoundary = true;
      continue;
    }
    if (trailingBoundary) throw new SyntaxError("Token after a trailing boundary");
    if (/\d/u.test(character)) {
      state.position++;
      const base = Number(character);
      let minimum = base;
      if (characters[state.position] === "\\") {
        state.position++;
        if (!/\d/u.test(characters[state.position] || "")) {
          throw new SyntaxError("Expected a digit after backslash");
        }
        minimum = Number(characters[state.position++]);
        if (minimum > base) throw new SyntaxError("Priority must not increase");
      }
      setWeight({ base, minimum });
      continue;
    }
    if (character === "!") {
      state.position++;
      setWeight({ suppress: true });
      continue;
    }
    if (character === "\\") throw new SyntaxError("Backslash must follow a priority digit");
    if (character === "*") {
      state.position++;
      tokens.push({ kind: "any" });
      continue;
    }

    let negate = false;
    if (character === "^") {
      negate = true;
      state.position++;
      if (!["{", "@", "="].includes(characters[state.position])) {
        throw new SyntaxError("Caret must be followed by a set or group");
      }
    }
    if (characters[state.position] === "{") {
      const start = ++state.position;
      while (characters[state.position] && characters[state.position] !== "}") {
        state.position++;
      }
      if (characters[state.position] !== "}") throw new SyntaxError("Unterminated group set");
      tokens.push(setToken(characters.slice(start, state.position++).join(""), negate));
      continue;
    }
    if (["@", "="].includes(characters[state.position])) {
      const start = state.position++;
      while (/[A-Za-z_]/u.test(characters[state.position] || "")) state.position++;
      if (state.position === start + 1) throw new SyntaxError("Empty group name");
      const token = groupToken(characters.slice(start, state.position).join(""));
      tokens.push(negate ? { kind: "not-set", members: [token] } : token);
      continue;
    }

    const literal = characters[state.position++];
    if (!isJoiningType(joiningInfo(literal).type)) {
      throw new SyntaxError(`Stray character ${JSON.stringify(literal)}`);
    }
    tokens.push({ kind: "literal", value: literal.codePointAt(0) });
  }

  if (!tokens.length) throw new SyntaxError("Pattern has no letters");
  if ((leadingBoundary && weights[0]) || (trailingBoundary && weights[tokens.length])) {
    throw new SyntaxError("Weight outside the run at a boundary");
  }
  weights.length = tokens.length + 1;
  return { guard, leadingBoundary, tokens, trailingBoundary, weights };
}

export function compilePatternText(text) {
  const patterns = [];
  for (const [index, raw] of text.split("\n").entries()) {
    const line = raw.replace(/#.*$/u, "").trim();
    if (!line) continue;
    if (/^use[ \t]/u.test(line)) {
      const name = line.slice(3).trim().replace(/^arabic-/u, "");
      const imported = builtinPatternSet(name);
      if (!imported) throw new SyntaxError(`line ${index + 1}: Unknown pattern set “${name}”`);
      patterns.push(...imported);
      continue;
    }
    try {
      patterns.push(parsePattern(line));
    } catch (error) {
      throw new SyntaxError(`line ${index + 1}: ${error.message}`);
    }
  }
  return patterns;
}

export function builtinPatternSet(name) {
  name = name.replace(/^arabic-/u, "");
  if (!patternTexts.has(name)) return undefined;
  if (!patternSets.has(name)) patternSets.set(name, compilePatternText(patternTexts.get(name)));
  return patternSets.get(name);
}

function guardMatches(guard, length) {
  if (!guard || guard.kind === "open") return true;
  if (guard.kind === "exact") return length === guard.value;
  if (guard.kind === "min") return length >= guard.value;
  return length >= guard.low && length <= guard.high;
}

function guardFloor(guard) {
  if (!guard) return 2;
  return guard.kind === "range" ? guard.low : guard.value;
}

function tokenMatches(token, graphemes, index) {
  const grapheme = graphemes[index];
  if (token.kind === "any") return isJoiningType(grapheme.type);
  if (token.kind === "literal") return token.value === grapheme.base;
  if (token.kind === "group") {
    return rasmMatches(token.group, grapheme.group, grapheme.form);
  }
  if (token.kind === "exact") return token.group === grapheme.group;
  const matches = token.members.some((member) => tokenMatches(member, graphemes, index));
  return token.kind === "set" ? matches : isJoiningType(grapheme.type) && !matches;
}

function resolveRun(graphemes, run, patterns) {
  if (run.length < 2) return [];
  const priorities = Array(run.length - 1).fill(undefined);

  for (const pattern of patterns) {
    if (!guardMatches(pattern.guard, run.length) || pattern.tokens.length > run.length) continue;
    const floor = guardFloor(pattern.guard);
    for (let start = 0; start <= run.length - pattern.tokens.length; start++) {
      if (pattern.leadingBoundary && start !== 0) continue;
      if (
        pattern.trailingBoundary &&
        (start + pattern.tokens.length !== run.length ||
          graphemes[run.at(-1)].type === JOIN_CAUSING)
      ) {
        continue;
      }
      if (
        !pattern.tokens.every((token, index) =>
          tokenMatches(token, graphemes, run[start + index]),
        )
      ) {
        continue;
      }

      for (let gap = 0; gap <= pattern.tokens.length; gap++) {
        const weight = pattern.weights[gap];
        if (!weight) continue;
        const point = start + gap - 1;
        if (point < 0 || point > run.length - 2) continue;
        priorities[point] = weight.suppress
          ? undefined
          : Math.max(weight.minimum, weight.base - Math.abs(run.length - floor));
      }
    }
  }

  const points = [];
  priorities.forEach((priority, point) => {
    if (priority === undefined) return;
    let index = run[point];
    while (graphemes[index + 1]?.isMarkSeat) index++;
    points.push({ offset: graphemes[index].end, priority });
  });
  return points;
}

export function findKashidaPoints(text, patterns) {
  const graphemes = splitGraphemes(text);
  return joinedRuns(graphemes).flatMap((run) => resolveRun(graphemes, run, patterns));
}

export const patternSetNames = [...patternTexts.keys()];
export { formOf, joinedRuns, joiningInfo, rasmMatches, splitGraphemes };
