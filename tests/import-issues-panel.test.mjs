import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("import-issues helpers validate calendar dates, suggest ISO conversions, and parse overrides", async () => {
  const {
    isValidIsoDate,
    suggestIsoDate,
    parseRowOverridesJson,
    parseExcludedRowsJson,
    formatDuplicateLocation,
  } = await import("../lib/questions/import-issues.ts");

  assert.equal(isValidIsoDate("2026-11-27"), true);
  assert.equal(isValidIsoDate("2026-02-30"), false);
  assert.equal(isValidIsoDate("27/11/2026"), false);

  assert.equal(suggestIsoDate("27/11/2026"), "2026-11-27");
  assert.equal(suggestIsoDate("27-11-2026"), "2026-11-27");
  assert.equal(suggestIsoDate("2026/11/27"), "2026-11-27");
  assert.equal(suggestIsoDate("11/25/2026"), "2026-11-25");
  assert.equal(suggestIsoDate("31/02/2026"), null);

  assert.deepEqual(
    parseRowOverridesJson(JSON.stringify({ 3: { content_lifecycle: "permanent" }, 1: { x: "bad" } })),
    { 3: { content_lifecycle: "permanent" } },
  );
  assert.deepEqual(parseRowOverridesJson("not-json"), {});

  const excluded = parseExcludedRowsJson(JSON.stringify([2, 5, 0, "abc"]));
  assert.deepEqual([...excluded], [2, 5]);

  assert.equal(
    formatDuplicateLocation({ type: "file", targetRowNumber: 4, targetQuestionNumber: 3 }),
    "Matches Row 4 (Q3) in this file",
  );
  assert.equal(
    formatDuplicateLocation({ type: "this_test", targetQuestionNumber: 12 }),
    "Already in this Mock Test (Q#12)",
  );
  assert.equal(
    formatDuplicateLocation({ type: "other_test", mockTestTitle: "Paper 1 Mock", targetQuestionNumber: 8 }),
    'In "Paper 1 Mock" (Q#8)',
  );
  assert.equal(
    formatDuplicateLocation({ type: "other_subject", subjectName: "Indian Polity" }),
    'Under subject "Indian Polity"',
  );
});

test("Excel upload UI uses concise pending labels and expandable ImportIssuesPanel", async () => {
  const [mockImport, questionImport, issuesPanel, importer] = await Promise.all([
    read("app/admin/mock-tests/[id]/edit/MockTestCsvImport.tsx"),
    read("app/admin/questions/QuestionCsvImport.tsx"),
    read("components/admin/ImportIssuesPanel.tsx"),
    read("app/admin/questions/import-actions.ts"),
  ]);

  // Short pending labels
  assert.match(mockImport, /pendingLabel="Importing…"/);
  assert.match(mockImport, /pendingLabel="Replacing…"/);
  assert.match(questionImport, /pendingLabel="Importing…"/);
  assert.doesNotMatch(mockImport, /Checking and building test…/);
  assert.doesNotMatch(mockImport, /Validating and replacing…/);
  assert.doesNotMatch(questionImport, /Checking and importing…/);

  // Popup modal features: duplicates trigger, expand toggle, inline lifecycle/date controls
  assert.match(issuesPanel, /Duplicates found/);
  assert.match(issuesPanel, /Expand/);
  assert.match(issuesPanel, /Restore/);
  assert.match(issuesPanel, /content_lifecycle/);
  assert.match(issuesPanel, /YYYY-MM-DD/);
  assert.match(issuesPanel, /Apply fixes/);

  // Importer emits structured issues and applies row overrides/exclusions
  assert.match(importer, /parseRowOverridesJson/);
  assert.match(importer, /parseExcludedRowsJson/);
  assert.match(importer, /question_order/);
  assert.match(importer, /kind:\s*"content_lifecycle"/);
  assert.match(importer, /kind:\s*"date_format"/);
});
