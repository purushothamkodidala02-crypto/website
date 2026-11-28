import { createClient } from "@/lib/supabase/server";
import { ExamStructureWorkspace } from "./ExamStructureWorkspace";

export default async function AdminExamStructurePage({
  searchParams,
}: {
  searchParams?: Promise<{ state?: string; board?: string; q?: string }>;
}) {
  const query = searchParams ? await searchParams : {};
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
    <div className="space-y-4">
      {errors.length > 0 && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800">
          Some Exam Catalogue data could not be loaded: {errors[0]?.message}
        </div>
      )}

      <ExamStructureWorkspace
        initialStateSlug={query.state}
        initialBoardSlug={query.board}
        initialSearch={query.q}
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
    </div>
  );
}
