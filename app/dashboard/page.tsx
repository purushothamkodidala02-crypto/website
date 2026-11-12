export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicHeader } from "@/components/site/PublicHeader";
import { ExamHistorySection } from "@/components/dashboard/ExamHistorySection";
import { ViewTestLink } from "@/components/dashboard/ViewTestLink";
import { getDashboardCatalogData } from "@/lib/catalog-data";
import { parseMockTestTitle } from "@/lib/exam-catalog";
import { buildPaperDisplayMap, type OrderedPaper } from "@/lib/papers";
import { mockTestUrl } from "@/lib/public-urls";
import { isPaidSalesEnabled } from "@/lib/paid-sales";
import { createClient } from "@/lib/supabase/server";
import { resolveStudentDisplayInfo } from "@/lib/student-name";

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
  const isFirstPage = page === 1;
  const supabase = await createClient();

  // Eagerly initiate auth and all independent queries simultaneously
  const userPromise = supabase.auth.getUser().then(({ data }) => data.user ?? null);
  const paidSalesPromise = isPaidSalesEnabled();
  const catalogPromise = getDashboardCatalogData();

  const attemptsPromise = userPromise.then(async (user) => {
    if (!user) return [] as Attempt[];
    const { data } = await supabase
      .from("test_attempts")
      .select(
        "id, mock_test_id, detailed_review_available, submitted_at, score, total_marks, correct_answers, incorrect_answers, unanswered_questions",
      )
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false })
      .range((page - 1) * attemptsPerPage, page * attemptsPerPage - 1);
    return (data ?? []) as Attempt[];
  });

  const mistakesCountPromise = userPromise.then(async (user) => {
    if (!user) return 0;
    const { count } = await supabase
      .from("student_question_mistakes")
      .select("question_id", { count: "exact", head: true })
      .eq("user_id", user.id);
    return count ?? 0;
  });

  const bookmarksCountPromise = userPromise.then(async (user) => {
    if (!user) return 0;
    const { count } = await supabase
      .from("student_question_bookmarks")
      .select("question_id", { count: "exact", head: true })
      .eq("user_id", user.id);
    return count ?? 0;
  });

  const [
    user,
    attempts,
    attemptSummaryResult,
    subjectAnalyticsResult,
    availableTestsResult,
    mistakesCount,
    bookmarksCount,
    paidSalesEnabled,
    catalog,
  ] = await Promise.all([
    userPromise,
    attemptsPromise,
    supabase.rpc("get_student_attempt_history_summary"),
    isFirstPage
      ? supabase.rpc("get_student_subject_analytics")
      : Promise.resolve({ data: [] as SubjectAnalytics[] }),
    isFirstPage
      ? supabase
          .from("mock_tests")
          .select("id, paper_id, title, duration_minutes, slug, access_type")
          .eq("status", "published")
          .order("display_order", { ascending: true })
          .limit(4)
      : Promise.resolve({ data: [] as AvailableMockTest[] }),
    mistakesCountPromise,
    bookmarksCountPromise,
    paidSalesPromise,
    catalogPromise,
  ]);

  if (!user) redirect("/login?next=/dashboard");
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

  const { displayName: studentName, avatarLetter } = resolveStudentDisplayInfo({
    fullName: user.user_metadata?.full_name,
    name: user.user_metadata?.name,
    email: user.email,
  });
  // counts are resolved directly from promises above
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
      mobileLabel: "Completed",
      value: String(totalAttempts),
      detail: totalAttempts === 1 ? "1 submitted test" : "All submitted tests",
      icon: "attempts" as const,
    },
    {
      label: "Average score",
      mobileLabel: "Accuracy",
      value: totalAttempts > 0 ? `${Number(attemptSummary.average_score).toFixed(1)}%` : "—",
      detail: totalAttempts > 0 ? "Overall average" : "No scores yet",
      icon: "average" as const,
    },
    {
      label: "Latest score",
      mobileLabel: "Latest",
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

  const latestAttempts = attempts.slice(0, 5);

  return (
    <main className="student-page min-h-screen bg-[#f6faf8] w-full max-w-full overflow-x-hidden">
      <PublicHeader />
      <div className="mx-auto max-w-6xl w-full px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-7">
        
        {/* Responsive Executive Header Card */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-7 shadow-xs">
          <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 space-y-1.5 sm:space-y-2">
              {/* Candidate Pill Row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <span className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl bg-teal-600 text-xs sm:text-sm font-black text-white shadow-2xs">
                  {avatarLetter}
                </span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 break-words leading-snug">
                    Welcome, <span className="font-extrabold text-slate-950">{studentName}</span>
                  </p>
                  {user.email && (
                    <p className="text-[11px] font-medium text-slate-500 break-all sm:break-normal">
                      {user.email}
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-teal-200/80 bg-teal-50 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-teal-800 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                  Active Prep
                </span>
                {page > 1 && (
                  <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-amber-800 shrink-0">
                    Page {page} of {totalPages}
                  </span>
                )}
              </div>

              {/* Main Headline */}
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-950">
                  {page > 1 ? "Exam History" : "My Progress"}
                </h1>
                <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600">
                  {page > 1
                    ? `Showing ${((page - 1) * attemptsPerPage) + 1} to ${Math.min(page * attemptsPerPage, totalAttempts)} of ${totalAttempts} completed exams.`
                    : "Real-time exam performance, mistake analytics, and focused mock tests for competitive exams."}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons (Optimized for Mobile Touch, Tablet, and Desktop) */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2.5 w-full md:w-auto shrink-0">
              <Link
                href="/mock-tests"
                prefetch={true}
                className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-2 rounded-xl border border-teal-600 bg-teal-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-teal-800 min-h-[40px] sm:min-h-[42px]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <span>Find a Mock Test</span>
              </Link>
              <Link
                href="/dashboard/study-book"
                prefetch={true}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition hover:border-red-300 hover:bg-red-50/50 hover:text-red-900 min-h-[40px] sm:min-h-[42px]"
              >
                <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                <span>Mistake Book</span>
                {mistakesCount > 0 && (
                  <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.2 text-[10px] font-black text-red-800">
                    {mistakesCount}
                  </span>
                )}
              </Link>
              <Link
                href="/dashboard/study-book?view=bookmarks"
                prefetch={true}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-900 min-h-[40px] sm:min-h-[42px]"
              >
                <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                </svg>
                <span>Bookmarks</span>
                {bookmarksCount > 0 && (
                  <span className="ml-1 rounded-full bg-teal-100 px-1.5 py-0.2 text-[10px] font-black text-teal-800">
                    {bookmarksCount}
                  </span>
                )}
              </Link>
              {isPaidEnabled && (
                <Link
                  href="/dashboard/passes"
                  prefetch={true}
                  className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-900 min-h-[40px] sm:min-h-[42px]"
                >
                  <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                  </svg>
                  <span>My Passes</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* High-Level Metrics */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
          {metrics.map((metric) => (
            <DashboardMetric key={metric.label} {...metric} />
          ))}
        </section>

        {page === 1 && (
          <>
            {/* Quick Revision Hub */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Link
                href="/dashboard/study-book"
                prefetch={true}
                className="group rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition hover:border-red-200 hover:shadow-sm"
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
                <h2 className="mt-2.5 text-base sm:text-lg font-black text-slate-900 group-hover:text-red-700 transition">Mistake Book</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Revisit questions answered incorrectly. Study step-by-step explanations and clear weak topics.
                </p>
                <span className="mt-3.5 inline-flex items-center gap-1 text-xs font-bold text-red-700">
                  Review mistakes &rarr;
                </span>
              </Link>
              <Link
                href="/dashboard/study-book?view=bookmarks"
                prefetch={true}
                className="group rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition hover:border-teal-200 hover:shadow-sm"
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
                <h2 className="mt-2.5 text-base sm:text-lg font-black text-slate-900 group-hover:text-teal-700 transition">Bookmarks</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  High-yield and challenging questions kept together for targeted pre-exam revision.
                </p>
                <span className="mt-3.5 inline-flex items-center gap-1 text-xs font-bold text-teal-700">
                  Open bookmarks &rarr;
                </span>
              </Link>
            </section>

            {/* Available Practice Tests */}
            <section className="space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2.5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
                    Mock Tests Library
                  </p>
                  <h2 className="mt-0.5 text-lg sm:text-xl lg:text-2xl font-black text-slate-950">
                    Choose your next practice test
                  </h2>
                </div>
                <Link
                  href="/mock-tests"
                  prefetch={true}
                  className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-900 transition"
                >
                  Browse all tests &rarr;
                </Link>
              </div>
              {availableTests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 sm:p-8 text-center text-sm text-slate-600">
                  No mock tests are available right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {availableTests.slice(0, 4).map((test) => {
                    const parsed = parseMockTestTitle(testTitles.get(test.id) ?? test.title);
                    const paperLabel = paperDisplayById.get(test.paper_id)?.label ?? "Paper";

                    return (
                      <article
                        key={test.id}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs transition hover:border-teal-200 hover:shadow-sm"
                      >
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-800 border border-teal-200/70">
                                {parsed.testLabel ?? "Practice test"}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200/80">
                                {paperLabel}
                              </span>
                            </div>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 ${test.access_type === "free" ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60" : "bg-amber-50 text-amber-900 border border-amber-200/60"}`}>
                              {test.access_type === "free" ? "Free" : "Paid series"}
                            </span>
                          </div>
                          <h3 className="mt-3.5 text-base sm:text-lg font-black leading-snug text-slate-950 break-words">
                            {parsed.primaryTitle}
                          </h3>
                          {parsed.breadcrumb.length > 0 && (
                            <p className="mt-1.5 text-xs font-semibold text-slate-500 leading-relaxed break-words">
                              {parsed.breadcrumb.join(" · ")}
                            </p>
                          )}
                        </div>
                        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 sm:pt-4">
                          <span className="text-xs font-semibold text-slate-500">
                            {test.duration_minutes} minutes
                          </span>
                          <ViewTestLink href={publicTestPath(test)} />
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* Analytics & History Sections */}
        {totalAttempts === 0 ? (
          <section className="rounded-2xl border border-dashed border-teal-200 bg-white p-6 sm:p-10 text-center shadow-xs">
            <div className="mx-auto grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-full bg-teal-50 text-teal-700">
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h2 className="mt-3.5 text-lg sm:text-xl font-black text-slate-950">
              Your test performance will appear here
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-xs sm:text-sm leading-relaxed text-slate-600">
              Submit your first mock test to unlock score trends, subject accuracy diagnostics, and detailed question reviews.
            </p>
            <Link
              href="/mock-tests"
              prefetch={true}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 min-h-[40px]"
            >
              Browse mock tests &rarr;
            </Link>
          </section>
        ) : (
          <>
            {page === 1 && (
              /* Performance Analytics Grid (Side-by-side on Tablet & Desktop) */
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <AnalyticsCard
                  eyebrow="Performance"
                  title="Score trend"
                  detail="Your five latest test attempts."
                >
                  <div className="max-h-80 space-y-3 sm:space-y-4 overflow-y-auto pr-1 sm:pr-2">
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
                        <div key={attempt.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:p-3.5">
                          <div className="mb-2 flex items-start justify-between gap-3 text-xs sm:text-sm">
                            <div className="min-w-0 flex-1">
                              <span className="block font-bold text-slate-900 leading-snug break-words">
                                {parsed.primaryTitle}
                                {parsed.testLabel && <span className="ml-1.5 font-semibold text-teal-700">({parsed.testLabel})</span>}
                              </span>
                              {parsed.breadcrumb.length > 0 && (
                                <span className="mt-0.5 block text-[10px] sm:text-[11px] font-semibold text-slate-400 leading-relaxed break-words">
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
                  detail="Accuracy rates based on questions answered."
                >
                  {subjectAnalytics.length === 0 ? (
                    <p className="py-8 text-center text-xs sm:text-sm text-slate-500">
                      Answer more questions to unlock subject-level accuracy breakdowns.
                    </p>
                  ) : (
                    <div className="max-h-80 space-y-3 sm:space-y-4 overflow-y-auto pr-1 sm:pr-2">
                      {subjectAnalytics.map((subject) => {
                        const accuracy = Math.max(
                          0,
                          Math.min(100, Number(subject.accuracy)),
                        );
                        return (
                          <div key={subject.subject_name} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:p-3.5">
                            <div className="mb-2 flex items-start justify-between gap-3 text-xs sm:text-sm">
                              <span className="font-bold text-slate-800 leading-snug break-words">
                                {subject.subject_name}
                              </span>
                              <span className="shrink-0 font-black text-slate-950">
                                {accuracy.toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${accuracy}%` }}
                              />
                            </div>
                            <p className="mt-1 text-[11px] sm:text-xs text-slate-500">
                              {subject.correct_answers} correct out of {subject.answered_questions} answered
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </AnalyticsCard>
              </section>
            )}

            {/* Exam History Section */}
            <ExamHistorySection
              initialAttempts={attempts}
              initialPage={page}
              totalAttempts={totalAttempts}
              attemptsPerPage={attemptsPerPage}
              initialTestTitles={Object.fromEntries(testTitles)}
            />
          </>
        )}
      </div>
    </main>
  );
}

function DashboardMetric({
  label,
  mobileLabel,
  value,
  detail,
  icon,
}: {
  label: string;
  mobileLabel: string;
  value: string;
  detail: string;
  icon: "attempts" | "average" | "latest";
}) {
  return (
    <article
      className={`group rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm ${
        icon === "latest" ? "col-span-2 sm:col-span-1" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-1.5 sm:gap-3">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
          <span className="sm:hidden">{mobileLabel}</span>
          <span className="hidden sm:inline">{label}</span>
        </p>
        <span className="grid h-6 w-6 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-md sm:rounded-xl bg-teal-50 text-teal-700">
          {icon === "attempts" && (
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          )}
          {icon === "average" && (
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          )}
          {icon === "latest" && (
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.003 0V4.875A1.875 1.875 0 0 0 12.625 3h-1.25a1.875 1.875 0 0 0-1.875 1.875v9.75M8.625 7.5h6.75" />
            </svg>
          )}
        </span>
      </div>
      <p className="mt-1.5 sm:mt-4 text-base sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 leading-tight">
        {value}
      </p>
      <p className="mt-1 sm:mt-1.5 text-[11px] sm:text-xs font-semibold text-slate-500 leading-snug line-clamp-2 break-words">
        {detail}
      </p>
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
    <article className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm">
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
            Submitted{" "}
            {new Intl.DateTimeFormat("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Kolkata",
            }).format(new Date(attempt.submitted_at))}
          </p>
          <div>
            {parsed.breadcrumb.length > 0 && (
              <p className="flex flex-wrap items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-teal-700">
                {parsed.breadcrumb.map((crumb, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1">
                    {idx > 0 && <span className="text-slate-400 font-normal" aria-hidden="true">›</span>}
                    <span>{crumb}</span>
                  </span>
                ))}
              </p>
            )}
            <h3 className="mt-0.5 flex flex-wrap items-center gap-1.5 sm:gap-2 text-sm sm:text-base lg:text-lg font-black text-slate-950 break-words leading-snug">
              <span>{parsed.primaryTitle}</span>
              {parsed.testLabel && (
                <span className="rounded-md border border-teal-200 bg-teal-50 px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-semibold text-teal-800">
                  {parsed.testLabel}
                </span>
              )}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold pt-0.5">
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

        {/* Action / Score Bar: on mobile, cleanly divided at bottom; on tablet/desktop, cleanly aligned on right */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0 sm:justify-end gap-3 sm:gap-5 shrink-0">
          <div className="text-left sm:text-right">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Score
            </p>
            <p className="mt-0.5 text-base sm:text-xl font-black text-slate-950 leading-tight">
              {attempt.score} <span className="text-xs sm:text-sm font-normal text-slate-400">/ {attempt.total_marks}</span>
            </p>
          </div>
          {attempt.detailed_review_available ? (
            <Link
              href={`/dashboard/attempts/${attempt.id}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-teal-600 bg-teal-700 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-teal-800 min-h-[38px] sm:min-h-[42px]"
            >
              <span>Review</span>
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ) : (
            <span
              title="Detailed answers are retained for 365 days or the latest 100 attempts."
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500"
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
    <nav aria-label="Exam history pages" className="mt-6 sm:mt-8 flex items-center justify-center gap-2 sm:gap-3">
      {page > 1 ? (
        <Link
          href={page === 2 ? "/dashboard" : `/dashboard?page=${page - 1}`}
          prefetch={true}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition hover:border-teal-300 hover:text-teal-900 min-h-[38px]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          <span className="hidden xs:inline sm:inline">Previous</span>
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 cursor-not-allowed min-h-[38px]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          <span className="hidden xs:inline sm:inline">Previous</span>
        </span>
      )}
      <span className="rounded-lg bg-slate-100 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 whitespace-nowrap">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={`/dashboard?page=${page + 1}`}
          prefetch={true}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition hover:border-teal-300 hover:text-teal-900 min-h-[38px]"
        >
          <span className="hidden xs:inline sm:inline">Next</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 cursor-not-allowed min-h-[38px]">
          <span className="hidden xs:inline sm:inline">Next</span>
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
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
        {eyebrow}
      </p>
      <h2 className="mt-0.5 text-lg sm:text-xl font-black text-slate-950">{title}</h2>
      <p className="mt-0.5 text-xs sm:text-sm text-slate-600">{detail}</p>
      <div className="mt-4 sm:mt-6">{children}</div>
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
  return <span className={`rounded-md px-2 py-0.5 sm:px-2.5 sm:py-1 ${styles[tone]}`}>{label}</span>;
}
