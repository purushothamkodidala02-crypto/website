import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolveStudentDisplayInfo } from "../lib/student-name.ts";

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

test("mock test submit controls remain visible and accessible on mobile viewports", async () => {
  const [runner, submissionDialog] = await Promise.all([
    read("app/mock-tests/[id]/StudentTestRunner.tsx"),
    read("app/mock-tests/[id]/SubmissionDialog.tsx"),
  ]);

  // Dynamic viewport height prevents footer from being hidden below mobile browser chrome
  assert.match(runner, /h-\[100dvh\]/);
  assert.match(runner, /max-h-\[100dvh\]/);

  // Footer navigation has safe-area inset padding for mobile gestures and home bar
  assert.match(runner, /safe-area-inset-bottom/);

  // Runner header has a direct submit button for immediate access
  assert.match(runner, /title="Submit test"[\s\S]*>\s*Submit\s*</);

  // Question palette overlay has dynamic viewport and accessible submit button
  assert.match(runner, /max-h-\[88dvh\]/);
  assert.doesNotMatch(runner, /Submit \/ Finish test/);

  // Submission dialog fits within dynamic viewport and handles safe-area padding
  assert.match(submissionDialog, /max-h-\[92dvh\]/);
  assert.match(submissionDialog, /safe-area-inset-bottom/);
  assert.match(submissionDialog, /overflow-y-auto/);
});


test("split-screen and narrow viewport layout stays single-line, balanced, and non-cramping", async () => {
  const [globalsCss, runner, formattedQuestion] = await Promise.all([
    read("app/globals.css"),
    read("app/mock-tests/[id]/StudentTestRunner.tsx"),
    read("components/questions/FormattedQuestionText.tsx"),
  ]);

  // Student-page element defaults live inside @layer base so utilities like truncate win
  assert.match(globalsCss, /@layer base\s*\{[\s\S]*\.student-page\s+:where\(h1,\s*h2,\s*h3\)/);
  assert.match(globalsCss, /@media\s*\(pointer:\s*coarse\)/);

  // Split-screen runner header allows wrapping and single-line question indicator
  assert.match(runner, /flex flex-wrap items-center justify-between/);
  assert.match(runner, /window\.innerWidth >= 960/);
  assert.match(runner, /whitespace-nowrap[\s\S]*Question/);

  // Matching layouts respond to container width rather than only viewport width
  assert.match(formattedQuestion, /@container/);
  assert.match(formattedQuestion, /@\[460px\]:grid-cols-2/);
});

test("resolveStudentDisplayInfo formats metadata names and email fallbacks cleanly", () => {
  assert.deepEqual(
    resolveStudentDisplayInfo({
      fullName: "Ravi Kumar",
      name: "ravi",
      email: "ravi.k@example.com",
    }),
    { displayName: "Ravi Kumar", firstName: "Ravi", avatarLetter: "R" },
  );

  assert.deepEqual(
    resolveStudentDisplayInfo({
      fullName: "",
      name: "Anusha",
      email: "anusha@example.com",
    }),
    { displayName: "Anusha", firstName: "Anusha", avatarLetter: "A" },
  );

  assert.deepEqual(
    resolveStudentDisplayInfo({
      email: "sai_krishna.reddy@example.com",
    }),
    { displayName: "Sai Krishna Reddy", firstName: "Sai", avatarLetter: "S" },
  );

  assert.deepEqual(resolveStudentDisplayInfo({}), {
    displayName: "Student",
    firstName: "Student",
    avatarLetter: "S",
  });
});

test("student name tags and catalog/exam cards avoid aggressive ellipsis clipping", async () => {
  const [accountActions, dashboardPage, catalogPage, examPage, examGrid, catalogSteps, submissionResult] =
    await Promise.all([
      read("components/site/PublicAccountActions.tsx"),
      read("app/dashboard/page.tsx"),
      read("app/mock-tests/page.tsx"),
      read("app/mock-tests/[id]/[exam]/page.tsx"),
      read("components/exams/ExamSelectionGrid.tsx"),
      read("components/exams/CatalogSteps.tsx"),
      read("app/mock-tests/[id]/SubmissionResult.tsx"),
    ]);

  assert.match(accountActions, /resolveStudentDisplayInfo/);
  assert.doesNotMatch(accountActions, /href="\/dashboard"/);
  assert.match(dashboardPage, /resolveStudentDisplayInfo/);
  assert.match(dashboardPage, /parseMockTestTitle/);
  assert.doesNotMatch(catalogPage, /max-w-\[62%\] truncate/);
  assert.doesNotMatch(examGrid, /max-w-\[65%\] truncate/);
  assert.doesNotMatch(examPage, /max-w-\[65%\].*truncate/);
  assert.match(catalogSteps, /grid-cols-2 sm:grid-cols-4/);
  assert.match(submissionResult, /whitespace-normal break-words[\s\S]{0,120}Continue to \{folderName \?\? "folder"\} →/);
  assert.doesNotMatch(submissionResult, /<span className="truncate">Continue to/);
});

test("student screens adapt cleanly across narrow, split-screen, and notched viewports", async () => {
  const [layout, globalsCss, publicHeader, mockDetail, submissionResult, submissionDialog, runner, studyViewer] =
    await Promise.all([
      read("app/layout.tsx"),
      read("app/globals.css"),
      read("components/site/PublicHeader.tsx"),
      read("components/mock-tests/MockTestDetailPage.tsx"),
      read("app/mock-tests/[id]/SubmissionResult.tsx"),
      read("app/mock-tests/[id]/SubmissionDialog.tsx"),
      read("app/mock-tests/[id]/StudentTestRunner.tsx"),
      read("components/study/StudyViewer.tsx"),
    ]);

  assert.match(layout, /viewportFit:\s*"cover"/);
  assert.match(globalsCss, /\.student-page[\s\S]*max-inline-size:\s*100%/);
  assert.match(globalsCss, /\.student-page\s+:where\(img,\s*video\)\s*\{[\s\S]*max-inline-size:\s*100%/);
  assert.match(publicHeader, /safe-area-inset-left/);
  assert.match(publicHeader, /safe-area-inset-right/);
  assert.match(mockDetail, /grid-cols-2[\s\S]{0,40}lg:grid-cols-5/);
  assert.doesNotMatch(mockDetail, /md:grid-cols-5/);
  assert.match(submissionResult, /grid-cols-2 min-\[400px\]:grid-cols-3/);
  assert.match(submissionDialog, /grid-cols-2 min-\[380px\]:grid-cols-3/);
  assert.match(runner, /grid-cols-4 min-\[360px\]:grid-cols-5 xl:grid-cols-6/);
  assert.match(runner, /min-\[360px\]:hidden">Prev</);
  assert.match(studyViewer, /flex min-w-0 flex-wrap items-center/);
});

test("login page follows modern autofill, mobile-first order, and shared email switching", async () => {
  const [loginPage, loginForm, emailOtpForm, passwordInput, googleButton] = await Promise.all([
    read("app/login/page.tsx"),
    read("app/login/LoginForm.tsx"),
    read("app/login/EmailOtpLoginForm.tsx"),
    read("components/auth/PasswordInput.tsx"),
    read("components/auth/GoogleSignInButton.tsx"),
  ]);

  assert.match(loginPage, /order-1 md:order-2/);
  assert.match(loginPage, /order-2 md:order-1/);
  assert.match(loginForm, /autoComplete="username"/);
  assert.match(loginForm, /spellCheck=\{false\}/);
  assert.match(loginForm, /autoComplete="current-password"/);
  assert.match(loginForm, /enterKeyHint="done"/);
  assert.match(loginForm, /onEmailChange=\{setEmail\}/);
  assert.match(emailOtpForm, /autoComplete="username"/);
  assert.match(emailOtpForm, /spellCheck=\{false\}/);
  assert.match(passwordInput, /min-h-12/);
  assert.match(googleButton, /Math\.max\(220,/);
});
