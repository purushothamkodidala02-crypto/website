#!/usr/bin/env node
/**
 * Varadhi TSV & Excel Question Tester
 * 
 * Validates TSV/CSV files against Varadhi's import schema and displays
 * how questions will be rendered in Varadhi's UI:
 * - Match the following (2-column grid)
 * - Reading comprehension (Passage card)
 * - Statement questions (Numbered badges)
 * - Assertion & Reason (Callout boxes)
 * - Standard MCQ (Direct question)
 *
 * Usage:
 *   node docs/import-templates/tsv-tester.js [path/to/file.tsv]
 */

const fs = require('fs');
const path = require('path');

// Regex patterns matching components/questions/FormattedQuestionText.tsx
const labelledSection =
  /^(Assertion(?:\s*\([A-Za-z\d]+\))?|(?:నిశ్చితార్థం|నిశ్చితార్థము|నిశ్చితం|నిశ్చయ\s*వాక్యం|వాదన|ప్రకటన|ప్రతిపాదన|దృఢ\s*ప్రకటన)(?:\s*\([A-Za-z\d]+\))?|Reason(?:\s*\([A-Za-z\d]+\))?|(?:కారణం|కారణము|హేతువు|సమర్థన|సమర్థనము|వివరణ)(?:\s*\([A-Za-z\d]+\))?|(?:(?:Statement|Conclusion|Assumption|ప్రకటన|వాక్యం|తీర్మానం|ఊహ|భావన)(?:\s*[- ]?\s*(?:[A-Za-z\d]+|I{1,4}|V|VI|[౦-౯]+|\([A-Za-z\d]+\))(?:\s*\([^)]+\))?)?|(?:List|Column|Group|జాబితా|కాలమ్|కాలం|గ్రూప్)\s*[- ]?\s*(?:[A-Za-z\d]+|I{1,4}|V|VI|[౦-౯]+|\([A-Za-z\d]+\)))(?:\s*\([^)]+\))?)\s*[:—–-]\s*(.+)$/i;

const numberedSection =
  /^((?:\((?:[a-hA-H]|\d{1,2}|[ivxIVX]{1,5}|[౦-౯]{1,2}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)\)|(?:\d{1,2}|[౦-౯]{1,2}|I{1,4}|V|VI|i|ii|iii|iv|v|vi|[a-hA-H]|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)|[\u0C05-\u0C39][\u0C3E-\u0C4D]?)[.)]))\s+(.*)$/i;

const passageHeaderRegex =
  /^(?:(?:Read\s+(?:the\s+)?(?:following\s+)?passage|Passage|Comprehension|Directions?\s*:\s*(?:Read|Study)|కింది\s+గద్యాన్ని\s+చదివి|గద్యం|కింది\s+పేరాను\s+చదివి).*)/i;

const questionPromptStart =
  /^(?:(?:Which\s+of\s+the\s+following|What\s+is|Why\s+did|How\s+does|According\s+to\s+the\s+passage|The\s+author|In\s+the\s+passage|Based\s+on\s+the\s+passage|Identify|Select\s+the|Choose\s+the|Question|ప్రశ్న|ఈ\s+గద్యం\s+ప్రకారం|కింది\s+వాటిలో|పై\s+గద్యం\s+ఆధారంగా).*|[^\n?]+\?)$/i;

const numericListItem = /^(?:\([1-9]\d?\)\s*|(?:[1-9]\d?|[౧-౯])[.)]\s+)/;
const alphabeticListItem = /^(?:\([a-hA-H]\)\s*|[a-hA-H][.)]\s+)/;
const teluguAlphabeticListItem = /^(?:\((?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)\)\s*|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్)[.)]\s+)/;
const romanListItem = /^(?:\([ivxIVX]{1,5}\)\s*|(?:I|II|III|IV|V|VI|VII|VIII|i|ii|iii|iv|v|vi|vii|viii)[.)]\s+)/;

const pairRowRegex =
  /^((?:\((?:[a-hA-H\d]|[ivxIVX]{1,5}|[౦-౯]{1,2}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్))\)|(?:\d{1,2}|[౦-౯]{1,2}|I{1,4}|V|VI|[a-hA-H]|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్))[.)])\s*.*?)\s*[—–-]\s*((?:\((?:[a-hA-H\d]|[ivxIVX]{1,5}|[౦-౯]{1,2}|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్))\)|(?:\d{1,2}|[౦-౯]{1,2}|I{1,4}|V|VI|[a-hA-H]|(?:ఎ|బి|సి|డి|ఈ|ఎఫ్|జి|హెచ్))[.)])\s*.*)$/;

function questionLines(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];
  return rawText
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n?/g, '\n')
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function classifyQuestionUI(text) {
  const lines = questionLines(text);
  if (!lines.length) return { type: 'EMPTY', details: 'No text found' };

  // 1. Passage Check
  if (passageHeaderRegex.test(lines[0])) {
    let promptIndex = -1;
    for (let i = lines.length - 1; i >= 1; i--) {
      if (questionPromptStart.test(lines[i])) {
        promptIndex = i;
        break;
      }
    }
    const passageLines = promptIndex > 1 ? lines.slice(1, promptIndex) : lines.slice(1, -1);
    const prompt = promptIndex > 1 ? lines.slice(promptIndex).join(' ') : lines[lines.length - 1];
    return {
      type: 'PASSAGE',
      label: 'Reading Passage (Teal Card)',
      details: `Passage: ${passageLines.length} paragraphs/lines; Prompt: "${prompt.slice(0, 45)}..."`
    };
  }

  // 2. Match the Following - Paired Rows
  const paired = lines.filter((l) => pairRowRegex.test(l));
  if (paired.length >= 2) {
    return {
      type: 'MATCHING_PAIRED',
      label: 'Match the Following (2-Column Grid [Paired])',
      details: `${paired.length} pairs linked via '—'`
    };
  }

  // 3. Match the Following - Separate Lists
  const hasAlpha = lines.some((l) => alphabeticListItem.test(l) || teluguAlphabeticListItem.test(l));
  const hasNum = lines.some((l) => numericListItem.test(l) || romanListItem.test(l));
  const hasMatchHeader = lines.some((l) => /^(?:List|Column|జాబితా|Match|జతపరచండి)/i.test(l));
  if (hasAlpha && hasNum && hasMatchHeader) {
    const leftCount = lines.filter((l) => alphabeticListItem.test(l) || teluguAlphabeticListItem.test(l)).length;
    const rightCount = lines.filter((l) => numericListItem.test(l) || romanListItem.test(l)).length;
    return {
      type: 'MATCHING_LISTS',
      label: 'Match the Following (2-Column Grid [List I / List II])',
      details: `List I: ${leftCount} items, List II: ${rightCount} items`
    };
  }

  // 4. Assertion & Reason
  const hasAssertion = lines.some((l) => /^(?:Assertion|నిశ్చితార్థం|నిశ్చితార్థము|వాదన|దృఢ\s*ప్రకటన)/i.test(l));
  const hasReason = lines.some((l) => /^(?:Reason|కారణం|కారణము|హేతువు|వివరణ)/i.test(l));
  if (hasAssertion && hasReason) {
    return {
      type: 'ASSERTION_REASON',
      label: 'Assertion & Reason (Callout Cards)',
      details: 'Assertion (A) & Reason (R) detected with highlight blocks'
    };
  }

  // 5. Statement Questions
  const numbered = lines.filter((l) => numberedSection.test(l));
  if (numbered.length >= 2) {
    return {
      type: 'STATEMENTS',
      label: 'Statement Question (Numbered Badges)',
      details: `${numbered.length} statements formatted as badges (1., 2., ...)`
    };
  }

  // 6. Passage Sub-Question (References previous passage without duplicating it)
  const isPassageRef = /^(?:Based on the (?:above )?passage|With reference to the (?:above )?passage|According to the (?:above )?passage|In the light of the (?:above )?passage|పై గద్యం (?:ఆధారంగా|ప్రకారం))/i.test(lines[0]);
  if (isPassageRef) {
    return {
      type: 'PASSAGE_SUB_QUESTION',
      label: 'Passage Sub-Question (References Passage - No Repetition)',
      details: `Prompt: "${lines[lines.length - 1].slice(0, 50)}..."`
    };
  }

  // 7. Direct MCQ
  return {
    type: 'STANDARD_MCQ',
    label: 'Standard MCQ (Direct Single Question)',
    details: 'Single text prompt followed by 4 choices'
  };
}

function parseDelimited(content, delimiter) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && content[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some((c) => c.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((c) => c.trim().length > 0)) {
    rows.push(row);
  }

  if (inQuotes) {
    throw new Error('Unclosed quotation mark detected in the file.');
  }

  return rows;
}

function testFile(filePath) {
  console.log(`\n============================================================`);
  console.log(`🔍 Varadhi TSV / Excel Mock Test Validator`);
  console.log(`📁 File: ${filePath}`);
  console.log(`============================================================\n`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  // Detect delimiter: tab or comma
  const firstLine = content.split(/\r?\n/)[0];
  const isTsv = firstLine.includes('\t');
  const delimiter = isTsv ? '\t' : ',';
  console.log(`ℹ️ Detected format: ${isTsv ? 'TSV (Tab-separated)' : 'CSV (Comma-separated)'}`);

  const rawRows = parseDelimited(content, delimiter);
  if (rawRows.length < 2) {
    console.error('❌ File must contain a header row and at least one data row.');
    process.exit(1);
  }

  const headers = rawRows[0].map((h) => h.trim().toLowerCase());
  const requiredHeaders = [
    'import_key',
    'subject',
    'question_en',
    'option_a_en',
    'option_b_en',
    'option_c_en',
    'option_d_en',
    'correct_answer'
  ];

  const bilingualHeaders = [
    'question_te',
    'option_a_te',
    'option_b_te',
    'option_c_te',
    'option_d_te'
  ];

  console.log(`📋 Total Columns: ${headers.length}`);
  console.log(`📋 Total Question Rows: ${rawRows.length - 1}\n`);

  // Check required headers
  const missing = requiredHeaders.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    console.error(`❌ Missing required column headers: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log(`✅ Base required columns verified.`);

  const hasBilingual = bilingualHeaders.every((h) => headers.includes(h));
  if (hasBilingual) {
    console.log(`✅ Bilingual Telugu columns verified.\n`);
  } else {
    console.log(`ℹ️ English-only file (Telugu columns optional).\n`);
  }

  const rows = rawRows.slice(1);
  let passedCount = 0;
  let warnCount = 0;
  let errorCount = 0;

  rows.forEach((rowValues, idx) => {
    const rowNum = idx + 2;
    const row = {};
    headers.forEach((h, colIdx) => {
      row[h] = (rowValues[colIdx] || '').trim();
    });

    const key = row.import_key || `Row-${rowNum}`;
    const subject = row.subject || 'Unknown';
    const answer = (row.correct_answer || '').toUpperCase();
    const qEn = row.question_en || '';
    const qTe = row.question_te || '';

    const errors = [];
    const warnings = [];

    // Validation checks
    if (!['A', 'B', 'C', 'D'].includes(answer)) {
      errors.push(`Invalid correct_answer: "${row.correct_answer}" (must be A, B, C, or D)`);
    }

    const enOptions = [row.option_a_en, row.option_b_en, row.option_c_en, row.option_d_en];
    if (enOptions.some((o) => !o)) {
      errors.push('One or more English options are empty');
    } else if (new Set(enOptions.map((o) => o.toLowerCase())).size !== 4) {
      errors.push('All 4 English options must be distinct');
    }

    if (hasBilingual && qTe) {
      const teOptions = [row.option_a_te, row.option_b_te, row.option_c_te, row.option_d_te];
      if (teOptions.some((o) => !o)) {
        warnings.push('One or more Telugu options are empty');
      } else if (new Set(teOptions.map((o) => o.toLowerCase())).size !== 4) {
        warnings.push('All 4 Telugu options should be distinct');
      }
    }

    // Question classification
    const enUI = classifyQuestionUI(qEn);
    const teUI = qTe ? classifyQuestionUI(qTe) : null;

    if (qEn.toLowerCase().includes('match') && enUI.type === 'STANDARD_MCQ') {
      warnings.push(`Question mentions 'match' but was not detected as matching grid (check List I/II formatting)`);
    }
    if (qEn.toLowerCase().includes('passage') && enUI.type === 'STANDARD_MCQ') {
      warnings.push(`Question mentions 'passage' but was not detected as Reading Passage card or Passage Sub-Question`);
    }

    // Print Report for Row
    const statusSymbol = errors.length > 0 ? '❌ FAIL' : warnings.length > 0 ? '⚠️ WARN' : '✅ PASS';
    if (errors.length > 0) errorCount++;
    else if (warnings.length > 0) warnCount++;
    else passedCount++;

    console.log(`------------------------------------------------------------`);
    console.log(`Q#${idx + 1} [Row ${rowNum}] | Key: ${key} | Subject: ${subject} | Status: ${statusSymbol}`);
    console.log(`   🎨 English Display UI: [${enUI.label}]`);
    console.log(`      ↳ ${enUI.details}`);
    if (teUI) {
      console.log(`   🎨 Telugu Display UI:  [${teUI.label}]`);
      console.log(`      ↳ ${teUI.details}`);
    }
    console.log(`   🎯 Correct Answer: ${answer}`);

    if (warnings.length > 0) {
      warnings.forEach((w) => console.log(`   ⚠️ Warning: ${w}`));
    }
    if (errors.length > 0) {
      errors.forEach((e) => console.log(`   ❌ Error: ${e}`));
    }
  });

  console.log(`\n============================================================`);
  console.log(`📊 Summary:`);
  console.log(`   Total Questions: ${rows.length}`);
  console.log(`   Passed:          ${passedCount} questions`);
  console.log(`   Warnings:        ${warnCount} questions`);
  console.log(`   Failed:          ${errorCount} questions`);
  console.log(`============================================================\n`);

  if (errorCount > 0) {
    console.log(`❌ Fix the errors above before importing into Varadhi.`);
    process.exit(1);
  } else {
    console.log(`✨ All questions validated successfully and will render with top display quality in Varadhi!\n`);
  }
}

// Entrypoint
const targetFile = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, 'varadhi-mock-test-sample.tsv');

testFile(targetFile);
