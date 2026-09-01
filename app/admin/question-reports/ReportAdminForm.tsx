"use client";

import { useActionState } from "react";
import { PendingSubmitButton } from "@/components/feedback/PendingSubmitButton";
import { updateQuestionReport, type ReportAdminState } from "./actions";

const initialState: ReportAdminState = { success: false, message: "" };

export function ReportAdminForm({ reportId, status, notes }: { reportId: string; status: string; notes: string | null }) {
  const [state, formAction] = useActionState(updateQuestionReport, initialState);
  return (
    <form action={formAction} className="mt-4 rounded-2xl bg-slate-50 p-4">
      <input type="hidden" name="report_id" value={reportId} />
      <div className="grid gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
        <label className="text-sm font-bold">Status<select name="status" defaultValue={status} className="mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5 font-normal"><option value="open">Open</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option></select></label>
        <label className="text-sm font-bold">Internal notes<input name="admin_notes" maxLength={2000} defaultValue={notes ?? ""} className="mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5 font-normal" placeholder="Correction made, duplicate report, or follow-up" /></label>
        <PendingSubmitButton pendingLabel="Saving…" className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-60">Save</PendingSubmitButton>
      </div>
      {state.message && <p aria-live="polite" className={`mt-3 text-sm font-semibold ${state.success ? "text-emerald-700" : "text-red-700"}`}>{state.message}</p>}
    </form>
  );
}
