"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormattedQuestionText } from "@/components/questions/FormattedQuestionText";
import { PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import { moveAssignedQuestion, removeAssignedQuestion, bulkRemoveAssignedQuestions, sortAssignedQuestionsBySubjectOrder } from "./question-actions";

type AssignedQuestion = {
  id: string;
  question_id: string;
  question_order: number;
  marks: number;
  negative_marks: number;
  question_text: string;
  is_active: boolean;
  is_score_valid: boolean;
};

type QuestionAssignmentsProps = {
  mockTestId: string;
  isDraft: boolean;
  targetQuestionCount: number;
  assignedQuestions: AssignedQuestion[];
  questionsPath: string;
  returnTo?: string;
};

function SortBySubjectButton({ mockTestId }: { mockTestId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function sort() {
    if (!window.confirm("Are you sure you want to reorder all questions in this mock test by their subject's display order?")) return;
    setPending(true);
    const result = await sortAssignedQuestionsBySubjectOrder(mockTestId);
    if (!result.success) window.alert(result.message);
    setPending(false);
    router.refresh();
  }

  return (
    <button type="button" onClick={sort} disabled={pending} aria-busy={pending} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50">
      <PendingButtonContent pending={pending} pendingLabel="Sorting…">Sort by Subject Order</PendingButtonContent>
    </button>
  );
}

function RemoveAssignmentButton({ mockTestId, assignmentId, onRemoved }: { mockTestId: string; assignmentId: string; onRemoved?: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function removeAssignment() {
    if (!window.confirm("Remove this question from this mock test? It will no longer appear in this test. Student attempt history remains safe.")) return;
    setPending(true);
    setMessage("");
    const result = await removeAssignedQuestion(mockTestId, assignmentId);
    if (!result.success) {
      setMessage(result.message);
      setPending(false);
      return;
    }
    setPending(false);
    onRemoved?.();
    router.refresh();
  }

  return <div className="flex flex-col items-end"><button type="button" onClick={removeAssignment} disabled={pending} aria-busy={pending} className="rounded-lg px-2.5 py-1.5 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"><PendingButtonContent pending={pending} pendingLabel="Removing…">Remove</PendingButtonContent></button>{message && <p className="mt-1 max-w-48 text-right text-xs leading-5 text-red-700">{message}</p>}</div>;
}

function MoveButtons({ mockTestId, assignmentId, first, last }: { mockTestId: string; assignmentId: string; first: boolean; last: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function move(direction: -1 | 1) {
    setPending(true);
    const result = await moveAssignedQuestion(mockTestId, assignmentId, direction);
    if (!result.success) window.alert(result.message);
    setPending(false);
    router.refresh();
  }
  return <div className="mt-2 flex gap-1"><button type="button" title="Move up" disabled={pending || first} onClick={() => move(-1)} className="rounded border px-2 py-1 text-xs font-bold disabled:opacity-35">↑</button><button type="button" title="Move down" disabled={pending || last} onClick={() => move(1)} className="rounded border px-2 py-1 text-xs font-bold disabled:opacity-35">↓</button></div>;
}

export function QuestionAssignments({ mockTestId, isDraft, targetQuestionCount, assignedQuestions, questionsPath, returnTo }: QuestionAssignmentsProps) {
  const router = useRouter();
  const readyQuestionCount = assignedQuestions.filter((question) => question.is_active && question.is_score_valid).length;
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPending, setBulkPending] = useState(false);
  const [bulkError, setBulkError] = useState("");

  const visibleAssignments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return assignedQuestions
      .map((assignment, index) => ({ ...assignment, index }))
      .filter((assignment) => !query || assignment.question_text.toLocaleLowerCase().includes(query));
  }, [assignedQuestions, search]);

  const visibleAssignmentIds = useMemo(() => visibleAssignments.map((a) => a.id), [visibleAssignments]);
  const allVisibleSelected = visibleAssignmentIds.length > 0 && visibleAssignmentIds.every((id) => selectedIds.has(id));
  const someVisibleSelected = visibleAssignmentIds.some((id) => selectedIds.has(id));
  const selectAllCheckboxRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = someVisibleSelected && !allVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const id of visibleAssignmentIds) next.delete(id);
      } else {
        for (const id of visibleAssignmentIds) next.add(id);
      }
      return next;
    });
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const singleSelectedAssignment = useMemo(() => {
    if (selectedIds.size !== 1) return null;
    const [id] = Array.from(selectedIds);
    return assignedQuestions.find((a) => a.id === id) ?? null;
  }, [assignedQuestions, selectedIds]);

  const handleBulkRemove = async () => {
    const ids = Array.from(selectedIds);
    if (!window.confirm(`Remove ${ids.length} selected question${ids.length === 1 ? "" : "s"} from this mock test? It will no longer appear in this test.`)) return;
    setBulkPending(true);
    setBulkError("");
    const result = await bulkRemoveAssignedQuestions(mockTestId, ids);
    setBulkPending(false);
    if (!result.success) {
      setBulkError(result.message);
      return;
    }
    setSelectedIds(new Set());
    router.refresh();
  };

  const returnToQuery = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";

  return <section className="mt-8 overflow-hidden rounded-3xl border bg-white shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 sm:px-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-700">This mock test</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Questions</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">These questions belong to this mock test. Adding, editing, or removing them here does not change another mock test.</p>
      </div>
      <div className="flex flex-col items-end gap-3">
        <span className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700">{assignedQuestions.length} of {targetQuestionCount} assigned · {readyQuestionCount} ready</span>
        {assignedQuestions.length > 1 && <SortBySubjectButton mockTestId={mockTestId} />}
      </div>
    </div>

    {isDraft ? <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6 sm:p-7"><div><p className="text-sm font-black text-slate-950">Add an individual question</p><p className="mt-1 text-sm text-slate-600">Create it directly inside this mock test and it will be assigned here automatically.</p></div><Link href={`${questionsPath}/new${returnToQuery}`} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">+ Add question to this mock test</Link></div> : <div className="m-6 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm leading-6 text-sky-950"><span className="font-bold">Live Mock Test: </span>You can click <strong>Edit question</strong> on any row below to rectify errors, add missing diagram images, or enrich explanations. Test structure and question assignments remain locked.</div>}

    {assignedQuestions.length > 0 && <div className="border-b border-slate-100 px-6 py-5 sm:px-7"><label className="block max-w-xl text-sm font-bold text-slate-800">Search questions in this mock test<input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setSelectedIds(new Set()); }} placeholder="Type words from a question" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><p aria-live="polite" className="mt-2 text-xs text-slate-500">{visibleAssignments.length} of {assignedQuestions.length} question{assignedQuestions.length === 1 ? "" : "s"} shown.</p></div>}

    {bulkError && <div className="mx-6 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900"><p>{bulkError}</p></div>}

    {selectedIds.size > 0 && (
      <div className="sticky top-4 z-20 mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50/95 p-3.5 shadow-lg backdrop-blur sm:mx-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 text-xs font-black text-white">
            {selectedIds.size}
          </span>
          <span className="text-sm font-bold text-teal-950">
            {selectedIds.size} question{selectedIds.size === 1 ? "" : "s"} selected
          </span>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="text-xs font-semibold text-teal-800 underline hover:text-teal-950"
          >
            Deselect all
          </button>
          {!allVisibleSelected && visibleAssignments.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs font-semibold text-teal-800 underline hover:text-teal-950"
            >
              Select all visible ({visibleAssignments.length})
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {singleSelectedAssignment && (
            <Link
              href={`${questionsPath}/${singleSelectedAssignment.question_id}/edit${returnToQuery}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition"
            >
              <span>✏️</span> Edit question
            </Link>
          )}
          {isDraft && (
            <button
              type="button"
              onClick={handleBulkRemove}
              disabled={bulkPending}
              aria-busy={bulkPending}
              className="rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
            >
              <PendingButtonContent pending={bulkPending} pendingLabel="Removing…">
                Remove selected ({selectedIds.size})
              </PendingButtonContent>
            </button>
          )}
        </div>
      </div>
    )}

    {assignedQuestions.length === 0 ? <div className="p-7"><p className="rounded-2xl border border-dashed bg-slate-50 p-6 text-center text-sm leading-6 text-slate-600">No questions are assigned yet. Upload a file above or add an individual question before publishing.</p></div> : visibleAssignments.length === 0 ? <div className="p-7"><p className="rounded-2xl border border-dashed bg-slate-50 p-6 text-center text-sm leading-6 text-slate-600">No questions match your search. Try different words.</p></div> : <div className="overflow-x-auto"><table className="min-w-[820px] w-full text-left"><thead className="border-y border-slate-100 bg-white text-xs font-bold uppercase tracking-[0.1em] text-slate-500"><tr><th className="w-12 px-6 py-4"><div className="flex items-center"><input type="checkbox" checked={visibleAssignments.length > 0 && allVisibleSelected} ref={selectAllCheckboxRef} onChange={toggleSelectAll} disabled={visibleAssignments.length === 0} aria-label="Select all visible questions" className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer disabled:cursor-not-allowed" /></div></th><th className="px-6 py-4">Order</th><th className="px-6 py-4">Question</th><th className="px-6 py-4">Availability</th><th className="px-6 py-4">Scoring</th><th className="px-6 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleAssignments.map((assignment) => { const isSelected = selectedIds.has(assignment.id); return <tr key={assignment.id} className={`align-top transition-colors ${isSelected ? "bg-teal-50/60" : "hover:bg-slate-50"}`}><td className="w-12 px-6 py-5"><div className="flex items-center pt-1.5"><input type="checkbox" checked={isSelected} onChange={() => toggleSelectOne(assignment.id)} aria-label={`Select question: ${assignment.question_text.slice(0, 40)}`} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer" /></div></td><td className="px-6 py-5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-sm font-black text-slate-700">{assignment.question_order}</span>{isDraft && <MoveButtons mockTestId={mockTestId} assignmentId={assignment.id} first={assignment.index === 0} last={assignment.index === assignedQuestions.length - 1} />}</td><td className="min-w-[340px] max-w-xl px-6 py-5 text-sm font-semibold leading-6 text-slate-900"><FormattedQuestionText text={assignment.question_text} /></td><td className="px-6 py-5 text-sm"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${assignment.is_active && assignment.is_score_valid ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>{assignment.is_active && assignment.is_score_valid ? "Student ready" : assignment.is_active ? "Invalid scoring" : "Inactive"}</span>{!assignment.is_active && <p className="mt-2 max-w-40 text-xs leading-5 text-red-700">Edit this question before students can take the test.</p>}</td><td className="px-6 py-5 text-sm"><p className="font-bold text-slate-800">{assignment.marks} mark{assignment.marks === 1 ? "" : "s"}</p><p className="mt-1 text-xs text-slate-500">{assignment.negative_marks > 0 ? `-${assignment.negative_marks} for a wrong answer` : "No negative marking"}</p></td><td className="px-6 py-5 text-right"><Link href={`${questionsPath}/${assignment.question_id}/edit${returnToQuery}`} className="mb-2 inline-block rounded-lg px-2.5 py-1.5 text-sm font-bold text-teal-700 hover:bg-teal-50">Edit question</Link>{isDraft && <RemoveAssignmentButton mockTestId={mockTestId} assignmentId={assignment.id} onRemoved={() => setSelectedIds((prev) => { const next = new Set(prev); next.delete(assignment.id); return next; })} />}</td></tr>; })}</tbody></table></div>}
  </section>;
}
