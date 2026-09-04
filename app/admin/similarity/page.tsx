import { createClient } from "@/lib/supabase/server";
import { QuestionSimilarityScanner } from "../QuestionSimilarityScanner";

export default async function AdminSimilarityPage() {
  const supabase = await createClient();
  const [
    testsResult,
    assignmentsResult,
    papersResult,
    groupsResult,
    subjectsResult,
    specializationsResult,
  ] = await Promise.all([
    supabase
      .from("mock_tests")
      .select("id, title, status, updated_at, paper_id, subject_id, series_number")
      .order("updated_at", { ascending: false }),
    supabase
      .from("mock_test_questions")
      .select("mock_test_id, question_id, marks, negative_marks"),
    supabase.from("papers").select("id, exam_group_id, specialization_id, name, display_order"),
    supabase.from("exam_groups").select("id, name"),
    supabase.from("subjects").select("id, name"),
    supabase.from("exam_specializations").select("id, exam_group_id, name, slug"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
            Exam Intelligence
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Question Similarity & Overlap Scanner
          </h1>
          <p className="mt-2 text-slate-600">
            Audit question overlaps across exams, specialisations (such as TG TET Paper 2), and subject practice tests with automated syllabus intent recognition.
          </p>
        </div>
      </div>

      <QuestionSimilarityScanner
        tests={testsResult.data ?? []}
        assignments={assignmentsResult.data ?? []}
        papers={papersResult.data ?? []}
        exams={groupsResult.data ?? []}
        specializations={specializationsResult.data ?? []}
        subjects={subjectsResult.data ?? []}
      />
    </div>
  );
}
