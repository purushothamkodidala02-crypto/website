"use client";

import { useActionState, useState } from "react";
import { SearchableSelect } from "@/components/admin/SearchableSelect";
import { SeoFields } from "@/components/admin/SeoFields";
import type { ExamGroup } from "@/types/group";
import { updateGroup, type UpdateGroupState } from "./actions";

type ExamOption = { id: string; name: string };
const initialState: UpdateGroupState = { success: false, message: "" };

export function EditGroupForm({ group, exams }: { group: ExamGroup; exams: ExamOption[] }) {
  const updateGroupWithId = updateGroup.bind(null, group.id);
  const [state, formAction, pending] = useActionState(updateGroupWithId, initialState);
  const [examId, setExamId] = useState(group.exam_id);

  return (
    <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Exam details</h2>
      <p className="mt-1 text-sm text-slate-600">These settings control the public Exam heading, introduction, URL, search appearance, and catalogue order.</p>
      <form action={formAction} className="mt-6 space-y-5">
        <label className="block text-sm font-bold">Recruiting Board<SearchableSelect name="exam_id" value={examId} onChange={setExamId} options={exams.map((exam) => ({ value: exam.id, label: exam.name }))} placeholder="Search a Recruiting Board" /></label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-bold">Exam name<input id="name" name="name" type="text" required defaultValue={group.name} className="mt-2 w-full rounded-lg border px-4 py-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">Shown in student headings, cards, breadcrumbs, and generated mock-test names.</span></label>
          <label className="block text-sm font-bold">URL slug<input id="slug" name="slug" type="text" required pattern="[a-z0-9-]+" defaultValue={group.slug} className="mt-2 w-full rounded-lg border px-4 py-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">Changes the public URL. The previous URL remains a permanent redirect.</span></label>
        </div>
        <label className="block text-sm font-bold">Student introduction <span className="font-normal text-slate-500">optional</span><textarea id="description" name="description" rows={4} defaultValue={group.description ?? ""} className="mt-2 w-full rounded-lg border px-4 py-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">Shown below the Exam title on its public landing page.</span></label>
        <SeoFields title={group.seo_title} description={group.seo_description} titlePlaceholder={`${group.name} Mock Test – Free Online Tests`} descriptionPlaceholder={`Take free ${group.name} mock tests with timed practice and answer review.`} />
        <div className="max-w-xs"><label className="block text-sm font-bold">Display order<input id="display_order" name="display_order" type="number" min="0" step="1" required defaultValue={group.display_order} className="mt-2 w-full rounded-lg border px-4 py-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">Controls sorting only; students never see this number.</span></label></div>
        <label className="flex items-center gap-3 rounded-xl border bg-slate-50 p-4"><input name="is_active" type="checkbox" defaultChecked={group.is_active} className="h-4 w-4" /><span><span className="block text-sm font-bold">Active in the catalogue</span><span className="mt-1 block text-xs text-slate-500">Published mock tests remain the final student-visibility control.</span></span></label>
        <button type="submit" disabled={pending} className="rounded-lg bg-slate-950 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Saving..." : "Save Exam details"}</button>
        {state.message && <p aria-live="polite" className={state.success ? "text-sm font-semibold text-green-700" : "text-sm font-semibold text-red-600"}>{state.message}</p>}
      </form>
    </section>
  );
}
