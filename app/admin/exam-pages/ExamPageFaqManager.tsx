"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { SearchableSelect } from "@/components/admin/SearchableSelect";
import { SeoFields } from "@/components/admin/SeoFields";
import { formatExamHeading } from "@/lib/exam-catalog";
import { examUrl } from "@/lib/public-urls";
import {
  createExamPageFaq,
  deleteExamPageFaq,
  updateExamPageContent,
  updateExamPageFaq,
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

const PUBLIC_LINK_GROUPS = [
  {
    category: "Recruitment & Exam Notification Pages",
    items: [
      {
        title: "Telangana Police Constable Notification 2026",
        telugu: "తెలంగాణ పోలీస్ కానిస్టేబుల్ 7,112 పోస్టుల అధికారిక నోటిఫికేషన్",
        publishedDate: "14 Nov 2026",
        lastUpdated: "15 Nov 2026",
        description: "Complete 7,112 vacancies guide, cadre breakdown, salary scale, events standards, syllabus & free mock tests.",
        url: "https://varadhiprep.in/news/telangana-police-constable-notification-2026",
        tag: "Primary Article",
      },
      {
        title: "Short Shareable URL",
        telugu: null,
        publishedDate: "14 Nov 2026",
        lastUpdated: "15 Nov 2026",
        description: "Root 301 permanent redirect URL that immediately routes to the notification article.",
        url: "https://varadhiprep.in/telangana-police-constable-notification-2026",
        tag: "Short Redirect",
      },
      {
        title: "Dedicated Exam Catalogue Hub",
        telugu: null,
        publishedDate: "14 Nov 2026",
        lastUpdated: "15 Nov 2026",
        description: "Public exam curriculum landing page for Telangana Police Constable.",
        url: "https://varadhiprep.in/exams/telangana-police-constable",
        tag: "Exam Hub",
      },
      {
        title: "58 Free Mock Tests Portal",
        telugu: null,
        publishedDate: "14 Nov 2026",
        lastUpdated: "15 Nov 2026",
        description: "Full-length bilingual mock test series with 180-min timer and realistic 0.20 negative marking.",
        url: "https://varadhiprep.in/mock-tests/telangana/police-constable-free-mock-test",
        tag: "Mock Tests",
      },
      {
        title: "Official Notification PDF Mirror",
        telugu: null,
        publishedDate: "14 Nov 2026",
        lastUpdated: "15 Nov 2026",
        description: "Official 36-page TSLPRB gazette document (748 KB) permanently stored on local server.",
        url: "https://varadhiprep.in/docs/telangana-police-constable-notification-2026-official.pdf",
        tag: "Official PDF",
      },
    ],
  },
  {
    category: "Platform Information Pages",
    items: [
      {
        title: "Privacy Policy",
        telugu: null,
        publishedDate: "27 Aug 2026",
        lastUpdated: "27 Aug 2026",
        description: "Student data protection, test attempt analytics, and Cashfree payment security.",
        url: "https://varadhiprep.in/privacy-policy",
        tag: "Platform Info",
      },
      {
        title: "Terms and Conditions",
        telugu: null,
        publishedDate: "27 Aug 2026",
        lastUpdated: "27 Aug 2026",
        description: "Student usage terms, single-device access policy, and platform rules.",
        url: "https://varadhiprep.in/terms-and-conditions",
        tag: "Platform Info",
      },
      {
        title: "Refunds and Cancellations",
        telugu: null,
        publishedDate: "27 Aug 2026",
        lastUpdated: "27 Aug 2026",
        description: "Digital subscription pass policy, transaction handling, and payment support.",
        url: "https://varadhiprep.in/refunds-and-cancellations",
        tag: "Platform Info",
      },
    ],
  },
];

export function ExamPageFaqManager({ states, boards, exams, faqs }: { states: State[]; boards: Board[]; exams: Exam[]; faqs: Faq[] }) {
  const [activeTab, setActiveTab] = useState<"links" | "catalog">("links");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const [stateId, setStateId] = useState(states[0]?.id ?? "");
  const [boardId, setBoardId] = useState("");
  const [examId, setExamId] = useState("");
  const availableBoards = useMemo(() => boards.filter((board) => board.stateId === stateId), [boards, stateId]);
  const availableExams = useMemo(() => exams.filter((exam) => exam.boardId === boardId), [exams, boardId]);
  const selectedState = states.find((state) => state.id === stateId);
  const selected = exams.find((exam) => exam.id === examId);
  const examFaqs = faqs.filter((faq) => faq.exam_group_id === examId).sort((a, b) => a.display_order - b.display_order || a.question.localeCompare(b.question));

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedUrl(text);
      setTimeout(() => setCopiedUrl(null), 2500);
    }
  };

  return (
    <main className="space-y-8">
      {/* Varadhi Prep Public Pages Header */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 p-6 sm:p-9 text-white shadow-sm border border-teal-950">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-300">
              Varadhi Prep &bull; Public Site Management
            </p>
            <h1 className="font-display mt-2 text-3xl sm:text-4xl font-bold">Public pages</h1>
            <p className="mt-2 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-300">
              Find, copy, and view all public landing pages, recruitment notifications, and student links in one simple workspace.
            </p>
          </div>
        </div>

        {/* Simple Tab Switcher */}
        <div className="mt-7 flex flex-wrap gap-2 border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={() => setActiveTab("links")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "links"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-white/10 text-slate-200 hover:bg-white/15"
            }`}
          >
            <span>🔗 All Public Links ({PUBLIC_LINK_GROUPS.reduce((acc, g) => acc + g.items.length, 0)})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "catalog"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-white/10 text-slate-200 hover:bg-white/15"
            }`}
          >
            <span>📚 Exam Catalogue &amp; FAQs</span>
          </button>
        </div>
      </section>

      {/* Tab 1: All Public Links */}
      {activeTab === "links" && (
        <div className="space-y-8">
          {/* Top Page Overview Card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 border border-teal-200">
                  <span className="h-2 w-2 rounded-full bg-teal-600 inline-block" />
                  Active Notification Page
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-950 mt-2">
                  Telangana Police Constable Notification 2026
                </h2>
                <p lang="te" className="font-telugu text-sm sm:text-base text-slate-700 mt-1">
                  తెలంగాణ పోలీస్ కానిస్టేబుల్ 7,112 పోస్టుల అధికారిక నోటిఫికేషన్
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600 self-start sm:self-auto bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-500 font-semibold block text-[11px] uppercase">Published</span>
                  <strong className="text-slate-900 font-bold">14 Nov 2026</strong>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-slate-500 font-semibold block text-[11px] uppercase">Last Updated</span>
                  <strong className="text-slate-900 font-bold">15 Nov 2026</strong>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-slate-600">
              Detailed recruitment breakdown covering 7,112 posts, Post Codes 21–28, pay scale (₹24,280–₹72,850), PMT/PET slabs, syllabus analysis, and 58 bilingual mock tests.
            </p>
          </section>

          {/* Links Groups */}
          {PUBLIC_LINK_GROUPS.map((group, groupIdx) => (
            <section key={groupIdx} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black uppercase tracking-[0.14em] text-teal-800">
                  {group.category}
                </h3>
                {copiedUrl && (
                  <span className="text-xs font-bold text-emerald-700 animate-fade-in">
                    ✓ Link copied to clipboard!
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {group.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 hover:border-slate-300 hover:shadow-xs transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-800 border border-teal-200/70">
                          {item.tag}
                        </span>
                        <h4 className="font-bold text-slate-950 text-sm sm:text-base">{item.title}</h4>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>Published: <strong className="text-slate-700 font-semibold">{item.publishedDate}</strong></span>
                        <span>&bull;</span>
                        <span>Updated: <strong className="text-slate-700 font-semibold">{item.lastUpdated}</strong></span>
                      </div>

                      <div className="mt-2">
                        <code className="text-xs font-mono text-teal-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 block break-all font-semibold select-all">
                          {item.url}
                        </code>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start md:self-center pt-2 md:pt-0">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.url)}
                        className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition shadow-2xs"
                        title="Copy URL"
                      >
                        {copiedUrl === item.url ? "Copied! ✓" : "Copy Link"}
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-slate-950 text-white hover:bg-slate-800 px-3.5 py-2 text-xs font-bold transition shadow-xs"
                      >
                        Open Live ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Tab 2: Existing Exam Catalogue & FAQ Editor */}
      {activeTab === "catalog" && (
        <div className="space-y-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="font-display text-2xl font-bold text-slate-950">Find an exam page</h2>
            <p className="mt-1 text-sm text-slate-600">Choose from left to right. Only the selected Exam will be changed.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <label className="block text-sm font-bold">
                1. State / catalogue
                <SearchableSelect
                  value={stateId}
                  onChange={(value) => {
                    setStateId(value);
                    setBoardId("");
                    setExamId("");
                  }}
                  options={states.map((state) => ({ value: state.id, label: `${state.code} · ${state.name}` }))}
                  placeholder="Search a state"
                />
              </label>
              <label className="block text-sm font-bold">
                2. Recruiting Board
                <SearchableSelect
                  value={boardId}
                  onChange={(value) => {
                    setBoardId(value);
                    setExamId("");
                  }}
                  options={availableBoards.map((board) => ({ value: board.id, label: board.name }))}
                  placeholder="Search a Recruiting Board"
                  disabled={!stateId}
                  emptyMessage="No Recruiting Boards in this state."
                />
              </label>
              <label className="block text-sm font-bold">
                3. Exam
                <SearchableSelect
                  value={examId}
                  onChange={setExamId}
                  options={availableExams.map((exam) => ({ value: exam.id, label: exam.name }))}
                  placeholder="Search an Exam"
                  disabled={!boardId}
                  emptyMessage="No Exams under this Recruiting Board."
                />
              </label>
            </div>
          </section>

          {selected && selectedState ? (
            <div className="space-y-8">
              <ExamPageContentForm key={`content-${selected.id}`} exam={selected} state={selectedState} />
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Common Questions for</p>
                <h2 className="font-display mt-2 text-3xl font-bold text-slate-950">{selected.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  These appear in the public <span className="font-semibold">About {selected.name} mock tests</span> section and its FAQ search data.
                </p>
                <div className="mt-7">
                  <h3 className="font-display text-xl font-bold text-slate-950">Existing student questions</h3>
                  <p className="mt-1 text-sm text-slate-600">Edit, reorder, or remove questions for this Exam only.</p>
                  {standardQuestions(selected.name).map((faq) => {
                    const saved = examFaqs.find((item) => item.display_order === faq.display_order);
                    return saved ? (
                      <FaqForm key={saved.id} examId={selected.id} faq={saved} />
                    ) : (
                      <FaqForm key={faq.question} examId={selected.id} initial={faq} />
                    );
                  })}
                  {examFaqs
                    .filter((faq) => faq.display_order >= 3)
                    .map((faq) => (
                      <FaqForm key={faq.id} examId={selected.id} faq={faq} />
                    ))}
                </div>
                <div className="mt-8">
                  <h3 className="font-display text-xl font-bold text-slate-950">Add another question</h3>
                  <FaqForm
                    examId={selected.id}
                    initial={{
                      question: "",
                      answer: "",
                      display_order: Math.max(3, ...examFaqs.map((faq) => faq.display_order + 1)),
                    }}
                  />
                </div>
              </section>
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              Choose State, Recruiting Board, and Exam to edit its complete public page.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
