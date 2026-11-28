import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("lib/surveys/survey-settings.ts supports side button, audience lifecycle, and validity rewards", async () => {
  const content = await read("lib/surveys/survey-settings.ts");

  // Display modes include side_button
  assert.match(content, /side_button/);
  assert.match(content, /sideButtonPosition/);
  assert.match(content, /sideButtonLabel/);

  // Audience targeting rules
  assert.match(content, /targetUserType/);
  assert.match(content, /minMockTestsTaken/);
  assert.match(content, /maxMockTestsTaken/);
  assert.match(content, /targetExamSlug/);
  assert.match(content, /targetState/);
  assert.match(content, /specificTargetUsers/);

  // Rewards & validity extension
  assert.match(content, /validity_extension/);
  assert.match(content, /rewardTitle/);
  assert.match(content, /rewardValue/);
  assert.match(content, /rewardDescription/);
});

test("lib/growth-settings.ts links voluntary contributions to mock test validity extension", async () => {
  const content = await read("lib/growth-settings.ts");

  assert.match(content, /validityRewardEnabled/);
  assert.match(content, /validityDaysGranted/);
  assert.match(content, /validityMinContribution/);
  assert.match(content, /validityMessage/);
});

test("growth-settings actions.ts persists validity extension settings and exports getAdminGrowthSettings", async () => {
  const content = await read("app/admin/growth-settings/actions.ts");

  assert.match(content, /export async function getAdminGrowthSettings/);
  assert.match(content, /validityRewardEnabled/);
  assert.match(content, /validityDaysGranted/);
  assert.match(content, /validityMinContribution/);
});

test("app/admin/surveys/page.tsx provides clean 2-tab Survey & Feedback workspace with cohesive teal/slate palette", async () => {
  const content = await read("app/admin/surveys/page.tsx");

  // Clean focused 2-tab navigation
  assert.match(content, /<span>Survey Forms<\/span>/);
  assert.match(content, /<span>Submissions &amp; Feedback<\/span>/);

  // Unwanted clutter and harsh colors removed
  assert.doesNotMatch(content, /Admin Presentation Simulator/);
  assert.doesNotMatch(content, /Voluntary UPI/);
  assert.doesNotMatch(content, /#0055a2/);
  assert.doesNotMatch(content, /border-purple-/);

  // Essential test assertions
  assert.match(content, /Student Surveys & Feedback/);
  assert.match(content, /<ApEndowmentFeedbackSection\s*\/>/);
  assert.match(content, /handleDeleteSurvey/);
  assert.match(content, /updateAdminSurvey/);
  assert.match(content, /handleCopyLink/);
  assert.match(content, /toggleSurveyStatus/);
  assert.match(content, /varadhi_admin_surveys_last_seen/);
  assert.match(content, /admin-badge-refresh/);

  // CSV Export & responses
  assert.match(content, /handleExportResponsesCSV/);
  assert.match(content, /Export All Responses \(CSV\)/);
});

test("components/admin/SurveySettingsPanel.tsx provides granular audience targeting and reward controls", async () => {
  const content = await read("components/admin/SurveySettingsPanel.tsx");

  // Tabs inside panel
  assert.match(content, /Who Can See/);
  assert.match(content, /What They Receive/);
  assert.match(content, /Side Button &amp; Display Style/);

  // Targeting fields
  assert.match(content, /minMockTestsTaken/);
  assert.match(content, /maxMockTestsTaken/);
  assert.match(content, /targetExamSlug/);
  assert.match(content, /targetState/);
  assert.match(content, /specificTargetUsers/);

  // Side Button configuration
  assert.match(content, /side_button/);
  assert.match(content, /sideButtonLabel/);
  assert.match(content, /sideButtonPosition/);
});
