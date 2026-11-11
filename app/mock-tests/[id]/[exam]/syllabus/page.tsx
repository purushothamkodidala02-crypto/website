import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
import { getMockTestCatalogData } from "@/lib/catalog-data";
import { buildPaperDisplayMap, type OrderedPaper } from "@/lib/papers";
import { resolvePublicRoute } from "@/lib/public-route-data";
import { collectionStructuredData, publicCollectionMetadata } from "@/lib/public-seo";
import { examUrl, paperUrl, stateUrl, subjectUrl, syllabusUrl } from "@/lib/public-urls";
import { getExamTeluguMetadata } from "@/lib/telugu-seo";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const catalog = await getMockTestCatalogData();
  const categoryById = new Map(catalog.categories.map((category) => [category.id, category]));
  const stateById = new Map(catalog.states.map((state) => [state.id, state]));

  return catalog.exams.flatMap((exam) => {
    const category = categoryById.get(exam.exam_id);
    const state = category ? stateById.get(category.state_id) : undefined;
    return state ? [{ id: state.slug, exam: exam.slug }] : [];
  });
}

type Props = { params: Promise<{ id: string; exam: string }> };

function buildSyllabusMeta(context: NonNullable<Awaited<ReturnType<typeof resolvePublicRoute>>>) {
  const exam = context.exam!;
  const state = context.state;
  const stateCode =
    state.code ||
    (state.slug === "telangana" ? "TG" : state.slug === "andhra-pradesh" ? "AP" : state.name);
  const teluguData = getExamTeluguMetadata(exam.slug, exam.name, state.slug);
  const isPolice =
    exam.slug.includes("police") || exam.name.toLowerCase().includes("police");
  const statePrefixedName = exam.name.toLowerCase().includes(state.name.toLowerCase())
    ? exam.name
    : `${state.name} ${exam.name}`;
  const shortPrefixedName = exam.name.toLowerCase().includes(stateCode.toLowerCase())
    ? exam.name
    : `${stateCode} ${exam.name}`;

  const title = isPolice
    ? "TG Police Constable Exam Syllabus 2026 & OMR Pattern | తెలంగాణ పోలీస్ సిలబస్"
    : `${shortPrefixedName} Exam Syllabus 2026 & Pattern${teluguData ? ` | ${teluguData.teluguName} సిలబస్` : ""}`;

  const description = isPolice
    ? "Official TG Police Constable exam syllabus 2026 (TGPRB/TSLPRB), PWT & FWE pattern, subject topics & free bilingual mock tests on Varadhi Prep."
    : `Complete ${statePrefixedName} (${stateCode}) exam syllabus 2026, paper pattern, subject topics & free bilingual mock tests on Varadhi Prep.`;

  const keywords = [
    ...(teluguData?.keywords ?? []),
    `${shortPrefixedName} exam syllabus`,
    `${statePrefixedName} syllabus 2026`,
    `${statePrefixedName} exam pattern`,
    `${exam.name} syllabus and mock tests`,
    ...(isPolice
      ? [
          "tg police exam syllabus",
          "tg police syllabus 2026",
          "telangana police constable syllabus",
          "tgprb police constable syllabus",
        ]
      : []),
  ];

  return { stateCode, teluguData, isPolice, statePrefixedName, shortPrefixedName, title, description, keywords };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, exam } = await params;
  const context = await resolvePublicRoute({ stateSlug: id, examSlug: exam });
  if (!context?.exam) {
    return { title: "Exam Syllabus Not Found", robots: { index: false, follow: false } };
  }

  const meta = buildSyllabusMeta(context);
  const canonical = syllabusUrl(context.state.slug, context.exam.slug);

  return publicCollectionMetadata({
    title: meta.title,
    description: meta.description,
    keywords: Array.from(new Set(meta.keywords)),
    canonical,
    indexable: true,
  });
}

export default async function ExamSyllabusPage({ params }: Props) {
  const { id, exam } = await params;
  const context = await resolvePublicRoute({ stateSlug: id, examSlug: exam });
  if (!context?.exam) notFound();

  const canonical = syllabusUrl(context.state.slug, context.exam.slug);
  if (context.usedAlias || id !== context.state.slug || exam !== context.exam.slug) {
    permanentRedirect(canonical);
  }

  const { catalog, state, exam: examGroup } = context;
  const meta = buildSyllabusMeta(context);
  const examHref = examUrl(state.slug, examGroup.slug);

  const papers = catalog.papers.filter((paper) => paper.exam_group_id === examGroup.id);
  const paperDisplayById = buildPaperDisplayMap(papers as OrderedPaper[]);
  const paperIds = new Set(papers.map((paper) => paper.id));
  const examSubjects = catalog.subjects.filter((sub) => paperIds.has(sub.paper_id) && sub.is_active);
  const subjectIds = new Set(examSubjects.map((sub) => sub.id));
  const examSections = catalog.sections.filter((sec) => subjectIds.has(sec.subject_id) && sec.is_active);
  const examTests = catalog.tests.filter((test) => paperIds.has(test.paper_id));

  const faqs = [
    ...(meta.teluguData?.englishFaqs ?? []),
    ...(meta.teluguData?.teluguFaqs ?? []),
    ...(meta.teluguData
      ? []
      : [
          {
            question: `What is included in the ${meta.statePrefixedName} syllabus on Varadhi Prep?`,
            answer: `You can inspect paper-wise subjects (${examSubjects.length} active subjects across ${papers.length} paper${papers.length === 1 ? "" : "s"}) and start free timed bilingual mock tests directly mapped to the syllabus.`,
          },
          {
            question: `Are ${examGroup.name} mock tests free to practice after reading the syllabus?`,
            answer: `Yes. Use any subject or paper link on this syllabus page to open free online mock tests in Telugu and English with detailed solutions.`,
          },
        ]),
  ];

  const structuredData = [
    ...collectionStructuredData(meta.title, meta.description, canonical, [
      { name: "Home", path: "/" },
      { name: state.name, path: stateUrl(state.slug) },
      { name: examGroup.name, path: examHref },
      { name: "Exam Syllabus & Pattern", path: canonical },
    ]),
    ...(faqs.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          },
        ]
      : []),
  ];

  return (
    <main className="student-page relative min-h-screen bg-[#f6faf8] text-[#132621] w-full max-w-full overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[#eaf2ef]/70 via-[#f2f7f5]/40 to-transparent -z-10" />
      <JsonLd data={structuredData} />
      <PublicHeader />

      <section className="border-b border-teal-900/5 bg-gradient-to-b from-[#eaf2ef]/60 via-[#f2f7f5]/30 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-12">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-teal-800 py-0.5 transition">Home</Link>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <Link href={stateUrl(state.slug)} className="hover:text-teal-800 py-0.5 transition">{state.name}</Link>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <Link href={examHref} className="hover:text-teal-800 py-0.5 transition">{examGroup.name}</Link>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span className="font-semibold text-slate-800 py-0.5">Exam Syllabus &amp; Pattern</span>
          </nav>

          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-teal-200/80 bg-teal-50/80 px-3 py-1 text-xs font-bold text-teal-950">
                {meta.stateCode} · {state.name} Official Syllabus
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-2xs">
                2026 Pattern &amp; Subjects
              </span>
            </div>

            <h1 className="font-display mt-3.5 max-w-4xl text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {meta.isPolice
                ? "TG Police Constable Exam Syllabus 2026 & OMR Pattern"
                : `${meta.shortPrefixedName} Exam Syllabus 2026 & Pattern`}
            </h1>

            {meta.teluguData && (
              <p className="mt-2 text-base font-bold text-teal-950 sm:text-lg">
                {meta.teluguData.teluguName} — పూర్తి సిలబస్ మరియు పరీక్ష విధానం
              </p>
            )}

            <p className="mt-3.5 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
              {meta.isPolice
                ? "Complete TGPRB / TSLPRB Telangana Police Constable exam syllabus for Preliminary Written Test (PWT) and Final Written Examination (FWE), including selection stages, negative marking rules, subject-wise topics, and free bilingual mock tests."
                : examGroup.description?.trim() || meta.description}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <Link
                href={examHref}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-teal-800 hover:bg-teal-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition shadow-xs"
              >
                Practice {examTests.length} {examGroup.name} Mock Tests →
              </Link>
              <a
                href="#subjects-syllabus"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 transition shadow-2xs"
              >
                Jump to Subject Syllabus ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-8 sm:py-10">
        {meta.teluguData?.pattern && (
          <section aria-labelledby="syllabus-pattern-heading" className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
              {meta.teluguData.pattern.authority}
            </p>
            <h2 id="syllabus-pattern-heading" className="font-display mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              {meta.shortPrefixedName} ({state.name}) Exam Pattern Overview
            </h2>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="rounded-2xl border border-slate-200/90 bg-[#f9fbfa] p-3.5 text-center">
                <p className="text-xs font-semibold text-slate-500">Questions</p>
                <p className="font-display mt-1 text-lg font-bold text-slate-900">{meta.teluguData.pattern.totalQuestions} Qs</p>
              </div>
              <div className="rounded-2xl border border-slate-200/90 bg-[#f9fbfa] p-3.5 text-center">
                <p className="text-xs font-semibold text-slate-500">Total Marks</p>
                <p className="font-display mt-1 text-lg font-bold text-slate-900">{meta.teluguData.pattern.totalMarks} Marks</p>
              </div>
              <div className="rounded-2xl border border-slate-200/90 bg-[#f9fbfa] p-3.5 text-center">
                <p className="text-xs font-semibold text-slate-500">Duration</p>
                <p className="font-display mt-1 text-lg font-bold text-slate-900">{meta.teluguData.pattern.durationMinutes} Mins</p>
              </div>
              <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-3.5 text-center">
                <p className="text-xs font-semibold text-teal-800">Negative Marks</p>
                <p className="font-display mt-1 text-sm font-bold text-teal-950">{meta.teluguData.pattern.negativeMarking}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/90 bg-[#f9fbfa] p-3.5 text-center">
                <p className="text-xs font-semibold text-slate-500">Medium</p>
                <p className="font-display mt-1 text-sm font-bold text-slate-900">{meta.teluguData.pattern.medium}</p>
              </div>
              <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-3.5 text-center">
                <p className="text-xs font-semibold text-teal-800">Exam Mode</p>
                <p className="font-display mt-1 text-sm font-bold text-teal-950">{meta.teluguData.pattern.mode}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-[#f6faf8] p-4 sm:p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">Selection Stages</h3>
              <ol className="mt-3 space-y-2 text-sm text-slate-800">
                {meta.teluguData.pattern.stages.map((stage) => (
                  <li key={stage} className="rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 font-medium">
                    {stage}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        <section id="subjects-syllabus" aria-labelledby="subjects-syllabus-heading" className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Topic Breakdown</p>
          <h2 id="subjects-syllabus-heading" className="font-display mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Subject-Wise Syllabus &amp; Practice Links
          </h2>

          {meta.teluguData?.pattern?.subjects && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {meta.teluguData.pattern.subjects.map((sub, idx) => (
                <article key={sub.name} className="rounded-2xl border border-slate-200/90 bg-[#f9fbfa] p-5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-lg bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 text-xs font-bold text-teal-900">
                      Unit {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-display mt-3 text-base font-bold text-slate-900">{sub.name}</h3>
                  <p className="mt-0.5 text-xs font-semibold text-teal-800">{sub.teluguName}</p>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{sub.description}</p>
                </article>
              ))}
            </div>
          )}

          {papers.length > 0 && (
            <div className="mt-8 space-y-5">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Published Papers &amp; Syllabus Subjects ({papers.length})
              </h3>
              {papers.map((paper) => {
                const paperSubjects = examSubjects.filter((sub) => sub.paper_id === paper.id);
                const paperLabel = paperDisplayById.get(paper.id)?.label ?? paper.name;
                return (
                  <div key={paper.id} className="rounded-2xl border border-slate-200 bg-[#f9fbfa] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="font-display text-base font-bold text-slate-900">{paperLabel}</h4>
                        {paper.description && (
                          <p className="mt-1 text-xs text-slate-600">{paper.description}</p>
                        )}
                      </div>
                      <Link
                        href={paperUrl(state.slug, examGroup.slug, paper.slug)}
                        className="inline-flex items-center rounded-xl bg-teal-800 hover:bg-teal-900 px-4 py-2 text-xs font-semibold text-white transition"
                      >
                        Open {paper.name} Tests →
                      </Link>
                    </div>

                    {paperSubjects.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {paperSubjects.map((sub) => {
                          const subSections = examSections.filter((sec) => sec.subject_id === sub.id);
                          const subTests = examTests.filter((test) => test.subject_id === sub.id);
                          return (
                            <Link
                              key={sub.id}
                              href={subjectUrl(state.slug, examGroup.slug, paper.slug, sub.slug)}
                              className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-teal-400 hover:shadow-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition">
                                  {sub.name}
                                </span>
                                <span className="shrink-0 text-xs font-semibold text-teal-800">
                                  {subTests.length} tests
                                </span>
                              </div>
                              {sub.description && (
                                <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">{sub.description}</p>
                              )}
                              {subSections.length > 0 && (
                                <p className="mt-2 text-[11px] font-medium text-slate-500">
                                  Topics: {subSections.map((s) => s.name).join(", ")}
                                </p>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {faqs.length > 0 && (
          <section aria-labelledby="syllabus-faq-title" className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Syllabus FAQs</p>
            <h2 id="syllabus-faq-title" className="font-display mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Frequently Asked Questions about {meta.shortPrefixedName} Syllabus
            </h2>
            <div className="mt-6 divide-y divide-slate-100">
              {faqs.map((item) => (
                <details key={item.question} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-slate-900 hover:text-teal-950 marker:hidden">
                    <span>{item.question}</span>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 group-open:rotate-45 transition">+</span>
                  </summary>
                  <p className="mt-3 max-w-3xl rounded-xl border border-slate-100 bg-[#f9fbfa] p-3.5 text-sm leading-relaxed text-slate-600">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
