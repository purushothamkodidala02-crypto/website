"use client";

import { useState, useTransition } from "react";
import { submitQuestionReport, type QuestionReportResult } from "@/lib/actions/question-reports";

const reasons = [
  ["wrong_answer", "Answer appears incorrect"],
  ["unclear_wording", "Question is unclear"],
  ["translation", "Translation issue"],
  ["broken_image", "Image is missing or unreadable"],
  ["duplicate", "Duplicate question"],
  ["other", "Other problem"],
] as const;

export function ReportQuestionButton({ questionId, attemptId = null }: { questionId: string; attemptId?: string | null }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("wrong_answer");
  const [details, setDetails] = useState("");
  const [result, setResult] = useState<QuestionReportResult | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    if (pending) return;
    setOpen(false);
    setResult(null);
  }

  function submit() {
    setResult(null);
    startTransition(async () => {
      const next = await submitQuestionReport(questionId, attemptId, category, details);
      setResult(next);
      if (next.success) setDetails("");
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:border-amber-300 hover:text-amber-800">Report issue</button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-4 py-8" role="dialog" aria-modal="true" aria-labelledby={`report-title-${questionId}`}>
          <section className="max-h-full w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wide text-amber-700">Content quality</p><h2 id={`report-title-${questionId}`} className="mt-2 text-2xl font-black text-slate-950">Report this question</h2></div><button type="button" onClick={close} disabled={pending} aria-label="Close report form" className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xl text-slate-600 disabled:opacity-50">×</button></div>
            <p className="mt-3 text-sm leading-6 text-slate-600">Select the problem. An administrator will review the question and make corrections where required.</p>
            <label className="mt-5 block text-sm font-bold text-slate-900">Reason<select value={category} onChange={(event) => setCategory(event.target.value)} disabled={pending} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal">{reasons.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="mt-4 block text-sm font-bold text-slate-900">Additional details <span className="font-normal text-slate-500">(optional)</span><textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={1000} rows={4} disabled={pending} className="mt-2 w-full resize-y rounded-xl border px-4 py-3 font-normal" placeholder="Explain what appears incorrect or unclear" /><span className="mt-1 block text-right text-xs font-normal text-slate-500">{details.length}/1000</span></label>
            {result && <p role="status" aria-live="polite" className={`mt-4 rounded-xl p-3 text-sm font-semibold ${result.success ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{result.message}</p>}
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={close} disabled={pending} className="rounded-xl border px-4 py-3 text-sm font-bold disabled:opacity-50">{result?.success ? "Close" : "Cancel"}</button>{!result?.success && <button type="button" onClick={submit} disabled={pending} aria-busy={pending} className="min-w-32 rounded-xl bg-amber-600 px-4 py-3 text-sm font-black text-white disabled:cursor-wait disabled:opacity-70">{pending ? "Submitting…" : "Submit report"}</button>}</div>
          </section>
        </div>
      )}
    </>
  );
}
