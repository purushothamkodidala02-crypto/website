import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Excel 97-2003 (.xls) format is accepted across admin import forms and guides", async () => {
  const [importer, questionImport, mockTestImport, guide] = await Promise.all([
    read("app/admin/questions/import-actions.ts"),
    read("app/admin/questions/QuestionCsvImport.tsx"),
    read("app/admin/mock-tests/[id]/edit/MockTestCsvImport.tsx"),
    read("app/admin/excel-import-guide/page.tsx"),
  ]);

  // Importer checks
  assert.match(importer, /import \* as XLSX from "xlsx"/);
  assert.match(importer, /d0cf11e0a1b11ae1/);
  assert.match(importer, /extension === "xlsx" \|\| extension === "xls"/);
  assert.match(importer, /bookType:\s*"xlsx"/);

  // Form input accept attributes include .xls and application/vnd.ms-excel
  assert.match(questionImport, /\.xls/);
  assert.match(questionImport, /application\/vnd\.ms-excel/);
  assert.match(mockTestImport, /\.xls/);
  assert.match(mockTestImport, /application\/vnd\.ms-excel/);

  // Guide mentions .xls
  assert.match(guide, /\.xls/);
});

test("Excel 97-2003 BIFF8 binary workbook parses valid question rows and Telugu unicode text", async () => {
  const headers = [
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

  const row = [
    "tg-test-001",
    "General Studies",
    "Who was the first President of India?",
    "Dr. Rajendra Prasad",
    "Dr. S. Radhakrishnan",
    "Jawaharlal Nehru",
    "Sardar Patel",
    "భారతదేశ మొదటి రాష్ట్రపతి ఎవరు?",
    "డా. రాజేంద్ర ప్రసాద్",
    "డా. ఎస్. రాధాకృష్ణన్",
    "జవహర్‌లాల్ నెహ్రూ",
    "సర్దార్ పటేల్",
    "A",
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, row]);
  XLSX.utils.book_append_sheet(wb, ws, "Varadhi Import");

  // Write as classic Excel 97-2003 BIFF8 .xls
  const xlsBuffer = XLSX.write(wb, { bookType: "biff8", type: "buffer" });
  assert.equal(xlsBuffer.subarray(0, 8).toString("hex"), "d0cf11e0a1b11ae1");

  // Read as BIFF8 and convert to XLSX buffer as importer does
  const readWb = XLSX.read(xlsBuffer, { type: "buffer", cellDates: true });
  const xlsxBuffer = XLSX.write(readWb, { bookType: "xlsx", type: "buffer" });

  const excelWorkbook = new ExcelJS.Workbook();
  await excelWorkbook.xlsx.load(xlsxBuffer);
  const worksheet = excelWorkbook.getWorksheet("Varadhi Import");

  assert.ok(worksheet);
  assert.equal(worksheet.rowCount, 2);
  assert.equal(worksheet.getCell(1, 1).text, "import_key");
  assert.equal(worksheet.getCell(2, 1).text, "tg-test-001");
  assert.equal(worksheet.getCell(2, 3).text, "Who was the first President of India?");
  assert.equal(worksheet.getCell(2, 8).text, "భారతదేశ మొదటి రాష్ట్రపతి ఎవరు?");
  assert.equal(worksheet.getCell(2, 13).text, "A");
});
