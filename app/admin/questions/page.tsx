import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CreateQuestionForm } from "./CreateQuestionForm";
import { QuestionBankTable } from "./QuestionBankTable";
import { QuestionCsvImport } from "./QuestionCsvImport";

type QuestionBankSearchParams = {
  category?: string;
  exam?: string;
  specialization?: string;
  paper?: string;
  subject?: string;
  q?: string;
  status?: string;
  page?: string;
};

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<QuestionBankSearchParams>;
}) {
  const query = await searchParams;
  const supabase = await createClient();
  const [subjectsResult, papersResult, groupsResult, categoriesResult, specializationsResult] = await Promise.all([
    supabase.from("subjects").select("id, paper_id, name, content_language_mode, display_order").order("display_order"),
    supabase.from("papers").select("id, exam_group_id, specialization_id, name, display_order").order("display_order"),
    supabase.from("exam_groups").select("id, exam_id, name, display_order").order("display_order"),
    supabase.from("exams").select("id, name, display_order").order("display_order"),
    supabase.from("exam_specializations").select("id, exam_group_id, name").order("display_order"),
  ]);

  const subjects = subjectsResult.data ?? [];
  const papers = papersResult.data ?? [];
  const exams = groupsResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const specializations = specializationsResult.data ?? [];
  const categoryOptions = categories.map((item) => ({ id: item.id, name: item.name }));
  const examOptions = exams.map((item) => ({ id: item.id, categoryId: item.exam_id, name: item.name }));
  const specializationOptions = specializations.map((item) => ({ id: item.id, examId: item.exam_group_id, name: item.name }));
  const paperOptions = papers.map((item) => ({ id: item.id, examId: item.exam_group_id, specializationId: item.specialization_id, name: item.name }));
  const subjectOptions = subjects.map((item) => ({ id: item.id, paperId: item.paper_id, name: item.name, contentLanguageMode: item.content_language_mode }));
  const categoryId = categoryOptions.some((item) => item.id === query.category) ? query.category ?? "" : "";
  const examId = examOptions.some((item) => item.id === query.exam && item.categoryId === categoryId) ? query.exam ?? "" : "";
  const specializationId = specializationOptions.some((item) => item.id === query.specialization && item.examId === examId) ? query.specialization ?? "" : "";
  const paperId = paperOptions.some((item) => item.id === query.paper && item.examId === examId && item.specializationId === (specializationId || null)) ? query.paper ?? "" : "";
  const subjectId = subjectOptions.some((item) => item.id === query.subject && item.paperId === paperId) ? query.subject ?? "" : "";
  const requestedPage = Number(query.page ?? "1");
  const initialPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const initialSearch = String(query.q ?? "").trim().slice(0, 100);
  const initialStatus = String((query as Record<string, string | undefined>).status ?? "all").trim();
  const initialLocation = { categoryId, examId, specializationId, paperId, subjectId };
  const tableStateKey = [categoryId, examId, specializationId, paperId, subjectId, initialSearch, initialStatus, initialPage].join(":");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-800">Content library</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Question Bank</h1>
          <p className="mt-1 text-sm text-slate-600">Browse reusable questions or open a creation tool below.</p>
        </div>
        <nav aria-label="Question Bank tools" className="flex flex-wrap items-center gap-2">
          <a href="#existing-questions" className="rounded-xl border border-teal-300 bg-teal-50 px-3.5 py-2 text-xs font-bold text-teal-950 hover:bg-teal-100 transition">Browse existing</a>
          <a href="#add-one-question" className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:border-teal-300 transition">+ Add question</a>
          <a href="#import-questions" className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:border-teal-300 transition">Import Excel / CSV</a>
          <Link href="/admin/similarity" prefetch={false} className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 hover:border-teal-300 hover:bg-teal-50/70 transition">Similarity scanner</Link>
        </nav>
      </div>

      <div id="existing-questions" className="scroll-mt-24">
        <QuestionBankTable key={tableStateKey} categories={categoryOptions} exams={examOptions} specializations={specializationOptions} papers={paperOptions} subjects={subjectOptions} initialLocation={initialLocation} initialSearch={initialSearch} initialPage={initialPage} initialStatus={initialStatus} />
      </div>

      <details id="add-one-question" className="mt-6 scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <summary className="cursor-pointer list-none px-5 py-4 hover:bg-slate-50/70 transition">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-800">Create</span>
          <h2 className="mt-0.5 text-lg font-bold text-slate-950">+ Add one question</h2>
          <p className="mt-0.5 text-xs text-slate-600">Classify and enter one reusable question manually.</p>
        </summary>
        <div className="border-t px-4 pb-6 sm:px-6"><CreateQuestionForm categories={categoryOptions} exams={examOptions} specializations={specializationOptions} papers={paperOptions} subjects={subjectOptions} /></div>
      </details>

      <details id="import-questions" className="mt-4 scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <summary className="cursor-pointer list-none px-5 py-4 hover:bg-slate-50/70 transition">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-800">Bulk import</span>
          <h2 className="mt-0.5 text-lg font-bold text-slate-950">+ Import Excel or CSV</h2>
          <p className="mt-0.5 text-xs text-slate-600">Upload up to 500 checked questions for one Paper.</p>
        </summary>
        <div className="border-t px-4 pb-6 sm:px-6"><QuestionCsvImport categories={categoryOptions} exams={examOptions} specializations={specializationOptions} papers={paperOptions} /></div>
      </details>
    </div>
  );
}
