"use client";

import { useActionState } from "react";
import { PendingSubmitButton } from "@/components/feedback/PendingSubmitButton";
import { createAccessProduct, type AccessProductState } from "./actions";

type ExamGroup = { id: string; examName: string; name: string };

const initialState: AccessProductState = { success: false, message: "" };

export function CreateExamSeriesForm({ examGroups }: { examGroups: ExamGroup[] }) {
  const [state, action] = useActionState(createAccessProduct, initialState);

  return (
    <form action={action} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Step 2</p>
      <h2 className="mt-1 text-xl font-black text-slate-950">Create a paid exam series</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Students pay once and unlock every paid mock test under each selected exam. Select one exam or several exams below.</p>

      <div className="mt-5 grid gap-4">
        <label className="text-sm font-bold text-slate-900">Series name
          <input required name="name" className="mt-1.5 w-full rounded-xl border px-3 py-2.5 font-normal" placeholder="Telangana Police Complete Series" />
          <span className="mt-1 block text-xs font-normal text-slate-500">Example: one pass for Police Constable, SI and other police exams.</span>
        </label>
        <label className="text-sm font-bold text-slate-900">Price students pay (₹)
          <input required min="1" step="1" type="number" name="price_inr" className="mt-1.5 w-full rounded-xl border px-3 py-2.5 font-normal" placeholder="199" />
          <span className="mt-1 block text-xs font-normal text-slate-500">This is the final checkout price for the complete series, not a price per mock test.</span>
        </label>
        <label className="text-sm font-bold text-slate-900">Access valid for
          <select name="duration_days" defaultValue="90" className="mt-1.5 w-full rounded-xl border px-3 py-2.5 font-normal"><option value="30">30 days</option><option value="60">60 days</option><option value="90">90 days</option><option value="180">180 days</option><option value="365">365 days</option></select>
        </label>
        <label className="text-sm font-bold text-slate-900">Description <span className="font-normal text-slate-500">(optional)</span>
          <textarea name="description" className="mt-1.5 min-h-20 w-full rounded-xl border px-3 py-2.5 font-normal" placeholder="What students receive with this series" />
        </label>
        <label className="text-sm font-bold text-slate-900">URL label <span className="font-normal text-slate-500">(optional)</span>
          <input name="slug" className="mt-1.5 w-full rounded-xl border px-3 py-2.5 font-normal" placeholder="Leave blank to create automatically" />
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-bold text-slate-900">Exams included in this series</legend>
        <p className="mt-1 text-xs leading-5 text-slate-500">Tick one box for a single-exam pass, or tick many boxes for one combined pass.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {examGroups.map((group) => <label key={group.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm hover:border-teal-400 hover:bg-teal-50"><input type="checkbox" name="exam_group_ids" value={group.id} className="mt-1 h-4 w-4 accent-teal-700" /><span><span className="block font-bold text-slate-900">{group.name}</span><span className="block text-xs text-slate-600">{group.examName}</span></span></label>)}
        </div>
        {!examGroups.length && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Create an exam first in the catalogue before creating a paid series.</p>}
      </fieldset>

      <div className="mt-6"><PendingSubmitButton pendingLabel="Creating exam series…" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60">Create and activate series</PendingSubmitButton></div>
      {state.message && <p role="status" aria-live="polite" className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${state.success ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{state.message}</p>}
    </form>
  );
}
