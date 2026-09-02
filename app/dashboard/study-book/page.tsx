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
  state_name: string;
  exam_name: string;
  paper_name: string;
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

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function studyBookHref({ view, state, exam, paper, subject, search, item }: { view: "mistakes" | "bookmarks"; state: string; exam: string; paper: string; subject: string; search: string; item: number }) {
  const params = new URLSearchParams();
  if (view === "bookmarks") params.set("view", "bookmarks");
  if (state) params.set("state", state);
  if (exam) params.set("exam", exam);
  if (paper) params.set("paper", paper);
  if (subject) params.set("subject", subject);
  if (search) params.set("q", search);
  if (item > 1) params.set("item", String(item));
  const query = params.toString();
  return `/dashboard/study-book${query ? `?${query}` : ""}`;
}

export default async function StudyBookPage({ searchParams }: { searchParams: Promise<{ view?: string; state?: string; exam?: string; paper?: string; subject?: string; q?: string; item?: string }> }) {
  const query = await searchParams;
  const view = query.view === "bookmarks" ? "bookmarks" : "mistakes";
  const supabase = await createClient();
  
  const [authResult, rpcResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("get_student_study_book", { requested_kind: view })
  ]);
  
  const { data: { user } } = authResult;
  if (!user) redirect("/login?next=/dashboard/study-book");

  const { data, error } = rpcResult;
  const rawRows = (data ?? []) as StudyRow[];
  
  // The RPC already returns state_name, exam_name, paper_name, and subject_name.
  // We only need to fetch missing data if the RPC failed to resolve some of them.
  const rowsMissingData = rawRows.filter(r => !r.state_name || !r.exam_name || !r.paper_name || !r.subject_name);
  
  let questionById = new Map();
  let subjectById = new Map();
  let paperById = new Map();
  let examById = new Map();
  let boardById = new Map();
  let stateById = new Map();

  if (rowsMissingData.length > 0) {
    const questionIds = rowsMissingData.map((row) => row.question_id);
    const questionResult = await supabase.from("questions").select("id, subject_id").in("id", questionIds);
    const subjectIds = [...new Set((questionResult.data ?? []).map((item) => item.subject_id))];
    const subjectResult = subjectIds.length ? await supabase.from("subjects").select("id, paper_id, name").in("id", subjectIds) : { data: [] };
    const paperIds = [...new Set((subjectResult.data ?? []).map((item) => item.paper_id))];
    const paperResult = paperIds.length ? await supabase.from("papers").select("id, exam_group_id, name").in("id", paperIds) : { data: [] };
    const examIds = [...new Set((paperResult.data ?? []).map((item) => item.exam_group_id))];
    const examResult = examIds.length ? await supabase.from("exam_groups").select("id, exam_id, name").in("id", examIds) : { data: [] };
    const boardIds = [...new Set((examResult.data ?? []).map((item) => item.exam_id))];
    const boardResult = boardIds.length ? await supabase.from("exams").select("id, state_id").in("id", boardIds) : { data: [] };
    const stateIds = [...new Set((boardResult.data ?? []).map((item) => item.state_id))];
    const stateResult = stateIds.length ? await supabase.from("exam_states").select("id, name, code").in("id", stateIds) : { data: [] };
    
    questionById = new Map((questionResult.data ?? []).map((item) => [item.id, item]));
    subjectById = new Map((subjectResult.data ?? []).map((item) => [item.id, item]));
    paperById = new Map((paperResult.data ?? []).map((item) => [item.id, item]));
    examById = new Map((examResult.data ?? []).map((item) => [item.id, item]));
    boardById = new Map((boardResult.data ?? []).map((item) => [item.id, item]));
    stateById = new Map((stateResult.data ?? []).map((item) => [item.id, item]));
  }

  const rows = rawRows.map((row) => {
    if (row.state_name && row.exam_name && row.paper_name && row.subject_name) {
      return row;
    }
    const question = questionById.get(row.question_id);
    const subjectLocation = question ? subjectById.get(question.subject_id) : undefined;
    const paperLocation = subjectLocation ? paperById.get(subjectLocation.paper_id) : undefined;
    const examLocation = paperLocation ? examById.get(paperLocation.exam_group_id) : undefined;
    const boardLocation = examLocation ? boardById.get(examLocation.exam_id) : undefined;
    const stateLocation = boardLocation ? stateById.get(boardLocation.state_id) : undefined;
    return {
      ...row,
      state_name: row.state_name || (stateLocation ? `${stateLocation.code} · ${stateLocation.name}` : "Other catalogue"),
      exam_name: row.exam_name || examLocation?.name || "Other exam",
      paper_name: row.paper_name || paperLocation?.name || "Other paper",
      subject_name: row.subject_name || subjectLocation?.name || "Other subject",
    };
  });
  const state = String(query.state ?? "");
  const exam = String(query.exam ?? "");
  const paper = String(query.paper ?? "");
  const subject = String(query.subject ?? "");
  const search = String(query.q ?? "").trim().slice(0, 120);
  const stateOptions = unique(rows.map((row) => row.state_name));
  const examOptions = unique(rows.filter((row) => !state || row.state_name === state).map((row) => row.exam_name));
  const paperOptions = unique(rows.filter((row) => (!state || row.state_name === state) && (!exam || row.exam_name === exam)).map((row) => row.paper_name));
  const subjectOptions = unique(rows.filter((row) => (!state || row.state_name === state) && (!exam || row.exam_name === exam) && (!paper || row.paper_name === paper)).map((row) => row.subject_name));
  const filteredRows = rows.filter((row) => {
    const matchesLocation = (!state || row.state_name === state) && (!exam || row.exam_name === exam) && (!paper || row.paper_name === paper) && (!subject || row.subject_name === subject);
    const searchable = `${row.question_text} ${row.state_name} ${row.exam_name} ${row.paper_name} ${row.subject_name}`.toLowerCase();
    return matchesLocation && (!search || searchable.includes(search.toLowerCase()));
  });
  const requestedItem = Number(query.item ?? 1);
  const currentIndex = Number.isInteger(requestedItem) ? Math.min(Math.max(requestedItem - 1, 0), Math.max(filteredRows.length - 1, 0)) : 0;
  const currentRow = filteredRows[currentIndex];
  const itemHref = (item: number) => studyBookHref({ view, state, exam, paper, subject, search, item });

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

        <form action="/dashboard/study-book" className="mt-6 rounded-2xl border bg-white p-4">
          {view === "bookmarks" && <input type="hidden" name="view" value="bookmarks" />}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-sm font-bold">State / catalogue<select name="state" defaultValue={state} className="mt-2 w-full rounded-xl border bg-white px-3 py-2.5 font-normal"><option value="">All states</option>{stateOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label className="block text-sm font-bold">Exam<select name="exam" defaultValue={exam} className="mt-2 w-full rounded-xl border bg-white px-3 py-2.5 font-normal"><option value="">All exams</option>{examOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label className="block text-sm font-bold">Paper<select name="paper" defaultValue={paper} className="mt-2 w-full rounded-xl border bg-white px-3 py-2.5 font-normal"><option value="">All papers</option>{paperOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label className="block text-sm font-bold">Subject<select name="subject" defaultValue={subject} className="mt-2 w-full rounded-xl border bg-white px-3 py-2.5 font-normal"><option value="">All subjects</option>{subjectOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block text-sm font-bold">Search questions<input name="q" type="search" defaultValue={search} maxLength={120} placeholder="Search question text, exam, paper or subject" className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal" /></label>
            <button type="submit" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">Search and filter</button>
          </div>
        </form>

        {error ? (
          <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">Your study questions could not be loaded. Please refresh and try again.</p>
        ) : filteredRows.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed bg-white p-10 text-center">
            <h2 className="text-xl font-black text-slate-950">{state || exam || paper || subject || search ? "No matching questions" : view === "mistakes" ? "No active mistakes" : "No bookmarked questions"}</h2>
            <p className="mt-2 text-sm text-slate-600">{state || exam || paper || subject || search ? "Change or clear the search filters to see other saved questions." : view === "mistakes" ? "Incorrect answers will appear here automatically after you submit a test." : "Use the Bookmark button during a test or answer review."}</p>
            <Link href="/mock-tests" className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Browse mock tests</Link>
          </section>
        ) : (
          <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-slate-200 bg-white px-3 py-3 sm:gap-4 sm:px-5">
              {currentIndex > 0 ? <Link href={itemHref(currentIndex)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:border-teal-300 hover:text-teal-800">← Previous</Link> : <span className="rounded-lg border border-slate-100 px-3 py-2 text-xs font-black text-slate-300">← Previous</span>}
              <p className="text-center text-xs font-black text-slate-700 sm:text-sm">Question {currentIndex + 1} of {filteredRows.length}</p>
              {currentIndex < filteredRows.length - 1 ? <Link href={itemHref(currentIndex + 2)} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white">Next →</Link> : <span className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-black text-slate-400">Next →</span>}
            </div>
            <div className="max-h-[64vh] overflow-y-auto overscroll-contain p-3 sm:max-h-[72vh] sm:p-5">
              {currentRow && <StudyQuestionCard key={currentRow.question_id} row={currentRow} index={currentIndex} />}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3"><span className="text-xs font-bold text-slate-500">{filteredRows.length} total</span><Link href={view === "bookmarks" ? "/dashboard/study-book?view=bookmarks" : "/dashboard/study-book"} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:border-teal-300 hover:text-teal-800">Clear search and filters</Link></div>
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
        <div className="min-w-0"><p className="break-words text-xs font-black uppercase tracking-wide text-teal-700">{row.state_name} · {row.exam_name} · {row.paper_name} · {row.subject_name}</p><p className="mt-1 text-xs font-semibold text-slate-500">Question {index + 1}{row.mistake_count > 0 ? ` · Incorrect ${row.mistake_count} time${row.mistake_count === 1 ? "" : "s"}` : ""}</p></div>
        <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto"><ReportQuestionButton questionId={row.question_id} /><BookmarkButton questionId={row.question_id} initialBookmarked={row.bookmarked} /></div>
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
