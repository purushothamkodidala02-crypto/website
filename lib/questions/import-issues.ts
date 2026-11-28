export type ImportIssueKind =
  | "duplicate_in_file"
  | "duplicate_in_this_test"
  | "duplicate_in_other_test"
  | "duplicate_in_other_subject"
  | "date_format"
  | "content_lifecycle"
  | "correct_answer"
  | "subject"
  | "is_active"
  | "missing_or_duplicate_option"
  | "numeric_field"
  | "image_conflict"
  | "other";

export type ImportIssueEditableType =
  | "date"
  | "lifecycle"
  | "subject"
  | "answer"
  | "boolean"
  | "number"
  | "text";

export type DuplicateLocationInfo = {
  type: "file" | "this_test" | "other_test" | "other_subject";
  targetRowNumber?: number;
  targetQuestionNumber?: number;
  mockTestTitle?: string;
  subjectName?: string;
};

export type ImportIssueItem = {
  id: string;
  rowNumber: number;
  questionNumber: number;
  questionPreview: string;
  kind: ImportIssueKind;
  field: string;
  currentValue: string;
  requiredFormat?: string;
  suggestedValue?: string;
  duplicateLocation?: DuplicateLocationInfo;
  message: string;
  editableType?: ImportIssueEditableType;
  relatedDateField?: "review_on" | "expires_on";
  relatedDateValue?: string;
};

export type ImportQuestionsState = {
  success: boolean;
  message: string;
  issues?: ImportIssueItem[];
  availableSubjects?: string[];
  isMockTest?: boolean;
  importMode?: "add" | "replace";
};

export function isValidIsoDate(value: string): boolean {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function suggestIsoDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (isValidIsoDate(trimmed)) return trimmed;

  // YYYY/MM/DD or YYYY.MM.DD
  const ymd = trimmed.match(/^(\d{4})[/.](\d{1,2})[/.](\d{1,2})$/);
  if (ymd) {
    const candidate = `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}`;
    return isValidIsoDate(candidate) ? candidate : null;
  }

  // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  const dmy = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) {
    const candidate = `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
    if (isValidIsoDate(candidate)) return candidate;
    // Fallback if MM/DD/YYYY (e.g. 11/25/2026)
    const mdyCandidate = `${dmy[3]}-${dmy[1].padStart(2, "0")}-${dmy[2].padStart(2, "0")}`;
    return isValidIsoDate(mdyCandidate) ? mdyCandidate : null;
  }

  return null;
}

export function parseRowOverridesJson(
  raw: FormDataEntryValue | null,
): Record<number, Record<string, string>> {
  if (typeof raw !== "string" || !raw.trim()) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const result: Record<number, Record<string, string>> = {};
    for (const [rowKey, fields] of Object.entries(parsed)) {
      const rowNum = Number(rowKey);
      if (!Number.isInteger(rowNum) || rowNum < 2) continue;
      if (!fields || typeof fields !== "object" || Array.isArray(fields)) continue;
      const cleanFields: Record<string, string> = {};
      for (const [fieldKey, fieldValue] of Object.entries(fields)) {
        if (typeof fieldValue === "string") {
          cleanFields[fieldKey] = fieldValue;
        }
      }
      if (Object.keys(cleanFields).length > 0) {
        result[rowNum] = cleanFields;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function parseExcludedRowsJson(raw: FormDataEntryValue | null): Set<number> {
  if (typeof raw !== "string" || !raw.trim()) return new Set();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    const result = new Set<number>();
    for (const item of parsed) {
      const num = Number(item);
      if (Number.isInteger(num) && num >= 2) result.add(num);
    }
    return result;
  } catch {
    return new Set();
  }
}

export function isDuplicateIssue(issue: ImportIssueItem): boolean {
  return (
    issue.kind === "duplicate_in_file" ||
    issue.kind === "duplicate_in_this_test" ||
    issue.kind === "duplicate_in_other_test" ||
    issue.kind === "duplicate_in_other_subject"
  );
}

export function formatDuplicateLocation(location?: DuplicateLocationInfo): string {
  if (!location) return "Duplicate detected";
  switch (location.type) {
    case "file":
      return `Matches Row ${location.targetRowNumber ?? "?"}${
        location.targetQuestionNumber ? ` (Q${location.targetQuestionNumber})` : ""
      } in this file`;
    case "this_test":
      return `Already in this Mock Test${
        location.targetQuestionNumber ? ` (Q#${location.targetQuestionNumber})` : ""
      }`;
    case "other_test":
      return `In "${location.mockTestTitle ?? "Another Mock Test"}"${
        location.targetQuestionNumber ? ` (Q#${location.targetQuestionNumber})` : ""
      }`;
    case "other_subject":
      return `Under subject "${location.subjectName ?? "Another Subject"}"`;
  }
}
