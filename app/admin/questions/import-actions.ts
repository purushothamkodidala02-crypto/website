"use server";

import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import { mockTestHasStudentAttempts } from "@/lib/admin-mock-test-exemptions";
import {
  QUESTION_IMPORT_REQUIRED_HEADERS,
  getRequiredHeadersForLanguageMode,
} from "@/lib/questions/import-format";
import {
  isDuplicateIssue,
  isValidIsoDate,
  parseExcludedRowsJson,
  parseRowOverridesJson,
  suggestIsoDate,
  type ImportIssueItem,
  type ImportQuestionsState,
} from "@/lib/questions/import-issues";
import { normalizeQuestionImageUrl, questionMediaPath, removeQuestionImage, uploadQuestionImage } from "@/lib/questions/media";
import type { CorrectAnswer, QuestionLifecycle } from "@/types/question";
import type { SubjectContentLanguageMode } from "@/types/subject";

export type { ImportQuestionsState } from "@/lib/questions/import-issues";

type CsvRow = Record<string, string>;
type EmbeddedQuestionImage = {
  bytes: Buffer;
  mimeType: "image/jpeg" | "image/png";
  fileName: string;
};
type ParsedQuestionFile = {
  headers: string[];
  rows: Array<{ values: CsvRow; rowNumber: number }>;
  embeddedImages: Map<number, EmbeddedQuestionImage>;
};
type QuestionLanguageValues = {
  question: string;
  options: [string, string, string, string];
  explanation: string | null;
};
type MockImportTarget = {
  id: string;
  paper_id: string;
  subject_id: string | null;
  test_scope: "paper" | "subject";
  status: string;
  target_question_count: number;
  replaces_mock_test_id: string | null;
  allow_duplicate_questions?: boolean;
};

const answers: CorrectAnswer[] = ["A", "B", "C", "D"];
const lifecycles: QuestionLifecycle[] = ["permanent", "review", "expires"];
const validDate = isValidIsoDate;
const optionalNumber = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : Number.NaN;
};

const cleanCellValue = (value: string) => value.replace(/\u00A0/g, " ").replace(/\r\n?/g, "\n").trim();
const normalizeHeader = (value: string) => cleanCellValue(value).replace(/^\uFEFF/, "").toLowerCase().replace(/[\s-]+/g, "_");
const normalizeLookup = (value: string) => cleanCellValue(value).replace(/\s+/g, " ").toLocaleLowerCase();

function validateHeaders(
  headers: string[],
  requiredHeaders: readonly string[] = QUESTION_IMPORT_REQUIRED_HEADERS,
) {
  if (new Set(headers).size !== headers.length) throw new Error("Each file column heading must be unique.");
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
  if (missingHeaders.length) throw new Error(`Missing file column${missingHeaders.length === 1 ? "" : "s"}: ${missingHeaders.join(", ")}.`);
}

function determineRequiredHeaders(options: {
  headers: string[];
  rows: ParsedQuestionFile["rows"];
  subjects: Array<{ id: string; name: string; content_language_mode: string }>;
  subjectByName: Map<string, { id: string; name: string; content_language_mode: string }>;
  mockTest: MockImportTarget | null;
}): readonly string[] {
  const { headers, rows, subjects, subjectByName, mockTest } = options;

  // 1. If this is a subject-scoped mock test, the mock test target subject is the primary source of truth
  if (mockTest?.test_scope === "subject" && mockTest.subject_id) {
    const targetSubject = subjects.find((s) => s.id === mockTest.subject_id);
    const mode = targetSubject?.content_language_mode;
    if (mode === "english") return getRequiredHeadersForLanguageMode("english");
    if (mode === "telugu") return getRequiredHeadersForLanguageMode("telugu");
    return QUESTION_IMPORT_REQUIRED_HEADERS;
  }

  // 2. If subject column is missing from headers:
  if (!headers.includes("subject")) {
    if (subjects.length > 0 && subjects.every((s) => s.content_language_mode === "english")) {
      return getRequiredHeadersForLanguageMode("english");
    }
    if (subjects.length > 0 && subjects.every((s) => s.content_language_mode === "telugu")) {
      return getRequiredHeadersForLanguageMode("telugu");
    }
    return QUESTION_IMPORT_REQUIRED_HEADERS;
  }

  // 3. Inspect subjects referenced in the rows
  const referencedSubjectNames = Array.from(
    new Set(
      rows
        .map((r) => normalizeLookup(r.values.subject ?? ""))
        .filter(Boolean),
    ),
  );

  const matchedSubjects = referencedSubjectNames
    .map((name) => subjectByName.get(name))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  if (matchedSubjects.length > 0) {
    const allEnglish = matchedSubjects.every((s) => s.content_language_mode === "english");
    const allTelugu = matchedSubjects.every((s) => s.content_language_mode === "telugu");

    if (allEnglish) return getRequiredHeadersForLanguageMode("english");
    if (allTelugu) return getRequiredHeadersForLanguageMode("telugu");
    return QUESTION_IMPORT_REQUIRED_HEADERS;
  }

  // 4. Fallback if no row subject matched an existing subject in the paper:
  if (subjects.length > 0) {
    const allPaperEnglish = subjects.every((s) => s.content_language_mode === "english");
    const allPaperTelugu = subjects.every((s) => s.content_language_mode === "telugu");

    if (allPaperEnglish) return getRequiredHeadersForLanguageMode("english");
    if (allPaperTelugu) return getRequiredHeadersForLanguageMode("telugu");
  }

  return QUESTION_IMPORT_REQUIRED_HEADERS;
}

function parseCsv(source: string): ParsedQuestionFile {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (quoted) throw new Error("The CSV has an unclosed quotation mark.");
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  if (rows.length < 2) throw new Error("The CSV needs a header row and at least one Question.");

  const headers = rows.shift()!.map(normalizeHeader);
  if (new Set(headers).size !== headers.length) throw new Error("Each file column heading must be unique.");

  return {
    headers,
    rows: rows.map((values, index) => ({
      values: Object.fromEntries(headers.map((header, colIndex) => [header, cleanCellValue(values[colIndex] ?? "")])),
      rowNumber: index + 2,
    })),
    embeddedImages: new Map(),
  };
}

function cellToText(cell: XLSX.CellObject | undefined): string {
  if (!cell || cell.t === "z") return "";
  if (cell.v instanceof Date && !Number.isNaN(cell.v.getTime())) {
    return cell.v.toISOString().slice(0, 10);
  }
  if (typeof cell.v === "string") return cell.v;
  if (cell.w !== undefined) return String(cell.w);
  if (cell.v !== undefined && cell.v !== null) return String(cell.v);
  return "";
}

function extractDenseRows(
  worksheet: XLSX.WorkSheet & { "!data"?: Array<Array<XLSX.CellObject | undefined>> },
): Array<Array<XLSX.CellObject | undefined>> {
  const denseData = worksheet["!data"];
  if (Array.isArray(denseData)) return denseData;

  // Sparse object-keyed fallback: ignore bloated !ref and index only populated cells
  const sparseRows: Array<Array<XLSX.CellObject | undefined>> = [];
  for (const address of Object.keys(worksheet)) {
    if (address.startsWith("!")) continue;
    const cell = worksheet[address] as XLSX.CellObject | undefined;
    if (!cell || cell.t === "z") continue;
    const { r, c } = XLSX.utils.decode_cell(address);
    let row = sparseRows[r];
    if (!row) {
      row = [];
      sparseRows[r] = row;
    }
    row[c] = cell;
  }
  return sparseRows;
}

function chunkTextsByUrlBudget(texts: string[], maxItems = 15, maxEncodedLength = 3500): string[][] {
  const chunks: string[][] = [];
  let current: string[] = [];
  let currentEncodedLength = 0;

  for (const text of texts) {
    const encodedLength = encodeURIComponent(text).length + 3;
    if (
      current.length > 0 &&
      (current.length >= maxItems || currentEncodedLength + encodedLength > maxEncodedLength)
    ) {
      chunks.push(current);
      current = [];
      currentEncodedLength = 0;
    }
    current.push(text);
    currentEncodedLength += encodedLength;
  }

  if (current.length > 0) chunks.push(current);
  return chunks;
}

async function parseExcel(file: File): Promise<ParsedQuestionFile> {
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const isBiff8Xls = rawBuffer.length >= 8 && rawBuffer.subarray(0, 8).toString("hex") === "d0cf11e0a1b11ae1";
  const extension = file.name.toLowerCase().split(".").pop();

  // Read sheet names first, then parse only the target sheet in dense mode so
  // bloated Excel dimensions (e.g. A1:XFD1048576) and unused sheets are skipped.
  let sheetName: string;
  try {
    const metaWb = XLSX.read(rawBuffer, { type: "buffer", bookSheets: true });
    sheetName = metaWb.SheetNames.includes("Varadhi Import") ? "Varadhi Import" : metaWb.SheetNames[0];
  } catch (loadError) {
    if (isBiff8Xls || extension === "xls") {
      throw new Error("The Excel 97-2003 (.xls) file could not be read. Please ensure it is a valid Excel workbook.");
    }
    throw new Error(
      loadError instanceof Error ? loadError.message : "The Excel file could not be read."
    );
  }
  if (!sheetName) throw new Error("The Excel file does not contain a worksheet.");

  let readWb: XLSX.WorkBook;
  try {
    readWb = XLSX.read(rawBuffer, {
      type: "buffer",
      sheets: [sheetName],
      cellDates: true,
      cellFormula: false,
      cellHTML: false,
      cellStyles: false,
      dense: true,
    });
    if (!readWb.Sheets[sheetName]) {
      readWb = XLSX.read(rawBuffer, {
        type: "buffer",
        cellDates: true,
        cellFormula: false,
        cellHTML: false,
        cellStyles: false,
        dense: true,
      });
    }
  } catch (loadError) {
    if (isBiff8Xls || extension === "xls") {
      throw new Error("The Excel 97-2003 (.xls) file could not be read. Please ensure it is a valid Excel workbook.");
    }
    throw new Error(
      loadError instanceof Error ? loadError.message : "The Excel file could not be read."
    );
  }

  const resolvedSheetName = readWb.Sheets[sheetName]
    ? sheetName
    : (readWb.SheetNames.includes("Varadhi Import") ? "Varadhi Import" : readWb.SheetNames[0]);
  const worksheet: XLSX.WorkSheet & {
    "!data"?: Array<Array<XLSX.CellObject | undefined>>;
    getImages?: () => Array<{ imageId: unknown; range: { tl: { nativeRow: number } } }>;
  } = readWb.Sheets[resolvedSheetName];
  if (!worksheet) throw new Error("The Excel file does not contain a worksheet.");

  const rawData = extractDenseRows(worksheet);
  if (!rawData.length || !rawData[0]) throw new Error("The Excel sheet needs headings and at least one Question.");

  const rawHeaders = rawData[0];
  const headers: string[] = [];
  for (let colIndex = 0; colIndex < rawHeaders.length; colIndex += 1) {
    headers.push(normalizeHeader(cellToText(rawHeaders[colIndex])));
  }
  while (headers.length > 0 && !headers[headers.length - 1]) {
    headers.pop();
  }
  if (!headers.length) throw new Error("The Excel sheet needs headings and at least one Question.");
  if (new Set(headers).size !== headers.length) throw new Error("Each file column heading must be unique.");

  const embeddedImages = new Map<number, EmbeddedQuestionImage>();
  if (worksheet.getImages) {
    for (const placement of worksheet.getImages()) {
      const rowNumber = placement.range.tl.nativeRow + 1;
      if (rowNumber < 2) continue;
      if (embeddedImages.has(rowNumber)) throw new Error(`Row ${rowNumber}: use only one embedded Question image per row.`);
    }
  }

  const rows: ParsedQuestionFile["rows"] = [];

  for (let rowIndex = 1; rowIndex < rawData.length; rowIndex += 1) {
    const rowCells = rawData[rowIndex];
    if (!rowCells || rowCells.length === 0) continue;

    let hasValue = false;
    const values: CsvRow = {};
    for (let colIndex = 0; colIndex < headers.length; colIndex += 1) {
      const header = headers[colIndex];
      if (!header) continue;
      const text = cleanCellValue(cellToText(rowCells[colIndex]));
      if (text) hasValue = true;
      values[header] = text;
    }

    if (hasValue) {
      rows.push({
        values,
        rowNumber: rowIndex + 1,
      });
      if (rows.length > 500) {
        throw new Error("Import up to 500 Questions at one time.");
      }
    }
  }

  if (!rows.length) throw new Error("The Excel sheet needs headings and at least one Question.");
  return { headers, rows, embeddedImages };
}

async function parseQuestionFile(file: File): Promise<ParsedQuestionFile> {
  const extension = file.name.toLowerCase().split(".").pop();
  if (extension === "xlsx" || extension === "xls") return parseExcel(file);
  if (extension === "csv") return parseCsv(await file.text());
  throw new Error("Choose an Excel (.xlsx, .xls) or CSV (.csv) file.");
}

function languageValues(row: CsvRow, suffix: "en" | "te"): QuestionLanguageValues {
  return {
    question: row[`question_${suffix}`] ?? "",
    options: ["a", "b", "c", "d"].map((letter) => row[`option_${letter}_${suffix}`] ?? "") as QuestionLanguageValues["options"],
    explanation: (row[`explanation_${suffix}`] ?? "").trim() || null,
  };
}

function validateLanguageValues(values: QuestionLanguageValues, language: string, rowNumber: number) {
  if (!values.question || values.options.some((option) => !option)) {
    return `Row ${rowNumber}: ${language} Question text and all four ${language} options are required.`;
  }
  if (new Set(values.options.map((option) => option.toLocaleLowerCase())).size !== 4) {
    return `Row ${rowNumber}: all four ${language} options must be different.`;
  }
  return null;
}

function collectLanguageValueIssues(
  values: QuestionLanguageValues,
  suffix: "en" | "te",
  language: string,
  rowNumber: number,
  questionNumber: number,
  questionPreview: string,
): ImportIssueItem[] {
  const result: ImportIssueItem[] = [];
  if (!values.question) {
    result.push({
      id: `row-${rowNumber}-question_${suffix}`,
      rowNumber,
      questionNumber,
      questionPreview,
      kind: "missing_or_duplicate_option",
      field: `question_${suffix}`,
      currentValue: "",
      requiredFormat: `${language} question text`,
      message: `${language} question text is required.`,
      editableType: "text",
    });
  }
  const letters = ["a", "b", "c", "d"] as const;
  values.options.forEach((opt, idx) => {
    if (!opt) {
      result.push({
        id: `row-${rowNumber}-option_${letters[idx]}_${suffix}`,
        rowNumber,
        questionNumber,
        questionPreview,
        kind: "missing_or_duplicate_option",
        field: `option_${letters[idx]}_${suffix}`,
        currentValue: "",
        requiredFormat: `Option ${letters[idx].toUpperCase()} (${language})`,
        message: `${language} option ${letters[idx].toUpperCase()} is required.`,
        editableType: "text",
      });
    }
  });
  if (
    !values.options.some((opt) => !opt) &&
    new Set(values.options.map((option) => option.toLocaleLowerCase())).size !== 4
  ) {
    result.push({
      id: `row-${rowNumber}-options_dup_${suffix}`,
      rowNumber,
      questionNumber,
      questionPreview,
      kind: "missing_or_duplicate_option",
      field: `option_d_${suffix}`,
      currentValue: values.options.join(" | "),
      requiredFormat: `4 distinct ${language} options`,
      message: `All four ${language} options must be different.`,
      editableType: "text",
    });
  }
  return result;
}

function activeValue(value: string) {
  const normalized = value.trim().toLowerCase();
  if (["", "true", "yes", "1", "active"].includes(normalized)) return true;
  if (["false", "no", "0", "inactive"].includes(normalized)) return false;
  return null;
}

export async function importQuestionsFromCsv(
  _previous: ImportQuestionsState,
  formData: FormData,
): Promise<ImportQuestionsState> {
  return importQuestions(formData);
}

export async function importQuestionsIntoMockTest(
  mockTestId: string,
  _previous: ImportQuestionsState,
  formData: FormData,
): Promise<ImportQuestionsState> {
  return importQuestions(formData, mockTestId);
}

export async function replaceQuestionsInMockTest(
  mockTestId: string,
  _previous: ImportQuestionsState,
  formData: FormData,
): Promise<ImportQuestionsState> {
  return importQuestions(formData, mockTestId, "replace");
}

async function importQuestions(
  formData: FormData,
  mockTestId?: string,
  mode: "add" | "replace" = "add",
): Promise<ImportQuestionsState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "You must be logged in." };

  const categoryId = String(formData.get("import_exam_id") ?? "").trim();
  const examId = String(formData.get("import_exam_group_id") ?? "").trim();
  let paperId = String(formData.get("import_paper_id") ?? "").trim();
  const file = formData.get("questions_file");

  const [{ data: profile }, mockTestResult] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).single(),
    mockTestId
      ? supabase
          .from("mock_tests")
          .select("id, paper_id, subject_id, test_scope, status, target_question_count, replaces_mock_test_id, allow_duplicate_questions")
          .eq("id", mockTestId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  if (profile?.role !== "admin") return { success: false, message: "You are not authorized to import Questions." };

  let mockTest: MockImportTarget | null = null;
  if (mockTestId) {
    mockTest = mockTestResult.data as MockImportTarget | null;
    if (!mockTest) return { success: false, message: "Mock Test not found." };
    if (mockTest.status !== "draft") return { success: false, message: "Only draft Mock Tests can receive a file import." };
    paperId = mockTest.paper_id;
  } else if (!categoryId || !examId || !paperId) {
    return { success: false, message: "Choose a Recruiting Board, Exam, and Paper before importing." };
  }
  if (!(file instanceof File) || !file.size) return { success: false, message: "Choose an Excel or CSV file to import." };
  if (file.size > 2_500_000) return { success: false, message: "This file is too large. Import up to 2.5 MB at a time." };

  const [
    { data: paper },
    { data: exam },
    { data: subjects, error: subjectsError },
    hasStudents,
    existingMockCountResult,
    parseOutcome,
  ] = await Promise.all([
    supabase.from("papers").select("id, exam_group_id, default_correct_marks, default_negative_marks").eq("id", paperId).maybeSingle(),
    mockTest
      ? Promise.resolve({ data: null })
      : supabase.from("exam_groups").select("id, exam_id").eq("id", examId).maybeSingle(),
    supabase
      .from("subjects")
      .select("id, name, content_language_mode, display_order")
      .eq("paper_id", paperId)
      .order("display_order"),
    mockTest ? mockTestHasStudentAttempts(mockTest.id) : Promise.resolve(false),
    mockTest && mode === "add"
      ? supabase
          .from("mock_test_questions")
          .select("question_id", { count: "exact", head: true })
          .eq("mock_test_id", mockTest.id)
      : Promise.resolve({ count: 0 }),
    parseQuestionFile(file)
      .then((parsedFile) => ({ parsedFile, error: null as string | null }))
      .catch((error: unknown) => ({
        parsedFile: null as ParsedQuestionFile | null,
        error: error instanceof Error ? error.message : "The Question file could not be read.",
      })),
  ]);

  if (mockTest && hasStudents) {
    return { success: false, message: "This Mock Test has student attempts and its Questions are locked." };
  }
  if (!paper || (!mockTest && (!exam || paper.exam_group_id !== exam.id || exam.exam_id !== categoryId))) {
    return { success: false, message: "The selected Recruiting Board, Exam, and Paper do not belong together." };
  }
  if (parseOutcome.error || !parseOutcome.parsedFile) {
    return { success: false, message: parseOutcome.error ?? "The Question file could not be read." };
  }
  const rowOverrides = parseRowOverridesJson(formData.get("row_overrides"));
  const excludedRows = parseExcludedRowsJson(formData.get("excluded_rows"));
  const parsedFile = parseOutcome.parsedFile;
  if (excludedRows.size > 0) {
    parsedFile.rows = parsedFile.rows.filter((item) => !excludedRows.has(item.rowNumber));
  }
  if (Object.keys(rowOverrides).length > 0) {
    for (const item of parsedFile.rows) {
      const overridesForRow = rowOverrides[item.rowNumber];
      if (!overridesForRow) continue;
      for (const [key, value] of Object.entries(overridesForRow)) {
        item.values[normalizeHeader(key)] = cleanCellValue(value);
      }
    }
  }
  if (!parsedFile.rows.length) {
    return { success: false, message: "All rows were excluded. Keep at least one row to import." };
  }
  if (parsedFile.rows.length > 500) return { success: false, message: "Import up to 500 Questions at one time." };
  if (mockTest && mode === "replace" && parsedFile.rows.length !== mockTest.target_question_count) return { success: false, message: `Nothing was replaced. The file has ${parsedFile.rows.length} row${parsedFile.rows.length === 1 ? "" : "s"}, but this Mock Test requires exactly ${mockTest.target_question_count}.` };
  if (subjectsError) return { success: false, message: subjectsError.message };
  const subjectByName = new Map((subjects ?? []).map((subject) => [normalizeLookup(subject.name), subject]));

  try {
    const requiredHeaders = determineRequiredHeaders({
      headers: parsedFile.headers,
      rows: parsedFile.rows,
      subjects: subjects ?? [],
      subjectByName,
      mockTest,
    });
    validateHeaders(parsedFile.headers, requiredHeaders);
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "The Question file could not be read." };
  }

  const existingMockQuestionCount = mockTest && mode === "add" ? (existingMockCountResult.count ?? 0) : 0;
  const startSlot = mode === "add" ? existingMockQuestionCount : 0;

  const skipCrossTestDuplicateCheck =
    Boolean(mockTest?.allow_duplicate_questions) ||
    String(formData.get("skip_cross_test_duplicate_check") ?? "") === "1";

  // Pre-fetch active questions in this paper to check for duplicates (only when needed)
  const subjectIds = (subjects ?? []).map((subject) => subject.id);
  let existingPaperQuestions: Array<{
    id: string;
    question_text: string;
    question_text_te: string | null;
    subject_id: string;
    import_key: string | null;
    mock_test_questions: Array<{
      mock_test_id: string;
      question_order?: number | null;
      mock_tests: { id: string; title: string; paper_id: string; status?: string; superseded_by_mock_test_id?: string | null; test_scope?: "paper" | "subject" } | null;
    }>;
  }> = [];

  if (mockTest && skipCrossTestDuplicateCheck) {
    // Only check whether any uploaded question is already assigned to this mock test in add mode
    if (mode === "add" && existingMockQuestionCount > 0) {
      const { data: currentAssignments } = await supabase
        .from("mock_test_questions")
        .select(`
          mock_test_id,
          question_order,
          questions!inner (
            id,
            question_text,
            question_text_te,
            subject_id,
            import_key
          )
        `)
        .eq("mock_test_id", mockTest.id);

      for (const item of currentAssignments ?? []) {
        const typedItem = item as unknown as {
          question_order?: number | null;
          questions: {
            id: string;
            question_text: string;
            question_text_te: string | null;
            subject_id: string;
            import_key: string | null;
          } | null;
        };
        const q = typedItem.questions;
        if (!q) continue;
        existingPaperQuestions.push({
          ...q,
          mock_test_questions: [
            {
              mock_test_id: mockTest.id,
              question_order: typedItem.question_order ?? null,
              mock_tests: {
                id: mockTest.id,
                title: "this Mock Test",
                paper_id: mockTest.paper_id,
                status: mockTest.status,
                superseded_by_mock_test_id: null,
                test_scope: mockTest.test_scope,
              },
            },
          ],
        });
      }
    }
  } else if (mockTest && subjectIds.length > 0) {
    // Fast targeted duplicate check with URL-budgeted chunking so long Telugu texts
    // never exceed PostgREST/gateway URL length limits or query unused columns.
    const canonicalQuestionTexts = new Set<string>();
    const canonicalTeluguTexts = new Set<string>();

    for (const { values: r } of parsedFile.rows) {
      const rowSubject = subjectByName.get(normalizeLookup(r.subject ?? ""));
      const modeForRow = rowSubject?.content_language_mode;
      const enText = (r.question_en ?? r.question ?? "").trim();
      const teText = (r.question_te ?? "").trim();

      if (modeForRow === "telugu") {
        if (teText.length >= 10) {
          canonicalQuestionTexts.add(teText);
          canonicalTeluguTexts.add(teText);
        }
      } else if (modeForRow === "english" || modeForRow === "bilingual") {
        if (enText.length >= 10) canonicalQuestionTexts.add(enText);
      } else {
        if (enText.length >= 10) canonicalQuestionTexts.add(enText);
        if (teText.length >= 10) {
          canonicalQuestionTexts.add(teText);
          canonicalTeluguTexts.add(teText);
        }
      }
    }

    const questionSelect = `
      id,
      question_text,
      question_text_te,
      subject_id,
      import_key,
      mock_test_questions (
        mock_test_id,
        question_order,
        mock_tests (
          id,
          title,
          paper_id,
          status,
          superseded_by_mock_test_id,
          test_scope
        )
      )
    `;

    const queryPromises = [
      ...chunkTextsByUrlBudget(Array.from(canonicalQuestionTexts)).map((textChunk) =>
        supabase
          .from("questions")
          .select(questionSelect)
          .in("subject_id", subjectIds)
          .eq("is_active", true)
          .in("question_text", textChunk)
      ),
      ...chunkTextsByUrlBudget(Array.from(canonicalTeluguTexts)).map((textChunk) =>
        supabase
          .from("questions")
          .select(questionSelect)
          .in("subject_id", subjectIds)
          .eq("is_active", true)
          .in("question_text_te", textChunk)
      ),
    ];

    if (queryPromises.length > 0) {
      const results = await Promise.all(queryPromises);
      for (const res of results) {
        if (res.data) {
          existingPaperQuestions = existingPaperQuestions.concat(res.data as unknown as typeof existingPaperQuestions);
        }
      }
    }
  }

  const normalizeQuestionText = (text: string | null | undefined) =>
    (text ?? "")
      .trim()
      .toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\s+/g, " ");

  type ExistingDbQuestion = {
    id: string;
    importKey: string | null;
    subjectId: string;
    subjectName: string;
    assignedMockTests: Array<{
      id: string;
      title: string;
      testScope: "paper" | "subject";
      questionOrder: number | null;
    }>;
  };

  const existingByText = new Map<string, ExistingDbQuestion>();
  for (const q of existingPaperQuestions) {
    const normEn = normalizeQuestionText(q.question_text);
    const normTe = normalizeQuestionText(q.question_text_te);
    const subjName = (subjects ?? []).find((s) => s.id === q.subject_id)?.name ?? "Subject";
    const assignedMockTests: ExistingDbQuestion["assignedMockTests"] = [];

    for (const mtq of (q.mock_test_questions as unknown as Array<{
      mock_test_id: string;
      question_order?: number | null;
      mock_tests: { id: string; title: string; paper_id: string; status: string; superseded_by_mock_test_id: string | null; test_scope?: "paper" | "subject" } | null;
    }>) ?? []) {
      if (
        mtq.mock_tests?.title &&
        mtq.mock_tests.status !== "archived" &&
        !mtq.mock_tests.superseded_by_mock_test_id &&
        mtq.mock_tests.id !== mockTest?.replaces_mock_test_id &&
        mtq.mock_test_id !== mockTest?.replaces_mock_test_id &&
        mtq.mock_tests.superseded_by_mock_test_id !== mockTest?.id
      ) {
        assignedMockTests.push({
          id: mtq.mock_tests.id,
          title: mtq.mock_tests.title,
          testScope: (mtq.mock_tests.test_scope as "paper" | "subject") ?? "paper",
          questionOrder: typeof mtq.question_order === "number" ? mtq.question_order : null,
        });
      }
    }

    const entry: ExistingDbQuestion = {
      id: q.id,
      importKey: q.import_key,
      subjectId: q.subject_id,
      subjectName: subjName,
      assignedMockTests,
    };

    if (normEn && normEn.length >= 10) existingByText.set(normEn, entry);
    if (normTe && normTe.length >= 10) existingByText.set(normTe, entry);
  }

  const importKeys = new Set<string>();
  const seenFileQuestions = new Map<string, { rowNumber: number; questionNumber: number }>();
  const errors: string[] = [];
  const issues: ImportIssueItem[] = [];
  const importRows: Record<string, unknown>[] = [];
  const embeddedImageTargets: Array<{ importIndex: number; image: EmbeddedQuestionImage; rowNumber: number }> = [];
  const assignmentPreferences: Array<{ key: string; rowNumber: number; questionOrder: number | null; marks: number | null; negativeMarks: number | null }> = [];

  parsedFile.rows.forEach(({ values: row, rowNumber }, rowIndex) => {
    // Option 1: Automatic slot assignment (q1, q2...) for mock test uploads
    // Completely frees the admin from managing random import_keys in Excel
    const slotNumber = startSlot + rowIndex + 1;
    const questionNumber = slotNumber;
    const slotKey = `q${slotNumber}`;
    const importKey = mockTest ? slotKey : ((row.import_key ?? "").trim().toLocaleLowerCase() || slotKey);
    const storedImportKey = mockTest ? `mock:${mockTest.id}:${slotKey}` : importKey;
    const subject = subjectByName.get(normalizeLookup(row.subject ?? ""));
    const correctAnswer = (row.correct_answer ?? "").trim().toUpperCase() as CorrectAnswer;
    const rawExpiresOn = (
      row.expires_on ??
      row.expire_on ??
      row.expiry_date ??
      row.expire_date ??
      row.expires ??
      row.expiry ??
      row.exper ??
      row.expire ??
      ""
    ).trim();

    let expiresOn = rawExpiresOn;
    const ddmmyyyyMatch = expiresOn.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      expiresOn = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    const rawReviewOn = (row.review_on ?? row.review_date ?? "").trim();
    let reviewOn = rawReviewOn;
    const reviewDdmmyyyyMatch = reviewOn.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (reviewDdmmyyyyMatch) {
      const [, day, month, year] = reviewDdmmyyyyMatch;
      reviewOn = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    const rawLifecycle = (row.content_lifecycle ?? "").trim();
    let lifecycle = rawLifecycle.toLowerCase() as QuestionLifecycle;
    if (!lifecycle) {
      lifecycle = expiresOn ? "expires" : (reviewOn ? "review" : "permanent");
    }
    const sourceExamDate = (row.source_exam_date ?? "").trim();
    const isActive = activeValue(row.is_active ?? "");
    const english = languageValues(row, "en");
    const telugu = languageValues(row, "te");
    const questionPreview = (english.question || telugu.question || row.question || "").trim().slice(0, 140);
    const questionOrder = optionalNumber(row.question_order ?? "");
    const marks = optionalNumber(row.marks ?? "");
    const negativeMarks = optionalNumber(row.negative_marks ?? "");
    const embeddedImage = parsedFile.embeddedImages.get(rowNumber);
    const image = embeddedImage ? { url: null, error: null } : normalizeQuestionImageUrl(row.image_url ?? "");

    if (!importKey) {
      errors.push(`Row ${rowNumber}: import_key is required.`);
      issues.push({
        id: `row-${rowNumber}-import_key`,
        rowNumber,
        questionNumber,
        questionPreview,
        kind: "other",
        field: "import_key",
        currentValue: "",
        requiredFormat: "Unique key",
        message: "import_key is required.",
        editableType: "text",
      });
    }
    if (storedImportKey.length > 200) {
      errors.push(`Row ${rowNumber}: import_key is too long.`);
      issues.push({
        id: `row-${rowNumber}-import_key-len`,
        rowNumber,
        questionNumber,
        questionPreview,
        kind: "other",
        field: "import_key",
        currentValue: importKey,
        requiredFormat: "Max 200 chars",
        message: "import_key is too long.",
        editableType: "text",
      });
    }
    if (!subject) {
      errors.push(`Row ${rowNumber}: Subject "${row.subject || "(blank)"}" does not exist in the chosen Paper.`);
      issues.push({
        id: `row-${rowNumber}-subject`,
        rowNumber,
        questionNumber,
        questionPreview,
        kind: "subject",
        field: "subject",
        currentValue: (row.subject ?? "").trim(),
        requiredFormat: "Existing subject in Paper",
        message: `Subject "${row.subject || "(blank)"}" does not exist in this Paper.`,
        editableType: "subject",
      });
    }
    if (subject && importKeys.has(`${subject.id}:${importKey}`)) {
      errors.push(`Row ${rowNumber}: import_key "${importKey}" is repeated for ${subject.name}.`);
      issues.push({
        id: `row-${rowNumber}-import_key-dup`,
        rowNumber,
        questionNumber,
        questionPreview,
        kind: "other",
        field: "import_key",
        currentValue: importKey,
        requiredFormat: "Unique per subject",
        message: `import_key "${importKey}" is repeated for ${subject.name}.`,
        editableType: "text",
      });
    }
    if (subject && importKey) importKeys.add(`${subject.id}:${importKey}`);
    if (!answers.includes(correctAnswer)) {
      errors.push(`Row ${rowNumber}: correct_answer must be A, B, C, or D.`);
      issues.push({
        id: `row-${rowNumber}-correct_answer`,
        rowNumber,
        questionNumber,
        questionPreview,
        kind: "correct_answer",
        field: "correct_answer",
        currentValue: (row.correct_answer ?? "").trim(),
        requiredFormat: "A, B, C, or D",
        message: "correct_answer must be A, B, C, or D.",
        editableType: "answer",
      });
    }
    if (!lifecycles.includes(lifecycle)) {
      errors.push(`Row ${rowNumber}: content_lifecycle must be permanent, review, or expires.`);
      issues.push({
        id: `row-${rowNumber}-content_lifecycle`,
        rowNumber,
        questionNumber,
        questionPreview,
        kind: "content_lifecycle",
        field: "content_lifecycle",
        currentValue: rawLifecycle,
        requiredFormat: "permanent | review | expires",
        message: `Invalid content_lifecycle "${rawLifecycle}". Choose permanent, review, or expires.`,
        editableType: "lifecycle",
        relatedDateField: "review_on",
        relatedDateValue: rawReviewOn || rawExpiresOn,
      });
    } else if (lifecycle === "review" && !validDate(reviewOn)) {
      errors.push(`Row ${rowNumber}: review_on must use YYYY-MM-DD.`);
      issues.push({
        id: `row-${rowNumber}-review_on`,
        rowNumber,
        questionNumber,
        questionPreview,
        kind: "date_format",
        field: "review_on",
        currentValue: rawReviewOn,
        requiredFormat: "YYYY-MM-DD",
        suggestedValue: suggestIsoDate(rawReviewOn) ?? undefined,
        message: "review_on must use YYYY-MM-DD format.",
        editableType: "date",
      });
    } else if (lifecycle === "expires" && !validDate(expiresOn)) {
      errors.push(`Row ${rowNumber}: expires_on must use YYYY-MM-DD.`);
      issues.push({
        id: `row-${rowNumber}-expires_on`,
        rowNumber,
        questionNumber,
        questionPreview,
        kind: "date_format",
        field: "expires_on",
        currentValue: rawExpiresOn,
        requiredFormat: "YYYY-MM-DD",
        suggestedValue: suggestIsoDate(rawExpiresOn) ?? undefined,
        message: "expires_on must use YYYY-MM-DD format.",
        editableType: "date",
      });
    }
    if (sourceExamDate && !validDate(sourceExamDate)) {
      errors.push(`Row ${rowNumber}: source_exam_date must use YYYY-MM-DD.`);
      issues.push({
        id: `row-${rowNumber}-source_exam_date`,
        rowNumber,
        questionNumber,
        questionPreview,
        kind: "date_format",
        field: "source_exam_date",
        currentValue: sourceExamDate,
        requiredFormat: "YYYY-MM-DD",
        suggestedValue: suggestIsoDate(sourceExamDate) ?? undefined,
        message: "source_exam_date must use YYYY-MM-DD format.",
        editableType: "date",
      });
    }
    if (isActive === null) {
      errors.push(`Row ${rowNumber}: is_active must be true or false.`);
      issues.push({
        id: `row-${rowNumber}-is_active`,
        rowNumber,
        questionNumber,
        questionPreview,
        kind: "is_active",
        field: "is_active",
        currentValue: (row.is_active ?? "").trim(),
        requiredFormat: "true or false",
        message: "is_active must be true or false.",
        editableType: "boolean",
      });
    }
    if (image.error) {
      errors.push(`Row ${rowNumber}: ${image.error}`);
      issues.push({
        id: `row-${rowNumber}-image_url`,
        rowNumber,
        questionNumber,
        questionPreview,
        kind: "image_conflict",
        field: "image_url",
        currentValue: (row.image_url ?? "").trim(),
        requiredFormat: "HTTPS PNG/JPG/WebP URL",
        message: image.error,
        editableType: "text",
      });
    }
    if (embeddedImage && (row.image_url ?? "").trim()) {
      errors.push(`Row ${rowNumber}: use either the embedded image or image_url, not both.`);
      issues.push({
        id: `row-${rowNumber}-image_conflict`,
        rowNumber,
        questionNumber,
        questionPreview,
        kind: "image_conflict",
        field: "image_url",
        currentValue: (row.image_url ?? "").trim(),
        requiredFormat: "Clear image_url to keep embedded image",
        message: "Use either the embedded image or image_url, not both.",
        editableType: "text",
      });
    }
    if (mockTest && questionOrder !== null && (!Number.isInteger(questionOrder) || questionOrder < 1)) {
      errors.push(`Row ${rowNumber}: question_order must be a whole number greater than zero.`);
      issues.push({
        id: `row-${rowNumber}-question_order`,
        rowNumber,
        questionNumber,
        questionPreview,
        kind: "numeric_field",
        field: "question_order",
        currentValue: (row.question_order ?? "").trim(),
        requiredFormat: "Whole number >= 1",
        message: "question_order must be a whole number >= 1.",
        editableType: "number",
      });
    }
    if (mockTest && marks !== null && (!Number.isFinite(marks) || marks <= 0)) {
      errors.push(`Row ${rowNumber}: marks must be a number greater than zero.`);
      issues.push({
        id: `row-${rowNumber}-marks`,
        rowNumber,
        questionNumber,
        questionPreview,
        kind: "numeric_field",
        field: "marks",
        currentValue: (row.marks ?? "").trim(),
        requiredFormat: "Number > 0",
        message: "marks must be greater than zero.",
        editableType: "number",
      });
    }
    if (mockTest && negativeMarks !== null && (!Number.isFinite(negativeMarks) || negativeMarks < 0)) {
      errors.push(`Row ${rowNumber}: negative_marks must be zero or a positive number.`);
      issues.push({
        id: `row-${rowNumber}-negative_marks`,
        rowNumber,
        questionNumber,
        questionPreview,
        kind: "numeric_field",
        field: "negative_marks",
        currentValue: (row.negative_marks ?? "").trim(),
        requiredFormat: "Number >= 0",
        message: "negative_marks must be zero or positive.",
        editableType: "number",
      });
    }

    const languageMode = subject?.content_language_mode as SubjectContentLanguageMode | undefined;
    if (languageMode === "bilingual") {
      const englishError = validateLanguageValues(english, "English", rowNumber);
      const teluguError = validateLanguageValues(telugu, "Telugu", rowNumber);
      if (englishError) errors.push(englishError);
      if (teluguError) errors.push(teluguError);
      issues.push(
        ...collectLanguageValueIssues(english, "en", "English", rowNumber, questionNumber, questionPreview),
        ...collectLanguageValueIssues(telugu, "te", "Telugu", rowNumber, questionNumber, questionPreview),
      );
    } else if (languageMode === "english") {
      const englishError = validateLanguageValues(english, "English", rowNumber);
      if (englishError) errors.push(englishError);
      issues.push(
        ...collectLanguageValueIssues(english, "en", "English", rowNumber, questionNumber, questionPreview),
      );
    } else if (languageMode === "telugu") {
      const teluguError = validateLanguageValues(telugu, "Telugu", rowNumber);
      if (teluguError) errors.push(teluguError);
      issues.push(
        ...collectLanguageValueIssues(telugu, "te", "Telugu", rowNumber, questionNumber, questionPreview),
      );
    }

    if (mockTest?.test_scope === "subject" && subject && subject.id !== mockTest.subject_id) {
      const targetSubjectName = (subjects ?? []).find((s) => s.id === mockTest.subject_id)?.name ?? "selected subject";
      errors.push(`Row ${rowNumber}: this subject-wise Mock Test only accepts Questions for its selected Subject.`);
      issues.push({
        id: `row-${rowNumber}-subject-scope`,
        rowNumber,
        questionNumber,
        questionPreview,
        kind: "subject",
        field: "subject",
        currentValue: (row.subject ?? "").trim(),
        requiredFormat: targetSubjectName,
        suggestedValue: targetSubjectName,
        message: `Subject-wise test only accepts "${targetSubjectName}".`,
        editableType: "subject",
      });
    }

    const canonical = languageMode === "telugu" ? telugu : english;
    const canonicalField = languageMode === "telugu" ? "question_te" : "question_en";
    const normCanonical = normalizeQuestionText(canonical.question);

    if (normCanonical && normCanonical.length >= 10) {
      // In-file duplicate check (catches repeated questions within the same file)
      const seenEntry = seenFileQuestions.get(normCanonical);
      if (seenEntry !== undefined) {
        errors.push(
          `Row ${rowNumber}: Duplicate question text in file. Matches Row ${seenEntry.rowNumber}. Questions in the file must be unique.`
        );
        issues.push({
          id: `row-${rowNumber}-dup-file`,
          rowNumber,
          questionNumber,
          questionPreview,
          kind: "duplicate_in_file",
          field: canonicalField,
          currentValue: canonical.question,
          duplicateLocation: {
            type: "file",
            targetRowNumber: seenEntry.rowNumber,
            targetQuestionNumber: seenEntry.questionNumber,
          },
          message: `Matches Row ${seenEntry.rowNumber} (Q${seenEntry.questionNumber}) in this file.`,
          editableType: "text",
        });
      } else {
        seenFileQuestions.set(normCanonical, { rowNumber, questionNumber });
      }

      // Database duplicate check in this paper
      const existingMatch = existingByText.get(normCanonical);
      if (existingMatch) {
        if (mockTest) {
          const thisTestAssignment = existingMatch.assignedMockTests.find((t) => t.id === mockTest.id);
          if (thisTestAssignment && mode === "add") {
            errors.push(`Row ${rowNumber}: Duplicate question! This question is already assigned to this Mock Test.`);
            issues.push({
              id: `row-${rowNumber}-dup-this-test`,
              rowNumber,
              questionNumber,
              questionPreview,
              kind: "duplicate_in_this_test",
              field: canonicalField,
              currentValue: canonical.question,
              duplicateLocation: {
                type: "this_test",
                targetQuestionNumber: thisTestAssignment.questionOrder ?? undefined,
              },
              message: `Already in this Mock Test${thisTestAssignment.questionOrder ? ` (Q#${thisTestAssignment.questionOrder})` : ""}.`,
              editableType: "text",
            });
          }
          const otherTests = existingMatch.assignedMockTests.filter((t) => t.id !== mockTest.id);
          // Questions are allowed to repeat between a subject-wise test and a full paper mock test
          const conflictingTests = otherTests.filter((t) => {
            if (mockTest.test_scope === "paper" && t.testScope === "subject") return false;
            if (mockTest.test_scope === "subject" && t.testScope === "paper") return false;
            return true;
          });
          if (!skipCrossTestDuplicateCheck && conflictingTests.length > 0) {
            errors.push(
              `Row ${rowNumber}: Duplicate question! This question already exists in "${conflictingTests[0].title}". Questions cannot be repeated across mock tests with the same scope in this paper.`
            );
            issues.push({
              id: `row-${rowNumber}-dup-other-test`,
              rowNumber,
              questionNumber,
              questionPreview,
              kind: "duplicate_in_other_test",
              field: canonicalField,
              currentValue: canonical.question,
              duplicateLocation: {
                type: "other_test",
                mockTestTitle: conflictingTests[0].title,
                targetQuestionNumber: conflictingTests[0].questionOrder ?? undefined,
              },
              message: `In "${conflictingTests[0].title}"${conflictingTests[0].questionOrder ? ` (Q#${conflictingTests[0].questionOrder})` : ""}.`,
              editableType: "text",
            });
          } else if (!skipCrossTestDuplicateCheck && subject && existingMatch.subjectId !== subject.id) {
            errors.push(
              `Row ${rowNumber}: Duplicate question! An identical question already exists under ${existingMatch.subjectName}.`
            );
            issues.push({
              id: `row-${rowNumber}-dup-other-subject`,
              rowNumber,
              questionNumber,
              questionPreview,
              kind: "duplicate_in_other_subject",
              field: canonicalField,
              currentValue: canonical.question,
              duplicateLocation: {
                type: "other_subject",
                subjectName: existingMatch.subjectName,
              },
              message: `Exists under "${existingMatch.subjectName}".`,
              editableType: "text",
            });
          }
        }
      }
    }

    if (!subject || !importKey || !answers.includes(correctAnswer) || !lifecycles.includes(lifecycle) || isActive === null || (mockTest?.test_scope === "subject" && subject.id !== mockTest.subject_id)) return;
    const importIndex = importRows.length;
    importRows.push({
      subject_id: subject.id,
      import_key: storedImportKey,
      question_text: canonical.question,
      question_type: "mcq",
      option_a: canonical.options[0],
      option_b: canonical.options[1],
      option_c: canonical.options[2],
      option_d: canonical.options[3],
      correct_answer: correctAnswer,
      explanation: canonical.explanation,
      question_text_te: languageMode === "english" ? null : telugu.question,
      option_a_te: languageMode === "english" ? null : telugu.options[0],
      option_b_te: languageMode === "english" ? null : telugu.options[1],
      option_c_te: languageMode === "english" ? null : telugu.options[2],
      option_d_te: languageMode === "english" ? null : telugu.options[3],
      explanation_te: languageMode === "english" ? null : telugu.explanation,
      image_url: image.url,
      source_reference: (row.source_reference ?? "").trim() || null,
      source_exam_date: sourceExamDate || null,
      difficulty: ["easy", "medium", "hard"].includes((row.difficulty ?? "").trim().toLowerCase()) ? (row.difficulty ?? "").trim().toLowerCase() : "medium",
      is_active: isActive,
      content_lifecycle: lifecycle,
      review_on: lifecycle === "review" ? reviewOn : null,
      expires_on: lifecycle === "expires" ? expiresOn : null,
    });
    if (embeddedImage) embeddedImageTargets.push({ importIndex, image: embeddedImage, rowNumber });
    assignmentPreferences.push({ key: `${subject.id}:${storedImportKey}`, rowNumber, questionOrder, marks, negativeMarks });
  });

  if (errors.length) {
    const duplicateCount = issues.filter(isDuplicateIssue).length;
    const otherCount = Math.max(0, issues.length - duplicateCount);
    const parts: string[] = [];
    if (duplicateCount > 0) {
      parts.push(`${duplicateCount} duplicate${duplicateCount === 1 ? "" : "s"}`);
    }
    if (otherCount > 0) {
      parts.push(`${otherCount} ${duplicateCount > 0 ? "other " : ""}issue${otherCount === 1 ? "" : "s"}`);
    }
    const summaryMessage = parts.length
      ? `${parts.join(" and ")} found.`
      : `${errors.length} issue${errors.length === 1 ? "" : "s"} found.`;
    const availableSubjects =
      mockTest?.test_scope === "subject" && mockTest.subject_id
        ? (subjects ?? []).filter((s) => s.id === mockTest.subject_id).map((s) => s.name)
        : (subjects ?? []).map((s) => s.name);

    return {
      success: false,
      message: summaryMessage,
      issues,
      availableSubjects,
      isMockTest: Boolean(mockTest),
      importMode: mode,
    };
  }

  const uploadedImagePaths: string[] = [];
  try {
    for (const target of embeddedImageTargets) {
      const imageFile = new File([Uint8Array.from(target.image.bytes)], target.image.fileName, { type: target.image.mimeType });
      const uploaded = await uploadQuestionImage(supabase, user.id, imageFile);
      if (uploaded.error || !uploaded.url || !uploaded.path) {
        await Promise.all(uploadedImagePaths.map((path) => removeQuestionImage(supabase, path)));
        return { success: false, message: `Nothing was imported. Row ${target.rowNumber}: ${uploaded.error ?? "the embedded image could not be uploaded."}` };
      }
      importRows[target.importIndex].image_url = uploaded.url;
      uploadedImagePaths.push(uploaded.path);
    }
  } catch (error) {
    await Promise.all(uploadedImagePaths.map((path) => removeQuestionImage(supabase, path)));
    return { success: false, message: `Nothing was imported. ${error instanceof Error ? error.message : "An embedded image could not be uploaded."}` };
  }

  let atomicAssignments: Array<{
    subject_id: string;
    import_key: string;
    question_order: number | null;
    marks: number;
    negative_marks: number;
  }> = [];

  if (mockTest) {
    const subjectOrderMap = new Map((subjects ?? []).map((s) => [s.id, Number(s.display_order ?? 999)]));
    // Sort preferences by subject's display_order first, then by row order
    const sortedPreferences = [...assignmentPreferences].sort((a, b) => {
      const subjectIdA = a.key.slice(0, a.key.indexOf(":"));
      const subjectIdB = b.key.slice(0, b.key.indexOf(":"));
      const orderA = subjectOrderMap.get(subjectIdA) ?? 999;
      const orderB = subjectOrderMap.get(subjectIdB) ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return (a.questionOrder ?? a.rowNumber) - (b.questionOrder ?? b.rowNumber);
    });

    atomicAssignments = sortedPreferences.map((preference, index) => {
      const separator = preference.key.indexOf(":");
      return {
        subject_id: preference.key.slice(0, separator),
        import_key: preference.key.slice(separator + 1),
        question_order: mode === "replace" ? index + 1 : preference.questionOrder,
        marks: preference.marks ?? paper.default_correct_marks ?? 1,
        negative_marks: preference.negativeMarks ?? paper.default_negative_marks ?? 0,
      };
    });
  }
  const rpcName = mockTest && mode === "replace" ? "replace_mock_test_questions_atomic" : "import_questions_atomic";
  const { data: importResult, error } = await supabase.rpc(rpcName, {
      requested_paper_id: paperId,
      requested_mock_test_id: mockTest?.id ?? null,
      requested_questions: importRows,
      requested_assignments: atomicAssignments,
    });
  if (error) {
    await Promise.all(uploadedImagePaths.map((path) => removeQuestionImage(supabase, path)));
    const orderConflict = error.code === "23505" && error.message.includes("question_order");
    const targetReached = error.message.includes("target number of Questions");
    return {
      success: false,
      message: orderConflict
        ? "Nothing was imported. One or more Question order numbers are already in use."
        : targetReached
          ? "Nothing was imported. The file would exceed this Mock Test's target. Remove rows or increase the draft target first."
        : `Nothing was imported. ${error.message}`,
    };
  }
  const summary = importResult?.[0] ?? { added: 0, updated: 0, assigned: 0, already_assigned: 0, deleted_orphans: 0, orphan_image_urls: [] };
  const added = Number(summary.added);
  const updated = Number(summary.updated);
  const assigned = Number(summary.assigned);
  const alreadyAssigned = Number(summary.already_assigned);
  if (mode === "replace") {
    const imageUrls = Array.isArray(summary.orphan_image_urls) ? summary.orphan_image_urls : [];
    await Promise.all(imageUrls.map((url: string) => removeQuestionImage(supabase, questionMediaPath(url))));
  }
  revalidatePath("/admin/questions");
  revalidatePath("/admin/mock-tests");
  if (mockTest) {
    revalidatePath(`/admin/mock-tests/${mockTest.id}/edit`);
    revalidatePath(`/admin/mock-tests/${mockTest.id}/questions`);
    revalidatePath(`/admin/mock-tests/${mockTest.id}/preview`);
    if (mode === "replace") return { success: true, message: `Replacement completed safely: ${assigned} Questions assigned, ${added} added to the Question Bank, ${updated} updated, and ${Number(summary.deleted_orphans ?? 0)} unused old Question${Number(summary.deleted_orphans ?? 0) === 1 ? "" : "s"} removed.` };
    return { success: true, message: `${added} Question${added === 1 ? "" : "s"} added, ${updated} updated, and ${assigned} assigned to this Mock Test from ${file.name}.${alreadyAssigned ? ` ${alreadyAssigned} already assigned Question${alreadyAssigned === 1 ? " was" : "s were"} kept.` : ""}` };
  }
  return { success: true, message: `${added} Question${added === 1 ? "" : "s"} added and ${updated} updated from ${file.name}.` };
}
