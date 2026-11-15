import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("StudyViewer provides interactive practice quiz mode with active recall and instant feedback", async () => {
  const viewer = await read("components/study/StudyViewer.tsx");

  // State management for practice quiz mode
  assert.match(viewer, /practiceMode/);
  assert.match(viewer, /practiceAnswers/);
  assert.match(viewer, /revealedAnswers/);
  assert.match(viewer, /practiceScore/);

  // Interactive buttons and toggle
  assert.match(viewer, /Practice Quiz/);
  assert.match(viewer, /రివిజన్ క్విజ్/);
  assert.match(viewer, /Reveal Answer & Explanation/);
  assert.match(viewer, /Next Question/);
});

test("Dashboard provides daily prep streak, practice quiz CTA, and exam cut-off predictor", async () => {
  const dashboard = await read("app/dashboard/page.tsx");

  // Streak counter
  assert.match(dashboard, /studyStreak/);
  assert.match(dashboard, /🔥/);
  assert.match(dashboard, /Day Streak/);

  // Practice quiz CTAs
  assert.match(dashboard, /\/dashboard\/study-book\?view=mistakes&mode=practice/);
  assert.match(dashboard, /Practice Quiz \(రివిజన్ క్విజ్\)/);
  assert.match(dashboard, /\/dashboard\/study-book\?view=bookmarks&mode=practice/);

  // Exam Readiness & Cut-off Predictor
  assert.match(dashboard, /Exam Readiness &amp; Cut-Off Predictor/);
  assert.match(dashboard, /TSLPRB &amp; APPSC Score Calibration/);
  assert.match(dashboard, /cutOffBenchmark = 40/);
  assert.match(dashboard, /meritBenchmark = 55/);
  assert.match(dashboard, /weakestSubject/);
  assert.match(dashboard, /Fastest Rank Booster/);
});
