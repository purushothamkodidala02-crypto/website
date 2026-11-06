import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand/VaradhiBrand";
import { ExamSymbol, MockSymbol, StateSymbol } from "@/components/exams/CatalogSymbols";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
import { HomeAuthAction } from "@/components/site/HomeAuthAction";
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

const pillars = [
  {
    title: "Official Notification Mapping",
    description: "Every mock paper is mapped to the latest TGPSC, APPSC, Police, or TET notification syllabus, ensuring you practice only relevant topics.",
  },
  {
    title: "Bilingual Question Papers",
    description: "Full dual-language support in English and Telugu, allowing you to cross-check terminology and practice in your preferred medium.",
  },
  {
    title: "Authentic CBT Interface",
    description: "Experience the real computer-based testing interface with official timers, section-wise navigation, question status palettes, and negative marking.",
  },
  {
    title: "Detailed Performance Analysis",
    description: "Receive instant answer keys, detailed bilingual explanations for every question, and subject-wise accuracy metrics immediately upon submission.",
  },
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

      {/* Modern, Mobile-First Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-[#edf3fb] via-[#f4f7fb] to-[#f8fafc]">
        {/* Subtle decorative background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[280px] w-[560px] rounded-full bg-blue-100/50 blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 text-center">
          {/* Official Portal Pill */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 px-3.5 py-1 text-xs font-semibold text-blue-900 shadow-2xs">
            <MockSymbol className="h-3.5 w-3.5 text-blue-700" /> State Competitive Examination Portal
          </span>

          {/* Authority Headline */}
          <h1 className="font-display mt-5 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Full-Length Mock Tests for{" "}
            <span className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Telangana &amp; Andhra Pradesh
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-relaxed">
            Practice under real exam conditions for TGPSC, APPSC, Police Recruitment (Constable &amp; SI), and TET examinations. Timed bilingual papers with negative marking, official commission formats, and instant question solutions.
          </p>

          {/* Fast Exam Search */}
          <form action="/mock-tests" method="GET" className="mx-auto mt-7 max-w-xl">
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl border border-slate-300 bg-white p-1.5 shadow-xs transition focus-within:border-blue-600 focus-within:ring-3 focus-within:ring-blue-100">
              <div className="flex flex-1 items-center px-3 py-2 sm:py-0">
                <svg className="mr-2.5 h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  name="q"
                  placeholder="Search exam (e.g. Group 2, Police Constable, TET, APPSC)..."
                  aria-label="Search exams"
                  className="w-full border-none bg-transparent p-0 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-0"
                />
              </div>
              <button
                type="submit"
                className="mt-1 sm:mt-0 rounded-xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition"
              >
                Search
              </button>
            </div>

            {/* Popular Exam Shortcut Tags */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
              <span className="font-medium text-slate-600">Popular:</span>
              {[
                { label: "Group 2", q: "Group 2" },
                { label: "Police Constable", q: "Constable" },
                { label: "Sub-Inspector", q: "Sub-Inspector" },
                { label: "TET 2026", q: "TET" },
                { label: "TGPSC", q: "TGPSC" },
                { label: "APPSC", q: "APPSC" },
              ].map((tag) => (
                <Link
                  key={tag.label}
                  href={`/mock-tests?q=${encodeURIComponent(tag.q)}`}
                  className="rounded-lg border border-slate-200/90 bg-white/90 px-2.5 py-1 font-medium text-slate-700 shadow-2xs transition hover:border-blue-400 hover:bg-blue-50/70 hover:text-blue-700"
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          </form>

          {/* Action Buttons */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/mock-tests"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:shadow-sm"
            >
              Browse all mock tests <span aria-hidden="true">→</span>
            </Link>
            <HomeAuthAction
              className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition"
              loggedOutText="Create account"
              loggedInText="Go to my dashboard →"
            />
          </div>

          {/* Responsive Trust & Core Pillars Strip (Clean replacement for bulky fake table) */}
          <div className="mt-10 border-t border-slate-200/80 pt-8">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 text-left">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-2xs backdrop-blur-xs transition hover:border-blue-300 hover:shadow-xs">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <MockSymbol className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">Official Exam Pattern</h3>
                  <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                    Accurate syllabus mapping &amp; notification marking algorithms.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-2xs backdrop-blur-xs transition hover:border-blue-300 hover:shadow-xs">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 5h7M4 9h7M4 13h4M14 5h6M14 9h6M14 13h6M4 17h16" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">Dual Medium (EN &amp; TE)</h3>
                  <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                    Full English &amp; Telugu papers with one-click language toggle.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-2xs backdrop-blur-xs transition hover:border-blue-300 hover:shadow-xs">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">Real CBT Simulation</h3>
                  <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                    Official countdown timer, section navigation &amp; question palette.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-2xs backdrop-blur-xs transition hover:border-blue-300 hover:shadow-xs">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900">Instant Explanations</h3>
                  <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                    Step-by-step bilingual solutions right after paper submission.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Guarantees */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="font-bold text-emerald-700">✓</span> 100% Free Practice Tests
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="font-bold text-emerald-700">✓</span> Official Commission Negative Marking
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="font-bold text-emerald-700">✓</span> No Credit Card Required
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* State Portals Section */}
      <section id="select-state" className="scroll-mt-16 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Dedicated State Catalogues</p>
            <h2 className="font-display mt-1 text-2xl font-bold sm:text-3xl text-slate-900">
              Select your state to explore exams
            </h2>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600">
              Targeted portals with official syllabus mapping, paper structures, and notifications for each state commission.
            </p>
          </div>
          <Link
            href="/mock-tests"
            className="inline-flex self-start sm:self-auto items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            Browse all exams <span aria-hidden="true">→</span>
          </Link>
        </div>

        {hasStateError ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            The state catalogue will appear after its database update is applied.
          </div>
        ) : (
          <div className="student-stagger mt-8 grid gap-5 md:grid-cols-2">
            {states.map((state) => {
              const stateCategoryIds = new Set(categories.filter((category) => category.state_id === state.id).map((category) => category.id));
              const stateExams = activeExams.filter((exam) => stateCategoryIds.has(exam.exam_id));
              const prefix = `${state.name} `;
              const description = state.description?.toLowerCase().startsWith(prefix.toLowerCase())
                ? state.description.slice(prefix.length)
                : state.description ?? "State recruitment and eligibility examinations.";
              const isTG = state.code.toUpperCase() === "TG";

              return (
                <Link
                  key={state.id}
                  href={stateUrl(state.slug)}
                  prefetch={true}
                  className="student-card group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:border-blue-400 hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className={`grid h-12 w-12 place-items-center rounded-xl transition ${
                        isTG ? "bg-blue-50 text-blue-700 group-hover:bg-blue-100" : "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100"
                      }`}>
                        <StateSymbol slug={state.slug} className="h-6 w-6" />
                      </span>
                      <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${
                        isTG ? "border-blue-200 bg-blue-50 text-blue-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"
                      }`}>
                        {state.code}
                      </span>
                    </div>

                    <h3 className="font-display mt-4 text-xl font-bold text-slate-900 group-hover:text-blue-700 transition">
                      {state.name} Recruitment Exams
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                      {description}
                    </p>

                    {/* Preview of Key Exams */}
                    {stateExams.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {stateExams.slice(0, 4).map((ex) => (
                          <span
                            key={ex.id}
                            className="rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                          >
                            {ex.name}
                          </span>
                        ))}
                        {stateExams.length > 4 && (
                          <span className="rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                            +{stateExams.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                    <span className="font-medium text-slate-500">
                      {stateExams.length} exam series available
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-blue-700 group-hover:translate-x-1 transition">
                      Explore {state.name} exams <span>→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Popular Exam Series Grid */}
        {states.length > 0 && activeExams.length > 0 && (
          <div className="mt-14 sm:mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Popular Test Series</p>
                <h3 className="font-display mt-1 text-2xl font-bold text-slate-900">
                  Continue directly to an exam
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  Full-length mock test papers mapped to official notifications.
                </p>
              </div>
              <Link
                href="/mock-tests"
                className="inline-flex self-start sm:self-auto items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-800 transition"
              >
                View all test series <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="student-stagger mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
              {activeExams.slice(0, 8).map((exam) => {
                const category = categoryById.get(exam.exam_id);
                const state = states.find((item) => item.id === category?.state_id);
                const paperCount = papers.filter((paper) => paper.exam_group_id === exam.id).length;
                if (!state) return null;
                const isTG = state.code.toUpperCase() === "TG";

                return (
                  <Link
                    key={exam.id}
                    href={examUrl(state.slug, exam.slug)}
                    prefetch={true}
                    className="student-card group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-blue-400 hover:shadow-xs transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700 transition">
                          <ExamSymbol name={exam.name} className="h-5 w-5" />
                        </span>
                        <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                          isTG
                            ? "border-blue-200 bg-blue-50 text-blue-800"
                            : "border-emerald-200 bg-emerald-50 text-emerald-800"
                        }`}>
                          {state.code}
                        </span>
                      </div>
                      <h4 className="font-display mt-3 text-sm sm:text-base font-bold leading-snug text-slate-900 group-hover:text-blue-700 transition">
                        {exam.name}
                      </h4>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <span className="font-medium text-slate-500">
                        {paperCount} paper{paperCount === 1 ? "" : "s"} available
                      </span>
                      <span className="font-semibold text-blue-700 group-hover:translate-x-0.5 transition">
                        Practice →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Platform Standards / Educational Rigor */}
      <section className="border-y border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900">
              <MockSymbol className="h-3.5 w-3.5 text-blue-700" /> Platform Standards
            </span>
            <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl text-slate-900">
              Built Specifically for State Competitive Aspirants
            </h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
              Every mock test adheres strictly to official commission guidelines, scoring algorithms, and bilingual requirements.
            </p>
          </div>

          <div className="mt-8 sm:mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {pillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 transition hover:border-slate-300 hover:bg-white hover:shadow-2xs"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 font-mono text-xs font-bold text-blue-800">
                  0{index + 1}
                </span>
                <h3 className="font-display mt-4 text-sm sm:text-base font-bold text-slate-900">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>

          {/* Clean High-Impact Call to Action Banner */}
          <div className="mt-12 rounded-3xl border border-blue-900/10 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-md sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-0.5 text-xs font-medium text-blue-200 backdrop-blur-xs">
                  ✨ Instant CBT Practice
                </span>
                <h3 className="font-display mt-2.5 text-xl sm:text-2xl font-bold text-white">
                  Ready to test your exam preparation?
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-blue-100/90 max-w-xl">
                  Access 100% free full-length papers across all major recruitment exams or continue from where you left off.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/mock-tests"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-white px-6 py-2.5 text-xs sm:text-sm font-bold text-blue-950 shadow-sm transition hover:bg-blue-50 hover:shadow"
                >
                  Browse all tests →
                </Link>
                <HomeAuthAction
                  className="inline-flex min-h-[44px] items-center rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-xs transition hover:bg-white/20"
                  loggedOutText="Create free account"
                  loggedInText="Go to my dashboard →"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grounded, Professional Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 text-slate-400">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <BrandMark className="h-9 w-9 text-white" />
              <div>
                <p className="font-display text-base font-bold text-white">Varadhi Prep</p>
                <p className="text-xs text-slate-400">TG & AP State Competitive Exams Mock Tests</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Syllabus-aligned computer-based mock tests for competitive exam aspirants across Telangana and Andhra Pradesh.
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
