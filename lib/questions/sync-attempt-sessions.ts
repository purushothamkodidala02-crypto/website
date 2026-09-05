import "server-only";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type QuestionSessionSyncData = {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  question_text_te: string | null;
  option_a_te: string | null;
  option_b_te: string | null;
  option_c_te: string | null;
  option_d_te: string | null;
  explanation: string | null;
  explanation_te: string | null;
  image_url: string | null;
  correct_answer?: string;
};

/**
 * Synchronizes question clarifications (diagrams, typo corrections, enriched explanations)
 * into test_attempt_session_questions so that past student attempt reviews immediately reflect
 * the fixes. If the correct answer key was also changed, recalculates scores for affected attempts.
 */
export async function syncQuestionToAttemptSessions(
  questionId: string,
  updatedData: QuestionSessionSyncData,
  previousCorrectAnswer?: string | null,
): Promise<{ syncedCount: number; rescoredCount: number }> {
  const admin = createAdminClient();

  const sessionQuestionUpdates: Record<string, unknown> = {
    question_text: updatedData.question_text,
    option_a: updatedData.option_a,
    option_b: updatedData.option_b,
    option_c: updatedData.option_c,
    option_d: updatedData.option_d,
    question_text_te: updatedData.question_text_te,
    option_a_te: updatedData.option_a_te,
    option_b_te: updatedData.option_b_te,
    option_c_te: updatedData.option_c_te,
    option_d_te: updatedData.option_d_te,
    explanation: updatedData.explanation,
    explanation_te: updatedData.explanation_te,
    image_url: updatedData.image_url,
  };

  const keyChanged =
    Boolean(updatedData.correct_answer) &&
    Boolean(previousCorrectAnswer) &&
    updatedData.correct_answer !== previousCorrectAnswer;

  if (updatedData.correct_answer) {
    sessionQuestionUpdates.correct_answer = updatedData.correct_answer;
  }

  // 1. Update session snapshots so attempt reviews display the new image / text / explanation
  const { data: updatedSessions, error: updateError } = await admin
    .from("test_attempt_session_questions")
    .update(sessionQuestionUpdates)
    .eq("question_id", questionId)
    .select("session_id");

  if (updateError) {
    console.error("Failed to sync question to attempt sessions:", updateError);
    return { syncedCount: 0, rescoredCount: 0 };
  }

  const syncedCount = updatedSessions?.length ?? 0;
  let rescoredCount = 0;

  // 2. If the answer key was corrected, re-evaluate response correctness & recalculate attempt scores
  if (keyChanged && updatedData.correct_answer) {
    const newKey = updatedData.correct_answer;

    const { data: affectedResponses } = await admin
      .from("attempt_responses")
      .select("id, attempt_id, selected_answer")
      .eq("question_id", questionId);

    const attemptIds = [
      ...new Set((affectedResponses ?? []).map((r) => r.attempt_id)),
    ];

    if (attemptIds.length > 0) {
      const { data: attempts } = await admin
        .from("test_attempts")
        .select("id, session_id")
        .in("id", attemptIds);

      const sessionIds = (attempts ?? [])
        .map((a) => a.session_id)
        .filter(Boolean) as string[];

      const { data: sessionQuestions } = await admin
        .from("test_attempt_session_questions")
        .select("session_id, marks, negative_marks")
        .eq("question_id", questionId)
        .in("session_id", sessionIds);

      const sessionMarksMap = new Map(
        (sessionQuestions ?? []).map((sq) => [sq.session_id, sq]),
      );
      const attemptSessionMap = new Map(
        (attempts ?? []).map((a) => [a.id, a.session_id]),
      );

      for (const resp of affectedResponses ?? []) {
        const sessionId = attemptSessionMap.get(resp.attempt_id);
        const sq = sessionId ? sessionMarksMap.get(sessionId) : null;
        const marks = Number(sq?.marks ?? 1);
        const negativeMarks = Number(sq?.negative_marks ?? 0);

        const isCorrect = resp.selected_answer === newKey;
        const marksAwarded = resp.selected_answer
          ? isCorrect
            ? marks
            : -negativeMarks
          : 0;

        await admin
          .from("attempt_responses")
          .update({
            is_correct: isCorrect,
            marks_awarded: marksAwarded,
          })
          .eq("id", resp.id);
      }

      for (const attemptId of attemptIds) {
        const { data: allResponses } = await admin
          .from("attempt_responses")
          .select("is_correct, marks_awarded, selected_answer")
          .eq("attempt_id", attemptId);

        const correctCount = (allResponses ?? []).filter(
          (r) => r.is_correct,
        ).length;
        const incorrectCount = (allResponses ?? []).filter(
          (r) => !r.is_correct && r.selected_answer,
        ).length;
        const totalScore = (allResponses ?? []).reduce(
          (sum, r) => sum + Number(r.marks_awarded ?? 0),
          0,
        );

        await admin
          .from("test_attempts")
          .update({
            score: totalScore,
            correct_answers: correctCount,
            incorrect_answers: incorrectCount,
          })
          .eq("id", attemptId);
      }

      rescoredCount = attemptIds.length;
    }
  }

  // Revalidate student attempt review and admin results
  try {
    revalidatePath("/admin/results");
    revalidatePath("/dashboard/attempts/[id]", "page");
  } catch {
    // Context may not support revalidatePath during certain execution contexts
  }

  return { syncedCount, rescoredCount };
}
