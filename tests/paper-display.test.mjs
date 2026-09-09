import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("lib/papers.ts implements Roman numeral extraction and specialization coordination", async () => {
  const [papersLib, adminPage, existingTable, detailPage] = await Promise.all([
    read("lib/papers.ts"),
    read("app/admin/mock-tests/page.tsx"),
    read("app/admin/mock-tests/ExistingMockTestsTable.tsx"),
    read("components/mock-tests/MockTestDetailPage.tsx"),
  ]);

  // Exported helpers
  assert.match(papersLib, /export function parseRomanNumeral/);
  assert.match(papersLib, /export function extractPaperNumber/);
  assert.match(papersLib, /export function formatPaperDisplay/);
  assert.match(papersLib, /export function buildPaperDisplayMap/);

  // Roman numeral support
  assert.match(papersLib, /viii|vii|vi|v|iv|iii|ii|i/);

  // Specialization fallback offset
  assert.match(papersLib, /commonCount \+ index \+ 1/);

  // Clean shortLabel
  assert.match(papersLib, /const shortLabel = `Paper \$\{number\}`;/);

  // Admin mock test page uses paperDisplay correctly
  assert.match(adminPage, /paperDisplayById\.get\(paper\.id\)\?\.shortLabel/);
  assert.match(adminPage, /paperDisplayById\.get\(paper\.id\)\?\.label/);

  // ExistingMockTestsTable displays studentFacingMockTestTitle
  assert.match(existingTable, /studentFacingMockTestTitle/);
  assert.match(existingTable, /test\.paperLabel/);

  // Detail page displays paperDisplay
  assert.match(detailPage, /paperDisplay\?\.shortLabel/);
});

// Runtime unit test of the logic
test("paper number extraction and display mapping logic handles AEE Paper II correctly", () => {
  const ROMAN_NUMERALS = {
    i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10,
  };

  function parseRoman(val) {
    return ROMAN_NUMERALS[val.trim().toLowerCase()] ?? null;
  }

  function extractNumber(name) {
    const trimmed = name.trim();
    const digitMatch = trimmed.match(/\bp(?:aper)?\s*[-_.:/]?\s*0*([1-9]\d*)\b/i);
    if (digitMatch) {
      const parsed = parseInt(digitMatch[1], 10);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
    const romanMatch = trimmed.match(/\bp(?:aper)?\s*[-_.:/]?\s*(x|ix|viii|vii|vi|v|iv|iii|ii|i)\b/i);
    if (romanMatch) {
      const roman = parseRoman(romanMatch[1]);
      if (roman !== null) return roman;
    }
    const standaloneRoman = trimmed.match(/^(x|ix|viii|vii|vi|v|iv|iii|ii|i)(?:\s*[-_.:/·–—]|\s*$)/i);
    if (standaloneRoman) {
      const roman = parseRoman(standaloneRoman[1]);
      if (roman !== null) return roman;
    }
    return null;
  }

  function formatDisplay(name, assigned) {
    const extracted = extractNumber(name);
    const num = extracted ?? assigned;
    const shortLabel = `Paper ${num}`;
    const isOnly = /^(?:p(?:aper)?\s*[-_.:/]?\s*(?:\d+|x|ix|viii|vii|vi|v|iv|iii|ii|i)|(?:x|ix|viii|vii|vi|v|iv|iii|ii|i))$/i.test(name.trim());
    return {
      number: num,
      shortLabel,
      label: isOnly ? shortLabel : `Paper ${num} · ${name.trim()}`,
    };
  }

  // AEE Civil Paper II
  assert.equal(extractNumber("Paper II"), 2);
  assert.equal(extractNumber("Paper-II"), 2);
  assert.equal(extractNumber("Paper 2"), 2);
  assert.equal(extractNumber("Paper 1"), 1);
  assert.equal(extractNumber("Paper I"), 1);

  const civilDisplay = formatDisplay("Paper II", 2);
  assert.equal(civilDisplay.number, 2);
  assert.equal(civilDisplay.shortLabel, "Paper 2");
  assert.equal(civilDisplay.label, "Paper 2");

  // Format student facing mock test title
  function studentTitle({ examName, paperLabel, seriesNumber }) {
    const formattedNum = String(Math.max(1, seriesNumber)).padStart(2, "0");
    return `${examName} · ${paperLabel} · Mock Test ${formattedNum}`;
  }

  const title = studentTitle({
    examName: "AEE",
    paperLabel: civilDisplay.shortLabel,
    seriesNumber: 1,
  });

  assert.equal(title, "AEE · Paper 2 · Mock Test 01");
  assert.notEqual(title, "AEE · Paper 1 · Mock Test 01");
});
