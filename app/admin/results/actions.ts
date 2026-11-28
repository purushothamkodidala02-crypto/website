"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseMockTestTitle } from "@/lib/exam-catalog";

export type AttemptQuestionBreakdown = {
  questionOrder: number;
  questionId: string;
  questionText: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  marksAwarded: number;
};

export type CandidateRecentAttempt = {
  id: string;
  mockTestId: string;
  mockTestTitle: string;
  score: number;
  totalMarks: number;
  submittedAt: string;
};

export type AttemptInspectionDetail = {
  attemptId: string;
  detailedReviewAvailable: boolean;
  questions: AttemptQuestionBreakdown[];
  recentAttempts: CandidateRecentAttempt[];
};

type AdminAttemptRow = {
  id: string;
  user_id: string;
  mock_test_id: string;
  session_id: string | null;
  detailed_review_available: boolean | null;
};

type RecentAttemptRow = {
  id: string;
  mock_test_id: string;
  score: number;
  total_marks: number;
  submitted_at: string;
};

type AttemptResponseRow = {
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  marks_awarded: number;
};

type SessionQuestionRow = {
  question_id: string;
  question_order: number;
  question_text: string;
  correct_answer: string;
};

type MockQuestionRow = {
  question_order: number;
  question_id: string;
  questions:
    | { question_text?: string; correct_answer?: string }
    | Array<{ question_text?: string; correct_answer?: string }>
    | null;
};

const UUID_REGEX = /^[0-9a-f-]{36}$/i;

export async function getAdminAttemptDetailAction(attemptId: string): Promise<{
  success: boolean;
  detail?: AttemptInspectionDetail;
  error?: string;
}> {
  try {
    if (!UUID_REGEX.test(attemptId)) {
      return { success: false, error: "Invalid attempt identifier." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Authentication required." };
    }

    const [{ data: profile }, { data: assurance, error: assuranceError }] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]);

    if (profile?.role !== "admin" || assuranceError || assurance?.currentLevel !== "aal2") {
      return { success: false, error: "Administrator MFA verification is required." };
    }

    const admin = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase;
    const { data: rawAttempt, error: attemptError } = await admin
      .from("test_attempts")
      .select("id, user_id, mock_test_id, session_id, detailed_review_available")
      .eq("id", attemptId)
      .maybeSingle();

    const attempt = rawAttempt as AdminAttemptRow | null;
    if (attemptError || !attempt) {
      return { success: false, error: "Submission record could not be found." };
    }

    const detailedReviewAvailable = attempt.detailed_review_available !== false;

    const [recentAttemptsRes, responsesRes, sessionQuestionsRes, mockQuestionsRes] = await Promise.all([
      admin
        .from("test_attempts")
        .select("id, mock_test_id, score, total_marks, submitted_at")
        .eq("user_id", attempt.user_id)
        .order("submitted_at", { ascending: false })
        .limit(6),
      detailedReviewAvailable
        ? admin
            .from("attempt_responses")
            .select("question_id, selected_answer, is_correct, marks_awarded")
            .eq("attempt_id", attempt.id)
        : Promise.resolve({ data: [] as AttemptResponseRow[], error: null }),
      detailedReviewAvailable && attempt.session_id
        ? admin
            .from("test_attempt_session_questions")
            .select("question_id, question_order, question_text, correct_answer")
            .eq("session_id", attempt.session_id)
            .order("question_order")
        : Promise.resolve({ data: [] as SessionQuestionRow[], error: null }),
      detailedReviewAvailable && !attempt.session_id
        ? admin
            .from("mock_test_questions")
            .select("question_order, question_id, questions(question_text, correct_answer)")
            .eq("mock_test_id", attempt.mock_test_id)
            .order("question_order")
        : Promise.resolve({ data: [] as MockQuestionRow[], error: null }),
    ]);

    const recentRows = (recentAttemptsRes.data ?? []) as RecentAttemptRow[];
    const recentTestIds = [...new Set(recentRows.map((row) => row.mock_test_id))];
    const recentTestRes =
      recentTestIds.length > 0
        ? await admin.from("mock_tests").select("id, title").in("id", recentTestIds)
        : { data: [] as Array<{ id: string; title: string }> };

    const recentTestRows = (recentTestRes.data ?? []) as Array<{ id: string; title: string }>;
    const titleMap = new Map(recentTestRows.map((t) => [t.id, t.title]));
    const recentAttempts: CandidateRecentAttempt[] = recentRows.map((row) => {
      const parsed = parseMockTestTitle(titleMap.get(row.mock_test_id) ?? "Mock Test");
      return {
        id: row.id,
        mockTestId: row.mock_test_id,
        mockTestTitle: parsed.testLabel ? `${parsed.primaryTitle} (${parsed.testLabel})` : parsed.primaryTitle,
        score: Number(row.score),
        totalMarks: Number(row.total_marks),
        submittedAt: row.submitted_at,
      };
    });

    const responseRows = (responsesRes.data ?? []) as AttemptResponseRow[];
    const responseByQuestionId = new Map(
      responseRows.map((resp) => [resp.question_id, resp]),
    );

    let questions: AttemptQuestionBreakdown[] = [];
    if (detailedReviewAvailable) {
      const sessionQuestionRows = (sessionQuestionsRes.data ?? []) as SessionQuestionRow[];
      if (sessionQuestionRows.length > 0) {
        questions = sessionQuestionRows.map((sq) => {
          const resp = responseByQuestionId.get(sq.question_id);
          return {
            questionOrder: sq.question_order,
            questionId: sq.question_id,
            questionText: sq.question_text,
            selectedAnswer: resp?.selected_answer ?? null,
            correctAnswer: sq.correct_answer,
            isCorrect: resp?.is_correct ?? false,
            marksAwarded: Number(resp?.marks_awarded ?? 0),
          };
        });
      } else {
        let fallbackRows = (mockQuestionsRes.data ?? []) as MockQuestionRow[];
        if (fallbackRows.length === 0 && attempt.session_id) {
          const { data: legacyQuestions } = await admin
            .from("mock_test_questions")
            .select("question_order, question_id, questions(question_text, correct_answer)")
            .eq("mock_test_id", attempt.mock_test_id)
            .order("question_order");
          fallbackRows = (legacyQuestions ?? []) as MockQuestionRow[];
        }

        questions = fallbackRows.map((mq) => {
          const qRel = Array.isArray(mq.questions) ? mq.questions[0] : mq.questions;
          const qObj = (qRel ?? {}) as { question_text?: string; correct_answer?: string };
          const resp = responseByQuestionId.get(mq.question_id);
          return {
            questionOrder: mq.question_order,
            questionId: mq.question_id,
            questionText: qObj.question_text ?? "Question text unavailable",
            selectedAnswer: resp?.selected_answer ?? null,
            correctAnswer: qObj.correct_answer ?? "—",
            isCorrect: resp?.is_correct ?? false,
            marksAwarded: Number(resp?.marks_awarded ?? 0),
          };
        });
      }
    }

    return {
      success: true,
      detail: {
        attemptId: attempt.id,
        detailedReviewAvailable,
        questions,
        recentAttempts,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unable to load attempt details.",
    };
  }
}
