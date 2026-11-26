"use client";

import Link from "next/link";
import { useStudentPractice } from "./useStudentPractice";
import { setLocalRecentPractice } from "@/lib/storage/student-practice-storage";
import { createClient } from "@/lib/supabase/client";

export type MockTestCardActionProps = {
  testId: string;
  testHref: string;
  pdfUrl?: string | null;
  testTitle?: string;
  folderUrl?: string;
  folderName?: string;
  folderType?: "subject" | "paper";
  examName?: string;
  paperName?: string;
  subjectName?: string;
  stateCode?: string;
};

function PdfActionLink({ pdfUrl }: { pdfUrl: string }) {
  return (
    <a
      href={pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 hover:border-teal-300 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold text-teal-900 shadow-2xs transition active:scale-[0.98] whitespace-nowrap"
      title="Open question paper PDF"
    >
      <svg
        className="h-3.5 w-3.5 shrink-0 text-teal-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v6m0 0l-2-2m2 2l2-2" />
      </svg>
      <span>PDF</span>
    </a>
  );
}

export function MockTestCardAction({
  testId,
  testHref,
  pdfUrl,
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
        {pdfUrl && <PdfActionLink pdfUrl={pdfUrl} />}
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
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      {pdfUrl && <PdfActionLink pdfUrl={pdfUrl} />}
      <Link
        href={testHref}
        prefetch={true}
        onClick={handleClick}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-white shadow-xs transition active:scale-[0.98] whitespace-nowrap"
      >
        <span>Start test</span>
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
