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
    return { success: false, message: "Choose an Exam Category, Exam, Paper, and Subject." };
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

  const { data: duplicate } = await supabase
    .from("questions")
    .select("id")
    .eq("subject_id", subjectId)
    .eq("question_text", canonical.question)
    .maybeSingle();
  if (duplicate && !mockTest) {
    return { success: false, message: "This Question already exists under the selected Subject." };
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
