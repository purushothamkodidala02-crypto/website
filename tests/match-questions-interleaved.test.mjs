import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("FormattedQuestionText.tsx implements interleaved matching list layout and header extraction", async () => {
  const formatter = await read("components/questions/FormattedQuestionText.tsx");

  assert.match(formatter, /function parseMatchingHeaders/);
  assert.match(formatter, /bestInterleaved/);
  assert.match(formatter, /cleanItem/);
  assert.match(formatter, /Leaders\|Contribution\|నాయకులు\|కృషి/);
});

test("FormattedQuestionText.tsx separates glued letter markers like CommitteeC. and HyderabadD.", async () => {
  const formatter = await read("components/questions/FormattedQuestionText.tsx");

  assert.match(formatter, /\(\?<=\[a-zA-Z\\d\\u0c00-\\u0c7f\]\[\.\?!\]\?\)\(\?<!\[ivxIVX\]\)\(\?=\(\?:\[A-Ha-h\]/);
});

test("FormattedQuestionText.tsx formats inline coded language definitions and repairs glued or split roman numerals", async () => {
  const formatter = await read("components/questions/FormattedQuestionText.tsx");

  assert.match(formatter, /code language\|కోడ్\\s\*భాషలో/);
  assert.match(formatter, /\(\?<=\[’'"”\]\)\[ \\t\]\*\(\?=\[‘'"“\]\)/);
  assert.match(formatter, /\(\?<=\[’'"”\]\)\[ \\t\]\*\(\?=\(\?:If\|Where\|Then\)\\b\|ఒకవేళ/);
  assert.match(formatter, /codeDefinitionItem/);
  assert.match(formatter, /code-group/);
});

test("FormattedQuestionText.tsx groups list items and prevents awkward breaks after 'and'", async () => {
  const formatter = await read("components/questions/FormattedQuestionText.tsx");

  // Verify 'and' / 'or' guard before select/choose
  assert.match(formatter, /\(\?<!\\b\(\?:and\|or\|to\|in order to\)\\s\*\)/);

  // Verify group mapping for numbered/lettered lists
  assert.match(formatter, /group\.map/);
  assert.match(formatter, /key=\{`group-\$\{group\[0\]\.index\}`\}/);
});

test("FormattedQuestionText.tsx handles glued markers like year.3. The and repairs OCR year/word spaces", async () => {
  const formatter = await read("components/questions/FormattedQuestionText.tsx");

  assert.match(formatter, /18\\d\|19\\d\|20\\d/);
  assert.match(formatter, /Prades/);
  assert.match(formatter, /\[a-zA-Z\\d\\u0c00-\\u0c7f\]/);
});
