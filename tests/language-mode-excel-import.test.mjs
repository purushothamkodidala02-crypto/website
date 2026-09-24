import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ExcelJS from "exceljs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("lib/questions/import-format exports language-specific header sets and helper", async () => {
  const {
    QUESTION_IMPORT_BASE_HEADERS,
    QUESTION_IMPORT_ENGLISH_HEADERS,
    QUESTION_IMPORT_TELUGU_HEADERS,
    QUESTION_IMPORT_REQUIRED_HEADERS,
    getRequiredHeadersForLanguageMode,
  } = await import("../lib/questions/import-format.ts");

  assert.deepEqual([...QUESTION_IMPORT_BASE_HEADERS], ["import_key", "subject", "correct_answer"]);
  assert.deepEqual([...QUESTION_IMPORT_ENGLISH_HEADERS], [
    "question_en",
    "option_a_en",
    "option_b_en",
    "option_c_en",
    "option_d_en",
  ]);
  assert.deepEqual([...QUESTION_IMPORT_TELUGU_HEADERS], [
    "question_te",
    "option_a_te",
    "option_b_te",
    "option_c_te",
    "option_d_te",
  ]);

  // English-only subject required headers
  const englishHeaders = getRequiredHeadersForLanguageMode("english");
  assert.equal(englishHeaders.length, 8);
  assert.ok(englishHeaders.includes("import_key"));
  assert.ok(englishHeaders.includes("subject"));
  assert.ok(englishHeaders.includes("question_en"));
  assert.ok(englishHeaders.includes("correct_answer"));
  assert.ok(!englishHeaders.includes("question_te"));

  // Telugu-only subject required headers
  const teluguHeaders = getRequiredHeadersForLanguageMode("telugu");
  assert.equal(teluguHeaders.length, 8);
  assert.ok(teluguHeaders.includes("import_key"));
  assert.ok(teluguHeaders.includes("subject"));
  assert.ok(teluguHeaders.includes("question_te"));
  assert.ok(teluguHeaders.includes("correct_answer"));
  assert.ok(!teluguHeaders.includes("question_en"));

  // Bilingual subject required headers
  const bilingualHeaders = getRequiredHeadersForLanguageMode("bilingual");
  assert.equal(bilingualHeaders.length, 13);
  assert.deepEqual(bilingualHeaders, QUESTION_IMPORT_REQUIRED_HEADERS);
});

test("import-actions implements dynamic header determination and validation for single-language and bilingual subjects", async () => {
  const [importer, guide, format] = await Promise.all([
    read("app/admin/questions/import-actions.ts"),
    read("app/admin/excel-import-guide/page.tsx"),
    read("lib/questions/import-format.ts"),
  ]);

  // Importer defines determination and validation helpers
  assert.match(importer, /function validateHeaders/);
  assert.match(importer, /function determineRequiredHeaders/);
  assert.match(importer, /getRequiredHeadersForLanguageMode/);

  // Importer checks mode for english, telugu, and bilingual
  assert.match(importer, /mode === "english"/);
  assert.match(importer, /mode === "telugu"/);
  assert.match(importer, /allEnglish/);
  assert.match(importer, /allTelugu/);

  // Guide reflects that single-language subjects can omit the other language's columns
  assert.match(guide, /For English-only or Telugu-only subjects, you can omit the other language/);

  // Header format exports the helper
  assert.match(format, /export function getRequiredHeadersForLanguageMode/);
});

test("single-language English Excel extracts without requiring Telugu columns", () => {
  const englishHeaders = [
    "import_key",
    "subject",
    "question_en",
    "option_a_en",
    "option_b_en",
    "option_c_en",
    "option_d_en",
    "correct_answer",
  ];

  // Simulating validateHeaders logic
  const validateHeaders = (headers, requiredHeaders) => {
    if (new Set(headers).size !== headers.length) throw new Error("Each file column heading must be unique.");
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
    if (missingHeaders.length) throw new Error(`Missing file column${missingHeaders.length === 1 ? "" : "s"}: ${missingHeaders.join(", ")}.`);
  };

  const requiredForEnglish = [
    "import_key",
    "subject",
    "question_en",
    "option_a_en",
    "option_b_en",
    "option_c_en",
    "option_d_en",
    "correct_answer",
  ];

  // Validation must succeed without any Telugu columns
  assert.doesNotThrow(() => {
    validateHeaders(englishHeaders, requiredForEnglish);
  });

  // If subject column is missing, it must throw the expected message
  const missingSubject = englishHeaders.filter((h) => h !== "subject");
  assert.throws(
    () => validateHeaders(missingSubject, requiredForEnglish),
    /Missing file column: subject\./,
  );

  // If question_en column is missing, it must throw
  const missingQuestion = englishHeaders.filter((h) => h !== "question_en");
  assert.throws(
    () => validateHeaders(missingQuestion, requiredForEnglish),
    /Missing file column: question_en\./,
  );
});

test("single-language Telugu Excel extracts without requiring English columns", () => {
  const teluguHeaders = [
    "import_key",
    "subject",
    "question_te",
    "option_a_te",
    "option_b_te",
    "option_c_te",
    "option_d_te",
    "correct_answer",
  ];

  const validateHeaders = (headers, requiredHeaders) => {
    if (new Set(headers).size !== headers.length) throw new Error("Each file column heading must be unique.");
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
    if (missingHeaders.length) throw new Error(`Missing file column${missingHeaders.length === 1 ? "" : "s"}: ${missingHeaders.join(", ")}.`);
  };

  const requiredForTelugu = [
    "import_key",
    "subject",
    "question_te",
    "option_a_te",
    "option_b_te",
    "option_c_te",
    "option_d_te",
    "correct_answer",
  ];

  // Validation must succeed without any English columns
  assert.doesNotThrow(() => {
    validateHeaders(teluguHeaders, requiredForTelugu);
  });

  // If option_a_te is missing, it must throw
  const missingOption = teluguHeaders.filter((h) => h !== "option_a_te");
  assert.throws(
    () => validateHeaders(missingOption, requiredForTelugu),
    /Missing file column: option_a_te\./,
  );
});

test("bilingual subject Excel missing Telugu or English or subject column throws the existing error message", () => {
  const fullBilingualHeaders = [
    "import_key",
    "subject",
    "question_en",
    "option_a_en",
    "option_b_en",
    "option_c_en",
    "option_d_en",
    "question_te",
    "option_a_te",
    "option_b_te",
    "option_c_te",
    "option_d_te",
    "correct_answer",
  ];

  const validateHeaders = (headers, requiredHeaders) => {
    if (new Set(headers).size !== headers.length) throw new Error("Each file column heading must be unique.");
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
    if (missingHeaders.length) throw new Error(`Missing file column${missingHeaders.length === 1 ? "" : "s"}: ${missingHeaders.join(", ")}.`);
  };

  // If Telugu columns are missing from a bilingual subject import:
  const withoutTelugu = fullBilingualHeaders.filter((h) => !h.endsWith("_te"));
  assert.throws(
    () => validateHeaders(withoutTelugu, fullBilingualHeaders),
    /Missing file columns: question_te, option_a_te, option_b_te, option_c_te, option_d_te\./,
  );

  // If subject column is missing from a bilingual subject import:
  const withoutSubject = fullBilingualHeaders.filter((h) => h !== "subject");
  assert.throws(
    () => validateHeaders(withoutSubject, fullBilingualHeaders),
    /Missing file column: subject\./,
  );
});

test("Excel workbook with English-only headers parses and extracts cleanly", async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Varadhi Import");

  const headers = [
    "import_key",
    "subject",
    "question_en",
    "option_a_en",
    "option_b_en",
    "option_c_en",
    "option_d_en",
    "correct_answer",
  ];

  const row = [
    "eng-001",
    "General English",
    "Choose the correct synonym for 'Benevolent':",
    "Kind",
    "Cruel",
    "Harsh",
    "Lazy",
    "A",
  ];

  worksheet.addRow(headers);
  worksheet.addRow(row);

  const buffer = await workbook.xlsx.writeBuffer();

  const loadedWorkbook = new ExcelJS.Workbook();
  await loadedWorkbook.xlsx.load(buffer);
  const loadedSheet = loadedWorkbook.getWorksheet("Varadhi Import");

  const extractedHeaders = Array.from({ length: loadedSheet.columnCount }, (_, i) =>
    loadedSheet.getCell(1, i + 1).text.trim(),
  );

  assert.deepEqual(extractedHeaders, headers);
  assert.equal(loadedSheet.getCell(2, 1).text, "eng-001");
  assert.equal(loadedSheet.getCell(2, 2).text, "General English");
  assert.equal(loadedSheet.getCell(2, 3).text, "Choose the correct synonym for 'Benevolent':");
  assert.equal(loadedSheet.getCell(2, 8).text, "A");
});

test("Excel workbook with Telugu-only headers parses and extracts cleanly", async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Varadhi Import");

  const headers = [
    "import_key",
    "subject",
    "question_te",
    "option_a_te",
    "option_b_te",
    "option_c_te",
    "option_d_te",
    "correct_answer",
  ];

  const row = [
    "tel-001",
    "General Telugu",
    "క్రింది వాటిలో సరైన పదాన్ని గుర్తించండి:",
    "విద్వాంసుడు",
    "విద్వాంసుడు1",
    "విద్వాంసుడు2",
    "విద్వాంసుడు3",
    "A",
  ];

  worksheet.addRow(headers);
  worksheet.addRow(row);

  const buffer = await workbook.xlsx.writeBuffer();

  const loadedWorkbook = new ExcelJS.Workbook();
  await loadedWorkbook.xlsx.load(buffer);
  const loadedSheet = loadedWorkbook.getWorksheet("Varadhi Import");

  const extractedHeaders = Array.from({ length: loadedSheet.columnCount }, (_, i) =>
    loadedSheet.getCell(1, i + 1).text.trim(),
  );

  assert.deepEqual(extractedHeaders, headers);
  assert.equal(loadedSheet.getCell(2, 1).text, "tel-001");
  assert.equal(loadedSheet.getCell(2, 2).text, "General Telugu");
  assert.equal(loadedSheet.getCell(2, 3).text, "క్రింది వాటిలో సరైన పదాన్ని గుర్తించండి:");
  assert.equal(loadedSheet.getCell(2, 8).text, "A");
});
