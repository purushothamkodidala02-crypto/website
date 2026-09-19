import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("test taking screen displays Varadhi prepended to student email watermark on background", async () => {
  const [attemptPage, runner, watermark] = await Promise.all([
    read("app/mock-tests/[id]/attempt/page.tsx"),
    read("app/mock-tests/[id]/StudentTestRunner.tsx"),
    read("components/mock-tests/ScreenWatermark.tsx"),
  ]);

  // Attempt page passes user's email into the test runner
  assert.match(attemptPage, /studentEmail=\{user\.email/);

  // StudentTestRunner accepts studentEmail prop
  assert.match(runner, /studentEmail\?:\s*string/);
  assert.match(runner, /studentEmail\b/);

  // Watermark text prepends Varadhi before student email
  assert.match(runner, /watermarkText\s*=\s*studentEmail\s*\?\s*`Varadhi • \$\{studentEmail\}`\s*:\s*"Varadhi"/);
  assert.match(runner, /<ScreenWatermark text=\{watermarkText\}/);

  // ScreenWatermark renders anti-cheat background watermark with pointer-events-none & select-none
  assert.match(watermark, /pointer-events-none/);
  assert.match(watermark, /fixed inset-0/);
  assert.match(watermark, /select-none/);
  assert.match(watermark, /patternTransform="rotate\(-22\)"/);
  assert.match(watermark, /id="varadhi-test-watermark"/);
  assert.match(watermark, /fill="url\(#varadhi-test-watermark\)"/);
  assert.match(watermark, /aria-hidden="true"/);
});
