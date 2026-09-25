"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { exitFullscreenSafely } from "@/lib/fullscreen";
import { verifySubmittedAttempt, type SubmitAttemptResult } from "../attempt-actions";
import { SubmissionResult } from "../SubmissionResult";

export default function AttemptErrorPage({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [recoveredResult, setRecoveredResult] = useState<SubmitAttemptResult | null>(null);

  if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
    throw error;
  }

  useEffect(() => {
    void exitFullscreenSafely();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const session = params.get("session");
      if (session) {
        void verifySubmittedAttempt(session).then((res) => {
          if (res.success && res.attempt) {
            setRecoveredResult(res.attempt);
          }
        });
      }
    }
  }, []);

  if (recoveredResult) {
    return (
      <SubmissionResult
        publicTestPath="/mock-tests"
        title="Mock Test"
        result={recoveredResult}
      />
    );
  }

  return (
    <main className="student-page grid min-h-screen place-items-center bg-slate-50 px-5 text-slate-950">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-lg sm:p-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
          Answers safely recorded
        </p>
        <h1 className="font-display mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
          Test Submission Update
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          Your answers are saved in your account. You can check your result in the dashboard.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            onClick={() => void exitFullscreenSafely()}
            className="rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-600"
          >
            Check your result in the dashboard
          </Link>
          <Link
            href="/"
            onClick={() => void exitFullscreenSafely()}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
