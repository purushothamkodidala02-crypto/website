export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicHeader } from "@/components/site/PublicHeader";
import { getDashboardCatalogData } from "@/lib/catalog-data";
import { parseMockTestTitle } from "@/lib/exam-catalog";
import { buildPaperDisplayMap, type OrderedPaper } from "@/lib/papers";
import { mockTestUrl } from "@/lib/public-urls";
import { isPaidSalesEnabled } from "@/lib/paid-sales";
import { createClient } from "@/lib/supabase/server";

type Attempt = {
  id: string;
  mock_test_id: string;
  detailed_review_available: boolean;
  submitted_at: string;
  score: number;
  total_marks: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered_questions: number;
};

type AttemptHistorySummary = {
  completed_attempts: number;
  average_score: number;
  latest_score: number | null;
  latest_total_marks: number | null;
  latest_mock_test_id: string | null;
};

type AvailableMockTest = {
  id: string;
  paper_id: string;
  title: string;
  duration_minutes: number;
  slug: string;
  access_type: "free" | "paid";
};

type SubjectAnalytics = {
  subject_name: string;
  answered_questions: number;
  correct_answers: number;
  accuracy: number;
  net_marks: number;
};

const attemptsPerPage = 20;

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const query = await searchParams;
  const requestedPage = Number(query.page ?? "1");
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const [
    attemptsResult,
    latestAttemptsResult,
    attemptSummaryResult,
    subjectAnalyticsResult,
    availableTestsResult,
    mistakesCountResult,
    bookmarksCountResult,
    paidSalesEnabled,
    catalog,
  ] = await Promise.all([
    supabase
      .from("test_attempts")
      .select(
        "id, mock_test_id, detailed_review_available, submitted_at, score, total_marks, correct_answers, incorrect_answers, unanswered_questions",
      )
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false })
      .range((page - 1) * attemptsPerPage, page * attemptsPerPage - 1),
    supabase
      .from("test_attempts")
      .select(
        "id, mock_test_id, detailed_review_available, submitted_at, score, total_marks, correct_answers, incorrect_answers, unanswered_questions",
      )
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(5),
    supabase.rpc("get_student_attempt_history_summary"),
    supabase.rpc("get_student_subject_analytics"),
    supabase
      .from("mock_tests")
      .select("id, paper_id, title, duration_minutes, slug, access_type")
      .eq("status", "published")
      .order("display_order", { ascending: true })
      .limit(4),
    supabase
      .from("student_question_mistakes")
      .select("question_id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("student_question_bookmarks")
      .select("question_id", { count: "exact", head: true })
      .eq("user_id", user.id),
    isPaidSalesEnabled(),
    getDashboardCatalogData(),
  ]);

  const attempts = (attemptsResult.data ?? []) as Attempt[];
  const latestAttempts = (latestAttemptsResult.data ?? []) as Attempt[];
  const attemptSummary = (attemptSummaryResult.data?.[0] ?? {
    completed_attempts: attempts.length,
    average_score: 0,
    latest_score: null,
    latest_total_marks: null,
    latest_mock_test_id: null,
  }) as AttemptHistorySummary;

  const totalAttempts = Number(attemptSummary.completed_attempts ?? attempts.length);
  const totalPages = Math.max(1, Math.ceil(totalAttempts / attemptsPerPage));
  if (totalAttempts > 0 && page > totalPages) redirect(`/dashboard?page=${totalPages}`);

  const subjectAnalytics = (subjectAnalyticsResult.data ?? []) as SubjectAnalytics[];
  const availableTests = (availableTestsResult.data ?? []) as AvailableMockTest[];
  const paperDisplayById = buildPaperDisplayMap(catalog.papers as OrderedPaper[]);
  const testTitles = new Map(catalog.tests.map((test) => [test.id, test.title]));
  const catalogPaperById = new Map(catalog.papers.map((item) => [item.id, item]));
  const catalogExamById = new Map(catalog.exams.map((item) => [item.id, item]));
  const catalogCategoryById = new Map(catalog.categories.map((item) => [item.id, item]));
  const catalogStateById = new Map(catalog.states.map((item) => [item.id, item]));

  const missingTestIds = new Set<string>();
  if (attemptSummary.latest_mock_test_id && !testTitles.has(attemptSummary.latest_mock_test_id)) {
    missingTestIds.add(attemptSummary.latest_mock_test_id);
  }
  for (const attempt of attempts) {
    if (attempt.mock_test_id && !testTitles.has(attempt.mock_test_id)) {
      missingTestIds.add(attempt.mock_test_id);
    }
  }
  for (const attempt of latestAttempts) {
    if (attempt.mock_test_id && !testTitles.has(attempt.mock_test_id)) {
      missingTestIds.add(attempt.mock_test_id);
    }
  }

  if (missingTestIds.size > 0) {
    const { data: missingTests } = await supabase
      .from("mock_tests")
      .select("id, title")
      .in("id", Array.from(missingTestIds));

    for (const test of missingTests ?? []) {
      if (test.title) {
        testTitles.set(test.id, test.title);
      }
    }
  }

  const metadataName =
    typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()
      ? user.user_metadata.name.trim()
      : "";
  const studentName = metadataName || (user.email ? user.email.split("@")[0] : "Student");
  const firstName = studentName.split(" ")[0];
  const avatarLetter = (firstName[0] || "S").toUpperCase();
  const mistakesCount = mistakesCountResult.count ?? 0;
  const bookmarksCount = bookmarksCountResult.count ?? 0;
  const isPaidEnabled = paidSalesEnabled === true;

  const publicTestPath = (test: AvailableMockTest) => {
    const paper = catalogPaperById.get(test.paper_id);
    const exam = paper ? catalogExamById.get(paper.exam_group_id) : undefined;
    const category = exam ? catalogCategoryById.get(exam.exam_id) : undefined;
    const state = category ? catalogStateById.get(category.state_id) : undefined;
    return paper && exam && state ? mockTestUrl(state.slug, exam.slug, paper.slug, test.slug) : "/mock-tests";
  };

  const metrics = [
    {
      label: "Completed attempts",
      value: String(totalAttempts),
      detail: totalAttempts === 1 ? "1 submitted test" : "All submitted tests",
      icon: "attempts" as const,
    },
    {
      label: "Average score",
      value: totalAttempts > 0 ? `${Number(attemptSummary.average_score).toFixed(1)}%` : "—",
      detail: totalAttempts > 0 ? "Across all attempts" : "No scores recorded yet",
      icon: "average" as const,
    },
    {
      label: "Latest score",
      value:
        attemptSummary.latest_score !== null && attemptSummary.latest_total_marks !== null
          ? `${attemptSummary.latest_score} / ${attemptSummary.latest_total_marks}`
          : "—",
      detail: attemptSummary.latest_mock_test_id
        ? (testTitles.get(attemptSummary.latest_mock_test_id) ?? "Mock test")
        : "No attempts yet",
      icon: "latest" as const,
    },
  ] as const;

  return (
    <main className="student-page min-h-screen bg-[#f6faf8] w-full max-w-full overflow-x-hidden">
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10 w-full space-y-6 sm:space-y-8">
        
        {/* Professional Student Dashboard Header Box */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-900/60 bg-[#071f1a] p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              {/* Candidate Info Bar */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-800/80 border border-teal-600/40 text-sm font-black text-teal-200">
                  {avatarLetter}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  Welcome, {studentName}
                </span>
                <span className="text-slate-500" aria-hidden="true">•</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-900/40 px-2.5 py-0.5 text-[11px] font-bold text-teal-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                  Candidate Portal
                </span>
                {page > 1 && (
                  <span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                    Exam History Page {page} of {totalPages}
                  </span>
                )}
              </div>

              {/* Main Headline */}
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Student Dashboard
                </h1>
                <p className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-300">
                  Real-time exam performance, mistake analytics, and focused mock tests for Telangana and Andhra Pradesh competitive exams.
                </p>
              </div>

              {/* Page 2 notification */}
              {page > 1 && (
                <div className="pt-1">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-300 hover:text-white transition"
                  >
                    <span>&larr; Return to Overview (Page 1)</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/mock-tests"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-teal-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <span>Find a Mock Test</span>
              </Link>
              <Link
                href="/dashboard/study-book"
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/40 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-red-200 transition hover:bg-red-900/50 hover:border-red-400"
              >
                <span>Mistake Book</span>
                {mistakesCount > 0 && (
                  <span className="rounded-full bg-red-500/30 px-1.5 py-0.2 text-[10px] font-black text-red-200">
                    {mistakesCount}
                  </span>
                )}
              </Link>
              <Link
                href="/dashboard/study-book?view=bookmarks"
                className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/40 bg-teal-950/40 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-teal-200 transition hover:bg-teal-900/50 hover:border-teal-400"
              >
                <span>Bookmarks</span>
                {bookmarksCount > 0 && (
                  <span className="rounded-full bg-teal-500/30 px-1.5 py-0.2 text-[10px] font-black text-teal-200">
                    {bookmarksCount}
                  </span>
                )}
              </Link>
              {isPaidEnabled && (
                <Link
                  href="/dashboard/passes"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-amber-200 transition hover:bg-amber-900/50 hover:border-amber-400"
                >
                  <span>My Passes</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* High-Level Metrics */}
        <section className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <DashboardMetric key={metric.label} {...metric} />
          ))}
        </section>

        {/* Quick Revision Hub */}
        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/study-book"
            className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-red-200 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-red-600">Personal Revision</span>
              {mistakesCount > 0 ? (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">
                  {mistakesCount} questions
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                  Clear
                </span>
              )}
            </div>
            <h2 className="mt-3 text-lg font-black text-slate-900 group-hover:text-red-700 transition">Mistake Book</h2>
            <p className="mt-1 text-sm text-slate-600">
              Revisit questions you answered incorrectly. Study full solutions and explanations.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-red-700">
              Review mistakes &rarr;
            </span>
          </Link>
          <Link
            href="/dashboard/study-book?view=bookmarks"
            className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-teal-200 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-700">Saved Questions</span>
              {bookmarksCount > 0 ? (
                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800">
                  {bookmarksCount} questions
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                  0 saved
                </span>
              )}
            </div>
            <h2 className="mt-3 text-lg font-black text-slate-900 group-hover:text-teal-700 transition">Bookmarks</h2>
            <p className="mt-1 text-sm text-slate-600">
              High-yield and challenging questions kept together for targeted pre-exam revision.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-teal-700">
              Open bookmarks &rarr;
            </span>
          </Link>
        </section>

        {/* Available Practice Tests */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
                Mock Tests Library
              </p>
              <h2 className="mt-1 text-xl sm:text-2xl font-black text-slate-950">
                Choose your next practice test
              </h2>
            </div>
            <Link
              href="/mock-tests"
              className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-900 transition"
            >
              Browse all tests &rarr;
            </Link>
          </div>
          {availableTests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
              No mock tests are available right now.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {availableTests.slice(0, 4).map((test) => (
                <article
                  key={test.id}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition hover:border-teal-200 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800 border border-teal-100">
                        Practice test
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${test.access_type === "free" ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60" : "bg-amber-50 text-amber-900 border border-amber-200/60"}`}>
                        {test.access_type === "free" ? "Free" : "Paid series"}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base sm:text-lg font-black leading-snug text-slate-950">
                      {testTitles.get(test.id) ?? test.title}
                    </h3>
                    <p className="mt-1.5 text-xs font-bold uppercase tracking-wide text-teal-700">
                      {paperDisplayById.get(test.paper_id)?.label ?? "Paper"}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-semibold text-slate-500">
                      {test.duration_minutes} minutes
                    </span>
                    <Link
                      href={publicTestPath(test)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#ea580c] px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-2xs transition hover:bg-[#d94f08]"
                    >
                      <span>View test</span>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Analytics & History Sections */}
        {totalAttempts === 0 ? (
          <section className="rounded-2xl border border-dashed border-teal-200 bg-white p-10 text-center shadow-xs">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-teal-50 text-teal-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-950">
              Your test performance will appear here
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
              Submit your first mock test to unlock score trends, subject accuracy diagnostics, and detailed question reviews.
            </p>
            <Link
              href="/mock-tests"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
            >
              Browse mock tests &rarr;
            </Link>
          </section>
        ) : (
          <>
            {/* Performance Analytics Grid */}
            <section className="grid gap-6 lg:grid-cols-2">
              <AnalyticsCard
                eyebrow="Performance"
                title="Score trend"
                detail="Your five latest test attempts."
              >
                <div className="max-h-80 space-y-4 overflow-y-auto pr-2">
                  {latestAttempts.map((attempt) => {
                    const percentage =
                      attempt.total_marks === 0
                        ? 0
                        : Math.max(
                            0,
                            Math.min(
                              100,
                              (attempt.score / attempt.total_marks) * 100,
                            ),
                          );
                    const rawTitle = testTitles.get(attempt.mock_test_id) ?? "Mock test";
                    const parsed = parseMockTestTitle(rawTitle);
                    return (
                      <div key={attempt.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                        <div className="mb-2 flex items-start justify-between gap-4 text-sm">
                          <div className="min-w-0">
                            <span className="block truncate font-bold text-slate-900" title={rawTitle}>
                              {parsed.primaryTitle}
                              {parsed.testLabel && <span className="ml-1.5 font-semibold text-teal-700">({parsed.testLabel})</span>}
                            </span>
                            {parsed.breadcrumb.length > 0 && (
                              <span className="block truncate text-[11px] font-semibold text-slate-400">
                                {parsed.breadcrumb.join(" · ")}
                              </span>
                            )}
                          </div>
                          <span className="shrink-0 font-black text-slate-950">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
                          <div
                            className="h-full rounded-full bg-teal-600 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AnalyticsCard>

              <AnalyticsCard
                eyebrow="Study guidance"
                title="Subject accuracy"
                detail="Accuracy rates based on questions you answered."
              >
                {subjectAnalytics.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    Answer more questions to unlock subject-level accuracy breakdowns.
                  </p>
                ) : (
                  <div className="max-h-80 space-y-4 overflow-y-auto pr-2">
                    {subjectAnalytics.map((subject) => {
                      const accuracy = Math.max(
                        0,
                        Math.min(100, Number(subject.accuracy)),
                      );
                      return (
                        <div key={subject.subject_name} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                          <div className="mb-2 flex justify-between gap-4 text-sm">
                            <span className="font-bold text-slate-800">
                              {subject.subject_name}
                            </span>
                            <span className="font-black text-slate-950">
                              {accuracy.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${accuracy}%` }}
                            />
                          </div>
                          <p className="mt-1.5 text-xs text-slate-500">
                            {subject.correct_answers} correct out of{" "}
                            {subject.answered_questions} answered
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </AnalyticsCard>
            </section>

            {/* Exam History Section */}
            <section className="space-y-4 pt-2">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
                    History
                  </p>
                  <h2 className="mt-1 text-xl sm:text-2xl font-black text-slate-950">
                    Exam History
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Showing {((page - 1) * attemptsPerPage) + 1} to {Math.min(page * attemptsPerPage, totalAttempts)} of {totalAttempts} completed exams.
                  </p>
                </div>
                {page === 1 && totalPages > 1 && (
                  <Link
                    href="/dashboard?page=2"
                    className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-900 transition"
                  >
                    View next page &rarr;
                  </Link>
                )}
              </div>

              <div className="grid gap-4">
                {attempts.map((attempt) => (
                  <AttemptCard
                    key={attempt.id}
                    attempt={attempt}
                    testTitles={testTitles}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <PaginationNav page={page} totalPages={totalPages} />
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function DashboardMetric({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: "attempts" | "average" | "latest";
}) {
  return (
    <article className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
          {icon === "attempts" && (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          )}
          {icon === "average" && (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          )}
          {icon === "latest" && (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.003 0V4.875A1.875 1.875 0 0 0 12.625 3h-1.25a1.875 1.875 0 0 0-1.875 1.875v9.75M8.625 7.5h6.75" />
            </svg>
          )}
        </span>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 truncate text-xs font-semibold text-slate-500">{detail}</p>
    </article>
  );
}

function AttemptCard({
  attempt,
  testTitles,
}: {
  attempt: Attempt;
  testTitles: Map<string, string>;
}) {
  const rawTitle = testTitles.get(attempt.mock_test_id) ?? "Mock test";
  const parsed = parseMockTestTitle(rawTitle);

  return (
    <article className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Submitted{" "}
            {new Intl.DateTimeFormat("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Kolkata",
            }).format(new Date(attempt.submitted_at))}
          </p>
          <div className="mt-2">
            {parsed.breadcrumb.length > 0 && (
              <p className="flex flex-wrap items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-teal-700">
                {parsed.breadcrumb.map((crumb, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1">
                    {idx > 0 && <span className="text-slate-400 font-normal" aria-hidden="true">›</span>}
                    <span>{crumb}</span>
                  </span>
                ))}
              </p>
            )}
            <h3 className="mt-1 flex flex-wrap items-center gap-2 text-base sm:text-lg font-black text-slate-950">
              <span>{parsed.primaryTitle}</span>
              {parsed.testLabel && (
                <span className="rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800">
                  {parsed.testLabel}
                </span>
              )}
            </h3>
          </div>
          <div className="mt-3.5 flex flex-wrap gap-2 text-xs font-bold">
            <ResultBadge
              label={`${attempt.correct_answers} correct`}
              tone="emerald"
            />
            <ResultBadge
              label={`${attempt.incorrect_answers} incorrect`}
              tone="red"
            />
            <ResultBadge
              label={`${attempt.unanswered_questions} unanswered`}
              tone="slate"
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Score
            </p>
            <p className="mt-0.5 text-xl font-black text-slate-950">
              {attempt.score} <span className="text-sm font-normal text-slate-400">/ {attempt.total_marks}</span>
            </p>
          </div>
          {attempt.detailed_review_available ? (
            <Link
              href={`/dashboard/attempts/${attempt.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-600 bg-teal-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-teal-800"
            >
              <span>Review</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ) : (
            <span
              title="Detailed answers are retained for 365 days or the latest 100 attempts."
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-500"
            >
              Summary only
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function PaginationNav({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  return (
    <nav aria-label="Exam history pages" className="mt-8 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link
          href={page === 2 ? "/dashboard" : `/dashboard?page=${page - 1}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition hover:border-teal-300 hover:text-teal-900"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          <span>Previous</span>
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 cursor-not-allowed">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          <span>Previous</span>
        </span>
      )}
      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={`/dashboard?page=${page + 1}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition hover:border-teal-300 hover:text-teal-900"
        >
          <span>Next</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 cursor-not-allowed">
          <span>Next</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </span>
      )}
    </nav>
  );
}

function AnalyticsCard({
  eyebrow,
  title,
  detail,
  children,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{detail}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ResultBadge({
  label,
  tone,
}: {
  label: string;
  tone: "emerald" | "red" | "slate";
}) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-800 border border-emerald-200/70",
    red: "bg-red-50 text-red-800 border border-red-200/70",
    slate: "bg-slate-100 text-slate-700 border border-slate-200/70",
  };
  return <span className={`rounded-md px-2.5 py-1 ${styles[tone]}`}>{label}</span>;
}
