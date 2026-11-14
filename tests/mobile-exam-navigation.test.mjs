import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("mobile exam navigation provides direct in-card Save & Next, header arrows, and docked footer", async () => {
  const runner = await read("app/mock-tests/[id]/StudentTestRunner.tsx");

  // 1. Viewport docking: fixed inset-0 and dynamic dvh prevents mobile browser chrome clipping
  assert.match(runner, /fixed inset-0/);
  assert.match(runner, /h-\[100dvh\]/);
  assert.match(runner, /max-h-\[100dvh\]/);

  // 2. Header question indicator has mobile-friendly prev/next arrows and opens palette
  assert.match(runner, /title="Previous question"[\s\S]*?‹/);
  assert.match(runner, /title="Next question"[\s\S]*?›/);
  assert.match(runner, /title="Tap to open Questions Palette"/);

  // 3. In-card action bar gives mobile students direct "Save & next" and "Prev" right under the options
  assert.match(runner, /Quick Next \/ Prev Action Bar inside Question Card for Mobile/);
  assert.match(runner, /title="Save and move to next question"/);
  assert.match(runner, /title="View all questions"/);

  // 4. Docked footer includes visible directional arrows for mobile touch
  assert.match(runner, /<span className="text-xs font-bold md:hidden">←<\/span>/);
  assert.match(runner, /<span className="text-xs font-bold md:hidden">→<\/span>/);
});
