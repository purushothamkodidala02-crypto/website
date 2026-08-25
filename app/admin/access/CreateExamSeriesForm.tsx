"use client";

import { useActionState, useMemo, useState } from "react";
import { PendingSubmitButton } from "@/components/feedback/PendingSubmitButton";
import { createAccessProduct, updateAccessProduct, type AccessProductState } from "./actions";

export type ExamGroup = {
  id: string;
  name: string;
  boardId: string;
  boardName: string;
  stateId: string;
  stateName: string;
};

export type ExamSeriesDraft = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceInr: number;
  durationDays: number;
  examGroupIds: string[];
};

const initialState: AccessProductState = { success: false, message: "" };

export function CreateExamSeriesForm({ examGroups, product }: { examGroups: ExamGroup[]; product?: ExamSeriesDraft }) {
  const [state, action] = useActionState(product ? updateAccessProduct : createAccessProduct, initialState);
  const editing = Boolean(product);
  const [stateId, setStateId] = useState("");
  const [boardId, setBoardId] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(product?.examGroupIds ?? []);

  const states = useMemo(() => [...new Map(examGroups.map((group) => [group.stateId, group.stateName])).entries()].map(([id, name]) => ({ id, name })), [examGroups]);
  const boards = useMemo(() => [...new Map(examGroups.filter((group) => group.stateId === stateId).map((group) => [group.boardId, group.boardName])).entries()].map(([id, name]) => ({ id, name })), [examGroups, stateId]);
  const matchingGroups = useMemo(() => {
    if (!stateId) return [];
    const phrase = search.trim().toLowerCase();
    return examGroups.filter((group) => group.stateId === stateId && (!boardId || group.boardId === boardId) && (!phrase || `${group.name} ${group.boardName}`.toLowerCase().includes(phrase)));
  }, [boardId, examGroups, search, stateId]);
  const selectedGroups = examGroups.filter((group) => selectedIds.includes(group.id));

  function toggleGroup(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  return (
    <form action={action} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">{editing ? "Edit exam series" : "Step 2"}</p>
      <h2 className="mt-1 text-xl font-black text-slate-950">{editing ? "Update paid exam series" : "Create a paid exam series"}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Students pay once and unlock every paid mock test under the selected exam or exams.</p>

      {product && <input type="hidden" name="product_id" value={product.id} />}

      <div className="mt-5 grid gap-4">
        <label className="text-sm font-bold text-slate-900">Series name
          <input required name="name" defaultValue={product?.name} className="mt-1.5 w-full rounded-xl border px-3 py-2.5 font-normal" placeholder="Telangana Police Complete Series" />
        </label>
        <label className="text-sm font-bold text-slate-900">Price students pay (₹)
          <input required min="1" step="1" type="number" name="price_inr" defaultValue={product?.priceInr} className="mt-1.5 w-full rounded-xl border px-3 py-2.5 font-normal" placeholder="199" />
          <span className="mt-1 block text-xs font-normal text-slate-500">This is the final checkout price for the complete series, not a price per mock test.</span>
        </label>
        <label className="text-sm font-bold text-slate-900">Access valid for
          <select name="duration_days" defaultValue={String(product?.durationDays ?? 90)} className="mt-1.5 w-full rounded-xl border px-3 py-2.5 font-normal"><option value="30">30 days</option><option value="60">60 days</option><option value="90">90 days</option><option value="180">180 days</option><option value="365">365 days</option></select>
        </label>
        <label className="text-sm font-bold text-slate-900">Description <span className="font-normal text-slate-500">(optional)</span>
          <textarea name="description" defaultValue={product?.description ?? ""} className="mt-1.5 min-h-20 w-full rounded-xl border px-3 py-2.5 font-normal" placeholder="What students receive with this series" />
        </label>
        <label className="text-sm font-bold text-slate-900">URL label <span className="font-normal text-slate-500">(optional)</span>
          <input name="slug" defaultValue={product?.slug ?? ""} className="mt-1.5 w-full rounded-xl border px-3 py-2.5 font-normal" placeholder="Leave blank to create automatically" />
        </label>
      </div>

      {selectedIds.map((id) => <input key={id} type="hidden" name="exam_group_ids" value={id} />)}
      <fieldset className="mt-6">
        <legend className="text-sm font-bold text-slate-900">Exams included in this series</legend>
        <p className="mt-1 text-xs leading-5 text-slate-500">First choose a State, then filter by board or search for the exact exam. Tick one or many matching exams.{editing ? " Changing included exams is blocked after student purchases." : ""}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-800">State
            <select value={stateId} onChange={(event) => { setStateId(event.target.value); setBoardId(""); }} className="mt-1.5 w-full rounded-xl border px-3 py-2.5 font-normal"><option value="">Choose a state</option>{states.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          </label>
          <label className="text-sm font-semibold text-slate-800">Recruiting board / category
            <select value={boardId} onChange={(event) => setBoardId(event.target.value)} disabled={!stateId} className="mt-1.5 w-full rounded-xl border px-3 py-2.5 font-normal disabled:bg-slate-100"><option value="">All boards</option>{boards.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          </label>
        </div>
        <label className="mt-3 block text-sm font-semibold text-slate-800">Search exact exam
          <input value={search} onChange={(event) => setSearch(event.target.value)} disabled={!stateId} placeholder="Example: Police Constable or Executive Officer" className="mt-1.5 w-full rounded-xl border px-3 py-2.5 font-normal disabled:bg-slate-100" />
        </label>

        {selectedGroups.length > 0 && <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-bold text-teal-950">{selectedGroups.length} exam{selectedGroups.length === 1 ? "" : "s"} selected</p><button type="button" onClick={() => setSelectedIds([])} className="text-sm font-bold text-teal-800 underline">Clear all</button></div><p className="mt-2 text-xs leading-5 text-teal-900">{selectedGroups.map((group) => group.name).join(", ")}</p></div>}

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {!stateId && <p className="sm:col-span-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Choose a State to see its exams. The full catalogue is not shown here.</p>}
          {stateId && matchingGroups.map((group) => <label key={group.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm hover:border-teal-400 hover:bg-teal-50"><input type="checkbox" checked={selectedIds.includes(group.id)} onChange={() => toggleGroup(group.id)} className="mt-1 h-4 w-4 accent-teal-700" /><span><span className="block font-bold text-slate-900">{group.name}</span><span className="block text-xs text-slate-600">{group.boardName} · {group.stateName}</span></span></label>)}
          {stateId && !matchingGroups.length && <p className="sm:col-span-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No exams match these filters. Change the board or search term.</p>}
        </div>
        {!examGroups.length && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Create an exam first in the catalogue before creating a paid series.</p>}
      </fieldset>

      <div className="mt-6"><PendingSubmitButton pendingLabel={editing ? "Saving exam series…" : "Creating exam series…"} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60">{editing ? "Save changes" : "Create and activate series"}</PendingSubmitButton></div>
      {state.message && <p role="status" aria-live="polite" className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${state.success ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{state.message}</p>}
    </form>
  );
}
