"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import { MockSymbol, StateSymbol } from "@/components/exams/CatalogSymbols";
import { mockTestLabel } from "@/lib/exam-catalog";
import { SearchableSelect } from "@/components/admin/SearchableSelect";
import { quickCreateSubjectSection } from "@/app/admin/subjects/sections/actions";
import { createMockTest, type CreateMockTestState } from "./actions";
import type { MockTestAccessType } from "@/types/mock-test";

type ExamState = { id: string; name: string; code: string; slug: string };
type Category = { id: string; stateId: string; name: string };
type Exam = { id: string; categoryId: string; name: string };
type Specialization = { id: string; examId: string; name: string };
type Paper = { id: string; examId: string; specializationId: string | null; name: string; duration: number | null; questionCount: number | null };
type Subject = { id: string; paperId: string; name: string };
type SubjectSectionOption = { id: string; subjectId: string; name: string; slug: string };
type ExistingSeries = { paperId: string; subjectId: string | null; subjectSectionId?: string | null; scope: "paper" | "subject"; seriesNumber: number };

const initialState: CreateMockTestState = { success: false, message: "" };

export function CreateMockTestForm({ states, categories, exams, specializations, papers, subjects, sections = [], existingSeries }: {
  states: ExamState[];
  categories: Category[];
  exams: Exam[];
  specializations: Specialization[];
  papers: Paper[];
  subjects: Subject[];
  sections?: SubjectSectionOption[];
  existingSeries: ExistingSeries[];
}) {
  const [result, action, pending] = useActionState(createMockTest, initialState);
  const [stateId, setStateId] = useState(states[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState("");
  const [examId, setExamId] = useState("");
  const [specializationId, setSpecializationId] = useState("");
  const [paperId, setPaperId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [subjectSectionId, setSubjectSectionId] = useState("");
  const [scope, setScope] = useState<"paper" | "subject">("paper");
  const [accessType, setAccessType] = useState<MockTestAccessType>("free");
  const [allSections, setAllSections] = useState<SubjectSectionOption[]>(sections);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [isAddingSectionPending, setIsAddingSectionPending] = useState(false);
  const [addSectionError, setAddSectionError] = useState<string | null>(null);

  useEffect(() => {
    setAllSections(sections);
  }, [sections]);

  const state = states.find((item) => item.id === stateId);
  const availableCategories = useMemo(() => categories.filter((item) => item.stateId === stateId), [categories, stateId]);
  const availableExams = useMemo(() => exams.filter((item) => item.categoryId === categoryId), [exams, categoryId]);
  const availableSpecializations = useMemo(() => specializations.filter((item) => item.examId === examId), [examId, specializations]);
  const availablePapers = useMemo(() => papers.filter((item) => item.examId === examId && (specializationId ? item.specializationId === specializationId : !item.specializationId)), [papers, examId, specializationId]);
  const availableSubjects = useMemo(() => subjects.filter((item) => item.paperId === paperId), [subjects, paperId]);
  const availableSections = useMemo(() => allSections.filter((item) => item.subjectId === subjectId), [allSections, subjectId]);
  const exam = exams.find((item) => item.id === examId);
  const paper = papers.find((item) => item.id === paperId);
  const paperSpecialization = paper?.specializationId ? specializations.find((item) => item.id === paper.specializationId) : undefined;
  const subject = subjects.find((item) => item.id === subjectId);
  const section = availableSections.find((item) => item.id === subjectSectionId);

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

  const currentNumbers = existingSeries
    .filter(
      (item) =>
        item.paperId === paperId &&
        item.scope === scope &&
        (scope === "paper" ||
          (item.subjectId === subjectId &&
            (subjectSectionId
              ? item.subjectSectionId === subjectSectionId
              : !item.subjectSectionId))),
    )
    .map((item) => item.seriesNumber);
  const nextSeries = currentNumbers.length ? Math.max(...currentNumbers) + 1 : 1;

  function resetAfterState(value: string) { setStateId(value); setCategoryId(""); setExamId(""); setSpecializationId(""); setPaperId(""); setSubjectId(""); setSubjectSectionId(""); }
  function resetAfterCategory(value: string) { setCategoryId(value); setExamId(""); setSpecializationId(""); setPaperId(""); setSubjectId(""); setSubjectSectionId(""); }
  function resetAfterExam(value: string) { setExamId(value); setSpecializationId(""); setPaperId(""); setSubjectId(""); setSubjectSectionId(""); }
  function resetAfterSpecialization(value: string) { setSpecializationId(value); setPaperId(""); setSubjectId(""); setSubjectSectionId(""); }

  return <section className="mt-6 overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
    <div className="border-b bg-gradient-to-r from-slate-950 to-teal-950 px-6 py-6 text-white sm:px-7"><div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-300 text-slate-950"><MockSymbol /></span><div><p className="text-xs font-black uppercase tracking-[0.14em] text-teal-200">Guided test creator</p><h2 className="font-display mt-1 text-2xl">Create the next mock in its correct series</h2></div></div><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Select the location from left to right. Varadhi generates the test number, full name and URL automatically.</p></div>
    <form action={action} className="grid gap-5 p-6 md:grid-cols-2 sm:p-7">
      <label className="block text-sm font-bold">1. State / catalogue
        <select name="state_id" value={stateId} onChange={(event) => resetAfterState(event.target.value)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal">
          {states.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}
        </select>
      </label>
      <label className="block text-sm font-bold">2. Recruiting board<SearchableSelect name="exam_id" value={categoryId} onChange={resetAfterCategory} options={availableCategories.map((item) => ({ value: item.id, label: item.name }))} placeholder="Choose TGPSC, APPSC, DSC…" /></label>
      <label className="block text-sm font-bold">3. Exam<SearchableSelect name="exam_group_id" value={examId} onChange={resetAfterExam} options={availableExams.map((item) => ({ value: item.id, label: item.name }))} placeholder="Choose Executive Officer, Group 2…" disabled={!categoryId} /></label>
      <label className="block text-sm font-bold">Specialisation <span className="font-normal text-slate-500">(only when applicable)</span><SearchableSelect value={specializationId} onChange={resetAfterSpecialization} options={[{ value: "", label: availableSpecializations.length ? "Common / direct papers" : "No specialisation" }, ...availableSpecializations.map((item) => ({ value: item.id, label: item.name }))]} placeholder="Choose specialisation" disabled={!examId} /></label>
      <label className="block text-sm font-bold md:col-span-2">4. Paper<SearchableSelect name="paper_id" value={paperId} onChange={(value) => { setPaperId(value); setSubjectId(""); setSubjectSectionId(""); }} options={availablePapers.map((item) => ({ value: item.id, label: item.name }))} placeholder="Choose the exact paper" disabled={!examId} emptyMessage="No papers exist in this selection." /></label>
      <fieldset className="rounded-2xl border bg-slate-50 p-4"><legend className="px-1 text-sm font-bold">Practice coverage</legend><label className="mt-1 flex gap-3 text-sm"><input name="test_scope" type="radio" value="paper" checked={scope === "paper"} onChange={() => { setScope("paper"); setSubjectId(""); setSubjectSectionId(""); }} />Full paper mock</label><label className="mt-3 flex gap-3 text-sm"><input name="test_scope" type="radio" value="subject" checked={scope === "subject"} onChange={() => setScope("subject")} />One subject only</label></fieldset>
      {scope === "subject" ? (
        <div className="space-y-4">
          <label className="block text-sm font-bold">
            Subject
            <SearchableSelect
              name="subject_id"
              value={subjectId}
              onChange={(val) => {
                setSubjectId(val);
                setSubjectSectionId("");
              }}
              options={availableSubjects.map((item) => ({ value: item.id, label: item.name }))}
              placeholder="Choose a subject"
              disabled={!paperId}
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
              onChange={setSubjectSectionId}
              options={[
                { value: "", label: "None (Common Subject Mock Test)" },
                ...availableSections.map((item) => ({ value: item.id, label: item.name })),
              ]}
              placeholder={availableSections.length > 0 ? "Choose month or leave as Common" : "None (Common Subject Mock Test)"}
              disabled={!subjectId}
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
                No months or sub-sections exist for {subject?.name ?? "this subject"} yet. Click{" "}
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
      ) : (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-900">
          <strong>Full paper selected</strong>
          <p className="mt-1 leading-5">Questions can cover every subject assigned to this paper.</p>
        </div>
      )}

      <div className="md:col-span-2 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-4">{state && <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-950 text-teal-200"><StateSymbol slug={state.slug} className="h-5 w-5" /></span>}<div><p className="text-xs font-black uppercase tracking-[0.13em] text-teal-700">Student-facing name preview</p><h3 className="font-display mt-1 text-xl">{paper ? mockTestLabel(nextSeries) : "Choose a paper to generate the name"}</h3>{paper && <p className="mt-1 text-sm font-semibold text-slate-600">{state?.code} · {exam?.name} · {paperSpecialization?.name ?? paper.name}{subject ? ` · ${subject.name}${section ? ` (${section.name})` : ""}` : ""}</p>}</div></div>{paper && <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-teal-800 shadow-sm">Next in series: {nextSeries}</span>}</div>
        <input type="hidden" name="expected_series_number" value={nextSeries} />
      </div>

      <label className="block text-sm font-bold md:col-span-2">Description <span className="font-normal text-slate-500">(optional)</span><textarea name="description" rows={3} placeholder="Tell students what this mock covers" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label>
      <label className="block text-sm font-bold">Duration in minutes<input name="duration_minutes" type="number" min="1" required defaultValue={paper?.duration ?? 150} key={paperId || "duration"} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label>
      <label className="block text-sm font-bold">Target questions<input name="target_question_count" type="number" min="1" max="500" required defaultValue={scope === "paper" ? paper?.questionCount ?? 1 : 25} key={`${paperId}-${scope}`} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">Full-paper mocks inherit the Paper count. Subject mocks can use a custom target.</span></label>
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
          Free tests open to everyone. Paid tests require an active Exam Series that includes this exam. Set the selling price only in Admin → Exam Passes.
        </p>
      </div>
      <div className="md:col-span-2"><button disabled={pending || !paperId || (scope === "subject" && !subjectId)} aria-busy={pending} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg disabled:opacity-50"><PendingButtonContent pending={pending} pendingLabel="Creating draft…">Create {paper ? mockTestLabel(nextSeries) : "mock test"}</PendingButtonContent></button>{result.message && <p aria-live="polite" className={`mt-4 text-sm font-semibold ${result.success ? "text-emerald-700" : "text-red-700"}`}>{result.message}</p>}</div>
    </form>
  </section>;
}
