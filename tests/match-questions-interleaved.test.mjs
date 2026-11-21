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

  assert.match(formatter, /\(\?<=\[a-z\\d\\u0c00-\\u0c7f\]\)\(\?=\(\?:\[A-Ha-h\]/);
});
