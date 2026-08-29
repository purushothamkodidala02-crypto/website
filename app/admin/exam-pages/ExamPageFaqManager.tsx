"use client";

import { useActionState, useMemo, useState } from "react";
import { SearchableSelect } from "@/components/admin/SearchableSelect";
import { createExamPageFaq, deleteExamPageFaq, updateExamPageFaq, type FaqActionState } from "./actions";

type State = { id: string; name: string; code: string };
type Board = { id: string; stateId: string; name: string };
type Exam = { id: string; boardId: string; name: string; slug: string };
type Faq = { id: string; exam_group_id: string; question: string; answer: string; display_order: number };
type NewFaq = Pick<Faq, "question" | "answer" | "display_order">;
const initialState: FaqActionState = { success: false, message: "" };

function Message({ state }: { state: FaqActionState }) {
  return state.message ? <p aria-live="polite" className={`mt-3 text-sm font-semibold ${state.success ? "text-emerald-700" : "text-red-700"}`}>{state.message}</p> : null;
}

function FaqForm({ examId, faq, initial }: { examId: string; faq?: Faq; initial?: NewFaq }) {
  const action = faq ? updateExamPageFaq : createExamPageFaq;
  const [state, formAction, pending] = useActionState(action, initialState);
  return <form action={formAction} className={faq ? "border-t border-slate-200 pt-6" : "mt-6 rounded-2xl border border-teal-200 bg-teal-50/60 p-5"}>
    <input type="hidden" name="exam_group_id" value={examId} />
    {faq && <input type="hidden" name="faq_id" value={faq.id} />}
    <div className="grid gap-4 lg:grid-cols-[1fr_8rem]"><label className="block text-sm font-bold">Question<textarea name="question" rows={2} required minLength={5} maxLength={300} defaultValue={faq?.question ?? initial?.question ?? ""} placeholder="Example: Can I review answers after the mock test?" className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal" /></label><label className="block text-sm font-bold">Display order<input name="display_order" type="number" min="0" step="1" required defaultValue={faq?.display_order ?? initial?.display_order ?? 0} className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal" /></label></div>
    <label className="mt-4 block text-sm font-bold">Answer<textarea name="answer" rows={5} required minLength={10} maxLength={3000} defaultValue={faq?.answer ?? initial?.answer ?? ""} placeholder="Write the full student-facing answer." className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal" /></label>
    <div className="mt-4 flex flex-wrap items-center gap-3"><button type="submit" disabled={pending} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">{pending ? "Saving…" : faq ? "Save question" : "Add question"}</button>{faq && <button formAction={deleteExamPageFaq} type="submit" name="faq_id" value={faq.id} className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-black text-red-700 hover:bg-red-50">Remove</button>}</div><Message state={state} />
  </form>;
}

function standardQuestions(examName: string): NewFaq[] {
  return [
    { question: `Where can I take ${examName} mock tests?`, answer: `Choose a paper on the ${examName} page, open an available test, and start practising on Varadhi Prep.`, display_order: 0 },
    { question: `How many ${examName} mock tests are available?`, answer: "Published mock tests appear on the exam page automatically. More tests will be added as preparation content is released.", display_order: 1 },
    { question: `Can I review my ${examName} answers?`, answer: "Yes. After submitting a test, students can review their score, selected answers, correct answers, and available explanations from the student dashboard.", display_order: 2 },
  ];
}

export function ExamPageFaqManager({ states, boards, exams, faqs }: { states: State[]; boards: Board[]; exams: Exam[]; faqs: Faq[] }) {
  const [stateId, setStateId] = useState(states[0]?.id ?? "");
  const [boardId, setBoardId] = useState("");
  const [examId, setExamId] = useState("");
  const availableBoards = useMemo(() => boards.filter((board) => board.stateId === stateId), [boards, stateId]);
  const availableExams = useMemo(() => exams.filter((exam) => exam.boardId === boardId), [exams, boardId]);
  const selected = exams.find((exam) => exam.id === examId);
  const examFaqs = faqs.filter((faq) => faq.exam_group_id === examId).sort((a, b) => a.display_order - b.display_order || a.question.localeCompare(b.question));
  return <main><section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 p-7 text-white shadow-xl shadow-teal-950/15 sm:p-9"><p className="text-xs font-black uppercase tracking-[0.15em] text-teal-200">Student page editor</p><h1 className="font-display mt-3 text-4xl">Exam pages</h1><p className="mt-3 max-w-3xl leading-7 text-slate-300">Choose an exam, then add, edit, remove, or order its Common Questions. These questions and answers appear automatically on that student exam page.</p></section>
    <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm"><h2 className="font-display text-2xl">Find an exam page</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><label className="block text-sm font-bold">1. State / catalogue<SearchableSelect value={stateId} onChange={(value) => { setStateId(value); setBoardId(""); setExamId(""); }} options={states.map((state) => ({ value: state.id, label: `${state.code} · ${state.name}` }))} placeholder="Search a state" /></label><label className="block text-sm font-bold">2. Recruiting board<SearchableSelect value={boardId} onChange={(value) => { setBoardId(value); setExamId(""); }} options={availableBoards.map((board) => ({ value: board.id, label: board.name }))} placeholder="Search a board" disabled={!stateId} emptyMessage="No boards in this state." /></label><label className="block text-sm font-bold">3. Exam<SearchableSelect value={examId} onChange={setExamId} options={availableExams.map((exam) => ({ value: exam.id, label: exam.name }))} placeholder="Search an exam" disabled={!boardId} emptyMessage="No exams in this board." /></label></div></section>
    {selected ? <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Common questions for</p><h2 className="font-display mt-2 text-3xl">{selected.name}</h2><p className="mt-2 text-sm leading-6 text-slate-600">Changes appear on the public <span className="font-semibold">About {selected.name} mock tests</span> section.</p><div className="mt-7"><h3 className="font-display text-xl">Existing student questions</h3><p className="mt-1 text-sm text-slate-600">Edit a question and save it to take control of the student page.</p>{standardQuestions(selected.name).map((faq) => { const saved = examFaqs.find((item) => item.display_order === faq.display_order); return saved ? <FaqForm key={saved.id} examId={selected.id} faq={saved} /> : <FaqForm key={faq.question} examId={selected.id} initial={faq} />; })}{examFaqs.filter((faq) => faq.display_order >= 3).map((faq) => <FaqForm key={faq.id} examId={selected.id} faq={faq} />)}</div><div className="mt-8"><h3 className="font-display text-xl">Add another question</h3><FaqForm examId={selected.id} initial={{ question: "", answer: "", display_order: Math.max(3, ...examFaqs.map((faq) => faq.display_order + 1)) }} /></div></section> : <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">Choose State, Recruiting board, and Exam to edit its page questions.</p>}
  </main>;
}
