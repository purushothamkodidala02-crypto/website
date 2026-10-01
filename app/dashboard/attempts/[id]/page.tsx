import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PublicHeader } from "@/components/site/PublicHeader";
import { parseMockTestTitle } from "@/lib/exam-catalog";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AttemptReviewNavigator, type ReviewRow } from "./AttemptReviewNavigator";

type AttemptSummary = {
  user_id: string;
  mock_test_id: string;
  submitted_at: string;
  score: number;
  total_marks: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered_questions: number;
  detailed_review_available: boolean;
  session_id: string | null;
};

export default async function AttemptReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/dashboard/attempts/${id}`)}`);

  const admin = createAdminClient();

  const [attemptResult, reviewResult] = await Promise.all([
    admin
      .from("test_attempts")
      .select("user_id, mock_test_id, session_id, submitted_at, score, total_marks, correct_answers, incorrect_answers, unanswered_questions, detailed_review_available")
      .eq("id", id)
      .maybeSingle(),
    supabase.rpc("get_attempt_review", { requested_attempt_id: id }),
  ]);
  const attempt = attemptResult.data as AttemptSummary | null;
  if (!attempt || attempt.user_id !== user.id) notFound();

  const { data: reviewData } = reviewResult;
  const rawRows = (reviewData ?? []) as Omit<ReviewRow, "question_id">[];

  let resolvedTitle = rawRows[0]?.mock_test_title;
  if (!resolvedTitle) {
    const { data: testData } = await admin
      .from("mock_tests")
      .select("title")
      .eq("id", attempt.mock_test_id)
      .maybeSingle();
    resolvedTitle = testData?.title ?? "Mock test";
  }

  if (!attempt.detailed_review_available) {
    return <ExpiredAttemptReview attempt={attempt} title={resolvedTitle} />;
  }

  // Parallelize question IDs resolution and student bookmarks
  const [questionOrderResult, bookmarksResult] = await Promise.all([
    attempt.session_id
      ? admin.from("test_attempt_session_questions").select("question_id").eq("session_id", attempt.session_id).order("question_order")
      : admin.from("mock_test_questions").select("question_id").eq("mock_test_id", attempt.mock_test_id).order("question_order"),
    supabase.from("student_question_bookmarks").select("question_id").eq("user_id", user.id),
  ]);

  const questionIds = (questionOrderResult.data ?? []).map((item) => item.question_id);
  let rows: ReviewRow[] = [];

  if (rawRows.length > 0) {
    rows = rawRows.map((row, index) => ({
      ...row,
      question_id: questionIds[index] ?? `q-${row.question_order}`,
    }));
  } else if (attempt.session_id) {
    // Fallback if RPC returns empty: fetch directly from session questions & responses
    const [sessionQuestionsResult, responsesResult] = await Promise.all([
      admin
        .from("test_attempt_session_questions")
        .select("*")
        .eq("session_id", attempt.session_id)
        .order("question_order"),
      admin
        .from("attempt_responses")
        .select("question_id, selected_answer, is_correct, marks_awarded")
        .eq("attempt_id", id),
    ]);

    const responsesByQuestion = new Map(
      (responsesResult.data ?? []).map((r) => [r.question_id, r])
    );

    rows = (sessionQuestionsResult.data ?? []).map((sq) => {
      const resp = responsesByQuestion.get(sq.question_id);
      return {
        question_id: sq.question_id,
        mock_test_title: resolvedTitle,
        score: attempt.score,
        total_marks: attempt.total_marks,
        correct_answers: attempt.correct_answers,
        incorrect_answers: attempt.incorrect_answers,
        unanswered_questions: attempt.unanswered_questions,
        question_order: sq.question_order,
        question_text: sq.question_text,
        option_a: sq.option_a,
        option_b: sq.option_b,
        option_c: sq.option_c,
        option_d: sq.option_d,
        content_language_mode: sq.content_language_mode ?? "english",
        question_text_te: sq.question_text_te,
        option_a_te: sq.option_a_te,
        option_b_te: sq.option_b_te,
        option_c_te: sq.option_c_te,
        option_d_te: sq.option_d_te,
        selected_answer: resp?.selected_answer ?? null,
        correct_answer: sq.correct_answer,
        is_correct: resp?.is_correct ?? false,
        marks_awarded: Number(resp?.marks_awarded ?? 0),
        explanation: sq.explanation,
        explanation_te: sq.explanation_te,
        image_url: sq.image_url,
      };
    });
  }

  if (rows.length === 0) notFound();

  const userBookmarkSet = new Set((bookmarksResult.data ?? []).map((b) => b.question_id));
  const bookmarkedQuestionIds = rows
    .map((item) => item.question_id)
    .filter((qid) => userBookmarkSet.has(qid));

  const summary = rows[0];
  const percentage =
    summary.total_marks === 0
      ? 0
      : (summary.score / summary.total_marks) * 100;

  const parsedTitle = parseMockTestTitle(resolvedTitle ?? summary.mock_test_title);

  return (
    <main className="student-page min-h-screen bg-[#f5f8f8]">
      <PublicHeader />
      <div className="w-full max-w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800"
        >
          <span aria-hidden="true">←</span> Back to dashboard
        </Link>

        <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl shadow-slate-950/15 sm:p-9">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-teal-300/15 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-teal-200">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
                Attempt review
              </p>

              {parsedTitle.breadcrumb.length > 0 && (
                <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-300/90 sm:text-sm">
                  {parsedTitle.breadcrumb.map((crumb, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5">
                      {idx > 0 && <span className="text-slate-500 font-normal" aria-hidden="true">›</span>}
                      <span>{crumb}</span>
                    </span>
                  ))}
                </p>
              )}

              <h1 className="mt-2 max-w-4xl text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl text-white">
                {parsedTitle.title}
              </h1>

              {parsedTitle.topic && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs sm:text-sm font-semibold text-teal-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
                    {parsedTitle.topic}
                  </span>
                </div>
              )}

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Submitted {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(attempt.submitted_at))} · Review every answer and use the explanations to plan your next
                practice session.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-white/5 px-6 py-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Final score
              </p>
              <p className="mt-2 text-4xl font-black">
                {summary.score}
                <span className="text-xl text-slate-400"> / {summary.total_marks}</span>
              </p>
              <p className="mt-2 text-sm font-bold text-teal-200">
                {percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryMetric
            label="Score"
            value={`${summary.score} / ${summary.total_marks}`}
            tone="teal"
          />
          <SummaryMetric
            label="Correct"
            value={String(summary.correct_answers)}
            tone="emerald"
          />
          <SummaryMetric
            label="Incorrect"
            value={String(summary.incorrect_answers)}
            tone="red"
          />
          <SummaryMetric
            label="Unanswered"
            value={String(summary.unanswered_questions)}
            tone="slate"
          />
        </section>

        <AttemptReviewNavigator attemptId={id} rows={rows} bookmarkedQuestionIds={bookmarkedQuestionIds} />

        <section className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-teal-50 p-6 sm:p-8">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Ready for the next practice session?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Choose another mock test and apply what you learned here.
            </p>
          </div>
          <Link
            href="/mock-tests"
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
          >
            Browse mock tests
          </Link>
        </section>
      </div>
    </main>
  );
}

function ExpiredAttemptReview({ attempt, title }: { attempt: AttemptSummary; title: string }) {
  const parsedTitle = parseMockTestTitle(title);
  return (
    <main className="student-page min-h-screen bg-[#f5f8f8]">
      <PublicHeader />
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800">Back to dashboard</Link>
        <section className="mt-6 rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl shadow-slate-950/15 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-200">Attempt summary</p>
          {parsedTitle.breadcrumb.length > 0 && (
            <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-300/90 sm:text-sm">
              {parsedTitle.breadcrumb.map((crumb, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5">
                  {idx > 0 && <span className="text-slate-500 font-normal" aria-hidden="true">›</span>}
                  <span>{crumb}</span>
                </span>
              ))}
            </p>
          )}
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl text-white">{parsedTitle.title}</h1>
          {parsedTitle.topic && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs sm:text-sm font-semibold text-teal-200">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
                {parsedTitle.topic}
              </span>
            </div>
          )}
          <p className="mt-3 text-sm text-slate-300">Submitted {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(attempt.submitted_at))}</p>
        </section>
        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryMetric label="Score" value={`${attempt.score} / ${attempt.total_marks}`} tone="teal" />
          <SummaryMetric label="Correct" value={String(attempt.correct_answers)} tone="emerald" />
          <SummaryMetric label="Incorrect" value={String(attempt.incorrect_answers)} tone="red" />
          <SummaryMetric label="Unanswered" value={String(attempt.unanswered_questions)} tone="slate" />
        </section>
        <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950 sm:p-8">
          <h2 className="text-xl font-black">Detailed answer review is no longer stored</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6">Your score and exam summary remain in your account permanently. Question-by-question answers are retained for 365 days or for your latest 100 attempts, whichever keeps them longer.</p>
        </section>
      </div>
    </main>
  );
}

const summaryStyles = {
  teal: "border-teal-100 bg-teal-50 text-teal-950",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-950",
  red: "border-red-100 bg-red-50 text-red-950",
  slate: "border-slate-200 bg-white text-slate-950",
};

function SummaryMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: keyof typeof summaryStyles;
}) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${summaryStyles[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-wide opacity-60">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}
