"use client";

import { useActionState, useMemo, useState } from "react";
import { PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import { SearchableSelect } from "@/components/admin/SearchableSelect";
import type { MockTest, MockTestAccessType } from "@/types/mock-test";
import { updateMockTest, type UpdateMockTestState } from "./actions";

type Paper = { id: string; label: string; duration: number | null };
type Subject = { id: string; paperId: string; name: string };

const initialState: UpdateMockTestState = { success: false, message: "" };

export function EditMockTestForm({
  mockTest,
  studentTitle,
  papers,
  subjects,
}: {
  mockTest: MockTest;
  studentTitle: string;
  papers: Paper[];
  subjects: Subject[];
}) {
  const [state, action, pending] = useActionState(
    updateMockTest.bind(null, mockTest.id),
    initialState,
  );
  const [paperId, setPaperId] = useState(mockTest.paper_id);
  const [subjectId, setSubjectId] = useState(mockTest.subject_id ?? "");
  const [scope, setScope] = useState(mockTest.test_scope);
  const [accessType, setAccessType] = useState<MockTestAccessType>(mockTest.access_type);
  const availableSubjects = useMemo(
    () => subjects.filter((subject) => subject.paperId === paperId),
    [subjects, paperId],
  );

  return (
    <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
      <form action={action} className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.13em] text-teal-700">Student-facing name</p><h2 className="font-display mt-1 text-2xl">{studentTitle}</h2><p className="mt-1 text-sm text-slate-600">Generated automatically from the selected Exam, Paper, optional Subject, and series number.</p></div>
        <label className="block text-sm font-bold md:col-span-2">Permanent URL slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={mockTest.slug} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">Changing this keeps the previous URL as a permanent redirect.</span></label>
        <label className="block text-sm font-bold md:col-span-2">
          Paper
          <SearchableSelect
            name="paper_id"
            value={paperId}
            onChange={(value) => {
              setPaperId(value);
              setSubjectId("");
            }}
            options={papers.map((paper) => ({ value: paper.id, label: paper.label }))}
            placeholder="Search for a paper"
          />
        </label>

        <fieldset className="rounded-xl border p-4">
          <legend className="px-1 text-sm font-bold">Mock type</legend>
          <label className="flex gap-2 text-sm">
            <input
              name="test_scope"
              type="radio"
              value="paper"
              checked={scope === "paper"}
              onChange={() => setScope("paper")}
            />
            Paper-wise
          </label>
          <label className="mt-2 flex gap-2 text-sm">
            <input
              name="test_scope"
              type="radio"
              value="subject"
              checked={scope === "subject"}
              onChange={() => setScope("subject")}
            />
            Subject-wise
          </label>
        </fieldset>

        {scope === "subject" && (
          <label className="block text-sm font-bold">
            Subject
            <SearchableSelect
              name="subject_id"
              value={subjectId}
              onChange={setSubjectId}
              options={availableSubjects.map((subject) => ({
                value: subject.id,
                label: subject.name,
              }))}
              placeholder="Search for a subject"
              emptyMessage="Add a Subject to this Paper first."
            />
          </label>
        )}

        <label className="block text-sm font-bold md:col-span-2">
          Description
          <textarea
            name="description"
            rows={3}
            defaultValue={mockTest.description ?? ""}
            className="mt-2 w-full rounded-xl border px-4 py-3 font-normal"
          />
        </label>
        <label className="block text-sm font-bold md:col-span-2">
          Student instructions <span className="font-normal text-slate-500">(optional)</span>
          <textarea name="instructions" rows={4} defaultValue={mockTest.instructions ?? ""} placeholder="Add any special instructions students should read before starting." className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" />
          <span className="mt-1 block text-xs font-normal text-slate-500">Shown on the mock-test details page before the student starts.</span>
        </label>
        <label className="block text-sm font-bold">
          Duration in minutes
          <input
            name="duration_minutes"
            type="number"
            min="1"
            required
            defaultValue={mockTest.duration_minutes}
            className="mt-2 w-full rounded-xl border px-4 py-3 font-normal"
          />
        </label>
        <label className="block text-sm font-bold">
          Target questions
          <input name="target_question_count" type="number" min="1" max="500" required defaultValue={mockTest.target_question_count} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" />
          <span className="mt-1 block text-xs font-normal text-slate-500">Locked after publishing or after the first student attempt.</span>
        </label>
        <input type="hidden" name="status" value={mockTest.status} />
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950 md:col-span-2">
          <strong>Student access</strong>
          <div className="mt-3">
            <label className="block text-sm font-semibold">
              Access type
              <select
                name="access_type"
                value={accessType}
                onChange={(event) => setAccessType(event.target.value as MockTestAccessType)}
                className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 font-normal text-slate-900"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </label>
          </div>
          <p className="mt-2 leading-5 text-emerald-900">
            Free tests are open to everyone. Paid tests require an active Exam Series that includes this exam. Set the selling price only in Admin → Exam Passes.
          </p>
        </div>
        <div className="md:col-span-2">
          <button
            disabled={pending}
            aria-busy={pending}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            <PendingButtonContent pending={pending} pendingLabel="Saving mock test…">Save Mock Test</PendingButtonContent>
          </button>
          {state.message && (
            <p
              className={`mt-4 text-sm font-semibold ${state.success ? "text-emerald-700" : "text-red-700"}`}
            >
              {state.message}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
