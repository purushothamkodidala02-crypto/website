import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("admin navigation shows update bubbles on Question Reports and Surveys sections upon student submission", async () => {
  const [
    adminBadgesAction,
    questionReportsAction,
    surveysAction,
    navigationComponent,
    reportAdminForm,
    surveysAdminPage,
    surveyDetailAdminPage,
  ] = await Promise.all([
    read("app/actions/admin-badges.ts"),
    read("lib/actions/question-reports.ts"),
    read("app/actions/surveys.ts"),
    read("components/admin/AdminNavigation.tsx"),
    read("app/admin/question-reports/ReportAdminForm.tsx"),
    read("app/admin/surveys/page.tsx"),
    read("app/admin/surveys/[id]/page.tsx"),
  ]);

  // 1. admin-badges.ts action
  assert.match(adminBadgesAction, /export async function getAdminNavBadges/);
  assert.match(adminBadgesAction, /from\("question_reports"\)/);
  assert.match(adminBadgesAction, /\.eq\("status",\s*"open"\)/);
  assert.match(adminBadgesAction, /from\("dynamic_survey_responses"\)/);
  assert.match(adminBadgesAction, /openCount/);
  assert.match(adminBadgesAction, /newCount/);

  // 2. Student submission revalidation
  assert.match(questionReportsAction, /revalidatePath\("\/admin\/question-reports"\)/);
  assert.match(questionReportsAction, /revalidatePath\("\/admin"\)/);
  assert.match(surveysAction, /revalidatePath\("\/admin\/surveys"\)/);
  assert.match(surveysAction, /revalidatePath\("\/admin"\)/);

  // 3. AdminNavigation renders bubbles
  assert.match(navigationComponent, /getAdminNavBadges/);
  assert.match(navigationComponent, /varadhi_admin_surveys_last_seen/);
  assert.match(navigationComponent, /varadhi_admin_reports_last_seen/);
  assert.match(navigationComponent, /badges\.openReports/);
  assert.match(navigationComponent, /badges\.newSurveys/);
  assert.match(navigationComponent, /admin-badge-refresh/);
  assert.match(navigationComponent, /window\.addEventListener\("focus"/);
  assert.match(navigationComponent, /document\.addEventListener\("visibilitychange"/);

  // 4. ReportAdminForm dispatches badge refresh
  assert.match(reportAdminForm, /admin-badge-refresh/);

  // 5. Surveys pages update seen timestamp and trigger refresh
  assert.match(surveysAdminPage, /varadhi_admin_surveys_last_seen/);
  assert.match(surveysAdminPage, /admin-badge-refresh/);
  assert.match(surveyDetailAdminPage, /varadhi_admin_surveys_last_seen/);
  assert.match(surveyDetailAdminPage, /admin-badge-refresh/);
});
