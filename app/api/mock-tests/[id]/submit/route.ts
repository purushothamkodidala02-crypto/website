import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Answer = "A" | "B" | "C" | "D";
const MAX_ANSWERS_PER_ATTEMPT = 500;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cleanAnswers(answers: unknown): Record<string, Answer> | null {
  if (!answers || typeof answers !== "object") return {};
  const validAnswers = new Set<Answer>(["A", "B", "C", "D"]);
  const cleanedAnswers: Record<string, Answer> = {};

  const entries = Object.entries(answers as Record<string, unknown>);
  if (entries.length > MAX_ANSWERS_PER_ATTEMPT) return null;

  for (const [questionId, answer] of entries) {
    if (typeof answer !== "string") continue;
    if (!UUID_PATTERN.test(questionId) || !validAnswers.has(answer as Answer)) {
      continue;
    }
    cleanedAnswers[questionId] = answer as Answer;
  }

  return cleanedAnswers;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: testId } = await params;
    const body = await request.json().catch(() => null);

    const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
    if (!UUID_PATTERN.test(sessionId)) {
      return NextResponse.json(
        { success: false, message: "Invalid session ID." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "You must be signed in to submit a mock test.", loginRequired: true },
        { status: 401 },
      );
    }

    const cleanedAnswers = cleanAnswers(body?.answers);
    if (!cleanedAnswers) {
      return NextResponse.json(
        { success: false, message: "One or more submitted answers are invalid." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase.rpc("submit_mock_test_attempt", {
      requested_session_id: sessionId,
      submitted_answers: cleanedAnswers,
    });

    const result = data?.[0];
    if (error || !result) {
      // Check if attempt already exists (e.g. idempotent retry or race condition)
      const { data: existing } = await supabase
        .from("test_attempts")
        .select("id, score, total_marks, correct_answers, incorrect_answers, unanswered_questions")
        .eq("session_id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/study-book");
        return NextResponse.json({
          success: true,
          message: "Attempt submitted successfully.",
          attemptId: String(existing.id),
          score: Number(existing.score ?? 0),
          totalMarks: Number(existing.total_marks ?? 0),
          correctAnswers: Number(existing.correct_answers ?? 0),
          incorrectAnswers: Number(existing.incorrect_answers ?? 0),
          unansweredQuestions: Number(existing.unanswered_questions ?? 0),
        });
      }

      return NextResponse.json(
        { success: false, message: error?.message || "Failed to submit attempt." },
        { status: 500 },
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/study-book");

    return NextResponse.json({
      success: true,
      message: "Attempt submitted successfully.",
      attemptId: String(result.attempt_id),
      score: Number(result.score ?? 0),
      totalMarks: Number(result.total_marks ?? 0),
      correctAnswers: Number(result.correct_answers ?? 0),
      incorrectAnswers: Number(result.incorrect_answers ?? 0),
      unansweredQuestions: Number(result.unanswered_questions ?? 0),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal error submitting attempt." },
      { status: 500 },
    );
  }
}
