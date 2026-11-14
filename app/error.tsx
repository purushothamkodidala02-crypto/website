"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RetryButton } from "@/components/feedback/RetryButton";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Varadhi page error boundary:", error);
  }, [error]);

  return (
    <main className="student-page grid min-h-screen place-items-center bg-slate-50 px-5 text-slate-950">
      <section className="w-full max-w-xl rounded-3xl border bg-white p-8 text-center shadow-sm sm:p-10">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-red-700">
          Temporary problem
        </p>
        <h1 className="font-display mt-3 text-3xl">Varadhi could not load this page.</h1>
        <p className="mt-4 leading-7 text-slate-600">
          Your account and saved answers are not changed. Try the page again.
        </p>
        {error?.digest && (
          <p className="mt-2 text-xs font-mono text-slate-400">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <RetryButton
            retry={reset}
            className="rounded-xl bg-[#0a2922] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#11382f] disabled:cursor-wait disabled:opacity-70"
          />
          <Link
            href="/"
            className="rounded-xl border px-5 py-3 font-bold text-slate-800"
          >
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
