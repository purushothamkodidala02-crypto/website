"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { parseMockTestTitle } from "@/lib/exam-catalog";
import { fetchAllStudentAttempts, type AttemptHistoryItem } from "@/app/dashboard/actions";

function ResultBadge({
  label,
  tone,
}: {
  label: string;
  tone: "emerald" | "red" | "slate";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    red: "bg-red-50 text-red-800 border-red-200/80",
    slate: "bg-slate-50 text-slate-700 border-slate-200/80",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] sm:text-[11px] font-bold ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

function HistoryAttemptCard({
  attempt,
  testTitle,
  isOpening,
  onOpenAttempt,
}: {
  attempt: AttemptHistoryItem;
  testTitle?: string;
  isOpening: boolean;
  onOpenAttempt: (id: string) => void;
}) {
  const rawTitle = testTitle || "Mock test";
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
                    {idx > 0 && (
                      <span className="text-slate-400 font-normal" aria-hidden="true">
                        ›
                      </span>
                    )}
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
            <ResultBadge label={`${attempt.correct_answers} correct`} tone="emerald" />
            <ResultBadge label={`${attempt.incorrect_answers} incorrect`} tone="red" />
            <ResultBadge label={`${attempt.unanswered_questions} unanswered`} tone="slate" />
          </div>
        </div>

        {/* Action / Score Bar */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0 sm:justify-end gap-3 sm:gap-5 shrink-0">
          <div className="text-left sm:text-right">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Score
            </p>
            <p className="mt-0.5 text-base sm:text-xl font-black text-slate-950 leading-tight">
              {attempt.score}{" "}
              <span className="text-xs sm:text-sm font-normal text-slate-400">
                / {attempt.total_marks}
              </span>
            </p>
          </div>
          {attempt.detailed_review_available ? (
            <Link
              href={`/dashboard/attempts/${attempt.id}`}
              prefetch={true}
              onClick={() => onOpenAttempt(attempt.id)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-teal-600 bg-teal-700 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-teal-800 min-h-[38px] sm:min-h-[42px] shrink-0"
            >
              {isOpening ? (
                <>
                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Opening...</span>
                </>
              ) : (
                <>
                  <span>Review</span>
                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </>
              )}
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

export function ExamHistorySection({
  initialAttempts,
  initialPage,
  totalAttempts,
  attemptsPerPage,
  initialTestTitles,
}: {
  initialAttempts: AttemptHistoryItem[];
  initialPage: number;
  totalAttempts: number;
  attemptsPerPage: number;
  initialTestTitles: Record<string, string>;
}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [cachedAttempts, setCachedAttempts] = useState<AttemptHistoryItem[] | null>(null);
  const [testTitles, setTestTitles] = useState<Record<string, string>>(initialTestTitles);
  const [isLoading, setIsLoading] = useState(false);
  const [openingAttemptId, setOpeningAttemptId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(totalAttempts / attemptsPerPage));

  // Preload all remaining attempts in the background after initial render
  useEffect(() => {
    let active = true;

    if (totalAttempts > attemptsPerPage && cachedAttempts === null) {
      fetchAllStudentAttempts(100)
        .then((res) => {
          if (!active) return;
          if (res.attempts.length > 0) {
            setCachedAttempts(res.attempts);
            setTestTitles((prev) => ({ ...prev, ...res.testTitles }));
          }
        })
        .catch(() => {
          // If background fetch fails, it gracefully falls back to server links
        });
    }

    return () => {
      active = false;
    };
  }, [totalAttempts, attemptsPerPage, cachedAttempts]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlPage = Number(params.get("page") ?? "1");
      const validPage = Number.isInteger(urlPage) && urlPage > 0 ? urlPage : 1;
      setCurrentPage(validPage);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Track active dashboard page for instant return navigation from review
  useEffect(() => {
    try {
      sessionStorage.setItem("varadhi_last_dashboard_url", window.location.href);
    } catch {
      // Ignore private browsing storage errors
    }
  }, [currentPage]);

  const goToPage = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) return;

    setCurrentPage(pageNumber);

    const targetUrl = pageNumber === 1 ? "/dashboard" : `/dashboard?page=${pageNumber}`;
    window.history.pushState({ page: pageNumber }, "", targetUrl);

    if (sectionRef.current) {
      const topOffset = sectionRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: "smooth" });
    }
  };

  // Determine which attempts to display
  let visibleAttempts: AttemptHistoryItem[] = [];
  if (cachedAttempts && cachedAttempts.length > 0) {
    const start = (currentPage - 1) * attemptsPerPage;
    visibleAttempts = cachedAttempts.slice(start, start + attemptsPerPage);
  } else if (currentPage === initialPage) {
    visibleAttempts = initialAttempts;
  }

  const showingFrom = totalAttempts === 0 ? 0 : (currentPage - 1) * attemptsPerPage + 1;
  const showingTo = Math.min(currentPage * attemptsPerPage, totalAttempts);

  return (
    <section ref={sectionRef} className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
      <div className="flex flex-wrap items-end justify-between gap-2.5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
            History
          </p>
          <h2 className="mt-0.5 text-lg sm:text-xl lg:text-2xl font-black text-slate-950">
            {currentPage > 1 ? `Completed Exams (Page ${currentPage})` : "Recent Exam History"}
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-600">
            Showing {showingFrom} to {showingTo} of {totalAttempts} completed exams.
          </p>
        </div>
        {currentPage === 1 && totalPages > 1 && (
          <button
            type="button"
            onClick={() => goToPage(2)}
            className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-900 transition cursor-pointer"
          >
            View next page &rarr;
          </button>
        )}
      </div>

      {visibleAttempts.length === 0 && isLoading ? (
        <div className="grid gap-3 sm:gap-4">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="h-24 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {visibleAttempts.map((attempt) => (
            <HistoryAttemptCard
              key={attempt.id}
              attempt={attempt}
              testTitle={testTitles[attempt.mock_test_id]}
              isOpening={openingAttemptId === attempt.id}
              onOpenAttempt={setOpeningAttemptId}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Exam history pages" className="mt-6 sm:mt-8 flex items-center justify-center gap-2 sm:gap-3">
          {currentPage > 1 ? (
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition hover:border-teal-300 hover:text-teal-900 min-h-[38px] cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              <span className="hidden xs:inline sm:inline">Previous</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 cursor-not-allowed min-h-[38px]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              <span className="hidden xs:inline sm:inline">Previous</span>
            </span>
          )}

          <span className="rounded-lg bg-slate-100 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 whitespace-nowrap">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage < totalPages ? (
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition hover:border-teal-300 hover:text-teal-900 min-h-[38px] cursor-pointer"
            >
              <span className="hidden xs:inline sm:inline">Next</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 cursor-not-allowed min-h-[38px]">
              <span className="hidden xs:inline sm:inline">Next</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </span>
          )}
        </nav>
      )}
    </section>
  );
}
