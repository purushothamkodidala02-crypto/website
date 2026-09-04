import { createClient } from "@/lib/supabase/server";
import { ExamStructureWorkspace } from "./ExamStructureWorkspace";

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
      <section className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 p-6 text-white shadow-xl shadow-slate-950/10 sm:p-7">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-teal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              Catalogue Manager
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl text-white">
              Exam Structure & Catalogue
            </h1>
            <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Manage State workspaces, Recruiting Boards, Exams, Specialisations, Papers, and Subject display orders.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SummaryCount value={states.length} label="States" tone="teal" />
            <SummaryCount value={categories.length} label="Boards" tone="amber" />
            <SummaryCount value={exams.length} label="Exams" tone="slate" />
            <SummaryCount value={papers.length} label="Papers" tone="slate" />
            <SummaryCount value={subjects.length} label="Subjects" tone="teal" />
          </div>
        </div>
      </section>

      {errors.length > 0 && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Some Exam Structure data could not be loaded. {errors[0]?.message}
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

function SummaryCount({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "teal" | "amber" | "slate";
}) {
  const styles = {
    teal: "bg-teal-400/10 text-teal-200 border-teal-400/20",
    amber: "bg-amber-400/10 text-amber-200 border-amber-400/20",
    slate: "bg-white/5 text-slate-300 border-white/10",
  };
  return (
    <div className={`min-w-16 rounded-xl border px-3 py-1.5 text-center ${styles[tone]}`}>
      <strong className="block text-base font-black text-white">{value}</strong>
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{label}</span>
    </div>
  );
}
