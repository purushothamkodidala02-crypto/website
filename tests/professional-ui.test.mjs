import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public account navigation avoids misleading signed-out actions while session state loads", async () => {
  const [actions, menu] = await Promise.all([
    read("components/site/PublicAccountActions.tsx"),
    read("components/site/PublicNavigationMenu.tsx"),
  ]);

  assert.match(actions, /accountReady/);
  assert.match(actions, /Loading account options/);
  assert.match(actions, /auth\.getSession\(\)/);
  assert.match(actions, /Create account/);
  assert.doesNotMatch(actions, /Start free/);
  assert.match(menu, /auth\.getSession\(\)/);
});

test("student test actions clearly distinguish starting, resuming, and restarting", async () => {
  const [actions, details] = await Promise.all([
    read("app/mock-tests/[id]/TestStartActions.tsx"),
    read("components/mock-tests/MockTestDetailPage.tsx"),
  ]);

  assert.match(actions, />\s*Start test\s*</);
  assert.match(actions, />\s*Resume test\s*</);
  assert.match(actions, />\s*Restart test\s*</);
  assert.match(actions, /Restart this test\?/);
  assert.match(details, /Resume to keep your progress/);
  assert.doesNotMatch(details, /Start test begins again/);
});

test("professional labels remain consistent across student and admin pages", async () => {
  const [home, dashboard, adminNavigation, assignments] = await Promise.all([
    read("app/page.tsx"),
    read("app/dashboard/page.tsx"),
    read("components/admin/AdminNavigation.tsx"),
    read("app/admin/mock-tests/[id]/edit/QuestionAssignments.tsx"),
  ]);

  assert.match(home, />Sign in</);
  assert.match(home, />Create account</);
  assert.doesNotMatch(home, />Admin</);
  assert.doesNotMatch(dashboard, /weak Subjects/);
  assert.match(adminNavigation, /label: "Exam series"/);
  assert.doesNotMatch(adminNavigation, /label: "Exam passes"/);
  assert.match(assignments, /No negative marking/);
});

test("student navigation keeps account details separate from the admin workspace", async () => {
  const [actions, header, publicMenu, adminNavigation] = await Promise.all([
    read("components/site/PublicAccountActions.tsx"),
    read("components/site/PublicHeader.tsx"),
    read("components/site/PublicNavigationMenu.tsx"),
    read("components/admin/AdminNavigation.tsx"),
  ]);

  assert.match(actions, /from\("profiles"\)\.select\("role"\)/);
  assert.match(actions, /profile\?\.role === "admin"/);
  assert.match(actions, /title=\{email\}/);
  assert.match(actions, /!isAdmin/);
  assert.match(actions, /initialIsAdmin = false/);
  assert.doesNotMatch(actions, /Return to admin workspace/);
  assert.doesNotMatch(header, /createClient/);
  assert.match(header, /<PublicAccountActions \/>/);
  assert.match(publicMenu, /label: "Admin workspace"/);
  assert.match(publicMenu, /hasAdminRole/);
  assert.match(adminNavigation, /target="_blank"/);
});

test("mock-test question management fetches only questions assigned to that test", async () => {
  const page = await read("app/admin/mock-tests/[id]/questions/page.tsx");

  assert.match(page, /const questionIds = \[\.\.\.new Set\(/);
  assert.match(page, /from\("questions"\)[\s\S]*\.in\("id", questionIds\)/);
  assert.doesNotMatch(page, /supabase\.from\("questions"\)\.select\("id, question_text, is_active"\),/);
});

test("mock-test filters remain available through settings, questions, and previews", async () => {
  const [table, navigation, editPage, questionsPage, previewPage, preview, assignments] = await Promise.all([
    read("app/admin/mock-tests/ExistingMockTestsTable.tsx"),
    read("lib/admin/mock-test-navigation.ts"),
    read("app/admin/mock-tests/[id]/edit/page.tsx"),
    read("app/admin/mock-tests/[id]/questions/page.tsx"),
    read("app/admin/mock-tests/[id]/preview/page.tsx"),
    read("app/admin/mock-tests/[id]/preview/StudentPreview.tsx"),
    read("app/admin/mock-tests/[id]/edit/QuestionAssignments.tsx"),
  ]);

  assert.match(table, /questions\?returnTo=\$\{encodeURIComponent\(mockTestAdminUrl\)\}/);
  assert.match(navigation, /mockTestsListReturnTo/);
  assert.match(navigation, /mockTestPreviewHref/);
  assert.match(editPage, /mockTestQuestionsHref\(test\.id, backHref\)/);
  assert.match(questionsPage, /mockTestPreviewHref\(test\.id, mockTestsPath\)/);
  assert.match(previewPage, /mockTestQuestionsHref\(id, listReturnTo\)/);
  assert.match(preview, /mockTestPreviewHref\(mockTestId, listReturnTo, index \+ 1\)/);
  assert.match(assignments, /const returnToQuery = returnTo \? `\?returnTo=\$\{encodeURIComponent\(returnTo\)\}` : ""/);
  assert.match(assignments, /\$\{questionsPath\}\/new\$\{returnToQuery\}/);
});
