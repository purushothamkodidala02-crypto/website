import { createClient } from "@/lib/supabase/server";
import { SubjectsWorkspace } from "./SubjectsWorkspace";

export default async function SubjectsPage({ searchParams }: { searchParams: Promise<{ category?: string; exam?: string; specialization?: string; paper?: string }> }) {
  const selected = await searchParams;
  const supabase = await createClient();
  const [subjectsResult, papersResult, groupsResult, categoriesResult, specializationsResult] = await Promise.all([
    supabase.from("subjects").select("id, paper_id, name, slug, content_language_mode, is_active, display_order").order("display_order"),
    supabase.from("papers").select("id, exam_group_id, specialization_id, name, display_order").order("display_order"),
    supabase.from("exam_groups").select("id, exam_id, name").order("display_order"),
    supabase.from("exams").select("id, name").order("display_order"),
    supabase.from("exam_specializations").select("id, exam_group_id, name").order("display_order"),
  ]);
  const categories = categoriesResult.data ?? [];
  const exams = groupsResult.data ?? [];
  const papers = papersResult.data ?? [];
  const specializations = specializationsResult.data ?? [];
  const subjects = subjectsResult.data ?? [];
  const initialLocation = { categoryId: selected.category ?? "", examId: selected.exam ?? "", specializationId: selected.specialization ?? "", paperId: selected.paper ?? "" };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-800">Exam catalogue &amp; curriculum</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Subjects &amp; Syllabus Curriculum</h1>
          <p className="mt-1 text-sm text-slate-600">
            Select a Board, Exam, optional Specialisation, and Paper to manage its subjects.
          </p>
        </div>
        <details className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-700 shadow-2xs max-w-md">
          <summary className="cursor-pointer font-semibold text-teal-900 select-none">
            How Syllabus is generated automatically
          </summary>
          <p className="mt-2 leading-relaxed text-slate-600">
            Adding Papers and Subjects here builds the Exam Pattern, Paper Distribution, and Curriculum Units on student syllabus pages. Use <strong>Edit subject</strong> to add topics or modules inside any subject.
          </p>
        </details>
      </div>
      <SubjectsWorkspace
        categories={categories}
        exams={exams}
        specializations={specializations.map((item) => ({ id: item.id, examId: item.exam_group_id, name: item.name }))}
        papers={papers}
        subjects={subjects.map((subject) => ({
          id: subject.id,
          paperId: subject.paper_id,
          name: subject.name,
          slug: subject.slug,
          contentLanguageMode: subject.content_language_mode,
          isActive: subject.is_active,
          displayOrder: subject.display_order,
        }))}
        initialLocation={initialLocation}
      />
      {subjectsResult.error && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{subjectsResult.error.message}</p>
      )}
    </div>
  );
}
