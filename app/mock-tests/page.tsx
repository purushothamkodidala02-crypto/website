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

export type Filters = {
  state?: string;
  category?: string;
  exam?: string;
  specialization?: string;
  paper?: string;
  subject?: string;
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
  paperDisplay?: { number: number; shortLabel: string; label: string };
  questions: number | null;
  marks: number | null;
};

export async function generateMetadata({ searchParams }: MockTestsPageProps): Promise<Metadata> {
  const filters = await searchParams;
  const title = "State Exam Mock Tests for Telangana & Andhra Pradesh";
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
  for (const key of ["q", "type", "page", "view"] as const) {
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
  const { states, categories, exams, specializations, papers, subjects } = catalog;
  const paperDisplayById = buildPaperDisplayMap(papers as OrderedPaper[]);
  const stateById = new Map(states.map((item) => [item.id, item]));
  const categoryById = new Map(categories.map((item) => [item.id, item]));
  const examById = new Map(exams.map((item) => [item.id, item]));
  const specializationById = new Map(specializations.map((item) => [item.id, item]));
  const paperById = new Map(papers.map((item) => [item.id, item]));
  const subjectById = new Map(subjects.map((item) => [item.id, item]));
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
    return [{ ...test, paper, exam, category, state, subject, specialization, paperDisplay, questions, marks }];
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
    : "all";
  const matchingTests = tests.filter((test) => {
    const searchable = `${test.state.name} ${test.state.code} ${test.category.name} ${test.exam.name} ${test.paperDisplay?.label ?? test.paper.name} ${test.subject?.name ?? ""} ${test.title}`.toLowerCase();
    return (
      (!selectedState || test.state.id === selectedState.id) &&
      (!selectedCategory || test.category.id === selectedCategory.id) &&
      (!selectedExam || test.exam.id === selectedExam.id) &&
      (!selectedSpecialization || test.specialization?.id === selectedSpecialization.id || !test.specialization) &&
      (!selectedPaper || test.paper.id === selectedPaper.id) &&
      (selectedType !== "subject" || !selectedSubject || test.subject?.id === selectedSubject.id) &&
      (selectedType === "all" || test.test_scope === selectedType) &&
      (!query || searchable.includes(query))
    );
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
    <main className="student-page min-h-screen bg-[#f4f7f8] text-slate-950">
      <PublicHeader />
      <section className="relative overflow-hidden border-b bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.16),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-teal-200">
              <MockSymbol className="h-4 w-4" /> Smart mock-test catalogue
            </p>
            <h1 className="font-display mt-5 max-w-3xl text-4xl leading-[1.05] tracking-tight sm:text-5xl">
              {selectedExam && selectedState
                ? hasMockTestSuffixOrMention(selectedExam.name)
                  ? selectedExam.name.toLowerCase().includes(selectedState.name.toLowerCase())
                    ? selectedExam.name
                    : `${selectedExam.name} for ${selectedState.name}`
                  : `${selectedExam.name} mock tests for ${selectedState.name}`
                : "Your state. Your exam. The exact paper you need."}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              {selectedExam ? `Choose the correct ${selectedExam.name} paper, take a timed mock test and review every answer.` : "Move through four clear steps. No mixed AP and TG exams, no unrelated papers, and no confusing test names."}
            </p>
          </div>
          <form action="/mock-tests" method="get" className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
            {selectedState && <input type="hidden" name="state" value={selectedState.slug} />}
            <label htmlFor="catalog-search" className="px-1 text-xs font-bold uppercase tracking-[0.13em] text-teal-200">Know the exam name?</label>
            <div className="mt-2 flex gap-2">
              <input id="catalog-search" name="q" type="search" defaultValue={filters.q ?? ""} placeholder="Try EO, Group 2, TET, SI…" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-teal-300" />
              <button className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-teal-300 text-slate-950 transition hover:bg-teal-200" aria-label="Search mock tests">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" /></svg>
              </button>
            </div>
            <p className="mt-2 px-1 text-xs leading-5 text-slate-400">Search by exam, board, paper, or subject.</p>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-12">
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
          <CatalogSection eyebrow="Step 1" title="Choose your exam location" description="TG and AP content stays completely separate. Central exams have their own space.">
            <div className="student-stagger grid gap-4 md:grid-cols-3">
              {states.map((state, index) => {
                const stats = stateStats.get(state.id) ?? { exams: 0 };
                const tones = ["from-teal-50 to-white border-teal-200", "from-amber-50 to-white border-amber-200", "from-indigo-50 to-white border-indigo-200"];
                return <Link key={state.id} href={stateUrl(state.slug)} className={`student-card group rounded-3xl border bg-gradient-to-br p-6 shadow-sm hover:shadow-xl hover:shadow-slate-950/5 ${tones[index % tones.length]}`}>
                  <span className="flex items-start justify-between gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-teal-200"><StateSymbol slug={state.slug} /></span><span className="rounded-full border bg-white/80 px-3 py-1 text-xs font-black tracking-wide text-slate-600">{state.code}</span></span>
                  <h2 className="font-display mt-6 text-2xl">{state.name}</h2>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{state.description}</p>
                  <span className="mt-6 flex items-center justify-between border-t border-slate-200/70 pt-4 text-sm"><span className="font-semibold text-slate-500">{stats.exams} exam{stats.exams === 1 ? "" : "s"}</span><span className="font-black text-teal-800 transition group-hover:translate-x-1">Choose →</span></span>
                </Link>;
              })}
            </div>
          </CatalogSection>
        ) : !selectedExam ? (
          <>
            <CatalogSection eyebrow={`${selectedState.code} · Step 2`} title={`Choose an exam in ${selectedState.name}`} description="Exams are organized by recruiting board for easy discovery." action={<Link href="/mock-tests" className="text-sm font-bold text-teal-800">Change state</Link>}>
              {stateExams.length === 0 ? <EmptyCatalog title="No exams are available for this state yet" detail="Active exams will appear here after they are added to the catalogue." /> : <ExamSelectionGrid exams={examSelectionItems} />}
            </CatalogSection>

            {matchingTests.length > 0 && (
              <section className="mt-12 border-t border-slate-200/80 pt-10">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">
                      {selectedState.code} · Timed Practice
                    </p>
                    <h2 className="font-display mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      Latest Mock Tests in all subjects
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-600">
                      Directly attempt the newest full-length and subject mock tests available in {selectedState.name}.
                    </p>
                  </div>
                </div>

                <TestGrid tests={matchingTests.slice(0, 9)} />
              </section>
            )}
          </>
        ) : !selectedPaper ? (
          <CatalogSection eyebrow={`${selectedState.code} · ${resolvedCategory?.name} · Step 3`} title={`Choose a paper for ${selectedExam.name}`} description="Paper numbers are generated consistently from the exam structure." action={<Link href={stateUrl(selectedState.slug)} className="text-sm font-bold text-teal-800">Change exam</Link>}>
            {examPapers.length === 0 ? <EmptyCatalog title="No papers are available yet" detail="The admin can add papers from the Exam Structure workspace." /> : <div className="student-stagger grid gap-4 md:grid-cols-2">{examPapers.map((paper) => {
              const display = paperDisplayById.get(paper.id);
              const specialization = paper.specialization_id ? specializationById.get(paper.specialization_id) : undefined;
              const paperTests = tests.filter((test) => test.paper.id === paper.id);
              return <Link key={paper.id} href={paperUrl(selectedState.slug, selectedExam.slug, paper.slug)} className="student-card group flex items-center gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:border-teal-300 hover:shadow-lg">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-slate-950 text-teal-200"><PaperSymbol /></span>
                <span className="min-w-0 flex-1"><span className="text-xs font-black uppercase tracking-[0.12em] text-teal-700">{display?.shortLabel ?? "Paper"}{specialization ? ` · ${specialization.name}` : ""}</span><strong className="font-display mt-1 block text-lg leading-6">{paper.name}</strong><span className="mt-2 block text-sm font-semibold text-slate-500">{paperTests.length} mock test{paperTests.length === 1 ? "" : "s"}</span></span>
                <span className="text-xl font-black text-teal-800 transition group-hover:translate-x-1">→</span>
              </Link>;
            })}</div>}
          </CatalogSection>
        ) : (
          <CatalogSection eyebrow={`${selectedState.code} · ${selectedExam.name} · ${paperDisplayById.get(selectedPaper.id)?.shortLabel}`} title="Choose a mock test" description="Tests use one predictable series: Mock Test 01, Mock Test 02, Mock Test 03…" action={<Link href={examUrl(selectedState.slug, selectedExam.slug)} className="text-sm font-bold text-teal-800">Change paper</Link>}>
            <div className="mb-6 flex flex-wrap gap-2">
              {([['all', 'All tests'], ['paper', 'Full paper'], ['subject', 'Subject practice']] as const).map(([value, label]) => <Link key={value} href={testTypeUrl(value, selectedState.slug, selectedExam.slug, selectedPaper.slug, selectedSubject?.slug)} className={`rounded-full px-4 py-2 text-xs font-black ${selectedType === value ? 'bg-slate-950 text-white' : 'border bg-white text-slate-600'}`}>{label}</Link>)}
            </div>

            {(selectedType === "subject" || Boolean(selectedSubject)) && paperSubjects.length > 0 && (
              <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-teal-700">
                      Subject Catalogue
                    </p>
                    <h3 className="font-display mt-0.5 text-lg font-bold text-slate-900 sm:text-xl">
                      Practice by Subject
                    </h3>
                  </div>
                  {selectedSubject && (
                    <Link
                      href={testTypeUrl("subject", selectedState.slug, selectedExam.slug, selectedPaper.slug)}
                      className="text-xs font-bold text-teal-800 hover:text-teal-950"
                    >
                      Show all subject tests →
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  <Link
                    href={testTypeUrl("subject", selectedState.slug, selectedExam.slug, selectedPaper.slug)}
                    className={`group flex flex-col justify-between rounded-2xl border p-3.5 transition sm:p-4 ${
                      !selectedSubject
                        ? "border-teal-600 bg-teal-50/70 shadow-sm ring-1 ring-teal-500/30"
                        : "border-slate-200 bg-slate-50/60 hover:border-teal-300 hover:bg-white"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">
                        All Subjects
                      </span>
                      <strong className="mt-1 block text-sm font-bold text-slate-900 group-hover:text-teal-800">
                        All Subject Tests
                      </strong>
                    </div>
                    <span className="mt-3 text-xs font-semibold text-slate-500">
                      {tests.filter((t) => t.paper.id === selectedPaper.id && t.test_scope === "subject").length} tests
                    </span>
                  </Link>

                  {paperSubjects.map((sub) => {
                    const isSelected = selectedSubject?.id === sub.id;
                    const subTestsCount = tests.filter((t) => t.subject?.id === sub.id).length;
                    return (
                      <Link
                        key={sub.id}
                        href={subjectUrl(selectedState.slug, selectedExam.slug, selectedPaper.slug, sub.slug)}
                        className={`group flex flex-col justify-between rounded-2xl border p-3.5 transition sm:p-4 ${
                          isSelected
                            ? "border-teal-600 bg-teal-50/70 shadow-sm ring-1 ring-teal-500/30"
                            : "border-slate-200 bg-slate-50/60 hover:border-teal-300 hover:bg-white"
                        }`}
                      >
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">
                            Subject
                          </span>
                          <strong className="mt-1 block text-sm font-bold text-slate-900 group-hover:text-teal-800 line-clamp-2">
                            {sub.name}
                          </strong>
                        </div>
                        <span className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
                          <span>{subTestsCount} test{subTestsCount === 1 ? "" : "s"}</span>
                          <span className="font-bold text-teal-700 transition group-hover:translate-x-0.5">→</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-5">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-teal-700">
                {selectedSubject ? `${selectedSubject.name} Tests` : selectedType === "subject" ? "Subject Practice" : "Mock Series"}
              </p>
              <h3 className="font-display mt-0.5 text-xl font-bold text-slate-900 sm:text-2xl">
                {selectedSubject ? `${selectedSubject.name} Mock Tests` : selectedType === "subject" ? "Subject Mock Tests" : "Latest Uploaded Mock Tests"}
              </h3>
            </div>

            <TestGrid tests={paginatedTests} />
            <CatalogPagination filters={filters} page={currentPage} totalPages={totalPages} basePath={selectedType === "subject" && selectedSubject ? subjectUrl(selectedState.slug, selectedExam.slug, selectedPaper.slug, selectedSubject.slug) : paperUrl(selectedState.slug, selectedExam.slug, selectedPaper.slug)} />
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
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md sm:p-5"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 opacity-90" />

            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xs font-black text-teal-800 border border-teal-100/80">
                    {testNum}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-bold text-slate-900 transition group-hover:text-teal-800 sm:text-lg truncate">
                      {mockTestLabel(Number(test.series_number ?? 1))}
                    </h3>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700 truncate">
                      {test.state.code} · {test.paperDisplay?.shortLabel ?? "Paper"}
                      {test.subject && <span className="font-semibold text-slate-600 normal-case"> · {test.subject.name}</span>}
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    isFree
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  {isFree ? "Free" : "Paid series"}
                </span>
              </div>

              <div className="mt-3.5 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2 text-xs border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">{test.questions ?? "—"}</span>
                  <span className="text-[11px] font-medium text-slate-500">Questions</span>
                </div>
                <span className="text-slate-300 font-bold">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">{test.duration_minutes}</span>
                  <span className="text-[11px] font-medium text-slate-500">Mins</span>
                </div>
                <span className="text-slate-300 font-bold">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">{marksDisplay}</span>
                  <span className="text-[11px] font-medium text-slate-500">Marks</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <MockSymbol className="h-3.5 w-3.5 shrink-0 text-teal-600" />
                <span>Timer & solution</span>
              </span>
              <Link
                href={testHref}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-black text-white transition hover:bg-teal-700 group-hover:bg-teal-700"
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
  return <nav aria-label="Mock-test pages" className="mt-8 flex items-center justify-center gap-3">
    <Link href={pageHref(page - 1)} aria-disabled={page === 1} className={`rounded-xl border bg-white px-4 py-2.5 text-sm font-bold ${page === 1 ? "pointer-events-none opacity-40" : "hover:border-teal-300"}`}>Previous</Link>
    <span className="text-sm font-semibold text-slate-600">Page {page} of {totalPages}</span>
    <Link href={pageHref(Math.min(totalPages, page + 1))} aria-disabled={page === totalPages} className={`rounded-xl border bg-white px-4 py-2.5 text-sm font-bold ${page === totalPages ? "pointer-events-none opacity-40" : "hover:border-teal-300"}`}>Next</Link>
  </nav>;
}

function EmptyCatalog({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><h3 className="font-display text-xl">{title}</h3><p className="mt-2 text-sm text-slate-600">{detail}</p></div>;
}
