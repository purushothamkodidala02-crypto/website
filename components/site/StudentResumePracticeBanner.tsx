"use client";

import Link from "next/link";
import { useStudentPractice } from "@/components/mock-tests/useStudentPractice";

export function StudentResumePracticeBanner({
  className = "",
}: {
  className?: string;
}) {
  const { lastPractice, isLoaded } = useStudentPractice();

  // If not yet loaded or no practice recorded, keep the layout completely clean
  if (!isLoaded || !lastPractice) {
    return null;
  }

  const scoreText =
    typeof lastPractice.score === "number" && typeof lastPractice.totalMarks === "number" && lastPractice.totalMarks > 0
      ? ` · Score: ${lastPractice.score}/${lastPractice.totalMarks}`
      : "";

  return (
    <section
      aria-label="Continue recent practice"
      className={`student-card relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-r from-white via-slate-50/70 to-slate-100/40 p-4 sm:p-5 shadow-xs shadow-slate-900/4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Side: Test and Folder Context */}
        <div className="flex items-start gap-3 min-w-0">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200/80 bg-slate-100 text-slate-700 shadow-2xs">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200">
                Continue Practice
              </span>
              <p className="text-[11px] font-bold uppercase tracking-wider text-teal-800 truncate">
                {lastPractice.stateCode ? `${lastPractice.stateCode} · ` : ""}
                {lastPractice.examName}
                {lastPractice.paperName ? ` · ${lastPractice.paperName}` : ""}
              </p>
            </div>

            <h3 className="font-display mt-1 text-base font-bold text-slate-900 sm:text-lg truncate">
              {lastPractice.folderName}
            </h3>

            <p className="mt-0.5 text-xs text-slate-600 truncate">
              Last written:{" "}
              <span className="font-semibold text-slate-800">
                {lastPractice.testTitle}
              </span>
              {scoreText}
            </p>
          </div>
        </div>

        {/* Right Side: Direct Navigation Action */}
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Link
            href={lastPractice.folderUrl}
            prefetch={true}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition active:scale-[0.98]"
          >
            <span>Continue to {lastPractice.folderName}</span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href={lastPractice.testPath}
            prefetch={true}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition"
          >
            Retake test
          </Link>
        </div>
      </div>
    </section>
  );
}
