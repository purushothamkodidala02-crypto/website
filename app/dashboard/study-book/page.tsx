import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicHeader } from "@/components/site/PublicHeader";
import { createClient } from "@/lib/supabase/server";
import { StudyViewer } from "@/components/study/StudyViewer";

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
  
  const rowsMissingData = rawRows.filter(r => !r.state_name || !r.exam_name || !r.paper_name || !r.subject_name);
  
  let questionById = new Map();
  let subjectById = new Map();
  let paperById = new Map();
  let examById = new Map();
  let boardById = new Map();
  let stateById = new Map();

  if (rowsMissingData.length > 0) {
    const questionIds = rowsMissingData.map((row) => row.question_id);
    const questionResult = await supabase
      .from("questions")
      .select(`
        id,
        subject:subjects (
          name,
          paper:papers (
            name,
            exam_group:exam_groups (
              name,
              exam:exams (
                state:exam_states (
                  name,
                  code
                )
              )
            )
          )
        )
      `)
      .in("id", questionIds);
      
    for (const item of (questionResult.data ?? []) as any[]) {
      const subject = Array.isArray(item.subject) ? item.subject[0] : item.subject;
      if (!subject) continue;
      const paper = Array.isArray(subject.paper) ? subject.paper[0] : subject.paper;
      const examGroup = paper ? (Array.isArray(paper.exam_group) ? paper.exam_group[0] : paper.exam_group) : null;
      const exam = examGroup ? (Array.isArray(examGroup.exam) ? examGroup.exam[0] : examGroup.exam) : null;
      const state = exam ? (Array.isArray(exam.state) ? exam.state[0] : exam.state) : null;

      questionById.set(item.id, {
        subjectName: subject?.name,
        paperName: paper?.name,
        examName: examGroup?.name,
        stateName: state ? `${state.code} · ${state.name}` : null
      });
    }
  }

  const rows = rawRows.map((row) => {
    if (row.state_name && row.exam_name && row.paper_name && row.subject_name) {
      return row;
    }
    const loc = questionById.get(row.question_id);
    return {
      ...row,
      state_name: row.state_name || loc?.stateName || "Other catalogue",
      exam_name: row.exam_name || loc?.examName || "Other exam",
      paper_name: row.paper_name || loc?.paperName || "Other paper",
      subject_name: row.subject_name || loc?.subjectName || "Other subject",
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
          <StudyViewer rows={filteredRows} initialIndex={currentIndex} view={view} />
        )}
      </div>
    </main>
  );
}

function StudyTab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return <Link href={href} aria-current={active ? "page" : undefined} className={`rounded-xl px-4 py-3 text-center text-sm font-black ${active ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"}`}>{children}</Link>;
}
