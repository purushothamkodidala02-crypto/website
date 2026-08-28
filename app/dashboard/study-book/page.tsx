import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicHeader } from "@/components/site/PublicHeader";
import { BookmarkButton } from "@/components/study/BookmarkButton";
import { FormattedQuestionText } from "@/components/questions/FormattedQuestionText";
import { QuestionMedia } from "@/components/questions/QuestionMedia";
import { ReportQuestionButton } from "@/components/questions/ReportQuestionButton";
import { createClient } from "@/lib/supabase/server";

type StudyRow = {
  question_id: string;
  subject_name: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
  image_url: string | null;
  mistake_count: number;
  last_selected_answer: string | null;
  last_seen_at: string;
  bookmarked: boolean;
};

export default async function StudyBookPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const query = await searchParams;
  const view = query.view === "bookmarks" ? "bookmarks" : "mistakes";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/study-book");

  const { data, error } = await supabase.rpc("get_student_study_book", { requested_kind: view });
  const rows = (data ?? []) as StudyRow[];

  return (
    <main className="student-page min-h-screen bg-slate-50">
      <PublicHeader />
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <Link href="/dashboard" className="text-sm font-bold text-teal-700 hover:underline">← Back to dashboard</Link>
        <section className="mt-6 rounded-[2rem] bg-slate-950 p-7 text-white sm:p-9">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-teal-300">Personal revision</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Mistake Book and Bookmarks</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">Incorrect answers are collected automatically. Bookmark any useful question and return to it whenever you revise.</p>
        </section>

        <nav className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-200 p-1.5" aria-label="Study book views">
          <StudyTab href="/dashboard/study-book" active={view === "mistakes"}>Mistake Book</StudyTab>
          <StudyTab href="/dashboard/study-book?view=bookmarks" active={view === "bookmarks"}>Bookmarks</StudyTab>
        </nav>

        {error ? (
          <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">Your study questions could not be loaded. Please refresh and try again.</p>
        ) : rows.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed bg-white p-10 text-center">
            <h2 className="text-xl font-black text-slate-950">{view === "mistakes" ? "No active mistakes" : "No bookmarked questions"}</h2>
            <p className="mt-2 text-sm text-slate-600">{view === "mistakes" ? "Incorrect answers will appear here automatically after you submit a test." : "Use the Bookmark button during a test or answer review."}</p>
            <Link href="/mock-tests" className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Browse mock tests</Link>
          </section>
        ) : (
          <section className="student-stagger mt-6 grid gap-5">
            {rows.map((row, index) => <StudyQuestionCard key={row.question_id} row={row} index={index} />)}
          </section>
        )}
      </div>
    </main>
  );
}

function StudyTab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return <Link href={href} aria-current={active ? "page" : undefined} className={`rounded-xl px-4 py-3 text-center text-sm font-black ${active ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"}`}>{children}</Link>;
}

function StudyQuestionCard({ row, index }: { row: StudyRow; index: number }) {
  const options = [["A", row.option_a], ["B", row.option_b], ["C", row.option_c], ["D", row.option_d]];
  return (
    <article className="student-card overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-5 py-4 sm:px-6">
        <div><p className="text-xs font-black uppercase tracking-wide text-teal-700">{row.subject_name}</p><p className="mt-1 text-xs font-semibold text-slate-500">Question {index + 1}{row.mistake_count > 0 ? ` · Incorrect ${row.mistake_count} time${row.mistake_count === 1 ? "" : "s"}` : ""}</p></div>
        <div className="flex flex-wrap gap-2"><ReportQuestionButton questionId={row.question_id} /><BookmarkButton questionId={row.question_id} initialBookmarked={row.bookmarked} /></div>
      </div>
      <div className="p-5 sm:p-6">
        <FormattedQuestionText text={row.question_text} className="text-lg leading-8 text-slate-950" />
        {row.image_url && <QuestionMedia src={row.image_url} className="mt-5" />}
        <div className="mt-6 grid gap-3">
          {options.map(([key, label]) => <div key={key} className={`flex gap-3 rounded-xl border p-3.5 text-sm leading-6 ${key === row.correct_answer ? "border-emerald-300 bg-emerald-50 text-emerald-950" : key === row.last_selected_answer ? "border-red-200 bg-red-50 text-red-900" : "border-slate-200 text-slate-700"}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg font-black ${key === row.correct_answer ? "bg-emerald-700 text-white" : "bg-slate-100"}`}>{key}</span><span className="pt-1">{label}</span></div>)}
        </div>
        {row.explanation && <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 p-5 text-sm leading-7 text-teal-950"><p className="text-xs font-black uppercase tracking-wide text-teal-700">Explanation</p><FormattedQuestionText text={row.explanation} className="mt-2" /></div>}
      </div>
    </article>
  );
}
