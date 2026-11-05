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

      {/* Balanced, Human-Designed 2-Column Hero */}
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-[#f0f4f9] via-[#f5f8fc] to-[#f8fafc]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left Column: Value Proposition & Exam Search */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 px-3.5 py-1 text-xs font-semibold text-blue-900 shadow-2xs">
                <MockSymbol className="h-3.5 w-3.5 text-blue-700" /> State Competitive Examination Portal
              </span>
              
              <h1 className="font-display mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Full-Length Mock Tests for Telangana & Andhra Pradesh
              </h1>
              
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Practice under real exam conditions for TGPSC, APPSC, Police Recruitment (Constable/SI), and TET examinations. Timed bilingual papers with negative marking, official formats, and instant question solutions.
              </p>

              {/* Fast Exam Search */}
              <form action="/mock-tests" method="GET" className="mt-6 max-w-xl">
                <div className="relative flex items-center shadow-xs">
                  <input
                    type="search"
                    name="q"
                    placeholder="Search any exam (e.g. Group 2, Police Constable, TET, APPSC)..."
                    aria-label="Search exams"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-28 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 px-4 py-2 text-xs font-semibold text-white shadow-xs transition"
                  >
                    Search
                  </button>
                </div>
                
                {/* Popular Exam Shortcut Tags */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
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
                      className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-medium text-slate-700 transition hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50/50"
                    >
                      {tag.label}
                    </Link>
                  ))}
                </div>
              </form>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/mock-tests"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:shadow"
                >
                  Browse all mock tests <span aria-hidden="true">→</span>
                </Link>
                <HomeAuthAction
                  className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition"
                  loggedOutText="Create account"
                  loggedInText="Go to my dashboard →"
                />
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 flex flex-wrap items-center gap-2.5 text-xs font-medium text-slate-600">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs">
                  <span className="text-emerald-700 font-bold">✓</span> Dual Medium (English & Telugu)
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs">
                  <span className="text-emerald-700 font-bold">✓</span> Official Notification Negative Marking
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs">
                  <span className="text-emerald-700 font-bold">✓</span> Instant Step-by-Step Solutions
                </span>
              </div>
            </div>

            {/* Right Column: Authentic CBT Simulation & Scorecard Showcase */}
            <div className="relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-700">
                    <MockSymbol className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Live CBT Simulation</p>
                    <p className="font-display text-sm font-bold text-slate-900">Official Commission Interface</p>
                  </div>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                  Real Exam Hall
                </span>
              </div>

              {/* Simulated Test Status Strip */}
              <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Paper 1: General Studies & Mental Ability</span>
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-slate-800 shadow-2xs">
                    ⏱ 02:14:38
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px] text-slate-500">
                  <span>Marking: <strong className="text-slate-700">+1.0 / -0.25</strong></span>
                  <span className="rounded bg-blue-100/70 px-1.5 py-0.5 font-medium text-blue-800">English · తెలుగు</span>
                </div>
              </div>

              {/* Question Status Palette Preview */}
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Live Question Palette</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 font-medium">Answered: <strong className="text-slate-900">48</strong></span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-600 font-medium">Review: <strong className="text-slate-900">6</strong></span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="text-slate-600 font-medium">Unanswered: <strong className="text-slate-900">12</strong></span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    <span className="text-slate-600 font-medium">Not Visited: <strong className="text-slate-900">84</strong></span>
                  </div>
                </div>
              </div>

              {/* Post-Test Analytics Strip */}
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-950">
                  <span>Instant Performance Analytics</span>
                  <span className="text-blue-700">Detailed Key</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white/80 p-1.5">
                    <p className="text-[10px] text-slate-500">Score</p>
                    <p className="font-display text-xs font-bold text-slate-900">118.5/150</p>
                  </div>
                  <div className="rounded-lg bg-white/80 p-1.5">
                    <p className="text-[10px] text-slate-500">Accuracy</p>
                    <p className="font-display text-xs font-bold text-emerald-700">84%</p>
                  </div>
                  <div className="rounded-lg bg-white/80 p-1.5">
                    <p className="text-[10px] text-slate-500">Explanations</p>
                    <p className="font-display text-xs font-bold text-blue-700">100%</p>
                  </div>
                </div>
              </div>

              {/* Free Access Guarantee */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span> 100% Free Practice Tests
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span> No Credit Card Required
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* State Portals Section */}
      <section id="select-state" className="scroll-mt-16 mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Dedicated State Catalogues</p>
            <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl text-slate-900">
              Select your state to explore exams
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Targeted portals with official syllabus mapping, paper structures, and notifications for each state commission.
            </p>
          </div>
          <Link
            href="/mock-tests"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            Browse all exams <span aria-hidden="true">→</span>
          </Link>
        </div>

        {hasStateError ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            The state catalogue will appear after its database update is applied.
          </div>
        ) : (
          <div className="student-stagger mt-8 grid gap-6 md:grid-cols-2">
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
                  prefetch={true}
                  className="student-card group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:border-blue-400 hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-800">
                        <StateSymbol slug={state.slug} />
                      </span>
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-900">
                        {state.code}
                      </span>
                    </div>
                    <h3 className="font-display mt-5 text-xl font-bold text-slate-900 group-hover:text-blue-700 transition">
                      {state.name} Recruitment Exams
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {description}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                    <span className="font-medium text-slate-500">
                      {stateExams.length} exam series available
                    </span>
                    <span className="font-semibold text-blue-700 group-hover:translate-x-1 transition">
                      Explore {state.name} exams →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Popular Exam Series Grid */}
        {states.length > 0 && activeExams.length > 0 && (
          <div className="mt-14">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Popular Test Series</p>
                <h3 className="font-display mt-1 text-2xl font-bold text-slate-900">
                  Continue directly to an exam
                </h3>
              </div>
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
                    prefetch={true}
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

      {/* Platform Standards / Educational Rigor */}
      <section className="border-y border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900">
              <MockSymbol className="h-3.5 w-3.5 text-blue-700" /> Platform Standards
            </span>
            <h2 className="font-display mt-3 text-2xl font-bold sm:text-3xl text-slate-900">
              Built Specifically for State Competitive Aspirants
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Every mock test adheres strictly to official commission guidelines, scoring algorithms, and bilingual requirements.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition hover:border-slate-300 hover:bg-white hover:shadow-2xs"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-800">
                  0{index + 1}
                </span>
                <h3 className="font-display mt-4 text-base font-bold text-slate-900">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>

          {/* Clean Dynamic Call to Action */}
          <div className="mt-12 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Ready to test your exam preparation?
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  Access free papers across all major recruitment exams or continue from where you left off.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/mock-tests"
                  className="inline-flex min-h-[42px] items-center rounded-xl bg-blue-700 hover:bg-blue-800 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition"
                >
                  Browse all tests →
                </Link>
                <HomeAuthAction
                  className="inline-flex min-h-[42px] items-center rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition"
                  loggedOutText="Create account"
                  loggedInText="Go to my dashboard →"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grounded, Professional Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 text-slate-400">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
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
