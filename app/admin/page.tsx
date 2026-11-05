import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { indiaDateKey } from "@/lib/date";
import { studentFacingMockTestTitle } from "@/lib/exam-catalog";
import { buildPaperDisplayMap, type OrderedPaper } from "@/lib/papers";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const today = indiaDateKey();
  const future30Date = new Date();
  future30Date.setDate(future30Date.getDate() + 30);
  const future30Key = indiaDateKey(future30Date);

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
      .eq("is_active", true)
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

  // Only check assignments for draft tests if any exist (fast scoped check)
  let draftsNeedingWork = drafts;
  if (drafts.length > 0) {
    const draftIds = drafts.map((d) => d.id);
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

  const metrics = [
    {
      label: "Published tests",
      value: published.length,
      detail: "Visible to students",
      href: "/admin/mock-tests",
      accent: "emerald",
      short: "LIVE",
    },
    {
      label: "Draft tests",
      value: drafts.length,
      detail: `${draftsNeedingWork.length} need attention`,
      href: "/admin/mock-tests",
      accent: "amber",
      short: "DRAFT",
    },
    {
      label: "Available questions",
      value: usableQuestionsCount,
      detail: `${totalQuestionsCountResult.count ?? 0} total in the Question Bank`,
      href: "/admin/questions",
      accent: "teal",
      short: "BANK",
    },
    {
      label: "Completed attempts",
      value: attemptsResult.count ?? 0,
      detail: "Student submissions",
      href: "/admin/results",
      accent: "violet",
      short: "DATA",
    },
  ] as const;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white p-7 text-slate-900 shadow-sm sm:p-9">


        <div className="relative flex flex-wrap items-end justify-between gap-7">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
              Admin overview
            </p>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Content operations
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              See what students can access, identify unfinished tests, and
              continue the most important admin work.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/similarity"
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-slate-800"
            >
              Similarity scanner
            </Link>
            <Link
              href="/admin/mock-tests"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100"
            >
              Manage mock tests
            </Link>
            <Link
              href="/admin/questions"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100"
            >
              Open Question Bank
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white px-6 py-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                Priority
              </p>
              <h2 className="mt-2 text-xl font-black">Needs attention</h2>
            </div>
            <Link
              href="/admin/mock-tests"
              className="rounded-lg bg-amber-100 px-3 py-2 text-sm font-bold text-amber-900 hover:bg-amber-200"
            >
              Review tests
            </Link>
          </div>
          <div className="grid gap-3 p-6">
            <AttentionItem
              count={expiringSoonCount}
              title={expiringSoonCount > 0 ? "Questions expiring soon (≤ 30 days)" : "No questions expiring soon"}
              detail={
                expiringSoonCount > 0
                  ? "Review upcoming expiring questions in the Question Bank before they leave student exams."
                  : "All questions in your Question Bank are permanent or within safe expiration dates."
              }
              tone={expiringSoonCount > 0 ? "amber" : "slate"}
              href="/admin/questions?status=expiring_soon"
            />
            <AttentionItem
              count={reportsResult.count ?? 0}
              title="Student question reports are open"
              detail="Review reported answers, wording, translations, and images."
              tone="amber"
            />
            <AttentionItem
              count={draftsNeedingWork.length}
              title="Draft tests are not ready"
              detail="Add usable questions and valid marks before publishing."
              tone="amber"
            />
            <AttentionItem
              count={drafts.length - draftsNeedingWork.length}
              title="Draft tests are ready to review"
              detail="Preview these tests and publish them when approved."
              tone="slate"
            />
            <AttentionItem
              count={hidden.length}
              title="Tests are hidden"
              detail="Existing results remain safe; restore a test if it should return."
              tone="slate"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Recently updated
            </p>
            <h2 className="mt-2 text-xl font-black">Mock tests</h2>
          </div>
          {tests.length === 0 ? (
            <p className="p-6 text-sm text-slate-600">
              No mock tests have been created.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {tests.slice(0, 5).map((test) => (
                <Link
                  key={test.id}
                  href={`/admin/mock-tests/${test.id}/edit`}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{visibleTestTitle(test)}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Updated{" "}
                      {new Intl.DateTimeFormat("en-IN", {
                        dateStyle: "medium",
                        timeZone: "Asia/Kolkata",
                      }).format(new Date(test.updated_at))}
                    </p>
                  </div>
                  <Status
                    status={test.status as "draft" | "published" | "archived"}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

const metricStyles = {
  emerald: {
    card: "border-slate-200/90 bg-white",
    badge: "bg-slate-100 text-slate-700",
    value: "text-slate-900",
  },
  amber: {
    card: "border-slate-200/90 bg-white",
    badge: "bg-amber-50 text-amber-800 border border-amber-200/60",
    value: "text-slate-900",
  },
  teal: {
    card: "border-slate-200/90 bg-white",
    badge: "bg-slate-100 text-slate-700",
    value: "text-slate-900",
  },
  violet: {
    card: "border-slate-200/90 bg-white",
    badge: "bg-slate-100 text-slate-700",
    value: "text-slate-900",
  },
};

function MetricCard({
  label,
  value,
  detail,
  href,
  accent,
  short,
}: {
  label: string;
  value: number;
  detail: string;
  href: string;
  accent: keyof typeof metricStyles;
  short: string;
}) {
  const styles = metricStyles[accent];
  return (
    <Link
      href={href}
      className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-950/5 ${styles.card}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-600">{label}</p>
        <span
          className={`rounded-lg px-2 py-1 text-[9px] font-black tracking-wider ${styles.badge}`}
        >
          {short}
        </span>
      </div>
      <p className={`mt-4 text-3xl font-black tracking-tight ${styles.value}`}>
        {value}
      </p>
      <p className="mt-3 text-xs font-semibold text-slate-500">{detail}</p>
    </Link>
  );
}

function AttentionItem({
  count,
  title,
  detail,
  tone,
  href,
}: {
  count: number;
  title: string;
  detail: string;
  tone: "amber" | "teal" | "slate";
  href?: string;
}) {
  const colors = {
    amber: "border-amber-100 bg-amber-50 text-amber-950",
    teal: "border-teal-100 bg-teal-50 text-teal-950",
    slate: "border-slate-200 bg-slate-50 text-slate-900",
  };
  const content = (
    <div className={`flex gap-4 rounded-2xl border p-4 ${colors[tone]} ${href ? "transition hover:shadow-md hover:border-amber-300" : ""}`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-lg font-black shadow-sm">
        {count}
      </span>
      <div>
        <h3 className="font-black">{title}</h3>
        <p className="mt-1 text-xs leading-5 opacity-75">{detail}</p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}

function Status({
  status,
}: {
  status: "draft" | "published" | "archived";
}) {
  const details =
    status === "published"
      ? ["Published", "bg-emerald-100 text-emerald-800"]
      : status === "archived"
        ? ["Hidden", "bg-slate-200 text-slate-700"]
        : ["Draft", "bg-amber-100 text-amber-800"];
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${details[1]}`}
    >
      {details[0]}
    </span>
  );
}
