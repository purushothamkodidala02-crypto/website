import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand/VaradhiBrand";
import { ExamSymbol, MockSymbol, StateSymbol } from "@/components/exams/CatalogSymbols";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
import { StudentResumePracticeBanner } from "@/components/site/StudentResumePracticeBanner";
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
    <main className="student-page relative min-h-screen bg-[#f6faf8] text-[#132621] w-full max-w-full overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[#eaf2ef]/70 via-[#f2f7f5]/40 to-transparent -z-10" />
      <JsonLd data={[websiteJsonLd, organizationJsonLd]} />
      <PublicHeader />
      <SurveyPopup survey={activeSurvey} />

      {/* Main Content Area */}
      <section className="mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-16 lg:px-8">
        {/* Quick Search - Right Aligned */}
        <div className="flex justify-end">
          <div className="w-full max-w-xl">
            <form action="/mock-tests" method="GET">
              <div className="relative flex items-center rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xs shadow-slate-900/4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm focus-within:border-teal-500 focus-within:bg-white focus-within:shadow-md focus-within:ring-4 focus-within:ring-teal-500/10">
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
                  className="rounded-xl bg-teal-800 hover:bg-teal-900 active:bg-teal-950 px-4 py-2 text-xs font-semibold text-white shadow-xs transition active:scale-[0.98]"
                >
                  Search
                </button>
              </div>

              {/* Popular Exam Shortcuts - Right Aligned */}
              <div className="mt-2.5 flex flex-wrap items-center justify-end gap-1.5 text-xs">
                <span className="font-semibold text-slate-500">Popular:</span>
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
                    className="rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-2xs transition hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-950"
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>
            </form>
          </div>
        </div>

        {/* Continue Recent Practice Progress Banner */}
        <StudentResumePracticeBanner className="mt-6" />

        {/* States Section */}
        {hasStateError ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
            The state catalogue will appear after its database update is applied.
          </div>
        ) : (
          <div className="mt-7 sm:mt-8">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-800">State Wise</p>
                <h2 className="font-display mt-0.5 text-base sm:text-lg font-bold tracking-tight text-slate-900">
                  Select State
                </h2>
              </div>
              {states.length > 4 && (
                <Link
                  href="/mock-tests"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-teal-800 hover:text-teal-950 transition"
                >
                  Browse all ({states.length}) <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
            <div className="student-stagger mt-3.5 grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4">
              {states.map((state) => {
                const stateCategoryIds = new Set(
                  categories
                    .filter((category) => category.state_id === state.id)
                    .map((category) => category.id)
                );
                const stateExams = activeExams.filter((exam) =>
                  stateCategoryIds.has(exam.exam_id)
                );

                return (
                  <Link
                    key={state.id}
                    href={stateUrl(state.slug)}
                    prefetch={true}
                    className="student-card group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md"
                  >
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-600/0 via-teal-500/35 to-teal-600/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="grid h-11 w-11 place-items-center rounded-xl border border-teal-100/90 bg-teal-50/70 text-teal-900 shadow-2xs transition-all duration-200 group-hover:scale-105 group-hover:border-teal-200 group-hover:bg-teal-100/80">
                          <StateSymbol slug={state.slug} className="h-6 w-6" />
                        </span>
                        <span className="rounded-full border border-teal-200/80 bg-teal-50/80 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-teal-950 transition">
                          {state.code}
                        </span>
                      </div>
                      <h3 className="font-display mt-3.5 text-base font-bold leading-snug text-slate-900 group-hover:text-teal-950 transition">
                        {state.name}
                      </h3>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <span className="font-medium text-slate-500">
                        {stateExams.length} exam series available
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-teal-800 group-hover:text-teal-950 group-hover:translate-x-0.5 transition">
                        Explore <span aria-hidden="true">→</span>
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
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Explore exams</p>
              <h2 className="font-display mt-0.5 text-base sm:text-lg font-bold tracking-tight text-slate-900">
                Available Exams
              </h2>
            </div>
            <Link
              href="/mock-tests"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-teal-800 hover:text-teal-950 transition"
            >
              Browse all ({activeExams.length}) <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="student-stagger mt-3.5 grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4">
            {activeExams.map((exam) => {
              const category = categoryById.get(exam.exam_id);
              const state = states.find((item) => item.id === category?.state_id);
              const paperCount = papers.filter((paper) => paper.exam_group_id === exam.id).length;
              if (!state) return null;

              return (
                <Link
                  key={exam.id}
                  href={examUrl(state.slug, exam.slug)}
                  prefetch={true}
                  className="student-card group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md"
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-600/0 via-teal-500/35 to-teal-600/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-xl border border-teal-100/90 bg-teal-50/70 text-teal-900 shadow-2xs transition-all duration-200 group-hover:scale-105 group-hover:border-teal-200 group-hover:bg-teal-100/80">
                        <ExamSymbol name={exam.name} className="h-5 w-5" />
                      </span>
                      <span className="rounded-full border border-teal-200/80 bg-teal-50/80 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-teal-950 transition">
                        {state.code}
                      </span>
                    </div>
                    <h3 className="font-display mt-3.5 text-base font-bold leading-snug text-slate-900 group-hover:text-teal-950 transition">
                      {exam.name}
                    </h3>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <span className="font-medium text-slate-500">
                      {paperCount} paper{paperCount === 1 ? "" : "s"} available
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-teal-800 group-hover:text-teal-950 group-hover:translate-x-0.5 transition">
                      Practice <span aria-hidden="true">→</span>
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
