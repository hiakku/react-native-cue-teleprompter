import test from "node:test";
import assert from "node:assert/strict";
import {
  parseLibrary,
  INITIAL_SCRIPTS,
  DEFAULT_PREFERENCES,
  words,
  duration,
} from "../src/library.ts";

const library = (scripts) =>
  JSON.stringify({ version: 1, scripts, preferences: DEFAULT_PREFERENCES });
test("a deliberately empty saved library stays empty on reopening", () => {
  assert.deepEqual(parseLibrary(library([])).scripts, []);
});
test("saved Unicode and multiline scripts survive serialization without losing their contents", () => {
  const scripts = [
    {
      ...INITIAL_SCRIPTS[0],
      body: "नमस्ते दुनिया!\n\nこんにちは 🌿",
      starred: false,
    },
  ];
  assert.deepEqual(parseLibrary(library(scripts)).scripts, scripts);
});
test("corrupt or unsupported data is rejected rather than replaced with samples", () => {
  for (const raw of [
    "{",
    "null",
    '{"version":2,"scripts":[]}',
    library([null]),
    library([{ ...INITIAL_SCRIPTS[0], updatedAt: "bad-date" }]),
  ]) {
    assert.throws(() => parseLibrary(raw));
  }
});
test("unsafe preferences are rejected before reaching scrolling calculations", () => {
  for (const p of [
    { wpm: 0 },
    { wpm: 999 },
    { fontSize: -1 },
    { mirror: "yes" },
    { countdown: null },
  ]) {
    assert.throws(() =>
      parseLibrary(
        JSON.stringify({
          version: 1,
          scripts: [],
          preferences: { ...DEFAULT_PREFERENCES, ...p },
        }),
      ),
    );
  }
});
test("word estimates handle empty and multiline text, and reading time rounds up", () => {
  assert.equal(words(" \n\t"), 0);
  assert.equal(words(" one\n\ntwo\tthree "), 3);
  assert.equal(duration(0, 130), "0:00");
  assert.equal(duration(131, 130), "1:01");
});
