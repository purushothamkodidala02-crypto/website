import assert from "node:assert/strict";
import test from "node:test";
import { parseMockTestTitle } from "../lib/exam-catalog.ts";

test("parseMockTestTitle parses 4-level mock test titles with bullets or middle dots", () => {
  const input = "AP Endowment Officer • Hindu Philosophy & Temple System • Philosophies & Gurus • Mock Test 02";
  const result = parseMockTestTitle(input);

  assert.deepEqual(result.breadcrumb, [
    "AP Endowment Officer",
    "Hindu Philosophy & Temple System",
  ]);
  assert.equal(result.primaryTitle, "Philosophies & Gurus");
  assert.equal(result.testLabel, "Mock Test 02");
  assert.equal(result.topic, "Philosophies & Gurus");
  assert.equal(result.title, "Mock Test 02");
});

test("parseMockTestTitle parses titles with middle dots (·)", () => {
  const input = "AP Endowment Officer · Hindu Philosophy & Temple System · Philosophies & Gurus · Mock Test 02";
  const result = parseMockTestTitle(input);

  assert.deepEqual(result.breadcrumb, [
    "AP Endowment Officer",
    "Hindu Philosophy & Temple System",
  ]);
  assert.equal(result.primaryTitle, "Philosophies & Gurus");
  assert.equal(result.testLabel, "Mock Test 02");
});

test("parseMockTestTitle parses 3-level mock test titles without subject (paper mock)", () => {
  const input = "TGPSC Group 2 · Paper 1 - General Studies · Mock Test 05";
  const result = parseMockTestTitle(input);

  assert.deepEqual(result.breadcrumb, [
    "TGPSC Group 2",
  ]);
  assert.equal(result.primaryTitle, "Paper 1 - General Studies");
  assert.equal(result.testLabel, "Mock Test 05");
});

test("parseMockTestTitle handles 2-level or 1-level fallback titles gracefully", () => {
  const twoLevel = parseMockTestTitle("AP Police SI · Mock Test 01");
  assert.deepEqual(twoLevel.breadcrumb, []);
  assert.equal(twoLevel.primaryTitle, "AP Police SI");
  assert.equal(twoLevel.testLabel, "Mock Test 01");

  const single = parseMockTestTitle("Custom Scholarship Test 2026");
  assert.deepEqual(single.breadcrumb, []);
  assert.equal(single.primaryTitle, "Custom Scholarship Test 2026");
  assert.equal(single.testLabel, "");

  const empty = parseMockTestTitle("");
  assert.equal(empty.primaryTitle, "Mock Test");
  assert.equal(empty.testLabel, "");
});

test("admin mock test edit page resolves recruiting board directly from categories map", async () => {
  const { readFile } = await import("node:fs/promises");
  const editPage = await readFile(new URL("../app/admin/mock-tests/[id]/edit/page.tsx", import.meta.url), "utf8");

  // Ensure it doesn't do categories.get(...)?.name which returns undefined on string maps
  assert.doesNotMatch(editPage, /categories\.get\(group\?\.exam_id\s*\?\?\s*""\)\?\.name/);
  assert.match(editPage, /categories\.get\(group\?\.exam_id\s*\?\?\s*""\)\s*\?\?\s*"Unknown Recruiting Board"/);
});

