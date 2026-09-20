import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("exam review page displays questions and explanations wide and side-by-side on laptop screens", async () => {
  const [attemptPage, reviewNavigator] = await Promise.all([
    read("app/dashboard/attempts/[id]/page.tsx"),
    read("app/dashboard/attempts/[id]/AttemptReviewNavigator.tsx"),
  ]);

  // 1. Attempt review page uses full width without large empty spaces on left and right
  assert.match(attemptPage, /w-full max-w-full/);

  // 2. Navigator splits questions and explanation into a wide 2-column layout on desktop/laptop
  assert.match(reviewNavigator, /grid-cols-1 lg:grid-cols-12/);
  assert.match(reviewNavigator, /lg:col-span-7/);
  assert.match(reviewNavigator, /lg:col-span-5/);

  // 3. Explanation is rendered with dedicated card and answer analysis in the side pane
  assert.match(reviewNavigator, /FormattedQuestionText[\s\S]*?text=\{explanation\}/);
  assert.match(reviewNavigator, /Answer Explanation/);
  assert.match(reviewNavigator, /Correct answer:/);

  // 4. Navigation supports previous/next buttons and arrow keys
  assert.match(reviewNavigator, /Previous/);
  assert.match(reviewNavigator, /Next/);
  assert.match(reviewNavigator, /ReviewArrow/);
});
