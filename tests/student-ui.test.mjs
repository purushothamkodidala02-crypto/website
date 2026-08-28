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
