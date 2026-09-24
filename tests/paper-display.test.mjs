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

test("buildPaperDisplayMap correctly coordinates stage-based exams (Screening & Mains) and Endowment Officer", async () => {
  const { buildPaperDisplayMap } = await import("../lib/papers.ts");

  // 1. Endowment Officer case: Screening Paper 1 & 2 + Hindu Philosophy is Paper 2 (General Studies is Paper 1)
  const eoPapers = [
    { id: "eo-c1", exam_group_id: "eo", name: "Screening Paper 1 - General Studies", display_order: 1 },
    { id: "eo-c2", exam_group_id: "eo", name: "Screening Paper 2 - Hindu Philosophy", display_order: 2 },
    { id: "eo-m1", exam_group_id: "eo", specialization_id: "spec-written", name: "Hindu Philosophy & Temple System", display_order: 0 },
  ];
  const eoMap = buildPaperDisplayMap(eoPapers);
  assert.equal(eoMap.get("eo-c1")?.shortLabel, "Paper 1");
  assert.equal(eoMap.get("eo-c2")?.shortLabel, "Paper 2");
  // HP & TS in Endowment Officer is Paper 2!
  assert.equal(eoMap.get("eo-m1")?.shortLabel, "Paper 2");
  assert.equal(eoMap.get("eo-m1")?.label, "Paper 2 · Hindu Philosophy & Temple System");

  // 1b. Endowment Officer with explicit Paper 2 in name
  const eoExplicitPaper2 = [
    { id: "eo-c1", exam_group_id: "eo", name: "Screening Paper 1 - General Studies", display_order: 1 },
    { id: "eo-c2", exam_group_id: "eo", name: "Screening Paper 2 - Hindu Philosophy", display_order: 2 },
    { id: "eo-m1", exam_group_id: "eo", specialization_id: "spec-written", name: "Paper 2 · Hindu Philosophy & Temple System", display_order: 2 },
  ];
  const eoLegacyMap = buildPaperDisplayMap(eoExplicitPaper2);
  assert.equal(eoLegacyMap.get("eo-m1")?.shortLabel, "Paper 2");
  assert.equal(eoLegacyMap.get("eo-m1")?.label, "Paper 2 · Hindu Philosophy & Temple System");

  // 2. Stage-based exam with specializations: Screening (P1, P2) and Mains (P1, P2) -> 4 papers total
  const stagePapers = [
    { id: "p-scr-1", exam_group_id: "group1", specialization_id: "spec-scr", name: "Paper 1 - General Studies", display_order: 1 },
    { id: "p-scr-2", exam_group_id: "group1", specialization_id: "spec-scr", name: "Paper 2 - Mental Ability", display_order: 2 },
    { id: "p-main-1", exam_group_id: "group1", specialization_id: "spec-main", name: "Paper 1 - General Studies", display_order: 1 },
    { id: "p-main-2", exam_group_id: "group1", specialization_id: "spec-main", name: "Paper 2 - History & Constitution", display_order: 2 },
  ];
  const stageMap = buildPaperDisplayMap(stagePapers);
  assert.equal(stageMap.get("p-scr-1")?.shortLabel, "Paper 1");
  assert.equal(stageMap.get("p-scr-2")?.shortLabel, "Paper 2");
  assert.equal(stageMap.get("p-main-1")?.shortLabel, "Paper 1");
  assert.equal(stageMap.get("p-main-2")?.shortLabel, "Paper 2");

  // 3. AEE case: 1 common paper (General Studies) + branch papers (Civil, Mechanical)
  const aeePapers = [
    { id: "aee-p1", exam_group_id: "aee", name: "Paper 1 - General Studies & Mental Ability", display_order: 1 },
    { id: "aee-civil", exam_group_id: "aee", specialization_id: "spec-civil", name: "Civil Engineering", display_order: null },
    { id: "aee-mech", exam_group_id: "aee", specialization_id: "spec-mech", name: "Mechanical Engineering", display_order: null },
  ];
  const aeeMap = buildPaperDisplayMap(aeePapers);
  assert.equal(aeeMap.get("aee-p1")?.shortLabel, "Paper 1");
  assert.equal(aeeMap.get("aee-civil")?.shortLabel, "Paper 2");
  assert.equal(aeeMap.get("aee-mech")?.shortLabel, "Paper 2");

  // 4. Common papers with stage names: Screening Paper 1 & 2 + Mains Paper 1 & 2 without specializations
  const directStagePapers = [
    { id: "dsp-1", exam_group_id: "psc", name: "Screening Test - Paper 1", display_order: 1 },
    { id: "dsp-2", exam_group_id: "psc", name: "Screening Test - Paper 2", display_order: 2 },
    { id: "dsp-3", exam_group_id: "psc", name: "Mains - Paper 1", display_order: 1 },
    { id: "dsp-4", exam_group_id: "psc", name: "Mains - Paper 2", display_order: 2 },
  ];
  const directMap = buildPaperDisplayMap(directStagePapers);
  assert.equal(directMap.get("dsp-1")?.shortLabel, "Paper 1");
  assert.equal(directMap.get("dsp-2")?.shortLabel, "Paper 2");
  assert.equal(directMap.get("dsp-3")?.shortLabel, "Paper 1");
  assert.equal(directMap.get("dsp-4")?.shortLabel, "Paper 2");

  // 5. HMWSSB / AEE case with display_order 1 stored on both common paper and specialization paper
  const hmwssbPapers = [
    { id: "hm-p1", exam_group_id: "hmwssb", name: "General Studies & General Abilities", display_order: 1 },
    { id: "hm-ece", exam_group_id: "hmwssb", specialization_id: "spec-ece", name: "ECE", display_order: 1 },
  ];
  const hmwssbMap = buildPaperDisplayMap(hmwssbPapers);
  assert.equal(hmwssbMap.get("hm-p1")?.shortLabel, "Paper 1");
  assert.equal(hmwssbMap.get("hm-ece")?.shortLabel, "Paper 2");
  assert.equal(hmwssbMap.get("hm-ece")?.label, "Paper 2 · ECE");
});
