import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("surveys-admin.ts provides full CRUD for surveys, questions, and responses", async () => {
  const content = await read("app/actions/surveys-admin.ts");

  // Survey CRUD
  assert.match(content, /export async function createAdminSurvey/);
  assert.match(content, /export async function updateAdminSurvey/);
  assert.match(content, /export async function deleteAdminSurvey/);
  assert.match(content, /export async function toggleSurveyStatus/);
  assert.match(content, /export async function getAdminSurveysWithCounts/);
  assert.match(content, /export async function getAdminSurveyDetail/);

  // Question CRUD & Reordering
  assert.match(content, /export async function saveSurveyQuestion/);
  assert.match(content, /export async function updateSurveyQuestion/);
  assert.match(content, /export async function deleteSurveyQuestion/);
  assert.match(content, /export async function reorderSurveyQuestions/);

  // Response Management
  assert.match(content, /export async function getAdminSurveyResponses/);
  assert.match(content, /export async function deleteSurveyResponse/);
  assert.match(content, /export async function clearAllSurveyResponses/);
});

test("surveys.ts allows draft preview and preserves contact info on submissions", async () => {
  const content = await read("app/actions/surveys.ts");

  // Uses getSupabaseServerClient so draft preview by id works
  assert.match(content, /export async function getSurveyById/);
  assert.match(content, /getSupabaseServerClient/);

  // Preserves respondent contact info even when questions are optional
  assert.match(content, /Respondent Contact:/);
});

test("admin surveys list page provides editing, delete, active toggle, and feedback campaigns", async () => {
  const content = await read("app/admin/surveys/page.tsx");

  assert.match(content, /Student Surveys & Feedback/);
  assert.match(content, /<ApEndowmentFeedbackSection\s*\/>/);
  assert.match(content, /handleDeleteSurvey/);
  assert.match(content, /updateAdminSurvey/);
  assert.match(content, /handleCopyLink/);
  assert.match(content, /toggleSurveyStatus/);
  assert.match(content, /varadhi_admin_surveys_last_seen/);
  assert.match(content, /admin-badge-refresh/);
});

test("admin survey editor page provides resilient server loading, question management, search, and CSV export", async () => {
  const content = await read("app/admin/surveys/[id]/page.tsx");

  assert.match(content, /getAdminSurveyDetail/);
  assert.match(content, /handleSaveSurveyMeta/);
  assert.match(content, /handleToggleSurveyStatus/);
  assert.match(content, /handleDeleteSurvey/);
  assert.match(content, /handleMoveQuestion/);
  assert.match(content, /handleUpdateQuestion/);
  assert.match(content, /handleDeleteQuestion/);
  assert.match(content, /handleDeleteResponse/);
  assert.match(content, /handleClearAllResponses/);
  assert.match(content, /handleExportCSV/);
  assert.match(content, /Export CSV/);
  assert.match(content, /Mobile:/);
  assert.match(content, /Email:/);
  assert.match(content, /varadhi_admin_surveys_last_seen/);
  assert.match(content, /admin-badge-refresh/);
});

test("ap-endowment feedback section provides search, phone display, delete, and CSV export", async () => {
  const [sectionContent, actionContent] = await Promise.all([
    read("components/admin/ApEndowmentFeedbackSection.tsx"),
    read("app/actions/ap-endowment-feedback.ts"),
  ]);

  assert.match(sectionContent, /AP Endowment Officer — Subject Priority Responses/);
  assert.match(sectionContent, /Export CSV/);
  assert.match(sectionContent, /searchTerm/);
  assert.match(sectionContent, /handleDelete/);
  assert.match(actionContent, /deleteApEndowmentFeedbackAction/);
  assert.match(actionContent, /get_admin_user_emails/);
});
