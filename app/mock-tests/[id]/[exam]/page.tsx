import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import MockTestsPage, { type Filters } from "@/app/mock-tests/page";
import { CatalogSteps } from "@/components/exams/CatalogSteps";
import { ExamSymbol } from "@/components/exams/CatalogSymbols";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
import {
  formatExamFallbackDescription,
  formatExamFallbackTitle,
  formatExamHeading,
  hasMockTestSuffixOrMention,
  studentFacingMockTestTitle,
} from "@/lib/exam-catalog";
import { buildPaperDisplayMap, type OrderedPaper } from "@/lib/papers";
import { resolvePublicRoute } from "@/lib/public-route-data";
import { collectionStructuredData, isIndexableCollectionQuery, publicCollectionMetadata } from "@/lib/public-seo";
import { examUrl, mockTestUrl, paperUrl, specializationUrl, stateUrl } from "@/lib/public-urls";
import { resolveSeoFields } from "@/lib/seo-fields";
import { absoluteUrl } from "@/lib/site";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { AccountActionButton } from "@/components/exams/AccountActionButton";
import { getExamTeluguMetadata } from "@/lib/telugu-seo";

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
  const fallbackTitle = teluguData ? teluguData.bilingualPageTitle : formatExamFallbackTitle(context.exam.name, context.state.name);
  const fallbackDescription = teluguData ? teluguData.bilingualDescription : formatExamFallbackDescription(context.exam.name, context.state.name);
  const seo = resolveSeoFields(context.exam, {
    title: fallbackTitle,
    description: fallbackDescription,
  });
  
  const savedQuestions = await getCachedFaqs(context.exam!.id);
    
  const introduction = context.exam.description?.trim() || seo.description;
  const examHeading = formatExamHeading(context.exam.name);
  const standardQuestions = [
    { question: `Where can I take ${hasMockTestSuffixOrMention(context.exam.name) ? context.exam.name : `${context.exam.name} mock tests`}?`, answer: `Choose a paper on this page, open an available mock test and start practising ${context.exam.name} on Varadhi Prep.`, displayOrder: 0 },
    { question: `How many ${hasMockTestSuffixOrMention(context.exam.name) ? `${context.exam.name} tests` : `${context.exam.name} mock tests`} are available?`, answer: tests.length > 0 ? `${tests.length} published mock test${tests.length === 1 ? " is" : "s are"} currently available across ${papers.length} paper${papers.length === 1 ? "" : "s"}. New published tests automatically appear on this page.` : "Mock tests are being prepared and will appear on this page after publication.", displayOrder: 1 },
    { question: `Can I review my ${context.exam.name} answers?`, answer: "Yes. After submitting a test, you can review your score, selected answers, correct answers and available explanations from your student dashboard.", displayOrder: 2 },
  ];
  const savedByOrder = new Map((savedQuestions ?? []).map((item) => [item.display_order, item]));
  const teluguFaqItems = teluguData?.teluguFaqs ?? [];
  const questions = [
    ...standardQuestions.map((item) => savedByOrder.get(item.displayOrder) ?? item),
    ...(savedQuestions ?? []).filter((item) => item.display_order >= standardQuestions.length),
    ...teluguFaqItems,
  ].map((item) => ({ question: item.question, answer: item.answer }));
  const structuredData = [
    ...collectionStructuredData(seo.title, seo.description, canonical, [
      { name: "Home", path: "/" },
      { name: "Mock tests", path: "/mock-tests" },
      { name: context.state.name, path: stateUrl(context.state.slug) },
      { name: context.exam.name, path: canonical },
    ]),
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
    { "@context": "https://schema.org", "@type": "ItemList", name: examHeading, numberOfItems: tests.length, itemListElement: tests.slice(0, 12).map((test, index) => { const paper = papers.find((item) => item.id === test.paper_id)!; const subject = test.subject_id ? subjectById.get(test.subject_id) : undefined; const section = test.subject_section_id ? sectionById.get(test.subject_section_id) : undefined; return { "@type": "ListItem", position: index + 1, name: studentTestTitle(test, context.exam!.name, paperDisplayById.get(paper.id)?.shortLabel ?? paper.name, subject?.name, section?.name), url: absoluteUrl(mockTestUrl(context.state.slug, context.exam!.slug, paper.slug, test.slug)) }; }) },
  ];

  return (
    <main className="student-page min-h-screen bg-[#f4f7f8] text-slate-950">
      <JsonLd data={structuredData} />
      <script
        dangerouslySetInnerHTML={{
          __html: `if(window.location.hash==='#exam-pattern'){history.replaceState(null,'',window.location.pathname+window.location.search);}`,
        }}
      />
      <PublicHeader />
      <section className="relative overflow-hidden border-b border-emerald-900/60 bg-[#071f1a] text-white">
        <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
            <Link href="/" className="hover:text-white py-1 inline-flex items-center">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href={stateUrl(context.state.slug)} className="hover:text-white py-1 inline-flex items-center">{context.state.name}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-teal-200 py-1 inline-flex items-center">{context.exam.name}</span>
          </nav>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-900/50 px-3 py-1 text-xs font-bold text-teal-200">
                <ExamSymbol name={context.exam.name} className="h-3.5 w-3.5 text-teal-300" /> {context.state.code} Exam Preparation
              </p>
              <h1 className="font-display mt-4 max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {examHeading}
              </h1>
              {teluguData && (
                <p className="mt-2 text-base font-bold text-teal-300 sm:text-lg">
                  {teluguData.teluguTitle}
                </p>
              )}
              <p className="mt-3.5 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-7">
                {introduction}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="#papers"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-teal-400 hover:bg-teal-300 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 transition shadow-sm"
                >
                  Choose a paper ↓
                </a>
                <AccountActionButton canonical={canonical} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-10 px-5 py-8 sm:px-8 sm:py-12">
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
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <h2 id="papers-title" className="font-display mt-1 text-2xl font-bold sm:text-3xl text-slate-950">
            {hasMockTestSuffixOrMention(context.exam.name) ? `${context.exam.name} papers` : `${context.exam.name} mock test papers`}
          </h2>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600">
            Select a paper to practise its dedicated mock test series, review topic coverage, and check bilingual explanations.
          </p>

          {papers.length === 0 ? (
            <EmptyState title="Papers are being prepared" detail="This exam landing page is ready. Its papers and mock tests will appear here after the administrator publishes them." />
          ) : (
            <div className="student-stagger mt-6 grid gap-4 md:grid-cols-2">
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
                    className="student-card group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition hover:border-teal-400 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                          {display?.shortLabel ?? "Paper"}{specialization ? ` · ${specialization.name}` : ""}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {paperTests.length} mock test{paperTests.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <h3 className="font-display mt-3 text-lg font-bold leading-snug text-slate-900 group-hover:text-teal-800 transition">
                        {paper.name}
                      </h3>
                      {paper.question_count && (
                        <p className="mt-1.5 text-xs text-slate-500">
                          {paper.question_count} questions per paper • {paper.default_correct_marks ?? 1} mark each
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <span className="font-semibold text-slate-500">Official Exam Syllabus</span>
                      <span className="inline-flex items-center gap-1 font-bold text-teal-800 group-hover:translate-x-1 transition">
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
              <div className="student-stagger mt-6 grid gap-3 sm:gap-4 md:grid-cols-2">
                {tests.slice(0, 4).map((test) => {
                  const paper = papers.find((item) => item.id === test.paper_id)!;
                  const subject = test.subject_id ? subjectById.get(test.subject_id) : undefined;
                  const section = test.subject_section_id ? sectionById.get(test.subject_section_id) : undefined;
                  const title = studentTestTitle(test, context.exam!.name, paperDisplayById.get(paper.id)?.shortLabel ?? paper.name, subject?.name, section?.name);
                  const isFree = test.access_type === "free";

                  return (
                    <article
                      key={test.id}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs transition hover:border-teal-400 hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="min-w-0">
                            <Link
                              href={mockTestUrl(context.state.slug, context.exam!.slug, paper.slug, test.slug)}
                              className="font-display block text-base font-bold text-slate-900 hover:text-teal-800 transition truncate"
                            >
                              {title}
                            </Link>
                            <p className="mt-1 text-xs text-slate-500 truncate">
                              {paper.name}{subject ? ` · ${subject.name}` : ""}{section ? ` (${section.name})` : ""}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              isFree
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-amber-50 text-amber-900 border border-amber-200"
                            }`}
                          >
                            {isFree ? "Free" : "Included"}
                          </span>
                        </div>

                        <div className="mt-3.5 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2 text-xs border border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{test.target_question_count ?? paper.question_count ?? "—"}</span>
                            <span className="text-[11px] font-medium text-slate-500">Qs</span>
                          </div>
                          <span className="text-slate-300 font-bold">•</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{test.duration_minutes}</span>
                            <span className="text-[11px] font-medium text-slate-500">Mins</span>
                          </div>
                          <span className="text-slate-300 font-bold">•</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-medium text-slate-600">Timed CBT</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-xs font-semibold text-slate-500">
                          Bilingual Review
                        </span>
                        <Link
                          href={mockTestUrl(context.state.slug, context.exam!.slug, paper.slug, test.slug)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition"
                        >
                          <span>Start test</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {tests.length > 4 && (
                <div className="mt-6 flex justify-center">
                  <Link
                    href={`${canonical}?view=all`}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-5 py-2.5 text-xs sm:text-sm font-bold text-teal-900 transition hover:bg-teal-100 shadow-2xs"
                  >
                    View all {tests.length} mock tests →
                  </Link>
                </div>
              )}
            </>
          )}
        </section>

        <section aria-labelledby="faq-title" className="rounded-[2rem] bg-[#071f1a] p-6 text-white sm:p-9 border border-emerald-950 [content-visibility:auto] [contain-intrinsic-size:auto_600px]"><p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-300">Common questions</p><h2 id="faq-title" className="font-display mt-2 text-3xl">About {examHeading}</h2><div className="mt-6 divide-y divide-emerald-900/40">{questions.map((item) => <details key={item.question} className="group py-5"><summary className="cursor-pointer list-none font-bold marker:hidden">{item.question}<span className="float-right text-emerald-300 transition group-open:rotate-45" aria-hidden="true">+</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-100/80">{item.answer}</p></details>)}</div></section>
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
