"use client";

import Link from "next/link";
import { useEffect } from "react";
import { exitFullscreenSafely } from "@/lib/fullscreen";
import { parseMockTestTitle } from "@/lib/exam-catalog";
import type { SubmitAttemptResult } from "./attempt-actions";
import { addLocalAttemptedTestId, getLocalRecentPractice, setLocalRecentPractice } from "@/lib/storage/student-practice-storage";

type SubmissionResultProps = {
  publicTestPath: string;
  title: string;
  result: SubmitAttemptResult;
  onRetry?: () => void;
  mockTestId?: string;
  folderUrl?: string;
  folderName?: string;
};

export function SubmissionResult({
  publicTestPath,
  title,
  result,
  onRetry,
  mockTestId,
  folderUrl,
  folderName,
}: SubmissionResultProps) {
  useEffect(() => {
    void exitFullscreenSafely();
    if (mockTestId && (result.success || typeof result.score === "number")) {
      addLocalAttemptedTestId(mockTestId);
      const current = getLocalRecentPractice();
      if (current && current.testId === mockTestId) {
        setLocalRecentPractice({
          ...current,
          score: typeof result.score === "number" ? result.score : current.score,
          totalMarks: typeof result.totalMarks === "number" ? result.totalMarks : current.totalMarks,
          submittedAt: new Date().toISOString(),
        });
      }
    }
  }, [mockTestId, result]);

  const parsedTitle = parseMockTestTitle(title);

  const percentage =
    result.totalMarks && result.totalMarks > 0 && typeof result.score === "number"
      ? Math.round((result.score / result.totalMarks) * 100)
      : null;

  return (
    <main className="student-page grid min-h-[100dvh] place-items-center bg-slate-50 py-6 pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] sm:px-5 sm:py-10">
      <section className="w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-4 text-center shadow-xl sm:p-10 min-w-0 overflow-hidden">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
          {result.success || typeof result.score === "number" ? "Test submitted successfully" : "Answers safely recorded"}
        </p>

        {parsedTitle.breadcrumb.length > 0 && (
          <p className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 break-words">
            {parsedTitle.breadcrumb.map((crumb, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5">
                {idx > 0 && <span className="text-slate-400 font-normal" aria-hidden="true">›</span>}
                <span>{crumb}</span>
              </span>
            ))}
          </p>
        )}

        <h1 className="mt-1.5 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xl font-black text-slate-900 sm:text-3xl break-words [overflow-wrap:anywhere]">
          <span>{parsedTitle.primaryTitle}</span>
          {parsedTitle.testLabel && (
            <span className="inline-flex items-center rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs sm:text-base font-bold text-teal-800">
              {parsedTitle.testLabel}
            </span>
          )}
        </h1>

        {result.success || typeof result.score === "number" ? (
          <>
            <div className="mt-6">
              <p className="text-4xl sm:text-5xl font-black text-slate-950">
                {result.score}{" "}
                <span className="text-xl sm:text-2xl font-bold text-slate-400">/ {result.totalMarks}</span>
              </p>
              {percentage !== null && (
                <span className="mt-2 inline-block rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-700">
                  Score: {percentage}%
                </span>
              )}
            </div>

            <div className="mt-6 sm:mt-7 grid grid-cols-2 min-[400px]:grid-cols-3 gap-2 sm:gap-3">
              <Metric
                value={result.correctAnswers ?? 0}
                label="Correct"
                tone="text-emerald-700"
                bg="bg-emerald-50/70 border-emerald-100"
              />
              <Metric
                value={result.incorrectAnswers ?? 0}
                label="Incorrect"
                tone="text-red-700"
                bg="bg-red-50/70 border-red-100"
              />
              <Metric
                value={result.unansweredQuestions ?? 0}
                label="Unanswered"
                tone="text-slate-700"
                bg="bg-slate-50 border-slate-100"
                className="col-span-2 min-[400px]:col-span-1"
              />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center items-stretch sm:items-center gap-2.5 sm:gap-3 w-full max-w-full">
              {folderUrl && (
                <Link
                  href={folderUrl}
                  prefetch={true}
                  onClick={() => {
                    void exitFullscreenSafely();
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs transition hover:bg-slate-50 active:scale-[0.98] min-w-0 leading-snug text-center whitespace-normal break-words"
                >
                  <span>Continue to {folderName ?? "folder"} →</span>
                </Link>
              )}
              {result.attemptId && (
                <Link
                  href={`/dashboard/attempts/${result.attemptId}`}
                  prefetch={true}
                  onClick={() => {
                    void exitFullscreenSafely();
                  }}
                  className="rounded-xl bg-[#0a2922] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#11382f] text-center"
                >
                  Review answers
                </Link>
              )}
              <Link
                href="/dashboard"
                prefetch={true}
                onClick={() => {
                  void exitFullscreenSafely();
                }}
                className="rounded-xl bg-[#ea580c] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#d94f08] text-center"
              >
                Go to dashboard
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mt-5 text-base font-semibold text-slate-700">
              {result.message || "Your answers are saved in your account."}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Check your result in the dashboard.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-600"
                >
                  Try submitting again
                </button>
              )}
              <Link
                href="/dashboard"
                prefetch={true}
                onClick={() => {
                  void exitFullscreenSafely();
                }}
                className={`rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-sm transition ${
                  onRetry ? "bg-[#0a2922] hover:bg-[#11382f]" : "bg-[#047857] hover:bg-[#065f46]"
                }`}
              >
                Check dashboard
              </Link>
              <Link
                href={publicTestPath}
                prefetch={true}
                onClick={() => {
                  void exitFullscreenSafely();
                }}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                View test details
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function Metric({
  value,
  label,
  tone,
  bg,
  className = "",
}: {
  value: number;
  label: string;
  tone: string;
  bg: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl sm:rounded-2xl border p-2.5 sm:p-3.5 text-center min-w-0 overflow-hidden ${bg} ${className}`}>
      <strong className={`block text-lg sm:text-xl font-black ${tone}`}>{value}</strong>
      <span
        className="mt-0.5 block text-[10px] sm:text-[11px] font-bold uppercase tracking-tight sm:tracking-wider text-slate-500 leading-snug break-words"
        title={label}
      >
        {label}
      </span>
    </div>
  );
}
