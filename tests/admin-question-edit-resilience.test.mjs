import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("admin question editing and taxonomy loading are resilient against missing service role key and unexpected errors", async () => {
  const [taxonomy, syncAttempt, editActions, adminError, editForm] = await Promise.all([
    read("lib/admin/taxonomy.ts"),
    read("lib/questions/sync-attempt-sessions.ts"),
    read("app/admin/questions/[id]/edit/actions.ts"),
    read("app/admin/error.tsx"),
    read("app/admin/questions/[id]/edit/EditQuestionForm.tsx"),
  ]);

  // 1. Taxonomy uses public client fallback and never crashes if service role key is absent
  assert.match(taxonomy, /createPublicClient/);
  assert.match(taxonomy, /catch \(err\)/);

  // 2. Sync to attempt sessions safely skips if service role key is absent and catches errors
  assert.match(syncAttempt, /!process\.env\.SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(syncAttempt, /try \{/);
  assert.match(syncAttempt, /catch \(err\)/);

  // 3. updateQuestion has top-level try-catch returning clean error state without crashing
  assert.match(editActions, /try \{/);
  assert.match(editActions, /catch \(err\)/);
  assert.match(editActions, /Temporary problem saving question/);

  // 4. Admin error boundary exists and provides dedicated admin workspace recovery
  assert.match(adminError, /Admin Workspace Error/);
  assert.match(adminError, /RetryButton/);
  assert.match(adminError, /\/admin\/mock-tests/);
  assert.match(adminError, /\/admin\/questions/);

  // 5. EditQuestionForm suppresses beforeunload and discard dialog when saving is initiated
  assert.match(editForm, /isSubmittingRef/);
  assert.match(editForm, /if\s*\(\s*isSubmittingRef\.current\s*\|\|\s*pending\s*\)\s*\{\s*return;\s*\}/);
  assert.match(editForm, /onSubmit=\{/);
});

test("admin workspace pages fall back cleanly without service role key and avoid double titles or raw React errors", async () => {
  const [adminHome, adminReports, adminResults, adminStudents, adminLayout, adminError, adminNav] =
    await Promise.all([
      read("app/admin/page.tsx"),
      read("app/admin/question-reports/page.tsx"),
      read("app/admin/results/page.tsx"),
      read("app/admin/students/page.tsx"),
      read("app/admin/layout.tsx"),
      read("app/admin/error.tsx"),
      read("components/admin/AdminNavigation.tsx"),
    ]);

  // 1. Server-rendered admin pages use authenticated MFA client fallback when SUPABASE_SERVICE_ROLE_KEY is unset
  for (const page of [adminHome, adminReports, adminResults, adminStudents]) {
    assert.match(page, /process\.env\.SUPABASE_SERVICE_ROLE_KEY\s*\?\s*createAdminClient\(\)\s*:\s*supabase/);
  }

  // 2. Admin layout title relies on root metadata template instead of duplicating "| Varadhi Prep"
  assert.doesNotMatch(adminLayout, /title:\s*["'][^"']*\| Varadhi Prep["']/);

  // 3. Admin error boundary avoids nested <main> landmarks and hides minified React #441 dev boilerplate
  assert.doesNotMatch(adminError, /<main\b/);
  assert.match(adminError, /Minified React error/);
  assert.doesNotMatch(adminError, /Admin Home/);

  // 4. Desktop sidebar exposes a single collapse button instead of duplicate top + bottom controls
  const collapseMatches = adminNav.match(/title="Collapse sidebar \( \[ \)"/g) ?? [];
  assert.equal(collapseMatches.length, 1);

  // 5. Admin Overview uses concise header copy, localized question counts, and no decorative header dots
  assert.doesNotMatch(adminHome, /Production Operational/);
  assert.doesNotMatch(adminHome, /Real-time administrative control/);
  assert.doesNotMatch(adminHome, /VaradhiPrep Command Center/);
  assert.match(adminHome, /totalQuestionsCount\.toLocaleString\("en-IN"\)/);
  assert.doesNotMatch(adminHome, /h-2 w-2 shrink-0 rounded-full bg-teal-600/);
  assert.doesNotMatch(adminNav, /h-1\.5 w-1\.5 rounded-full bg-teal-600/);
});

test("admin exam catalogue uses indexed lookups, dynamic forms, deferred rendering, and single-row tabs", async () => {
  const [examsPage, workspace, globalsCss] = await Promise.all([
    read("app/admin/exams/page.tsx"),
    read("app/admin/exams/ExamStructureWorkspace.tsx"),
    read("app/globals.css"),
  ]);

  // 1. No nested <main> landmark and clean URL state handoff
  assert.doesNotMatch(examsPage, /<main\b/);
  assert.doesNotMatch(examsPage, /h-2 w-2 rounded-full/);
  assert.match(examsPage, /initialStateSlug/);
  assert.match(examsPage, /initialBoardSlug/);

  // 2. Heavy create/settings forms are code-split via next/dynamic and useMap indexes
  assert.match(workspace, /dynamic\(\s*\(\)\s*=>\s*import\("\.\/StateManager"\)/);
  assert.match(workspace, /dynamic\(\s*\(\)\s*=>\s*import\("\.\/CreateExamForm"\)/);
  assert.match(workspace, /categoriesByStateId/);
  assert.match(workspace, /examsByCategoryId/);
  assert.match(workspace, /subjectsByPaperId/);
  assert.match(workspace, /prefetch=\{false\}/);
  assert.match(workspace, /role="tablist"/);
  assert.match(workspace, /aria-selected=\{active\}/);
  assert.match(workspace, /<h3[\s\S]{0,60}<button[\s\S]{0,120}aria-expanded=\{isOpen\}/);
  assert.doesNotMatch(workspace, /\{stateBoardCount\}&middot;\{stateExamCount\}/);
  assert.doesNotMatch(workspace, /\{boardExamsList\.length\}/);
  assert.match(workspace, /admin-tablist-no-underline/);
  assert.match(globalsCss, /\.admin-tablist-no-underline > \[role="tab"\]\[aria-selected="true"\]::after/);

  // 3. Tabs underline and off-screen deferred rendering rules with intrinsic size
  assert.match(globalsCss, /\.admin-tablist > \[role="tab"\]\[aria-selected="true"\]::after/);
  assert.match(globalsCss, /content-visibility:\s*auto/);
  assert.match(globalsCss, /contain-intrinsic-size:\s*auto none auto 78px/);
});

test("all admin workspaces enforce display typography, no nested main landmarks, prefetch=false, and loading spinners", async () => {
  const [
    globalsCss,
    adminHeader,
    adminNav,
    adminHome,
    subjectsPage,
    groupsPage,
    papersPage,
    faqManager,
    questionsPage,
    mockTestsPage,
    reportsPage,
    accessPage,
    studentsPage,
    growthPage,
    surveysPage,
  ] = await Promise.all([
    read("app/globals.css"),
    read("components/admin/AdminHeader.tsx"),
    read("components/admin/AdminNavigation.tsx"),
    read("app/admin/page.tsx"),
    read("app/admin/subjects/page.tsx"),
    read("app/admin/groups/page.tsx"),
    read("app/admin/papers/page.tsx"),
    read("app/admin/exam-pages/ExamPageFaqManager.tsx"),
    read("app/admin/questions/page.tsx"),
    read("app/admin/mock-tests/page.tsx"),
    read("app/admin/question-reports/page.tsx"),
    read("app/admin/access/page.tsx"),
    read("app/admin/students/page.tsx"),
    read("app/admin/growth-settings/page.tsx"),
    read("app/admin/surveys/page.tsx"),
  ]);

  assert.match(globalsCss, /\.admin-workspace/);
  assert.match(globalsCss, /\.admin-stat/);
  assert.match(globalsCss, /\.admin-card-deferred:nth-of-type\(n \+ 8\)/);
  assert.match(adminHeader, /"\/admin\/growth-settings"/);
  assert.doesNotMatch(adminNav, /prefetch=\{true\}/);
  assert.doesNotMatch(adminHome, /prefetch=\{true\}/);

  for (const source of [
    subjectsPage,
    groupsPage,
    papersPage,
    faqManager,
    questionsPage,
    mockTestsPage,
  ]) {
    assert.doesNotMatch(source, /<main\b/);
  }

  for (const source of [
    faqManager,
    reportsPage,
    accessPage,
    growthPage,
    surveysPage,
  ]) {
    assert.doesNotMatch(source, /h-2 w-2 rounded-full/);
  }

  assert.match(mockTestsPage, /admin-stat/);
  assert.match(reportsPage, /admin-stat/);
  assert.match(studentsPage, /admin-stat/);
  assert.doesNotMatch(surveysPage, /animate-spin/);
  assert.match(surveysPage, /className="loading-spinner"/);
});
