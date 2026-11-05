import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import {
  MockSymbol,
  PaperSymbol,
  StateSymbol,
} from "@/components/exams/CatalogSymbols";
import { ExamSelectionGrid, type ExamSelectionItem } from "@/components/exams/ExamSelectionGrid";
import { PublicHeader } from "@/components/site/PublicHeader";
import { CatalogSteps } from "@/components/exams/CatalogSteps";
import { getMockTestCatalogData } from "@/lib/catalog-data";
import { hasMockTestSuffixOrMention, mockTestLabel } from "@/lib/exam-catalog";
import {
  categoryUrl,
  examUrl,
  mockTestUrl,
  paperUrl,
  specializationUrl,
  stateUrl,
  subjectUrl,
} from "@/lib/public-urls";
import { buildPaperDisplayMap, type OrderedPaper } from "@/lib/papers";
import { resolvePublicRoute } from "@/lib/public-route-data";

// ⚡ Cache on global Edge CDN and revalidate every 5 minutes
export const revalidate = 300;

export type Filters = {
  state?: string;
  category?: string;
  exam?: string;
  specialization?: string;
  paper?: string;
  subject?: string;
  section?: string;
  q?: string;
  type?: string;
  page?: string;
  view?: string;
};

export type MockTestsPageProps = {
  searchParams: Promise<Filters>;
  canonicalPath?: string;
};

type MockTestStats = {
  mock_test_id: string;
  question_count: number;
  total_marks: number;
  maximum_negative_marks: number;
};

type CatalogTest = {
  id: string;
  paper_id: string;
  subject_id: string | null;
  subject_section_id?: string | null;
  test_scope: string;
  series_number: number;
  title: string;
  description: string | null;
  duration_minutes: number;
  target_question_count: number | null;
  access_type: string;
  slug: string;
  paper: { id: string; name: string; slug: string };
  exam: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
  state: { id: string; name: string; code: string; slug: string };
  subject?: { id: string; name: string; slug: string };
  section?: { id: string; name: string; slug: string };
  paperDisplay?: { number: number; shortLabel: string; label: string };
  questions: number | null;
  marks: number | null;
};

export async function generateMetadata({ searchParams }: MockTestsPageProps): Promise<Metadata> {
  const filters = await searchParams;
  const title = "TG & AP State Exam Mock Tests";
  const description =
    "Choose your state, exam and paper to find the right mock-test series. Practise Telangana and Andhra Pradesh exams in English and Telugu.";
  const isFiltered = Boolean(
    filters.state || filters.exam || filters.paper || filters.q || filters.type || filters.view ||
      (filters.page && filters.page !== "1"),
  );

  return {
    title,
    description,
    alternates: { canonical: "/mock-tests" },
    robots: isFiltered ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      url: "/mock-tests",
      title,
      description,
      siteName: "Varadhi Prep",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Varadhi Prep state exam mock tests" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

function withQuery(path: string, filters: Filters = {}) {
  const params = new URLSearchParams();
  for (const key of ["q", "type", "page", "view", "section"] as const) {
    const value = filters[key];
    if (value && value !== "all") params.set(key, value);
  }
  const query = params.toString();
  return `${path}${query ? `?${query}` : ""}`;
}

function testTypeUrl(
  type: "all" | "paper" | "subject",
  stateSlug: string,
  examSlug: string,
  paperSlug: string,
  subjectSlug?: string,
) {
  const path = type === "subject" && subjectSlug
    ? subjectUrl(stateSlug, examSlug, paperSlug, subjectSlug)
    : paperUrl(stateSlug, examSlug, paperSlug);
  return withQuery(path, { type });
}

export default async function MockTestsPage({ searchParams, canonicalPath }: MockTestsPageProps) {
  const filters = await searchParams;
  const catalog = await getMockTestCatalogData();
  const { states, categories, exams, specializations, papers, subjects, sections = [] } = catalog;
  const paperDisplayById = buildPaperDisplayMap(papers as OrderedPaper[]);
  const stateById = new Map(states.map((item) => [item.id, item]));
  const categoryById = new Map(categories.map((item) => [item.id, item]));
  const examById = new Map(exams.map((item) => [item.id, item]));
  const specializationById = new Map(specializations.map((item) => [item.id, item]));
  const paperById = new Map(papers.map((item) => [item.id, item]));
  const subjectById = new Map(subjects.map((item) => [item.id, item]));
  const sectionById = new Map(sections.map((item) => [item.id, item]));
  const statsByTestId = new Map(
    (catalog.stats as MockTestStats[]).map((item) => [item.mock_test_id, item]),
  );

  const tests = catalog.tests.flatMap((test) => {
    const paper = paperById.get(test.paper_id);
    const exam = paper ? examById.get(paper.exam_group_id) : undefined;
    const category = exam ? categoryById.get(exam.exam_id) : undefined;
    const state = category ? stateById.get(category.state_id) : undefined;
    if (!paper || !exam || !category || !state) return [];
    const subject = test.subject_id ? subjectById.get(test.subject_id) : undefined;
    const specialization = paper.specialization_id ? specializationById.get(paper.specialization_id) : undefined;
    const section = test.subject_section_id ? sectionById.get(test.subject_section_id) : undefined;
    const paperDisplay = paperDisplayById.get(paper.id);
    const stats = statsByTestId.get(test.id);
    const configuredQuestionCount = Number(test.target_question_count ?? paper.question_count ?? 0);
    const questions = stats
      ? Number(stats.question_count)
      : configuredQuestionCount > 0
        ? configuredQuestionCount
        : null;
    const defaultCorrectMarks = Number(paper.default_correct_marks ?? 0);
    const marks = stats
      ? Number(stats.total_marks)
      : questions !== null && defaultCorrectMarks > 0
        ? questions * defaultCorrectMarks
        : null;
    return [{ ...test, paper, exam, category, state, subject, specialization, section, paperDisplay, questions, marks }];
  });

  let selectedState = states.find((state) => state.slug === filters.state || state.id === filters.state);
  if (!selectedState && filters.state) selectedState = (await resolvePublicRoute({ stateSlug: filters.state }))?.state;
  let selectedCategory = selectedState
    ? categories.find((category) => category.state_id === selectedState.id && (category.slug === filters.category || category.id === filters.category))
    : undefined;
  if (!selectedCategory && selectedState && filters.category) selectedCategory = (await resolvePublicRoute({ stateSlug: selectedState.slug, categorySlug: filters.category }))?.category;
  const stateExams = selectedState
    ? exams.filter((exam) => categoryById.get(exam.exam_id)?.state_id === selectedState.id && (!selectedCategory || exam.exam_id === selectedCategory.id))
    : [];
  let selectedExam = stateExams.find((exam) => exam.id === filters.exam || exam.slug === filters.exam);
  if (!selectedExam && selectedState && filters.exam) selectedExam = (await resolvePublicRoute({ stateSlug: selectedState.slug, examSlug: filters.exam }))?.exam;
  let selectedSpecialization = selectedExam
    ? specializations.find((item) => item.exam_group_id === selectedExam.id && (item.id === filters.specialization || item.slug === filters.specialization))
    : undefined;
  if (!selectedSpecialization && selectedState && selectedExam && filters.specialization) selectedSpecialization = (await resolvePublicRoute({ stateSlug: selectedState.slug, examSlug: selectedExam.slug, specializationSlug: filters.specialization }))?.specialization;
  const examPapers = selectedExam ? papers.filter((paper) => paper.exam_group_id === selectedExam.id && (!selectedSpecialization || paper.specialization_id === selectedSpecialization.id || !paper.specialization_id)) : [];
  let selectedPaper = examPapers.find((paper) => paper.id === filters.paper || paper.slug === filters.paper);
  if (!selectedPaper && selectedState && selectedExam && filters.paper) selectedPaper = (await resolvePublicRoute({ stateSlug: selectedState.slug, examSlug: selectedExam.slug, paperSlug: filters.paper }))?.paper;
  let selectedSubject = selectedPaper
    ? subjects.find((subject) => subject.paper_id === selectedPaper.id && (subject.id === filters.subject || subject.slug === filters.subject))
    : undefined;
  if (!selectedSubject && selectedState && selectedExam && selectedPaper && filters.subject) selectedSubject = (await resolvePublicRoute({ stateSlug: selectedState.slug, examSlug: selectedExam.slug, paperSlug: selectedPaper.slug, subjectSlug: filters.subject }))?.subject;
  if (!canonicalPath && selectedState) {
    const destination = selectedSubject && selectedExam && selectedPaper
      ? subjectUrl(selectedState.slug, selectedExam.slug, selectedPaper.slug, selectedSubject.slug)
      : selectedPaper && selectedExam
        ? paperUrl(selectedState.slug, selectedExam.slug, selectedPaper.slug)
        : selectedSpecialization && selectedExam
          ? specializationUrl(selectedState.slug, selectedExam.slug, selectedSpecialization.slug)
        : selectedExam
          ? examUrl(selectedState.slug, selectedExam.slug)
          : selectedCategory
            ? categoryUrl(selectedState.slug, selectedCategory.slug)
          : stateUrl(selectedState.slug);
    permanentRedirect(withQuery(destination, filters));
  }
  const resolvedCategory = selectedExam ? categoryById.get(selectedExam.exam_id) : selectedCategory;
  const query = filters.q?.trim().toLowerCase() ?? "";
  const isSearching = Boolean(query);
  const selectedType = filters.type === "paper" || filters.type === "subject"
    ? filters.type
    : selectedSubject
      ? "subject"
      : "all";

  const subjectSections = selectedSubject
    ? sections.filter((s) => s.subject_id === selectedSubject.id && s.is_active)
    : [];
  const selectedSection = filters.section
    ? subjectSections.find((s) => s.slug === filters.section || s.id === filters.section)
    : undefined;

  const matchingTests = tests.filter((test) => {
    const searchable = `${test.state.name} ${test.state.code} ${test.category.name} ${test.exam.name} ${test.paperDisplay?.label ?? test.paper.name} ${test.subject?.name ?? ""} ${test.section?.name ?? ""} ${test.title}`.toLowerCase();
    return (
      (!selectedState || test.state.id === selectedState.id) &&
      (!selectedCategory || test.category.id === selectedCategory.id) &&
      (!selectedExam || test.exam.id === selectedExam.id) &&
      (!selectedSpecialization || test.specialization?.id === selectedSpecialization.id || !test.specialization) &&
      (!selectedPaper || test.paper.id === selectedPaper.id) &&
      (selectedType !== "subject" || !selectedSubject || test.subject?.id === selectedSubject.id) &&
      (selectedType === "all" || test.test_scope === selectedType) &&
      (!selectedSection
        ? (selectedSubject && subjectSections.length > 0 && !isSearching
            ? !test.subject_section_id
            : true)
        : test.subject_section_id === selectedSection.id) &&
      (!query || searchable.includes(query))
    );
  });

  matchingTests.sort((a, b) => {
    if (selectedSubject || selectedSection) {
      const diff = Number(a.series_number ?? 0) - Number(b.series_number ?? 0);
      if (diff !== 0) return diff;
      const timeA = new Date(a.published_at || a.created_at || a.updated_at || 0).getTime();
      const timeB = new Date(b.published_at || b.created_at || b.updated_at || 0).getTime();
      return timeB - timeA;
    }
    const timeA = new Date(a.published_at || a.created_at || a.updated_at || 0).getTime();
    const timeB = new Date(b.published_at || b.created_at || b.updated_at || 0).getTime();
    if (timeB !== timeA) return timeB - timeA;
    return Number(b.series_number ?? 0) - Number(a.series_number ?? 0);
  });

  const pageSize = 24;
  const requestedPage = Number.parseInt(filters.page ?? "1", 10);
  const totalPages = Math.max(1, Math.ceil(matchingTests.length / pageSize));
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(totalPages, Math.max(1, requestedPage))
    : 1;
  const paginatedTests = matchingTests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const stateStats = new Map(states.map((state) => {
    const stateCategoryIds = new Set(categories.filter((category) => category.state_id === state.id).map((category) => category.id));
    return [state.id, {
      exams: exams.filter((exam) => stateCategoryIds.has(exam.exam_id)).length,
    }];
  }));

  const dataError = catalog.hasError;
  const paperSubjects = selectedPaper
    ? subjects.filter((subject) => {
        if (subject.paper_id !== selectedPaper.id || !subject.is_active) return false;
        const testCount = tests.filter((t) => t.subject?.id === subject.id).length;
        return testCount > 0;
      })
    : [];
  const examSelectionItems: ExamSelectionItem[] = selectedState
    ? stateExams.map((exam) => {
      const category = categoryById.get(exam.exam_id);
      return {
        id: exam.id,
        name: exam.name,
        slug: exam.slug,
        boardName: category?.name ?? "Exam board",
        contextLabel: `${selectedState.code} · ${category?.name ?? "Exam board"}`,
        paperCount: papers.filter((paper) => paper.exam_group_id === exam.id).length,
        href: examUrl(selectedState.slug, exam.slug),
      };
    })
    : [];

  return (
    <main className="student-page min-h-screen bg-[#f6faf8] text-[#132621]">
      <PublicHeader />
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-[#f1f5f9] via-[#f5f8fc] to-[#f8fafc]">
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-900">
                <MockSymbol className="h-3.5 w-3.5 text-blue-700" /> Official Pattern Test Series
              </span>
              {selectedState && (
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {selectedState.name}
                </span>
              )}
            </div>
            <h1 className="font-display mt-3.5 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {selectedExam && selectedState
                ? hasMockTestSuffixOrMention(selectedExam.name)
                  ? selectedExam.name.toLowerCase().includes(selectedState.name.toLowerCase())
                    ? selectedExam.name
                    : `${selectedExam.name} for ${selectedState.name}`
                  : `${selectedExam.name} Mock Tests (${selectedState.code})`
                : "State Competitive Exam Mock Tests"}
            </h1>
            <p className="mt-3.5 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
              {selectedExam
                ? `Practise timed ${selectedExam.name} papers designed to the latest official syllabus with bilingual questions, negative marking, and instant detailed solutions.`
                : "Full-length papers and targeted subject practice for Telangana and Andhra Pradesh competitive exams with real exam timing and scoring."}
            </p>
          </div>
          <form action="/mock-tests" method="get" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            {selectedState && <input type="hidden" name="state" value={selectedState.slug} />}
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Search Test Series</p>
            <div className="mt-2.5 flex gap-2">
              <input
                id="catalog-search"
                name="q"
                type="search"
                defaultValue={filters.q ?? ""}
                placeholder="Search by exam, paper, or subject..."
                className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
              />
              <button
                type="submit"
                className="inline-flex h-11 px-4 items-center justify-center rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition shadow-xs"
                aria-label="Search mock tests"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16.5 16.5 4 4" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">e.g. Group 2, Constable, General Studies, Current Affairs</p>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <CatalogSteps
          state={selectedState ? { value: selectedState.name, href: "/mock-tests" } : undefined}
          exam={selectedState && selectedExam ? { value: selectedExam.name, href: stateUrl(selectedState.slug) } : undefined}
          paper={selectedState && selectedExam && selectedPaper ? { value: paperDisplayById.get(selectedPaper.id)?.shortLabel ?? selectedPaper.name, href: examUrl(selectedState.slug, selectedExam.slug) } : undefined}
        />

        {dataError ? (
          <section className="mt-7 rounded-3xl border border-red-200 bg-red-50 p-7 text-red-800">
            <h2 className="font-display text-xl">The mock-test catalogue could not be loaded.</h2>
            <p className="mt-2 text-sm">Please refresh the page after the catalogue database update is applied.</p>
          </section>
        ) : isSearching ? (
          <CatalogSection eyebrow="Search results" title={`${matchingTests.length} result${matchingTests.length === 1 ? "" : "s"} for “${filters.q?.trim()}”`} action={<Link href={selectedState ? stateUrl(selectedState.slug) : "/mock-tests"} className="text-sm font-bold text-teal-800">Clear search</Link>}>
            <TestGrid tests={paginatedTests} />
            <CatalogPagination filters={filters} page={currentPage} totalPages={totalPages} basePath={selectedState && selectedExam ? examUrl(selectedState.slug, selectedExam.slug) : selectedState ? stateUrl(selectedState.slug) : "/mock-tests"} />
          </CatalogSection>
        ) : !selectedState ? (
          <CatalogSection
            eyebrow="Step 1"
            title="Choose your target state"
            description="Select your state to explore dedicated competitive exams, official syllabus papers, and practice series."
          >
            <div className="student-stagger grid gap-4 md:grid-cols-3">
              {states.map((state) => {
                const stats = stateStats.get(state.id) ?? { exams: 0 };
                return (
                  <Link
                    key={state.id}
                    href={stateUrl(state.slug)}
                    prefetch={false}
                    className="student-card group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-400 hover:shadow-md"
                  >
                    <div>
                      <span className="flex items-start justify-between gap-4">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#071f1a] text-teal-300">
                          <StateSymbol slug={state.slug} />
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black tracking-wide text-slate-700">
                          {state.code}
                        </span>
                      </span>
                      <h2 className="font-display mt-5 text-2xl font-bold text-slate-950 group-hover:text-teal-800 transition">
                        {state.name}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {state.description}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                      <span className="font-bold text-slate-600">
                        {stats.exams} exam{stats.exams === 1 ? "" : "s"}
                      </span>
                      <span className="font-black text-teal-700 transition group-hover:translate-x-1">
                        View exams →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CatalogSection>
        ) : !selectedExam ? (
          <CatalogSection
            eyebrow={`${selectedState.code} · Step 2`}
            title={`Select an exam in ${selectedState.name}`}
            description="Choose your competitive exam to view available papers and mock test series."
            action={<Link href="/mock-tests" className="text-sm font-bold text-teal-800">← Change state</Link>}
          >
            {stateExams.length === 0 ? <EmptyCatalog title="No exams are available for this state yet" detail="Active exams will appear here after they are added to the catalogue." /> : <ExamSelectionGrid exams={examSelectionItems} />}
          </CatalogSection>
        ) : !selectedPaper ? (
          <CatalogSection
            eyebrow={`${selectedState.code} · ${resolvedCategory?.name} · Step 3`}
            title={`Select a paper for ${selectedExam.name}`}
            description="Choose a paper to practice full-length mock tests or targeted subject practice."
            action={<Link href={stateUrl(selectedState.slug)} className="text-sm font-bold text-teal-800">← Change exam</Link>}
          >
            {examPapers.length === 0 ? <EmptyCatalog title="No papers are available yet" detail="The admin can add papers from the Exam Structure workspace." /> : <div className="student-stagger grid gap-4 md:grid-cols-2">{examPapers.map((paper) => {
              const display = paperDisplayById.get(paper.id);
              const specialization = paper.specialization_id ? specializationById.get(paper.specialization_id) : undefined;
              const paperTests = tests.filter((test) => test.paper.id === paper.id);
              return <Link key={paper.id} href={paperUrl(selectedState.slug, selectedExam.slug, paper.slug)} prefetch={false} className="student-card group flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-400 hover:shadow-md">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#071f1a] text-teal-300"><PaperSymbol /></span>
                <span className="min-w-0 flex-1"><span className="text-xs font-bold uppercase tracking-wider text-teal-700">{display?.shortLabel ?? "Paper"}{specialization ? ` · ${specialization.name}` : ""}</span><strong className="font-display mt-0.5 block text-lg font-bold leading-snug text-slate-900 group-hover:text-teal-800 transition">{paper.name}</strong><span className="mt-1.5 block text-xs font-semibold text-slate-500">{paperTests.length} mock test{paperTests.length === 1 ? "" : "s"}</span></span>
                <span className="text-lg font-black text-teal-700 transition group-hover:translate-x-1">→</span>
              </Link>;
            })}</div>}
          </CatalogSection>
        ) : (
          <CatalogSection
            eyebrow={`${selectedState.code} · ${selectedExam.name} · ${paperDisplayById.get(selectedPaper.id)?.shortLabel}`}
            title="Available Mock Tests"
            description="Take timed tests simulating real examination conditions with instant scorecards and detailed bilingual answers."
            action={
              selectedSubject ? (
                <div className="flex items-center gap-3">
                  <Link
                    href={testTypeUrl("subject", selectedState.slug, selectedExam.slug, selectedPaper.slug)}
                    className="text-sm font-bold text-teal-800 hover:text-teal-950"
                  >
                    All subjects →
                  </Link>
                  <Link
                    href={examUrl(selectedState.slug, selectedExam.slug)}
                    className="text-sm font-bold text-slate-500 hover:text-slate-700"
                  >
                    Change paper
                  </Link>
                </div>
              ) : (
                <Link href={examUrl(selectedState.slug, selectedExam.slug)} className="text-sm font-bold text-teal-800 hover:text-teal-950">
                  Change paper
                </Link>
              )
            }
          >
            <div className="mb-4 flex flex-wrap gap-2">
              {([['all', 'All tests'], ['paper', 'Full paper'], ['subject', 'Subject practice']] as const).map(([value, label]) => <Link key={value} href={testTypeUrl(value, selectedState.slug, selectedExam.slug, selectedPaper.slug, selectedSubject?.slug)} className={`rounded-full px-4 py-2 text-xs font-black ${selectedType === value ? 'bg-[#0a2922] text-white shadow-xs' : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-200'}`}>{label}</Link>)}
            </div>

            {selectedType === "subject" && paperSubjects.length > 0 && (
              <div className="mb-6 rounded-2xl border border-teal-100 bg-white p-3 sm:p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Subjects:
                  </span>
                  <Link
                    href={testTypeUrl("subject", selectedState.slug, selectedExam.slug, selectedPaper.slug)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                      !selectedSubject
                        ? "bg-teal-800 text-white shadow-sm font-black border border-teal-800"
                        : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-300"
                    }`}
                  >
                    All subjects overview ({paperSubjects.length})
                  </Link>
                  {paperSubjects.map((sub) => {
                    const isSelected = selectedSubject?.id === sub.id;
                    const subTestsCount = tests.filter((t) => t.subject?.id === sub.id).length;
                    return (
                      <Link
                        key={sub.id}
                        href={subjectUrl(selectedState.slug, selectedExam.slug, selectedPaper.slug, sub.slug)}
                        className={`rounded-xl px-3.5 py-1.5 text-xs transition ${
                          isSelected
                            ? "bg-teal-800 text-white shadow-sm font-black border border-teal-800"
                            : "border border-slate-200 bg-slate-50 text-slate-700 font-bold hover:border-teal-300"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}{sub.name}{" "}
                        <span
                          className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-black ${
                            isSelected ? "bg-teal-900/60 text-teal-100" : "bg-slate-200/80 text-slate-600"
                          }`}
                        >
                          {subTestsCount}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedType === "subject" && !selectedSubject && paperSubjects.length > 0 && (
              <div className="mb-10">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-teal-700">
                      Subject Catalogue
                    </p>
                    <h3 className="font-display mt-0.5 text-xl font-bold text-slate-900 sm:text-2xl">
                      Choose a subject for targeted practice
                    </h3>
                  </div>
                </div>

                <div className="student-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {paperSubjects.map((sub) => {
                    const subTestsCount = tests.filter((t) => t.subject?.id === sub.id).length;
                    return (
                      <Link
                        key={sub.id}
                        href={subjectUrl(selectedState.slug, selectedExam.slug, selectedPaper.slug, sub.slug)}
                        className="student-card group flex min-h-48 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300 hover:shadow-xl hover:shadow-slate-950/5"
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-800">
                            <PaperSymbol className="h-6 w-6" />
                          </span>
                          <span className="max-w-[62%] truncate rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600">
                            {paperDisplayById.get(selectedPaper.id)?.shortLabel ?? "Paper"}
                          </span>
                        </span>
                        <h3 className="font-display mt-5 text-xl leading-7 text-slate-950 group-hover:text-teal-800 transition">
                          {sub.name}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                          {selectedState.code} · {selectedExam.name}
                        </p>
                        <span className="mt-auto flex items-center justify-between border-t pt-4 text-sm">
                          <span className="font-semibold text-slate-500">
                            {subTestsCount} mock test{subTestsCount === 1 ? "" : "s"}
                          </span>
                          <span className="font-black text-teal-800 transition group-hover:translate-x-1">
                            Open →
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-sections grid when in subject view and sections exist and not filtering to a section */}
            {selectedType === "subject" && selectedSubject && subjectSections.length > 0 && !selectedSection && (
              <div className="mb-10">
                <div className="mb-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-teal-700">
                    Monthly & Topic Practice
                  </p>
                  <h3 className="font-display mt-0.5 text-xl font-bold text-slate-900 sm:text-2xl">
                    Choose a month or topic in {selectedSubject.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Select a month to practise its dedicated series of mock tests.
                  </p>
                </div>

                <div className="student-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {subjectSections.map((sec) => {
                    const secTests = tests.filter((t) => t.subject_section_id === sec.id);
                    return (
                      <Link
                        key={sec.id}
                        href={withQuery(subjectUrl(selectedState.slug, selectedExam.slug, selectedPaper.slug, selectedSubject.slug), {
                          ...filters,
                          section: sec.slug,
                          page: undefined,
                        })}
                        className="student-card group flex min-h-36 flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-400 hover:shadow-xl hover:shadow-slate-950/5"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-50 text-teal-800 border border-teal-100">
                              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black tracking-wide text-teal-800">
                              {secTests.length} test{secTests.length === 1 ? "" : "s"}
                            </span>
                          </div>
                          <h4 className="font-display mt-4 text-xl font-bold text-slate-950 group-hover:text-teal-800 transition">
                            {sec.name}
                          </h4>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                          <span className="font-semibold text-slate-500">Practice series</span>
                          <span className="font-black text-teal-800 transition group-hover:translate-x-1">
                            Open tests →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-section header banner when viewing a specific section */}
            {selectedType === "subject" && selectedSubject && selectedSection && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50/60 p-4">
                <div className="flex items-center gap-3">
                  <Link
                    href={withQuery(subjectUrl(selectedState.slug, selectedExam.slug, selectedPaper.slug, selectedSubject.slug), {
                      ...filters,
                      section: undefined,
                      page: undefined,
                    })}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-white px-3.5 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-50 transition shadow-sm"
                  >
                    ← Back to all {selectedSubject.name}
                  </Link>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Sub-section</span>
                    <h4 className="font-display text-base font-bold text-slate-900">{selectedSection.name}</h4>
                  </div>
                </div>
                <span className="rounded-full bg-teal-800 px-3 py-1 text-xs font-black text-white">
                  {matchingTests.length} Mock Test{matchingTests.length === 1 ? "" : "s"}
                </span>
              </div>
            )}

            {(!selectedSubject || subjectSections.length === 0 || selectedSection || matchingTests.length > 0) && (
              <div className="mb-5">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-teal-700">
                  {selectedSection
                    ? `${selectedSection.name} Tests`
                    : selectedSubject && subjectSections.length > 0
                      ? "Common Subject Practice"
                      : selectedSubject
                        ? `${selectedSubject.name} Tests`
                        : selectedType === "subject"
                          ? "Timed Practice"
                          : "Mock Series"}
                </p>
                <h3 className="font-display mt-0.5 text-xl font-bold text-slate-900 sm:text-2xl">
                  {selectedSection
                    ? `${selectedSubject?.name} · ${selectedSection.name} Mock Tests`
                    : selectedSubject && subjectSections.length > 0
                      ? `Common ${selectedSubject.name} Mock Tests`
                      : selectedSubject
                        ? `${selectedSubject.name} Mock Tests`
                        : selectedType === "subject"
                          ? "Latest mock tests in all subjects"
                          : "Latest Uploaded Mock Tests"}
                </h3>
              </div>
            )}

            {(!selectedSubject || subjectSections.length === 0 || selectedSection || matchingTests.length > 0) && (
              <TestGrid
                tests={
                  selectedType === "subject" && !selectedSubject
                    ? paginatedTests.slice(0, 4)
                    : paginatedTests
                }
              />
            )}

            {selectedType === "subject" && !selectedSubject && paginatedTests.length > 4 ? (
              <div className="mt-6 flex justify-center">
                <p className="text-xs font-semibold text-slate-500">
                  Select any subject above to practice all {matchingTests.length} tests
                </p>
              </div>
            ) : (
              <CatalogPagination
                filters={filters}
                page={currentPage}
                totalPages={totalPages}
                basePath={
                  selectedType === "subject" && selectedSubject
                    ? subjectUrl(selectedState.slug, selectedExam.slug, selectedPaper.slug, selectedSubject.slug)
                    : paperUrl(selectedState.slug, selectedExam.slug, selectedPaper.slug)
                }
              />
            )}
          </CatalogSection>
        )}
      </div>
    </main>
  );
}

function CatalogSection({ eyebrow, title, description, action, children }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="mt-8"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.15em] text-teal-700">{eyebrow}</p><h2 className="font-display mt-2 text-2xl tracking-tight sm:text-3xl">{title}</h2>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>}</div>{action}</div>{children}</section>;
}

function TestGrid({ tests }: { tests: CatalogTest[] }) {
  if (tests.length === 0) return <EmptyCatalog title="No matching mock tests" detail="Try another paper or clear the current search." />;
  return (
    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tests.map((test) => {
        const testNum = String(test.series_number ?? 1).padStart(2, "0");
        const isFree = test.access_type === "free";
        const testHref = mockTestUrl(test.state.slug, test.exam.slug, test.paper.slug, test.slug);
        const marksDisplay = test.marks === null ? "—" : Number(test.marks).toFixed(2).replace(/\.00$/, "");

        return (
          <article
            key={test.id}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs transition hover:border-teal-400 hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xs font-black text-teal-900 border border-teal-200/80">
                    {testNum}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-bold text-slate-900 transition group-hover:text-teal-800 sm:text-lg truncate">
                      {mockTestLabel(Number(test.series_number ?? 1))}
                    </h3>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700 truncate">
                      {test.state.code} · {test.paperDisplay?.shortLabel ?? "Paper"}
                      {test.subject && <span className="font-semibold text-slate-600 normal-case"> · {test.subject.name}</span>}
                      {test.section && <span className="font-bold text-teal-800 normal-case"> ({test.section.name})</span>}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    isFree
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-amber-50 text-amber-900 border border-amber-200"
                  }`}
                >
                  {isFree ? "Free" : "Paid series"}
                </span>
              </div>

              <div className="mt-3.5 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2 text-xs border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900">{test.questions ?? "—"}</span>
                  <span className="text-[11px] font-medium text-slate-500">Questions</span>
                </div>
                <span className="text-slate-300 font-bold">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900">{test.duration_minutes}</span>
                  <span className="text-[11px] font-medium text-slate-500">Mins</span>
                </div>
                <span className="text-slate-300 font-bold">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900">{marksDisplay}</span>
                  <span className="text-[11px] font-medium text-slate-500">Marks</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs font-semibold text-slate-500">
                Timed CBT · Bilingual
              </span>
              <Link
                href={testHref}
                prefetch={false}
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
  );
}

function CatalogPagination({ filters, page, totalPages, basePath }: { filters: Filters; page: number; totalPages: number; basePath: string }) {
  if (totalPages <= 1) return null;
  const pageHref = (nextPage?: number) => {
    const nextFilters = { ...filters, page: nextPage && nextPage > 1 ? String(nextPage) : undefined };
    return withQuery(basePath, nextFilters);
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [];
    pages.push(1);
    if (page > 3) {
      pages.push("ellipsis");
    }
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) {
      pages.push("ellipsis");
    }
    pages.push(totalPages);
    return pages;
  };

  const pageItems = getPageNumbers();

  return (
    <nav aria-label="Mock-test pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <Link
        href={pageHref(page - 1)}
        prefetch={false}
        aria-disabled={page === 1}
        className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition sm:text-sm ${
          page === 1 ? "pointer-events-none opacity-40" : "hover:border-teal-400 hover:text-teal-900 hover:shadow-xs"
        }`}
      >
        <span aria-hidden="true">←</span>
        <span>Previous</span>
      </Link>

      <div className="flex items-center gap-1.5">
        {pageItems.map((item, idx) => {
          if (item === "ellipsis") {
            return (
              <span key={`ellipsis-${idx}`} className="px-1 text-xs font-bold text-slate-400 select-none sm:text-sm">
                …
              </span>
            );
          }
          const isCurrent = item === page;
          return isCurrent ? (
            <span
              key={item}
              aria-current="page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-teal-800 text-xs font-bold text-white shadow-2xs sm:h-9 sm:w-9 sm:text-sm"
            >
              {item}
            </span>
          ) : (
            <Link
              key={item}
              href={pageHref(item)}
              prefetch={false}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs transition hover:border-teal-400 hover:text-teal-900 hover:shadow-xs sm:h-9 sm:w-9 sm:text-sm"
              aria-label={`Go to page ${item}`}
            >
              {item}
            </Link>
          );
        })}
      </div>

      <Link
        href={pageHref(Math.min(totalPages, page + 1))}
        prefetch={false}
        aria-disabled={page === totalPages}
        className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition sm:text-sm ${
          page === totalPages ? "pointer-events-none opacity-40" : "hover:border-teal-400 hover:text-teal-900 hover:shadow-xs"
        }`}
      >
        <span>Next</span>
        <span aria-hidden="true">→</span>
      </Link>
    </nav>
  );
}

function EmptyCatalog({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><h3 className="font-display text-xl">{title}</h3><p className="mt-2 text-sm text-slate-600">{detail}</p></div>;
}
