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
      <section className="relative overflow-hidden rounded-[2rem] border border-teal-100/20 bg-gradient-to-br from-[#0a2922] via-[#0e3a30] to-[#144d40] p-7 text-white shadow-xl shadow-teal-950/20 sm:p-9">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-teal-300/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-7">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-teal-200">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
              Admin overview
            </p>
            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Content operations
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              See what students can access, identify unfinished tests, and
              continue the most important admin work.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/similarity"
              className="rounded-xl bg-teal-300 px-4 py-3 text-sm font-black text-[#071f1a] shadow-lg shadow-teal-950/20 hover:bg-teal-200"
            >
              Similarity scanner
            </Link>
            <Link
              href="/admin/mock-tests"
              className="rounded-xl border border-teal-300/30 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/20"
            >
              Manage mock tests
            </Link>
            <Link
              href="/admin/questions"
              className="rounded-xl border border-teal-300/30 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/20"
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
              tone={expiringSoonCount > 0 ? "amber" : "teal"}
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
              tone="teal"
            />
            <AttentionItem
              count={hidden.length}
              title="Tests are hidden"
              detail="Existing results remain safe; restore a test if it should return."
              tone="slate"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
          <div className="border-b border-teal-100 bg-gradient-to-r from-teal-50 to-white px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
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
                  className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-teal-50/50"
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

      {/* Question Similarity & Overlap Intelligence */}
      <section className="relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-r from-teal-50/60 via-white to-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/60 bg-teal-100/60 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-teal-800">
              Exam Intelligence
            </span>
            <h2 className="mt-3 text-2xl font-black text-[#132621]">
              Question Similarity & Overlap Scanner
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Audit question overlaps across exams, specialisations (such as TG TET Paper 2), and subject practice tests with automated syllabus intent recognition and bulk duplicate resolution.
            </p>
          </div>
          <div>
            <Link
              href="/admin/similarity"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-black text-white shadow-md shadow-teal-900/15 transition hover:bg-teal-800"
            >
              Launch Similarity Scanner &rarr;
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-teal-900/40 bg-gradient-to-br from-[#0a2922] via-[#0e3a30] to-[#144d40] p-6 text-white shadow-xl shadow-teal-950/20 sm:p-8">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-200">
            Content setup
          </p>
          <h2 className="mt-2 text-2xl font-black">Build in the right order</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Structure the Exam first, add reusable questions, then let Mock
            Tests control student visibility.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <WorkflowLink
              number="01"
              title="Exam catalogue"
              detail="States, Recruiting Boards, Exams, Papers, and Subjects"
              href="/admin/exams"
            />
            <WorkflowLink
              number="02"
              title="Question Bank"
              detail="Create or import reusable questions"
              href="/admin/questions"
            />
            <WorkflowLink
              number="03"
              title="Mock tests"
              detail="Build, preview, and publish tests"
              href="/admin/mock-tests"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

const metricStyles = {
  emerald: {
    card: "border-emerald-100 bg-gradient-to-br from-emerald-50 to-white",
    badge: "bg-emerald-100 text-emerald-800",
    value: "text-emerald-950",
  },
  amber: {
    card: "border-amber-100 bg-gradient-to-br from-amber-50 to-white",
    badge: "bg-amber-100 text-amber-800",
    value: "text-amber-950",
  },
  teal: {
    card: "border-teal-100 bg-gradient-to-br from-teal-50 to-white",
    badge: "bg-teal-100 text-teal-800",
    value: "text-teal-950",
  },
  violet: {
    card: "border-violet-100 bg-gradient-to-br from-violet-50 to-white",
    badge: "bg-violet-100 text-violet-800",
    value: "text-violet-950",
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
      className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-950/5 ${styles.card}`}
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

function WorkflowLink({
  number,
  title,
  detail,
  href,
}: {
  number: string;
  title: string;
  detail: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-700 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-teal-300/50 hover:bg-white/10"
    >
      <span className="text-xs font-black text-teal-200">{number}</span>
      <h3 className="mt-3 font-black">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-slate-300">{detail}</p>
    </Link>
  );
}
