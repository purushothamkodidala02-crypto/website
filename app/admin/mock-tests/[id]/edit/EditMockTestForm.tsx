"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import { SearchableSelect } from "@/components/admin/SearchableSelect";
import type { MockTest, MockTestAccessType } from "@/types/mock-test";
import { quickCreateSubjectSection } from "@/app/admin/subjects/sections/actions";
import { updateMockTest, type UpdateMockTestState } from "./actions";

type Paper = { id: string; label: string; duration: number | null };
type Subject = { id: string; paperId: string; name: string };
type SubjectSection = { id: string; subjectId: string; name: string; slug: string };

const initialState: UpdateMockTestState = { success: false, message: "" };

export function EditMockTestForm({
  mockTest,
  studentTitle,
  papers,
  subjects,
  sections = [],
}: {
  mockTest: MockTest;
  studentTitle: string;
  papers: Paper[];
  subjects: Subject[];
  sections?: SubjectSection[];
}) {
  const [state, action, pending] = useActionState(
    updateMockTest.bind(null, mockTest.id),
    initialState,
  );
  const [paperId, setPaperId] = useState(mockTest.paper_id);
  const [subjectId, setSubjectId] = useState(mockTest.subject_id ?? "");
  const [subjectSectionId, setSubjectSectionId] = useState(mockTest.subject_section_id ?? "");
  const [scope, setScope] = useState(mockTest.test_scope);
  const [accessType, setAccessType] = useState<MockTestAccessType>(mockTest.access_type);
  const [allSections, setAllSections] = useState<SubjectSection[]>(sections);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [isAddingSectionPending, setIsAddingSectionPending] = useState(false);
  const [addSectionError, setAddSectionError] = useState<string | null>(null);

  useEffect(() => {
    setAllSections(sections);
  }, [sections]);

  const availableSubjects = useMemo(
    () => subjects.filter((subject) => subject.paperId === paperId),
    [subjects, paperId],
  );
  const availableSections = useMemo(
    () => allSections.filter((sec) => sec.subjectId === subjectId),
    [allSections, subjectId],
  );

  async function handleQuickAddSection() {
    if (!subjectId || !newSectionName.trim()) return;
    setIsAddingSectionPending(true);
    setAddSectionError(null);
    try {
      const res = await quickCreateSubjectSection(subjectId, newSectionName.trim());
      if (res.success && res.section) {
        const created = res.section;
        setAllSections((prev) => {
          if (prev.some((s) => s.id === created.id)) return prev;
          return [...prev, created];
        });
        setSubjectSectionId(created.id);
        setNewSectionName("");
        setIsAddingSection(false);
      } else {
        setAddSectionError(res.message || "Failed to create sub-section.");
      }
    } catch (err) {
      setAddSectionError(err instanceof Error ? err.message : "Failed to create sub-section.");
    } finally {
      setIsAddingSectionPending(false);
    }
  }

  const isPublished = mockTest.status !== "draft";

  return (
    <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
      {isPublished && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <strong>Published Test Settings:</strong> You can update the Description, Instructions, Permanent URL slug, Access type, and Sub-section (month) below. Structural properties (Paper, Subject, Duration, and Target Questions) are locked to protect student test attempts.
        </div>
      )}
      <form action={action} className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 md:col-span-2"><p className="text-xs font-black uppercase tracking-[0.13em] text-teal-700">Student-facing name</p><h2 className="font-display mt-1 text-2xl">{studentTitle}</h2><p className="mt-1 text-sm text-slate-600">Generated automatically from the selected Exam, Paper, optional Subject, and series number.</p></div>
        <label className="block text-sm font-bold md:col-span-2">Permanent URL slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={mockTest.slug} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">Changing this keeps the previous URL as a permanent redirect.</span></label>
        <label className="block text-sm font-bold md:col-span-2">
          Paper
          <SearchableSelect
            name="paper_id"
            value={paperId}
            disabled={isPublished}
            onChange={(value) => {
              if (isPublished) return;
              setPaperId(value);
              setSubjectId("");
            }}
            options={papers.map((paper) => ({ value: paper.id, label: paper.label }))}
            placeholder="Search for a paper"
          />
        </label>

        <fieldset className={`rounded-xl border p-4 ${isPublished ? "opacity-60" : ""}`}>
          <legend className="px-1 text-sm font-bold">Mock type</legend>
          <label className="flex gap-2 text-sm">
            <input
              name="test_scope"
              type="radio"
              value="paper"
              disabled={isPublished}
              checked={scope === "paper"}
              onChange={() => !isPublished && setScope("paper")}
            />
            Paper-wise
          </label>
          <label className="mt-2 flex gap-2 text-sm">
            <input
              name="test_scope"
              type="radio"
              value="subject"
              disabled={isPublished}
              checked={scope === "subject"}
              onChange={() => !isPublished && setScope("subject")}
            />
            Subject-wise
          </label>
        </fieldset>

        {scope === "subject" && (
          <div className="space-y-4">
            <label className="block text-sm font-bold">
              Subject
              <SearchableSelect
                name="subject_id"
                value={subjectId}
                disabled={isPublished}
                onChange={(value) => {
                  if (isPublished) return;
                  setSubjectId(value);
                  setSubjectSectionId("");
                }}
                options={availableSubjects.map((subject) => ({
                  value: subject.id,
                  label: subject.name,
                }))}
                placeholder="Search for a subject"
                emptyMessage="Add a Subject to this Paper first."
              />
            </label>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold">
                  Sub-section / Month <span className="font-normal text-slate-500">(optional)</span>
                </label>
                {subjectId && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingSection((prev) => !prev);
                      setAddSectionError(null);
                    }}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline"
                  >
                    {isAddingSection ? "Cancel" : "+ Add month / sub-section"}
                  </button>
                )}
              </div>
              <SearchableSelect
                name="subject_section_id"
                value={subjectSectionId}
                disabled={false}
                onChange={setSubjectSectionId}
                options={[
                  { value: "", label: "None (Common Subject Mock Test)" },
                  ...availableSections.map((sec) => ({
                    value: sec.id,
                    label: sec.name,
                  })),
                ]}
                placeholder={availableSections.length > 0 ? "Search for sub-section" : "None (Common Subject Mock Test)"}
              />
              {isAddingSection && (
                <div className="mt-2 rounded-xl border border-teal-200 bg-teal-50/70 p-3">
                  <p className="text-xs font-bold text-teal-950">Add new month / sub-section (e.g. June, July)</p>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleQuickAddSection();
                        }
                      }}
                      placeholder="e.g. June"
                      className="flex-1 rounded-lg border bg-white px-3 py-1.5 text-xs outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-200"
                      disabled={isAddingSectionPending}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddSection}
                      disabled={isAddingSectionPending || !newSectionName.trim()}
                      className="rounded-lg bg-teal-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-900 disabled:opacity-50"
                    >
                      {isAddingSectionPending ? "Adding…" : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingSection(false);
                        setNewSectionName("");
                        setAddSectionError(null);
                      }}
                      className="rounded-lg border bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                  {addSectionError && (
                    <p className="mt-1.5 text-xs font-semibold text-red-600">{addSectionError}</p>
                  )}
                </div>
              )}
              {subjectId && availableSections.length === 0 && !isAddingSection && (
                <p className="mt-1 text-xs text-slate-500">
                  No months or sub-sections exist for this subject yet. Click{" "}
                  <button
                    type="button"
                    onClick={() => setIsAddingSection(true)}
                    className="font-bold text-teal-700 underline"
                  >
                    + Add month / sub-section
                  </button>{" "}
                  to create June, July, etc., or leave as Common.
                </p>
              )}
            </div>
          </div>
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
            disabled={isPublished}
            defaultValue={mockTest.duration_minutes}
            className="mt-2 w-full rounded-xl border px-4 py-3 font-normal disabled:bg-slate-100 disabled:text-slate-500"
          />
        </label>
        <label className="block text-sm font-bold">
          Target questions
          <input name="target_question_count" type="number" min="1" max="500" required disabled={isPublished} defaultValue={mockTest.target_question_count} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal disabled:bg-slate-100 disabled:text-slate-500" />
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
