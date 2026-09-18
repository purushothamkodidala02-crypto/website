import Link from "next/link";
import { redirect } from "next/navigation";
import { PublicHeader } from "@/components/site/PublicHeader";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

type QuestionMeta = {
  subjectName?: string;
  paperName?: string;
  examName?: string;
  stateName?: string;
  questionText?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  explanation?: string | null;
  imageUrl?: string | null;
};

type AdminQuestionRow = {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
  image_url: string | null;
  subject:
    | {
        name?: string;
        paper?:
          | {
              name?: string;
              exam_group?:
                | {
                    name?: string;
                    exam?:
                      | {
                          state?: { name?: string; code?: string } | { name?: string; code?: string }[] | null;
                        }
                      | { state?: { name?: string; code?: string } | null }[]
                      | null;
                  }
                | { exam?: unknown }[]
                | null;
            }
          | { exam_group?: unknown }[]
          | null;
      }
    | { name?: string; paper?: unknown }[]
    | null;
};

type SessionQuestionRow = {
  question_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
  image_url: string | null;
};

async function fetchQuestionsMetadata(
  supabase: Awaited<ReturnType<typeof createClient>>,
  questionIds: string[]
): Promise<Map<string, QuestionMeta>> {
  const result = new Map<string, QuestionMeta>();
  if (questionIds.length === 0) return result;

  // 1. If service role key is configured, admin client can load directly from questions table with catalog relations
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("questions")
        .select(`
          id,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer,
          explanation,
          image_url,
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

      for (const item of (data ?? []) as unknown as AdminQuestionRow[]) {
        const subject = Array.isArray(item.subject) ? item.subject[0] : item.subject;
        const paper = subject && typeof subject === "object" && "paper" in subject
          ? Array.isArray(subject.paper) ? subject.paper[0] : subject.paper
          : null;
        const examGroup = paper && typeof paper === "object" && "exam_group" in paper
          ? Array.isArray(paper.exam_group) ? paper.exam_group[0] : paper.exam_group
          : null;
        const exam = examGroup && typeof examGroup === "object" && "exam" in examGroup
          ? Array.isArray(examGroup.exam) ? examGroup.exam[0] : examGroup.exam
          : null;
        const state = exam && typeof exam === "object" && "state" in exam
          ? Array.isArray(exam.state) ? exam.state[0] : exam.state
          : null;

        result.set(item.id, {
          subjectName: subject && "name" in subject && typeof subject.name === "string" ? subject.name : undefined,
          paperName: paper && "name" in paper && typeof paper.name === "string" ? paper.name : undefined,
          examName: examGroup && "name" in examGroup && typeof examGroup.name === "string" ? examGroup.name : undefined,
          stateName: state && "name" in state && typeof state.name === "string"
            ? `${state.code ? `${state.code} · ` : ""}${state.name}`
            : undefined,
          questionText: item.question_text,
          optionA: item.option_a,
          optionB: item.option_b,
          optionC: item.option_c,
          optionD: item.option_d,
          correctAnswer: item.correct_answer,
          explanation: item.explanation,
          imageUrl: item.image_url,
        });
      }
    } catch (e) {
      console.error("Admin fetch questions metadata error:", e);
    }
  }

  // 2. For any remaining questions, check test_attempt_session_questions (which students have RLS select access to)
  const remainingIds = questionIds.filter((id) => !result.has(id));
  if (remainingIds.length > 0) {
    try {
      const { data: sessionData } = await supabase
        .from("test_attempt_session_questions")
        .select("question_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, image_url")
        .in("question_id", remainingIds);

      for (const item of (sessionData ?? []) as unknown as SessionQuestionRow[]) {
        if (!result.has(item.question_id)) {
          result.set(item.question_id, {
            questionText: item.question_text,
            optionA: item.option_a,
            optionB: item.option_b,
            optionC: item.option_c,
            optionD: item.option_d,
            correctAnswer: item.correct_answer,
            explanation: item.explanation,
            imageUrl: item.image_url,
          });
        }
      }
    } catch (e) {
      console.error("Session questions fetch error:", e);
    }
  }

  return result;
}

export default async function StudyBookPage({ searchParams }: { searchParams: Promise<{ view?: string; state?: string; exam?: string; paper?: string; subject?: string; q?: string; item?: string }> }) {
  const query = await searchParams;
  const view = query.view === "bookmarks" ? "bookmarks" : "mistakes";
  const supabase = await createClient();
  
  // 1. Await user auth first to guarantee active tokens and prevent race conditions
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const returnUrl = `/dashboard/study-book${view === "bookmarks" ? "?view=bookmarks" : ""}`;
    redirect(`/login?next=${encodeURIComponent(returnUrl)}`);
  }

  let rawRows: StudyRow[] = [];
  let loadError = false;

  // 2. Try loading questions through RPC function
  try {
    const rpcResult = await supabase.rpc("get_student_study_book", { requested_kind: view });
    if (!rpcResult.error && Array.isArray(rpcResult.data)) {
      rawRows = rpcResult.data as StudyRow[];
    } else {
      if (rpcResult.error) {
        console.error("RPC get_student_study_book error, attempting fallback:", rpcResult.error);
      }
      throw rpcResult.error ?? new Error("RPC returned non-array data");
    }
  } catch {
    // 3. Resilient Fallback: Query student mistakes/bookmarks directly with student RLS permissions
    try {
      if (view === "mistakes") {
        const { data: mistakesData, error: mistakesError } = await supabase
          .from("student_question_mistakes")
          .select("question_id, mistake_count, last_selected_answer, last_seen_at")
          .eq("user_id", user.id)
          .is("mastered_at", null)
          .order("last_seen_at", { ascending: false });

        if (mistakesError) {
          console.error("Fallback mistakes query failed:", mistakesError);
          loadError = true;
        } else if (!mistakesData || mistakesData.length === 0) {
          rawRows = [];
        } else {
          const questionIds = mistakesData.map((m) => m.question_id);
          const [bookmarksResult, questionsMeta] = await Promise.all([
            supabase
              .from("student_question_bookmarks")
              .select("question_id")
              .eq("user_id", user.id)
              .in("question_id", questionIds),
            fetchQuestionsMetadata(supabase, questionIds),
          ]);

          const bookmarkedSet = new Set((bookmarksResult.data ?? []).map((b) => b.question_id));

          rawRows = mistakesData
            .map((m) => {
              const meta = questionsMeta.get(m.question_id);
              if (!meta || !meta.questionText) return null;
              return {
                question_id: m.question_id,
                state_name: meta.stateName || "Other catalogue",
                exam_name: meta.examName || "Other exam",
                paper_name: meta.paperName || "Other paper",
                subject_name: meta.subjectName || "Other subject",
                question_text: meta.questionText,
                option_a: meta.optionA || "",
                option_b: meta.optionB || "",
                option_c: meta.optionC || "",
                option_d: meta.optionD || "",
                correct_answer: meta.correctAnswer || "A",
                explanation: meta.explanation ?? null,
                image_url: meta.imageUrl ?? null,
                mistake_count: m.mistake_count ?? 1,
                last_selected_answer: m.last_selected_answer ?? null,
                last_seen_at: m.last_seen_at,
                bookmarked: bookmarkedSet.has(m.question_id),
              };
            })
            .filter((r): r is StudyRow => r !== null);
        }
      } else {
        const { data: bookmarksData, error: bookmarksError } = await supabase
          .from("student_question_bookmarks")
          .select("question_id, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (bookmarksError) {
          console.error("Fallback bookmarks query failed:", bookmarksError);
          loadError = true;
        } else if (!bookmarksData || bookmarksData.length === 0) {
          rawRows = [];
        } else {
          const questionIds = bookmarksData.map((b) => b.question_id);
          const [mistakesResult, questionsMeta] = await Promise.all([
            supabase
              .from("student_question_mistakes")
              .select("question_id, mistake_count, last_selected_answer, last_seen_at")
              .eq("user_id", user.id)
              .in("question_id", questionIds),
            fetchQuestionsMetadata(supabase, questionIds),
          ]);

          const mistakesMap = new Map((mistakesResult.data ?? []).map((m) => [m.question_id, m]));

          rawRows = bookmarksData
            .map((b) => {
              const meta = questionsMeta.get(b.question_id);
              if (!meta || !meta.questionText) return null;
              const mistake = mistakesMap.get(b.question_id);
              return {
                question_id: b.question_id,
                state_name: meta.stateName || "Other catalogue",
                exam_name: meta.examName || "Other exam",
                paper_name: meta.paperName || "Other paper",
                subject_name: meta.subjectName || "Other subject",
                question_text: meta.questionText,
                option_a: meta.optionA || "",
                option_b: meta.optionB || "",
                option_c: meta.optionC || "",
                option_d: meta.optionD || "",
                correct_answer: meta.correctAnswer || "A",
                explanation: meta.explanation ?? null,
                image_url: meta.imageUrl ?? null,
                mistake_count: mistake?.mistake_count ?? 0,
                last_selected_answer: mistake?.last_selected_answer ?? null,
                last_seen_at: mistake?.last_seen_at || b.created_at,
                bookmarked: true,
              };
            })
            .filter((r): r is StudyRow => r !== null);
        }
      }
    } catch (fallbackErr) {
      console.error("Fallback execution error:", fallbackErr);
      loadError = true;
    }
  }

  // 4. Fill in missing catalogue names if any
  const rowsMissingData = rawRows.filter((r) => !r.state_name || !r.exam_name || !r.paper_name || !r.subject_name);
  if (rowsMissingData.length > 0) {
    const missingIds = rowsMissingData.map((r) => r.question_id);
    const extraMeta = await fetchQuestionsMetadata(supabase, missingIds);
    rawRows = rawRows.map((row) => {
      const meta = extraMeta.get(row.question_id);
      return {
        ...row,
        state_name: row.state_name || meta?.stateName || "Other catalogue",
        exam_name: row.exam_name || meta?.examName || "Other exam",
        paper_name: row.paper_name || meta?.paperName || "Other paper",
        subject_name: row.subject_name || meta?.subjectName || "Other subject",
      };
    });
  }

  const rows = rawRows;
  
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
      <div className="mx-auto max-w-7xl 2xl:max-w-[90rem] px-4 py-4 sm:px-6 lg:py-6">
        {/* Top bar: Back link and View Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-900">
            <span aria-hidden="true">←</span>
            <span>Back to dashboard</span>
          </Link>
          <nav className="inline-flex rounded-xl bg-slate-200/80 p-1" aria-label="Study book views">
            <StudyTab href="/dashboard/study-book" active={view === "mistakes"}>Mistake Book</StudyTab>
            <StudyTab href="/dashboard/study-book?view=bookmarks" active={view === "bookmarks"}>Bookmarks</StudyTab>
          </nav>
        </div>

        {/* Compact revision banner */}
        <section className="mt-3 rounded-2xl bg-slate-950 p-4 sm:p-5 text-white sm:rounded-3xl shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] text-teal-300">Personal revision</p>
              <h1 className="mt-0.5 text-xl sm:text-2xl lg:text-3xl font-black">Mistake Book and Bookmarks</h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-300">
                {view === "bookmarks"
                  ? "Questions you bookmarked for review. Analyze solutions and master concepts side-by-side."
                  : "Questions you answered incorrectly are collected here automatically with complete explanations."}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 sm:py-2 text-center">
              <span className="block text-lg sm:text-2xl font-black text-teal-300">{filteredRows.length}</span>
              <span className="block text-[10px] sm:text-[11px] font-bold text-slate-400">
                {view === "bookmarks" ? "Bookmarks" : "Mistakes"}
              </span>
            </div>
          </div>
        </section>

        {/* Collapsible Search & Filter Bar */}
        <details className="group mt-3 rounded-2xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-2xs" open={Boolean(state || exam || paper || subject || search)}>
          <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-black uppercase tracking-wider text-slate-700">
            <div className="flex items-center gap-2">
              <span>🔍 Search & Filter</span>
              {(state || exam || paper || subject || search) && (
                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold tracking-normal text-teal-900 lowercase">
                  filters active
                </span>
              )}
            </div>
            <span className="text-slate-400 text-xs transition group-open:rotate-180">▼</span>
          </summary>
          <form action="/dashboard/study-book" className="mt-3 border-t border-slate-100 pt-3">
            {view === "bookmarks" && <input type="hidden" name="view" value="bookmarks" />}
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block text-xs font-bold text-slate-700">State / catalogue<select name="state" defaultValue={state} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal"><option value="">All states</option>{stateOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <label className="block text-xs font-bold text-slate-700">Exam<select name="exam" defaultValue={exam} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal"><option value="">All exams</option>{examOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <label className="block text-xs font-bold text-slate-700">Paper<select name="paper" defaultValue={paper} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal"><option value="">All papers</option>{paperOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <label className="block text-xs font-bold text-slate-700">Subject<select name="subject" defaultValue={subject} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal"><option value="">All subjects</option>{subjectOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            </div>
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="block text-xs font-bold text-slate-700">Search questions<input name="q" type="search" defaultValue={search} maxLength={120} placeholder="Search question text, exam, paper or subject..." className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal" /></label>
              <div className="flex items-center gap-2">
                {(state || exam || paper || subject || search) && (
                  <Link href={view === "bookmarks" ? "/dashboard/study-book?view=bookmarks" : "/dashboard/study-book"} className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50">Reset</Link>
                )}
                <button type="submit" className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-teal-900">Apply Filters</button>
              </div>
            </div>
          </form>
        </details>

        {loadError && rows.length === 0 ? (
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
  return <Link href={href} aria-current={active ? "page" : undefined} className={`rounded-lg px-3.5 py-1.5 text-center text-xs font-black transition ${active ? "bg-white text-slate-950 shadow-xs" : "text-slate-600 hover:text-slate-950"}`}>{children}</Link>;
}
