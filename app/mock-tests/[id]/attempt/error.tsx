"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RetryButton } from "@/components/feedback/RetryButton";
import { exitFullscreenSafely } from "@/lib/fullscreen";

export default function AttemptErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void exitFullscreenSafely();
    if (process.env.NODE_ENV === "development") {
      console.error("Test attempt route error:", error);
    }
  }, [error]);

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
          Your answers are saved in your account. If your test time just concluded, your submission is recorded. You can refresh to view your score or check your dashboard.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <RetryButton
            retry={reset}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
          />
          <Link
            href="/dashboard"
            onClick={() => void exitFullscreenSafely()}
            className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-600"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            onClick={() => void exitFullscreenSafely()}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
