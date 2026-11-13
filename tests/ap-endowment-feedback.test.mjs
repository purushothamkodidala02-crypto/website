import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("AP Endowment Officer priority campaign action is configured for 1 week and targets AP Endowment test-takers", async () => {
  const actionContent = await read("app/actions/ap-endowment-feedback.ts");

  // 1. One week campaign duration (November 20, 2026)
  assert.match(actionContent, /AP_EO_CAMPAIGN_EXPIRY_MS/);
  assert.match(actionContent, /2026-11-20T23:59:59\+05:30/);

  // 2. Checks test_attempts for AP Endowment Officer mock test attempt
  assert.match(actionContent, /\.from\("test_attempts"\)/);
  assert.match(actionContent, /ilike\("mock_tests\.title",\s*"%Endowment%"\)/);

  // 3. Checks whether student already submitted in ap_endowment_feedback or dynamic_survey_responses
  assert.match(actionContent, /\.from\("ap_endowment_feedback"\)/);
  assert.match(actionContent, /already_submitted/);

  // 4. Input validation for paper and subject focus
  assert.match(actionContent, /Please select Paper 1, Paper 2, or Both Papers/);
  assert.match(actionContent, /Please enter which subject you want us to focus on/);
});

test("ApEndowmentPriorityModal renders Paper 1 & Paper 2 selection, subject focus input, skip dismissal, and 1-week expiry", async () => {
  const modalContent = await read("components/feedback/ApEndowmentPriorityModal.tsx");

  // 1. Paper selection for Paper 1 and Paper 2
  assert.match(modalContent, /Paper 1 - General Studies & Mental Ability/);
  assert.match(modalContent, /Paper 2 - Hindu Philosophy & Temple System/);
  assert.match(modalContent, /Both Paper 1 & Paper 2/);

  // 2. Subject priority input (Text Box 1)
  assert.match(modalContent, /Which subject or topic should we focus on/);
  assert.match(modalContent, /subjectFocus/);

  // 3. Specific topics / chapters notes (Text Box 2 - Optional)
  assert.match(modalContent, /specificTopics/);

  // 4. Skip dismissal button and localStorage keys
  assert.match(modalContent, /Skip for now/);
  assert.match(modalContent, /varadhi_ap_eo_feedback_dismissed/);
  assert.match(modalContent, /varadhi_ap_eo_feedback_submitted/);

  // 5. One week expiry check
  assert.match(modalContent, /AP_EO_CAMPAIGN_EXPIRY_MS/);
});

test("Root layout mounts ApEndowmentPriorityModal so it displays when student opens the site", async () => {
  const layoutContent = await read("app/layout.tsx");
  assert.match(layoutContent, /import\s*\{\s*ApEndowmentPriorityModal\s*\}\s*from\s*["']@\/components\/feedback\/ApEndowmentPriorityModal["']/);
  assert.match(layoutContent, /<ApEndowmentPriorityModal\s*\/>/);
});

test("Admin surveys section displays AP Endowment Officer responses with Paper 1 & 2 counts and CSV export", async () => {
  const [adminSurveysPage, sectionContent] = await Promise.all([
    read("app/admin/surveys/page.tsx"),
    read("components/admin/ApEndowmentFeedbackSection.tsx"),
  ]);

  assert.match(adminSurveysPage, /<ApEndowmentFeedbackSection\s*\/>/);
  assert.match(sectionContent, /AP Endowment Officer — Subject Priority Responses/);
  assert.match(sectionContent, /Export CSV/);
  assert.match(sectionContent, /paper1Count/);
  assert.match(sectionContent, /paper2Count/);
  assert.match(sectionContent, /bothCount/);
});
