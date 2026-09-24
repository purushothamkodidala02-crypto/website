import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("mock test series calculation fills gaps and supports manual override", async () => {
  const [createFormSrc, createActionSrc, editActionSrc, editFormSrc] = await Promise.all([
    read("app/admin/mock-tests/CreateMockTestForm.tsx"),
    read("app/admin/mock-tests/actions.ts"),
    read("app/admin/mock-tests/[id]/edit/actions.ts"),
    read("app/admin/mock-tests/[id]/edit/EditMockTestForm.tsx"),
  ]);

  // 1. CreateMockTestForm gap filling logic
  assert.match(
    createFormSrc,
    /while\s*\(existingNumbersSet\.has\(num\)\)\s*\{\s*num\+\+;\s*\}/,
    "CreateMockTestForm should find lowest unused positive integer to fill gaps"
  );
  assert.match(
    createFormSrc,
    /name="series_number"/,
    "CreateMockTestForm should render editable series_number input"
  );
  assert.match(
    createFormSrc,
    /Series Gap Detected/,
    "CreateMockTestForm should notify admin when a deleted series gap is detected"
  );

  // 2. createMockTest server action handles gap-filling and requested series_number
  assert.match(
    createActionSrc,
    /while\s*\(existingSet\.has\(firstAvailableNumber\)\)\s*\{\s*firstAvailableNumber\+\+;\s*\}/,
    "createMockTest should compute firstAvailableNumber on the server"
  );
  assert.match(
    createActionSrc,
    /formData\.get\("series_number"\)/,
    "createMockTest should support explicit series_number from formData"
  );
  assert.match(
    createActionSrc,
    /already exists in this series/,
    "createMockTest should validate uniqueness before inserting"
  );

  // 3. updateMockTest allows editing series_number
  assert.match(
    editActionSrc,
    /formData\.get\("series_number"\)/,
    "updateMockTest should read series_number from formData"
  );
  assert.match(
    editFormSrc,
    /name="series_number"/,
    "EditMockTestForm should render editable series_number input"
  );
});
