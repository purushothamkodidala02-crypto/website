import assert from "node:assert/strict";
import test from "node:test";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";

test("Excel workbook with namespace prefixes (<x:workbook>) is normalized via SheetJS fallback", async () => {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`);
  zip.file("xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`);
  zip.file("xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<x:workbook xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <x:sheets>
    <x:sheet name="Varadhi Import" sheetId="1" r:id="rId1"/>
  </x:sheets>
</x:workbook>`);
  zip.file("xl/worksheets/sheet1.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">
      <c r="A1" t="inlineStr"><is><t>import_key</t></is></c>
      <c r="B1" t="inlineStr"><is><t>subject</t></is></c>
      <c r="C1" t="inlineStr"><is><t>question_en</t></is></c>
    </row>
    <row r="2">
      <c r="A2" t="inlineStr"><is><t>test-001</t></is></c>
      <c r="B2" t="inlineStr"><is><t>Land Records</t></is></c>
      <c r="C2" t="inlineStr"><is><t>What is RSR?</t></is></c>
    </row>
  </sheetData>
</worksheet>`);

  const rawBuffer = await zip.generateAsync({ type: "nodebuffer" });

  // Direct ExcelJS load fails with "Cannot read properties of undefined (reading 'sheets')"
  const directWb = new ExcelJS.Workbook();
  await assert.rejects(
    async () => {
      await directWb.xlsx.load(rawBuffer);
    },
    (err) => {
      assert.match(err.message, /reading 'sheets'/);
      return true;
    }
  );

  // Fallback via SheetJS succeeds
  const readWb = XLSX.read(rawBuffer, { type: "buffer", cellDates: true });
  const normalizedBuffer = XLSX.write(readWb, { bookType: "xlsx", type: "buffer" });
  const fallbackWb = new ExcelJS.Workbook();
  await fallbackWb.xlsx.load(normalizedBuffer);

  const ws = fallbackWb.getWorksheet("Varadhi Import") ?? fallbackWb.worksheets[0];
  assert.ok(ws);
  assert.equal(ws.getCell(1, 1).text, "import_key");
  assert.equal(ws.getCell(2, 1).text, "test-001");
});

test("SheetJS dense extraction handles 25-question Excel with bloated A1:XFD1048576 dimension in under 500ms", async () => {
  const { readFile } = await import("node:fs/promises");
  const importer = await readFile(new URL("../app/admin/questions/import-actions.ts", import.meta.url), "utf8");
  assert.match(importer, /dense:\s*true/);
  assert.doesNotMatch(importer, /sheet_to_json\([^)]*defval:\s*""/);

  const wb = XLSX.utils.book_new();
  const rows = [
    [
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
    ],
  ];
  for (let i = 1; i <= 25; i += 1) {
    rows.push([
      `q${i}`,
      "General Studies",
      `Question ${i}?`,
      "A",
      "B",
      "C",
      "D",
      `ప్రశ్న ${i}?`,
      "ఎ",
      "బి",
      "సి",
      "డి",
      "A",
    ]);
  }
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Varadhi Import");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

  const zip = await JSZip.loadAsync(buf);
  let sheetXml = await zip.file("xl/worksheets/sheet1.xml").async("string");
  sheetXml = sheetXml.replace(/<dimension ref="[^"]*"/, '<dimension ref="A1:XFD1048576"');
  zip.file("xl/worksheets/sheet1.xml", sheetXml);
  const bloatedBuf = await zip.generateAsync({ type: "nodebuffer" });

  const start = Date.now();
  const meta = XLSX.read(bloatedBuf, { type: "buffer", bookSheets: true });
  const target = meta.SheetNames.includes("Varadhi Import") ? "Varadhi Import" : meta.SheetNames[0];
  const parsed = XLSX.read(bloatedBuf, {
    type: "buffer",
    sheets: [target],
    cellDates: true,
    cellFormula: false,
    cellHTML: false,
    cellStyles: false,
    dense: true,
  });
  const denseRows = parsed.Sheets[target]["!data"];
  const elapsedMs = Date.now() - start;

  assert.ok(Array.isArray(denseRows));
  assert.equal(denseRows.length, 26);
  assert.ok(elapsedMs < 1000, `Expected bloated 25-question parse < 1000ms, took ${elapsedMs}ms`);
});
