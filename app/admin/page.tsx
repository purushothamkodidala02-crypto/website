import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { indiaDateKey } from "@/lib/date";
import { parseMockTestTitle, studentFacingMockTestTitle } from "@/lib/exam-catalog";
import { buildPaperDisplayMap, type OrderedPaper } from "@/lib/papers";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const today = indiaDateKey();
  const future30Date = new Date();
  future30Date.setDate(future30Date.getDate() + 30);
  const future30Key = indiaDateKey(future30Date);

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  const [
    testsResult,
    attemptsResult,
    reportsResult,
    papersResult,
    groupsResult,
    subjectsResult,
    totalQuestionsCountResult,
    usableQuestionsCountResult,
    expiringSoonCountResult,
  ] = await Promise.all([
    supabase
      .from("mock_tests")
      .select("id, title, status, updated_at, paper_id, subject_id, series_number")
      .order("updated_at", { ascending: false }),
    admin.from("test_attempts").select("id", { count: "exact", head: true }),
    admin.from("question_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("papers").select("id, exam_group_id, specialization_id, name, display_order"),
    supabase.from("exam_groups").select("id, name"),
    supabase.from("subjects").select("id, name"),
    supabase.from("questions").select("id", { count: "exact", head: true }),
    supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .or(`expires_on.is.null,expires_on.gte.${today}`),
    supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("content_lifecycle", "expires")
      .gte("expires_on", today)
      .lte("expires_on", future30Key),
  ]);

  const tests = testsResult.data ?? [];
  const papers = papersResult.data ?? [];
  const paperById = new Map(papers.map((paper) => [paper.id, paper]));
  const groupById = new Map((groupsResult.data ?? []).map((group) => [group.id, group]));
  const subjectById = new Map((subjectsResult.data ?? []).map((subject) => [subject.id, subject]));
  const paperDisplayById = buildPaperDisplayMap(papers as OrderedPaper[]);
  const visibleTestTitle = (test: (typeof tests)[number]) => {
    const paper = paperById.get(test.paper_id);
    const exam = paper ? groupById.get(paper.exam_group_id) : undefined;
    const subject = test.subject_id ? subjectById.get(test.subject_id) : undefined;
    if (!paper || !exam) return test.title;
    return studentFacingMockTestTitle({
      examName: exam.name,
      paperLabel: paperDisplayById.get(paper.id)?.shortLabel ?? paper.name,
      seriesNumber: Number(test.series_number ?? 1),
      subjectName: subject?.name ?? null,
    });
  };

  const drafts = tests.filter((test) => test.status === "draft");
  const published = tests.filter((test) => test.status === "published");
  const hidden = tests.filter((test) => test.status === "archived");

  // Only check assignments for draft tests if any exist (fast scoped check, max 20 recent drafts)
  let draftsNeedingWork = drafts;
  if (drafts.length > 0) {
    const draftIds = drafts.slice(0, 20).map((d) => d.id);
    const { data: draftAssignments } = await supabase
      .from("mock_test_questions")
      .select("mock_test_id, question_id, marks, negative_marks")
      .in("mock_test_id", draftIds);

    const draftQuestionIds = [...new Set((draftAssignments ?? []).map((a) => a.question_id))];
    const { data: usableDraftQuestions } = draftQuestionIds.length > 0
      ? await supabase
          .from("questions")
          .select("id")
          .in("id", draftQuestionIds)
          .eq("is_active", true)
          .or(`expires_on.is.null,expires_on.gte.${today}`)
      : { data: [] };

    const usableDraftQuestionSet = new Set((usableDraftQuestions ?? []).map((q) => q.id));
    const assignmentsByDraft = new Map<string, typeof draftAssignments>();
    for (const a of draftAssignments ?? []) {
      const current = assignmentsByDraft.get(a.mock_test_id) ?? [];
      current.push(a);
      assignmentsByDraft.set(a.mock_test_id, current);
    }

    draftsNeedingWork = drafts.filter((test) => {
      const assignments = assignmentsByDraft.get(test.id) ?? [];
      return (
        assignments.length === 0 ||
        assignments.some(
          (item) =>
            !usableDraftQuestionSet.has(item.question_id) ||
            Number(item.marks) <= 0 ||
            Number(item.negative_marks) < 0,
        )
      );
    });
  }

  const usableQuestionsCount = usableQuestionsCountResult.count ?? 0;
  const expiringSoonCount = expiringSoonCountResult.count ?? 0;
  const openReportsCount = reportsResult.count ?? 0;
  const readyDraftsCount = drafts.length - draftsNeedingWork.length;

  const metrics = [
    {
      label: "Published Tests",
      value: published.length,
      detail: `${tests.length > 0 ? Math.round((published.length / tests.length) * 100) : 0}% of ${tests.length} total tests live`,
      href: "/admin/mock-tests",
      icon: "published" as const,
      color: "emerald" as const,
    },
    {
      label: "Draft Tests",
      value: drafts.length,
      detail: draftsNeedingWork.length > 0 ? `${draftsNeedingWork.length} require questions or marks` : "All drafts ready to review",
      href: "/admin/mock-tests",
      icon: "draft" as const,
      color: "amber" as const,
    },
    {
      label: "Active Question Bank",
      value: usableQuestionsCount,
      detail: `${totalQuestionsCountResult.count ?? 0} total questions registered`,
      href: "/admin/questions",
      icon: "questions" as const,
      color: "teal" as const,
    },
    {
      label: "Completed Submissions",
      value: attemptsResult.count ?? 0,
      detail: "Student attempts submitted & graded",
      href: "/admin/results",
      icon: "attempts" as const,
      color: "indigo" as const,
    },
  ] as const;

  const hasAnyAttentionItem =
    expiringSoonCount > 0 ||
    openReportsCount > 0 ||
    draftsNeedingWork.length > 0 ||
    readyDraftsCount > 0 ||
    hidden.length > 0;

  return (
    <div className="space-y-8">
      {/* ========================================================
          1. EXECUTIVE HERO COMMAND BAR
      ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-200/80 bg-gradient-to-br from-white via-white to-teal-50/40 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-800">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                </span>
                <span>Production Operational</span>
              </span>
              <span className="text-xs font-semibold text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">{formattedDate}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              VaradhiPrep Command Center
            </h1>

            <p className="max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed">
              Real-time administrative control of test publishing, verified question banks, candidate attempts, and exam series access.
            </p>
          </div>

          {/* Quick Operations Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/admin/mock-tests"
              prefetch={true}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm shadow-teal-900/20 transition hover:bg-teal-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Manage Tests</span>
            </Link>

            <Link
              href="/admin/questions#add-one-question"
              prefetch={true}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-teal-900 shadow-2xs transition hover:border-teal-300 hover:bg-teal-50"
            >
              <svg className="h-4 w-4 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add Question</span>
            </Link>

            <Link
              href="/admin/similarity"
              prefetch={true}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-teal-900 shadow-2xs transition hover:border-teal-300 hover:bg-teal-50"
            >
              <svg className="h-4 w-4 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <span className="hidden sm:inline">Similarity</span>
            </Link>

            <Link
              href="/admin/excel-import-guide"
              prefetch={true}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50"
            >
              <span>Excel Guide</span>
              <span className="text-[10px] font-bold text-slate-400">↗</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. CORE KPI METRICS ROW
      ======================================================== */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      {/* ========================================================
          3. OPERATIONS & RECENT TESTS DUAL GRID
      ======================================================== */}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Action Items & Attention Center */}
        <div className="overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-xs">
          <div className="flex items-center justify-between gap-4 border-b border-teal-100 bg-slate-50/60 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-teal-600" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Action Required & Quality Queue
              </h2>
              {hasAnyAttentionItem && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-900 border border-amber-200">
                  Active Tasks
                </span>
              )}
            </div>

            <Link
              href="/admin/question-reports"
              prefetch={true}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 transition"
            >
              Reports Queue &rarr;
            </Link>
          </div>

          <div className="p-6">
            {!hasAnyAttentionItem ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700 border border-teal-100">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">Content Integrity 100% Clear</h3>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  No open candidate reports, expiring questions, or incomplete drafts currently require intervention.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {openReportsCount > 0 && (
                  <AttentionItem
                    count={openReportsCount}
                    title="Student question reports are open"
                    detail="Review reported questions, wording, translations, and answers."
                    tone="rose"
                    href="/admin/question-reports"
                  />
                )}
                {expiringSoonCount > 0 && (
                  <AttentionItem
                    count={expiringSoonCount}
                    title="Questions expiring soon (≤ 30 days)"
                    detail="Review current affairs and expiring questions before they leave mock tests."
                    tone="amber"
                    href="/admin/questions?status=expiring_soon"
                  />
                )}
                {draftsNeedingWork.length > 0 && (
                  <AttentionItem
                    count={draftsNeedingWork.length}
                    title="Draft tests not ready for release"
                    detail="Add usable questions and valid marks before publishing to students."
                    tone="amber"
                    href="/admin/mock-tests"
                  />
                )}
                {readyDraftsCount > 0 && (
                  <AttentionItem
                    count={readyDraftsCount}
                    title="Draft tests ready for review & publication"
                    detail="Preview test flow and publish when final sign-off is complete."
                    tone="emerald"
                    href="/admin/mock-tests"
                  />
                )}
                {hidden.length > 0 && (
                  <AttentionItem
                    count={hidden.length}
                    title="Hidden or archived tests"
                    detail="Results remain preserved; unarchive if candidate access is needed."
                    tone="slate"
                    href="/admin/mock-tests"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Mock Tests Management */}
        <div className="overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-xs">
          <div className="flex items-center justify-between gap-4 border-b border-teal-100 bg-slate-50/60 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-600" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Recent Mock Tests
              </h2>
            </div>
            <Link
              href="/admin/mock-tests"
              prefetch={true}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 transition"
            >
              View All ({tests.length}) &rarr;
            </Link>
          </div>

          {tests.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-500">No mock tests have been created yet.</p>
              <Link
                href="/admin/mock-tests"
                prefetch={true}
                className="mt-3 inline-block rounded-xl border border-teal-600 bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-900/15 hover:bg-teal-800"
              >
                Create your first test
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-teal-50/60">
              {tests.slice(0, 5).map((test) => {
                const rawTitle = visibleTestTitle(test);
                const parsed = parseMockTestTitle(rawTitle);

                return (
                  <div
                    key={test.id}
                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 transition hover:bg-teal-50/40"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-teal-950 leading-snug break-words">
                          {parsed.primaryTitle}
                        </p>
                        {parsed.testLabel && (
                          <span className="rounded-full border border-teal-200/80 bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 shrink-0">
                            {parsed.testLabel}
                          </span>
                        )}
                      </div>
                      {parsed.breadcrumb.length > 0 && (
                        <p className="mt-0.5 text-[11px] font-semibold text-slate-500 leading-snug break-words">
                          {parsed.breadcrumb.join(" · ")}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-slate-400">
                        Updated{" "}
                        {new Intl.DateTimeFormat("en-IN", {
                          dateStyle: "medium",
                          timeZone: "Asia/Kolkata",
                        }).format(new Date(test.updated_at))}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <Status status={test.status as "draft" | "published" | "archived"} />
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/mock-tests/${test.id}/edit`}
                          prefetch={true}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-950 shadow-2xs"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/admin/mock-tests/${test.id}/preview`}
                          prefetch={true}
                          className="rounded-lg border border-teal-200 bg-teal-50/50 px-2.5 py-1 text-xs font-bold text-teal-800 hover:bg-teal-100 shadow-2xs"
                        >
                          Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          4. ESSENTIAL WORKFLOW SHORTCUTS
      ======================================================== */}
      <section className="pt-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-teal-800">
            Administrative Workspaces
          </h3>
          <span className="text-xs text-slate-400">Instant shortcuts</span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <ShortcutCard
            title="Exam Catalogue"
            detail="State, Recruiting Boards & Papers"
            href="/admin/exams"
            icon="catalogue"
          />
          <ShortcutCard
            title="Subjects & Syllabus"
            detail="Section hierarchy & practice tags"
            href="/admin/subjects"
            icon="subjects"
          />
          <ShortcutCard
            title="Registrations & Sales"
            detail="Candidate profiles, revenue & access"
            href="/admin/students"
            icon="students"
          />
          <ShortcutCard
            title="Question Reports"
            detail="Resolution queue for student flags"
            href="/admin/question-reports"
            icon="reports"
            badge={openReportsCount}
          />
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  href,
  icon,
  color,
}: {
  label: string;
  value: number;
  detail: string;
  href: string;
  icon: "published" | "draft" | "questions" | "attempts";
  color: "emerald" | "amber" | "teal" | "indigo";
}) {
  const colorStyles = {
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-100",
    amber: "bg-amber-50 text-amber-800 border-amber-100",
    teal: "bg-teal-50 text-teal-800 border-teal-100",
    indigo: "bg-indigo-50 text-indigo-800 border-indigo-100",
  }[color];

  return (
    <Link
      href={href}
      prefetch={true}
      className="group relative overflow-hidden rounded-2xl border border-teal-100 bg-white p-5 shadow-xs transition hover:border-teal-200 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-teal-950 transition">
          {label}
        </span>
        <span className={`grid h-8 w-8 place-items-center rounded-xl border ${colorStyles}`}>
          {icon === "published" && (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          )}
          {icon === "draft" && (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
          )}
          {icon === "questions" && (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
          )}
          {icon === "attempts" && (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
            </svg>
          )}
        </span>
      </div>

      <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">
        {value.toLocaleString("en-IN")}
      </p>

      <p className="mt-1.5 text-xs font-semibold text-slate-500 leading-normal">{detail}</p>
    </Link>
  );
}

function AttentionItem({
  count,
  title,
  detail,
  tone = "amber",
  href,
}: {
  count: number;
  title: string;
  detail: string;
  tone?: "amber" | "rose" | "emerald" | "slate";
  href: string;
}) {
  const styles = {
    rose: {
      card: "border-rose-200/90 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-300",
      pill: "bg-rose-100 text-rose-900 border border-rose-200",
      arrow: "text-rose-400 group-hover:text-rose-700",
    },
    amber: {
      card: "border-amber-200/90 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-300",
      pill: "bg-amber-100 text-amber-900 border border-amber-200",
      arrow: "text-amber-400 group-hover:text-amber-700",
    },
    emerald: {
      card: "border-emerald-200/90 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300",
      pill: "bg-emerald-100 text-emerald-900 border border-emerald-200",
      arrow: "text-emerald-400 group-hover:text-emerald-700",
    },
    slate: {
      card: "border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 hover:border-slate-300",
      pill: "bg-white text-slate-800 border border-slate-200",
      arrow: "text-slate-400 group-hover:text-slate-700",
    },
  }[tone];

  return (
    <Link
      href={href}
      prefetch={true}
      className={`group flex items-center justify-between gap-4 rounded-2xl border p-4 transition ${styles.card}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black shadow-2xs ${styles.pill}`}
        >
          {count}
        </span>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-950 leading-snug break-words">
            {title}
          </h4>
          <p className="mt-0.5 text-xs text-slate-500 leading-snug break-words">{detail}</p>
        </div>
      </div>
      <span className={`shrink-0 font-bold text-sm transition group-hover:translate-x-0.5 ${styles.arrow}`}>
        &rarr;
      </span>
    </Link>
  );
}

function Status({
  status,
}: {
  status: "draft" | "published" | "archived";
}) {
  const details =
    status === "published"
      ? ["Published", "bg-emerald-50 text-emerald-800 border border-emerald-200 ring-1 ring-emerald-500/20"]
      : status === "archived"
        ? ["Archived", "bg-slate-100 text-slate-700 border border-slate-200"]
        : ["Draft", "bg-amber-50 text-amber-800 border border-amber-200 ring-1 ring-amber-500/20"];

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${details[1]}`}
    >
      {details[0]}
    </span>
  );
}

function ShortcutCard({
  title,
  detail,
  href,
  icon,
  badge,
}: {
  title: string;
  detail: string;
  href: string;
  icon: "catalogue" | "subjects" | "students" | "reports";
  badge?: number;
}) {
  return (
    <Link
      href={href}
      prefetch={true}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-white p-4 shadow-xs transition hover:border-teal-200 hover:shadow-md"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-teal-100 bg-teal-50 text-teal-800 transition group-hover:border-teal-700 group-hover:bg-teal-700 group-hover:text-white">
          {icon === "catalogue" && (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
          )}
          {icon === "subjects" && (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          )}
          {icon === "students" && (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          )}
          {icon === "reports" && (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
          )}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 group-hover:text-teal-950 leading-snug break-words">{title}</p>
          <p className="text-xs text-slate-500 leading-snug break-words">{detail}</p>
        </div>
      </div>
      {typeof badge === "number" && badge > 0 ? (
        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-900 border border-amber-200">
          {badge}
        </span>
      ) : (
        <span className="shrink-0 text-teal-300 group-hover:text-teal-700 transition font-bold text-sm">
          &rarr;
        </span>
      )}
    </Link>
  );
}
