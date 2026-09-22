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
