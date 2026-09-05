import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReportAdminForm } from "./ReportAdminForm";

type ReportRow = {
  id: string;
  user_id: string;
  question_id: string;
  attempt_id: string | null;
  category: string;
  details: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  questions: { question_text: string; subjects: { name: string } | null } | null;
};

const categoryLabels: Record<string, string> = {
  wrong_answer: "Answer appears incorrect",
  unclear_wording: "Unclear wording",
  translation: "Translation issue",
  broken_image: "Broken image",
  duplicate: "Duplicate question",
  other: "Other problem",
};
const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

export default async function AdminQuestionReportsPage({ searchParams }: { searchParams: Promise<{ status?: string; category?: string }> }) {
  const query = await searchParams;
  const admin = createAdminClient();
  let request = admin.from("question_reports").select("id, user_id, question_id, attempt_id, category, details, status, admin_notes, created_at, questions(question_text, subjects(name))").order("created_at", { ascending: false }).limit(100);
  if (["open", "reviewing", "resolved", "dismissed"].includes(query.status ?? "")) request = request.eq("status", query.status!);
  if (Object.hasOwn(categoryLabels, query.category ?? "")) request = request.eq("category", query.category!);
  const { data, error } = await request;
  const reports = (data ?? []) as unknown as ReportRow[];
  const userIds = [...new Set(reports.map((report) => report.user_id))];
  const { data: profiles } = userIds.length ? await admin.from("profiles").select("id, full_name").in("id", userIds) : { data: [] as { id: string; full_name: string | null }[] };
  const studentNames = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name?.trim() || "Student"]));
  const openCount = reports.filter((report) => report.status === "open").length;

  return <div>
    <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Content quality</p>
    <div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-black text-slate-950">Question reports</h1><p className="mt-2 max-w-3xl text-slate-600">Review issues reported by students, correct Question Bank content, and record the resolution.</p></div><div className="rounded-2xl bg-red-50 px-5 py-3 text-center"><p className="text-2xl font-black text-red-800">{openCount}</p><p className="text-xs font-bold text-red-700">Open in this view</p></div></div>

    <form method="get" className="mt-7 grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="text-sm font-bold">Status<select name="status" defaultValue={query.status ?? ""} className="mt-1.5 w-full rounded-xl border px-3 py-2.5 font-normal"><option value="">All statuses</option><option value="open">Open</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option></select></label>
      <label className="text-sm font-bold">Problem type<select name="category" defaultValue={query.category ?? ""} className="mt-1.5 w-full rounded-xl border px-3 py-2.5 font-normal"><option value="">All problem types</option>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <button className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-black text-white">Apply filters</button>
    </form>

    {error ? <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 font-semibold text-red-800">Question reports could not be loaded. Refresh and try again.</p> : reports.length === 0 ? <section className="mt-6 rounded-3xl border border-dashed bg-white p-10 text-center"><h2 className="text-xl font-black">No matching reports</h2><p className="mt-2 text-sm text-slate-600">New student reports will appear here.</p></section> : <section className="mt-6 grid gap-5">{reports.map((report) => <article key={report.id} className="rounded-3xl border bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-black ${statusStyles[report.status]}`}>{report.status}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{categoryLabels[report.category]}</span></div><p className="mt-4 text-xs font-black uppercase tracking-wide text-teal-700">{report.questions?.subjects?.name ?? "Question Bank"}</p><h2 className="mt-2 line-clamp-3 text-lg font-black leading-7 text-slate-950">{report.questions?.question_text ?? "Question content unavailable"}</h2><p className="mt-3 text-sm text-slate-600">Reported by {studentNames.get(report.user_id) ?? "Student"} · {dateFormatter.format(new Date(report.created_at))}</p>{report.details && <p className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Student details:</strong> {report.details}</p>}</div><Link href={`/admin/questions/${report.question_id}/edit`} className="shrink-0 rounded-xl bg-teal-700 px-4 py-3 text-sm font-black text-white">Open question</Link></div><ReportAdminForm reportId={report.id} status={report.status} notes={report.admin_notes} /></article>)}</section>}
  </div>;
}
