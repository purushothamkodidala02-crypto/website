import { safeRevalidateCatalogTag } from "@/lib/catalog-data";
import { buildMockTestTitle } from "@/lib/exam-catalog";
import type { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type SyncMockTestTitlesFilter = {
  subjectId?: string;
  subjectSectionId?: string;
  paperId?: string;
};

export async function syncMockTestTitles(
  supabase: ServerSupabaseClient,
  filter?: SyncMockTestTitlesFilter,
): Promise<{ updatedCount: number; totalChecked: number; error?: string }> {
  let testsQuery = supabase
    .from("mock_tests")
    .select("id, paper_id, subject_id, subject_section_id, series_number, title");

  if (filter?.subjectId) {
    testsQuery = testsQuery.eq("subject_id", filter.subjectId);
  }
  if (filter?.subjectSectionId) {
    testsQuery = testsQuery.eq("subject_section_id", filter.subjectSectionId);
  }
  if (filter?.paperId) {
    testsQuery = testsQuery.eq("paper_id", filter.paperId);
  }

  const { data: mockTests, error: fetchError } = await testsQuery;
  if (fetchError || !mockTests) {
    return {
      updatedCount: 0,
      totalChecked: 0,
      error: fetchError?.message ?? "Failed to fetch mock tests.",
    };
  }

  if (mockTests.length === 0) {
    safeRevalidateCatalogTag();
    return { updatedCount: 0, totalChecked: 0 };
  }

  const [papersRes, specializationsRes, examsRes, categoriesRes, statesRes, subjectsRes, sectionsRes] =
    await Promise.all([
      supabase.from("papers").select("id, exam_group_id, specialization_id, name"),
      supabase.from("exam_specializations").select("id, name"),
      supabase.from("exam_groups").select("id, exam_id, name"),
      supabase.from("exams").select("id, state_id, name"),
      supabase.from("exam_states").select("id, code"),
      supabase.from("subjects").select("id, name"),
      supabase.from("subject_sections").select("id, name"),
    ]);

  const paperMap = new Map((papersRes.data ?? []).map((p) => [p.id, p]));
  const specializationMap = new Map((specializationsRes.data ?? []).map((s) => [s.id, s]));
  const examMap = new Map((examsRes.data ?? []).map((e) => [e.id, e]));
  const categoryMap = new Map((categoriesRes.data ?? []).map((c) => [c.id, c]));
  const stateMap = new Map((statesRes.data ?? []).map((s) => [s.id, s]));
  const subjectMap = new Map((subjectsRes.data ?? []).map((sb) => [sb.id, sb]));
  const sectionMap = new Map((sectionsRes.data ?? []).map((sc) => [sc.id, sc]));

  let updatedCount = 0;
  for (const test of mockTests) {
    const paper = paperMap.get(test.paper_id);
    const exam = paper ? examMap.get(paper.exam_group_id) : undefined;
    const category = exam ? categoryMap.get(exam.exam_id) : undefined;
    const state = category ? stateMap.get(category.state_id) : undefined;
    const specialization = paper?.specialization_id ? specializationMap.get(paper.specialization_id) : undefined;
    const subject = test.subject_id ? subjectMap.get(test.subject_id) : undefined;
    const section = test.subject_section_id ? sectionMap.get(test.subject_section_id) : undefined;

    if (state && exam && paper) {
      const canonicalTitle = buildMockTestTitle({
        stateCode: state.code,
        examName: exam.name,
        paperName: specialization?.name ?? paper.name,
        subjectName: subject?.name,
        sectionName: section?.name,
        seriesNumber: Number(test.series_number ?? 1),
      });

      if (test.title !== canonicalTitle) {
        const { error: updateError } = await supabase
          .from("mock_tests")
          .update({ title: canonicalTitle })
          .eq("id", test.id);

        if (!updateError) {
          updatedCount += 1;
        }
      }
    }
  }

  safeRevalidateCatalogTag();
  return { updatedCount, totalChecked: mockTests.length };
}
