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
    <main>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Content library</p>
        <h1 className="mt-2 text-3xl font-black">Question Bank</h1>
        <p className="mt-2 text-slate-600">Browse reusable questions first. Open a creation tool only when you need to add new content.</p>
      </div>

      <nav aria-label="Question Bank tools" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <a href="#existing-questions" className="rounded-2xl border border-teal-300 bg-teal-50 p-4 text-sm font-black text-teal-950">Browse existing questions</a>
        <a href="#add-one-question" className="rounded-2xl border bg-white p-4 text-sm font-black text-slate-800 hover:border-teal-300">Add one question</a>
        <a href="#import-questions" className="rounded-2xl border bg-white p-4 text-sm font-black text-slate-800 hover:border-teal-300">Import Excel or CSV</a>
        <Link href="/admin/similarity" className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 text-sm font-black text-teal-950 hover:bg-teal-100 transition">Similarity scanner</Link>
      </nav>

      <div id="existing-questions" className="scroll-mt-24">
        <QuestionBankTable key={tableStateKey} categories={categoryOptions} exams={examOptions} specializations={specializationOptions} papers={paperOptions} subjects={subjectOptions} initialLocation={initialLocation} initialSearch={initialSearch} initialPage={initialPage} initialStatus={initialStatus} />
      </div>

      <details id="add-one-question" className="mt-8 scroll-mt-24 overflow-hidden rounded-3xl border border-teal-200 bg-white shadow-sm">
        <summary className="cursor-pointer list-none px-6 py-5"><p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Create</p><h2 className="font-display mt-2 text-xl">+ Add one question</h2><p className="mt-1 text-sm text-slate-600">Classify and enter one reusable question manually.</p></summary>
        <div className="border-t px-4 pb-7 sm:px-7"><CreateQuestionForm categories={categoryOptions} exams={examOptions} specializations={specializationOptions} papers={paperOptions} subjects={subjectOptions} /></div>
      </details>

      <details id="import-questions" className="mt-6 scroll-mt-24 overflow-hidden rounded-3xl border border-teal-200 bg-white shadow-sm">
        <summary className="cursor-pointer list-none px-6 py-5"><p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Bulk import</p><h2 className="font-display mt-2 text-xl">+ Import Excel or CSV</h2><p className="mt-1 text-sm text-slate-600">Upload up to 500 checked questions for one Paper.</p></summary>
        <div className="border-t px-4 pb-7 sm:px-7"><QuestionCsvImport categories={categoryOptions} exams={examOptions} specializations={specializationOptions} papers={paperOptions} /></div>
      </details>
    </main>
  );
}
