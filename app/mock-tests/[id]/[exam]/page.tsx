import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import MockTestsPage, { type Filters } from "@/app/mock-tests/page";
import { CatalogSteps } from "@/components/exams/CatalogSteps";
import { ExamSymbol } from "@/components/exams/CatalogSymbols";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
import {
  displayMockTestHeading,
  formatExamFallbackDescription,
  formatExamFallbackTitle,
  formatExamHeading,
  hasMockTestSuffixOrMention,
  studentFacingMockTestTitle,
} from "@/lib/exam-catalog";
import { buildPaperDisplayMap, type OrderedPaper } from "@/lib/papers";
import { resolvePublicRoute } from "@/lib/public-route-data";
import { collectionStructuredData, isIndexableCollectionQuery, publicCollectionMetadata } from "@/lib/public-seo";
import { examUrl, mockTestUrl, paperUrl, specializationUrl, stateUrl, subjectUrl } from "@/lib/public-urls";
import { resolveSeoFields } from "@/lib/seo-fields";
import { absoluteUrl } from "@/lib/site";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { AccountActionButton } from "@/components/exams/AccountActionButton";
import { MockTestCardAction } from "@/components/mock-tests/MockTestCardAction";
import { getExamTeluguMetadata } from "@/lib/telugu-seo";
import {
  formatMarkValue,
  formatPatternNegativeDisplay,
  resolveMockTestScoring,
  summarizeExamNegativeMarking,
  type MockTestStatsSummary,
} from "@/lib/scoring";

// ⚡ Cache on global Edge CDN and revalidate every 5 minutes
export const revalidate = 300;

type Props = { params: Promise<{ id: string; exam: string }>; searchParams: Promise<Filters> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id, exam } = await params;
  const context = await resolvePublicRoute({ stateSlug: id, examSlug: exam });
  if (!context?.exam) return { title: "Exam Mock Tests Not Found", robots: { index: false, follow: false } };
  const canonical = examUrl(context.state.slug, context.exam.slug);
  const teluguData = getExamTeluguMetadata(context.exam.slug, context.exam.name, context.state.slug);
  const fallbackTitle = teluguData ? teluguData.bilingualPageTitle : formatExamFallbackTitle(context.exam.name, context.state.name);
  const fallbackDescription = teluguData ? teluguData.bilingualDescription : formatExamFallbackDescription(context.exam.name, context.state.name);
  const seo = resolveSeoFields(context.exam, {
    title: fallbackTitle,
    description: fallbackDescription,
  });
  return publicCollectionMetadata({
    ...seo,
    keywords: teluguData?.keywords,
    canonical,
    indexable: isIndexableCollectionQuery(await searchParams),
  });
}

const getCachedFaqs = unstable_cache(
  async (examId: string) => {
    try {
      const publicClient = createPublicClient();
      const { data } = await publicClient
        .from("exam_page_faqs")
        .select("id, question, answer, display_order")
        .eq("exam_group_id", examId)
        .order("display_order");
      return data ?? [];
    } catch (err) {
      console.error("Failed to fetch exam page faqs:", err);
      return [];
    }
  },
  ["exam-faqs"],
  { revalidate: 300 }
);

export default async function ExamPage({ params, searchParams }: Props) {
  const { id, exam } = await params;
  const filters = await searchParams;
  const context = await resolvePublicRoute({ stateSlug: id, examSlug: exam });
  if (!context?.exam) notFound();

  const canonical = examUrl(context.state.slug, context.exam.slug);
  if (context.usedAlias || id !== context.state.slug || exam !== context.exam.slug) permanentRedirect(canonical);

  const hasListingQuery = Boolean(filters.view === "all" || filters.q || (filters.type && filters.type !== "all") || (filters.page && filters.page !== "1"));
  if (hasListingQuery) {
    return MockTestsPage({ searchParams: Promise.resolve({ ...filters, state: context.state.slug, exam: context.exam.slug }), canonicalPath: canonical });
  }

  const { catalog } = context;
  const papers = catalog.papers.filter((paper) => paper.exam_group_id === context.exam!.id);
  const paperDisplayById = buildPaperDisplayMap(papers as OrderedPaper[]);
  const paperIds = new Set(papers.map((paper) => paper.id));
  const statsByTestId = new Map(
    ((catalog.stats ?? []) as (MockTestStatsSummary & { mock_test_id: string })[]).map((row) => [
      row.mock_test_id,
      row,
    ]),
  );
  const examNegativeSummary = summarizeExamNegativeMarking(papers);
  const subjectById = new Map(catalog.subjects.map((item) => [item.id, item]));
  const sectionById = new Map(catalog.sections.map((item) => [item.id, item]));

  const getTestTimestamp = (test: (typeof catalog.tests)[number]) => {
    const raw =
      (test as { published_at?: string | null; created_at?: string | null; updated_at?: string | null }).published_at ||
      (test as { created_at?: string | null }).created_at ||
      test.updated_at;
    return raw ? new Date(raw).getTime() : 0;
  };

  const tests = catalog.tests
    .filter((test) => paperIds.has(test.paper_id))
    .sort((a, b) => {
      const timeDiff = getTestTimestamp(b) - getTestTimestamp(a);
      if (timeDiff !== 0) return timeDiff;
      return Number(b.series_number ?? 0) - Number(a.series_number ?? 0);
    });
  const specializations = catalog.specializations.filter((item) => item.exam_group_id === context.exam!.id);
  const teluguData = getExamTeluguMetadata(context.exam.slug, context.exam.name, context.state.slug);
  const ageLimits = teluguData?.ageLimits ?? teluguData?.schedule?.ageLimits;
  const examCategory = catalog.categories.find((cat) => cat.id === context.exam!.exam_id);
  const boardName = examCategory?.name ?? null;

  const patternNegativeDisplay = formatPatternNegativeDisplay(
    teluguData?.pattern?.negativeMarking,
    examNegativeSummary.positiveValues,
  );
  const fallbackTitle = teluguData ? teluguData.bilingualPageTitle : formatExamFallbackTitle(context.exam.name, context.state.name);
  const fallbackDescription = teluguData ? teluguData.bilingualDescription : formatExamFallbackDescription(context.exam.name, context.state.name);
  const seo = resolveSeoFields(context.exam, {
    title: fallbackTitle,
    description: fallbackDescription,
  });
  
  const savedQuestions = await getCachedFaqs(context.exam!.id);
    
  const introduction = context.exam.description?.trim() || seo.description;
  const statePrefixedName = context.exam.name.toLowerCase().includes(context.state.name.toLowerCase())
    ? context.exam.name
    : `${context.state.name} ${context.exam.name}`;
  const examHeading = formatExamHeading(context.exam.name);
  
  const standardQuestions = [
    { question: `Where can I take ${hasMockTestSuffixOrMention(context.exam.name) ? context.exam.name : `${context.exam.name} mock tests`}?`, answer: `Choose a paper on this page, open an available mock test and start practising ${context.exam.name} on Varadhi Prep.`, displayOrder: 0 },
    { question: `How many ${hasMockTestSuffixOrMention(context.exam.name) ? `${context.exam.name} tests` : `${context.exam.name} mock tests`} are available?`, answer: tests.length > 0 ? `${tests.length} published mock test${tests.length === 1 ? " is" : "s are"} currently available across ${papers.length} paper${papers.length === 1 ? "" : "s"}. New published tests automatically appear on this page.` : "Mock tests are being prepared and will appear on this page after publication.", displayOrder: 1 },
    { question: `Can I review my ${context.exam.name} answers?`, answer: "Yes. After submitting a test, you can review your score, selected answers, correct answers and available explanations from your student dashboard.", displayOrder: 2 },
  ];
  const savedByOrder = new Map((savedQuestions ?? []).map((item) => [item.display_order, item]));
  const englishFaqItems = teluguData?.englishFaqs ?? [];
  const teluguFaqItems = teluguData?.teluguFaqs ?? [];
  const questions = [
    ...standardQuestions.map((item) => savedByOrder.get(item.displayOrder) ?? item),
    ...englishFaqItems,
    ...(savedQuestions ?? []).filter((item) => item.display_order >= standardQuestions.length),
    ...teluguFaqItems,
  ].map((item) => ({ question: item.question, answer: item.answer }));

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: seo.title,
    description: seo.description,
    provider: {
      "@type": "Organization",
      name: "Varadhi Prep",
      url: absoluteUrl("/"),
    },
    educationalLevel: "Competitive Examination",
    inLanguage: ["en", "te"],
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      category: "Free",
    },
  };

  const eventJsonLd = teluguData?.schedule?.prelimsExamDate
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: `${statePrefixedName} Preliminary Written Test (PWT) 2026`,
        description: `Official ${statePrefixedName} Preliminary Written Test (PWT) conducted by ${teluguData.schedule.authority}.`,
        startDate: "2026-12-20T10:00:00+05:30",
        endDate: "2026-12-20T13:00:00+05:30",
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: `Designated Examination Centers across ${context.state.name}`,
          address: {
            "@type": "PostalAddress",
            addressRegion: context.state.name,
            addressCountry: "IN",
          },
        },
        organizer: {
          "@type": "Organization",
          name: teluguData.schedule.authority,
          url: teluguData.schedule.officialWebsite,
        },
      }
    : null;

  const occupationJsonLd = teluguData?.jobProfile
    ? {
        "@context": "https://schema.org",
        "@type": "Occupation",
        name: teluguData.jobProfile.roleTitle,
        description: `${teluguData.jobProfile.roleTitle} in ${teluguData.jobProfile.department}. Roles, duties, eligibility, and pay scale.`,
        estimatedSalary: {
          "@type": "MonetaryAmountDistribution",
          name: "Gross Monthly Salary",
          currency: "INR",
        },
        responsibilities: teluguData.jobProfile.duties.map(
          (d) => `${d.title}${d.teluguTitle ? ` (${d.teluguTitle})` : ""}: ${d.description}`,
        ),
        occupationalCategory: "Public Administration and Government Services",
        qualifications: `${teluguData.jobProfile.eligibility.education} Age Limit: ${teluguData.jobProfile.eligibility.ageLimit}`,
      }
    : null;

  const structuredData = [
    ...collectionStructuredData(seo.title, seo.description, canonical, [
      { name: "Home", path: "/" },
      { name: "Mock tests", path: "/mock-tests" },
      { name: context.state.name, path: stateUrl(context.state.slug) },
      { name: context.exam.name, path: canonical },
    ]),
    courseJsonLd,
    ...(eventJsonLd ? [eventJsonLd] : []),
    ...(occupationJsonLd ? [occupationJsonLd] : []),
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
    { "@context": "https://schema.org", "@type": "ItemList", name: examHeading, numberOfItems: tests.length, itemListElement: tests.slice(0, 12).map((test, index) => { const paper = papers.find((item) => item.id === test.paper_id)!; const subject = test.subject_id ? subjectById.get(test.subject_id) : undefined; const section = test.subject_section_id ? sectionById.get(test.subject_section_id) : undefined; return { "@type": "ListItem", position: index + 1, name: studentTestTitle(test, context.exam!.name, paperDisplayById.get(paper.id)?.shortLabel ?? paper.name, subject?.name, section?.name), url: absoluteUrl(mockTestUrl(context.state.slug, context.exam!.slug, paper.slug, test.slug)) }; }) },
  ];

  return (
    <main className="student-page relative min-h-screen bg-[#f6faf8] text-[#132621] w-full max-w-full overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[#eaf2ef]/70 via-[#f2f7f5]/40 to-transparent -z-10" />
      <JsonLd data={structuredData} />
      <PublicHeader />
      <section className="border-b border-teal-900/5 bg-gradient-to-b from-[#eaf2ef]/60 via-[#f2f7f5]/30 to-transparent">
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-12">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-teal-800 py-0.5 inline-flex items-center transition">Home</Link>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <Link href={stateUrl(context.state.slug)} className="hover:text-teal-800 py-0.5 inline-flex items-center transition">{context.state.name}</Link>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold py-0.5 inline-flex items-center break-words">{context.exam.name}</span>
          </nav>

          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-teal-50/80 px-3 py-1 text-xs font-bold text-teal-950">
                <ExamSymbol name={context.exam.name} className="h-3.5 w-3.5 text-teal-800" />
                {context.state.name} State Examination
              </span>
              {teluguData?.schedule?.notificationNumber && (
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-2xs">
                  Notification: {teluguData.schedule.notificationNumber}
                </span>
              )}
              {teluguData?.schedule?.totalVacancies && (
                <span className="rounded-full border border-teal-200 bg-teal-50/80 px-2.5 py-0.5 text-xs font-bold text-teal-900 shadow-2xs">
                  {teluguData.schedule.totalVacancies.toLocaleString()} Vacancies
                </span>
              )}
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-2xs">
                Online Mock Tests
              </span>
            </div>

            <h1 className="font-display mt-3.5 max-w-4xl text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl break-words">
              {examHeading.toLowerCase().includes(context.state.name.toLowerCase())
                ? examHeading
                : `${context.state.name} ${examHeading}`}
            </h1>

            {teluguData && (
              <p className="mt-2 text-base font-bold text-teal-950 sm:text-lg">
                {teluguData.teluguTitle}
              </p>
            )}

            <p className="mt-3.5 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
              {introduction}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
              {teluguData?.schedule?.prelimsExamDate && (
                <a
                  href="#exam-schedule"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-teal-300 bg-teal-50/80 px-3 py-1.5 text-xs font-bold text-teal-950 hover:bg-teal-100 transition shadow-2xs"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-700" aria-hidden="true" />
                  PWT Exam Date: {teluguData.schedule.prelimsExamDate}
                </a>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs">
                <span className="font-semibold text-slate-900">{papers.length}</span> {papers.length === 1 ? "Paper" : "Papers"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs">
                <span className="font-semibold text-slate-900">{tests.length}</span> Practice Tests
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs">
                Bilingual (English &amp; Telugu)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs">
                {teluguData?.pattern?.mode ? `Official Mode: ${teluguData.pattern.mode}` : "Online Practice Tests"}
              </span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <a
                href="#papers"
                className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center rounded-xl bg-teal-800 hover:bg-teal-900 active:bg-teal-950 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition shadow-xs text-center"
              >
                Choose a paper ↓
              </a>
              {teluguData?.schedule && (
                <a
                  href="#exam-schedule"
                  className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 transition shadow-2xs text-center"
                >
                  Vacancies &amp; Dates ↓
                </a>
              )}
              
              <AccountActionButton canonical={canonical} />
            </div>
          </div>
        </div>
      </section>

      

      <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10 px-4 py-6 sm:px-8 sm:py-10">
        <CatalogSteps
          state={{ value: context.state.name, href: "/mock-tests" }}
          exam={{ value: context.exam.name, href: stateUrl(context.state.slug) }}
        />
        {specializations.length > 0 && (
          <section aria-labelledby="specialisations-title">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Exam paths</p>
            <h2 id="specialisations-title" className="font-display mt-1 text-2xl font-bold sm:text-3xl">
              Choose a specialisation
            </h2>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0 max-w-full">
              {specializations.map((item) => (
                <Link
                  key={item.id}
                  href={specializationUrl(context.state.slug, context.exam!.slug, item.slug)}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition hover:border-teal-400 hover:shadow-md"
                >
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-teal-800 transition">
                      {item.name}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      {item.description || `View papers and mock tests for ${item.name}.`}
                    </p>
                  </div>
                  <span className="mt-4 text-xs font-bold text-teal-800 group-hover:translate-x-1 transition">
                    Explore specialisation →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Papers Section - Clean Responsive Cards */}
        <section id="papers" aria-labelledby="papers-title" className="scroll-mt-24 [content-visibility:auto] [contain-intrinsic-size:auto_400px]">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Choose paper</p>
          <h2 id="papers-title" className="font-display mt-1 text-2xl font-bold sm:text-3xl text-slate-950 break-words">
            {hasMockTestSuffixOrMention(context.exam.name) ? `${context.exam.name} papers` : `${context.exam.name} mock test papers`}
          </h2>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600">
            Select a paper to practise its dedicated mock test series, review topic coverage, and check bilingual explanations.
          </p>

          {papers.length === 0 ? (
            <EmptyState title="Papers are being prepared" detail="This exam landing page is ready. Its papers and mock tests will appear here after the administrator publishes them." />
          ) : (
            <div className="student-stagger mt-5 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 min-w-0 max-w-full">
              {papers.map((paper) => {
                const display = paperDisplayById.get(paper.id);
                const specialization = paper.specialization_id
                  ? specializations.find((s) => s.id === paper.specialization_id)
                  : undefined;
                const paperTests = tests.filter((t) => t.paper_id === paper.id);

                return (
                  <Link
                    key={paper.id}
                    href={paperUrl(context.state.slug, context.exam!.slug, paper.slug)}
                    className="student-card group min-w-0 max-w-full overflow-hidden flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs transition hover:border-teal-400 hover:shadow-md"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                          <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-teal-800">
                            {display?.shortLabel ?? "Paper"}
                          </span>
                          {specialization && (
                            <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold text-slate-700 break-words">
                              {specialization.name}
                            </span>
                          )}
                        </div>
                        <span className="shrink-0 text-xs font-bold text-slate-500">
                          {paperTests.length} mock test{paperTests.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <h3 className="font-display mt-2.5 sm:mt-3 text-base sm:text-lg font-bold leading-snug text-slate-900 group-hover:text-teal-800 transition break-words">
                        {paper.name}
                      </h3>
                      {paper.question_count && (
                        <p className="mt-1.5 text-xs text-slate-500">
                          {paper.question_count} questions per paper • +{formatMarkValue(Number(paper.default_correct_marks ?? 1))} /{" "}
                          {Number(paper.default_negative_marks ?? 0) > 0
                            ? `-${formatMarkValue(Number(paper.default_negative_marks))} negative marking`
                            : "No negative marking"}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs gap-2">
                      <span className="font-semibold text-slate-500 truncate">Practice Series</span>
                      <span className="inline-flex items-center gap-1 font-bold text-teal-800 group-hover:translate-x-1 transition shrink-0">
                        Open paper →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Latest Mock Tests Section - Clean Responsive Cards */}
        <section aria-labelledby="tests-title" className="[content-visibility:auto] [contain-intrinsic-size:auto_500px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Timed practice</p>
              <h2 id="tests-title" className="font-display mt-1 text-2xl font-bold sm:text-3xl text-slate-950">
                Latest mock tests
              </h2>
            </div>
          </div>

          {tests.length === 0 ? (
            <EmptyState title="Mock tests are coming soon" detail="The exam page is active. Published mock tests will automatically appear here." />
          ) : (
            <>
              <div className="student-stagger mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 min-w-0 max-w-full">
                {tests.slice(0, 4).map((test) => {
                  const paper = papers.find((item) => item.id === test.paper_id)!;
                  const subject = test.subject_id ? subjectById.get(test.subject_id) : undefined;
                  const section = test.subject_section_id ? sectionById.get(test.subject_section_id) : undefined;
                  const testNum = String(test.series_number ?? 1).padStart(2, "0");
                  const isFree = test.access_type === "free";
                  const testHref = mockTestUrl(context.state.slug, context.exam!.slug, paper.slug, test.slug);
                  const folderUrl = subject
                    ? subjectUrl(context.state.slug, context.exam!.slug, paper.slug, subject.slug)
                    : paperUrl(context.state.slug, context.exam!.slug, paper.slug);
                  const folderName = subject?.name ?? paper.name;
                  const testHeading = displayMockTestHeading({
                    subjectName: subject?.name,
                    sectionName: section?.name,
                    testScope: test.test_scope,
                    seriesNumber: Number(test.series_number ?? 1),
                  });
                  const paperLabel = paperDisplayById.get(paper.id)?.shortLabel ?? "Paper";
                  const testScoring = resolveMockTestScoring({
                    stats: statsByTestId.get(test.id),
                    targetQuestionCount: test.target_question_count,
                    paperQuestionCount: paper.question_count,
                    defaultCorrectMarks: paper.default_correct_marks,
                    defaultNegativeMarks: paper.default_negative_marks,
                  });

                  return (
                    <article
                      key={test.id}
                      className="group min-w-0 max-w-full overflow-hidden flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs transition hover:border-teal-400 hover:shadow-md"
                    >
                      <div className="min-w-0 max-w-full">
                        <div className="flex items-start justify-between gap-2.5 min-w-0 max-w-full">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-100/70 text-xs font-bold text-slate-900 shadow-2xs transition-all duration-200 group-hover:border-slate-300 group-hover:bg-slate-200/60">
                              {testNum}
                            </span>
                            <div className="min-w-0 flex-1">
                              <Link
                                href={testHref}
                                className="font-display block text-sm sm:text-base font-bold leading-snug text-slate-900 hover:text-teal-800 transition break-words"
                              >
                                {testHeading}
                              </Link>
                              <p className="mt-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-teal-700 leading-relaxed break-words">
                                {paperLabel} · {paper.name}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold ${
                              isFree
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-amber-50 text-amber-900 border border-amber-200"
                            }`}
                          >
                            {isFree ? "Free" : "Paid"}
                          </span>

                        </div>

                        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs border border-slate-100 min-w-0 max-w-full">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-bold text-slate-900">{testScoring.questionCount ?? "—"}</span>
                            <span className="text-[11px] font-medium text-slate-500">Qs</span>
                          </div>
                          <span className="text-slate-300 font-bold">•</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-bold text-slate-900">{test.duration_minutes}</span>
                            <span className="text-[11px] font-medium text-slate-500">Mins</span>
                          </div>
                          <span className="text-slate-300 font-bold">•</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[11px] font-medium text-slate-600">Timed Practice</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 gap-2 min-w-0 max-w-full">
                        <span className="text-xs font-semibold text-slate-500 break-words">
                          {testScoring.cardNegativeLabel} · Bilingual
                        </span>
                        <div className="shrink-0">
                          <MockTestCardAction
                            testId={test.id}
                            testHref={testHref}
                            testTitle={testHeading}
                            folderUrl={folderUrl}
                            folderName={folderName}
                            folderType={test.subject_id ? "subject" : "paper"}
                            examName={context.exam!.name}
                            paperName={paper.name}
                            subjectName={subject?.name}
                            stateCode={context.state.code}
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {tests.length > 4 && (
                <div className="mt-6 flex justify-center">
                  <Link
                    href={`${canonical}?view=all`}
                    rel="nofollow"
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 transition shadow-xs"
                  >
                    View all {tests.length} mock tests →
                  </Link>
                </div>
              )}
            </>
          )}
        </section>

        {/* Important Dates, Notification & Vacancy Details */}
        {teluguData?.schedule && (
          <section
            id="exam-schedule"
            aria-labelledby="exam-schedule-heading"
            className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs [content-visibility:auto] [contain-intrinsic-size:auto_600px]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  {teluguData.schedule.authority}
                </p>
                <h2
                  id="exam-schedule-heading"
                  className="font-display mt-1 text-2xl font-bold sm:text-3xl text-slate-900"
                >
                  {statePrefixedName} Notification &amp; Examination Schedule 2026
                </h2>
              </div>
              {teluguData.schedule.totalVacancies ? (
                <span className="rounded-full bg-teal-50 border border-teal-200 px-3.5 py-1 text-xs font-bold text-teal-900">
                  Total {teluguData.schedule.totalVacancies.toLocaleString()} Vacancies
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 border border-slate-200 px-3.5 py-1 text-xs font-bold text-slate-800">
                  PWT Exam Date: {teluguData.schedule.prelimsExamDate}
                </span>
              )}
            </div>

            <p className="mt-2.5 max-w-3xl text-xs sm:text-sm leading-relaxed text-slate-600">
              {teluguData.schedule.notificationNumber
                ? `Official Notification (${teluguData.schedule.notificationNumber}) issued by ${teluguData.schedule.authority}. Check post-wise vacancies, pay scales, timeline dates, and recruitment stages.`
                : `Check the official examination timeline, preliminary written test (PWT) date, hall ticket release dates, and selection stages for ${statePrefixedName} recruitment.`}
            </p>

            {/* Quick Metrics Cards */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 transition hover:border-teal-300 hover:shadow-xs flex flex-col justify-between">
                <div>
                  <span className="inline-flex rounded-md bg-slate-100 border border-slate-200/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Total Vacancies
                  </span>
                  <p className="font-display mt-2.5 text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {teluguData.schedule.totalVacancies ? `${teluguData.schedule.totalVacancies.toLocaleString()} Posts` : "To be notified"}
                  </p>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-600">Across Notified Cadres</p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 transition hover:border-teal-300 hover:shadow-xs flex flex-col justify-between">
                <div>
                  <span className="inline-flex rounded-md bg-slate-100 border border-slate-200/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    PWT Exam Date
                  </span>
                  <p className="font-display mt-2.5 text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {teluguData.schedule.prelimsExamDate}
                  </p>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-600">{teluguData.schedule.prelimsSession}</p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 transition hover:border-teal-300 hover:shadow-xs flex flex-col justify-between">
                <div>
                  <span className="inline-flex rounded-md bg-slate-100 border border-slate-200/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Pay Scale
                  </span>
                  <p className="font-display mt-2.5 text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {teluguData.jobProfile?.payScale ?? "₹24,280 – ₹72,850"}
                  </p>
                </div>
                <p className="mt-2 text-xs text-slate-500 font-medium">Revised State Pay Scale</p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 transition hover:border-teal-300 hover:shadow-xs flex flex-col justify-between">
                <div>
                  <span className="inline-flex rounded-md bg-teal-50 border border-teal-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-800">
                    Official Portal
                  </span>
                  <p className="font-display mt-2.5 text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {teluguData.schedule.officialWebsite.replace("https://www.", "")}
                  </p>
                </div>
                <p className="mt-2 text-xs font-semibold text-teal-800">{teluguData.schedule.authority}</p>
              </div>
            </div>

            {/* Official Vacancy Distribution Table */}
            {teluguData.schedule.vacancies && teluguData.schedule.vacancies.length > 0 && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
                <div className="bg-slate-50/90 px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Official Post-wise Vacancy Distribution ({teluguData.schedule.notificationNumber ?? "TSLPRB 2026"})
                  </h3>
                  <span className="rounded-full bg-teal-50 border border-teal-200/70 px-2.5 py-0.5 text-[10px] font-bold text-teal-800">
                    {teluguData.schedule.totalVacancies?.toLocaleString()} Total Posts
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/90 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        <th className="py-2.5 px-4 w-16">Code</th>
                        <th className="py-2.5 px-4">Post Name</th>
                        <th className="py-2.5 px-4">Department</th>
                        <th className="py-2.5 px-4">Eligibility</th>
                        <th className="py-2.5 px-4 text-right">Vacancies</th>
                        <th className="py-2.5 px-4 text-right">Pay Scale</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teluguData.schedule.vacancies.map((vac) => (
                        <tr key={vac.postCode} className="hover:bg-slate-50/60 transition">
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-700">{vac.postCode}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900">{vac.postName}</td>
                          <td className="py-2.5 px-4 text-slate-600 text-xs">{vac.department}</td>
                          <td className="py-2.5 px-4 text-slate-600 text-xs">{vac.genderEligibility}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-slate-900">{vac.vacancies.toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-xs font-semibold text-slate-700">{vac.payScale}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 bg-slate-50/80 font-bold text-slate-900">
                        <td colSpan={4} className="py-3 px-4 text-xs uppercase tracking-wider text-slate-700">Total Notified Vacancies</td>
                        <td className="py-3 px-4 text-right font-bold text-teal-900 text-sm">
                          {teluguData.schedule.vacancies.reduce((acc, v) => acc + v.vacancies, 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-xs font-semibold text-slate-600">₹24,280 – ₹72,850</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Events Timeline Table */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200/90">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Detailed Recruitment &amp; Examination Timeline
                </h3>
              </div>
              <div className="divide-y divide-slate-100 bg-white">
                {teluguData.schedule.events.map((evt, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2 sm:gap-4 hover:bg-slate-50/60 transition">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{evt.title}</span>
                        <span className="text-xs font-semibold text-teal-800">({evt.teluguTitle})</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{evt.detail}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">{evt.date}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          evt.status === "Completed"
                            ? "bg-slate-100 text-slate-700 border border-slate-200"
                            : "bg-teal-50 text-teal-800 border border-teal-200"
                        }`}
                      >
                        {evt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-100 bg-teal-50/40 p-4">
              <p className="text-xs sm:text-sm text-teal-950 font-medium">
                Build speed and exam temperament for the <strong>{teluguData.schedule.prelimsExamDate}</strong> OMR test with our free timed tests.
              </p>
              <a
                href="#papers"
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 px-4 py-2 text-xs font-bold text-white transition shadow-xs"
              >
                Start Practicing Free Tests →
              </a>
            </div>
          </section>
        )}

        {/* Official Exam Pattern & Overview */}
        {teluguData?.pattern && (
          <section id="exam-pattern" aria-labelledby="exam-pattern-heading" className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs [content-visibility:auto] [contain-intrinsic-size:auto_600px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  {teluguData.pattern.authority}
                </p>
                <h2 id="exam-pattern-heading" className="font-display mt-1 text-2xl font-bold sm:text-3xl text-slate-900">
                  {statePrefixedName} Exam Pattern &amp; Selection Structure 2026
                </h2>
              </div>
            </div>

            {/* Pattern Metric Cards */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3">
              <div className="rounded-xl border border-slate-200/90 bg-white p-3 sm:p-3.5 text-center transition hover:border-teal-300 hover:shadow-2xs flex flex-col justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Questions</p>
                <p className="font-display mt-1.5 text-base sm:text-lg font-bold text-slate-900">{teluguData.pattern.totalQuestions} Qs</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">Multiple Choice</p>
              </div>
              <div className="rounded-xl border border-slate-200/90 bg-white p-3 sm:p-3.5 text-center transition hover:border-teal-300 hover:shadow-2xs flex flex-col justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Marks</p>
                <p className="font-display mt-1.5 text-base sm:text-lg font-bold text-slate-900">{teluguData.pattern.totalMarks} Marks</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">1 Mark Each</p>
              </div>
              <div className="rounded-xl border border-slate-200/90 bg-white p-3 sm:p-3.5 text-center transition hover:border-teal-300 hover:shadow-2xs flex flex-col justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Duration</p>
                <p className="font-display mt-1.5 text-base sm:text-lg font-bold text-slate-900">{teluguData.pattern.durationMinutes} Mins</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">Timed Practice</p>
              </div>
              <div className="rounded-xl border border-teal-200/80 bg-teal-50/40 p-3 sm:p-3.5 text-center transition hover:border-teal-400 hover:shadow-2xs flex flex-col justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Negative Marks</p>
                <p className="font-display mt-1.5 text-base sm:text-lg font-bold text-teal-950">{patternNegativeDisplay.headline}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-teal-700">{patternNegativeDisplay.detail}</p>
              </div>
              <div className="rounded-xl border border-slate-200/90 bg-white p-3 sm:p-3.5 text-center transition hover:border-teal-300 hover:shadow-2xs flex flex-col justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Languages</p>
                <p className="font-display mt-1.5 text-sm sm:text-base font-bold text-slate-900">{teluguData.pattern.medium}</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">Bilingual</p>
              </div>
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-3 sm:p-3.5 text-center transition hover:border-teal-300 hover:shadow-2xs flex flex-col justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Official Mode</p>
                <p className="font-display mt-1.5 text-sm sm:text-base font-bold text-slate-900">{teluguData.pattern.mode}</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500">Official Format</p>
              </div>
            </div>

            {/* Selection Stages */}
            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-[#f6faf8] p-4 sm:p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">Recruitment Selection Stages</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {teluguData.pattern.stages.map((stage) => (
                  <span key={stage} className="rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs">
                    {stage}
                  </span>
                ))}
              </div>
            </div>

            {/* Minimum Qualifying Marks Table */}
            {teluguData.pattern.qualifyingMarks && teluguData.pattern.qualifyingMarks.length > 0 && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
                <div className="bg-slate-50/90 px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Official Minimum Qualifying Marks (PWT &amp; FWE Stages)
                  </h3>
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                    Para 16(A) Official Rules
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/90 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        <th className="py-2.5 px-4">Community Category</th>
                        <th className="py-2.5 px-4">PWT Qualifying %</th>
                        <th className="py-2.5 px-4">PWT Minimum Marks</th>
                        <th className="py-2.5 px-4">FWE Qualifying %</th>
                        <th className="py-2.5 px-4">FWE Minimum Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teluguData.pattern.qualifyingMarks.map((qm) => (
                        <tr key={qm.category} className="hover:bg-slate-50/60 transition">
                          <td className="py-2.5 px-4 font-semibold text-slate-900">{qm.category}</td>
                          <td className="py-2.5 px-4 font-bold text-teal-800">{qm.pwtPercentage}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-700">{qm.pwtMarks}</td>
                          <td className="py-2.5 px-4 font-bold text-teal-800">{qm.fwePercentage}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-700">{qm.fweMarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quick Highlights / At a Glance Table (Testbook Style) */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
              <div className="bg-slate-50/90 px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {statePrefixedName} Examination Overview &amp; Key Highlights
                </h3>
                <span className="rounded-full bg-teal-50 border border-teal-200/70 px-2.5 py-0.5 text-[10px] font-bold text-teal-800">
                  Verified Official Pattern
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 px-4 py-3 sm:px-5 sm:py-3.5 items-center hover:bg-slate-50/60 transition">
                  <span className="sm:col-span-4 lg:col-span-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                    Recruitment Authority
                  </span>
                  <span className="sm:col-span-8 lg:col-span-9 text-xs sm:text-sm font-bold text-slate-900">
                    {teluguData.pattern.authority}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 px-4 py-3 sm:px-5 sm:py-3.5 items-center bg-slate-50/30 hover:bg-slate-50/60 transition">
                  <span className="sm:col-span-4 lg:col-span-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                    Official Medium
                  </span>
                  <span className="sm:col-span-8 lg:col-span-9 text-xs sm:text-sm font-semibold text-slate-800">
                    {teluguData.pattern.medium}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 px-4 py-3 sm:px-5 sm:py-3.5 items-center hover:bg-slate-50/60 transition">
                  <span className="sm:col-span-4 lg:col-span-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                    Examination Format
                  </span>
                  <span className="sm:col-span-8 lg:col-span-9 text-xs sm:text-sm font-semibold text-slate-800">
                    {teluguData.pattern.mode}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 px-4 py-3 sm:px-5 sm:py-3.5 items-center bg-slate-50/30 hover:bg-slate-50/60 transition">
                  <span className="sm:col-span-4 lg:col-span-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                    Marking Scheme
                  </span>
                  <span className="sm:col-span-8 lg:col-span-9 text-xs sm:text-sm font-semibold text-slate-800">
                    1 Mark per correct answer · Deducts {teluguData.pattern.negativeMarking}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 px-4 py-3 sm:px-5 sm:py-3.5 items-center hover:bg-slate-50/60 transition">
                  <span className="sm:col-span-4 lg:col-span-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                    Online Practice
                  </span>
                  <span className="sm:col-span-8 lg:col-span-9 text-xs sm:text-sm font-bold text-teal-800">
                    Free Full-Length Bilingual Mock Tests on Varadhi Prep
                  </span>
                </div>
              </div>
            </div>

            {/* Official Subject Curriculum & Topics */}
            {teluguData.pattern.subjects && teluguData.pattern.subjects.length > 0 && (
              <div id="curriculum-topics" className="mt-6 scroll-mt-24">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Official Subject Breakdown &amp; Curriculum Topics
                </h3>
                <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {teluguData.pattern.subjects.map((sub, idx) => {
                    const topicPills = sub.description
                      .split(/[,;]/)
                      .map((t) => t.trim())
                      .filter((t) => t.length > 0);
                    return (
                      <div
                        key={sub.name}
                        className="rounded-2xl border border-slate-200/90 bg-white p-4.5 sm:p-5 transition hover:border-teal-300 hover:shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="inline-flex rounded-md bg-teal-50 border border-teal-200/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-800">
                                Subject 0{idx + 1}
                              </span>
                              <h4 className="font-bold text-slate-900 text-sm sm:text-base mt-1.5 leading-snug">
                                {sub.name}
                              </h4>
                              {sub.teluguName && (
                                <p className="text-xs font-semibold text-teal-900 mt-0.5">
                                  {sub.teluguName}
                                </p>
                              )}
                            </div>
                            <a
                              href="#papers"
                              className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-slate-50 hover:bg-teal-800 hover:text-white border border-slate-200/90 hover:border-teal-800 px-2.5 py-1 text-xs font-bold text-slate-700 transition shadow-2xs"
                            >
                              Practice →
                            </a>
                          </div>
                          
                          {/* Textbook-Style Topic Pills */}
                          <div className="mt-3.5 flex flex-wrap gap-1.5">
                            {topicPills.map((topic, tIdx) => (
                              <span
                                key={tIdx}
                                className="inline-flex items-center rounded-md border border-slate-200/70 bg-slate-50/70 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-950 px-2.5 py-1 text-xs font-medium text-slate-700 transition shadow-2xs"
                              >
                                <span className="mr-1.5 text-teal-700 font-bold" aria-hidden="true">•</span>
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Textbook Study & Preparation Strategy Note */}
            {typeof teluguData.pattern.totalQuestions === "number" && typeof teluguData.pattern.durationMinutes === "number" && (
              <div className="mt-6 rounded-2xl border border-teal-200/90 bg-gradient-to-r from-teal-50/70 via-[#f4faf7] to-white p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-teal-100 text-teal-900 text-xs font-bold uppercase">
                    Tips
                  </span>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <strong className="text-teal-950 font-bold">Aspirant Strategy &amp; Time Management:</strong>{" "}
                    With {teluguData.pattern.totalQuestions} questions to solve in {teluguData.pattern.durationMinutes} minutes, candidates have approximately{" "}
                    <strong>{Math.round((Number(teluguData.pattern.durationMinutes) * 60) / Number(teluguData.pattern.totalQuestions))} seconds per question</strong>.
                    Regular practice with timed bilingual mock tests on Varadhi Prep trains your speed, prevents negative marking penalties (0.20 marks deducted per wrong answer), and builds authentic exam discipline.
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Physical Standards & Efficiency Test (PMT & PET) */}
        {teluguData?.pattern?.physicalStandards && teluguData.pattern.physicalStandards.length > 0 && (
          <section
            id="physical-standards"
            aria-labelledby="physical-standards-heading"
            className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs [content-visibility:auto] [contain-intrinsic-size:auto_600px]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  PMT &amp; PET Events
                </p>
                <h2
                  id="physical-standards-heading"
                  className="font-display mt-1 text-2xl font-bold sm:text-3xl text-slate-900"
                >
                  {statePrefixedName} Physical Measurement (PMT) &amp; Efficiency Test (PET) Standards
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-800">
                Prescribed Standards
              </span>
            </div>

            <p className="mt-2.5 max-w-3xl text-xs sm:text-sm leading-relaxed text-slate-600">
              Official physical measurement standards and physical efficiency test (PET) criteria for candidates qualifying the Preliminary Written Test (PWT).
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
              <div className="bg-slate-50/90 px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Prescribed Physical Standards &amp; Qualifying Distances
                </h3>
                <span className="rounded-full bg-teal-50 border border-teal-200/70 px-2.5 py-0.5 text-[10px] font-bold text-teal-800">
                  RFID &amp; Digital Sensor Tested
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/90 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      <th className="py-2.5 px-4">Event / Test</th>
                      <th className="py-2.5 px-4">Men Candidates</th>
                      <th className="py-2.5 px-4">Women Candidates</th>
                      <th className="py-2.5 px-4">Nature &amp; Scoring</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teluguData.pattern.physicalStandards.map((ps) => (
                      <tr key={ps.event} className="hover:bg-slate-50/60 transition">
                        <td className="py-2.5 px-4 font-semibold text-slate-900">{ps.event}</td>
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-800">{ps.menStandard}</td>
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-800">{ps.womenStandard}</td>
                        <td className="py-2.5 px-4 text-xs font-medium text-slate-600">{ps.nature}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Age Limit & Relaxations */}
        {ageLimits && ageLimits.length > 0 && (
          <section
            id="age-limits"
            aria-labelledby="age-limits-heading"
            className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs [content-visibility:auto] [contain-intrinsic-size:auto_600px]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Eligibility Criteria
                </p>
                <h2
                  id="age-limits-heading"
                  className="font-display mt-1 text-2xl font-bold sm:text-3xl text-slate-900"
                >
                  {statePrefixedName} Age Limit, Qualifications &amp; Relaxations (GO Ms No. 87)
                </h2>
              </div>
              <span className="rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-bold text-teal-900">
                +5 Years Raised by Govt Order
              </span>
            </div>

            <p className="mt-2.5 max-w-3xl text-xs sm:text-sm leading-relaxed text-slate-600">
              Government of Telangana vide GO Ms No. 87 GA (Services-A) Dept raised the upper age limit by 5 years for direct recruitment in uniformed services.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <span className="inline-flex rounded-md bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Education
                  </span>
                  <p className="font-display mt-2 text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Intermediate (10+2) Pass
                  </p>
                </div>
                <p className="mt-2 text-xs text-slate-500 font-medium">Recognized State Board or equivalent</p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <span className="inline-flex rounded-md bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    General Age Range
                  </span>
                  <p className="font-display mt-2 text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    18 to 27 Years (OC)
                  </p>
                </div>
                <p className="mt-2 text-xs text-slate-500 font-medium">As on 01-07-2026 (+5 years under GO 87)</p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <span className="inline-flex rounded-md bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Technical Driving License
                  </span>
                  <p className="font-display mt-2 text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Valid LMV License
                  </p>
                </div>
                <p className="mt-2 text-xs text-slate-500 font-medium">Mandatory for Fire Fighter (Post Code 26)</p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
              <div className="bg-slate-50/90 px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200/90">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Category-wise Upper Age Limits &amp; Legal Basis
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/90 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Eligible Age Range</th>
                      <th className="py-2.5 px-4">Government Order / Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ageLimits.map((al) => (
                      <tr key={al.category} className="hover:bg-slate-50/60 transition">
                        <td className="py-2.5 px-4 font-semibold text-slate-900">{al.category}</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-teal-800">{al.ageRange}</td>
                        <td className="py-2.5 px-4 text-xs text-slate-600">{al.basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Job Profile, Duties & Eligibility */}
        {teluguData?.jobProfile && (
          <section
            id="job-profile"
            aria-labelledby="job-profile-heading"
            className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs [content-visibility:auto] [contain-intrinsic-size:auto_600px]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  {teluguData.jobProfile.department}
                </p>
                <h2
                  id="job-profile-heading"
                  className="font-display mt-1 text-2xl font-bold sm:text-3xl text-slate-900"
                >
                  {teluguData.jobProfile.roleTitle} – Job Duties, Salary &amp; Eligibility
                </h2>
              </div>
              <span className="rounded-full bg-teal-50 border border-teal-200 px-3.5 py-1 text-xs font-bold text-teal-900">
                Monthly Pay: {teluguData.jobProfile.grossSalaryMonthly}
              </span>
            </div>

            <p className="mt-2.5 max-w-3xl text-xs sm:text-sm leading-relaxed text-slate-600">
              Overview of official responsibilities, monthly pay scale, eligibility standards, and promotion hierarchy for {statePrefixedName} recruitment.
            </p>

            {/* Salary & Eligibility Cards */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
              <div className="rounded-2xl border border-teal-200/80 bg-teal-50/30 p-4 sm:p-5 transition hover:border-teal-400 hover:shadow-xs flex flex-col justify-between">
                <div>
                  <span className="inline-flex rounded-md bg-teal-50 border border-teal-200/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-800">
                    Pay Scale &amp; Salary
                  </span>
                  <p className="font-display mt-2.5 text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {teluguData.jobProfile.payScale}
                  </p>
                </div>
                <p className="mt-2 text-xs font-semibold text-teal-800">{teluguData.jobProfile.grossSalaryMonthly}</p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 transition hover:border-teal-300 hover:shadow-xs flex flex-col justify-between">
                <div>
                  <span className="inline-flex rounded-md bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Age Limit &amp; Relaxations
                  </span>
                  <p className="font-display mt-2.5 text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                    {teluguData.jobProfile.eligibility.ageLimit}
                  </p>
                </div>
                <p className="mt-2 text-xs text-slate-400 font-medium">Standard recruitment rules apply</p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 transition hover:border-teal-300 hover:shadow-xs flex flex-col justify-between">
                <div>
                  <span className="inline-flex rounded-md bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Educational Qualification
                  </span>
                  <p className="font-display mt-2.5 text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                    {teluguData.jobProfile.eligibility.education}
                  </p>
                </div>
                {teluguData.jobProfile.eligibility.physicalStandards ? (
                  <p className="mt-2 text-xs text-slate-500 font-medium">
                    {teluguData.jobProfile.eligibility.physicalStandards}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-slate-400 font-medium">Standard state eligibility</p>
                )}
              </div>
            </div>

            {/* Core Duties & Responsibilities List */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
              <div className="bg-slate-50/90 px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200/90">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Core Roles &amp; Responsibilities (విధి నిర్వహణ &amp; బాధ్యతలు)
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {teluguData.jobProfile.duties.map((duty, idx) => (
                  <div key={idx} className="p-4 sm:p-4.5 hover:bg-slate-50/50 transition">
                    <div className="flex items-start gap-3">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-teal-50 text-teal-800 border border-teal-200/70 text-xs font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {duty.title}
                          </h4>
                          {duty.teluguTitle && (
                            <span className="text-xs font-semibold text-teal-800">
                              ({duty.teluguTitle})
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                          {duty.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Growth / Hierarchy */}
            {teluguData.jobProfile.careerGrowth && teluguData.jobProfile.careerGrowth.length > 0 && (
              <div className="mt-6 rounded-2xl border border-slate-200/80 bg-[#f6faf8] p-4 sm:p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Career Progression &amp; Promotion Hierarchy
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {teluguData.jobProfile.careerGrowth.map((rank, idx) => (
                    <div key={rank} className="flex items-center gap-2">
                      <span className="rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs">
                        {rank}
                      </span>
                      {idx < teluguData.jobProfile!.careerGrowth!.length - 1 && (
                        <span className="text-teal-700 font-bold text-xs" aria-hidden="true">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        

        {/* Frequently Asked Questions */}
        <section id="exam-faqs" aria-labelledby="faq-title" className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs [content-visibility:auto] [contain-intrinsic-size:auto_600px]">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Frequently Asked Questions</p>
          <h2 id="faq-title" className="font-display mt-1 text-2xl font-bold sm:text-3xl text-slate-900">About {examHeading}</h2>
          <div className="mt-6 divide-y divide-slate-100">
            {questions.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="cursor-pointer list-none font-semibold text-slate-900 hover:text-teal-950 marker:hidden flex items-center justify-between gap-3 transition">
                  <span>{item.question}</span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 group-open:border-teal-200 group-open:bg-teal-50 group-open:text-teal-800 group-open:rotate-45 transition text-base leading-none font-bold" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 bg-[#f9fbfa] rounded-xl p-3.5 border border-slate-100/80">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );

}
function studentTestTitle(
  test: { series_number: number | null },
  examName: string,
  paperLabel: string,
  subjectName?: string | null,
  sectionName?: string | null,
) {
  return studentFacingMockTestTitle({
    examName,
    paperLabel,
    seriesNumber: Number(test.series_number ?? 1),
    subjectName,
    sectionName,
  });
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center"><h3 className="font-display text-xl">{title}</h3><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{detail}</p></div>;
}
