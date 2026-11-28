import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseMockTestTitle } from "@/lib/exam-catalog";
import { resolveStudentDisplayInfo } from "@/lib/student-name";
import {
  ResultsSubmissionsClient,
  type AttemptRowItem,
  type MockTestOption,
  type ScoreBand,
} from "./ResultsSubmissionsClient";

type Attempt = {
  id: string;
  user_id: string;
  mock_test_id: string;
  submitted_at: string;
  score: number;
  total_marks: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered_questions: number;
};

type AttemptSummary = {
  completed_attempts: number;
  participants: number;
  average_score: number;
  average_accuracy: number;
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

function parseBand(raw?: string): ScoreBand {
  if (raw === "high" || raw === "moderate" || raw === "low" || raw === "zero") {
    return raw;
  }
  return "all";
}

function matchesBand(attempt: Attempt, band: ScoreBand): boolean {
  if (band === "all") return true;
  const pct = attempt.total_marks > 0 ? Math.round((attempt.score / attempt.total_marks) * 100) : 0;
  if (band === "zero") return attempt.score <= 0 || pct === 0;
  if (band === "high") return pct >= 60;
  if (band === "moderate") return pct >= 35 && pct < 60;
  return attempt.score > 0 && pct > 0 && pct < 35;
}

export default async function AdminResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; test?: string; band?: string }>;
}) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
  const pageSize = 50;
  const searchQuery = String(params.q ?? "").trim().slice(0, 100);
  const selectedTestId = String(params.test ?? "").trim();
  const selectedBand = parseBand(params.band);

  const supabase = await createClient();
  const admin = createAdminClient();

  const [summaryResult, allMockTestsResult] = await Promise.all([
    supabase.rpc("get_admin_attempt_summary"),
    admin.from("mock_tests").select("id, title").order("created_at", { ascending: false }),
  ]);

  const allMockTests = (allMockTestsResult.data ?? []) as { id: string; title: string }[];
  const validSelectedTestId = allMockTests.some((t) => t.id === selectedTestId) ? selectedTestId : "";

  const mockTestOptions: MockTestOption[] = allMockTests.map((t) => {
    const parsed = parseMockTestTitle(t.title);
    return {
      id: t.id,
      label: parsed.testLabel ? `${parsed.primaryTitle} (${parsed.testLabel})` : parsed.primaryTitle,
    };
  });
  const mockTestTitleMap = new Map(allMockTests.map((t) => [t.id, t.title]));

  // Resolve optional search query across profiles (name/phone) and mock tests (title)
  let matchingUserIds: string[] | null = null;
  let matchingTestIds: string[] | null = null;
  let searchImpossible = false;

  if (searchQuery.length >= 2) {
    const escaped = searchQuery.replace(/[%_]/g, "\\$&");
    const [nameProfilesRes, phoneProfilesRes] = await Promise.all([
      admin.from("profiles").select("id").ilike("full_name", `%${escaped}%`).limit(200),
      admin.from("profiles").select("id").ilike("phone", `%${escaped}%`).limit(200),
    ]);

    const userSet = new Set<string>();
    for (const p of (nameProfilesRes.data ?? []) as { id: string }[]) userSet.add(p.id);
    for (const p of (phoneProfilesRes.data ?? []) as { id: string }[]) userSet.add(p.id);
    matchingUserIds = [...userSet];

    const lowerQuery = searchQuery.toLowerCase();
    matchingTestIds = allMockTests
      .filter((t) => t.title.toLowerCase().includes(lowerQuery))
      .map((t) => t.id);

    if (matchingUserIds.length === 0 && matchingTestIds.length === 0) {
      searchImpossible = true;
    }
  }

  let attempts: Attempt[] = [];
  let totalMatchedCount = 0;
  let attemptsError: unknown = null;

  if (!searchImpossible) {
    let queryBuilder = admin
      .from("test_attempts")
      .select(
        "id, user_id, mock_test_id, submitted_at, score, total_marks, correct_answers, incorrect_answers, unanswered_questions",
        { count: "exact" },
      )
      .order("submitted_at", { ascending: false });

    if (validSelectedTestId) {
      queryBuilder = queryBuilder.eq("mock_test_id", validSelectedTestId);
    }

    if (matchingUserIds && matchingTestIds) {
      if (matchingUserIds.length > 0 && matchingTestIds.length > 0) {
        queryBuilder = queryBuilder.or(
          `user_id.in.(${matchingUserIds.join(",")}),mock_test_id.in.(${matchingTestIds.join(",")})`,
        );
      } else if (matchingUserIds.length > 0) {
        queryBuilder = queryBuilder.in("user_id", matchingUserIds);
      } else if (matchingTestIds.length > 0) {
        queryBuilder = queryBuilder.in("mock_test_id", matchingTestIds);
      }
    }

    if (selectedBand === "zero") {
      queryBuilder = queryBuilder.lte("score", 0);
    }

    if (selectedBand === "high" || selectedBand === "moderate" || selectedBand === "low") {
      // Score bands are derived from score/total_marks; filter over recent 500 matching rows
      const bandRes = await queryBuilder.limit(500);
      attemptsError = bandRes.error;
      const filteredRows = ((bandRes.data ?? []) as Attempt[]).filter((a) =>
        matchesBand(a, selectedBand),
      );
      totalMatchedCount = filteredRows.length;
      attempts = filteredRows.slice((page - 1) * pageSize, page * pageSize);
    } else {
      const pagedRes = await queryBuilder.range((page - 1) * pageSize, page * pageSize - 1);
      attemptsError = pagedRes.error;
      attempts = (pagedRes.data ?? []) as Attempt[];
      totalMatchedCount = pagedRes.count ?? attempts.length;
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalMatchedCount / pageSize));
  if (!attemptsError && page > totalPages) {
    const nextParams = new URLSearchParams();
    if (searchQuery) nextParams.set("q", searchQuery);
    if (validSelectedTestId) nextParams.set("test", validSelectedTestId);
    if (selectedBand !== "all") nextParams.set("band", selectedBand);
    if (totalPages > 1) nextParams.set("page", String(totalPages));
    const qs = nextParams.toString();
    redirect(qs ? `/admin/results?${qs}` : "/admin/results");
  }

  const userIds = [...new Set(attempts.map((a) => a.user_id))];

  type ProfileSummary = { id: string; full_name: string | null; phone: string | null };
  const [{ data: visibleProfiles }, emailResult] = await Promise.all([
    userIds.length > 0
      ? admin.from("profiles").select("id, full_name, phone").in("id", userIds)
      : Promise.resolve({ data: [] as ProfileSummary[] }),
    userIds.length > 0
      ? (admin.rpc as unknown as (fn: string, args: { requested_user_ids: string[] }) => Promise<{ data: { user_id: string; email: string }[] | null }>)("get_admin_user_emails", { requested_user_ids: userIds })
      : Promise.resolve({ data: [] as { user_id: string; email: string }[] }),
  ]);

  const profilesList = (visibleProfiles ?? []) as ProfileSummary[];
  const phones = new Map(profilesList.map((item) => [item.id, item.phone?.trim() || ""]));
  const emails = new Map(
    ((emailResult.data ?? []) as { user_id: string; email: string }[]).map((item) => [
      item.user_id,
      item.email ?? "",
    ]),
  );
  const names = new Map(
    profilesList.map((item) => [
      item.id,
      resolveStudentDisplayInfo({
        fullName: item.full_name,
        email: emails.get(item.id),
      }).displayName,
    ]),
  );
  for (const userId of userIds) {
    if (!names.has(userId)) {
      names.set(userId, resolveStudentDisplayInfo({ email: emails.get(userId) }).displayName);
    }
  }

  let summary: AttemptSummary;
  if (summaryResult.data?.[0]) {
    summary = summaryResult.data[0] as AttemptSummary;
  } else {
    const avgScore =
      attempts.length > 0
        ? attempts.reduce(
            (acc, a) => acc + (a.total_marks > 0 ? (a.score / a.total_marks) * 100 : 0),
            0,
          ) / attempts.length
        : 0;
    const avgAccuracy =
      attempts.length > 0
        ? attempts.reduce((acc, a) => {
            const answered = a.correct_answers + a.incorrect_answers;
            return acc + (answered > 0 ? (a.correct_answers / answered) * 100 : 0);
          }, 0) / attempts.length
        : 0;
    summary = {
      completed_attempts: totalMatchedCount,
      participants: userIds.length,
      average_score: avgScore,
      average_accuracy: avgAccuracy,
    };
  }

  const formattedAttempts: AttemptRowItem[] = attempts.map((attempt) => {
    const studentName = names.get(attempt.user_id) ?? "Student";
    const studentEmail = emails.get(attempt.user_id) || "";
    const studentPhone = phones.get(attempt.user_id) || "";
    const studentContact = studentEmail || studentPhone || "No contact";
    const rawTestTitle = mockTestTitleMap.get(attempt.mock_test_id) ?? "Mock Test";
    const parsed = parseMockTestTitle(rawTestTitle);
    const totalMarks = Number(attempt.total_marks);
    const score = Number(attempt.score);
    const scorePercent = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const answeredCount = attempt.correct_answers + attempt.incorrect_answers;
    const accuracyPercent =
      answeredCount > 0 ? Math.round((attempt.correct_answers / answeredCount) * 100) : null;

    return {
      id: attempt.id,
      userId: attempt.user_id,
      studentName,
      studentContact,
      studentEmail,
      studentPhone,
      mockTestId: attempt.mock_test_id,
      primaryTitle: parsed.primaryTitle,
      testLabel: parsed.testLabel,
      breadcrumb: parsed.breadcrumb,
      score,
      totalMarks,
      scorePercent,
      accuracyPercent,
      correctAnswers: attempt.correct_answers,
      incorrectAnswers: attempt.incorrect_answers,
      unansweredQuestions: attempt.unanswered_questions,
      submittedAt: attempt.submitted_at,
      submittedAtFormatted: dateFormatter.format(new Date(attempt.submitted_at)),
      submittedAtMs: new Date(attempt.submitted_at).getTime(),
    };
  });

  if (attemptsError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-800">
        Unable to load candidate attempt results right now. Please refresh the page.
      </div>
    );
  }

  return (
    <div role="region" aria-label="Results and submissions workspace">
      <ResultsSubmissionsClient
        attempts={formattedAttempts}
        summary={{
          completedAttempts: Number(summary.completed_attempts),
          participants: Number(summary.participants),
          averageScore: Number(summary.average_score),
          averageAccuracy: Number(summary.average_accuracy),
        }}
        totalMatchedCount={totalMatchedCount}
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        mockTestOptions={mockTestOptions}
        initialSearch={searchQuery}
        initialTestId={validSelectedTestId}
        initialBand={selectedBand}
      />
    </div>
  );
}
