import { createClient } from "@/lib/supabase/server";
import { ExamStructureWorkspace } from "./ExamStructureWorkspace";

function MetricPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-16 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-center shadow-xs">
      <strong className="block text-base font-bold tracking-tight text-slate-900">{value}</strong>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
    </div>
  );
}

export default async function AdminExamStructurePage() {
  const supabase = await createClient();
  const [
    statesResult,
    categoriesResult,
    examsResult,
    specializationsResult,
    papersResult,
    subjectsResult,
  ] = await Promise.all([
    supabase
      .from("exam_states")
      .select("id, name, code, slug, description, seo_title, seo_description, is_active, display_order")
      .order("display_order")
      .order("name"),
    supabase
      .from("exams")
      .select("id, state_id, name, slug, is_active, display_order")
      .order("display_order")
      .order("name"),
    supabase
      .from("exam_groups")
      .select("id, exam_id, name, slug, is_active, display_order")
      .order("display_order")
      .order("name"),
    supabase
      .from("exam_specializations")
      .select("id, exam_group_id, name, is_active, display_order")
      .order("display_order")
      .order("name"),
    supabase
      .from("papers")
      .select("id, exam_group_id, specialization_id, name, is_active, display_order")
      .order("display_order")
      .order("name"),
    supabase
      .from("subjects")
      .select("id, paper_id, name, is_active, display_order")
      .order("display_order")
      .order("name"),
  ]);

  const errors = [
    statesResult.error,
    categoriesResult.error,
    examsResult.error,
    specializationsResult.error,
    papersResult.error,
    subjectsResult.error,
  ].filter(Boolean);
  const categories = categoriesResult.data ?? [];
  const states = statesResult.data ?? [];
  const exams = examsResult.data ?? [];
  const papers = papersResult.data ?? [];
  const subjects = subjectsResult.data ?? [];

  return (
    <main className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-600" />
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-800">
              Exam Catalogue & Content Architecture
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Exam Structure & Catalogue
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-600">
            Configure the educational taxonomy across States, Recruiting Boards, Exams, Specialisations, Papers, and Subject display hierarchies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MetricPill value={states.length} label="States" />
          <MetricPill value={categories.length} label="Boards" />
          <MetricPill value={exams.length} label="Exams" />
          <MetricPill value={papers.length} label="Papers" />
          <MetricPill value={subjects.length} label="Subjects" />
        </div>
      </div>

      {errors.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
          Some Exam Structure data could not be loaded: {errors[0]?.message}
        </div>
      )}

      <ExamStructureWorkspace
        states={states.map((state) => ({
          id: state.id,
          name: state.name,
          code: state.code,
          slug: state.slug,
          description: state.description,
          seoTitle: state.seo_title,
          seoDescription: state.seo_description,
          isActive: state.is_active,
          displayOrder: state.display_order,
        }))}
        categories={categories.map((category) => ({
          id: category.id,
          stateId: category.state_id,
          name: category.name,
          slug: category.slug,
          isActive: category.is_active,
          displayOrder: category.display_order,
        }))}
        exams={exams.map((exam) => ({
          id: exam.id,
          categoryId: exam.exam_id,
          name: exam.name,
          slug: exam.slug,
          isActive: exam.is_active,
          displayOrder: exam.display_order,
        }))}
        specializations={(specializationsResult.data ?? []).map((item) => ({
          id: item.id,
          examId: item.exam_group_id,
          name: item.name,
          isActive: item.is_active,
        }))}
        papers={papers.map((paper) => ({
          id: paper.id,
          examId: paper.exam_group_id,
          specializationId: paper.specialization_id,
          name: paper.name,
          isActive: paper.is_active,
        }))}
        subjects={subjects.map((subject) => ({
          id: subject.id,
          paperId: subject.paper_id,
          name: subject.name,
          isActive: subject.is_active,
          displayOrder: subject.display_order,
        }))}
      />
    </main>
  );
}
