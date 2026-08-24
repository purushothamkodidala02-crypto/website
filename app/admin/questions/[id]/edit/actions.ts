"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeQuestionImageUrl,
  questionMediaPath,
  removeQuestionImage,
  uploadQuestionImage,
} from "@/lib/questions/media";
import type { CorrectAnswer, QuestionLifecycle } from "@/types/question";
import type { SubjectContentLanguageMode } from "@/types/subject";

export type UpdateQuestionState = { success: boolean; message: string };

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

export async function updateQuestion(
  questionId: string,
  _previous: UpdateQuestionState,
  formData: FormData,
  mockTestId?: string,
): Promise<UpdateQuestionState> {
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
    return { success: false, message: "You are not authorized to update Questions." };
  }

  const subjectId = String(formData.get("subject_id") ?? "").trim();
  const correctAnswer = String(formData.get("correct_answer") ?? "") as CorrectAnswer;
  const lifecycle = String(
    formData.get("content_lifecycle") ?? "permanent",
  ) as QuestionLifecycle;
  const reviewOn = String(formData.get("review_on") ?? "").trim();
  const expiresOn = String(formData.get("expires_on") ?? "").trim();

  if (!subjectId || !answers.includes(correctAnswer)) {
    return { success: false, message: "Complete the Subject and correct answer." };
  }
  if (
    !lifecycles.includes(lifecycle) ||
    (lifecycle === "review" && !validDate(reviewOn)) ||
    (lifecycle === "expires" && !validDate(expiresOn))
  ) {
    return { success: false, message: "Choose a valid question lifetime and date." };
  }

  const [{ data: subject }, { data: existingQuestion }, { data: mockTest }] = await Promise.all([
    supabase
      .from("subjects")
      .select("id, paper_id, content_language_mode")
      .eq("id", subjectId)
      .maybeSingle(),
    supabase.from("questions").select("id, image_url").eq("id", questionId).maybeSingle(),
    mockTestId ? supabase.from("mock_tests").select("id, paper_id, subject_id, test_scope, status").eq("id", mockTestId).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  if (!subject || !existingQuestion) {
    return { success: false, message: "The selected Subject could not be found." };
  }
  if (mockTestId) {
    if (!mockTest || mockTest.status !== "draft") return { success: false, message: "Only draft Mock Tests can change their Questions." };
    if (subject.paper_id !== mockTest.paper_id || (mockTest.test_scope === "subject" && subject.id !== mockTest.subject_id)) return { success: false, message: "This Question must stay inside this Mock Test's Paper and Subject." };
    const [{ count: attemptCount }, { data: assignment }] = await Promise.all([
      supabase.from("test_attempts").select("id", { count: "exact", head: true }).eq("mock_test_id", mockTestId),
      supabase.from("mock_test_questions").select("id").eq("mock_test_id", mockTestId).eq("question_id", questionId).maybeSingle(),
    ]);
    if ((attemptCount ?? 0) > 0) return { success: false, message: "This Mock Test has student attempts and its Questions are locked." };
    if (!assignment) return { success: false, message: "This Question is not assigned to the selected Mock Test." };
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
  if (new Set(canonical.options.map((item) => item.toLocaleLowerCase())).size !== 4) {
    return { success: false, message: "All four answer options must be different." };
  }

  const { data: duplicate } = await supabase
    .from("questions")
    .select("id")
    .eq("subject_id", subjectId)
    .eq("question_text", canonical.question)
    .neq("id", questionId)
    .maybeSingle();
  if (duplicate && !mockTestId) {
    return { success: false, message: "This Question already exists under the selected Subject." };
  }

  const imageFile = formData.get("question_image");
  const removeImage = formData.get("remove_image") === "on";
  const normalizedImage = normalizeQuestionImageUrl(formData.get("image_url"));
  if (!removeImage && normalizedImage.error && (!(imageFile instanceof File) || imageFile.size === 0)) {
    return { success: false, message: normalizedImage.error };
  }
  const uploadedImage = imageFile instanceof File && imageFile.size > 0
    ? await uploadQuestionImage(supabase, user.id, imageFile)
    : { url: removeImage ? null : normalizedImage.url, path: null, error: null };
  if (uploadedImage.error) return { success: false, message: uploadedImage.error };

  const nextQuestion = {
      subject_id: subjectId,
      question_text: canonical.question,
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
      is_active: formData.get("is_active") === "on",
      content_lifecycle: lifecycle,
      review_on: lifecycle === "review" ? reviewOn : null,
      expires_on: lifecycle === "expires" ? expiresOn : null,
    };

  let copiedForThisMock = false;
  let updateError: { message: string } | null = null;
  if (mockTestId) {
    const { count: otherAssignmentCount } = await supabase.from("mock_test_questions").select("id", { count: "exact", head: true }).eq("question_id", questionId).neq("mock_test_id", mockTestId);
    if ((otherAssignmentCount ?? 0) > 0) {
      const { data: copiedQuestion, error: copyError } = await supabase.from("questions").insert({ ...nextQuestion, question_type: "mcq", import_key: null }).select("id").single();
      if (copyError || !copiedQuestion) {
        await removeQuestionImage(supabase, uploadedImage.path);
        return { success: false, message: copyError?.message ?? "The separate Question copy could not be created." };
      }
      const { error: assignmentError } = await supabase.from("mock_test_questions").update({ question_id: copiedQuestion.id }).eq("mock_test_id", mockTestId).eq("question_id", questionId);
      if (assignmentError) {
        await supabase.from("questions").delete().eq("id", copiedQuestion.id);
        await removeQuestionImage(supabase, uploadedImage.path);
        return { success: false, message: assignmentError.message };
      }
      copiedForThisMock = true;
    }
  }
  if (!copiedForThisMock) {
    const { error } = await supabase.from("questions").update(nextQuestion).eq("id", questionId);
    updateError = error;
  }

  if (updateError) {
    await removeQuestionImage(supabase, uploadedImage.path);
    return { success: false, message: updateError.message };
  }
  if (!copiedForThisMock && existingQuestion.image_url && existingQuestion.image_url !== uploadedImage.url) {
    await removeQuestionImage(supabase, questionMediaPath(existingQuestion.image_url));
  }
  revalidatePath("/admin/questions");
  revalidatePath(`/admin/questions/${questionId}/edit`);
  revalidatePath("/admin/mock-tests");
  if (mockTestId) {
    revalidatePath(`/admin/mock-tests/${mockTestId}/questions`);
    return { success: true, message: copiedForThisMock ? "Question updated only in this Mock Test. A separate copy was kept for its other use." : "Question updated only in this Mock Test." };
  }
  return { success: true, message: "Question updated in English and Telugu." };
}
