import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReportAdminForm } from "./ReportAdminForm";
import { QuestionPreviewDrawer } from "./QuestionPreviewDrawer";
import { ExportReportsButton, type ExportReportRow } from "./ExportReportsButton";
import { QuestionReportsFilterBar } from "./QuestionReportsFilterBar";
import { FormattedQuestionText } from "@/components/questions/FormattedQuestionText";

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
  resolved_at?: string | null;
  resolved_by?: string | null;
  created_at: string;
  questions: {
    id: string;
    question_text: string;
    option_a?: string | null;
    option_b?: string | null;
    option_c?: string | null;
    option_d?: string | null;
    correct_answer?: string | null;
    explanation?: string | null;
    image_url?: string | null;
    difficulty?: string | null;
    subjects: { name: string } | null;
  } | null;
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

const categoryBadges: Record<string, { label: string; badge: string; icon?: string }> = {
  wrong_answer: { label: "Answer appears incorrect", badge: "border border-rose-200/80 bg-rose-50/60 text-rose-800" },
  unclear_wording: { label: "Unclear wording", badge: "border border-amber-200/80 bg-amber-50/60 text-amber-800" },
  translation: { label: "Translation issue", badge: "border border-sky-200/80 bg-sky-50/60 text-sky-800" },
  broken_image: { label: "Broken image", badge: "border border-violet-200/80 bg-violet-50/60 text-violet-800" },
  duplicate: { label: "Duplicate question", badge: "border border-slate-200/80 bg-slate-50 text-slate-700" },
  other: { label: "Other problem", badge: "border border-slate-200/80 bg-slate-50 text-slate-700" },
};

const statusStyles: Record<string, { badge: string; label: string; dot?: string }> = {
  open: { badge: "border border-rose-200/80 bg-rose-50/60 text-rose-800", label: "Open" },
  reviewing: { badge: "border border-amber-200/80 bg-amber-50/60 text-amber-800", label: "Reviewing" },
  resolved: { badge: "border border-emerald-200/80 bg-emerald-50/60 text-emerald-800", label: "Resolved" },
  dismissed: { badge: "border border-slate-200/80 bg-slate-100/70 text-slate-600", label: "Dismissed" },
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return dateFormatter.format(new Date(isoString));
  } catch {
    return isoString;
  }
}

function getRetentionCutoff(days = 15) {
  const target = new Date();
  target.setDate(target.getDate() - days);
  return {
    cutoffDate: target.toISOString(),
    cutoffMs: target.getTime(),
  };
}

export default async function AdminQuestionReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; q?: string; sort?: string }>;
}) {
  const query = await searchParams;
  const admin = createAdminClient();
  const sortAsc = query.sort === "oldest";

  const { cutoffDate, cutoffMs } = getRetentionCutoff(15);
  const isArchiveView = query.status === "archived";

  // 1. Fetch system-wide status counts for KPIs and Tab Badges in parallel
  const [
    openCountRes,
    reviewingCountRes,
    resolvedRecentRes,
    dismissedRecentRes,
    archivedCountRes,
  ] = await Promise.all([
    admin.from("question_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    admin.from("question_reports").select("id", { count: "exact", head: true }).eq("status", "reviewing"),
    admin
      .from("question_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "resolved")
      .gte("resolved_at", cutoffDate),
    admin
      .from("question_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "dismissed")
      .gte("resolved_at", cutoffDate),
    admin
      .from("question_reports")
      .select("id", { count: "exact", head: true })
      .in("status", ["resolved", "dismissed"])
      .lt("resolved_at", cutoffDate),
  ]);

  const counts = {
    open: openCountRes.count ?? 0,
    reviewing: reviewingCountRes.count ?? 0,
    resolved: resolvedRecentRes.count ?? 0,
    dismissed: dismissedRecentRes.count ?? 0,
    archived: archivedCountRes.count ?? 0,
    total:
      (openCountRes.count ?? 0) +
      (reviewingCountRes.count ?? 0) +
      (resolvedRecentRes.count ?? 0) +
      (dismissedRecentRes.count ?? 0),
  };

  const closedActiveCount = counts.resolved + counts.dismissed;
  const resolutionRate = counts.total > 0 ? Math.round((closedActiveCount / counts.total) * 100) : 100;

  // 2. Build filtered report query (Resolved issues older than 15 days do not appear in active views)
  let request = admin
    .from("question_reports")
    .select(
      "id, user_id, question_id, attempt_id, mock_test_id, category, details, status, admin_notes, created_at, resolved_at, resolved_by, questions(id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, image_url, difficulty, subjects(name))"
    )
    .order("created_at", { ascending: sortAsc })
    .limit(100);

  if (query.status === "open" || query.status === "reviewing") {
    request = request.eq("status", query.status);
  } else if (query.status === "resolved") {
    request = request.eq("status", "resolved").gte("resolved_at", cutoffDate);
  } else if (query.status === "dismissed") {
    request = request.eq("status", "dismissed").gte("resolved_at", cutoffDate);
  } else if (isArchiveView) {
    request = request.in("status", ["resolved", "dismissed"]).lt("resolved_at", cutoffDate);
  } else {
    // Default active queue: open, reviewing, or resolved/dismissed within last 15 days
    request = request.or(`status.in.(open,reviewing),resolved_at.gte.${cutoffDate}`);
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
      .select(
        "id, user_id, question_id, attempt_id, category, details, status, admin_notes, created_at, resolved_at, resolved_by, questions(id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, image_url, difficulty, subjects(name))"
      )
      .order("created_at", { ascending: sortAsc })
      .limit(100);

    if (query.status === "open" || query.status === "reviewing") {
      fallbackRequest = fallbackRequest.eq("status", query.status);
    } else if (query.status === "resolved") {
      fallbackRequest = fallbackRequest.eq("status", "resolved").gte("resolved_at", cutoffDate);
    } else if (query.status === "dismissed") {
      fallbackRequest = fallbackRequest.eq("status", "dismissed").gte("resolved_at", cutoffDate);
    } else if (isArchiveView) {
      fallbackRequest = fallbackRequest.in("status", ["resolved", "dismissed"]).lt("resolved_at", cutoffDate);
    } else {
      fallbackRequest = fallbackRequest.or(`status.in.(open,reviewing),resolved_at.gte.${cutoffDate}`);
    }

    if (Object.hasOwn(categoryLabels, query.category ?? "")) {
      fallbackRequest = fallbackRequest.eq("category", query.category!);
    }
    const fallback = await fallbackRequest;
    data = fallback.data as unknown[] | null;
    error = fallback.error;
  }

  const rawReports = (data ?? []) as unknown as ReportRow[];

  // 3. Resolve student and admin identities, mock assignments, and attempt answers
  const studentUserIds = [...new Set(rawReports.map((report) => report.user_id))];
  const resolverIds = [...new Set(rawReports.map((r) => r.resolved_by).filter(Boolean))] as string[];
  const allUserIds = [...new Set([...studentUserIds, ...resolverIds])];
  const questionIds = [...new Set(rawReports.map((report) => report.question_id))];
  const attemptIds = [...new Set(rawReports.map((report) => report.attempt_id).filter(Boolean))] as string[];
  const directMockTestIds = [...new Set(rawReports.map((report) => report.mock_test_id).filter(Boolean))] as string[];

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
  type RawAttemptAnswer = {
    attempt_id: string;
    question_id: string;
    selected_answer: string;
    is_correct: boolean;
  };

  type ProfileSummary = { id: string; full_name: string | null; phone: string | null };
  type EmailSummary = { user_id: string; email: string };

  const [
    profilesResult,
    assignmentsResult,
    attemptsResult,
    extraMocksResult,
    attemptAnswersResult,
    emailResult,
  ] = await Promise.all([
    allUserIds.length
      ? admin.from("profiles").select("id, full_name, phone").in("id", allUserIds)
      : Promise.resolve({ data: [] as ProfileSummary[], error: null }),
    questionIds.length
      ? admin
          .from("mock_test_questions")
          .select("mock_test_id, question_id, question_order, mock_tests(id, title, status)")
          .in("question_id", questionIds)
          .order("question_order", { ascending: true })
      : Promise.resolve({ data: [] as RawAssignment[], error: null }),
    attemptIds.length
      ? admin
          .from("test_attempts")
          .select("id, mock_test_id, mock_tests(id, title, status)")
          .in("id", attemptIds)
      : Promise.resolve({ data: [] as RawAttempt[], error: null }),
    directMockTestIds.length
      ? admin
          .from("mock_tests")
          .select("id, title, status")
          .in("id", directMockTestIds)
      : Promise.resolve({ data: [] as RawMock[], error: null }),
    attemptIds.length
      ? admin
          .from("attempt_responses")
          .select("attempt_id, question_id, selected_answer, is_correct")
          .in("attempt_id", attemptIds)
      : Promise.resolve({ data: [] as RawAttemptAnswer[], error: null }),
    allUserIds.length
      ? admin.rpc("get_admin_user_emails", { requested_user_ids: allUserIds.slice(0, 200) })
      : Promise.resolve({ data: [] as EmailSummary[], error: null }),
  ]);

  const profileList = (profilesResult.data ?? []) as ProfileSummary[];
  const userNames = new Map<string, string>(
    profileList.map((profile: ProfileSummary) => [profile.id, profile.full_name?.trim() || "Student"]),
  );
  const userPhones = new Map<string, string | null>(
    profileList.map((profile: ProfileSummary) => [profile.id, profile.phone?.trim() || null]),
  );
  const emailList = (emailResult.data ?? []) as EmailSummary[];
  const userEmails = new Map<string, string>();
  for (const row of emailList) {
    if (row.user_id && row.email) {
      userEmails.set(row.user_id, row.email);
    }
  }

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

  const attemptResponsesMap = new Map<string, { selectedAnswer: string; isCorrect: boolean }>();
  for (const row of (attemptAnswersResult.data ?? []) as RawAttemptAnswer[]) {
    attemptResponsesMap.set(`${row.attempt_id}:${row.question_id}`, {
      selectedAnswer: row.selected_answer,
      isCorrect: row.is_correct,
    });
  }

  // 4. Exclude resolved/dismissed reports older than 15 days unless specifically viewing the archive
  const isOlderResolved = (report: ReportRow) => {
    if (report.status !== "resolved" && report.status !== "dismissed") return false;
    const resTime = report.resolved_at
      ? new Date(report.resolved_at).getTime()
      : new Date(report.created_at).getTime();
    return resTime < cutoffMs;
  };

  const activeReports = isArchiveView
    ? rawReports.filter((r) => isOlderResolved(r))
    : rawReports.filter((r) => !isOlderResolved(r));

  // 5. In-memory search filter (if search query "q" provided)
  const searchQuery = String(query.q ?? "").trim().toLowerCase();
  const reports = activeReports.filter((report) => {
    if (!searchQuery) return true;
    const studentName = (userNames.get(report.user_id) ?? "").toLowerCase();
    const studentEmail = (userEmails.get(report.user_id) ?? "").toLowerCase();
    const qText = (report.questions?.question_text ?? "").toLowerCase();
    const notes = (report.admin_notes ?? "").toLowerCase();
    const details = (report.details ?? "").toLowerCase();
    const cat = (categoryLabels[report.category] ?? "").toLowerCase();
    const qid = report.question_id.toLowerCase();
    const rid = report.id.toLowerCase();

    return (
      studentName.includes(searchQuery) ||
      studentEmail.includes(searchQuery) ||
      qText.includes(searchQuery) ||
      notes.includes(searchQuery) ||
      details.includes(searchQuery) ||
      cat.includes(searchQuery) ||
      qid.includes(searchQuery) ||
      rid.includes(searchQuery)
    );
  });

  // 6. Build CSV Export rows
  const exportRows: ExportReportRow[] = reports.map((report) => ({
    id: report.id,
    createdAt: dateFormatter.format(new Date(report.created_at)),
    status: report.status,
    category: report.category,
    categoryLabel: categoryLabels[report.category] ?? report.category,
    subject: report.questions?.subjects?.name ?? "Question Bank",
    questionId: report.question_id,
    questionText: report.questions?.question_text ?? "Content unavailable",
    correctAnswer: report.questions?.correct_answer ?? "",
    studentName: userNames.get(report.user_id) ?? "Student",
    studentEmail: userEmails.get(report.user_id) ?? "",
    studentDetails: report.details ?? "",
    adminNotes: report.admin_notes ?? "",
    resolvedAt: report.resolved_at ? dateFormatter.format(new Date(report.resolved_at)) : "",
    resolvedByName: report.resolved_by ? userNames.get(report.resolved_by) ?? "Admin" : "",
  }));

  const openCountInView = reports.filter((r) => r.status === "open").length;

  return (
    <div className="space-y-6">
      {/* Header section with brand context and top actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-800">Quality assurance & feedback</p>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-950">Question reports</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Review and triage issues reported by students, inspect assigned mock tests and question numbers, verify question content and answer keys, and record resolutions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <ExportReportsButton reports={exportRows} />
          <Link
            href="/admin/questions"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 text-center whitespace-nowrap"
          >
            Question Bank
          </Link>
          <Link
            href="/admin/similarity"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 text-center whitespace-nowrap"
          >
            Similarity scanner
          </Link>
        </div>
      </div>

      {/* KPI Metric summary cards */}
      <section aria-label="Question report metrics" className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {/* Open Reports Card */}
        <Link
          href="/admin/question-reports?status=open"
          className="group rounded-xl border border-rose-200/70 bg-rose-50/30 p-3.5 shadow-2xs transition hover:bg-rose-50/50 min-w-0"
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-xs font-medium text-rose-800/90 truncate">Action Required</p>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <p className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-rose-950">{counts.open}</p>
            <span className="text-xs font-medium text-rose-700/80">open reports</span>
          </div>
          <p className="mt-1 text-[11px] font-medium text-slate-500 line-clamp-1 sm:line-clamp-none">
            {openCountInView} open in current filtered view
          </p>
        </Link>

        {/* Reviewing Card */}
        <Link
          href="/admin/question-reports?status=reviewing"
          className="group rounded-xl border border-amber-200/70 bg-amber-50/30 p-3.5 shadow-2xs transition hover:bg-amber-50/50 min-w-0"
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-xs font-medium text-amber-800/90 truncate">Under Review</p>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <p className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-amber-950">{counts.reviewing}</p>
            <span className="text-xs font-medium text-amber-700/80">in triage</span>
          </div>
          <p className="mt-1 text-[11px] font-medium text-slate-500 line-clamp-1 sm:line-clamp-none">
            Subject matter expert review ongoing
          </p>
        </Link>

        {/* Resolved Card (15-day active retention window) */}
        <Link
          href="/admin/question-reports?status=resolved"
          className="group rounded-xl border border-emerald-200/70 bg-emerald-50/30 p-3.5 shadow-2xs transition hover:bg-emerald-50/50 min-w-0"
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-xs font-medium text-emerald-800/90 truncate">Resolved (≤15d)</p>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <p className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-950">{counts.resolved}</p>
            <span className="text-xs font-medium text-emerald-700/80">last 15 days</span>
          </div>
          <p className="mt-1 text-[11px] font-medium text-slate-500 line-clamp-1 sm:line-clamp-none">
            {counts.archived > 0 ? `${counts.archived} older resolved archived` : "Older resolved auto-archived"}
          </p>
        </Link>

        {/* Total & Resolution Rate */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 shadow-2xs min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className="text-xs font-medium text-slate-500 truncate">Active Queue</p>
            <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700">
              {resolutionRate}% Closed
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <p className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900">{counts.total}</p>
            <span className="text-xs font-medium text-slate-500">active reports</span>
          </div>
          <p className="mt-1 text-[11px] font-medium text-slate-500 line-clamp-1 sm:line-clamp-none">
            {counts.archived > 0 ? `${counts.archived} older resolved archived` : "Resolved clear after 15 days"}
          </p>
        </div>
      </section>

      {/* Interactive Filter Bar */}
      <QuestionReportsFilterBar
        counts={counts}
        categoryLabels={categoryLabels}
        initialCategory={query.category}
        initialStatus={query.status}
        initialSearch={query.q}
        initialSort={query.sort}
      />

      {/* 15-day auto-retention policy info banner */}
      {isArchiveView ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 sm:px-4 text-xs text-amber-950">
          <div className="flex items-start sm:items-center gap-2 min-w-0">
            <span className="break-words">
              <strong>Archive View:</strong> Showing resolved issues older than 15 days. These are automatically hidden from the active triage queue.
            </span>
          </div>
          <Link
            href="/admin/question-reports"
            className="inline-flex items-center gap-1 font-semibold text-amber-900 hover:underline shrink-0 text-xs pl-7 sm:pl-0"
          >
            ← Back to active queue
          </Link>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:px-4 text-xs text-slate-700">
          <div className="flex items-start sm:items-center gap-2 min-w-0">
            <span className="break-words">
              <strong>15-day retention policy:</strong> Resolved and dismissed issues automatically clear and stop appearing after 15 days.
            </span>
          </div>
          {counts.archived > 0 && (
            <Link
              href="/admin/question-reports?status=archived"
              className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-950 hover:underline shrink-0 text-xs pl-7 sm:pl-0"
            >
              <span>View archived ({counts.archived})</span>
              <span>→</span>
            </Link>
          )}
        </div>
      )}

      {/* Report results list */}
      {error ? (
        <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 font-semibold text-red-800">
          <p className="font-black">Question reports could not be loaded.</p>
          <p className="mt-1 text-xs opacity-90">Please refresh this page or try again in a few moments.</p>
        </div>
      ) : reports.length === 0 ? (
        <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-600">
            📋
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-950">
            {isArchiveView ? "No archived reports" : "No matching reports"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isArchiveView
              ? "No resolved question reports older than 15 days were found."
              : query.status || query.category || query.q
                ? "No active reports match your selected filters. (Resolved issues older than 15 days are automatically archived)."
                : "All student question reports in the active 15-day window have been addressed. New reports will appear here."}
          </p>
          {(query.status || query.category || query.q) && (
            <div className="mt-5">
              <Link
                href="/admin/question-reports"
                className="inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white hover:bg-teal-700"
              >
                Clear all filters
              </Link>
            </div>
          )}
        </section>
      ) : (
        <section className="mt-6 grid gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs font-semibold text-slate-500">
            <span className="break-words">
              Showing <strong>{reports.length}</strong> {reports.length === 1 ? "report" : "reports"}
              {query.status ? ` with status '${query.status}'` : ""}
              {query.category ? ` for '${categoryLabels[query.category]}'` : ""}
            </span>
            <span className="shrink-0">Sorted by {sortAsc ? "oldest first" : "most recent"}</span>
          </div>

          {reports.map((report) => {
            const assignments = assignmentsByQuestion.get(report.question_id) ?? [];
            const reportedMock =
              (report.attempt_id ? attemptMockMap.get(report.attempt_id) : null) ||
              (report.mock_test_id ? directMockMap.get(report.mock_test_id) : null);
            const reportedAssignment = reportedMock
              ? assignments.find((a) => a.mockTestId === reportedMock.mockTestId)
              : null;
            const reportedOrder = reportedAssignment ? reportedAssignment.questionOrder : null;

            const studentName = userNames.get(report.user_id) ?? "Student";
            const studentEmail = userEmails.get(report.user_id);
            const studentPhone = userPhones.get(report.user_id);
            const resolverName = report.resolved_by ? userNames.get(report.resolved_by) ?? "Admin" : null;

            const categoryInfo = categoryBadges[report.category] ?? {
              label: categoryLabels[report.category] ?? report.category,
              badge: "bg-slate-100 text-slate-800 border-slate-200",
              icon: "📌",
            };
            const currentStatusStyle = statusStyles[report.status] ?? statusStyles.open;

            const studentAttemptAnswer = report.attempt_id
              ? attemptResponsesMap.get(`${report.attempt_id}:${report.question_id}`)
              : null;

            return (
              <article
                key={report.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-2xs transition hover:border-slate-300"
              >
                {/* Top card bar: Badges, subject, and Open question action */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ${currentStatusStyle.badge}`}
                    >
                      {report.status}
                    </span>

                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${categoryInfo.badge}`}
                    >
                      <span className="break-words">{categoryInfo.label}</span>
                    </span>

                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 max-w-full truncate">
                      {report.questions?.subjects?.name ?? "Question Bank"}
                    </span>
                  </div>

                  {/* Primary question edit action button */}
                  <Link
                    href={`/admin/questions/${report.question_id}/edit`}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs transition w-full sm:w-auto shrink-0 text-center"
                  >
                    Open question →
                  </Link>
                </div>

                {/* Main card body with full width available */}
                <div className="mt-3.5 w-full min-w-0">
                  {/* Question text headline */}
                  <div className="break-words [overflow-wrap:anywhere]">
                    {report.questions?.question_text ? (
                      <div className="text-sm sm:text-base leading-relaxed text-slate-950 font-medium">
                        <FormattedQuestionText text={report.questions.question_text} />
                      </div>
                    ) : (
                      <h2 className="text-sm sm:text-base font-bold leading-relaxed text-slate-500 italic">
                        Question content unavailable
                      </h2>
                    )}
                  </div>

                  {/* Reporter metadata */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 min-w-0">
                    <span className="font-semibold text-slate-700">
                      Reported by <strong>{studentName}</strong>
                    </span>
                    {studentEmail && (
                      <span className="break-all text-slate-500">
                        <span className="text-slate-300 mr-1 sm:mr-2">·</span>
                        {studentEmail}
                      </span>
                    )}
                    {studentPhone && (
                      <span className="text-slate-500 whitespace-nowrap">
                        <span className="text-slate-300 mr-1 sm:mr-2">·</span>
                        {studentPhone}
                      </span>
                    )}
                    <span className="text-slate-500" title={dateFormatter.format(new Date(report.created_at))}>
                      <span className="text-slate-300 mr-1 sm:mr-2">·</span>
                      {formatRelativeTime(report.created_at)}
                      <span className="hidden sm:inline"> ({dateFormatter.format(new Date(report.created_at))})</span>
                    </span>
                  </div>

                  {/* Student problem details */}
                  {report.details && (
                    <div className="mt-3.5 rounded-xl border border-amber-200/70 bg-amber-50/40 p-3 sm:p-4 text-xs leading-5 text-amber-950 break-words [overflow-wrap:anywhere]">
                      <p className="font-semibold uppercase tracking-wider text-[11px] text-amber-800">
                        Student Reported Details
                      </p>
                      <p className="mt-1 font-medium whitespace-pre-wrap break-words">{report.details}</p>
                    </div>
                  )}

                  {/* Deep Question content, MCQ options, Correct key & explanation */}
                  {report.questions && (
                    <QuestionPreviewDrawer
                      questionId={report.question_id}
                      reportId={report.id}
                      optionA={report.questions.option_a}
                      optionB={report.questions.option_b}
                      optionC={report.questions.option_c}
                      optionD={report.questions.option_d}
                      correctAnswer={report.questions.correct_answer}
                      explanation={report.questions.explanation}
                      imageUrl={report.questions.image_url}
                      difficulty={report.questions.difficulty}
                      studentAttemptAnswer={studentAttemptAnswer}
                    />
                  )}

                  {/* Where the question is assigned in mock tests and question number */}
                  <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Assigned in Mock Tests ({assignments.length})
                      </p>
                      {reportedMock && (
                        <span className="inline-flex items-center rounded-md border border-amber-200/80 bg-amber-50/70 px-2.5 py-0.5 text-xs font-medium text-amber-900 break-words [overflow-wrap:anywhere]">
                          <span className="break-words">
                            Reported in: <strong>{reportedMock.mockTestTitle}</strong>
                            {reportedOrder ? ` (Question #${reportedOrder})` : ""}
                          </span>
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
                              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 rounded-lg border p-2.5 sm:p-3 text-xs transition ${
                                isReportSource
                                  ? "border-amber-200 bg-amber-50/50 text-amber-950"
                                  : "border-slate-200 bg-white text-slate-800"
                              }`}
                            >
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                                <span className="inline-grid shrink-0 min-w-14 place-items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-bold font-mono text-slate-800">
                                  Question #{assignment.questionOrder}
                                </span>
                                <span className="font-semibold text-slate-900 break-words [overflow-wrap:anywhere] min-w-0">
                                  {assignment.mockTestTitle}
                                </span>
                                <span className="shrink-0 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-600">
                                  {assignment.mockTestStatus}
                                </span>
                                {isReportSource && (
                                  <span className="shrink-0 rounded border border-amber-200 bg-amber-100/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
                                    Reported in this mock
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                                <Link
                                  href={`/admin/mock-tests/${assignment.mockTestId}/questions/${report.question_id}/edit`}
                                  className="font-semibold text-slate-700 hover:text-slate-950 hover:underline"
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

                {/* Resolution & internal notes editor */}
                <ReportAdminForm
                  reportId={report.id}
                  status={report.status}
                  notes={report.admin_notes}
                  resolvedAt={report.resolved_at}
                  resolvedByName={resolverName}
                />
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
