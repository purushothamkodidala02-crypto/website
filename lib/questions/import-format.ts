export const QUESTION_IMPORT_BASE_HEADERS = [
  "import_key",
  "subject",
  "correct_answer",
] as const;

export const QUESTION_IMPORT_ENGLISH_HEADERS = [
  "question_en",
  "option_a_en",
  "option_b_en",
  "option_c_en",
  "option_d_en",
] as const;

export const QUESTION_IMPORT_TELUGU_HEADERS = [
  "question_te",
  "option_a_te",
  "option_b_te",
  "option_c_te",
  "option_d_te",
] as const;

export const QUESTION_IMPORT_REQUIRED_HEADERS = [
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
] as const;

export const QUESTION_IMPORT_EXPORT_HEADERS = [
  "import_key",
  "subject",
  "question_en",
  "option_a_en",
  "option_b_en",
  "option_c_en",
  "option_d_en",
  "explanation_en",
  "question_te",
  "option_a_te",
  "option_b_te",
  "option_c_te",
  "option_d_te",
  "explanation_te",
  "correct_answer",
  "image_url",
  "source_reference",
  "source_exam_date",
  "difficulty",
  "is_active",
  "content_lifecycle",
  "review_on",
  "expires_on",
  "question_order",
  "marks",
  "negative_marks",
] as const;

export function getRequiredHeadersForLanguageMode(
  mode: "bilingual" | "english" | "telugu",
): readonly string[] {
  if (mode === "english") {
    return [
      "import_key",
      "subject",
      "question_en",
      "option_a_en",
      "option_b_en",
      "option_c_en",
      "option_d_en",
      "correct_answer",
    ];
  }
  if (mode === "telugu") {
    return [
      "import_key",
      "subject",
      "question_te",
      "option_a_te",
      "option_b_te",
      "option_c_te",
      "option_d_te",
      "correct_answer",
    ];
  }
  return QUESTION_IMPORT_REQUIRED_HEADERS;
}
