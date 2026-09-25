import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("student UI motion is scoped and respects reduced-motion preferences", async () => {
  const css = await read("app/globals.css");

  assert.match(css, /\.student-page\s*\{/);
  assert.match(css, /\.student-stagger\s*>\s*\*/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /animation:\s*none\s*!important/);
});

test("core public, account, dashboard, and assessment pages use the student surface", async () => {
  const paths = [
    "app/page.tsx",
    "app/mock-tests/page.tsx",
    "components/mock-tests/MockTestDetailPage.tsx",
    "app/login/page.tsx",
    "app/register/page.tsx",
    "app/dashboard/page.tsx",
    "app/dashboard/study-book/page.tsx",
    "app/dashboard/passes/page.tsx",
    "app/mock-tests/[id]/StudentTestRunner.tsx",
  ];

  for (const path of paths) {
    assert.match(await read(path), /student-page/, `${path} should use the student UI surface`);
  }
});

test("mobile authentication cards can shrink within the single-column grid", async () => {
  const files = await Promise.all([
    read("app/login/LoginForm.tsx"),
    read("app/register/RegisterForm.tsx"),
  ]);

  for (const source of files) assert.match(source, /min-w-0/);
});

test("student test runner and error pages follow React rules of hooks and Next.js routing conventions", async () => {
  const [runner, errorPage, studyViewer] = await Promise.all([
    read("app/mock-tests/[id]/StudentTestRunner.tsx"),
    read("app/mock-tests/[id]/attempt/error.tsx"),
    read("components/study/StudyViewer.tsx"),
  ]);

  // handleToggleFullscreen hook must appear BEFORE if (submission) conditional return
  const fullscreenHookIndex = runner.indexOf("handleToggleFullscreen = useCallback");
  const submissionReturnIndex = runner.indexOf("if (submission) {");
  assert.ok(fullscreenHookIndex !== -1, "handleToggleFullscreen should be defined");
  assert.ok(submissionReturnIndex !== -1, "submission check should exist");
  assert.ok(fullscreenHookIndex < submissionReturnIndex, "handleToggleFullscreen hook must be called unconditionally before early return");

  // attempt error page must use Next.js <Link> instead of <a> for client-side navigation
  assert.match(errorPage, /import Link from "next\/link"/);
  assert.match(errorPage, /<Link\s+href="\/dashboard"/);
  assert.match(errorPage, /<Link\s+href="\/"/);
  assert.doesNotMatch(errorPage, /<a\s+href=/);

  // StudyViewer handleNavigate must be wrapped in useCallback and use functional state update
  assert.match(studyViewer, /useCallback\(\s*\(\w+Index:\s*number\)/);
  assert.match(studyViewer, /setCurrentIndex\(\(prev\)\s*=>/);
});

