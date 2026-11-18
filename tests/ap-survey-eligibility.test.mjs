import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("checkSurveyEligibilityAction in surveys.ts guards AP enrollment/endowment surveys to only users who attended exams", async () => {
  const content = await read("app/actions/surveys.ts");

  // 1. Export checkSurveyEligibilityAction and type
  assert.match(content, /export async function checkSurveyEligibilityAction/);
  assert.match(content, /export type SurveyEligibilityResult/);

  // 2. Detects AP Endowment / Enrollment survey
  assert.match(content, /targetAudience === "ap_endowment"/);
  assert.match(content, /\/endowment\|enrollment\/i\.test/);

  // 3. Rejects unauthenticated students
  assert.match(content, /if \(!user\) \{[\s\S]*?return \{ eligible: false, reason: "not_logged_in"/);

  // 4. Checks completed attempts in test_attempts
  assert.match(content, /\.from\("test_attempts"\)/);
  assert.match(content, /ilike\("mock_tests\.title",\s*"%Endowment%"\)/);

  // 5. Checks attended exam sessions in test_attempt_sessions
  assert.match(content, /\.from\("test_attempt_sessions"\)/);

  // 6. Returns no_exam_attempts if user never attended the exam
  assert.match(content, /return \{ eligible: false, reason: "no_exam_attempts"/);

  // 7. Rejects if student already submitted in dynamic_survey_responses or ap_endowment_feedback
  assert.match(content, /\.from\("dynamic_survey_responses"\)/);
  assert.match(content, /\.from\("ap_endowment_feedback"\)/);
  assert.match(content, /already_submitted/);
});

test("SurveyPopup checks audience eligibility and prevents popups for new users who didn't attempt the AP exam", async () => {
  const content = await read("components/dashboard/SurveyPopup.tsx");

  // 1. Imports checkSurveyEligibilityAction
  assert.match(content, /checkSurveyEligibilityAction/);

  // 2. Invokes eligibility verification before displaying
  assert.match(content, /checkSurveyEligibilityAction\(survey\.id\)/);

  // 3. Blocks appearance if student is not eligible
  assert.match(content, /if \(!eligibility\.eligible\) \{/);

  // 4. Coordinates with ApEndowmentPriorityModal to prevent duplicate dialogs
  assert.match(content, /ap-eo-feedback-title/);
});

test("checkApEndowmentFeedbackEligibilityAction checks both completed attempts and attended sessions", async () => {
  const content = await read("app/actions/ap-endowment-feedback.ts");

  // 1. Checks test_attempts with ilike %Endowment%
  assert.match(content, /\.from\("test_attempts"\)/);
  assert.match(content, /ilike\("mock_tests\.title",\s*"%Endowment%"\)/);

  // 2. Checks test_attempt_sessions so attended exam sessions qualify
  assert.match(content, /\.from\("test_attempt_sessions"\)/);

  // 3. Rejects new users with no attempts
  assert.match(content, /return \{ eligible: false, reason: "no_endowment_attempts" \};/);

  // 4. Fallback survey insertion sets targetAudience: "ap_endowment" and allowAnonymous: false
  assert.match(content, /targetAudience:\s*"ap_endowment"/);
  assert.match(content, /allowAnonymous:\s*false/);
});

test("SurveyPage (/survey) requires exam attendance for AP Endowment survey and shows informative guidance", async () => {
  const content = await read("app/survey/page.tsx");

  // 1. Calls checkSurveyEligibilityAction on server
  assert.match(content, /checkSurveyEligibilityAction/);

  // 2. Displays attendance required warning if student didn't attempt the exam
  assert.match(content, /Exam Attendance Required/);
  assert.match(content, /no_exam_attempts/);

  // 3. Displays sign in warning if not logged in
  assert.match(content, /Student Sign In Required/);
  assert.match(content, /not_logged_in/);

  // 4. Provides direct link to attend AP Endowment mock test
  assert.match(content, /\/mock-tests\/andhra-pradesh\/appsc-endowment-officer-mock-test/);
});
