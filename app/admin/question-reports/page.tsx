import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReportAdminForm } from "./ReportAdminForm";

type ReportRow = {
  id: string;
  user_id: string;
  question_id: string;
  attempt_id: string | null;
  mock_test_id?: string | null;
  category: string;
  details: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  questions: { question_text: string; subjects: { name: string } | null } | null;
};

type MockAssignment = {
  mockTestId: string;
  mockTestTitle: string;
  mockTestStatus: string;
  questionOrder: number;
};

const categoryLabels: Record<string, string> = {
  wrong_answer: "Answer appears incorrect",
  unclear_wording: "Unclear wording",
  translation: "Translation issue",
  broken_image: "Broken image",
  duplicate: "Duplicate question",
  other: "Other problem",
};
const statusStyles: Record<string, string> = {
  open: "bg-red-100 text-red-800",
  reviewing: "bg-amber-100 text-amber-900",
  resolved: "bg-emerald-100 text-emerald-800",
  dismissed: "bg-slate-200 text-slate-700",
};
const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export default async function AdminQuestionReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string }>;
}) {
  const query = await searchParams;
  const admin = createAdminClient();

  let request = admin
    .from("question_reports")
    .select("id, user_id, question_id, attempt_id, mock_test_id, category, details, status, admin_notes, created_at, questions(question_text, subjects(name))")
    .order("created_at", { ascending: false })
    .limit(100);

  if (["open", "reviewing", "resolved", "dismissed"].includes(query.status ?? "")) {
    request = request.eq("status", query.status!);
  }
  if (Object.hasOwn(categoryLabels, query.category ?? "")) {
    request = request.eq("category", query.category!);
  }

  const initialResult = await request;
  let data = initialResult.data as unknown[] | null;
  let error = initialResult.error;

  // Fallback if mock_test_id column is not yet migrated in database
  if (error && (error.message?.includes("mock_test_id") || error.code === "PGRST204" || error.code === "42703")) {
    let fallbackRequest = admin
      .from("question_reports")
      .select("id, user_id, question_id, attempt_id, category, details, status, admin_notes, created_at, questions(question_text, subjects(name))")
      .order("created_at", { ascending: false })
      .limit(100);

    if (["open", "reviewing", "resolved", "dismissed"].includes(query.status ?? "")) {
      fallbackRequest = fallbackRequest.eq("status", query.status!);
    }
    if (Object.hasOwn(categoryLabels, query.category ?? "")) {
      fallbackRequest = fallbackRequest.eq("category", query.category!);
    }
    const fallback = await fallbackRequest;
    data = fallback.data as unknown[] | null;
    error = fallback.error;
  }

  const reports = (data ?? []) as unknown as ReportRow[];
  const userIds = [...new Set(reports.map((report) => report.user_id))];
  const questionIds = [...new Set(reports.map((report) => report.question_id))];
  const attemptIds = [...new Set(reports.map((report) => report.attempt_id).filter(Boolean))] as string[];
  const directMockTestIds = [...new Set(reports.map((report) => report.mock_test_id).filter(Boolean))] as string[];

  type MockTestSummary = { id: string; title: string | null; status: string | null };
  type RawAssignment = {
    mock_test_id: string;
    question_id: string;
    question_order: number;
    mock_tests: MockTestSummary | MockTestSummary[] | null;
  };
  type RawAttempt = {
    id: string;
    mock_test_id: string;
    mock_tests: MockTestSummary | MockTestSummary[] | null;
  };
  type RawMock = {
    id: string;
    title: string | null;
    status: string | null;
  };

  const [profilesResult, assignmentsResult, attemptsResult, extraMocksResult] = await Promise.all([
    userIds.length
      ? admin.from("profiles").select("id, full_name").in("id", userIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
    questionIds.length
      ? admin
          .from("mock_test_questions")
          .select("mock_test_id, question_id, question_order, mock_tests(id, title, status)")
          .in("question_id", questionIds)
          .order("question_order", { ascending: true })
      : Promise.resolve({ data: [] as RawAssignment[] }),
    attemptIds.length
      ? admin
          .from("test_attempts")
          .select("id, mock_test_id, mock_tests(id, title, status)")
          .in("id", attemptIds)
      : Promise.resolve({ data: [] as RawAttempt[] }),
    directMockTestIds.length
      ? admin
          .from("mock_tests")
          .select("id, title, status")
          .in("id", directMockTestIds)
      : Promise.resolve({ data: [] as RawMock[] }),
  ]);

  const studentNames = new Map(
    (profilesResult.data ?? []).map((profile) => [profile.id, profile.full_name?.trim() || "Student"]),
  );

  const assignmentsByQuestion = new Map<string, MockAssignment[]>();
  for (const row of assignmentsResult.data ?? []) {
    const list = assignmentsByQuestion.get(row.question_id) ?? [];
    const mockTest = Array.isArray(row.mock_tests) ? row.mock_tests[0] : row.mock_tests;
    list.push({
      mockTestId: row.mock_test_id,
      mockTestTitle: mockTest?.title ?? "Mock test",
      mockTestStatus: mockTest?.status ?? "draft",
      questionOrder: row.question_order,
    });
    assignmentsByQuestion.set(row.question_id, list);
  }

  const attemptMockMap = new Map<string, { mockTestId: string; mockTestTitle: string; mockTestStatus: string }>();
  for (const row of attemptsResult.data ?? []) {
    const mockTest = Array.isArray(row.mock_tests) ? row.mock_tests[0] : row.mock_tests;
    if (row.id && row.mock_test_id) {
      attemptMockMap.set(row.id, {
        mockTestId: row.mock_test_id,
        mockTestTitle: mockTest?.title ?? "Mock test",
        mockTestStatus: mockTest?.status ?? "draft",
      });
    }
  }

  const directMockMap = new Map<string, { mockTestId: string; mockTestTitle: string; mockTestStatus: string }>();
  for (const row of extraMocksResult.data ?? []) {
    if (row.id) {
      directMockMap.set(row.id, {
        mockTestId: row.id,
        mockTestTitle: row.title ?? "Mock test",
        mockTestStatus: row.status ?? "draft",
      });
    }
  }

  const openCount = reports.filter((report) => report.status === "open").length;

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Content quality</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950">Question reports</h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Review issues reported by students, inspect assigned mock tests and question numbers, correct Question Bank content, and record resolutions.
          </p>
        </div>
        <div className="rounded-2xl bg-red-50 px-5 py-3 text-center">
          <p className="text-2xl font-black text-red-800">{openCount}</p>
          <p className="text-xs font-bold text-red-700">Open in this view</p>
        </div>
      </div>

      <form
        method="get"
        className="mt-7 grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <label className="text-sm font-bold">
          Status
          <select
            name="status"
            defaultValue={query.status ?? ""}
            className="mt-1.5 w-full rounded-xl border px-3 py-2.5 font-normal"
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </label>
        <label className="text-sm font-bold">
          Problem type
          <select
            name="category"
            defaultValue={query.category ?? ""}
            className="mt-1.5 w-full rounded-xl border px-3 py-2.5 font-normal"
          >
            <option value="">All problem types</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-black text-white">Apply filters</button>
      </form>

      {error ? (
        <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 font-semibold text-red-800">
          Question reports could not be loaded. Refresh and try again.
        </p>
      ) : reports.length === 0 ? (
        <section className="mt-6 rounded-3xl border border-dashed bg-white p-10 text-center">
          <h2 className="text-xl font-black">No matching reports</h2>
          <p className="mt-2 text-sm text-slate-600">New student reports will appear here.</p>
        </section>
      ) : (
        <section className="mt-6 grid gap-5">
          {reports.map((report) => {
            const assignments = assignmentsByQuestion.get(report.question_id) ?? [];
            const reportedMock =
              (report.attempt_id ? attemptMockMap.get(report.attempt_id) : null) ||
              (report.mock_test_id ? directMockMap.get(report.mock_test_id) : null);
            const reportedAssignment = reportedMock
              ? assignments.find((a) => a.mockTestId === reportedMock.mockTestId)
              : null;
            const reportedOrder = reportedAssignment ? reportedAssignment.questionOrder : null;

            return (
              <article key={report.id} className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${statusStyles[report.status]}`}>
                        {report.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {categoryLabels[report.category]}
                      </span>
                    </div>

                    <p className="mt-4 text-xs font-black uppercase tracking-wide text-teal-700">
                      {report.questions?.subjects?.name ?? "Question Bank"}
                    </p>
                    <h2 className="mt-2 line-clamp-3 text-lg font-black leading-7 text-slate-950">
                      {report.questions?.question_text ?? "Question content unavailable"}
                    </h2>

                    <p className="mt-3 text-sm text-slate-600">
                      Reported by {studentNames.get(report.user_id) ?? "Student"} ·{" "}
                      {dateFormatter.format(new Date(report.created_at))}
                    </p>

                    {report.details && (
                      <p className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                        <strong>Student details:</strong> {report.details}
                      </p>
                    )}

                    {/* Where the question is assigned in mock tests and question number */}
                    <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50/50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-black uppercase tracking-wider text-teal-900">
                          Assigned in Mock Tests ({assignments.length})
                        </p>
                        {reportedMock && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            Reported in: <strong>{reportedMock.mockTestTitle}</strong>
                            {reportedOrder ? ` (Question #${reportedOrder})` : ""}
                          </span>
                        )}
                      </div>

                      {assignments.length === 0 ? (
                        <p className="mt-2 text-xs font-medium text-slate-500">
                          This question is not assigned to any mock test yet (available only in Question Bank).
                        </p>
                      ) : (
                        <div className="mt-2.5 grid gap-2">
                          {assignments.map((assignment) => {
                            const isReportSource = reportedMock?.mockTestId === assignment.mockTestId;
                            return (
                              <div
                                key={assignment.mockTestId}
                                className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-2.5 text-xs transition ${
                                  isReportSource
                                    ? "border-amber-300 bg-amber-50/80 text-amber-950"
                                    : "border-slate-200 bg-white text-slate-800"
                                }`}
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="inline-grid min-w-14 place-items-center rounded-lg bg-teal-700 px-2.5 py-1 text-xs font-black text-white">
                                    Question #{assignment.questionOrder}
                                  </span>
                                  <span className="font-bold text-slate-950">
                                    {assignment.mockTestTitle}
                                  </span>
                                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                    {assignment.mockTestStatus}
                                  </span>
                                  {isReportSource && (
                                    <span className="rounded-md bg-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-900 uppercase">
                                      Reported in this mock
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2.5">
                                  <Link
                                    href={`/admin/mock-tests/${assignment.mockTestId}/questions/${report.question_id}/edit`}
                                    className="font-bold text-teal-700 hover:text-teal-900 hover:underline"
                                  >
                                    Edit in mock →
                                  </Link>
                                  <Link
                                    href={`/admin/mock-tests/${assignment.mockTestId}/questions`}
                                    className="text-slate-500 hover:text-slate-800 hover:underline"
                                  >
                                    All questions
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/admin/questions/${report.question_id}/edit`}
                    className="shrink-0 rounded-xl bg-teal-700 px-4 py-3 text-sm font-black text-white"
                  >
                    Open question
                  </Link>
                </div>

                <ReportAdminForm reportId={report.id} status={report.status} notes={report.admin_notes} />
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
