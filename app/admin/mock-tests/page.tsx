import { MockSymbol } from "@/components/exams/CatalogSymbols";
import { buildPaperDisplayMap, type OrderedPaper } from "@/lib/papers";
import { createClient } from "@/lib/supabase/server";
import { CreateMockTestForm } from "./CreateMockTestForm";
import { ExistingMockTestsTable } from "./ExistingMockTestsTable";
import type { MockTestStatus } from "@/types/mock-test";
import { getAdminAttemptCountsByMockTestId } from "@/lib/admin-mock-test-exemptions";

type MockTestSearchParams = {
  state?: string;
  category?: string;
  exam?: string;
  specialization?: string;
  paper?: string;
  status?: string;
  q?: string;
  scope?: string;
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
  const [statesResult, testsResult, subjectsResult, papersResult, groupsResult, categoriesResult, specializationsResult, sectionsResult, summariesResult, notificationsResult, attemptExemptions] = await Promise.all([
    supabase.from("exam_states").select("id, name, code, slug").order("display_order"),
    supabase.from("mock_tests").select("id, paper_id, subject_id, subject_section_id, test_scope, series_number, title, slug, duration_minutes, target_question_count, status, access_type, display_order, created_at, replaces_mock_test_id, superseded_by_mock_test_id").order("series_number"),
    supabase.from("subjects").select("id, paper_id, name"),
    supabase.from("papers").select("id, exam_group_id, specialization_id, name, slug, duration_minutes, question_count, display_order").order("display_order"),
    supabase.from("exam_groups").select("id, exam_id, name, slug").order("display_order"),
    supabase.from("exams").select("id, state_id, name, slug").order("display_order"),
    supabase.from("exam_specializations").select("id, exam_group_id, name").order("display_order"),
    supabase.from("subject_sections").select("id, subject_id, name, slug, is_active").order("display_order"),
    supabase.rpc("get_admin_mock_test_summaries"),
    supabase.from("mock_test_notifications").select("mock_test_id, recipient_count, sent_at").order("sent_at", { ascending: false }),
    getAdminAttemptCountsByMockTestId(),
  ]);
  const states = statesResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const exams = groupsResult.data ?? [];
  const papers = papersResult.data ?? [];
  const subjects = subjectsResult.data ?? [];
  const sections = sectionsResult.data ?? [];
  const tests = testsResult.data ?? [];
  const specializations = specializationsResult.data ?? [];
  const paperDisplayById = buildPaperDisplayMap(papers as OrderedPaper[]);
  const stateById = new Map(states.map((item) => [item.id, item]));
  const categoryById = new Map(categories.map((item) => [item.id, item]));
  const specializationById = new Map(specializations.map((item) => [item.id, item.name]));
  const paperById = new Map(papers.map((paper) => [paper.id, paper]));
  const examById = new Map(exams.map((exam) => [exam.id, exam]));
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const sectionById = new Map(sections.map((section) => [section.id, section]));
  const categoryOptions = categories.map((item) => ({ id: item.id, stateId: item.state_id, name: item.name }));
  const examOptions = exams.map((item) => ({ id: item.id, categoryId: item.exam_id, name: item.name }));
  const specializationOptions = specializations.map((item) => ({ id: item.id, examId: item.exam_group_id, name: item.name }));
  const paperOptions = papers.map((item) => ({ id: item.id, examId: item.exam_group_id, specializationId: item.specialization_id, name: item.name, duration: item.duration_minutes, questionCount: item.question_count }));
  const stateId = states.some((item) => item.id === query.state) ? query.state ?? "" : "";
  const categoryId = categoryOptions.some((item) => item.id === query.category && (!stateId || item.stateId === stateId)) ? query.category ?? "" : "";
  const examId = examOptions.some((item) => item.id === query.exam && (!categoryId || item.categoryId === categoryId)) ? query.exam ?? "" : "";
  const specializationId = specializationOptions.some((item) => item.id === query.specialization && (!examId || item.examId === examId)) ? query.specialization ?? "" : "";
  const paperId = paperOptions.some((item) => item.id === query.paper && (!examId || item.examId === examId) && (!specializationId || item.specializationId === specializationId)) ? query.paper ?? "" : "";
  const initialStatus: MockTestStatus | "all" = query.status === "draft" || query.status === "published" || query.status === "archived" ? query.status : "all";
  const initialScope: "all" | "paper" | "subject" = query.scope === "paper" || query.scope === "subject" ? query.scope : "all";
  const initialSearch = String(query.q ?? "").trim().slice(0, 100);
  const initialLocation = { categoryId, examId, specializationId, paperId, subjectId: "" };
  const summaryByTestId = new Map(
    ((summariesResult.data ?? []) as MockTestSummary[]).map((summary) => [summary.mock_test_id, summary]),
  );
  const notifications = (notificationsResult.data ?? []) as { mock_test_id: string; recipient_count: number; sent_at: string }[];
  const notificationMap = new Map<string, { lastNotifiedAt: string; count: number }>();
  for (const item of notifications) {
    if (!notificationMap.has(item.mock_test_id)) {
      notificationMap.set(item.mock_test_id, {
        lastNotifiedAt: item.sent_at,
        count: item.recipient_count,
      });
    }
  }

  const mockTestStatusById = new Map(tests.map((test) => [test.id, test.status]));
  const mappedTests = tests.map((test) => {
    const paper = paperById.get(test.paper_id);
    const exam = paper ? examById.get(paper.exam_group_id) : undefined;
    const category = exam ? categoryById.get(exam.exam_id) : undefined;
    const state = category ? stateById.get(category.state_id) : undefined;
    const subject = test.subject_id ? subjectById.get(test.subject_id) : undefined;
    const section = test.subject_section_id ? sectionById.get(test.subject_section_id) : undefined;
    const summary = summaryByTestId.get(test.id);
    const notification = notificationMap.get(test.id);
    const exemption = attemptExemptions.get(test.id);
    const studentAttempts = Number(summary?.attempt_count ?? 0);
    const adminAttempts = exemption?.adminAttempts ?? 0;
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
      subjectSectionId: test.subject_section_id ?? null,
      sectionName: section?.name ?? null,
      sectionSlug: section?.slug ?? null,
      status: test.status as "draft" | "published" | "archived",
      questionCount: Number(summary?.question_count ?? 0),
      targetQuestionCount: Number(test.target_question_count),
      usableQuestionCount: Number(summary?.usable_question_count ?? 0),
      totalMarks: Number(summary?.total_marks ?? 0),
      attemptCount: studentAttempts,
      adminAttemptCount: adminAttempts,
      replacesMockTestId: test.replaces_mock_test_id,
      supersededByMockTestId: test.superseded_by_mock_test_id,
      correctedVersionStatus: test.superseded_by_mock_test_id ? mockTestStatusById.get(test.superseded_by_mock_test_id) ?? null : null,
      lastNotifiedAt: notification?.lastNotifiedAt ?? null,
      notificationCount: notification?.count ?? 0,
    };
  });

  const publishedCount = mappedTests.filter((test) => test.status === "published").length;
  const draftCount = mappedTests.filter((test) => test.status === "draft").length;

  return <main className="space-y-6">
      {/* Professional Executive Header */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <MockSymbol className="h-4 w-4" />
              <span>Assessment Operations</span>
            </div>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Mock Tests
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Create, configure questions, and publish state competitive examination practice papers for students across Telangana and Andhra Pradesh.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="#create-mock-test"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-slate-800 active:bg-slate-950"
            >
              <span className="text-sm leading-none">+</span> Create Mock Test
            </a>
          </div>
        </div>

        {/* Executive KPI Stats Bar */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-6 border-t border-slate-100">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
            <span className="text-xs font-medium text-slate-500">Total Mock Tests</span>
            <p className="mt-1 text-2xl font-bold font-mono tracking-tight text-slate-900">{tests.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/30 p-3.5">
            <span className="text-xs font-medium text-emerald-800/90">Published (Live)</span>
            <p className="mt-1 text-2xl font-bold font-mono tracking-tight text-emerald-950">{publishedCount}</p>
          </div>
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/30 p-3.5">
            <span className="text-xs font-medium text-amber-800/90">Drafts</span>
            <p className="mt-1 text-2xl font-bold font-mono tracking-tight text-amber-950">{draftCount}</p>
          </div>
          <div className="rounded-xl border border-sky-200/70 bg-sky-50/30 p-3.5">
            <span className="text-xs font-medium text-sky-800/90">States Covered</span>
            <p className="mt-1 text-2xl font-bold font-mono tracking-tight text-sky-950">{states.length}</p>
          </div>
        </div>
      </section>

      {/* Main Existing Mock Tests Workspace */}
      {testsResult.error || statesResult.error || summariesResult.error ? (
        <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {testsResult.error?.message ?? statesResult.error?.message ?? summariesResult.error?.message}
        </p>
      ) : (
        <ExistingMockTestsTable
          states={states}
          categories={categoryOptions}
          exams={examOptions}
          specializations={specializationOptions}
          papers={paperOptions}
          tests={mappedTests}
          initialStateId={stateId}
          initialLocation={initialLocation}
          initialSearch={initialSearch}
          initialStatus={initialStatus}
          initialScope={initialScope}
        />
      )}

      {/* Create New Mock Test Section */}
      <section id="create-mock-test" className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5 bg-slate-50/60">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>New Test Series</span>
          </div>
          <h2 className="mt-1 text-lg sm:text-xl font-bold text-slate-900">
            Create Mock Test
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-600">
            Select the state, exam, and paper to automatically calculate the next series number and configure duration and question targets.
          </p>
        </div>
        <div className="px-6 py-6 sm:px-8 sm:py-7">
          <CreateMockTestForm
            states={states}
            categories={categoryOptions}
            exams={examOptions}
            specializations={specializationOptions}
            papers={paperOptions}
            subjects={subjects.map((item) => ({ id: item.id, paperId: item.paper_id, name: item.name }))}
            sections={sections.filter((s) => s.is_active !== false).map((s) => ({ id: s.id, subjectId: s.subject_id, name: s.name, slug: s.slug }))}
            existingSeries={tests
              .filter((test) => !test.superseded_by_mock_test_id)
              .map((test) => ({
                paperId: test.paper_id,
                subjectId: test.subject_id,
                subjectSectionId: test.subject_section_id,
                scope: test.test_scope as "paper" | "subject",
                seriesNumber: Number(test.series_number ?? 1),
              }))}
          />
        </div>
      </section>
  </main>;
}
