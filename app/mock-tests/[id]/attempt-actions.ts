"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Answer = "A" | "B" | "C" | "D";
const MAX_ANSWERS_PER_ATTEMPT = 500;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SubmitAttemptResult = {
  success: boolean;
  message: string;
  attemptId?: string;
  score?: number;
  totalMarks?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  unansweredQuestions?: number;
  displaced?: boolean;
};

function cleanAnswers(answers: Record<string, Answer>) {
  const validAnswers = new Set<Answer>(["A", "B", "C", "D"]);
  const cleanedAnswers: Record<string, Answer> = {};

  const entries = Object.entries(answers);
  if (entries.length > MAX_ANSWERS_PER_ATTEMPT) return null;

  for (const [questionId, answer] of entries) {
    if (!UUID_PATTERN.test(questionId) || !validAnswers.has(answer)) {
      return null;
    }
    cleanedAnswers[questionId] = answer;
  }

  return cleanedAnswers;
}

export async function checkAttemptDeviceStatus(
  sessionId: string,
  clientDeviceId: string,
): Promise<{ active: boolean; displaced: boolean; remaining?: number }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !UUID_PATTERN.test(sessionId)) {
      return { active: false, displaced: false };
    }

    const { data: session } = await supabase
      .from("test_attempt_sessions")
      .select("active_device_token, session_state, remaining_seconds, expires_at, submitted_at")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!session) {
      return { active: false, displaced: false };
    }

    if (session.submitted_at || session.session_state === "submitted") {
      return { active: false, displaced: false };
    }

    // Check if another device has claimed this active test session
    if (
      session.active_device_token &&
      clientDeviceId &&
      session.active_device_token !== clientDeviceId
    ) {
      return { active: false, displaced: true };
    }

    const remaining = Math.max(
      0,
      Math.ceil((new Date(session.expires_at).getTime() - Date.now()) / 1000),
    );

    return {
      active: session.session_state === "active",
      displaced: false,
      remaining,
    };
  } catch {
    return { active: true, displaced: false };
  }
}

export async function saveAttemptProgress(
  sessionId: string,
  questionId: string,
  answer: Answer | null,
  clientDeviceId?: string,
): Promise<{ success: boolean; displaced?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user ||
    !UUID_PATTERN.test(sessionId) ||
    !UUID_PATTERN.test(questionId) ||
    (answer !== null && !["A", "B", "C", "D"].includes(answer))
  ) {
    return { success: false };
  }

  // Verify device ownership
  if (clientDeviceId) {
    const { data: session } = await supabase
      .from("test_attempt_sessions")
      .select("active_device_token")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      session?.active_device_token &&
      session.active_device_token !== clientDeviceId
    ) {
      return { success: false, displaced: true };
    }
  }

  const { error } = await supabase.rpc("save_mock_test_answer_update", {
    requested_session_id: sessionId,
    requested_question_id: questionId,
    requested_answer: answer,
  });

  if (error && error.message.includes("DISPLACED")) {
    return { success: false, displaced: true };
  }

  return { success: !error };
}

export async function saveReviewState(
  sessionId: string,
  questionId: string,
  marked: boolean,
): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !UUID_PATTERN.test(sessionId) || !UUID_PATTERN.test(questionId)) {
    return { success: false };
  }

  const { error } = await supabase.rpc("save_mock_test_review_mark", {
    requested_session_id: sessionId,
    requested_question_id: questionId,
    requested_mark: marked,
  });
  return { success: !error };
}

export async function syncAttemptTimer(
  sessionId: string,
  clientDeviceId?: string,
): Promise<{ success: boolean; remaining?: number; displaced?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !UUID_PATTERN.test(sessionId)) return { success: false };

  // Fast check for device displacement before syncing timer
  if (clientDeviceId) {
    const { data: session } = await supabase
      .from("test_attempt_sessions")
      .select("active_device_token")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      session?.active_device_token &&
      session.active_device_token !== clientDeviceId
    ) {
      return { success: false, displaced: true };
    }
  }

  const { data, error } = await supabase.rpc("sync_mock_test_session_timer", {
    requested_session_id: sessionId,
  });

  if (error && error.message.includes("DISPLACED")) {
    return { success: false, displaced: true };
  }

  return error ? { success: false } : { success: true, remaining: Number(data) };
}

export async function pauseAttempt(
  sessionId: string,
  answers: Record<string, Answer>,
): Promise<{ success: boolean; message: string; remaining?: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cleanedAnswers = cleanAnswers(answers);
  if (!user || !UUID_PATTERN.test(sessionId) || !cleanedAnswers) {
    return { success: false, message: "Unable to pause this attempt." };
  }

  const { error: answersError } = await supabase.rpc("save_mock_test_session_answers", {
    requested_session_id: sessionId,
    submitted_answers: cleanedAnswers,
  });
  if (answersError) return { success: false, message: "Your latest answers could not be saved." };

  const { data: pausedSeconds, error: pauseError } = await supabase.rpc("pause_mock_test_session", {
    requested_session_id: sessionId,
  });
  return pauseError
    ? { success: false, message: "The attempt could not be paused. Refresh the page and try again." }
    : { success: true, message: "Practice paused. Resume whenever you are ready.", remaining: Number(pausedSeconds) };
}

export async function resumeAttempt(mockTestId: string, sessionId: string): Promise<{ success: boolean; message: string; expiresAt?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !UUID_PATTERN.test(mockTestId) || !UUID_PATTERN.test(sessionId)) return { success: false, message: "Unable to resume this attempt." };
  const { data, error } = await supabase.rpc("start_mock_test_session", {
    requested_mock_test_id: mockTestId,
  });
  const resumed = data?.[0] as { session_id: string; expires_at: string } | undefined;
  if (error || !resumed || resumed.session_id !== sessionId) {
    return { success: false, message: "This attempt could not be resumed. Return to the test details and try again." };
  }
  return { success: true, message: "Practice resumed.", expiresAt: resumed.expires_at };
}

export async function submitAttempt(
  sessionId: string,
  answers: Record<string, Answer>
): Promise<SubmitAttemptResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, message: "You must be logged in." };
    }

    const cleanedAnswers = cleanAnswers(answers);
    if (!UUID_PATTERN.test(sessionId) || !cleanedAnswers) {
      return { success: false, message: "One or more submitted answers are invalid." };
    }

    const { data, error } = await supabase.rpc("submit_mock_test_attempt", {
      requested_session_id: sessionId,
      submitted_answers: cleanedAnswers,
    });

    const result = data?.[0];
    if (error || !result) {
      console.error("submit_mock_test_attempt RPC error:", error, "data:", data);
      const verified = await verifySubmittedAttempt(sessionId);
      if (verified.success && verified.attempt) {
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/study-book");
        return verified.attempt;
      }
      return { success: false, message: error?.message || "Failed to submit attempt." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/study-book");

    return {
      success: true,
      message: "Attempt submitted successfully.",
      attemptId: String(result.attempt_id),
      score: Number(result.score ?? 0),
      totalMarks: Number(result.total_marks ?? 0),
      correctAnswers: Number(result.correct_answers ?? 0),
      incorrectAnswers: Number(result.incorrect_answers ?? 0),
      unansweredQuestions: Number(result.unanswered_questions ?? 0),
    };
  } catch (err) {
    console.error("submitAttempt error:", err);
    const verified = await verifySubmittedAttempt(sessionId);
    if (verified.success && verified.attempt) {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/study-book");
      return verified.attempt;
    }
    return {
      success: false,
      message: "Your answers are saved in your account. Check your result in the dashboard.",
    };
  }
}

export async function verifySubmittedAttempt(sessionId: string): Promise<{
  success: boolean;
  attempt?: SubmitAttemptResult;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !UUID_PATTERN.test(sessionId)) {
      return { success: false };
    }

    for (let i = 0; i < 4; i++) {
      const { data: attempt } = await supabase
        .from("test_attempts")
        .select("id, score, total_marks, correct_answers, incorrect_answers, unanswered_questions")
        .eq("session_id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (attempt) {
        return {
          success: true,
          attempt: {
            success: true,
            message: "Attempt submitted successfully.",
            attemptId: String(attempt.id),
            score: Number(attempt.score ?? 0),
            totalMarks: Number(attempt.total_marks ?? 0),
            correctAnswers: Number(attempt.correct_answers ?? 0),
            incorrectAnswers: Number(attempt.incorrect_answers ?? 0),
            unansweredQuestions: Number(attempt.unanswered_questions ?? 0),
          },
        };
      }
      await new Promise((r) => setTimeout(r, (i + 1) * 350));
    }

    return { success: false };
  } catch {
    return { success: false };
  }
}
