import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand/VaradhiBrand";
import { ExamSymbol, StateSymbol } from "@/components/exams/CatalogSymbols";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
import { StudentResumePracticeBanner } from "@/components/site/StudentResumePracticeBanner";
import { getHomeCatalogData } from "@/lib/catalog-data";
import { examUrl, stateUrl } from "@/lib/public-urls";
import { absoluteUrl, SITE_DESCRIPTION } from "@/lib/site";
import { getExamTeluguMetadata } from "@/lib/telugu-seo";
import { getActiveSurvey } from "@/app/actions/surveys";
import { SurveyPopup } from "@/components/dashboard/SurveyPopup";

// ⚡ Cache on Edge CDN and revalidate in the background every 5 minutes
export const revalidate = 300;

export const metadata: Metadata = {
  title: {
    absolute: "Varadhi Prep - TG & AP Competitive Exams Free Mock Tests | తెలంగాణ పోలీస్ & పోటీ పరీక్షలు",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Varadhi Prep",
    "TG & AP Competitive Exams Free Mock Tests",
    "Telangana constable exam date",
    "Telangana police mock test",
    "Telangana police syllabus",
    "Telangana constable mock test",
    "Telangana police exam mock test",
    "Telangana police exam date",
    "tg police exam date",
    "tg police exam syllabus",
    "Telangana police constable syllabus 2026",
    "TS police constable mock test in telugu free",
    "TGPRB police constable mock test 2026",
    "TSLPRB police constable test series",
    "TG Police Constable grand test online",
    "Telangana police constable preliminary written test",
    "TSPSC mock test free",
    "TGPSC online test series",
    "TG TET mock test papers",
    "TG TET 2026 practice test",
    "APPSC mock test in Telugu",
    "Telangana competitive exams online test series",
    "Telangana history and movement practice test",
    "Current affairs mock test for Telangana exams",
    "తెలంగాణ పోలీస్ కానిస్టేబుల్ మాక్ టెస్ట్",
    "తెలంగాణ పోలీస్ కానిస్టేబుల్ సిలబస్",
    "తెలంగాణ పోలీస్ కానిస్టేబుల్ పరీక్ష తేదీ 2026",
    "తెలంగాణ పోలీస్ ఎగ్జామ్ డేట్",
    "తెలంగాణ కానిస్టేబుల్ ఆన్‌లైన్ టెస్ట్ 2026",
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
    alternateName: ["VaradhiPrep", "Varadhi Prep Mock Tests", "TG and AP State Exam Mock Tests", "తెలంగాణ పోలీస్ మాక్ టెస్ట్"],
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
        {/* Hero Heading & Quick Search */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="max-w-xl min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-teal-50/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-900">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600" aria-hidden="true" />
              Telangana &amp; Andhra Pradesh
            </span>
            <h1 className="font-display mt-2.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-[1.75rem] lg:text-[2rem] leading-tight">
              TG &amp; AP Competitive Exams Mock Tests &amp; Official Syllabus
            </h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
              Practise bilingual mock tests and check official syllabi for TGPRB Police Constable, TG TET, TSPSC &amp; APPSC.
            </p>
          </div>
          <div className="w-full max-w-xl lg:shrink-0">
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
                  placeholder="Search exam or syllabus (e.g. TG Police Syllabus, TET, TGPSC)..."
                  aria-label="Search exams and syllabi"
                  className="w-full min-w-0 border-none bg-transparent px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-0"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-teal-800 hover:bg-teal-900 active:bg-teal-950 px-4 py-2 text-xs font-semibold text-white shadow-xs transition active:scale-[0.98]"
                >
                  Search
                </button>
              </div>

              {/* Popular Exam Direct Shortcuts */}
              <div className="mt-3 flex flex-wrap items-center justify-start lg:justify-end gap-1.5 text-xs">
                <span className="mr-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Popular:</span>
                {[
                  { label: "Police Constable Guide", href: "/mock-tests/telangana/police-constable-free-mock-test" },
                  { label: "TG Police 7,112 Vacancies", href: "/mock-tests/telangana/police-constable-free-mock-test#exam-schedule" },
                  { label: "TG Police PET & Standards", href: "/mock-tests/telangana/police-constable-free-mock-test#physical-standards" },
                  { label: "TG Police GO 87 Age", href: "/mock-tests/telangana/police-constable-free-mock-test#age-limits" },
                  { label: "Exam Guides & Syllabus", href: "/mock-tests#exam-guides" },
                  { label: "TG TET 2026", href: "/mock-tests/telangana/tg-tet-2026" },
                  { label: "TGPSC", href: "/mock-tests/telangana" },
                  { label: "APPSC", href: "/mock-tests/andhra-pradesh" },
                  { label: "Endowment Officer", href: "/mock-tests/telangana/endowment-officer" },
                  { label: "AEE", href: "/mock-tests/telangana/aee" },
                ].map((tag) => (
                  <Link
                    key={tag.label}
                    href={tag.href}
                    className="inline-flex min-h-[28px] items-center rounded-full border border-slate-200/90 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-teal-300 hover:bg-teal-50/70 hover:text-teal-950"
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
                Available Exams & Test Series
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

              const fullExamName = exam.name.toLowerCase().includes(state.name.toLowerCase())
                ? exam.name
                : `${state.name} ${exam.name}`;
              const teluguMeta = getExamTeluguMetadata(exam.slug, exam.name, state.slug);
              const isPolice =
                exam.slug.includes("police") ||
                exam.name.toLowerCase().includes("police") ||
                exam.name.toLowerCase().includes("constable");
              const teluguSubtitle = teluguMeta?.teluguName || (isPolice ? "తెలంగాణ పోలీస్ కానిస్టేబుల్ (TGPRB / TSLPRB)" : "");

              return (
                <Link
                  key={exam.id}
                  href={examUrl(state.slug, exam.slug)}
                  prefetch={true}
                  className="student-card group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md"
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-600/0 via-teal-500/35 to-teal-600/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-teal-100/90 bg-teal-50/70 text-teal-900 shadow-2xs transition-all duration-200 group-hover:scale-105 group-hover:border-teal-200 group-hover:bg-teal-100/80">
                        <ExamSymbol name={exam.name} className="h-5 w-5" />
                      </span>
                      <div className="flex flex-wrap items-center justify-end gap-1.5 min-w-0">
                        {category?.name && (
                          <span className="rounded-full border border-slate-200/90 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 leading-snug">
                            {category.name}
                          </span>
                        )}
                        <span className="rounded-full border border-teal-200/80 bg-teal-50/80 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-teal-950 transition">
                          {state.code}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-display mt-3.5 text-base font-bold leading-snug text-slate-900 group-hover:text-teal-950 transition break-words">
                      {fullExamName}
                    </h3>
                    {teluguSubtitle && (
                      <p className="mt-1 text-xs font-semibold leading-relaxed text-teal-800 break-words">
                        {teluguSubtitle}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
                    <span className="font-medium text-slate-500">
                      {paperCount} paper{paperCount === 1 ? "" : "s"} available
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 font-bold text-teal-800 group-hover:text-teal-950 group-hover:translate-x-0.5 transition">
                      Official Guide &amp; Tests <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Official Exam Guides & Physical Standards Section */}
        <div id="exam-guides" className="mt-8 sm:mt-12 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 lg:p-10 shadow-xs scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Official Recruitment Standards
              </p>
              <h2 className="font-display mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Official Exam Guides, Physical Standards &amp; Selection Criteria
              </h2>
              <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-slate-600">
                Authoritative breakdown of PET/PMT physical standards, cadre vacancies, GO Ms 87 age relaxations, and official exam patterns for state competitive recruitment.
              </p>
            </div>
            <Link
              href="/mock-tests"
              className="inline-flex shrink-0 items-center gap-1 text-xs sm:text-sm font-bold text-teal-800 hover:text-teal-950 transition"
            >
              Browse all exams <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="student-stagger mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* TG Police Constable Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-teal-200/90 bg-teal-50/20 p-5 transition hover:border-teal-400 hover:shadow-xs">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-teal-100/90 border border-teal-200 px-2.5 py-0.5 text-[11px] font-bold text-teal-950">
                    TSLPRB · 7,112 Posts
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Rc No. 189/2026
                  </span>
                </div>
                <h3 className="font-display mt-3 text-base sm:text-lg font-bold text-slate-950">
                  Telangana Police Constable (Civil &amp; Allied)
                </h3>
                <p className="mt-1 text-xs font-semibold text-teal-800">
                  తెలంగాణ పోలీస్ కానిస్టేబుల్ రిక్రూట్‌మెంట్
                </p>
                <div className="mt-3.5 space-y-2 text-xs text-slate-700">
                  <p className="flex items-start gap-1.5">
                    <span className="text-teal-700 font-bold shrink-0">•</span>
                    <span><strong>PET Standards:</strong> 1600m Run (Men 7m15s), 800m (Women 5m20s), Long Jump, Shot Put.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <span className="text-teal-700 font-bold shrink-0">•</span>
                    <span><strong>Age Limits:</strong> 18–27 yrs + 5 yrs GO Ms 87 relaxation up to 32/37/45 yrs.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <span className="text-teal-700 font-bold shrink-0">•</span>
                    <span><strong>Written Test:</strong> 200 Qs, 200 Marks, 3 Hours, 20% Negative Marking.</span>
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-teal-100 pt-3 flex flex-wrap gap-2 text-xs font-bold text-teal-800">
                <Link
                  href="/mock-tests/telangana/police-constable-free-mock-test"
                  className="rounded-lg bg-teal-800 text-white px-3 py-1.5 hover:bg-teal-900 transition"
                >
                  Official Exam Guide →
                </Link>
                <Link
                  href="/mock-tests/telangana/police-constable-free-mock-test#physical-standards"
                  className="rounded-lg bg-white border border-teal-200 px-3 py-1.5 hover:bg-teal-50 transition"
                >
                  PMT &amp; PET Standards →
                </Link>
                <Link
                  href="/mock-tests/telangana/police-constable-free-mock-test#exam-schedule"
                  className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition"
                >
                  7,112 Vacancies →
                </Link>
                <Link
                  href="/mock-tests/telangana/police-constable-free-mock-test#age-limits"
                  className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition"
                >
                  Age Limits (GO 87) →
                </Link>
                <Link
                  href="/mock-tests/telangana/police-constable-free-mock-test#exam-pattern"
                  className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition"
                >
                  PWT Scheme &amp; Pattern →
                </Link>
              </div>
            </div>

            {/* TG TET Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 transition hover:border-teal-300 hover:shadow-xs">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-800">
                    School Education Dept
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    State Level TET
                  </span>
                </div>
                <h3 className="font-display mt-3 text-base sm:text-lg font-bold text-slate-950">
                  Telangana Teacher Eligibility Test (TG TET 2026)
                </h3>
                <p className="mt-1 text-xs font-semibold text-teal-800">
                  తెలంగాణ ఉపాధ్యాయ అర్హత పరీక్ష
                </p>
                <div className="mt-3.5 space-y-2 text-xs text-slate-700">
                  <p className="flex items-start gap-1.5">
                    <span className="text-teal-700 font-bold shrink-0">•</span>
                    <span><strong>Exam Pattern:</strong> 150 Multiple Choice Questions, 150 Marks, 150 Minutes.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <span className="text-teal-700 font-bold shrink-0">•</span>
                    <span><strong>Scoring Scheme:</strong> Zero negative marking with bilingual question papers.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <span className="text-teal-700 font-bold shrink-0">•</span>
                    <span><strong>Sections:</strong> Child Development, Telugu, English, Mathematics &amp; Science.</span>
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3 flex flex-wrap gap-2 text-xs font-bold text-teal-800">
                <Link
                  href="/mock-tests/telangana/tg-tet-2026#exam-pattern"
                  className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 hover:bg-slate-100 text-slate-700 transition"
                >
                  Exam Pattern →
                </Link>
                <Link
                  href="/mock-tests/telangana/tg-tet-2026#curriculum-topics"
                  className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 hover:bg-slate-100 text-slate-700 transition"
                >
                  Curriculum Topics →
                </Link>
                <Link
                  href="/mock-tests/telangana/tg-tet-2026"
                  className="rounded-lg bg-teal-800 text-white px-3 py-1.5 hover:bg-teal-900 transition"
                >
                  TET Mock Tests →
                </Link>
              </div>
            </div>

            {/* Public Service Commissions Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 transition hover:border-teal-300 hover:shadow-xs">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-800">
                    TGPSC &amp; APPSC
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Gazetted &amp; Non-Gazetted
                  </span>
                </div>
                <h3 className="font-display mt-3 text-base sm:text-lg font-bold text-slate-950">
                  State Public Service Commission Examinations
                </h3>
                <p className="mt-1 text-xs font-semibold text-teal-800">
                  గ్రూప్స్ &amp; ఇంజనీరింగ్ సర్వీసెస్
                </p>
                <div className="mt-3.5 space-y-2 text-xs text-slate-700">
                  <p className="flex items-start gap-1.5">
                    <span className="text-teal-700 font-bold shrink-0">•</span>
                    <span><strong>Cadres:</strong> Group 1, Group 2, Group 3, Assistant Executive Engineers (AEE), EO.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <span className="text-teal-700 font-bold shrink-0">•</span>
                    <span><strong>Core Coverage:</strong> General Studies, Mental Ability, State Movement &amp; Economy.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <span className="text-teal-700 font-bold shrink-0">•</span>
                    <span><strong>Practice Series:</strong> Timed full-length papers and targeted chapter tests.</span>
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3 flex flex-wrap gap-2 text-xs font-bold text-teal-800">
                <Link
                  href="/mock-tests/telangana"
                  className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 hover:bg-slate-100 text-slate-700 transition"
                >
                  Telangana TGPSC Series →
                </Link>
                <Link
                  href="/mock-tests/andhra-pradesh"
                  className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 hover:bg-slate-100 text-slate-700 transition"
                >
                  Andhra Pradesh APPSC Series →
                </Link>
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
              Syllabus-aligned computer-based mock tests for competitive exam aspirants across Telangana and Andhra Pradesh. Free practice for TGPRB Police Constable, TSPSC, APPSC, and TET.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              © {new Date().getFullYear()} Varadhi Prep. All rights reserved.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Quick links</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link href="/mock-tests#exam-guides" className="hover:text-white transition">Exam Guides &amp; Syllabus</Link>
              <Link href="/mock-tests/telangana/police-constable-free-mock-test" className="hover:text-white transition">Police Constable</Link>
              <Link href="/mock-tests/telangana/police-constable-free-mock-test#physical-standards" className="hover:text-white transition">Police PET Standards</Link>
              <Link href="/mock-tests/telangana/police-constable-free-mock-test#exam-schedule" className="hover:text-white transition">Police 7,112 Vacancies</Link>
              <Link href="/mock-tests/telangana/tg-tet-2026" className="hover:text-white transition">TG TET 2026</Link>
              <Link href="/mock-tests/telangana" className="hover:text-white transition">Telangana Exams</Link>
              <Link href="/mock-tests/andhra-pradesh" className="hover:text-white transition">Andhra Pradesh Exams</Link>
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
