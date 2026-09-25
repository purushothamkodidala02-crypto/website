import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("admin navigation sidebar maintains correct active state isolation and distinct route icons", async () => {
  const [navContent, shellContent] = await Promise.all([
    read("components/admin/AdminNavigation.tsx"),
    read("components/admin/AdminShell.tsx"),
  ]);

  // 1. /admin/subjects is decoupled from /admin/exams to prevent double-highlighting
  assert.doesNotMatch(
    navContent,
    /href === "\/admin\/exams"[\s\S]*?"\/admin\/subjects"/,
    "/admin/exams must not match /admin/subjects because subjects has its own navigation item"
  );

  // 2. Boundary-aware matching is enforced
  assert.match(navContent, /pathname\.startsWith\(path \+ "\/"\)/);
  assert.match(navContent, /pathname\.startsWith\(href \+ "\/"\)/);

  // 3. Distinct icons for similarity scanner and surveys
  assert.match(navContent, /icon:\s*"similarity"/);
  assert.match(navContent, /icon:\s*"surveys"/);
  assert.match(navContent, /name === "similarity"/);
  assert.match(navContent, /name === "surveys"/);

  // 4. AdminShell persists collapsed state across page refreshes
  assert.match(shellContent, /varadhi_admin_sidebar_collapsed/);
  assert.match(shellContent, /localStorage\.getItem/);
  assert.match(shellContent, /localStorage\.setItem/);

  // 5. Scrollbar styling supports smooth scrolling without layout issues
  assert.match(navContent, /scrollbar-width:thin/);
  assert.match(navContent, /&::-webkit-scrollbar/);

  // 6. Bottom portal link provides clean icon and tooltip in collapsed mode
  assert.match(navContent, /NavIcon name="portal"/);
  assert.match(navContent, /Student portal \(Open in new tab\)/);
});
