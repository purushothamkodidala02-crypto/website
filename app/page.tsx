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

      {/* Main Content Area */}
      <section className="mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-16 lg:px-8">
        {/* Quick Search - Top Left */}
        <div className="max-w-xl">
          <form action="/mock-tests" method="GET">
            <div className="relative flex items-center rounded-xl border border-slate-300 bg-white p-1.5 shadow-2xs transition focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
              <svg
                className="ml-2.5 h-4 w-4 shrink-0 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                name="q"
                placeholder="Search exam (e.g. Group 2, Police Constable, TET, APPSC)..."
                aria-label="Search exams"
                className="w-full border-none bg-transparent px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-0"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-700 hover:bg-blue-800 active:bg-blue-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition"
              >
                Search
              </button>
            </div>

            {/* Popular Exam Shortcuts */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-medium text-slate-500">Popular:</span>
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
                  className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-700 transition hover:border-blue-400 hover:bg-white hover:text-blue-700"
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          </form>
        </div>

        {/* States Section - Styled like Exam Cards */}
        {hasStateError ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
            The state catalogue will appear after its database update is applied.
          </div>
        ) : (
          <div className="mt-6 sm:mt-7">
            <h2 className="font-display text-xs font-bold uppercase tracking-wider text-slate-500">
              Select State
            </h2>
            <div className="student-stagger mt-2.5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
              {states.map((state) => {
                const stateCategoryIds = new Set(
                  categories
                    .filter((category) => category.state_id === state.id)
                    .map((category) => category.id)
                );
                const stateExams = activeExams.filter((exam) =>
                  stateCategoryIds.has(exam.exam_id)
                );
                const isTG = state.code.toUpperCase() === "TG";

                return (
                  <Link
                    key={state.id}
                    href={stateUrl(state.slug)}
                    prefetch={true}
                    className="student-card group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-blue-400 hover:shadow-xs transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`grid h-10 w-10 place-items-center rounded-xl transition ${
                            isTG
                              ? "bg-blue-50 text-blue-700 group-hover:bg-blue-100"
                              : "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100"
                          }`}
                        >
                          <StateSymbol slug={state.slug} className="h-5 w-5" />
                        </span>
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                            isTG
                              ? "border-blue-200 bg-blue-50 text-blue-800"
                              : "border-emerald-200 bg-emerald-50 text-emerald-800"
                          }`}
                        >
                          {state.code}
                        </span>
                      </div>
                      <h3 className="font-display mt-3 text-sm sm:text-base font-bold leading-snug text-slate-900 group-hover:text-blue-700 transition">
                        {state.name}
                      </h3>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <span className="font-medium text-slate-500">
                        {stateExams.length} exam series available
                      </span>
                      <span className="font-semibold text-blue-700 group-hover:translate-x-0.5 transition">
                        Explore →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Exams Section */}
        <div className="mt-8 sm:mt-10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-base sm:text-lg font-bold text-slate-900">
              Available Exams
            </h2>
            <Link
              href="/mock-tests"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-800 transition"
            >
              Browse all ({activeExams.length}) <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="student-stagger mt-3.5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
            {activeExams.map((exam) => {
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
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                          isTG
                            ? "border-blue-200 bg-blue-50 text-blue-800"
                            : "border-emerald-200 bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        {state.code}
                      </span>
                    </div>
                    <h3 className="font-display mt-3 text-sm sm:text-base font-bold leading-snug text-slate-900 group-hover:text-blue-700 transition">
                      {exam.name}
                    </h3>
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
