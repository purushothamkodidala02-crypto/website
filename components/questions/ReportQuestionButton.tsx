"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const ReportQuestionDialog = dynamic(
  () => import("@/components/questions/ReportQuestionDialog").then((module) => module.ReportQuestionDialog),
  {
    ssr: false,
    loading: () => <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-4"><p role="status" className="rounded-2xl bg-white px-5 py-4 text-sm font-bold text-slate-700 shadow-xl">Preparing report form…</p></div>,
  },
);

export function ReportQuestionButton({ questionId, attemptId = null }: { questionId: string; attemptId?: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:border-amber-300 hover:text-amber-800">Report issue</button>
      {open && <ReportQuestionDialog questionId={questionId} attemptId={attemptId} onClose={() => setOpen(false)} />}
    </>
  );
}
