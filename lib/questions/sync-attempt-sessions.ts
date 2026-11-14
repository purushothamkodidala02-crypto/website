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
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { syncedCount: 0, rescoredCount: 0 };
  }

  try {
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
      console.warn("Could not sync question to attempt sessions:", updateError.message);
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
          .select("id, session_id, mock_test_id")
          .in("id", attemptIds);

        const sessionIds = (attempts ?? [])
          .map((a) => a.session_id)
          .filter(Boolean) as string[];

        const mockTestIds = [
          ...new Set((attempts ?? []).map((a) => a.mock_test_id).filter(Boolean)),
        ];

        // Fetch fallback marking weightage from mock_test_questions per mock test
        // so AEE (e.g. 2 marks for Paper 2, 1 mark for Paper 1) are accurately scored
        let mockMarksMap = new Map<string, { marks: number; negativeMarks: number }>();
        if (mockTestIds.length > 0) {
          const { data: mtqs } = await admin
            .from("mock_test_questions")
            .select("mock_test_id, marks, negative_marks")
            .eq("question_id", questionId)
            .in("mock_test_id", mockTestIds);

          mockMarksMap = new Map(
            (mtqs ?? []).map((m) => [
              m.mock_test_id,
              {
                marks: Number.isFinite(Number(m.marks)) ? Number(m.marks) : 1,
                negativeMarks: Number.isFinite(Number(m.negative_marks)) ? Number(m.negative_marks) : 0,
              },
            ]),
          );
        }

        let sessionQuestions: Array<{ session_id: string; marks: number | string; negative_marks: number | string }> = [];
        if (sessionIds.length > 0) {
          const { data } = await admin
            .from("test_attempt_session_questions")
            .select("session_id, marks, negative_marks")
            .eq("question_id", questionId)
            .in("session_id", sessionIds);
          sessionQuestions = data ?? [];
        }

        const sessionMarksMap = new Map(
          sessionQuestions.map((sq) => [sq.session_id, sq]),
        );
        const attemptMap = new Map(
          (attempts ?? []).map((a) => [a.id, a]),
        );

        for (const resp of affectedResponses ?? []) {
          const attempt = attemptMap.get(resp.attempt_id);
          const fallback = attempt?.mock_test_id
            ? mockMarksMap.get(attempt.mock_test_id)
            : undefined;
          const defaultMarks = fallback?.marks ?? 1;
          const defaultNegativeMarks = fallback?.negativeMarks ?? 0;

          const sq = attempt?.session_id ? sessionMarksMap.get(attempt.session_id) : null;
          const parsedMarks = Number(sq?.marks);
          const parsedNegativeMarks = Number(sq?.negative_marks);
          const marks = Number.isFinite(parsedMarks) ? parsedMarks : defaultMarks;
          const negativeMarks = Number.isFinite(parsedNegativeMarks) ? parsedNegativeMarks : defaultNegativeMarks;

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
  } catch (err) {
    console.warn("Failed to synchronize question to attempt sessions:", err);
    return { syncedCount: 0, rescoredCount: 0 };
  }
}
