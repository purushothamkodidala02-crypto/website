"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { SearchableSelect } from "@/components/admin/SearchableSelect";
import { SeoFields } from "@/components/admin/SeoFields";
import { formatExamHeading } from "@/lib/exam-catalog";
import { examUrl } from "@/lib/public-urls";
import {
  createExamPageFaq,
  createPrimaryExamPage,
  deleteExamPageFaq,
  deletePrimaryExamPage,
  updateExamPageContent,
  updateExamPageFaq,
  type ExamPageContentActionState,
  type FaqActionState,
  type PrimaryPageActionState,
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

export type PrimaryPage = {
  id: string;
  title: string;
  teluguTitle: string;
  state: string;
  status: "live" | "upcoming";
  statusCode: string;
  publishedDate: string;
  lastUpdated: string;
  url: string;
  vacancies: string;
  description: string;
  highlights: string[];
};

const initialFaqState: FaqActionState = { success: false, message: "" };
const initialContentState: ExamPageContentActionState = { success: false, message: "" };
const initialPrimaryPageState: PrimaryPageActionState = { success: false, message: "" };

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
    <section className="overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-teal-50/70 to-white px-6 py-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Main student content</p>
          <h2 className="font-display mt-1.5 text-2xl font-bold text-slate-950">{exam.name} public page</h2>
          <p className="mt-1 text-sm text-slate-600">Edit the introduction and Google appearance in one place.</p>
        </div>
        <Link href={publicPath} target="_blank" className="rounded-xl border border-teal-200 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-teal-800 hover:bg-teal-50 shadow-2xs">
          Open student page ↗
        </Link>
      </div>
      <form action={formAction} className="space-y-5 p-6">
        <input type="hidden" name="exam_group_id" value={exam.id} />
        <label className="block text-sm font-bold text-slate-900">
          Student introduction
          <textarea name="description" rows={5} maxLength={3000} defaultValue={exam.description ?? ""} placeholder={`Explain what students can practise for ${exam.name}.`} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal leading-7 text-slate-800" />
          <span className="mt-1 block text-xs font-normal text-slate-500">Shown below “{formatExamHeading(exam.name)}” on the public exam landing page.</span>
        </label>
        <SeoFields title={exam.seoTitle} description={exam.seoDescription} titlePlaceholder={formatExamHeading(exam.name)} descriptionPlaceholder={`Practise ${formatExamHeading(exam.name).toLowerCase()}, papers, and detailed solutions on Varadhi Prep.`} />
        <button disabled={pending} className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 shadow-xs">
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
        <label className="block text-sm font-bold text-slate-900">
          Question
          <textarea name="question" rows={2} required minLength={5} maxLength={300} defaultValue={faq?.question ?? initial?.question ?? ""} placeholder="Example: Can I review answers after the mock test?" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal text-slate-800" />
        </label>
        <label className="block text-sm font-bold text-slate-900">
          Display order
          <input name="display_order" type="number" min="0" step="1" required defaultValue={faq?.display_order ?? initial?.display_order ?? 0} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal text-slate-800" />
          <span className="mt-1 block text-xs font-normal text-slate-500">Sorting only; students do not see this number.</span>
        </label>
      </div>
      <label className="mt-4 block text-sm font-bold text-slate-900">
        Answer
        <textarea name="answer" rows={5} required minLength={10} maxLength={3000} defaultValue={faq?.answer ?? initial?.answer ?? ""} placeholder="Write the full student-facing answer." className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal text-slate-800" />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-xl bg-slate-950 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 shadow-xs">{pending ? "Saving…" : faq ? "Save question" : "Add question"}</button>
        {faq && <button formAction={deleteExamPageFaq} type="submit" name="faq_id" value={faq.id} className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-red-700 hover:bg-red-50">Remove</button>}
      </div>
      <Message state={state} />
    </form>
  );
}

function UploadPrimaryPageForm({ onCancel }: { onCancel: () => void }) {
  const [state, formAction, pending] = useActionState(createPrimaryExamPage, initialPrimaryPageState);

  return (
    <form action={formAction} className="rounded-2xl border-2 border-teal-300 bg-teal-50/70 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-teal-200 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-950">Upload / Add Recruitment Link</h3>
          <p className="text-xs text-slate-600">Register a public recruitment notification URL for display and quick student tracking.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-bold text-slate-900 sm:col-span-2">
          Notification Link URL *
          <input
            name="url"
            type="text"
            required
            placeholder="https://varadhiprep.in/news/ap-endowment-officer-notification-2026"
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900"
          />
          <span className="mt-1 block text-[11px] font-normal text-slate-500">
            Absolute URL (https://varadhiprep.in/...) or root path (/news/...)
          </span>
        </label>

        <label className="block text-xs font-bold text-slate-900">
          Official Title (English) *
          <input
            name="title"
            type="text"
            required
            placeholder="Andhra Pradesh Police Constable Notification 2026"
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900"
          />
        </label>

        <label className="block text-xs font-bold text-slate-900">
          Regional Title (Telugu Script)
          <input
            name="telugu_title"
            type="text"
            placeholder="ఆంధ్రప్రదేశ్ పోలీస్ కానిస్టేబుల్ రిక్రూట్‌మెంట్ నోటిఫికేషన్"
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-telugu"
          />
        </label>

        <label className="block text-xs font-bold text-slate-900">
          State
          <select
            name="state"
            defaultValue="Andhra Pradesh"
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-semibold"
          >
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Telangana">Telangana</option>
            <option value="Central / National">Central / National</option>
          </select>
        </label>

        <label className="block text-xs font-bold text-slate-900">
          Status
          <select
            name="status"
            defaultValue="live"
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-semibold"
          >
            <option value="live">Live (200 OK)</option>
            <option value="upcoming">Upcoming Pipeline</option>
          </select>
        </label>

        <label className="block text-xs font-bold text-slate-900">
          Vacancies / Category Badge
          <input
            name="vacancies"
            type="text"
            placeholder="6,100+ Posts"
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900"
          />
        </label>

        <label className="block text-xs font-bold text-slate-900">
          Feature Highlights (comma separated)
          <input
            name="highlights"
            type="text"
            placeholder="APSLPRB Cadre, Physical Standards, 58 Mocks"
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900"
          />
        </label>

        <label className="block text-xs font-bold text-slate-900 sm:col-span-2">
          Description
          <textarea
            name="description"
            rows={3}
            placeholder="Official recruitment breakdown for Civil & APSP cadres, PMT/PET standards, marks weightage, and online mock tests."
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900"
          />
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 shadow-xs"
        >
          {pending ? "Uploading Link…" : "Upload Link"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
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

const FALLBACK_PAGES: PrimaryPage[] = [
  {
    id: "ts-police-constable-2026",
    title: "Telangana Police Constable Notification 2026",
    teluguTitle: "తెలంగాణ పోలీస్ కానిస్టేబుల్ 7,112 పోస్టుల అధికారిక నోటిఫికేషన్",
    state: "Telangana",
    status: "live",
    statusCode: "200 OK",
    publishedDate: "14 Nov 2026",
    lastUpdated: "15 Nov 2026",
    url: "https://varadhiprep.in/news/telangana-police-constable-notification-2026",
    vacancies: "7,112 Posts",
    description: "Official recruitment breakdown for Post Codes 21–28, revised pay scale (₹24,280–₹72,850), 100-mark PMT/PET events, complete syllabus weightage, and 58 bilingual mock tests.",
    highlights: ["Post Codes 21–28", "₹24,280 – ₹72,850 Scale", "58 Free Mock Tests", "Official PDF Mirror (748 KB)"],
  },
  {
    id: "ap-endowment-officer-2026",
    title: "AP Endowment Officer Notification 2026",
    teluguTitle: "ఆంధ్రప్రదేశ్ దేవాదాయ శాఖ ఎగ్జిక్యూటివ్ ఆఫీసర్ నోటిఫికేషన్ 2026",
    state: "Andhra Pradesh",
    status: "live",
    statusCode: "200 OK",
    publishedDate: "15 Nov 2026",
    lastUpdated: "15 Nov 2026",
    url: "https://varadhiprep.in/news/ap-endowment-officer-notification-2026",
    vacancies: "104 Posts",
    description: "APSSC Executive Officer Grade-III Notification No. 23/2026, Paper-I GS & Paper-II Hindu Philosophy weightage, Act 30/1987, and official Gazette PDF download.",
    highlights: ["APPSC Cadre-III", "Hindu Philosophy Paper-II", "Timed Mock Tests", "Official Gazette PDF"],
  },
];

export function ExamPageFaqManager({
  states,
  boards,
  exams,
  faqs,
  primaryPages = FALLBACK_PAGES,
}: {
  states: State[];
  boards: Board[];
  exams: Exam[];
  faqs: Faq[];
  primaryPages?: PrimaryPage[];
}) {
  const [activeTab, setActiveTab] = useState<"primary" | "catalog">("primary");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [stateId, setStateId] = useState(states[0]?.id ?? "");
  const [boardId, setBoardId] = useState("");
  const [examId, setExamId] = useState("");
  const availableBoards = useMemo(() => boards.filter((board) => board.stateId === stateId), [boards, stateId]);
  const availableExams = useMemo(() => exams.filter((exam) => exam.boardId === boardId), [exams, boardId]);
  const selectedState = states.find((state) => state.id === stateId);
  const selected = exams.find((exam) => exam.id === examId);
  const examFaqs = faqs.filter((faq) => faq.exam_group_id === examId).sort((a, b) => a.display_order - b.display_order || a.question.localeCompare(b.question));

  const pagesList = primaryPages.length > 0 ? primaryPages : FALLBACK_PAGES;
  const liveCount = pagesList.filter((p) => p.status === "live").length;

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedUrl(text);
      setTimeout(() => setCopiedUrl(null), 2500);
    }
  };

  return (
    <main className="space-y-8">
      {/* Varadhi Prep Executive Header Box */}
      <section className="relative overflow-hidden rounded-3xl border border-teal-200/80 bg-gradient-to-br from-white via-white to-teal-50/50 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-teal-800">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600 inline-block" />
                Varadhi Prep &bull; Public Pages
              </span>
              <span className="text-xs font-semibold text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Recruitment Notification Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Public pages
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              Centralized registry of primary recruitment notification pages and student landing URLs. Upload and manage links directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              {liveCount} Live {liveCount === 1 ? "Page" : "Pages"} (200 OK)
            </span>
            <button
              type="button"
              onClick={() => setIsUploading((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition"
            >
              {isUploading ? "✕ Close Upload" : "+ Upload Link"}
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200/80 pt-5">
          <button
            type="button"
            onClick={() => setActiveTab("primary")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
              activeTab === "primary"
                ? "bg-teal-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/80"
            }`}
          >
            <span>📰 Primary Recruitment Pages ({pagesList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
              activeTab === "catalog"
                ? "bg-teal-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/80"
            }`}
          >
            <span>📚 Exam Catalogue &amp; FAQs</span>
          </button>
        </div>
      </section>

      {/* Tab 1: Primary Recruitment Links Only */}
      {activeTab === "primary" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-[0.14em] text-teal-800">
              Primary Exam Notification Links ({pagesList.length})
            </h2>
            {copiedUrl && (
              <span className="text-xs font-bold text-emerald-700 animate-fade-in">
                ✓ Primary URL copied to clipboard!
              </span>
            )}
          </div>

          {/* Upload Link Form */}
          {isUploading && (
            <UploadPrimaryPageForm onCancel={() => setIsUploading(false)} />
          )}

          <div className="space-y-4">
            {pagesList.map((page) => (
              <article
                key={page.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300 transition"
              >
                {/* Status bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                      {page.state}
                    </span>
                    {page.status === "live" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block animate-pulse" />
                        {page.statusCode} (Live)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                        <span className="h-2 w-2 rounded-full bg-amber-600 inline-block" />
                        {page.statusCode}
                      </span>
                    )}
                    {page.vacancies && (
                      <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800 border border-teal-200/80">
                        {page.vacancies}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                    {page.publishedDate && (
                      <span>Published: <strong className="text-slate-800 font-bold">{page.publishedDate}</strong></span>
                    )}
                    {page.publishedDate && page.lastUpdated && <span>&bull;</span>}
                    {page.lastUpdated && (
                      <span>Updated: <strong className="text-slate-800 font-bold">{page.lastUpdated}</strong></span>
                    )}
                  </div>
                </div>

                {/* Headings */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight">
                    {page.title}
                  </h3>
                  {page.teluguTitle && (
                    <p lang="te" className="font-telugu text-sm sm:text-base text-slate-700 mt-1 font-normal">
                      {page.teluguTitle}
                    </p>
                  )}
                  {page.description && (
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                      {page.description}
                    </p>
                  )}
                </div>

                {/* Feature Tags */}
                {page.highlights && page.highlights.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {page.highlights.map((h, i) => (
                      <span key={i} className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200/80">
                        {h}
                      </span>
                    ))}
                  </div>
                )}

                {/* Primary URL Row & Quick Actions */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70">
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Primary Canonical URL:
                    </span>
                    <code className="text-xs sm:text-sm font-mono text-teal-800 block mt-0.5 break-all font-semibold select-all">
                      {page.url}
                    </code>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(page.url)}
                      className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition shadow-2xs"
                    >
                      {copiedUrl === page.url ? "Copied! ✓" : "Copy Link"}
                    </button>

                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-xs ${
                        page.status === "live"
                          ? "bg-slate-950 text-white hover:bg-slate-800"
                          : "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                      }`}
                    >
                      {page.status === "live" ? "Open Live ↗" : "Preview ↗"}
                    </a>

                    <form action={deletePrimaryExamPage} className="inline-block">
                      <input type="hidden" name="id" value={page.id} />
                      <input type="hidden" name="url" value={page.url} />
                      <button
                        type="submit"
                        onClick={(e) => {
                          if (!confirm(`Are you sure you want to remove "${page.title}" from exam pages?`)) {
                            e.preventDefault();
                          }
                        }}
                        className="rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-50 hover:border-red-300 transition shadow-2xs"
                        title="Remove link from exam pages"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Existing Exam Catalogue & FAQ Editor */}
      {activeTab === "catalog" && (
        <div className="space-y-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="font-display text-2xl font-bold text-slate-950">Find an exam page</h2>
            <p className="mt-1 text-sm text-slate-600">Choose from left to right. Only the selected Exam will be changed.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <label className="block text-sm font-bold text-slate-900">
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
              <label className="block text-sm font-bold text-slate-900">
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
              <label className="block text-sm font-bold text-slate-900">
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
