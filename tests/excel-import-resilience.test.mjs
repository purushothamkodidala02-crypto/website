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
