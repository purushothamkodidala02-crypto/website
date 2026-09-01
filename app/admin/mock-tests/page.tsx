import { MockSymbol } from "@/components/exams/CatalogSymbols";
import { buildPaperDisplayMap, type OrderedPaper } from "@/lib/papers";
import { createClient } from "@/lib/supabase/server";
import { CreateMockTestForm } from "./CreateMockTestForm";
import { ExistingMockTestsTable } from "./ExistingMockTestsTable";
import type { MockTestStatus } from "@/types/mock-test";

type MockTestSearchParams = {
  state?: string;
  category?: string;
  exam?: string;
  specialization?: string;
  paper?: string;
  status?: string;
  q?: string;
};

type MockTestSummary = {
  mock_test_id: string;
  question_count: number | string;
  usable_question_count: number | string;
  total_marks: number | string;
  attempt_count: number | string;
};

export default async function MockTestsPage({
  searchParams,
}: {
  searchParams: Promise<MockTestSearchParams>;
}) {
  const query = await searchParams;
  const supabase = await createClient();
  const [statesResult, testsResult, subjectsResult, papersResult, groupsResult, categoriesResult, specializationsResult, summariesResult] = await Promise.all([
    supabase.from("exam_states").select("id, name, code, slug").order("display_order"),
    supabase.from("mock_tests").select("id, paper_id, subject_id, test_scope, series_number, title, slug, duration_minutes, target_question_count, status, access_type, display_order, created_at, replaces_mock_test_id, superseded_by_mock_test_id").order("series_number"),
    supabase.from("subjects").select("id, paper_id, name"),
    supabase.from("papers").select("id, exam_group_id, specialization_id, name, slug, duration_minutes, question_count, display_order").order("display_order"),
    supabase.from("exam_groups").select("id, exam_id, name, slug").order("display_order"),
    supabase.from("exams").select("id, state_id, name, slug").order("display_order"),
    supabase.from("exam_specializations").select("id, exam_group_id, name").order("display_order"),
    supabase.rpc("get_admin_mock_test_summaries"),
  ]);
  const states = statesResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const exams = groupsResult.data ?? [];
  const papers = papersResult.data ?? [];
  const subjects = subjectsResult.data ?? [];
  const tests = testsResult.data ?? [];
  const specializations = specializationsResult.data ?? [];
  const paperDisplayById = buildPaperDisplayMap(papers as OrderedPaper[]);
  const stateById = new Map(states.map((item) => [item.id, item]));
  const categoryById = new Map(categories.map((item) => [item.id, item]));
  const specializationById = new Map(specializations.map((item) => [item.id, item.name]));
  const paperById = new Map(papers.map((paper) => [paper.id, paper]));
  const examById = new Map(exams.map((exam) => [exam.id, exam]));
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const categoryOptions = categories.map((item) => ({ id: item.id, stateId: item.state_id, name: item.name }));
  const examOptions = exams.map((item) => ({ id: item.id, categoryId: item.exam_id, name: item.name }));
  const specializationOptions = specializations.map((item) => ({ id: item.id, examId: item.exam_group_id, name: item.name }));
  const paperOptions = papers.map((item) => ({ id: item.id, examId: item.exam_group_id, specializationId: item.specialization_id, name: item.name, duration: item.duration_minutes, questionCount: item.question_count }));
  const stateId = states.some((item) => item.id === query.state) ? query.state ?? "" : "";
  const categoryId = categoryOptions.some((item) => item.id === query.category && item.stateId === stateId) ? query.category ?? "" : "";
  const examId = examOptions.some((item) => item.id === query.exam && item.categoryId === categoryId) ? query.exam ?? "" : "";
  const specializationId = specializationOptions.some((item) => item.id === query.specialization && item.examId === examId) ? query.specialization ?? "" : "";
  const paperId = paperOptions.some((item) => item.id === query.paper && item.examId === examId && item.specializationId === (specializationId || null)) ? query.paper ?? "" : "";
  const initialStatus: MockTestStatus | "all" = query.status === "draft" || query.status === "published" || query.status === "archived" ? query.status : "all";
  const initialSearch = String(query.q ?? "").trim().slice(0, 100);
  const initialLocation = { categoryId, examId, specializationId, paperId, subjectId: "" };
  const summaryByTestId = new Map(
    ((summariesResult.data ?? []) as MockTestSummary[]).map((summary) => [summary.mock_test_id, summary]),
  );
  const mockTestStatusById = new Map(tests.map((test) => [test.id, test.status]));
  const mappedTests = tests.map((test) => {
    const paper = paperById.get(test.paper_id);
    const exam = paper ? examById.get(paper.exam_group_id) : undefined;
    const category = exam ? categoryById.get(exam.exam_id) : undefined;
    const state = category ? stateById.get(category.state_id) : undefined;
    const subject = test.subject_id ? subjectById.get(test.subject_id) : undefined;
    const summary = summaryByTestId.get(test.id);
    return {
      id: test.id,
      stateId: state?.id ?? "",
      stateName: state?.name ?? "Unknown state",
      stateCode: state?.code ?? "—",
      stateSlug: state?.slug ?? "",
      categoryId: exam?.exam_id ?? "",
      examId: exam?.id ?? "",
      specializationId: paper?.specialization_id ?? "",
      paperId: paper?.id ?? "",
      examName: exam?.name ?? "Unknown Exam",
      examSlug: exam?.slug ?? "",
      paperSlug: paper?.slug ?? "",
      paperName: paper ? `${paper.specialization_id ? `${specializationById.get(paper.specialization_id) ?? "Unknown Specialisation"} / ` : ""}${paperDisplayById.get(paper.id)?.label ?? paper.name}` : "Unknown Paper",
      paperLabel: paper ? paperDisplayById.get(paper.id)?.shortLabel ?? paper.name : "Unknown Paper",
      seriesNumber: Number(test.series_number ?? 1),
      title: test.title,
      slug: test.slug,
      durationMinutes: test.duration_minutes,
      scope: test.test_scope as "paper" | "subject",
      subjectName: subject?.name ?? null,
      status: test.status as "draft" | "published" | "archived",
      questionCount: Number(summary?.question_count ?? 0),
      targetQuestionCount: Number(test.target_question_count),
      usableQuestionCount: Number(summary?.usable_question_count ?? 0),
      totalMarks: Number(summary?.total_marks ?? 0),
      attemptCount: Number(summary?.attempt_count ?? 0),
      replacesMockTestId: test.replaces_mock_test_id,
      supersededByMockTestId: test.superseded_by_mock_test_id,
      correctedVersionStatus: test.superseded_by_mock_test_id ? mockTestStatusById.get(test.superseded_by_mock_test_id) ?? null : null,
    };
  });

  return <main>
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 p-7 text-white shadow-xl shadow-teal-950/15 sm:p-9"><div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-teal-300/15 blur-3xl" /><div className="relative flex flex-wrap items-end justify-between gap-6"><div><p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-teal-200"><MockSymbol className="h-4 w-4" /> Publishing workspace</p><h1 className="font-display mt-3 text-4xl">Mock-test control centre</h1><p className="mt-3 max-w-2xl leading-7 text-slate-300">Manage every TG, AP and Central test in one place. Names and series numbers stay consistent automatically.</p></div><div className="grid grid-cols-3 gap-2 text-center text-xs"><Summary value={states.length} label="States" /><Summary value={tests.length} label="Tests" /><Summary value={mappedTests.filter((test) => test.status === "published").length} label="Live" /></div></div></section>
    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Mock-test publishing workflow">
      <WorkflowStep number="1" title="Create draft" detail="Choose the exact State, Board, Exam and Paper." />
      <WorkflowStep number="2" title="Add questions" detail="Reach the exact target with active questions." />
      <WorkflowStep number="3" title="Preview" detail="Check wording, images, answers and mobile layout." />
      <WorkflowStep number="4" title="Choose access" detail="Set the test to Free or Paid series." />
      <WorkflowStep number="5" title="Publish" detail="Publishing is the final student visibility control." />
    </section>
    {testsResult.error || statesResult.error || summariesResult.error ? <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{testsResult.error?.message ?? statesResult.error?.message ?? summariesResult.error?.message}</p> : <ExistingMockTestsTable states={states} categories={categoryOptions} exams={examOptions} specializations={specializationOptions} papers={paperOptions} tests={mappedTests} initialStateId={stateId} initialLocation={initialLocation} initialSearch={initialSearch} initialStatus={initialStatus} />}
    <details className="mt-8 overflow-hidden rounded-3xl border border-teal-200 bg-gradient-to-br from-white to-teal-50 shadow-sm"><summary className="cursor-pointer list-none px-7 py-6"><p className="text-xs font-black uppercase tracking-[0.14em] text-teal-800">Create</p><h2 className="font-display mt-2 text-xl">+ Create the next mock test</h2><p className="mt-1 text-sm text-slate-600">A guided workflow keeps the state, exam, paper and test series correct.</p></summary><div className="border-t border-teal-100 px-4 pb-7 sm:px-7"><CreateMockTestForm states={states} categories={categoryOptions} exams={examOptions} specializations={specializationOptions} papers={paperOptions} subjects={subjects.map((item) => ({ id: item.id, paperId: item.paper_id, name: item.name }))} existingSeries={tests.map((test) => ({ paperId: test.paper_id, subjectId: test.subject_id, scope: test.test_scope as "paper" | "subject", seriesNumber: Number(test.series_number ?? 1) }))} /></div></details>
  </main>;
}

function Summary({ value, label }: { value: number; label: string }) {
  return <span className="min-w-20 rounded-xl bg-white/10 px-3 py-3"><strong className="block text-lg text-white">{value}</strong><span className="text-slate-300">{label}</span></span>;
}

function WorkflowStep({ number, title, detail }: { number: string; title: string; detail: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-100 text-xs font-black text-teal-900">{number}</span><h2 className="mt-3 text-sm font-black text-slate-950">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p></div>;
}
