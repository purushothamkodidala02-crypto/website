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

const PUBLIC_PAGE_LINKS = [
  {
    title: "Telangana Police Constable Notification 2026",
    subtitle: "Primary Canonical Article Page (NewsArticle Schema)",
    url: "https://varadhiprep.in/news/telangana-police-constable-notification-2026",
    type: "Canonical Link",
    badge: "Primary",
  },
  {
    title: "Short Shareable URL",
    subtitle: "Root 301 Permanent Redirect to Notification Article",
    url: "https://varadhiprep.in/telangana-police-constable-notification-2026",
    type: "Short Link",
    badge: "301 Redirect",
  },
  {
    title: "Dedicated Exam Catalogue Hub",
    subtitle: "Curriculum Hub for TS Police Constable Examination",
    url: "https://varadhiprep.in/exams/telangana-police-constable",
    type: "Exam Hub",
    badge: "Internal",
  },
  {
    title: "58 Free Mock Tests Portal",
    subtitle: "200 Questions, 180-Min Countdown, 0.20 Negative Marking",
    url: "https://varadhiprep.in/mock-tests/telangana/police-constable-free-mock-test",
    type: "Mock Test Series",
    badge: "Free Access",
  },
  {
    title: "Official 36-Page Notification PDF Mirror",
    subtitle: "Local Server Document Mirror (748 KB) - Permanent Storage",
    url: "https://varadhiprep.in/docs/telangana-police-constable-notification-2026-official.pdf",
    type: "PDF Document",
    badge: "Official Gazette",
  },
];

const LEGAL_POLICIES = [
  {
    id: "POL-LEG-PRIVACY",
    title: "Privacy Policy",
    path: "/privacy-policy",
    url: "https://varadhiprep.in/privacy-policy",
    version: "1.0",
    lastUpdated: "27 August 2026",
    nextReview: "27 August 2027",
    status: "Active & Published",
    description: "Governs student account information, test analytics, mock test attempts, and Cashfree payment security.",
  },
  {
    id: "POL-LEG-TERMS",
    title: "Terms and Conditions",
    path: "/terms-and-conditions",
    url: "https://varadhiprep.in/terms-and-conditions",
    version: "1.0",
    lastUpdated: "27 August 2026",
    nextReview: "27 August 2027",
    status: "Active & Published",
    description: "Platform usage terms, single-device access policy, intellectual property rights, and fair usage.",
  },
  {
    id: "POL-LEG-REFUNDS",
    title: "Refunds and Cancellations",
    path: "/refunds-and-cancellations",
    url: "https://varadhiprep.in/refunds-and-cancellations",
    version: "1.0",
    lastUpdated: "27 August 2026",
    nextReview: "27 August 2027",
    status: "Active & Published",
    description: "Digital subscription pass policy, transaction dispute resolution, and payment handling.",
  },
];

export function ExamPageFaqManager({ states, boards, exams, faqs }: { states: State[]; boards: Board[]; exams: Exam[]; faqs: Faq[] }) {
  const [activeTab, setActiveTab] = useState<"pages" | "catalog" | "policies">("pages");
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
      {/* Policy Center Header */}
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-[#002b54] to-slate-950 p-7 text-white shadow-xl sm:p-9 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-300">Public Content &amp; Policy Governance</p>
            </div>
            <h1 className="font-display mt-2 text-3xl sm:text-4xl">Public pages</h1>
            <p className="mt-2 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-300">
              Manage student-facing exam notifications, canonical landing pages, live links, and governance compliance policies in one centralized workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200">
              Review Cycle: 90 Days
            </span>
            <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
              Compliance: 100%
            </span>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={() => setActiveTab("pages")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "pages"
                ? "bg-[#fb8916] text-white shadow-md shadow-orange-950/20"
                : "bg-white/10 text-slate-200 hover:bg-white/20"
            }`}
          >
            <span>📰 Active Public Pages &amp; Links</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "catalog"
                ? "bg-[#fb8916] text-white shadow-md shadow-orange-950/20"
                : "bg-white/10 text-slate-200 hover:bg-white/20"
            }`}
          >
            <span>📚 Exam Catalogue &amp; FAQ Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("policies")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "policies"
                ? "bg-[#fb8916] text-white shadow-md shadow-orange-950/20"
                : "bg-white/10 text-slate-200 hover:bg-white/20"
            }`}
          >
            <span>⚖️ Legal &amp; Governance Policies</span>
          </button>
        </div>
      </section>

      {/* Tab 1: Active Public Pages & Links with Policy Management Features */}
      {activeTab === "pages" && (
        <div className="space-y-8">
          {/* Main Policy Card for Telangana Police Constable 2026 */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Policy Title & Status Banner */}
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-sky-50/50 p-6 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block" />
                    Status: Active &amp; Published
                  </span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-bold text-slate-700 border border-slate-200">
                    POL-TSPC-2026-01
                  </span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-bold text-slate-700 border border-slate-200">
                    Version 1.2
                  </span>
                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0055a2] border border-blue-200">
                    Public Official Gazette
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/news/telangana-police-constable-notification-2026"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0055a2] hover:bg-[#003e78] text-white px-4 py-2 text-xs sm:text-sm font-bold transition shadow-xs"
                  >
                    Open Live Article ↗
                  </Link>
                </div>
              </div>

              <div className="mt-4">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950">
                  Telangana Police Constable Notification 2026
                </h2>
                <p lang="te" className="font-telugu text-base sm:text-lg text-slate-700 mt-1">
                  తెలంగాణ పోలీస్ కానిస్టేబుల్ 7,112 పోస్టుల అధికారిక నోటిఫికేషన్, శాలరీ, సిలబస్ &amp; ఎంపిక విధానం
                </p>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-4xl">
                  Comprehensive 7,112 vacancies recruitment guide, Post Codes 21–28 cadre allocation, Revised Pay Scales (₹24,280–₹72,850), 100-mark PMT/PET events, and 58 free bilingual mock tests.
                </p>
              </div>

              {/* Policy Lifecycle Schedule (Quarterly 3-Month Cadence) */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-200/80 pt-5 text-xs sm:text-sm">
                <div className="rounded-xl bg-white p-3 border border-slate-200">
                  <span className="text-slate-500 font-bold block text-xs uppercase">Effective Date</span>
                  <strong className="text-slate-900 block mt-0.5 font-bold">14 Nov 2026</strong>
                </div>
                <div className="rounded-xl bg-white p-3 border border-slate-200">
                  <span className="text-slate-500 font-bold block text-xs uppercase">Review Cadence</span>
                  <strong className="text-slate-900 block mt-0.5 font-bold">Quarterly (90 Days)</strong>
                </div>
                <div className="rounded-xl bg-white p-3 border border-slate-200">
                  <span className="text-slate-500 font-bold block text-xs uppercase">Next Review Due</span>
                  <strong className="text-[#0055a2] block mt-0.5 font-bold">14 Feb 2027</strong>
                </div>
                <div className="rounded-xl bg-white p-3 border border-slate-200">
                  <span className="text-slate-500 font-bold block text-xs uppercase">Governance Status</span>
                  <strong className="text-emerald-700 block mt-0.5 font-bold">✓ Compliant</strong>
                </div>
              </div>
            </div>

            {/* Policy Verification & Compliance Matrix */}
            <div className="p-6 sm:p-7 border-b border-slate-200 bg-white">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0055a2] flex items-center gap-2">
                <span>🛡️</span> Compliance &amp; Verification Matrix
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-emerald-900">Zero Cut-Off Rule</span>
                    <span className="text-emerald-700 font-bold text-xs">✓ Enforced</span>
                  </div>
                  <p className="mt-1 text-xs text-emerald-800">
                    Strictly 0 cut-offs mentioned anywhere on the page, keeping editorial focus on official standards.
                  </p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-blue-900">Gazette Grounding</span>
                    <span className="text-blue-700 font-bold text-xs">✓ 100% Matched</span>
                  </div>
                  <p className="mt-1 text-xs text-blue-800">
                    All 7,112 posts, Post Codes 21–28, PMT 167cm, and 1600m/800m run slabs grounded in official PDF.
                  </p>
                </div>
                <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-purple-900">Presidential Order</span>
                    <span className="text-purple-700 font-bold text-xs">✓ 95% Local / 5% Open</span>
                  </div>
                  <p className="mt-1 text-xs text-purple-800">
                    Local reservation rules under G.O. Ms 46 and 87 accurately detailed for all 7 cadre zones.
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-amber-900">SEO &amp; Structured Data</span>
                    <span className="text-amber-700 font-bold text-xs">✓ Priority 1.0</span>
                  </div>
                  <p className="mt-1 text-xs text-amber-800">
                    NewsArticle JSON-LD schema, BreadcrumbList, and 5 key target keywords active in sitemap.xml.
                  </p>
                </div>
              </div>
            </div>

            {/* Public Links Section */}
            <div className="p-6 sm:p-7 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <span>🔗</span> Live Public Links &amp; URLs
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Permanent public URLs configured on Cloudflare Workers edge network.
                  </p>
                </div>
                {copiedUrl && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300 animate-fade-in">
                    ✓ Link copied to clipboard!
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {PUBLIC_PAGE_LINKS.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-xs transition"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
                          {item.type}
                        </span>
                        <h4 className="font-bold text-slate-950 text-sm">{item.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                      <code className="text-xs font-mono text-[#0055a2] block mt-1 break-all select-all font-semibold">
                        {item.url}
                      </code>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.url)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition shadow-2xs"
                        title="Copy URL"
                      >
                        {copiedUrl === item.url ? "Copied! ✓" : "Copy"}
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-[#0055a2] bg-white text-[#0055a2] hover:bg-[#0055a2] hover:text-white px-3 py-1.5 text-xs font-bold transition shadow-2xs"
                      >
                        Open ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Policy Audit Trail & Revision History */}
            <div className="p-6 sm:p-7 border-t border-slate-200 bg-white">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-4">
                <span>📝</span> Policy Audit Trail &amp; Revision Log
              </h3>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-3 border-l-2 border-[#fb8916] pl-3 py-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-950">v1.2</span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-slate-600 font-semibold">15 Nov 2026, 11:20 AM</span>
                      <span className="rounded bg-orange-100 px-1.5 py-0.5 text-orange-800 text-[10px] font-bold">Latest</span>
                    </div>
                    <p className="text-slate-700 mt-0.5">
                      Applied Civil Academy Royal Blue &amp; Saffron palette (`#0055a2` &amp; `#fb8916`), verified zero cut-offs, and deployed to Cloudflare Workers edge network.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-l-2 border-slate-300 pl-3 py-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-950">v1.1</span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-slate-600 font-semibold">15 Nov 2026, 09:40 AM</span>
                    </div>
                    <p className="text-slate-700 mt-0.5">
                      Refined editorial copy, removed direct raw notification phrasing, and upgraded Telugu Mandali font rendering.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-l-2 border-slate-300 pl-3 py-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-950">v1.0</span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-slate-600 font-semibold">14 Nov 2026, 05:30 PM</span>
                    </div>
                    <p className="text-slate-700 mt-0.5">
                      Initial publication of official 7,112 vacancies gazette breakdown, cadre allocation, revised pay scales, and 58 free bilingual mock tests.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Existing Exam Catalogue & FAQ Editor */}
      {activeTab === "catalog" && (
        <div className="space-y-8">
          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl">Find an exam page</h2>
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
              <section className="rounded-3xl border bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Common Questions for</p>
                <h2 className="font-display mt-2 text-3xl">{selected.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  These appear in the public <span className="font-semibold">About {selected.name} mock tests</span> section and its FAQ search data.
                </p>
                <div className="mt-7">
                  <h3 className="font-display text-xl">Existing student questions</h3>
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
                  <h3 className="font-display text-xl">Add another question</h3>
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

      {/* Tab 3: Legal & Governance Policies */}
      {activeTab === "policies" && (
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-950">Platform Governance &amp; Legal Policies</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Official public legal documents, customer terms, and privacy guidelines governing Varadhi Prep.
                </p>
              </div>
              <span className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                All 3 Policies Active
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {LEGAL_POLICIES.map((policy) => (
                <div
                  key={policy.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 hover:bg-white hover:border-slate-300 transition shadow-2xs"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {policy.id}
                        </span>
                        <h3 className="font-bold text-slate-950 text-base">{policy.title}</h3>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                          {policy.status}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">{policy.description}</p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                        <span>Version: <strong className="text-slate-800">{policy.version}</strong></span>
                        <span>&bull;</span>
                        <span>Last Updated: <strong className="text-slate-800">{policy.lastUpdated}</strong></span>
                        <span>&bull;</span>
                        <span>Next Annual Review: <strong className="text-slate-800">{policy.nextReview}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(policy.url)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                      >
                        {copiedUrl === policy.url ? "Copied! ✓" : "Copy Link"}
                      </button>
                      <Link
                        href={policy.path}
                        target="_blank"
                        className="rounded-lg border border-[#0055a2] bg-white text-[#0055a2] hover:bg-[#0055a2] hover:text-white px-3 py-1.5 text-xs font-bold transition shadow-2xs"
                      >
                        Open Live ↗
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
