"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeQuestionImageUrl,
  removeQuestionImage,
  uploadQuestionImage,
} from "@/lib/questions/media";
import type { CorrectAnswer, QuestionLifecycle } from "@/types/question";
import type { SubjectContentLanguageMode } from "@/types/subject";

export type CreateQuestionState = { success: boolean; message: string };

const answers: CorrectAnswer[] = ["A", "B", "C", "D"];
const lifecycles: QuestionLifecycle[] = ["permanent", "review", "expires"];
const validDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

function languageValues(formData: FormData, suffix: "" | "_te") {
  return {
    question: String(formData.get(`question_text${suffix}`) ?? "").trim(),
    options: ["a", "b", "c", "d"].map((letter) =>
      String(formData.get(`option_${letter}${suffix}`) ?? "").trim(),
    ),
    explanation:
      String(formData.get(`explanation${suffix}`) ?? "").trim() || null,
  };
}

function languageIsComplete(values: ReturnType<typeof languageValues>) {
  return Boolean(values.question) && values.options.every(Boolean);
}

function normalizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ");
}

export type DuplicateCheckResult = {
  isDuplicate: boolean;
  message?: string;
  foundInTestTitle?: string;
};

export async function checkQuestionDuplicate(
  paperId: string,
  questionText: string,
  mockTestId?: string,
  excludeQuestionId?: string,
): Promise<DuplicateCheckResult> {
  if (!paperId || !questionText || questionText.trim().length < 10) {
    return { isDuplicate: false };
  }

  const supabase = await createClient();
  const { data: paperSubjects } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("paper_id", paperId);
  const paperSubjectIds = (paperSubjects ?? []).map((s) => s.id);
  if (!paperSubjectIds.length) return { isDuplicate: false };

  let query = supabase
    .from("questions")
    .select(`
      id,
      question_text,
      question_text_te,
      subject_id,
      mock_test_questions (
        mock_test_id,
        mock_tests (
          id,
          title
        )
      )
    `)
    .in("subject_id", paperSubjectIds)
    .eq("is_active", true);

  if (excludeQuestionId) {
    query = query.neq("id", excludeQuestionId);
  }

  const { data: existingQuestions } = await query;
  const normInput = normalizeText(questionText);

  const match = (existingQuestions ?? []).find((q) => {
    const normDbEn = normalizeText(q.question_text);
    const normDbTe = normalizeText(q.question_text_te);
    return (normDbEn && normDbEn === normInput) || (normDbTe && normDbTe === normInput);
  });

  if (!match) return { isDuplicate: false };

  type MockTestRef = { id: string; title: string };
  const assignedTests: MockTestRef[] = [];
  for (const mtq of match.mock_test_questions ?? []) {
    const rawMtq = mtq as unknown as { mock_tests: MockTestRef | null };
    if (rawMtq.mock_tests?.title) {
      assignedTests.push({ id: rawMtq.mock_tests.id, title: rawMtq.mock_tests.title });
    }
  }

  if (mockTestId) {
    const otherTest = assignedTests.find((t) => t.id !== mockTestId);
    if (otherTest) {
      return {
        isDuplicate: true,
        message: `This question already exists in "${otherTest.title}" in this paper series.`,
        foundInTestTitle: otherTest.title,
      };
    }
    const inThisTest = assignedTests.some((t) => t.id === mockTestId);
    if (inThisTest) {
      return {
        isDuplicate: true,
        message: "This question is already added to this Mock Test.",
      };
    }
  }

  const subjectName = paperSubjects?.find((s) => s.id === match.subject_id)?.name ?? "Subject";
  return {
    isDuplicate: true,
    message: `This question already exists in the Question Bank under ${subjectName}.`,
  };
}

export async function createQuestion(
  _previous: CreateQuestionState,
  formData: FormData,
): Promise<CreateQuestionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return { success: false, message: "You are not authorized to create Questions." };
  }

  const categoryId = String(formData.get("exam_id") ?? "").trim();
  const examId = String(formData.get("exam_group_id") ?? "").trim();
  const requestedPaperId = String(formData.get("paper_id") ?? "").trim();
  const subjectId = String(formData.get("subject_id") ?? "").trim();
  const mockTestId = String(formData.get("mock_test_id") ?? "").trim();
  const correctAnswer = String(formData.get("correct_answer") ?? "") as CorrectAnswer;
  const lifecycle = String(formData.get("content_lifecycle") ?? "") as QuestionLifecycle;
  const reviewOn = String(formData.get("review_on") ?? "").trim();
  const expiresOn = String(formData.get("expires_on") ?? "").trim();

  if ((!mockTestId && (!categoryId || !examId || !requestedPaperId)) || !subjectId) {
    return { success: false, message: "Choose a Recruiting Board, Exam, Paper, and Subject." };
  }
  if (!answers.includes(correctAnswer)) {
    return { success: false, message: "Choose the correct option." };
  }
  if (
    !lifecycles.includes(lifecycle) ||
    (lifecycle === "review" && !validDate(reviewOn)) ||
    (lifecycle === "expires" && !validDate(expiresOn))
  ) {
    return { success: false, message: "Choose a valid question lifetime and date." };
  }

  const { data: mockTest } = mockTestId
    ? await supabase.from("mock_tests").select("id, paper_id, subject_id, test_scope, status, target_question_count").eq("id", mockTestId).maybeSingle()
    : { data: null };
  if (mockTestId && (!mockTest || mockTest.status !== "draft")) {
    return { success: false, message: "Only a draft Mock Test can receive a new question." };
  }
  if (mockTestId) {
    const { count } = await supabase.from("test_attempts").select("id", { count: "exact", head: true }).eq("mock_test_id", mockTestId);
    if ((count ?? 0) > 0) return { success: false, message: "This Mock Test has student attempts and its Questions are locked." };
  }
  const paperId = mockTest?.paper_id ?? requestedPaperId;
  const [{ data: subject }, { data: paper }, { data: group }, assignmentCountResult] = await Promise.all([
    supabase
      .from("subjects")
      .select("id, paper_id, content_language_mode")
      .eq("id", subjectId)
      .maybeSingle(),
    supabase.from("papers").select("id, exam_group_id, default_correct_marks, default_negative_marks").eq("id", paperId).maybeSingle(),
    mockTest ? Promise.resolve({ data: null }) : supabase.from("exam_groups").select("id, exam_id").eq("id", examId).maybeSingle(),
    mockTest ? supabase.from("mock_test_questions").select("id", { count: "exact", head: true }).eq("mock_test_id", mockTest.id) : Promise.resolve({ count: 0 }),
  ]);
  if (
    !subject ||
    !paper ||
    subject.paper_id !== paper.id ||
    (!mockTest && (!group || paper.exam_group_id !== group.id || group.exam_id !== categoryId)) ||
    (mockTest && (paper.id !== mockTest.paper_id || (mockTest.test_scope === "subject" && subject.id !== mockTest.subject_id)))
  ) {
    return { success: false, message: "The selected category, Exam, Paper, and Subject do not belong together." };
  }
  if (mockTest && (assignmentCountResult.count ?? 0) >= mockTest.target_question_count) {
    return { success: false, message: `This Mock Test already has its target of ${mockTest.target_question_count} Questions.` };
  }

  const languageMode =
    subject.content_language_mode as SubjectContentLanguageMode;
  const english = languageValues(formData, "");
  const telugu = languageValues(formData, "_te");
  if (languageMode !== "telugu" && !languageIsComplete(english)) {
    return { success: false, message: "Complete the English question and all four options." };
  }
  if (languageMode !== "english" && !languageIsComplete(telugu)) {
    return { success: false, message: "Complete the Telugu question and all four options." };
  }

  const canonical = languageMode === "telugu" ? telugu : english;
  if (new Set(canonical.options.map((option) => option.toLocaleLowerCase())).size !== 4) {
    return { success: false, message: "All four answer options must be different." };
  }

  // Duplicate question check across paper and mock test series
  const { data: paperSubjects } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("paper_id", paperId);
  const paperSubjectIds = (paperSubjects ?? []).map((s) => s.id);

  if (paperSubjectIds.length > 0) {
    const { data: existingQuestions } = await supabase
      .from("questions")
      .select(`
        id,
        question_text,
        question_text_te,
        subject_id,
        mock_test_questions (
          mock_test_id,
          mock_tests (
            id,
            title
          )
        )
      `)
      .in("subject_id", paperSubjectIds)
      .eq("is_active", true);

    const normNewEn = normalizeText(english.question);
    const normNewTe = normalizeText(telugu.question);

    const match = (existingQuestions ?? []).find((q) => {
      const normDbEn = normalizeText(q.question_text);
      const normDbTe = normalizeText(q.question_text_te);

      if (normNewEn && normDbEn && normNewEn.length >= 10 && normNewEn === normDbEn) return true;
      if (normNewTe && normDbTe && normNewTe.length >= 10 && normNewTe === normDbTe) return true;
      return false;
    });

    if (match) {
      type MockTestRef = { id: string; title: string };
      const assignedTests: MockTestRef[] = [];
      for (const mtq of match.mock_test_questions ?? []) {
        const rawMtq = mtq as unknown as { mock_tests: MockTestRef | null };
        if (rawMtq.mock_tests?.title) {
          assignedTests.push({ id: rawMtq.mock_tests.id, title: rawMtq.mock_tests.title });
        }
      }

      if (mockTest) {
        const inThisTest = assignedTests.some((t) => t.id === mockTest.id);
        if (inThisTest) {
          return {
            success: false,
            message: "This question is already added to this Mock Test.",
          };
        }
        const otherTest = assignedTests.find((t) => t.id !== mockTest.id);
        if (otherTest) {
          return {
            success: false,
            message: `Duplicate question detected! This question already exists in "${otherTest.title}". Questions cannot be repeated across mock tests in the same paper series.`,
          };
        }
        return {
          success: false,
          message: "This question already exists in the Question Bank for this Paper. Questions cannot be duplicated.",
        };
      } else {
        const subjectName = paperSubjects?.find((s) => s.id === match.subject_id)?.name ?? "the selected Subject";
        return {
          success: false,
          message: `This question already exists under ${subjectName}.`,
        };
      }
    }
  }

  const imageFile = formData.get("question_image");
  const normalizedImage = normalizeQuestionImageUrl(formData.get("image_url"));
  if (normalizedImage.error && (!(imageFile instanceof File) || imageFile.size === 0)) {
    return { success: false, message: normalizedImage.error };
  }
  const uploadedImage = imageFile instanceof File && imageFile.size > 0
    ? await uploadQuestionImage(supabase, user.id, imageFile)
    : { url: normalizedImage.url, path: null, error: null };
  if (uploadedImage.error) return { success: false, message: uploadedImage.error };

  const { data: createdQuestion, error } = await supabase.from("questions").insert({
    subject_id: subjectId,
    question_text: canonical.question,
    question_type: "mcq",
    option_a: canonical.options[0],
    option_b: canonical.options[1],
    option_c: canonical.options[2],
    option_d: canonical.options[3],
    question_text_te: languageMode === "english" ? null : telugu.question,
    option_a_te: languageMode === "english" ? null : telugu.options[0],
    option_b_te: languageMode === "english" ? null : telugu.options[1],
    option_c_te: languageMode === "english" ? null : telugu.options[2],
    option_d_te: languageMode === "english" ? null : telugu.options[3],
    correct_answer: correctAnswer,
    explanation: canonical.explanation,
    explanation_te: languageMode === "english" ? null : telugu.explanation,
    image_url: uploadedImage.url,
    source_reference:
      String(formData.get("source_reference") ?? "").trim() || null,
    difficulty: "medium",
    is_active: formData.get("is_active") === "on",
    content_lifecycle: lifecycle,
    review_on: lifecycle === "review" ? reviewOn : null,
    expires_on: lifecycle === "expires" ? expiresOn : null,
  }).select("id").single();
  if (error) {
    await removeQuestionImage(supabase, uploadedImage.path);
    return { success: false, message: error.message };
  }

  if (mockTest && createdQuestion) {
    const { error: assignmentError } = await supabase.from("mock_test_questions").insert({
      mock_test_id: mockTest.id,
      question_id: createdQuestion.id,
      question_order: (assignmentCountResult.count ?? 0) + 1,
      marks: paper.default_correct_marks ?? 1,
      negative_marks: paper.default_negative_marks ?? 0,
    });
    if (assignmentError) {
      await supabase.from("questions").delete().eq("id", createdQuestion.id);
      await removeQuestionImage(supabase, uploadedImage.path);
      return { success: false, message: assignmentError.message };
    }
  }
  revalidatePath("/admin/questions");
  revalidatePath("/admin/mock-tests");
  if (mockTest) {
    revalidatePath(`/admin/mock-tests/${mockTest.id}/questions`);
    return { success: true, message: "Question added only to this Mock Test." };
  }
  return { success: true, message: "Question added with the required language content." };
}
