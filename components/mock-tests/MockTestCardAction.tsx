"use client";

import Link from "next/link";
import { useStudentPractice } from "./useStudentPractice";
import { setLocalRecentPractice } from "@/lib/storage/student-practice-storage";
import { createClient } from "@/lib/supabase/client";

export type MockTestCardActionProps = {
  testId: string;
  testHref: string;
  testTitle?: string;
  folderUrl?: string;
  folderName?: string;
  folderType?: "subject" | "paper";
  examName?: string;
  paperName?: string;
  subjectName?: string;
  stateCode?: string;
};

export function MockTestCardAction({
  testId,
  testHref,
  testTitle,
  folderUrl,
  folderName,
  folderType = "paper",
  examName,
  paperName,
  subjectName,
  stateCode,
}: MockTestCardActionProps) {
  const { hasAttempted } = useStudentPractice();
  const isAttempted = hasAttempted(testId);

  const handleClick = () => {
    if (folderUrl && folderName && examName && testTitle) {
      const supabase = createClient();
      void supabase.auth.getSession().then(({ data }) => {
        if (!data.session?.user?.id) return;
        setLocalRecentPractice({
          testId,
          testTitle,
          testPath: testHref,
          folderUrl,
          folderName,
          folderType,
          examName,
          paperName,
          subjectName,
          stateCode,
          timestamp: Date.now(),
          userId: data.session.user.id,
        });
      });
    }
  };

  if (isAttempted) {
    return (
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-slate-100 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold text-slate-700 border border-slate-200">
          <svg
            className="h-3 w-3 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Attempted
        </span>
        <Link
          href={testHref}
          prefetch={true}
          onClick={handleClick}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-slate-800 shadow-2xs transition active:scale-[0.98] whitespace-nowrap"
        >
          <span>Retake</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={testHref}
      prefetch={true}
      onClick={handleClick}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-white shadow-xs transition active:scale-[0.98] whitespace-nowrap"
    >
      <span>Start test</span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}
