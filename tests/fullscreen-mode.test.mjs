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

  // Inline number scroller is removed from mobile exam view to prevent 3 simultaneous attempt indicators
  assert.doesNotMatch(runner, /HorizontalQuestionScroller/);
  assert.match(runner, /Questions Palette/);

  // Question layout fits screen on PC without perpetual scrolling
  assert.match(runner, /max-w-\[1720px\]/);
  assert.match(runner, /FormattedQuestionText text=\{questionText\}/);

  // Status and multi-target fallback checks
  assert.match(fullscreenLib, /export function getLastFullscreenStatus/);
  assert.match(fullscreenLib, /document\.documentElement/);
  assert.match(fullscreenLib, /document\.body/);
  assert.match(fullscreenLib, /ALLOW_KEYBOARD_INPUT/);
  assert.match(runner, /handleToggleFullscreen/);
  assert.match(runner, /fullscreenFeedback/);
});
