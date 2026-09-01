"use client";

import { LongPendingNotice, PendingButtonContent } from "@/components/feedback/LoadingSpinner";

type SubmissionDialogProps = {
  answered: number;
  review: number;
  unanswered: number;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export function SubmissionDialog({ answered, review, unanswered, submitting, onCancel, onSubmit }: SubmissionDialogProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-5" role="dialog" aria-modal="true" aria-busy={submitting}>
      <section className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Final submission</p>
        <h2 className="mt-2 text-2xl font-black">Finish this mock test?</h2>
        <p className="mt-3 text-sm text-slate-600">You cannot change your answers after submission.</p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Metric value={answered} label="Answered" tone="text-emerald-800" />
          <Metric value={review} label="Review" tone="text-amber-800" />
          <Metric value={unanswered} label="Unanswered" tone="text-slate-700" />
        </div>
        {unanswered > 0 && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">You still have {unanswered} unanswered question{unanswered === 1 ? "" : "s"}.</p>}
        <div className="mt-7 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={submitting} className="rounded-xl border px-4 py-3 text-sm font-bold disabled:opacity-50">Continue test</button>
          <button type="button" onClick={onSubmit} disabled={submitting} aria-busy={submitting} className="min-w-36 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-70">
            <PendingButtonContent pending={submitting} pendingLabel="Submitting…">Submit test</PendingButtonContent>
          </button>
        </div>
        <LongPendingNotice pending={submitting} />
      </section>
    </div>
  );
}

function Metric({ value, label, tone }: { value: number; label: string; tone: string }) {
  return <div className="rounded-xl border bg-white px-3 py-3 text-center"><strong className={`block text-lg font-black ${tone}`}>{value}</strong><span className="text-xs font-semibold text-slate-500">{label}</span></div>;
}
