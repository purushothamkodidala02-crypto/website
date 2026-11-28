import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("mobile exam navigation keeps only the docked outer footer bar without duplicate in-card Save & Next", async () => {
  const runner = await read("app/mock-tests/[id]/StudentTestRunner.tsx");

  // 1. Viewport docking: fixed inset-0 and dynamic dvh prevents mobile browser chrome clipping
  assert.match(runner, /fixed inset-0/);
  assert.match(runner, /h-\[100dvh\]/);
  assert.match(runner, /max-h-\[100dvh\]/);

  // 2. Header question indicator has mobile-friendly prev/next arrows and opens palette
  assert.match(runner, /title="Previous question"[\s\S]*?‹/);
  assert.match(runner, /title="Next question"[\s\S]*?›/);
  assert.match(runner, /title="Tap to open Questions Palette"/);

  // 3. No duplicate mobile Prev / Questions / Save & next action bar inside the question card
  assert.doesNotMatch(runner, /Quick Next \/ Prev Action Bar inside Question Card for Mobile/);
  assert.doesNotMatch(runner, /title="Save and move to next question"/);
  assert.doesNotMatch(runner, /title="View all questions"/);

  // 4. Docked outer footer provides Previous, Questions trigger, Save & next, and visible arrows for mobile touch
  assert.match(runner, /<footer[\s\S]*?title="Previous question \(← Arrow\)"[\s\S]*?<span className="text-xs font-bold md:hidden">←<\/span>/);
  assert.match(runner, /<footer[\s\S]*?Questions <span className="font-mono">\(\{index \+ 1\}\/\{questions\.length\}\)<\/span>/);
  assert.match(runner, /<footer[\s\S]*?title="Save & next question \(→ Arrow\)"[\s\S]*?<span className="text-xs font-bold md:hidden">→<\/span>/);
});
