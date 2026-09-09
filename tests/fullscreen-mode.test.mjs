import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("fullscreen exam mode opens on tablet/PC start and gracefully supports normal and split-screen mode", async () => {
  const [fullscreenLib, startActions, runner, submitButton] = await Promise.all([
    read("lib/fullscreen.ts"),
    read("app/mock-tests/[id]/TestStartActions.tsx"),
    read("app/mock-tests/[id]/StudentTestRunner.tsx"),
    read("components/feedback/PendingSubmitButton.tsx"),
  ]);

  // Fullscreen helper exports and safe fallbacks
  assert.match(fullscreenLib, /export function isBigScreen/);
  assert.match(fullscreenLib, /export function isFullscreenSupported/);
  assert.match(fullscreenLib, /export async function requestFullscreenSafely/);
  assert.match(fullscreenLib, /export async function exitFullscreenSafely/);
  assert.match(fullscreenLib, /export async function toggleFullscreenSafely/);
  assert.match(fullscreenLib, /export function subscribeToFullscreenChange/);
  assert.match(fullscreenLib, /width >= 768/);

  // Submit button supports click handler
  assert.match(submitButton, /onClick\?:/);
  assert.match(submitButton, /onClick=\{onClick\}/);

  // Start actions triggers fullscreen on big screen
  assert.match(startActions, /handleFullscreenOnStart/);
  assert.match(startActions, /isBigScreen\(\) && isFullscreenSupported\(\)/);
  assert.match(startActions, /onClick=\{handleFullscreenOnStart\}/);

  // Student test runner provides toggle and normal/split screen support
  assert.match(runner, /toggleFullscreenSafely/);
  assert.match(runner, /Exit full screen/);
  assert.match(runner, /Full screen/);
  assert.match(runner, /Exam Hall Mode/);
  assert.match(runner, /Normal \/ Split screen/);

  // Bottom number scrolling is removed for PC (scoped to lg:hidden)
  assert.match(runner, /<div className="lg:hidden">\s*<HorizontalQuestionScroller/);

  // Question screen presence is extended on PC
  assert.match(runner, /max-w-\[1720px\]/);
  assert.match(runner, /min-h-\[calc\(100vh-14rem\)\]/);
  assert.match(runner, /lg:text-2xl/);
});
