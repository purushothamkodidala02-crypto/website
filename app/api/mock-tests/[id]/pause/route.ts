import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Answer = "A" | "B" | "C" | "D";
const MAX_ANSWERS_PER_ATTEMPT = 500;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cleanAnswers(answers: unknown): Record<string, Answer> {
  if (!answers || typeof answers !== "object") return {};
  const validAnswers = new Set<Answer>(["A", "B", "C", "D"]);
  const cleanedAnswers: Record<string, Answer> = {};

  const entries = Object.entries(answers as Record<string, unknown>);
  if (entries.length > MAX_ANSWERS_PER_ATTEMPT) return {};

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
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: mockTestId } = await context.params;

    if (!UUID_PATTERN.test(mockTestId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid test ID." },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";

    if (!UUID_PATTERN.test(sessionId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid session ID." },
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
        { ok: false, error: "You must be signed in to pause a mock test." },
        { status: 401 },
      );
    }

    const cleanedAnswers = cleanAnswers(body?.answers);
    if (Object.keys(cleanedAnswers).length > 0) {
      try {
        await supabase.rpc("save_mock_test_session_answers", {
          requested_session_id: sessionId,
          submitted_answers: cleanedAnswers,
        });
      } catch {
        // Continue to pause even if snapshot save encounters a warning
      }
    }

    const { data: pausedSeconds, error: pauseError } = await supabase.rpc("pause_mock_test_session", {
      requested_session_id: sessionId,
    });

    if (pauseError) {
      const { data: session } = await supabase
        .from("test_attempt_sessions")
        .select("remaining_seconds, session_state")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (session?.session_state === "paused" && typeof session.remaining_seconds === "number") {
        return NextResponse.json({
          ok: true,
          remaining: session.remaining_seconds,
        });
      }

      return NextResponse.json(
        { ok: false, error: pauseError.message || "Could not pause session." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      remaining: Number(pausedSeconds),
    });
  } catch (err) {
    console.error("Unexpected error in /api/mock-tests/[id]/pause:", err);
    return NextResponse.json(
      { ok: false, error: "Temporary server issue while pausing the mock test." },
      { status: 500 },
    );
  }
}
