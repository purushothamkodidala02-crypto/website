import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { isEditableElement } from "../lib/copy-protection.ts";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("site root layout wires global CopyProtection and applies select-none", async () => {
  const [layout, component] = await Promise.all([
    read("app/layout.tsx"),
    read("components/site/CopyProtection.tsx"),
  ]);

  // Root layout imports and renders CopyProtection
  assert.match(layout, /import\s*\{\s*CopyProtection\s*\}\s*from\s*["']@\/components\/site\/CopyProtection["']/);
  assert.match(layout, /<CopyProtection\s*\/>/);

  // Root body enforces select-none
  assert.match(layout, /<body[^>]*\bselect-none\b/);

  // Component is a client component
  assert.match(component, /^"use client"/);
});

test("globals.css sets universal user-select none, callout blocking, and transparent selection", async () => {
  const css = await read("app/globals.css");

  // html, body user-select blocking and iOS touch callout blocking
  assert.match(css, /html,\s*body\s*\{[^}]*-webkit-user-select:\s*none;/);
  assert.match(css, /html,\s*body\s*\{[^}]*user-select:\s*none;/);
  assert.match(css, /html,\s*body\s*\{[^}]*-webkit-touch-callout:\s*none;/);

  // Form controls preserve text selection for legitimate student interaction
  assert.match(css, /input,\s*textarea,\s*\[contenteditable=["']true["']\][^\{]*\{[^}]*user-select:\s*text;/);

  // Images cannot be dragged out of the page
  assert.match(css, /img\s*\{[^}]*-webkit-user-drag:\s*none;/);

  // Selection highlight is transparent by default for protected content
  assert.match(css, /::selection\s*\{[^}]*background:\s*transparent;/);

  // Inputs preserve visible selection highlight
  assert.match(css, /input::selection,\s*textarea::selection/);
});

test("isEditableElement helper correctly distinguishes form inputs from protected content", () => {
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

test("CopyProtection hooks into copy, cut, dragstart, selectstart, contextmenu, and keydown", async () => {
  const component = await read("components/site/CopyProtection.tsx");

  // Capturing listeners registered for all relevant clipboard and selection events
  assert.match(component, /addEventListener\(["']copy["'],\s*handleCopy,\s*true\)/);
  assert.match(component, /addEventListener\(["']cut["'],\s*handleCut,\s*true\)/);
  assert.match(component, /addEventListener\(["']selectstart["'],\s*handleSelectStart,\s*true\)/);
  assert.match(component, /addEventListener\(["']dragstart["'],\s*handleDragStart,\s*true\)/);
  assert.match(component, /addEventListener\(["']contextmenu["'],\s*handleContextMenu,\s*true\)/);
  assert.match(component, /addEventListener\(["']keydown["'],\s*handleKeyDown,\s*true\)/);

  // Clean-up on unmount
  assert.match(component, /removeEventListener\(["']copy["']/);
  assert.match(component, /removeEventListener\(["']cut["']/);
  assert.match(component, /removeEventListener\(["']selectstart["']/);
  assert.match(component, /removeEventListener\(["']dragstart["']/);
  assert.match(component, /removeEventListener\(["']contextmenu["']/);
  assert.match(component, /removeEventListener\(["']keydown["']/);

  // Clipboard wiping and selection clearing
  assert.match(component, /clipboardData\.setData\(["']text\/plain["'],\s*["']["']\)/);
  assert.match(component, /selection\.removeAllRanges\(\)/);

  // Keydown intercepts Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+P
  assert.match(component, /key\s*===\s*["']c["']/);
  assert.match(component, /key\s*===\s*["']x["']/);
  assert.match(component, /key\s*===\s*["']a["']/);
  assert.match(component, /key\s*===\s*["']p["']/);

  // Admin routes are exempted so administrators can manage test content
  assert.match(component, /pathname\?\.startsWith\(["']\/admin["']\)/);
  assert.match(component, /if\s*\(isAdmin\)\s*return/);
});

test("admin layout maintains select-text and admin-workspace marker", async () => {
  const adminLayout = await read("app/admin/layout.tsx");

  assert.match(adminLayout, /admin-workspace/);
  assert.match(adminLayout, /select-text/);
});
