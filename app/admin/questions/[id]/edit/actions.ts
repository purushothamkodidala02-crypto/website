"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  normalizeQuestionImageUrl,
  questionMediaPath,
  removeQuestionImage,
  uploadQuestionImage,
} from "@/lib/questions/media";
import { syncQuestionToAttemptSessions } from "@/lib/questions/sync-attempt-sessions";
import type { CorrectAnswer, QuestionLifecycle } from "@/types/question";
import type { SubjectContentLanguageMode } from "@/types/subject";

export type UpdateQuestionState = {
  success: boolean;
  message: string;
  newQuestionId?: string;
};

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

export async function updateQuestion(
  questionId: string,
  _previous: UpdateQuestionState,
  formData: FormData,
  mockTestIdArg?: string,
): Promise<UpdateQuestionState> {
  try {
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

  const db = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminClient()
    : supabase;

  const formMockTestId = String(formData.get("mock_test_id") ?? "").trim() || undefined;
  const mockTestId = mockTestIdArg || formMockTestId;

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
    db
      .from("subjects")
      .select("id, paper_id, content_language_mode")
      .eq("id", subjectId)
      .maybeSingle(),
    db.from("questions").select("id, subject_id, image_url, correct_answer, question_text, question_text_te").eq("id", questionId).maybeSingle(),
    mockTestId ? db.from("mock_tests").select("id, paper_id, subject_id, test_scope, status, replaces_mock_test_id, superseded_by_mock_test_id").eq("id", mockTestId).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  if (!subject || !existingQuestion) {
    return { success: false, message: "The selected Subject could not be found." };
  }
  let hasAttempts = false;
  if (mockTestId) {
    if (!mockTest) return { success: false, message: "The selected Mock Test could not be found." };
    if (
      subjectId !== existingQuestion.subject_id &&
      mockTest.paper_id &&
      subject.paper_id !== mockTest.paper_id
    ) {
      return { success: false, message: "This Question must stay inside this Mock Test's Paper." };
    }
    const [{ count: attemptCount }, { data: assignment }] = await Promise.all([
      db.from("test_attempts").select("id", { count: "exact", head: true }).eq("mock_test_id", mockTestId),
      db.from("mock_test_questions").select("id").eq("mock_test_id", mockTestId).eq("question_id", questionId).maybeSingle(),
    ]);
    if (!assignment) {
      const { data: fallbackList } = await db
        .from("mock_test_questions")
        .select("id")
        .eq("mock_test_id", mockTestId)
        .eq("question_id", questionId)
        .limit(1);
      if (!fallbackList || fallbackList.length === 0) {
        return { success: false, message: "This Question is not assigned to the selected Mock Test." };
      }
    }
    hasAttempts = (attemptCount ?? 0) > 0 || mockTest.status !== "draft";
  }

  const languageMode =
    subject.content_language_mode as SubjectContentLanguageMode;
  const english = languageValues(formData, "");
  const telugu = languageValues(formData, "_te");

  const englishComplete = languageIsComplete(english);
  const teluguComplete = languageIsComplete(telugu);

  if (languageMode === "english" && !englishComplete) {
    return { success: false, message: "Complete the English question and all four options." };
  }
  if (languageMode === "telugu" && !teluguComplete) {
    return { success: false, message: "Complete the Telugu question and all four options." };
  }
  if (languageMode === "bilingual" && !englishComplete && !teluguComplete) {
    return { success: false, message: "Complete the question and all four options in English or Telugu." };
  }

  const canonical = (languageMode === "telugu" || (!englishComplete && teluguComplete)) ? telugu : english;
  if (new Set(canonical.options.map((item) => item.toLocaleLowerCase())).size !== 4) {
    return { success: false, message: "All four answer options must be different." };
  }

  const normNewEn = normalizeText(english.question);
  const normNewTe = normalizeText(telugu.question);
  const normOldEn = normalizeText(existingQuestion.question_text);
  const normOldTe = normalizeText(existingQuestion.question_text_te);
  const questionTextUnchanged =
    (!normNewEn || normNewEn === normOldEn) &&
    (!normNewTe || normNewTe === normOldTe);

  // Paper series duplicate check for question update (only when question text was actually modified)
  if (!questionTextUnchanged) {
    try {
      const { data: subjectData } = await db
        .from("subjects")
        .select("id, name, paper_id")
        .eq("id", subjectId)
        .single();

      if (subjectData?.paper_id) {
        const { data: siblingSubjects } = await db
          .from("subjects")
          .select("id, name")
          .eq("paper_id", subjectData.paper_id);
        const siblingSubjectIds = (siblingSubjects ?? []).map((s) => s.id);

        const { data: existingQuestions } = await db
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
                title,
                replaces_mock_test_id,
                superseded_by_mock_test_id
              )
            )
          `)
          .in("subject_id", siblingSubjectIds)
          .neq("id", questionId)
          .eq("is_active", true);

        const match = (existingQuestions ?? []).find((q) => {
          const normDbEn = normalizeText(q.question_text);
          const normDbTe = normalizeText(q.question_text_te);
          if (normNewEn && normDbEn && normNewEn.length >= 10 && normNewEn === normDbEn) return true;
          if (normNewTe && normDbTe && normNewTe.length >= 10 && normNewTe === normDbTe) return true;
          return false;
        });

        if (match) {
          type MockTestRef = { id: string; title: string; replaces_mock_test_id?: string | null; superseded_by_mock_test_id?: string | null };
          const assignedTests: MockTestRef[] = [];
          for (const mtq of match.mock_test_questions ?? []) {
            const rawMtq = mtq as unknown as { mock_tests: MockTestRef | null };
            if (rawMtq.mock_tests?.title) {
              assignedTests.push(rawMtq.mock_tests);
            }
          }

          if (mockTestId) {
            const testMeta = mockTest as { replaces_mock_test_id?: string | null; superseded_by_mock_test_id?: string | null } | null;
            const relatedTestIds = new Set([
              mockTestId,
              testMeta?.replaces_mock_test_id,
              testMeta?.superseded_by_mock_test_id,
            ].filter(Boolean));

            const otherTest = assignedTests.find((t) => !relatedTestIds.has(t.id));
            if (otherTest) {
              return {
                success: false,
                message: `This question text already exists in "${otherTest.title}" in this paper series.`,
              };
            }
            const inThisTest = assignedTests.some((t) => t.id === mockTestId);
            if (inThisTest) {
              return {
                success: false,
                message: "Another question in this Mock Test already has this exact text.",
              };
            }
          } else {
            const matchSubjectName = siblingSubjects?.find((s) => s.id === match.subject_id)?.name ?? "Subject";
            return {
              success: false,
              message: `This question text already exists under ${matchSubjectName}.`,
            };
          }
        }
      }
    } catch (dupCheckError) {
      console.warn("Question duplicate check failed to complete:", dupCheckError);
    }
  }

  const imageFile = formData.get("question_image");
  const removeImage = formData.get("remove_image") === "on";
  const normalizedImage = normalizeQuestionImageUrl(formData.get("image_url"));
  if (!removeImage && normalizedImage.error && (!(imageFile instanceof File) || imageFile.size === 0)) {
    return { success: false, message: normalizedImage.error };
  }
  const uploadedImage = imageFile instanceof File && imageFile.size > 0
    ? await uploadQuestionImage(db, user.id, imageFile)
    : { url: removeImage ? null : normalizedImage.url, path: null, error: null };
  if (uploadedImage.error) return { success: false, message: uploadedImage.error };

  const nextQuestion = {
      subject_id: subjectId,
      question_text: canonical.question,
      option_a: canonical.options[0],
      option_b: canonical.options[1],
      option_c: canonical.options[2],
      option_d: canonical.options[3],
      question_text_te:
        languageMode === "english"
          ? null
          : (telugu.question || null),
      option_a_te:
        languageMode === "english"
          ? null
          : (telugu.options[0] || null),
      option_b_te:
        languageMode === "english"
          ? null
          : (telugu.options[1] || null),
      option_c_te:
        languageMode === "english"
          ? null
          : (telugu.options[2] || null),
      option_d_te:
        languageMode === "english"
          ? null
          : (telugu.options[3] || null),
      correct_answer: correctAnswer,
      explanation: english.explanation || canonical.explanation,
      explanation_te:
        languageMode === "english"
          ? null
          : (telugu.explanation || null),
      image_url: uploadedImage.url,
      source_reference:
        String(formData.get("source_reference") ?? "").trim() || null,
      is_active: formData.get("is_active") === "on",
      content_lifecycle: lifecycle,
      review_on: lifecycle === "review" ? reviewOn : null,
      expires_on: lifecycle === "expires" ? expiresOn : null,
    };

  let copiedForThisMock = false;
  let copiedQuestionId: string | undefined;
  let updateError: { message: string } | null = null;
  if (mockTestId && !hasAttempts) {
    const { count: otherAssignmentCount } = await db.from("mock_test_questions").select("id", { count: "exact", head: true }).eq("question_id", questionId).neq("mock_test_id", mockTestId);
    if ((otherAssignmentCount ?? 0) > 0) {
      const { data: copiedQuestion, error: copyError } = await db.from("questions").insert({ ...nextQuestion, question_type: "mcq", import_key: null }).select("id").single();
      if (copyError || !copiedQuestion) {
        await removeQuestionImage(db, uploadedImage.path);
        return { success: false, message: copyError?.message ?? "The separate Question copy could not be created." };
      }
      const { error: assignmentError } = await db.from("mock_test_questions").update({ question_id: copiedQuestion.id }).eq("mock_test_id", mockTestId).eq("question_id", questionId);
      if (assignmentError) {
        await db.from("questions").delete().eq("id", copiedQuestion.id);
        await removeQuestionImage(db, uploadedImage.path);
        return { success: false, message: assignmentError.message };
      }
      copiedForThisMock = true;
      copiedQuestionId = copiedQuestion.id;
    }
  }
  if (!copiedForThisMock) {
    const { error } = await db.from("questions").update(nextQuestion).eq("id", questionId);
    updateError = error;
  }

  if (updateError) {
    await removeQuestionImage(db, uploadedImage.path);
    return { success: false, message: updateError.message };
  }
  if (!copiedForThisMock && existingQuestion.image_url && existingQuestion.image_url !== uploadedImage.url) {
    await removeQuestionImage(db, questionMediaPath(existingQuestion.image_url));
  }

  // Synchronize clarifying updates (diagram image, typos, explanations, answer key) to student attempt sessions:
  const syncResult = await syncQuestionToAttemptSessions(
    questionId,
    {
      question_text: nextQuestion.question_text,
      option_a: nextQuestion.option_a,
      option_b: nextQuestion.option_b,
      option_c: nextQuestion.option_c,
      option_d: nextQuestion.option_d,
      question_text_te: nextQuestion.question_text_te,
      option_a_te: nextQuestion.option_a_te,
      option_b_te: nextQuestion.option_b_te,
      option_c_te: nextQuestion.option_c_te,
      option_d_te: nextQuestion.option_d_te,
      explanation: nextQuestion.explanation,
      explanation_te: nextQuestion.explanation_te,
      image_url: nextQuestion.image_url,
      correct_answer: nextQuestion.correct_answer,
    },
    existingQuestion.correct_answer,
  );

  try {
    revalidatePath("/admin/questions");
    revalidatePath("/admin/mock-tests");
    if (mockTestId) {
      revalidatePath(`/admin/mock-tests/${mockTestId}/questions`);
      revalidatePath(`/admin/mock-tests/${mockTestId}/preview`);
      if (copiedQuestionId) {
        revalidatePath(`/admin/mock-tests/${mockTestId}/questions/${copiedQuestionId}/edit`);
      }
    }
  } catch (revalErr) {
    console.warn("revalidatePath caught error:", revalErr);
  }

  let successMessage = "Question updated in English and Telugu.";
  if (syncResult.rescoredCount > 0) {
    successMessage = `Question updated. The answer key correction was applied and ${syncResult.rescoredCount} student attempt${syncResult.rescoredCount === 1 ? "" : "s"} were re-scored.`;
  } else if (syncResult.syncedCount > 0) {
    successMessage = "Question updated and synchronized to student attempt reviews.";
  } else if (mockTestId) {
    successMessage = copiedForThisMock
      ? "Question updated only in this Mock Test. A separate copy was kept for its other use."
      : "Question updated in this Mock Test.";
  }
  return { success: true, message: successMessage, newQuestionId: copiedQuestionId };
  } catch (err) {
    console.error("Unexpected error in updateQuestion action:", err);
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Temporary problem saving question. Please try again.",
    };
  }
}
