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

  assert.match(formatter, /\(\?<=\[a-z\\u0c00-\\u0c7f\]\[\.\?!;:\]\?\)\(\?=\[A-H\]\\\./);
});

test("FormattedQuestionText.tsx prevents splitting inside years like 2009. and words like Andhra Pradesh.", async () => {
  const formatter = await read("components/questions/FormattedQuestionText.tsx");

  assert.match(formatter, /\(\?<!\\d\)\(\?=\[1-9\]\\\./);
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

test("FormattedQuestionText.tsx supports matching paired rows without dash and letters beyond H (W, X, Y, Z)", async () => {
  const formatter = await read("components/questions/FormattedQuestionText.tsx");

  // Verify pairRowRegex supports whitespace-separated items with lookahead
  assert.match(formatter, /pairRowRegex[\s\S]*?\\s\+\(\?=\(\?:\\\(/);

  // Verify Set I / Set II heading extraction for Matching Sets
  assert.match(formatter, /Matching\\s\+Sets\?\|Sets\?/);

  // Verify alphabetic list items support full A-Z range
  assert.match(formatter, /alphabeticListItem = \/\^\(\?:\\\(\[a-zA-Z\]\\\)/);
});

test("FormattedQuestionText.tsx protects Telugu era markers and abbreviations from splitting", async () => {
  const formatter = await read("components/questions/FormattedQuestionText.tsx");

  // Verify Telugu era tokens protection
  assert.match(formatter, /__TEL_ERA_1_/);
  assert.match(formatter, /__TEL_ERA_2_/);
  assert.match(formatter, /__TEL_ABBR_/);

  // Verify Telugu abbreviations lookbehind in sentence splitting regex
  assert.match(formatter, /రూ\|క్రీ\|శా\|హి\|వి\|పూ\|శ\|డా\|ప్రొ\|శ్రీ\|చి\|కు\|సం\|నెం\|పు/);

  // Verify Telugu abbreviation guard in renderBlocks
  assert.match(formatter, /isTeluguAbbrOrEra/);
});

test("FormattedQuestionText.tsx joins accidental line breaks after prepositions and guards lone unparenthesized letter markers", async () => {
  const formatter = await read("components/questions/FormattedQuestionText.tsx");

  // Verify preposition merge pattern supports single-letter person initials like 'I.' after 'right of'
  assert.match(formatter, /right of\|left of\|next to\|opposite to\|neighbor of/);

  // Verify lone unparenthesized letter/Roman numerals are guarded against bullet rendering
  assert.match(formatter, /group\.length === 1/);
  assert.match(formatter, /!\/\^\\\(\/\.test\(group\[0\]\.marker\)/);

  // Verify glued period sentence start separation (e.g. thesides.A sits -> thesides. A sits)
  assert.match(formatter, /\(\?<=\[a-z0-9\]\)\\\.\(\[A-Z\]\\s\)/);
});

test("FormattedQuestionText.tsx protects E.g. and i.e. from splitting and separates NOTE clauses", async () => {
  const formatter = await read("components/questions/FormattedQuestionText.tsx");

  // Verify Latin abbreviation tokens
  assert.match(formatter, /__LATIN_ABBR_1_/);
  assert.match(formatter, /__LATIN_ABBR_2_/);

  // Verify break before NOTE clauses
  assert.match(formatter, /NOTE\|Note\|సూచన\|గమనిక/);
});

test("FormattedQuestionText.tsx protects person initials like K. V. Viswanathan and avoids false Roman numeral V splitting", async () => {
  const formatter = await read("components/questions/FormattedQuestionText.tsx");

  // Verify English initial tokens and title guards
  assert.match(formatter, /__INIT_1_/);
  assert.match(formatter, /__INIT_2_/);
  assert.match(formatter, /__INIT_TITLE_/);

  // Verify Telugu initial tokens and title guards
  assert.match(formatter, /__TEL_INIT_1_/);
  assert.match(formatter, /__TEL_INIT_2_/);
  assert.match(formatter, /__TEL_INIT_TITLE_/);

  // Verify Roman numeral V context guard
  assert.match(formatter, /hasRomanNumeralContext/);

  // Verify isPersonInitial guard in renderBlocks
  assert.match(formatter, /isPersonInitial/);
});

test("FormattedQuestionText.tsx protects explanation statement evaluations and prevents false matching list splitting", async () => {
  const formatter = await read("components/questions/FormattedQuestionText.tsx");

  // Verify evaluation lookbehind in inlineListRegex
  assert.match(formatter, /Thus\|Therefore\|Hence\|So\|Consequently\|Because\|Since\|Statement/);
  assert.match(formatter, /కాబట్టి\|కావున\|అందువల్ల\|అందుచేత\|దీని\\s\*ప్రకారం\|ప్రకారం/);

  // Verify evaluation lookahead in inlineListRegex
  assert.match(formatter, /తప్పు\|సత్యం\|నిజం\|సరైనది\|సరియైనది\|సరికానిది\|సరికాదు\|కాదు\|చెల్లదు\|వర్తిస్తుంది/);

  // Verify pairRowRegex restricts parenthesized markers to single letter or 1-2 digits
  assert.match(formatter, /\[a-zA-Z\]\|\\d\{1,2\}/);

  // Verify pairedIndices contiguity check in matchingListLayout
  assert.match(formatter, /pairedIndices\.length === \(pairedIndices\[pairedIndices\.length - 1\] - pairedIndices\[0\] \+ 1\)/);
});
