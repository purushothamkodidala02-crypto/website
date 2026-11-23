# Varadhi TSV & Excel Mock Test Import Guide

This directory contains the master TSV template, guidelines, and validator tool for creating and importing high-quality mock test questions into Varadhi.

---

## 1. Files in this Directory

| File | Description |
| --- | --- |
| `varadhi-mock-test-sample.tsv` | The official reference TSV file containing all question types formatted for pixel-perfect display in Varadhi. |
| `tsv-tester.js` | The command-line validator script that checks TSV/CSV files and verifies which UI layout each question will trigger. |

---

## 2. Why TSV is Recommended for GPT Question Generation

When using ChatGPT, Gemini, or Claude to generate mock tests:
- **Never use CSV for generation**: In Indian exam questions (especially bilingual with Telugu), commas `,` are used heavily in options (`"1 and 2 only"`), matching codes (`"A-1, B-2"`), and prose. In CSV, any missing quote corrupts the columns.
- **Use TSV (Tab-Separated Values)**: Columns are separated by real Tab characters `\t`. Commas do not break columns. You can copy the codeblock directly from GPT and paste it with `Ctrl + V` into Excel. Excel automatically puts each tab into a separate cell!

---

## 3. How to Format Each Question Type for Perfect Display

Varadhi uses an intelligent parsing engine (`FormattedQuestionText`) to render questions with dedicated UI layouts. Follow these formatting rules:

### A. Match the Following (Renders in 2-Column Grid)
- **Method 1 (List I / List II format)**:
  Use `Alt + Enter` in Excel (or `\n` inside quotes in TSV) to separate lines:
  ```text
  Match List I with List II:
  List I
  A. Leader One
  B. Leader Two
  List II
  1. Organization One
  2. Organization Two
  Choose the correct code:
  ```
- **Method 2 (Paired with em-dash `—`)**:
  ```text
  Match the following:
  A. Leader One — 1. Organization One
  B. Leader Two — 2. Organization Two
  Select the correct answer:
  ```
- **Options**: Put the complete matching codes in Options A–D (e.g., `A-1, B-2`, `A-2, B-1`).
- **Result in Varadhi**: Displays a side-by-side **2-column card** (`List I` on left, `List II` on right).

---

### B. Reading Comprehension / Paragraph (Multi-Question Sets)
When 1 passage has multiple questions (e.g. Questions 1 to 3), **DO NOT repeat the passage in every row**.

1. **Question 1 (The Anchor Row)**:
   - Contains the header, the full passage, and sub-question 1.
   - **Line 1 (Trigger Header)**: `Directions: Read the following passage and answer the questions (Questions 1 to 3):` *(Telugu: `కింది గద్యాన్ని చదివి ప్రశ్నలకు సమాధానాలు ఇవ్వండి (1 నుండి 3 ప్రశ్నలు):`)*
   - **Middle Lines**: Full passage text (separated by `Alt + Enter`).
   - **Last Line**: `1. [First question prompt]?`
   - **Result**: Renders inside the **Teal Reading Passage card** with the book icon.

2. **Questions 2, 3, etc. (Sub-Question Rows - NO Passage Repetition)**:
   - **Do NOT copy-paste the passage text into these rows!**
   - Simply start with:
     - English: `Based on the passage above (Question 1):` OR `With reference to the passage above (Question 1):`
     - Telugu: `పై గద్యం ఆధారంగా (ప్రశ్న 1):` OR `పై గద్యం ప్రకారం (ప్రశ్న 1):`
   - Followed by the specific question number and prompt.
   - **Result**: Renders as clean, concise questions referencing the earlier passage without cluttering the screen or Excel sheet!

---

### C. Statement Questions (Renders with Bold Numbered Badges)
- **Introductory Line**: `Consider the following statements:` or `కింది ప్రకటనలను పరిశీలించండి:`.
- **Statements**: Numbered as `1.`, `2.`, `3.` (or `(1)`, `(2)`).
- **Prompt Line**: `Which of the statements given above is/are correct?` or `పై ప్రకటనలలో ఏవి సరైనవి?`.
- **Options**: `1 only`, `1 and 2 only`, `2 and 3 only`, `1, 2 and 3`.
- **Result in Varadhi**: Each statement is given its own clean row with a **bold number badge** on the left and neat indentation.

---

### D. Assertion & Reason (Renders with Highlight Callout Cards)
- **Format**:
  ```text
  Assertion (A): [Statement text]
  Reason (R): [Reason text]
  Select the correct answer using the code given below:
  ```
  *(In Telugu: `నిశ్చితార్థం (A): ...`, `కారణం (R): ...`)*
- **Options**: Standard four options:
  - Option A: `Both A and R are true, and R is the correct explanation of A`
  - Option B: `Both A and R are true, but R is not the correct explanation of A`
  - Option C: `A is true, but R is false`
  - Option D: `A is false, but R is true`
- **Result in Varadhi**: Renders with distinct **callout card containers** and bold labels.

---

### E. Standard Direct MCQ
- Simple direct question text without statement markers or passage headers.
- **Result in Varadhi**: Clean, uncluttered single-prompt question layout.

---

## 4. How to Test Your TSV File

Before uploading to Varadhi, run the validator:

```bash
# Test the sample template
node docs/import-templates/tsv-tester.js

# Test your custom TSV or CSV file
node docs/import-templates/tsv-tester.js path/to/your-test.tsv
```

The tester verifies:
1. Required columns (`import_key`, `subject`, `question_en`, `option_a_en`, ..., `correct_answer`).
2. Unique options & valid answer keys (`A`, `B`, `C`, `D`).
3. UI rendering classification for each question in both English and Telugu.
4. Warns if any matching or passage questions are falling back to plain text.

---

## 5. Master GPT Prompt for Generating Questions

Copy and paste this prompt into ChatGPT, Claude, or Gemini:

```markdown
You are an expert exam question creator for Varadhi Prep (competitive exam platform).
Generate high-quality bilingual (English & Telugu) questions strictly in TSV (Tab-Separated Values) format.

Required TSV Header Row:
import_key	subject	question_en	option_a_en	option_b_en	option_c_en	option_d_en	question_te	option_a_te	option_b_te	option_c_te	option_d_te	correct_answer	explanation_en	explanation_te	difficulty

STRICT RULES:
1. Column Separator: Use real TAB (\t) characters between columns. Never use commas as column separators.
2. Multiline Cells: Any cell with multiple lines must be enclosed in double quotes ("...").
3. Question Formats:
   - Match the Following:
     Line 1: Match List I with List II:
     Line 2: List I
     Lines 3-6: A. ..., B. ..., C. ..., D. ...
     Line 7: List II
     Lines 8-11: 1. ..., 2. ..., 3. ..., 4. ...
     Line 12: Choose the correct code:
     (Options A-D must be matching codes like: A-1, B-2, C-3, D-4)
   - Reading Comprehension / Passage Sets:
     * Question 1: Put the full passage here!
       Line 1: Directions: Read the following passage and answer the questions (Questions 1 to 3):
       Middle: Full passage text.
       Last line: 1. [First question prompt ending with '?']
     * Questions 2, 3, etc.: DO NOT repeat the passage text!
       Line 1: Based on the passage above (Question 1):
       Line 2: 2. [Sub-question prompt ending with '?']
   - Statement Questions:
     Line 1: Consider the following statements: (Telugu: కింది ప్రకటనలను పరిశీలించండి:)
     Lines 2+: 1. ..., 2. ..., 3. ...
     Last line: Which of the statements given above is/are correct?
     (Options A-D must be: 1 only, 1 and 2 only, etc.)
   - Assertion & Reason:
     Line 1: Assertion (A): ...
     Line 2: Reason (R): ...
     Line 3: Select the correct answer using the code given below:
   - Standard MCQ: Direct single question text.
4. Correct Answer: Must be one letter: A, B, C, or D.
5. All 4 options in English and Telugu must be distinct.

Generate questions for Subject: [ENTER SUBJECT HERE]. Output ONLY the TSV in a code block.
```
