import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  formatExamFallbackDescription,
  formatExamFallbackTitle,
  formatExamHeading,
} from "../lib/exam-catalog.ts";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("formatExamHeading prevents duplicate 'Mock Tests' when exam name already contains test phrases", () => {
  assert.equal(
    formatExamHeading("Telangana Police Constable Mock Test Series 2026"),
    "Telangana Police Constable Mock Test Series 2026",
  );
  assert.equal(
    formatExamHeading("TSPSC Group 1 Mock Tests"),
    "TSPSC Group 1 Mock Tests",
  );
  assert.equal(
    formatExamHeading("APPSC Group 2 Test Series"),
    "APPSC Group 2 Test Series",
  );
  assert.equal(
    formatExamHeading("RRB NTPC Mock-Test"),
    "RRB NTPC Mock-Test",
  );
  assert.equal(
    formatExamHeading("Police Constable"),
    "Police Constable Mock Tests",
  );
  assert.equal(
    formatExamHeading("Telangana Police Constable"),
    "Telangana Police Constable Mock Tests",
  );
});

test("formatExamFallbackTitle and Description prevent redundant titles or state repetition", () => {
  assert.equal(
    formatExamFallbackTitle("Telangana Police Constable Mock Test Series 2026", "Telangana"),
    "Telangana Police Constable Mock Test Series 2026",
  );
  assert.equal(
    formatExamFallbackTitle("Police Constable Mock Test Series 2026", "Telangana"),
    "Police Constable Mock Test Series 2026 in Telangana",
  );
  assert.equal(
    formatExamFallbackTitle("Police Constable", "Telangana"),
    "Police Constable Mock Tests in Telangana",
  );

  assert.equal(
    formatExamFallbackDescription("Telangana Police Constable Mock Test Series 2026", "Telangana"),
    "Practise free Telangana Police Constable Mock Test Series 2026 on Varadhi Prep. Take timed online practice tests, review comprehensive explanations, and improve your score.",
  );
  assert.equal(
    formatExamFallbackDescription("Police Constable", "Telangana"),
    "Practise free Police Constable mock tests for Telangana on Varadhi Prep. Take timed online practice tests, review comprehensive explanations, and improve your score.",
  );
});

test("exam landing page template uses dynamic heading formatter without hardcoding", async () => {
  const examRoute = await read("app/mock-tests/[id]/[exam]/page.tsx");
  assert.match(examRoute, /formatExamHeading\(context\.exam\.name\)/);
  assert.doesNotMatch(examRoute, /\{context\.exam\.name\}\s+Mock Tests/);
  assert.match(examRoute, /mock test papers/);
});
