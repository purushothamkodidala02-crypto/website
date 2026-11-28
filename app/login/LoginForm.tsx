"use client";

import Link from "next/link";
import { useId } from "react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const noticeStyles = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function LoginForm({
  nextPath,
  initialMessage,
  initialError,
}: {
  nextPath: string;
  initialMessage?: string;
  initialError?: string;
}) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="min-w-0 rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#0f766e]">
          Varadhi Prep Account
        </p>
        {nextPath !== "/" && (
          <span className="inline-flex items-center rounded-full border border-[#cfe2db] bg-[#f5faf8] px-2.5 py-0.5 text-[11px] font-bold text-[#0f766e]">
            {nextPath.startsWith("/admin")
              ? "Admin sign-in"
              : nextPath.startsWith("/dashboard")
                ? "Student dashboard"
                : "Continue to your test"}
          </span>
        )}
      </div>

      <h1 id={headingId} className="mt-2.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
        Access your study hub
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Save your mock test attempts, scorecards, bookmarks, and Mistake Book in one place.
      </p>

      {(initialError || initialMessage) && (
        <div
          role={initialError ? "alert" : "status"}
          aria-live="polite"
          className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
            initialError ? noticeStyles.error : noticeStyles.success
          }`}
        >
          {initialError ?? initialMessage}
        </div>
      )}

      <div className="mt-6">
        <GoogleSignInButton nextPath={nextPath} />
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Works for both new and existing accounts — first-time students confirm their mobile number once after connecting.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span>Free &amp; ad-free exam preparation</span>
        <div className="flex items-center gap-3 font-semibold text-[#0f766e]">
          <Link href="/terms-and-conditions" className="hover:underline">
            Terms
          </Link>
          <span className="text-slate-300" aria-hidden="true">•</span>
          <Link href="/privacy-policy" className="hover:underline">
            Privacy
          </Link>
        </div>
      </div>
    </section>
  );
}
