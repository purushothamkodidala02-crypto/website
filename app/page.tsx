import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand/VaradhiBrand";
import { ExamSymbol, MockSymbol, StateSymbol } from "@/components/exams/CatalogSymbols";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
import { getHomeCatalogData } from "@/lib/catalog-data";
import { examUrl, stateUrl } from "@/lib/public-urls";
import { absoluteUrl, SITE_DESCRIPTION } from "@/lib/site";
import { getActiveSurvey } from "@/app/actions/surveys";
import { SurveyPopup } from "@/components/dashboard/SurveyPopup";

// ⚡ Cache on Edge CDN and revalidate in the background every 5 minutes
export const revalidate = 300;

export const metadata: Metadata = {
  title: {
    absolute: "Varadhi Prep - TG & AP Competitive Exams Free Mock Tests",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Varadhi Prep",
    "TG & AP Competitive Exams Free Mock Tests",
    "TG Police Constable mock test",
    "Telangana police constable free mock test",
    "TGPRB police constable mock test 2026",
    "TSPSC mock test free",
    "TGPSC online test series",
    "TG TET mock test papers",
    "TG TET 2026 practice test",
    "APPSC mock test in Telugu",
    "Telangana competitive exams online test series",
    "Telangana history and movement practice test",
    "Current affairs mock test for Telangana exams",
    "తెలంగాణ పోలీస్ కానిస్టేబుల్ మాక్ టెస్ట్",
    "టీజీ టెట్ మాక్ టెస్ట్",
    "పోటీ పరీక్షల మాక్ టెస్ట్‌లు",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Varadhi Prep - TG & AP Competitive Exams Free Mock Tests",
    description: SITE_DESCRIPTION,
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Varadhi Prep - TG & AP Competitive Exams Free Mock Tests",
    description: SITE_DESCRIPTION,
  },
};

const benefits = [
  { icon: "target", title: "Targeted Paper Structure", description: "State, exam, and paper are structured according to official notifications so you only practice what's on the syllabus." },
  { icon: "timer", title: "Pause & Resume Anytime", description: "Practice under real exam timers with the flexibility to pause and resume whenever your schedule demands." },
  { icon: "review", title: "Comprehensive Review", description: "Review correct answers, explanations, scores, and subject accuracy immediately after every test submission." },
];

export default async function Home() {
  const [{ states, categories, exams, papers, hasStateError }, activeSurvey] = await Promise.all([
    getHomeCatalogData(),
    getActiveSurvey(),
  ]);
  const categoryById = new Map(categories.map((item) => [item.id, item]));

  const activeExams = exams;
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Varadhi Prep",
    alternateName: ["VaradhiPrep", "Varadhi Prep Mock Tests", "TG and AP State Exam Mock Tests"],
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    inLanguage: ["en-IN", "te-IN"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/mock-tests")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Varadhi Prep",
    alternateName: "VaradhiPrep",
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/varadhi-v-logo.png"),
      contentUrl: absoluteUrl("/varadhi-v-logo.png"),
      width: 512,
      height: 512,
    },
    email: "support@varadhiprep.in",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@varadhiprep.in",
      availableLanguage: ["English", "Telugu"],
    },
  };

  return (
    <main className="student-page min-h-screen bg-[#f8fafc] text-slate-900">
      <JsonLd data={[websiteJsonLd, organizationJsonLd]} />
      <PublicHeader />
      <SurveyPopup survey={activeSurvey} />

      {/* Hero Section */}
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-[#f0f4f9] via-[#f5f8fc] to-[#f8fafc]">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-900">
              <MockSymbol className="h-3.5 w-3.5 text-blue-700" /> Free State Competitive Exam Practice
            </span>
            <h1 className="font-display mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Official Pattern Mock Tests for Telangana & Andhra Pradesh
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Prepare for TGPSC, APPSC, Police Constable, SI, and TET examinations with timed bilingual papers, official negative marking, and instant detailed solutions.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/mock-tests"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 px-6 py-3 text-sm font-semibold text-white shadow-xs transition"
              >
                Browse all mock tests <span aria-hidden="true">→</span>
              </Link>
              <a
                href="#select-state"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 shadow-xs transition"
              >
                Select your state ↓
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
                Bilingual (English & Telugu)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
                Official Syllabus & Negative Marking
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
                Instant Performance Analytics
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* State Selection Section */}
      <section id="select-state" className="scroll-mt-16 mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">State Exam Catalogues</p>
            <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl text-slate-900">
              Select your state to explore exams
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Choose Telangana or Andhra Pradesh to view dedicated recruitment papers and notifications.
            </p>
          </div>
          <Link
            href="/mock-tests"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            Browse complete catalogue <span aria-hidden="true">→</span>
          </Link>
        </div>

        {hasStateError ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            The state catalogue will appear after its database update is applied.
          </div>
        ) : (
          <div className="student-stagger mt-8 grid gap-5 md:grid-cols-3">
            {states.map((state) => {
              const stateCategoryIds = new Set(categories.filter((category) => category.state_id === state.id).map((category) => category.id));
              const stateExams = activeExams.filter((exam) => stateCategoryIds.has(exam.exam_id));
              const prefix = `${state.name} `;
              const description = state.description?.toLowerCase().startsWith(prefix.toLowerCase())
                ? state.description.slice(prefix.length)
                : state.description ?? "State recruitment and eligibility examinations.";
              return (
                <Link
                  key={state.id}
                  href={stateUrl(state.slug)}
                  prefetch={false}
                  className="student-card group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:border-blue-400 hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-800">
                        <StateSymbol slug={state.slug} />
                      </span>
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                        {state.code}
                      </span>
                    </div>
                    <h3 className="font-display mt-4 text-xl font-bold text-slate-900 group-hover:text-blue-700 transition">
                      {state.name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {description}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                    <span className="font-medium text-slate-500">
                      {stateExams.length} exam{stateExams.length === 1 ? "" : "s"} available
                    </span>
                    <span className="font-semibold text-blue-700 group-hover:translate-x-1 transition">
                      Explore exams →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Popular Exam Collections */}
        {states.length > 0 && activeExams.length > 0 && (
          <div className="mt-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Popular test series</p>
              <h3 className="font-display mt-1 text-2xl font-bold text-slate-900">
                Continue directly to an exam
              </h3>
            </div>
            <div className="student-stagger mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {activeExams.slice(0, 8).map((exam) => {
                const category = categoryById.get(exam.exam_id);
                const state = states.find((item) => item.id === category?.state_id);
                const paperCount = papers.filter((paper) => paper.exam_group_id === exam.id).length;
                return state ? (
                  <Link
                    key={exam.id}
                    href={examUrl(state.slug, exam.slug)}
                    prefetch={false}
                    className="student-card group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-blue-400 hover:shadow-xs transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700">
                          <ExamSymbol name={exam.name} className="h-4 w-4" />
                        </span>
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {state.code}
                        </span>
                      </div>
                      <h4 className="font-display mt-3 text-base font-bold leading-snug text-slate-900 group-hover:text-blue-700 transition">
                        {exam.name}
                      </h4>
                    </div>
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <p className="text-xs font-medium text-slate-500">
                        {paperCount} paper{paperCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </Link>
                ) : null;
              })}
            </div>
          </div>
        )}
      </section>

      {/* Real Computer Based Test (CBT) Experience */}
      <section className="border-y border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900">
              <MockSymbol className="h-3.5 w-3.5 text-blue-700" /> Authentic CBT Experience
            </span>
            <h2 className="font-display mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Practise with exam-hall realism. Review with clarity.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Varadhi Prep reproduces the exact environment of state recruitment examinations—giving you timed papers, negative marking schemes, and immediate post-submission answer keys with explanations.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">1</span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Bilingual Question Papers</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Toggle questions and options seamlessly between English and Telugu.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">2</span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Official Negative Marking</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Scored under actual notification rules so you develop accurate answering habits.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">3</span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Instant Detailed Solutions</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Review question explanations, subject breakdowns, and incorrect answers after submission.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/mock-tests"
                className="inline-flex items-center rounded-xl bg-blue-700 hover:bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition"
              >
                Start a mock test
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition"
              >
                Create account
              </Link>
            </div>
          </div>

          <TestPreview />
        </div>
      </section>

      {/* Why Choose Varadhi Prep (Benefits) */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Focused exam workflow</p>
          <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl text-slate-900">
            Everything needed for serious practice
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            A clean, distraction-free environment built to help state competitive exam aspirants succeed.
          </p>
        </div>
        <div className="student-stagger mt-8 grid gap-5 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <article
              key={benefit.title}
              className="student-card rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-xs transition"
            >
              <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                0{index + 1}
              </span>
              <h3 className="font-display mt-4 text-lg font-bold text-slate-900">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Clean Professional Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 text-slate-400">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <BrandMark className="h-9 w-9 text-white" />
              <div>
                <p className="font-display text-base font-bold text-white">Varadhi Prep</p>
                <p className="text-xs text-slate-400">TG & AP State Competitive Exams Free Mock Tests</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Free, syllabus-aligned computer-based mock tests for competitive exam aspirants across Telangana and Andhra Pradesh.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              © {new Date().getFullYear()} Varadhi Prep. All rights reserved.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Quick links</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link href="/support" className="hover:text-white transition">Support</Link>
              <Link href="/login" className="hover:text-white transition">Sign in</Link>
              <Link href="/register" className="hover:text-white transition">Create account</Link>
              <Link href="/privacy-policy" className="hover:text-white transition">Privacy</Link>
              <Link href="/terms-and-conditions" className="hover:text-white transition">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function TestPreview() {
  return (
    <aside className="relative rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">Practice interface</span>
          <p className="font-display mt-0.5 text-sm font-bold text-slate-900">APPSC · Endowment Officer · Paper 1</p>
        </div>
        <span className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 font-mono text-xs font-bold text-slate-800">
          01:29:42
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Question 12 of 150</span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
            English · తెలుగు
          </span>
        </div>

        <p className="mt-3 text-sm font-medium text-slate-900 leading-snug">
          Which of the following bodies conducts recruitment examinations for state civil services in Andhra Pradesh?
        </p>

        <div className="mt-4 space-y-2">
          {[
            "Union Public Service Commission (UPSC)",
            "Andhra Pradesh Public Service Commission (APPSC)",
            "Staff Selection Commission (SSC)",
            "State Selection Board (SSB)"
          ].map((option, index) => (
            <div
              key={option}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-medium transition ${
                index === 1
                  ? "border-blue-400 bg-blue-50/70 text-blue-900 font-semibold"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-lg text-xs font-bold ${
                  index === 1 ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="truncate">{option}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-500 font-medium">Auto-saved</span>
          <span className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-2xs">
            Save & next →
          </span>
        </div>
      </div>
    </aside>
  );
}
