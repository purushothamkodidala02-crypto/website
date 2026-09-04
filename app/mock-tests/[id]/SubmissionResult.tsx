"use client";

import Link from "next/link";
import type { SubmitAttemptResult } from "./attempt-actions";

type SubmissionResultProps = {
  publicTestPath: string;
  title: string;
  result: SubmitAttemptResult;
  onRetry?: () => void;
};

export function SubmissionResult({
  publicTestPath,
  title,
  result,
  onRetry,
}: SubmissionResultProps) {
  const percentage =
    result.totalMarks && result.totalMarks > 0 && typeof result.score === "number"
      ? Math.round((result.score / result.totalMarks) * 100)
      : null;

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-10">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xl sm:p-10">
        {result.success ? (
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )}

        <p
          className={`text-xs font-bold uppercase tracking-[0.16em] ${
            result.success ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {result.success ? "Test submitted successfully" : "Submission needs attention"}
        </p>
        <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">{title}</h1>

        {result.success ? (
          <>
            <div className="mt-6">
              <p className="text-5xl font-black text-slate-950">
                {result.score}{" "}
                <span className="text-2xl font-bold text-slate-400">/ {result.totalMarks}</span>
              </p>
              {percentage !== null && (
                <span className="mt-2 inline-block rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-700">
                  Score: {percentage}%
                </span>
              )}
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3">
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
              />
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {result.attemptId && (
                <Link
                  href={`/dashboard/attempts/${result.attemptId}`}
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Review answers
                </Link>
              )}
              <Link
                href={publicTestPath}
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-600"
              >
                Retake test
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Go to dashboard
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mt-5 text-slate-600">{result.message}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-7 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
              >
                Try submission again
              </button>
            )}
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
}: {
  value: number;
  label: string;
  tone: string;
  bg: string;
}) {
  return (
    <div className={`rounded-2xl border p-3.5 text-center ${bg}`}>
      <strong className={`block text-xl font-black ${tone}`}>{value}</strong>
      <span className="mt-0.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </div>
  );
}
