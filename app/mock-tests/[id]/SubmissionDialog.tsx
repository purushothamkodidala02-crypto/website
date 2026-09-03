"use client";

import { LongPendingNotice, PendingButtonContent } from "@/components/feedback/LoadingSpinner";

type SubmissionDialogProps = {
  answered: number;
  review: number;
  unanswered: number;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  questions: any[];
  answers: Record<string, string>;
  reviewIds: Set<string>;
  onGoToQuestion: (index: number) => void;
};

export function SubmissionDialog({ answered, review, unanswered, submitting, onCancel, onSubmit, questions, answers, reviewIds, onGoToQuestion }: SubmissionDialogProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 sm:p-5" role="dialog" aria-modal="true" aria-busy={submitting}>
      <section className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="shrink-0 p-6 pb-4 sm:p-7 sm:pb-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Final review</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">Finish this mock test?</h2>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            <Metric value={answered} label="Answered" tone="text-emerald-800" />
            <Metric value={review} label="Review" tone="text-amber-800" />
            <Metric value={unanswered} label="Unanswered" tone="text-slate-700" />
          </div>
        </div>
        
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-y border-slate-100 bg-slate-50 p-6 sm:p-7">
          <p className="mb-4 text-xs font-bold text-slate-500">Tap any question to jump back to it</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((item, index) => {
              const marked = reviewIds.has(item.question_id);
              const isAnswered = Boolean(answers[item.question_id]);
              return (
                <button
                  key={item.question_id}
                  type="button"
                  onClick={() => onGoToQuestion(index)}
                  disabled={submitting}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-black transition-colors ${marked ? "bg-amber-100 text-amber-900" : isAnswered ? "bg-emerald-100 text-emerald-800" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"} disabled:opacity-50`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 p-6 sm:p-7">
          {unanswered > 0 && <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">You still have {unanswered} unanswered question{unanswered === 1 ? "" : "s"}.</p>}
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={onCancel} disabled={submitting} className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 disabled:opacity-50">Back to test</button>
            <button type="button" onClick={onSubmit} disabled={submitting} aria-busy={submitting} className="min-w-36 rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm disabled:cursor-wait disabled:opacity-70">
              <PendingButtonContent pending={submitting} pendingLabel="Submitting…">Submit test</PendingButtonContent>
            </button>
          </div>
          <LongPendingNotice pending={submitting} />
        </div>
      </section>
    </div>
  );
}

function Metric({ value, label, tone }: { value: number; label: string; tone: string }) {
  return <div className="rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm"><strong className={`block text-lg font-black ${tone}`}>{value}</strong><span className="text-[10px] font-bold text-slate-500 sm:text-xs">{label}</span></div>;
}
