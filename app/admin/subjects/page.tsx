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
    <main>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Exam catalogue &amp; curriculum</p>
        <h1 className="mt-2 text-3xl font-black">Subjects &amp; Syllabus Curriculum</h1>
        <p className="mt-2 text-slate-600">
          Choose the Recruiting Board, Exam, optional Specialisation, and Paper before adding its Subjects.
        </p>
      </div>
      <div className="mt-4 rounded-2xl border border-teal-200/80 bg-teal-50/70 p-4 text-xs text-teal-950 sm:text-sm shadow-xs">
        <p className="font-bold flex items-center gap-1.5">
          <span aria-hidden="true">💡</span> How Syllabus is generated automatically:
        </p>
        <p className="mt-1 leading-relaxed text-slate-700">
          You don&apos;t have to manually write syllabus text. Adding Papers and Subjects here automatically builds the official Exam Pattern, Paper Distribution, and Curriculum Units on the student syllabus page. You can add topics/months inside any subject by clicking <strong>Edit subject</strong>.
        </p>
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
    </main>
  );
}
