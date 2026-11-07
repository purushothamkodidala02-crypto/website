export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMockTestFastContextById, getMockTestPublicContextById } from "@/lib/public-route-data";
import { mockTestUrl, paperUrl, subjectUrl } from "@/lib/public-urls";
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
  return <main className="min-h-screen bg-slate-50 px-5 py-16"><section className="mx-auto max-w-2xl rounded-3xl border bg-white p-8 text-center shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">Test unavailable</p><h1 className="mt-3 text-3xl font-black text-slate-950">{title}</h1><p className="mt-4 leading-7 text-slate-600">{message}</p><Link href={testPath} className="mt-7 inline-flex rounded-xl bg-[#0a2922] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#11382f]">Back to test details</Link></section></main>;
}

export default async function TakeMockTestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const requestedSessionId = typeof query.session === "string" ? query.session : "";
  const isValidSession = /^[0-9a-f-]{36}$/i.test(requestedSessionId);

  const supabase = await createClient();

  // Eagerly initiate all primary data queries in parallel
  const userPromise = supabase.auth.getUser().then(({ data }) => data.user ?? null);
  const fastContextPromise = getMockTestFastContextById(id, supabase).then(async (fast) => {
    if (fast) return fast;
    return getMockTestPublicContextById(id);
  });
  const sessionPromise = isValidSession
    ? supabase.from("test_attempt_sessions").select("id, user_id, expires_at, session_state, submitted_at").eq("id", requestedSessionId).eq("mock_test_id", id).maybeSingle()
    : Promise.resolve({ data: null });
  const attemptPromise = isValidSession
    ? supabase.from("test_attempts").select("id, score, total_marks, correct_answers, incorrect_answers, unanswered_questions").eq("session_id", requestedSessionId).maybeSingle()
    : Promise.resolve({ data: null });
  const payloadPromise = isValidSession
    ? supabase.rpc("get_mock_test_session_payload", { requested_session_id: requestedSessionId })
    : Promise.resolve({ data: null, error: null });
  const bookmarksPromise: Promise<string[]> = userPromise.then(async (user) => {
    if (!user) return [];
    const { data } = await supabase
      .from("student_question_bookmarks")
      .select("question_id")
      .eq("user_id", user.id);
    return (data ?? []).map((item) => item.question_id as string);
  });

  const [publicContext, user, sessionResult, attemptResult, payloadResult, bookmarkedQuestionIds] = await Promise.all([
    fastContextPromise,
    userPromise,
    sessionPromise,
    attemptPromise,
    payloadPromise,
    bookmarksPromise,
  ]);

  if (!publicContext) notFound();
  const testPath = mockTestUrl(publicContext.state.slug, publicContext.exam.slug, publicContext.paper.slug, publicContext.mockTest.slug);
  const testTitle = publicContext.mockTest.title ?? "Mock Test";
  const folderUrl = publicContext.subject
    ? subjectUrl(publicContext.state.slug, publicContext.exam.slug, publicContext.paper.slug, publicContext.subject.slug)
    : paperUrl(publicContext.state.slug, publicContext.exam.slug, publicContext.paper.slug);
  const folderName = publicContext.subject?.name ?? publicContext.paper.name;

  if (!user) redirect(`/login?next=${encodeURIComponent(testPath)}`);

  const mockTest = publicContext.mockTest;
  if (!mockTest || ("status" in mockTest && mockTest.status !== "published")) notFound();

  if (mockTest.access_type === "paid") {
    const { data: access } = await supabase.rpc("can_access_mock_test", { requested_mock_test_id: mockTest.id });
    if (!access) {
      return <TestNotReady title={testTitle} testPath={testPath} message="This mock test needs an active exam-series purchase. Return to the test details page to unlock it there." />;
    }
  }

  if (!isValidSession) redirect(testPath);

  const session = sessionResult.data;
  if (!session || session.user_id !== user.id) redirect("/dashboard");

  // 1. Check if an attempt record already exists in DB for this session
  let existingAttempt = attemptResult.data;
  if (!existingAttempt && (session.submitted_at || session.session_state === "submitted")) {
    for (let i = 0; i < 3; i++) {
      await new Promise((r) => setTimeout(r, (i + 1) * 300));
      const retry = await supabase
        .from("test_attempts")
        .select("id, score, total_marks, correct_answers, incorrect_answers, unanswered_questions")
        .eq("session_id", session.id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (retry.data) {
        existingAttempt = retry.data;
        break;
      }
    }
  }

  if (existingAttempt) {
    return (
      <SubmissionResult
        publicTestPath={testPath}
        title={testTitle}
        mockTestId={id}
        folderUrl={folderUrl}
        folderName={folderName}
        result={{
          success: true,
          message: "Attempt submitted successfully.",
          attemptId: String(existingAttempt.id),
          score: Number(existingAttempt.score ?? 0),
          totalMarks: Number(existingAttempt.total_marks ?? 0),
          correctAnswers: Number(existingAttempt.correct_answers ?? 0),
          incorrectAnswers: Number(existingAttempt.incorrect_answers ?? 0),
          unansweredQuestions: Number(existingAttempt.unanswered_questions ?? 0),
        }}
      />
    );
  }

  // 2. If session is marked submitted, show result screen safely without throwing redirect
  if (session.submitted_at || session.session_state === "submitted") {
    return (
      <SubmissionResult
        publicTestPath={testPath}
        title={testTitle}
        mockTestId={id}
        folderUrl={folderUrl}
        folderName={folderName}
        result={{
          success: false,
          message: "Your answers are saved in your account. Check your result in the dashboard.",
        }}
      />
    );
  }

  // 3. If the session has reached or passed deadline, finalize submission immediately and show results
  // eslint-disable-next-line react-hooks/purity -- Server component evaluating expiration timestamp dynamically at request time
  const isExpired = new Date(session.expires_at).getTime() <= Date.now();
  if (isExpired) {
    const { data: submitData } = await supabase.rpc("submit_mock_test_attempt", {
      requested_session_id: session.id,
      submitted_answers: {},
    });
    const expiredResult = submitData?.[0];
    if (expiredResult) {
      return (
        <SubmissionResult
          publicTestPath={testPath}
          title={testTitle}
          mockTestId={id}
          folderUrl={folderUrl}
          folderName={folderName}
          result={{
            success: true,
            message: "Attempt submitted successfully.",
            attemptId: String(expiredResult.attempt_id),
            score: Number(expiredResult.score ?? 0),
            totalMarks: Number(expiredResult.total_marks ?? 0),
            correctAnswers: Number(expiredResult.correct_answers ?? 0),
            incorrectAnswers: Number(expiredResult.incorrect_answers ?? 0),
            unansweredQuestions: Number(expiredResult.unanswered_questions ?? 0),
          }}
        />
      );
    }
    return (
      <SubmissionResult
        publicTestPath={testPath}
        title={testTitle}
        mockTestId={id}
        folderUrl={folderUrl}
        folderName={folderName}
        result={{
          success: false,
          message: "The test time has ended and your answers are saved. Check your result in the dashboard.",
        }}
      />
    );
  }

  if (session.session_state !== "active") {
    return (
      <SubmissionResult
        publicTestPath={testPath}
        title={testTitle}
        mockTestId={id}
        folderUrl={folderUrl}
        folderName={folderName}
        result={{
          success: false,
          message: "This test attempt is no longer active. Check your result in the dashboard.",
        }}
      />
    );
  }

  const { data, error } = payloadResult;
  const questions = (data ?? []) as TestQuestion[];
  if (error || questions.length === 0) return <TestNotReady title={testTitle} testPath={testPath} message="This mock test does not have active questions available yet. Please try again later." />;

  return (
    <StudentTestRunner
      mockTestId={id}
      publicTestPath={testPath}
      title={testTitle}
      sessionId={session.id}
      expiresAt={session.expires_at}
      questions={questions}
      bookmarkedQuestionIds={bookmarkedQuestionIds}
      studentEmail={user.email ?? user.user_metadata?.email ?? ""}
      folderUrl={folderUrl}
      folderName={folderName}
      folderType={publicContext.subject ? "subject" : "paper"}
      examName={publicContext.exam.name}
      paperName={publicContext.paper.name}
      subjectName={publicContext.subject?.name}
      stateCode={publicContext.state.code}
    />
  );
}
