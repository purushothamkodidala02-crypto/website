"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FormattedQuestionText } from "@/components/questions/FormattedQuestionText";
import { PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import { moveAssignedQuestion, removeAssignedQuestion } from "./question-actions";

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
};

function RemoveAssignmentButton({ mockTestId, assignmentId }: { mockTestId: string; assignmentId: string }) {
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

export function QuestionAssignments({ mockTestId, isDraft, targetQuestionCount, assignedQuestions, questionsPath }: QuestionAssignmentsProps) {
  const readyQuestionCount = assignedQuestions.filter((question) => question.is_active && question.is_score_valid).length;
  const [search, setSearch] = useState("");
  const visibleAssignments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return assignedQuestions
      .map((assignment, index) => ({ ...assignment, index }))
      .filter((assignment) => !query || assignment.question_text.toLocaleLowerCase().includes(query));
  }, [assignedQuestions, search]);

  return <section className="mt-8 overflow-hidden rounded-3xl border bg-white shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 sm:px-7">
      <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-700">This mock test</p><h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Questions</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">These questions belong to this mock test. Adding, editing, or removing them here does not change another mock test.</p></div>
      <span className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700">{assignedQuestions.length} of {targetQuestionCount} assigned · {readyQuestionCount} ready</span>
    </div>

    {isDraft ? <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6 sm:p-7"><div><p className="text-sm font-black text-slate-950">Add an individual question</p><p className="mt-1 text-sm text-slate-600">Create it directly inside this mock test and it will be assigned here automatically.</p></div><Link href={`${questionsPath}/new`} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">+ Add question to this mock test</Link></div> : <div className="m-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">This mock test is published or archived, so its questions are locked.</div>}

    {assignedQuestions.length > 0 && <div className="border-b border-slate-100 px-6 py-5 sm:px-7"><label className="block max-w-xl text-sm font-bold text-slate-800">Search questions in this mock test<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Type words from a question" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><p aria-live="polite" className="mt-2 text-xs text-slate-500">{visibleAssignments.length} of {assignedQuestions.length} question{assignedQuestions.length === 1 ? "" : "s"} shown.</p></div>}
    {assignedQuestions.length === 0 ? <div className="p-7"><p className="rounded-2xl border border-dashed bg-slate-50 p-6 text-center text-sm leading-6 text-slate-600">No questions are assigned yet. Upload a file above or add an individual question before publishing.</p></div> : visibleAssignments.length === 0 ? <div className="p-7"><p className="rounded-2xl border border-dashed bg-slate-50 p-6 text-center text-sm leading-6 text-slate-600">No questions match your search. Try different words.</p></div> : <div className="overflow-x-auto"><table className="min-w-[820px] w-full text-left"><thead className="border-y border-slate-100 bg-white text-xs font-bold uppercase tracking-[0.1em] text-slate-500"><tr><th className="px-6 py-4">Order</th><th className="px-6 py-4">Question</th><th className="px-6 py-4">Availability</th><th className="px-6 py-4">Scoring</th>{isDraft && <th className="px-6 py-4 text-right">Manage</th>}</tr></thead><tbody className="divide-y divide-slate-100">{visibleAssignments.map((assignment) => <tr key={assignment.id} className="align-top hover:bg-slate-50"><td className="px-6 py-5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-sm font-black text-slate-700">{assignment.question_order}</span>{isDraft && <MoveButtons mockTestId={mockTestId} assignmentId={assignment.id} first={assignment.index === 0} last={assignment.index === assignedQuestions.length - 1} />}</td><td className="max-w-xl px-6 py-5 text-sm font-semibold leading-6 text-slate-900"><FormattedQuestionText text={assignment.question_text} /></td><td className="px-6 py-5 text-sm"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${assignment.is_active && assignment.is_score_valid ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>{assignment.is_active && assignment.is_score_valid ? "Student ready" : assignment.is_active ? "Invalid scoring" : "Inactive"}</span>{!assignment.is_active && <p className="mt-2 max-w-40 text-xs leading-5 text-red-700">Edit this question before students can take the test.</p>}</td><td className="px-6 py-5 text-sm"><p className="font-bold text-slate-800">{assignment.marks} mark{assignment.marks === 1 ? "" : "s"}</p><p className="mt-1 text-xs text-slate-500">-{assignment.negative_marks} negative</p></td>{isDraft && <td className="px-6 py-5"><Link href={`${questionsPath}/${assignment.question_id}/edit`} className="mb-2 inline-block rounded-lg px-2.5 py-1.5 text-sm font-bold text-teal-700 hover:bg-teal-50">Edit question</Link><RemoveAssignmentButton mockTestId={mockTestId} assignmentId={assignment.id} /></td>}</tr>)}</tbody></table></div>}
  </section>;
}
