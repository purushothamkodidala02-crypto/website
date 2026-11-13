"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { SearchableSelect } from "@/components/admin/SearchableSelect";
import { SeoFields } from "@/components/admin/SeoFields";
import { formatExamHeading } from "@/lib/exam-catalog";
import {
  DEFAULT_APPSC_GENERAL_STUDIES_SYLLABUS,
  DEFAULT_TELANGANA_POLICE_SYLLABUS,
  SYLLABUS_FAQ_KEY,
} from "@/lib/exam-syllabus";
import { examUrl, syllabusUrl } from "@/lib/public-urls";
import {
  createExamPageFaq,
  deleteExamPageFaq,
  updateExamPageContent,
  updateExamPageFaq,
  updateExamPageSyllabus,
  type ExamPageContentActionState,
  type FaqActionState,
} from "./actions";

type State = { id: string; name: string; code: string; slug: string };
type Board = { id: string; stateId: string; name: string };
type Exam = {
  id: string;
  boardId: string;
  name: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};
type Faq = { id: string; exam_group_id: string; question: string; answer: string; display_order: number };
type NewFaq = Pick<Faq, "question" | "answer" | "display_order">;

const initialFaqState: FaqActionState = { success: false, message: "" };
const initialContentState: ExamPageContentActionState = { success: false, message: "" };

function Message({ state }: { state: { success: boolean; message: string } }) {
  return state.message ? (
    <p aria-live="polite" className={`mt-3 text-sm font-semibold ${state.success ? "text-emerald-700" : "text-red-700"}`}>
      {state.message}
    </p>
  ) : null;
}

function ExamPageContentForm({ exam, state }: { exam: Exam; state: State }) {
  const [result, formAction, pending] = useActionState(updateExamPageContent, initialContentState);
  const publicPath = examUrl(state.slug, exam.slug);

  return (
    <section className="overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b bg-gradient-to-r from-teal-50 to-white px-6 py-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Main student content</p>
          <h2 className="font-display mt-2 text-2xl">{exam.name} public page</h2>
          <p className="mt-1 text-sm text-slate-600">Edit the introduction and Google appearance in one place.</p>
        </div>
        <Link href={publicPath} target="_blank" className="rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-sm font-black text-teal-800 hover:bg-teal-50">
          Open student page ↗
        </Link>
      </div>
      <form action={formAction} className="space-y-5 p-6">
        <input type="hidden" name="exam_group_id" value={exam.id} />
        <label className="block text-sm font-bold">
          Student introduction
          <textarea name="description" rows={5} maxLength={3000} defaultValue={exam.description ?? ""} placeholder={`Explain what students can practise for ${exam.name}.`} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal leading-7" />
          <span className="mt-1 block text-xs font-normal text-slate-500">Shown below “{formatExamHeading(exam.name)}” on the public exam landing page.</span>
        </label>
        <SeoFields title={exam.seoTitle} description={exam.seoDescription} titlePlaceholder={formatExamHeading(exam.name)} descriptionPlaceholder={`Practise ${formatExamHeading(exam.name).toLowerCase()}, papers, and detailed solutions on Varadhi Prep.`} />
        <button disabled={pending} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50">
          {pending ? "Saving public page…" : "Save public page content"}
        </button>
        <Message state={result} />
      </form>
    </section>
  );
}

function ExamPageSyllabusForm({
  exam,
  state,
  initialSyllabus,
}: {
  exam: Exam;
  state: State;
  initialSyllabus: string;
}) {
  const [result, formAction, pending] = useActionState(updateExamPageSyllabus, initialContentState);
  const [syllabusText, setSyllabusText] = useState(initialSyllabus);
  const syllabusPath = syllabusUrl(state.slug, exam.slug);

  const loadDefaultAppsc = () => {
    setSyllabusText(DEFAULT_APPSC_GENERAL_STUDIES_SYLLABUS);
  };

  const loadDefaultTgprb = () => {
    setSyllabusText(DEFAULT_TELANGANA_POLICE_SYLLABUS);
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-teal-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b bg-gradient-to-r from-teal-50 to-white px-6 py-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Official Government Notification</p>
          <h2 className="font-display mt-2 text-2xl">{exam.name} Official Syllabus</h2>
          <p className="mt-1 text-sm text-slate-600">
            Paste or update the official syllabus released by the government commission. It powers the dedicated syllabus page.
          </p>
        </div>
        <Link
          href={syllabusPath}
          target="_blank"
          className="rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-sm font-black text-teal-800 hover:bg-teal-50"
        >
          View student syllabus page ↗
        </Link>
      </div>

      <form action={formAction} className="space-y-5 p-6">
        <input type="hidden" name="exam_group_id" value={exam.id} />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="block text-sm font-bold text-slate-900">
            Official Government Syllabus Units
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadDefaultAppsc}
              className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 transition"
            >
              Load APPSC 10-Unit Template
            </button>
            <button
              type="button"
              onClick={loadDefaultTgprb}
              className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 transition"
            >
              Load TGPRB Police 8-Unit Template
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Format supported: Numbered units as released in official gazette/notifications (e.g. <code>01 . Major Current Events...</code>, <code>02 . General Science...</code>). The student syllabus page will automatically parse this into distinct, beautifully typeset curriculum units with focus tags.
        </p>

        <textarea
          name="syllabus_text"
          rows={12}
          value={syllabusText}
          onChange={(e) => setSyllabusText(e.target.value)}
          placeholder={`01 . Major Current Events and Issues pertaining to International, National and State of Andhra Pradesh.\n02 . General Science and its applications to the day to day life Contemporary developments in Science & Technology...\n03 . History of India – emphasis will be on broad general understanding...`}
          className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-4 font-mono text-xs leading-relaxed focus:bg-white focus:outline-teal-600 text-slate-900"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-teal-800 hover:bg-teal-900 px-5 py-3 text-sm font-black text-white transition disabled:opacity-50"
          >
            {pending ? "Saving syllabus…" : "Save Official Government Syllabus"}
          </button>
          {syllabusText && (
            <button
              type="button"
              onClick={() => setSyllabusText("")}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 transition"
            >
              Clear (Reset to default)
            </button>
          )}
        </div>
        <Message state={result} />
      </form>
    </section>
  );
}

function FaqForm({ examId, faq, initial }: { examId: string; faq?: Faq; initial?: NewFaq }) {
  const action = faq ? updateExamPageFaq : createExamPageFaq;
  const [state, formAction, pending] = useActionState(action, initialFaqState);
  return (
    <form action={formAction} className={faq ? "border-t border-slate-200 pt-6" : "mt-6 rounded-2xl border border-teal-200 bg-teal-50/60 p-5"}>
      <input type="hidden" name="exam_group_id" value={examId} />
      {faq && <input type="hidden" name="faq_id" value={faq.id} />}
      <div className="grid gap-4 lg:grid-cols-[1fr_8rem]">
        <label className="block text-sm font-bold">
          Question
          <textarea name="question" rows={2} required minLength={5} maxLength={300} defaultValue={faq?.question ?? initial?.question ?? ""} placeholder="Example: Can I review answers after the mock test?" className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal" />
        </label>
        <label className="block text-sm font-bold">
          Display order
          <input name="display_order" type="number" min="0" step="1" required defaultValue={faq?.display_order ?? initial?.display_order ?? 0} className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal" />
          <span className="mt-1 block text-xs font-normal text-slate-500">Sorting only; students do not see this number.</span>
        </label>
      </div>
      <label className="mt-4 block text-sm font-bold">
        Answer
        <textarea name="answer" rows={5} required minLength={10} maxLength={3000} defaultValue={faq?.answer ?? initial?.answer ?? ""} placeholder="Write the full student-facing answer." className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal" />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">{pending ? "Saving…" : faq ? "Save question" : "Add question"}</button>
        {faq && <button formAction={deleteExamPageFaq} type="submit" name="faq_id" value={faq.id} className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-black text-red-700 hover:bg-red-50">Remove</button>}
      </div>
      <Message state={state} />
    </form>
  );
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
  const selectedState = states.find((state) => state.id === stateId);
  const selected = exams.find((exam) => exam.id === examId);

  const syllabusFaqs = useMemo(
    () =>
      faqs
        .filter((faq) => faq.exam_group_id === examId && faq.question.startsWith(SYLLABUS_FAQ_KEY))
        .sort((a, b) => a.display_order - b.display_order),
    [faqs, examId],
  );
  const initialSyllabus = useMemo(() => syllabusFaqs.map((f) => f.answer).join(""), [syllabusFaqs]);

  const examFaqs = useMemo(
    () =>
      faqs
        .filter((faq) => faq.exam_group_id === examId && !faq.question.startsWith(SYLLABUS_FAQ_KEY))
        .sort((a, b) => a.display_order - b.display_order || a.question.localeCompare(b.question)),
    [faqs, examId],
  );

  return (
    <main>
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 p-7 text-white shadow-xl shadow-teal-950/15 sm:p-9">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-teal-200">Student page editor</p>
        <h1 className="font-display mt-3 text-4xl">Public exam pages</h1>
        <p className="mt-3 max-w-3xl leading-7 text-slate-300">
          Edit the student introduction, official government syllabus curriculum, Google search appearance, and Common Questions in one workspace.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl">Find an exam page</h2>
        <p className="mt-1 text-sm text-slate-600">Choose from left to right. Only the selected Exam will be changed.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="block text-sm font-bold">1. State / catalogue<SearchableSelect value={stateId} onChange={(value) => { setStateId(value); setBoardId(""); setExamId(""); }} options={states.map((state) => ({ value: state.id, label: `${state.code} · ${state.name}` }))} placeholder="Search a state" /></label>
          <label className="block text-sm font-bold">2. Recruiting Board<SearchableSelect value={boardId} onChange={(value) => { setBoardId(value); setExamId(""); }} options={availableBoards.map((board) => ({ value: board.id, label: board.name }))} placeholder="Search a Recruiting Board" disabled={!stateId} emptyMessage="No Recruiting Boards in this state." /></label>
          <label className="block text-sm font-bold">3. Exam<SearchableSelect value={examId} onChange={setExamId} options={availableExams.map((exam) => ({ value: exam.id, label: exam.name }))} placeholder="Search an Exam" disabled={!boardId} emptyMessage="No Exams under this Recruiting Board." /></label>
        </div>
      </section>

      {selected && selectedState ? (
        <div className="mt-8 space-y-8">
          <ExamPageContentForm key={`content-${selected.id}`} exam={selected} state={selectedState} />
          <ExamPageSyllabusForm key={`syllabus-${selected.id}`} exam={selected} state={selectedState} initialSyllabus={initialSyllabus} />
          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Common Questions for</p>
            <h2 className="font-display mt-2 text-3xl">{selected.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">These appear in the public <span className="font-semibold">About {selected.name} mock tests</span> section and its FAQ search data.</p>
            <div className="mt-7">
              <h3 className="font-display text-xl">Existing student questions</h3>
              <p className="mt-1 text-sm text-slate-600">Edit, reorder, or remove questions for this Exam only.</p>
              {standardQuestions(selected.name).map((faq) => {
                const saved = examFaqs.find((item) => item.display_order === faq.display_order);
                return saved ? <FaqForm key={saved.id} examId={selected.id} faq={saved} /> : <FaqForm key={faq.question} examId={selected.id} initial={faq} />;
              })}
              {examFaqs.filter((faq) => faq.display_order >= 3).map((faq) => <FaqForm key={faq.id} examId={selected.id} faq={faq} />)}
            </div>
            <div className="mt-8">
              <h3 className="font-display text-xl">Add another question</h3>
              <FaqForm examId={selected.id} initial={{ question: "", answer: "", display_order: Math.max(3, ...examFaqs.map((faq) => faq.display_order + 1)) }} />
            </div>
          </section>
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">Choose State, Recruiting Board, and Exam to edit its complete public page.</p>
      )}
    </main>
  );
}
