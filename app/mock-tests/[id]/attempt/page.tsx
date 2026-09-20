import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMockTestPublicContextById } from "@/lib/public-route-data";
import { mockTestUrl } from "@/lib/public-urls";
import { StudentTestRunner } from "../StudentTestRunner";
import { SubmissionResult } from "../SubmissionResult";

type TestQuestion = {
  question_id: string;
  question_order: number;
  marks: number;
  negative_marks: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  image_url: string | null;
  selected_answer: "A" | "B" | "C" | "D" | null;
  marked_for_review: boolean;
  content_language_mode: "bilingual" | "english" | "telugu";
  question_text_te: string | null;
  option_a_te: string | null;
  option_b_te: string | null;
  option_c_te: string | null;
  option_d_te: string | null;
};

function TestNotReady({ title, message, testPath }: { title: string; message: string; testPath: string }) {
  return <main className="min-h-screen bg-slate-50 px-5 py-16"><section className="mx-auto max-w-2xl rounded-3xl border bg-white p-8 text-center shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">Test unavailable</p><h1 className="mt-3 text-3xl font-black text-slate-950">{title}</h1><p className="mt-4 leading-7 text-slate-600">{message}</p><Link href={testPath} className="mt-7 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Back to test details</Link></section></main>;
}

export default async function TakeMockTestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const publicContext = await getMockTestPublicContextById(id);
  if (!publicContext) notFound();
  const testPath = mockTestUrl(publicContext.state.slug, publicContext.exam.slug, publicContext.paper.slug, publicContext.mockTest.slug);
  const testTitle = publicContext.mockTest.title ?? "Mock Test";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(testPath)}`);

  const { data: mockTest } = await supabase.from("mock_tests").select("id, title, status, access_type").eq("id", id).eq("status", "published").maybeSingle();
  if (!mockTest) notFound();
  const { data: access } = await supabase.rpc("can_access_mock_test", { requested_mock_test_id: mockTest.id });
  const hasAccess = Boolean(access);
  if (!hasAccess) return <TestNotReady title={testTitle} testPath={testPath} message="This mock test needs an active exam-series purchase. Return to the test details page to unlock it there." />;

  const requestedSessionId = typeof query.session === "string" ? query.session : "";
  if (!/^[0-9a-f-]{36}$/i.test(requestedSessionId)) redirect(testPath);

  const { data: session } = await supabase
    .from("test_attempt_sessions")
    .select("id, expires_at, session_state, submitted_at")
    .eq("id", requestedSessionId)
    .eq("user_id", user.id)
    .eq("mock_test_id", id)
    .maybeSingle();

  if (!session) redirect(testPath);

  // 1. If session is marked submitted, fetch attempt and render SubmissionResult
  if (session.submitted_at || session.session_state === "submitted") {
    let { data: attempt } = await supabase
      .from("test_attempts")
      .select("id, score, total_marks, correct_answers, incorrect_answers, unanswered_questions")
      .eq("session_id", session.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!attempt) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const retry = await supabase
        .from("test_attempts")
        .select("id, score, total_marks, correct_answers, incorrect_answers, unanswered_questions")
        .eq("session_id", session.id)
        .eq("user_id", user.id)
        .maybeSingle();
      attempt = retry.data;
    }

    if (attempt) {
      return (
        <SubmissionResult
          publicTestPath={testPath}
          title={testTitle}
          result={{
            success: true,
            message: "Attempt submitted successfully.",
            attemptId: attempt.id,
            score: Number(attempt.score),
            totalMarks: Number(attempt.total_marks),
            correctAnswers: attempt.correct_answers,
            incorrectAnswers: attempt.incorrect_answers,
            unansweredQuestions: attempt.unanswered_questions,
          }}
        />
      );
    }

    return (
      <SubmissionResult
        publicTestPath={testPath}
        title={testTitle}
        result={{
          success: true,
          message: "Your test has been submitted successfully.",
          score: 0,
          totalMarks: 0,
        }}
      />
    );
  }

  // 2. Even if submitted_at flag is pending, verify if an attempt record already exists in DB
  const { data: existingAttempt } = await supabase
    .from("test_attempts")
    .select("id, score, total_marks, correct_answers, incorrect_answers, unanswered_questions")
    .eq("session_id", session.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingAttempt) {
    return (
      <SubmissionResult
        publicTestPath={testPath}
        title={testTitle}
        result={{
          success: true,
          message: "Attempt submitted successfully.",
          attemptId: existingAttempt.id,
          score: Number(existingAttempt.score),
          totalMarks: Number(existingAttempt.total_marks),
          correctAnswers: existingAttempt.correct_answers,
          incorrectAnswers: existingAttempt.incorrect_answers,
          unansweredQuestions: existingAttempt.unanswered_questions,
        }}
      />
    );
  }

  // 3. If the session has reached or passed deadline, finalize submission immediately
  const isExpired = new Date(session.expires_at).getTime() <= Date.now();
  if (isExpired) {
    const { data: submitData } = await supabase.rpc("submit_mock_test_attempt", {
      requested_session_id: session.id,
      submitted_answers: {},
    });
    const finalResult = submitData?.[0];
    if (finalResult) {
      return (
        <SubmissionResult
          publicTestPath={testPath}
          title={testTitle}
          result={{
            success: true,
            message: "Attempt submitted successfully.",
            attemptId: String(finalResult.attempt_id),
            score: Number(finalResult.score),
            totalMarks: Number(finalResult.total_marks),
            correctAnswers: Number(finalResult.correct_answers),
            incorrectAnswers: Number(finalResult.incorrect_answers),
            unansweredQuestions: Number(finalResult.unanswered_questions),
          }}
        />
      );
    }

    // Check once more in case of concurrent commit
    const { data: confirmedAttempt } = await supabase
      .from("test_attempts")
      .select("id, score, total_marks, correct_answers, incorrect_answers, unanswered_questions")
      .eq("session_id", session.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (confirmedAttempt) {
      return (
        <SubmissionResult
          publicTestPath={testPath}
          title={testTitle}
          result={{
            success: true,
            message: "Attempt submitted successfully.",
            attemptId: confirmedAttempt.id,
            score: Number(confirmedAttempt.score),
            totalMarks: Number(confirmedAttempt.total_marks),
            correctAnswers: confirmedAttempt.correct_answers,
            incorrectAnswers: confirmedAttempt.incorrect_answers,
            unansweredQuestions: confirmedAttempt.unanswered_questions,
          }}
        />
      );
    }

    return (
      <SubmissionResult
        publicTestPath={testPath}
        title={testTitle}
        result={{
          success: true,
          message: "The test time has ended and your attempt has been recorded.",
          score: 0,
          totalMarks: 0,
        }}
      />
    );
  }

  if (session.session_state !== "active") redirect(testPath);

  const { data, error } = await supabase.rpc("get_mock_test_session_payload", { requested_session_id: session.id });
  const questions = (data ?? []) as TestQuestion[];
  if (error || questions.length === 0) return <TestNotReady title={testTitle} testPath={testPath} message="This mock test does not have active questions available yet. Please try again later." />;
  const { data: bookmarks } = await supabase
    .from("student_question_bookmarks")
    .select("question_id")
    .eq("user_id", user.id)
    .in("question_id", questions.map((question) => question.question_id));

  return (
    <StudentTestRunner
      mockTestId={id}
      publicTestPath={testPath}
      title={testTitle}
      sessionId={session.id}
      expiresAt={session.expires_at}
      questions={questions}
      bookmarkedQuestionIds={(bookmarks ?? []).map((item) => item.question_id)}
      studentEmail={user.email ?? user.user_metadata?.email ?? ""}
    />
  );
}
