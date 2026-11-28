import { createClient } from "@/lib/supabase/server";
import { QuestionSimilarityScanner } from "../QuestionSimilarityScanner";

async function fetchAllAssignments(supabase: Awaited<ReturnType<typeof createClient>>) {
  const pageSize = 1000;
  const { count, error } = await supabase
    .from("mock_test_questions")
    .select("id", { count: "exact", head: true });

  if (error || !count || count === 0) return [];

  const total = count;
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages === 1) {
    const { data } = await supabase
      .from("mock_test_questions")
      .select("mock_test_id, question_id")
      .range(0, pageSize - 1);
    return data ?? [];
  }

  const chunkPromises = Array.from({ length: totalPages }, (_, i) => {
    const from = i * pageSize;
    return supabase
      .from("mock_test_questions")
      .select("mock_test_id, question_id")
      .range(from, from + pageSize - 1);
  });

  const results = await Promise.all(chunkPromises);
  const all: Array<{ mock_test_id: string; question_id: string }> = [];
  for (const res of results) {
    if (res.data) all.push(...res.data);
  }
  return all;
}

export default async function AdminSimilarityPage() {
  const supabase = await createClient();
  const [
    testsResult,
    allAssignments,
    papersResult,
    groupsResult,
    subjectsResult,
    specializationsResult,
  ] = await Promise.all([
    supabase
      .from("mock_tests")
      .select("id, title, status, updated_at, paper_id, subject_id, series_number")
      .order("updated_at", { ascending: false }),
    fetchAllAssignments(supabase),
    supabase.from("papers").select("id, exam_group_id, specialization_id, name, display_order"),
    supabase.from("exam_groups").select("id, name"),
    supabase.from("subjects").select("id, name"),
    supabase.from("exam_specializations").select("id, exam_group_id, name, slug"),
  ]);

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-200/80 pb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-800">
          Content Quality &amp; Exam Integrity
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Test Integrity &amp; Similarity Audit
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Audit mock tests for unintended repetition and safely resolve duplicate question bank items.
        </p>
      </div>

      <QuestionSimilarityScanner
        tests={testsResult.data ?? []}
        assignments={allAssignments}
        papers={papersResult.data ?? []}
        exams={groupsResult.data ?? []}
        specializations={specializationsResult.data ?? []}
        subjects={subjectsResult.data ?? []}
      />
    </div>
  );
}
