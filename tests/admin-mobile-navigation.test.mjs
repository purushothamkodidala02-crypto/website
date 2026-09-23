import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("admin navigation provides a sticky mobile header and off-canvas side drawer", async () => {
  const [navContent, layoutContent, logoutContent] = await Promise.all([
    read("components/admin/AdminNavigation.tsx"),
    read("app/admin/layout.tsx"),
    read("components/admin/LogoutButton.tsx"),
  ]);

  // 1. Mobile sticky header exists and is scoped to md:hidden
  assert.match(navContent, /sticky top-0 z-30.*md:hidden/);
  assert.match(navContent, /aria-label="Open admin side navigation"/);
  assert.match(navContent, /aria-controls="admin-mobile-drawer"/);

  // 2. Mobile side navigation is rendered via portal as an off-canvas drawer with dialog semantics
  assert.match(navContent, /createPortal/);
  assert.match(navContent, /id="admin-mobile-drawer"/);
  assert.match(navContent, /role="dialog"/);
  assert.match(navContent, /aria-label="Admin side navigation"/);
  assert.match(navContent, /-translate-x-full/);
  assert.match(navContent, /translate-x-0/);

  // 3. Accessibility & UX: Escape listener, body overflow lock, onLinkClick auto-close
  assert.match(navContent, /event\.key === "Escape"|e\.key === "Escape"/);
  assert.match(navContent, /document\.body\.style\.overflow = "hidden"/);
  assert.match(navContent, /onLinkClick/);
  assert.match(navContent, /onClick=\{onLinkClick\}/);

  // 4. Admin layout hides the desktop header on mobile to prevent duplicate stacked headers
  assert.match(layoutContent, /hidden min-h-18.*md:flex/);

  // 5. LogoutButton supports className for custom dark mobile bar integration
  assert.match(logoutContent, /className\?: string/);
});
