import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("admin survey responses display student name, mobile number, email, and provide CSV export", async () => {
  const [surveysAdminAction, surveyDetailPage] = await Promise.all([
    read("app/actions/surveys-admin.ts"),
    read("app/admin/surveys/[id]/page.tsx"),
  ]);

  // surveys-admin.ts correctly selects id, full_name, phone from profiles
  assert.match(surveysAdminAction, /\.from\("profiles"\)/);
  assert.match(surveysAdminAction, /\.select\("id,\s*full_name,\s*phone"\)/);
  assert.doesNotMatch(surveysAdminAction, /\.from\("profiles"\)\s*\.select\("id,\s*full_name,\s*email"\)/);

  // surveys-admin.ts queries get_admin_user_emails RPC
  assert.match(surveysAdminAction, /get_admin_user_emails/);

  // surveys-admin.ts maps respondentPhone and respondentEmail
  assert.match(surveysAdminAction, /respondentPhone/);
  assert.match(surveysAdminAction, /respondentEmail/);

  // survey detail page has UI for mobile, email, and CSV export
  assert.match(surveyDetailPage, /Mobile:/);
  assert.match(surveyDetailPage, /Email:/);
  assert.match(surveyDetailPage, /handleExportCSV/);
  assert.match(surveyDetailPage, /Export CSV/);
});
