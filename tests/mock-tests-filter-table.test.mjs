import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("mock test filter blanks and SearchableSelect retain values on selection and don't reset to empty", async () => {
  const [
    searchableSelectSrc,
    locationFiltersSrc,
    existingTableSrc,
    createMockTestFormSrc,
  ] = await Promise.all([
    read("components/admin/SearchableSelect.tsx"),
    read("components/admin/LocationFilters.tsx"),
    read("app/admin/mock-tests/ExistingMockTestsTable.tsx"),
    read("app/admin/mock-tests/CreateMockTestForm.tsx"),
  ]);

  // 1. SearchableSelect display value and open state
  assert.match(
    searchableSelectSrc,
    /const displayValue = open \? query : \(selected\?\.label \?\? \(value \? query : ""\)\);/,
    "SearchableSelect should retain label or query when not open and value exists"
  );
  assert.match(
    searchableSelectSrc,
    /onClick=\{/s,
    "SearchableSelect input should handle onClick to reopen dropdown when already focused"
  );
  assert.match(
    searchableSelectSrc,
    /if \(!nextVal\.trim\(\) && value\) \{\s*onChange\(""\);\s*\}/,
    "SearchableSelect should only trigger onChange('') when input text is completely cleared"
  );

  // 2. LocationFilters guarded against redundant resets
  assert.match(
    locationFiltersSrc,
    /if \(categoryId === value\.categoryId\) return;/,
    "LocationFilters should not reset downstream fields if the same category is clicked"
  );
  assert.match(
    locationFiltersSrc,
    /if \(examId === value\.examId\) return;/,
    "LocationFilters should not reset downstream fields if the same exam is clicked"
  );

  // 3. ExistingMockTestsTable guarded initial props sync and popstate
  assert.match(
    existingTableSrc,
    /prevInitialLocationRef/,
    "ExistingMockTestsTable should track previous initialLocation to avoid stomping local filter selections"
  );
  assert.match(
    existingTableSrc,
    /window\.addEventListener\("popstate", handlePopState\)/,
    "ExistingMockTestsTable should handle browser popstate navigation"
  );

  // 4. CreateMockTestForm guarded reset handlers
  assert.match(
    createMockTestFormSrc,
    /if \(value === categoryId\) return;/,
    "CreateMockTestForm should not wipe fields if same category is clicked"
  );
  assert.match(
    createMockTestFormSrc,
    /if \(value === examId\) return;/,
    "CreateMockTestForm should not wipe fields if same exam is clicked"
  );
});

test("ExistingMockTestsTable displays sub-topic tag and uses clean Mock Test label heading without repeating exam & paper", async () => {
  const [existingTableSrc, adminPageSrc, manageActionsSrc] = await Promise.all([
    read("app/admin/mock-tests/ExistingMockTestsTable.tsx"),
    read("app/admin/mock-tests/page.tsx"),
    read("app/admin/mock-tests/manage-actions.ts"),
  ]);

  // 1. ExistingMockTestsTable displays sub-topic section tag when present
  assert.match(
    existingTableSrc,
    /test\.sectionName\s*&&\s*\(/,
    "ExistingMockTestsTable should render tag badge for sub-topic / section"
  );
  assert.match(
    existingTableSrc,
    /sectionName\?\:\s*string\s*\|\s*null/,
    "ExistingMockTest type should include optional sectionName"
  );

  // 2. Heading uses clean mock test label instead of repeating exam and paper
  assert.match(
    existingTableSrc,
    /\{mockTestLabel\(test\.seriesNumber\)\}/,
    "ExistingMockTestsTable should display clean Mock Test label in card heading"
  );

  // 3. Search query includes section name for sub-topic matching
  assert.match(
    existingTableSrc,
    /test\.sectionName\s*\?\?\s*""/,
    "ExistingMockTestsTable search filter should include sectionName"
  );

  // 4. Admin mock tests page resolves subject sections for mappedTests
  assert.match(
    adminPageSrc,
    /const\s+section\s*=\s*test\.subject_section_id\s*\?\s*sectionById\.get\(test\.subject_section_id\)\s*:\s*undefined/,
    "Admin mock tests page should resolve section from sectionById"
  );
  assert.match(
    adminPageSrc,
    /sectionName:\s*section\?\.name\s*\?\?\s*null/,
    "Admin mock tests page should map sectionName onto mappedTests"
  );

  // 5. Title sync in manage-actions preserves subject sections
  assert.match(
    manageActionsSrc,
    /subject_section_id/,
    "syncAllMockTestTitles should select subject_section_id"
  );
  assert.match(
    manageActionsSrc,
    /sectionName:\s*section\?\.name/,
    "syncAllMockTestTitles should preserve sectionName in buildMockTestTitle"
  );
});
