"use client";

import Link from "next/link";
import { useStudentPractice } from "./useStudentPractice";
import { setLocalRecentPractice } from "@/lib/storage/student-practice-storage";

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
      });
    }
  };

  if (isAttempted) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200">
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
          prefetch={false}
          onClick={handleClick}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs transition active:scale-[0.98]"
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
      prefetch={false}
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition active:scale-[0.98]"
    >
      <span>Start test</span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}
