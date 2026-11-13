import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { isEditableElement } from "../lib/copy-protection.ts";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("site root layout permits text selection without select-none class", async () => {
  const [layout, component] = await Promise.all([
    read("app/layout.tsx"),
    read("components/site/CopyProtection.tsx"),
  ]);

  // Root layout renders CopyProtection
  assert.match(layout, /import\s*\{\s*CopyProtection\s*\}\s*from\s*["']@\/components\/site\/CopyProtection["']/);
  assert.match(layout, /<CopyProtection\s*\/>/);

  // Root body does NOT enforce select-none so text selection and copying are permitted
  assert.doesNotMatch(layout, /<body[^>]*\bselect-none\b/);

  // Component is a client component
  assert.match(component, /^"use client"/);
});

test("globals.css sets universal user-select text and visible selection highlights", async () => {
  const css = await read("app/globals.css");

  // html, body user-select is enabled for text copying
  assert.match(css, /html,\s*body\s*\{[^}]*-webkit-user-select:\s*text;/);
  assert.match(css, /html,\s*body\s*\{[^}]*user-select:\s*text;/);
  assert.doesNotMatch(css, /html,\s*body\s*\{[^}]*user-select:\s*none;/);

  // Touch callout is not blocked so mobile users can long-press to copy
  assert.doesNotMatch(css, /html,\s*body\s*\{[^}]*-webkit-touch-callout:\s*none;/);

  // Form controls preserve text selection
  assert.match(css, /input,\s*textarea,\s*\[contenteditable=["']true["']\][^\{]*\{[^}]*user-select:\s*text;/);

  // Selection highlight is visible (#a7f3d0) for clear feedback when copying
  assert.match(css, /::selection\s*\{[^}]*background:\s*#a7f3d0;/);
});

test("isEditableElement helper correctly distinguishes form inputs from static content", () => {
  // Mock element generator for node test environment
  const mockElement = (tagName, isContentEditable = false, parent = null) => {
    const el = {
      tagName: tagName.toUpperCase(),
      isContentEditable,
      parentElement: parent,
      closest(selector) {
        const matchesTag = selector
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .some((token) => token === this.tagName.toLowerCase());
        if (matchesTag) return this;
        if (this.isContentEditable && selector.includes("contenteditable")) return this;
        return this.parentElement ? this.parentElement.closest(selector) : null;
      },
    };
    return el;
  };

  // Inputs and textareas must be editable
  const inputEl = mockElement("input");
  const textareaEl = mockElement("textarea");
  const contentEditableEl = mockElement("div", true);
  const childOfInput = mockElement("span", false, inputEl);

  assert.equal(isEditableElement(inputEl), true);
  assert.equal(isEditableElement(textareaEl), true);
  assert.equal(isEditableElement(contentEditableEl), true);
  assert.equal(isEditableElement(childOfInput), true);

  // Question paragraphs, options, headings, body, buttons must NOT be editable
  const pEl = mockElement("p");
  const divEl = mockElement("div");
  const headingEl = mockElement("h1");
  const buttonEl = mockElement("button");
  const nullEl = null;

  assert.equal(isEditableElement(pEl), false);
  assert.equal(isEditableElement(divEl), false);
  assert.equal(isEditableElement(headingEl), false);
  assert.equal(isEditableElement(buttonEl), false);
  assert.equal(isEditableElement(nullEl), false);
});

test("CopyProtection does not block clipboard or text selection events for any users or admins", async () => {
  const component = await read("components/site/CopyProtection.tsx");

  // Does NOT prevent default or wipe clipboardData on copy or cut
  assert.doesNotMatch(component, /e\.preventDefault\(\)/);
  assert.doesNotMatch(component, /clipboardData\.setData/);
  assert.doesNotMatch(component, /selection\.removeAllRanges\(\)/);

  // Does NOT block keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+A)
  assert.doesNotMatch(component, /key\s*===\s*["']c["']/);
  assert.doesNotMatch(component, /key\s*===\s*["']a["']/);
});

test("admin layout maintains select-text and admin-workspace marker", async () => {
  const adminLayout = await read("app/admin/layout.tsx");

  assert.match(adminLayout, /admin-workspace/);
  assert.match(adminLayout, /select-text/);
});
