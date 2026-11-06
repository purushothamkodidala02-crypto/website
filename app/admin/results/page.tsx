import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

type AttemptSummary = { completed_attempts: number; participants: number; average_score: number; average_accuracy: number };

export default async function AdminResultsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
  const pageSize = 50;
  const supabase = await createClient();
  const admin = createAdminClient();
  
  const [attemptsResult, summaryResult] = await Promise.all([
    admin
      .from("test_attempts")
      .select("id, user_id, mock_test_id, submitted_at, score, total_marks, correct_answers, incorrect_answers, unanswered_questions", { count: "exact" })
      .order("submitted_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1),
    supabase.rpc("get_admin_attempt_summary"),
  ]);

  const attempts = (attemptsResult.data ?? []) as Attempt[];
  const userIds = [...new Set(attempts.map((a) => a.user_id))];
  const mockTestIds = [...new Set(attempts.map((a) => a.mock_test_id))];
  
  type ProfileSummary = { id: string; full_name: string | null; phone: string | null };

  const [{ data: visibleProfiles }, emailResult, mockTestsResult] = await Promise.all([
    userIds.length > 0
      ? admin.from("profiles").select("id, full_name, phone").in("id", userIds)
      : Promise.resolve({ data: [] as ProfileSummary[] }),
    userIds.length > 0
      ? admin.rpc("get_admin_user_emails", { requested_user_ids: userIds })
      : Promise.resolve({ data: [] as { user_id: string; email: string }[] }),
    mockTestIds.length > 0
      ? admin.from("mock_tests").select("id, title").in("id", mockTestIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);

  const profilesList = (visibleProfiles ?? []) as ProfileSummary[];
  const names = new Map(profilesList.map((item) => [item.id, item.full_name?.trim() || "Student"]));
  const phones = new Map(profilesList.map((item) => [item.id, item.phone?.trim() || ""]));
  const emails = new Map(((emailResult.data ?? []) as { user_id: string; email: string }[]).map((item) => [item.user_id, item.email ?? ""]));

  const mockTestTitles = new Map(
    (mockTestsResult.data ?? []).map((mockTest) => [mockTest.id, mockTest.title])
  );

  let summary: AttemptSummary;
  if (summaryResult.data?.[0]) {
    summary = summaryResult.data[0] as AttemptSummary;
  } else {
    const totalCount = attemptsResult.count ?? attempts.length;
    const avgScore = attempts.length > 0
      ? attempts.reduce((acc, a) => acc + (a.total_marks > 0 ? (a.score / a.total_marks) * 100 : 0), 0) / attempts.length
      : 0;
    const avgAccuracy = attempts.length > 0
      ? attempts.reduce((acc, a) => {
          const answered = a.correct_answers + a.incorrect_answers;
          return acc + (answered > 0 ? (a.correct_answers / answered) * 100 : 0);
        }, 0) / attempts.length
      : 0;
    summary = {
      completed_attempts: totalCount,
      participants: userIds.length,
      average_score: avgScore,
      average_accuracy: avgAccuracy,
    };
  }

  const totalPages = Math.max(1, Math.ceil((attemptsResult.count ?? 0) / pageSize));
  
  if (!attemptsResult.error && page > totalPages) {
    redirect(totalPages === 1 ? "/admin/results" : `/admin/results?page=${totalPages}`);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-600" />
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-800">
              Candidate Analytics
            </p>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Results & Submissions
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Monitor completed student test attempts, score distribution, accuracy metrics, and evaluation summaries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/mock-tests"
            prefetch={true}
            className="rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-teal-900 shadow-2xs hover:bg-teal-50 hover:border-teal-300 transition"
          >
            Review Mock Tests
          </Link>
        </div>
      </div>

      {attemptsResult.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-800">
          Unable to load candidate attempt results right now. Please refresh the page.
        </div>
      ) : (
        <>
          {/* KPI Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Attempts</p>
                <span className="grid h-8 w-8 place-items-center rounded-xl border border-teal-100 bg-teal-50 text-teal-800">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </span>
              </div>
              <p className="mt-4 text-3xl font-black text-slate-950">{Number(summary.completed_attempts).toLocaleString("en-IN")}</p>
              <p className="mt-1 text-xs text-slate-400">Total submitted tests</p>
            </div>

            <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Participants</p>
                <span className="grid h-8 w-8 place-items-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-800">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="9" cy="8" r="3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 20v-2.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V20" />
                  </svg>
                </span>
              </div>
              <p className="mt-4 text-3xl font-black text-slate-950">{Number(summary.participants).toLocaleString("en-IN")}</p>
              <p className="mt-1 text-xs text-slate-400">Unique candidate test-takers</p>
            </div>

            <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Score</p>
                <span className="grid h-8 w-8 place-items-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                </span>
              </div>
              <p className="mt-4 text-3xl font-black text-slate-950">{Number(summary.average_score).toFixed(1)}%</p>
              <p className="mt-1 text-xs text-slate-400">Mean marks percentage</p>
            </div>

            <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Accuracy</p>
                <span className="grid h-8 w-8 place-items-center rounded-xl border border-amber-100 bg-amber-50 text-amber-800">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </span>
              </div>
              <p className="mt-4 text-3xl font-black text-slate-950">{Number(summary.average_accuracy).toFixed(1)}%</p>
              <p className="mt-1 text-xs text-slate-400">Correct answers / attempted</p>
            </div>
          </div>

          {/* Attempts Table */}
          {attempts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-teal-200 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-800">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="mt-3 text-base font-bold text-slate-900">No completed submissions recorded</h2>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Candidate test submissions and score reports will populate automatically when students take published mock tests.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-xs">
              <div className="flex items-center justify-between gap-4 border-b border-teal-100 bg-slate-50/60 px-6 py-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Latest Attempt Logs
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  Showing {attempts.length} recent attempts
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-teal-100/80 bg-teal-50/30 text-xs font-black uppercase tracking-wider text-teal-900">
                    <tr>
                      <th className="px-6 py-3.5">Candidate</th>
                      <th className="px-6 py-3.5">Mock Test</th>
                      <th className="px-6 py-3.5">Score / Marks</th>
                      <th className="px-6 py-3.5">Correct</th>
                      <th className="px-6 py-3.5">Unanswered</th>
                      <th className="px-6 py-3.5">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-teal-50">
                    {attempts.map((attempt) => {
                      const studentName = names.get(attempt.user_id) ?? "Student";
                      const studentContact = emails.get(attempt.user_id) || phones.get(attempt.user_id) || "No contact";
                      const percent = attempt.total_marks > 0 ? Math.round((attempt.score / attempt.total_marks) * 100) : 0;
                      const initial = studentName[0]?.toUpperCase() ?? "S";

                      return (
                        <tr key={attempt.id} className="transition hover:bg-teal-50/30">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-teal-100 text-xs font-black text-teal-800">
                                {initial}
                              </span>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{studentName}</p>
                                <p className="text-xs text-slate-400 truncate">{studentContact}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 font-semibold text-slate-800">
                            {mockTestTitles.get(attempt.mock_test_id) ?? "Mock Test"}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-950">
                                {attempt.score} / {attempt.total_marks}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                  percent >= 60
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : percent >= 35
                                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                                      : "bg-rose-50 text-rose-800 border border-rose-200"
                                }`}
                              >
                                {percent}%
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 font-bold text-emerald-700">
                            {attempt.correct_answers}
                          </td>

                          <td className="px-6 py-4 text-slate-400 font-medium">
                            {attempt.unanswered_questions}
                          </td>

                          <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                            {new Intl.DateTimeFormat("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                              timeZone: "Asia/Kolkata",
                            }).format(new Date(attempt.submitted_at))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <nav className="flex items-center justify-between border-t border-teal-100 bg-slate-50/50 px-6 py-3.5">
                  <Link
                    href={page > 2 ? `/admin/results?page=${page - 1}` : "/admin/results"}
                    aria-disabled={page === 1}
                    className={`rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 ${
                      page === 1 ? "pointer-events-none opacity-40" : ""
                    }`}
                  >
                    &larr; Previous
                  </Link>

                  <span className="text-xs font-semibold text-slate-500">
                    Page {page} of {totalPages}
                  </span>

                  <Link
                    href={`/admin/results?page=${Math.min(totalPages, page + 1)}`}
                    aria-disabled={page === totalPages}
                    className={`rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 ${
                      page === totalPages ? "pointer-events-none opacity-40" : ""
                    }`}
                  >
                    Next &rarr;
                  </Link>
                </nav>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
