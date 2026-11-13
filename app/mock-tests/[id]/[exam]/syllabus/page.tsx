import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
import { getMockTestCatalogData } from "@/lib/catalog-data";
import { resolvePublicRoute } from "@/lib/public-route-data";
import { collectionStructuredData, publicCollectionMetadata } from "@/lib/public-seo";
import { examUrl, paperUrl, stateUrl, subjectUrl, syllabusUrl } from "@/lib/public-urls";
import { createClient } from "@/lib/supabase/server";
import { getExamTeluguMetadata } from "@/lib/telugu-seo";
import {
  computeExamSyllabus,
  type RawPaper,
  type RawSubject,
  type RawSection,
  type RawTest,
} from "@/lib/exam-syllabus";

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
    ? "Telangana Police / TG Police Constable Exam Syllabus 2026, Pattern & Dates | TG Police సిలబస్"
    : `${shortPrefixedName} Exam Syllabus 2026 & Pattern${teluguData ? ` | ${teluguData.teluguName} సిలబస్` : ""}`;

  const description = isPolice
    ? "Official TGPRB Telangana Police Constable exam syllabus 2026, PWT exam date (20 Dec 2026), OMR pattern, subjects breakdown & free bilingual mock tests on Varadhi Prep."
    : `Complete ${statePrefixedName} (${stateCode}) exam syllabus 2026, paper pattern, subject topics & free bilingual mock tests on Varadhi Prep.`;

  const keywords = [
    ...(teluguData?.keywords ?? []),
    `${shortPrefixedName} exam syllabus`,
    `${statePrefixedName} syllabus 2026`,
    `${statePrefixedName} exam pattern`,
    `${exam.name} syllabus and mock tests`,
    ...(isPolice
      ? [
          "Telangana police syllabus",
          "Telangana police mock test",
          "Telangana constable mock test",
          "Telangana constable exam date",
          "tg police exam syllabus",
          "tg police syllabus 2026",
          "telangana police constable syllabus",
          "tgprb police constable syllabus",
          "tg police exam date",
          "telangana police constable exam date 2026",
          "tslprb police constable exam date",
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

  const category = catalog.categories.find((cat) => cat.id === examGroup.exam_id);
  const boardName = category?.name ?? null;

  const papers = catalog.papers.filter((paper) => paper.exam_group_id === examGroup.id);
  const paperIds = new Set(papers.map((paper) => paper.id));
  const examSubjects = catalog.subjects.filter((sub) => paperIds.has(sub.paper_id) && sub.is_active);
  const subjectIds = new Set(examSubjects.map((sub) => sub.id));
  const examSections = catalog.sections.filter((sec) => subjectIds.has(sec.subject_id) && sec.is_active);
  const examTests = catalog.tests.filter((test) => paperIds.has(test.paper_id));

  // Fetch any custom government notification syllabus or FAQs saved by admin
  const supabase = await createClient();
  const { data: rawFaqs } = await supabase
    .from("exam_page_faqs")
    .select("question, answer, display_order")
    .eq("exam_group_id", examGroup.id)
    .order("display_order");

  const syllabusFaqs = (rawFaqs ?? []).filter((f) =>
    f.question.startsWith("__OFFICIAL_GOVERNMENT_SYLLABUS"),
  );
  const customSyllabusText = syllabusFaqs.map((f) => f.answer).join("");
  const studentFaqs = (rawFaqs ?? []).filter(
    (f) => !f.question.startsWith("__OFFICIAL_GOVERNMENT_SYLLABUS"),
  );

  // Compute comprehensive syllabus details automatically or from custom government syllabus
  const syllabus = computeExamSyllabus({
    examName: examGroup.name,
    examDescription: examGroup.description,
    stateName: state.name,
    stateCode: meta.stateCode,
    boardName,
    papers: papers as RawPaper[],
    subjects: examSubjects as RawSubject[],
    sections: examSections as RawSection[],
    tests: examTests as RawTest[],
    overridePattern: meta.teluguData?.pattern,
    customSyllabusText: customSyllabusText || null,
  });

  const subjectNames = examSubjects.map((s) => s.name).slice(0, 8);
  const dynamicFaqs = [
    {
      question: `What is the exam pattern for ${meta.shortPrefixedName}?`,
      answer: syllabus.hasPapers
        ? `${meta.shortPrefixedName} consists of ${syllabus.pattern.totalPapers} paper(s)${syllabus.pattern.totalQuestions ? ` with ${syllabus.pattern.totalQuestions} total questions` : ""}${syllabus.pattern.totalMarks ? ` and ${syllabus.pattern.totalMarks} total marks` : ""}. Marking scheme follows ${syllabus.pattern.negativeMarking}. The examination is conducted in ${syllabus.pattern.medium} via ${syllabus.pattern.mode}.`
        : `The official examination pattern for ${meta.shortPrefixedName} is framed by ${syllabus.pattern.authority} and will be detailed as per the latest notification release.`,
    },
    {
      question: `Which subjects are covered in the ${meta.shortPrefixedName} syllabus?`,
      answer: subjectNames.length > 0
        ? `The syllabus covers key papers and subjects including: ${subjectNames.join(", ")}${examSubjects.length > subjectNames.length ? ` and ${examSubjects.length - subjectNames.length} more` : ""}. Practice tests are available for each subject on Varadhi Prep.`
        : `The syllabus covers all foundational General Studies and specialised subjects notified by ${syllabus.pattern.authority}. Free mock tests are organized paper-wise.`,
    },
    {
      question: `Are free mock tests available for ${examGroup.name} on Varadhi Prep?`,
      answer: `Yes! Varadhi Prep provides free chapter-wise and full-length bilingual mock tests in Telugu and English with timed CBT interfaces, negative marking calculations, and detailed solutions.`,
    },
  ];

  const faqs = [
    ...studentFaqs.map((f) => ({ question: f.question, answer: f.answer })),
    ...(meta.teluguData?.englishFaqs ?? []),
    ...(meta.teluguData?.teluguFaqs ?? []),
    ...(meta.teluguData || studentFaqs.length > 0 ? [] : dynamicFaqs),
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
                ? "Telangana Police / TG Police Constable Exam Syllabus 2026, Pattern & Exam Dates"
                : `${meta.shortPrefixedName} Exam Syllabus 2026 & Pattern`}
            </h1>

            {meta.teluguData && (
              <p className="mt-2 text-base font-bold text-teal-950 sm:text-lg">
                {meta.teluguData.teluguName} — పూర్తి సిలబస్, పరీక్ష తేదీ &amp; ఎగ్జామ్ ప్యాటర్న్
              </p>
            )}

            <p className="mt-3.5 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
              {meta.isPolice
                ? "Complete TGPRB / TSLPRB Telangana Police Constable exam syllabus for Preliminary Written Test (PWT) and Final Written Examination (FWE), including PWT exam date (20 December 2026), selection stages, negative marking rules, subject-wise topics, and free bilingual mock tests."
                : examGroup.description?.trim() || meta.description}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <Link
                href={examHref}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-teal-800 hover:bg-teal-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition shadow-xs"
              >
                Practice {examTests.length} {examGroup.name} Mock Tests →
              </Link>
              {meta.teluguData?.schedule && (
                <a
                  href="#exam-schedule"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-amber-300 bg-amber-50/90 hover:bg-amber-100 px-5 py-2.5 text-xs sm:text-sm font-semibold text-amber-950 transition shadow-2xs"
                >
                  PWT Exam Date: {meta.teluguData.schedule.prelimsExamDate} ↓
                </a>
              )}
              {syllabus.hasCurriculum && (
                <a
                  href="#subjects-syllabus"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 transition shadow-2xs"
                >
                  Jump to Subject Syllabus ↓
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-8 sm:py-10">
        {meta.teluguData?.schedule && (
          <section
            id="exam-schedule"
            aria-labelledby="syllabus-schedule-heading"
            className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  {meta.teluguData.schedule.authority}
                </p>
                <h2
                  id="syllabus-schedule-heading"
                  className="font-display mt-1 text-2xl font-bold sm:text-3xl text-slate-900"
                >
                  {meta.shortPrefixedName} Exam Date &amp; Notification Timeline 2026
                </h2>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-900">
                Preliminary Written Test: {meta.teluguData.schedule.prelimsExamDate}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-amber-200/90 bg-amber-50/50 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">PWT Exam Date</span>
                <p className="font-display mt-1.5 text-base sm:text-lg font-bold text-slate-900">
                  {meta.teluguData.schedule.prelimsExamDate}
                </p>
                <p className="mt-0.5 text-xs text-amber-900 font-semibold">{meta.teluguData.schedule.prelimsSession}</p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-[#f9fbfa] p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hall Ticket Release</span>
                <p className="font-display mt-1.5 text-base sm:text-lg font-bold text-slate-900">
                  {meta.teluguData.schedule.hallTicketRelease}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Via {meta.teluguData.schedule.officialWebsite.replace("https://www.", "")}</p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-[#f9fbfa] p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Duration &amp; Shift</span>
                <p className="font-display mt-1.5 text-base sm:text-lg font-bold text-slate-900">
                  {meta.teluguData.schedule.prelimsDuration}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Timed Forenoon Session</p>
              </div>

              <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Target Post</span>
                <p className="font-display mt-1.5 text-base sm:text-lg font-bold text-teal-950">
                  {meta.teluguData.schedule.postName}
                </p>
                <p className="mt-0.5 text-xs text-teal-800 font-semibold">TG Police Department</p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200/90">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Official Recruitment Milestones
                </h3>
              </div>
              <div className="divide-y divide-slate-100 bg-white">
                {meta.teluguData.schedule.events.map((evt, idx) => (
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
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {evt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Dynamic Exam Pattern Overview - Computed Automatically for All Exams */}
        <section aria-labelledby="syllabus-pattern-heading" className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                {syllabus.pattern.authority}
              </p>
              <h2 id="syllabus-pattern-heading" className="font-display mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                {meta.shortPrefixedName} ({state.name}) Exam Pattern Overview
              </h2>
            </div>
            {syllabus.hasPapers && (
              <span className="rounded-full bg-teal-50 border border-teal-200/80 px-3 py-1 text-xs font-bold text-teal-950">
                {syllabus.pattern.totalPapers} Official Paper{syllabus.pattern.totalPapers === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-2xl border border-slate-200/90 bg-[#f9fbfa] p-3.5 text-center">
              <p className="text-xs font-semibold text-slate-500">Total Questions</p>
              <p className="font-display mt-1 text-lg font-bold text-slate-900">
                {syllabus.pattern.totalQuestions ? `${syllabus.pattern.totalQuestions} Qs` : `${syllabus.pattern.totalPapers} Paper(s)`}
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-slate-500">Multiple Choice (MCQ)</p>
            </div>
            <div className="rounded-2xl border border-slate-200/90 bg-[#f9fbfa] p-3.5 text-center">
              <p className="text-xs font-semibold text-slate-500">Total Marks</p>
              <p className="font-display mt-1 text-lg font-bold text-slate-900">
                {syllabus.pattern.totalMarks ? `${syllabus.pattern.totalMarks} Marks` : "Official Scale"}
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-slate-500">Full Weightage</p>
            </div>
            <div className="rounded-2xl border border-slate-200/90 bg-[#f9fbfa] p-3.5 text-center">
              <p className="text-xs font-semibold text-slate-500">Duration</p>
              <p className="font-display mt-1 text-lg font-bold text-slate-900">
                {syllabus.pattern.durationMinutes
                  ? `${syllabus.pattern.durationMinutes} Mins`
                  : (syllabus.pattern.totalPapers > 1 ? `${syllabus.pattern.totalPapers} Sessions` : "Timed CBT")}
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-slate-500">Official Exam Time</p>
            </div>
            <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-3.5 text-center">
              <p className="text-xs font-semibold text-teal-800">Negative Marks</p>
              <p className="font-display mt-1 text-sm font-bold text-teal-950">{syllabus.pattern.negativeMarking}</p>
              <p className="mt-0.5 text-[10px] font-semibold text-teal-700">Official Penalty</p>
            </div>
            <div className="rounded-2xl border border-slate-200/90 bg-[#f9fbfa] p-3.5 text-center">
              <p className="text-xs font-semibold text-slate-500">Medium</p>
              <p className="font-display mt-1 text-sm font-bold text-slate-900">{syllabus.pattern.medium}</p>
              <p className="mt-0.5 text-[10px] font-medium text-slate-500">Telugu &amp; English</p>
            </div>
            <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-3.5 text-center">
              <p className="text-xs font-semibold text-teal-800">Exam Mode</p>
              <p className="font-display mt-1 text-sm font-bold text-teal-950">{syllabus.pattern.mode}</p>
              <p className="mt-0.5 text-[10px] font-semibold text-teal-700">Official Format</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-[#f6faf8] p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">Recruitment &amp; Selection Stages</h3>
            <ol className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-slate-800">
              {syllabus.pattern.stages.map((stage, idx) => (
                <li key={stage} className="flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 font-medium">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900">{stage}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Curriculum & Subject Breakdown */}
        {syllabus.hasCurriculum ? (
          <section id="subjects-syllabus" aria-labelledby="subjects-syllabus-heading" className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-8 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Academic Curriculum</p>
                <h2 id="subjects-syllabus-heading" className="font-display mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Subject-Wise Syllabus &amp; Topic Units
                </h2>
              </div>
              <span className="rounded-full bg-teal-50 border border-teal-200/80 px-3.5 py-1 text-xs font-bold text-teal-950">
                {syllabus.totalSubjectsCount} Subject{syllabus.totalSubjectsCount === 1 ? "" : "s"}
                {syllabus.totalTopicsCount > 0 ? ` · ${syllabus.totalTopicsCount} Topics` : ""}
              </span>
            </div>

            {/* Subject-Wise Topic Breakdown - Official Government Format */}
            {syllabus.units.length > 0 && (
              <div className="mt-5 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {syllabus.units.map((unit) => (
                  <article
                    key={unit.name + unit.unitNumber}
                    className="flex min-w-0 flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-200/90 bg-[#f9fbfa] p-4 sm:p-5 transition hover:border-teal-300 hover:bg-white shadow-2xs"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
                        <span className="rounded-md bg-teal-50 border border-teal-200/80 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-teal-900">
                          {unit.unitNumber}
                        </span>
                        {unit.paperName && (
                          <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-slate-600 truncate max-w-[180px] sm:max-w-[220px]">
                            {unit.paperName}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display mt-2 sm:mt-2.5 text-base sm:text-lg font-bold text-slate-900 break-words">
                        {unit.name}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-700 font-normal">
                        {unit.description}
                      </p>
                    </div>

                    {unit.topics.length > 0 && (
                      <div className="mt-3.5 border-t border-slate-200/70 pt-2.5 sm:pt-3">
                        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-teal-800">
                          Key Focus Areas ({unit.topics.length}):
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                          {unit.topics.map((topic) => (
                            <span
                              key={topic}
                              className="rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}

            {/* Paper-Wise Structure & Marks Allocation */}
            {syllabus.papers.length > 0 && (
              <div className="mt-8 sm:mt-10 space-y-5 sm:space-y-6 border-t border-slate-100 pt-6 sm:pt-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Exam Scheme</p>
                  <h3 className="font-display mt-1 text-xl font-bold text-slate-900">
                    Paper-Wise Marks &amp; Question Distribution ({syllabus.papers.length})
                  </h3>
                </div>

                {syllabus.papers.map((paper) => (
                  <div key={paper.id} className="rounded-2xl border border-slate-200 bg-[#f9fbfa] p-4 sm:p-5 lg:p-6">
                    <div>
                      <h4 className="font-display text-base sm:text-lg font-bold text-slate-900">{paper.label}</h4>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                        {paper.questionCount && (
                          <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5">
                            {paper.questionCount} Questions
                          </span>
                        )}
                        {paper.totalMarks && (
                          <span className="rounded-md bg-teal-50 border border-teal-200 text-teal-900 px-2 py-0.5">
                            {paper.totalMarks} Marks
                          </span>
                        )}
                        {paper.durationMinutes && (
                          <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5">
                            {paper.durationMinutes} Minutes
                          </span>
                        )}
                        {paper.negativeMarks > 0 ? (
                          <span className="rounded-md bg-rose-50 border border-rose-200 text-rose-800 px-2 py-0.5">
                            -{paper.negativeMarks} Negative
                          </span>
                        ) : (
                          <span className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5">
                            No Negative
                          </span>
                        )}
                      </div>
                      {paper.description && (
                        <p className="mt-2 text-xs text-slate-600">{paper.description}</p>
                      )}
                    </div>

                    {paper.subjects.length > 0 && (
                      <div className="mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                        {paper.subjects.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex min-w-0 flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4"
                          >
                            <div>
                              <span className="text-sm sm:text-base font-bold text-slate-900 break-words">
                                {sub.name}
                              </span>
                              {sub.topics.length > 0 ? (
                                <div className="mt-2.5 flex flex-wrap gap-1">
                                  {sub.topics.map((topic) => (
                                    <span
                                      key={topic}
                                      className="rounded bg-slate-50 border border-slate-200/70 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="mt-1 text-xs text-slate-500">Official curriculum subject</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          /* Graceful Notice when an Exam is brand new and has no papers/subjects added yet */
          <section className="rounded-2xl border border-teal-200/80 bg-white p-8 text-center shadow-2xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <span className="mt-4 inline-block rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-900">
              Official 2026 Notification &amp; Syllabus in Preparation
            </span>
            <h2 className="font-display mt-2 text-2xl font-bold text-slate-900">
              {meta.shortPrefixedName} Syllabus &amp; Pattern
            </h2>
            <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-slate-600">
              The official examination pattern, paper allocation, and topic syllabus for {examGroup.name} are currently being compiled according to the latest {boardName || state.name} recruiting guidelines.
              New papers and free mock tests will appear here automatically.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href={stateUrl(state.slug)}
                className="inline-flex min-h-[42px] items-center rounded-xl bg-teal-800 hover:bg-teal-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition shadow-xs"
              >
                Browse Available {state.name} Mock Tests →
              </Link>
              <Link
                href="/mock-tests"
                className="inline-flex min-h-[42px] items-center rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 transition"
              >
                View All States &amp; Exams
              </Link>
            </div>
          </section>
        )}

        {/* Dedicated Mock Test Practice CTA Banner */}
        <section className="rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-900 to-slate-950 p-6 sm:p-8 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Official Pattern Practice
              </p>
              <h2 className="font-display mt-1 text-xl sm:text-2xl font-bold text-white">
                Ready to Practice for {examGroup.name}?
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-300">
                Take full-length bilingual mock tests mapped directly to this official government syllabus.
              </p>
            </div>
            <Link
              href={examHref}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-teal-950 hover:bg-teal-50 transition shadow-xs shrink-0"
            >
              Explore {examGroup.name} Mock Tests →
            </Link>
          </div>
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
