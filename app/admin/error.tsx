"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RetryButton } from "@/components/feedback/RetryButton";

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin workspace error boundary caught:", error);
  }, [error]);

  const safeMessage =
    error?.message &&
    !error.message.includes("Minified React error") &&
    !error.message.includes("non-minified dev environment")
      ? error.message
      : null;

  return (
    <div
      role="region"
      aria-label="Admin workspace error"
      className="grid min-h-[70vh] place-items-center px-4 py-12 text-slate-950"
    >
      <section className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">
          Admin Workspace Error
        </p>
        <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
          Could not load admin page
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          A temporary problem interrupted this admin view. Your saved data is unaffected.
        </p>
        {safeMessage && (
          <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-700 break-words">
            {safeMessage}
          </p>
        )}
        {error?.digest && (
          <p className="mt-3 inline-block rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-mono text-slate-500">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <RetryButton
            retry={reset}
            className="rounded-xl bg-[#0a2922] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#11382f]"
          />
          <Link
            href="/admin/mock-tests"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Mock Tests
          </Link>
          <Link
            href="/admin/questions"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Question Bank
          </Link>
        </div>
      </section>
    </div>
  );
}
