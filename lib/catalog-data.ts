import "server-only";

import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export const PUBLIC_CATALOG_TAG = "public-catalog";

function hasCatalogSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export const getHomeCatalogData = unstable_cache(
  async () => {
    if (!hasCatalogSupabaseEnv()) {
      return {
        states: [],
        categories: [],
        exams: [],
        papers: [],
        tests: [],
        hasStateError: true,
      };
    }

    const supabase = createAdminClient();
    const [statesResult, categoriesResult, examsResult, papersResult, testsResult] =
      await Promise.all([
        supabase.from("exam_states").select("id, name, code, slug, description, seo_title, seo_description, display_order, is_active").order("display_order"),
        supabase.from("exams").select("id, state_id, name, slug, is_active").order("display_order"),
        supabase.from("exam_groups").select("id, exam_id, name, slug, is_active").order("display_order"),
        supabase.from("papers").select("id, exam_group_id, is_active"),
        supabase.from("mock_tests").select("id, paper_id").eq("status", "published"),
      ]);

    const allStates = statesResult.data ?? [];
    const allCategories = categoriesResult.data ?? [];
    const allExams = examsResult.data ?? [];
    const allPapers = papersResult.data ?? [];
    const tests = testsResult.data ?? [];
    const publishedPaperIds = new Set(tests.map((test) => test.paper_id));
    const publishedExamIds = new Set(allPapers.filter((paper) => publishedPaperIds.has(paper.id)).map((paper) => paper.exam_group_id));
    const publishedCategoryIds = new Set(allExams.filter((exam) => publishedExamIds.has(exam.id)).map((exam) => exam.exam_id));
    const publishedStateIds = new Set(allCategories.filter((category) => publishedCategoryIds.has(category.id)).map((category) => category.state_id));

    return {
      states: allStates.filter((state) => state.is_active || publishedStateIds.has(state.id)),
      categories: allCategories.filter((category) => category.is_active || publishedCategoryIds.has(category.id)),
      exams: allExams.filter((exam) => exam.is_active || publishedExamIds.has(exam.id)),
      papers: allPapers.filter((paper) => paper.is_active || publishedPaperIds.has(paper.id)),
      tests,
      hasStateError: Boolean(statesResult.error),
    };
  },
  ["home-catalog-v3"],
  { tags: [PUBLIC_CATALOG_TAG], revalidate: 300 },
);

export const getMockTestCatalogData = unstable_cache(
  async () => {
    if (!hasCatalogSupabaseEnv()) {
      return {
        states: [],
        categories: [],
        exams: [],
        specializations: [],
        papers: [],
        subjects: [],
        tests: [],
        stats: [],
        hasError: true,
        hasSupplementaryError: true,
      };
    }

    const supabase = createAdminClient();
    const [statesResult, categoriesResult, examsResult, specializationsResult, papersResult, subjectsResult, testsResult, statsResult] = await Promise.all([
      supabase.from("exam_states").select("id, name, code, slug, description, seo_title, seo_description, display_order, is_active").order("display_order"),
      supabase.from("exams").select("id, state_id, name, slug, seo_title, seo_description, is_active").order("display_order"),
      supabase.from("exam_groups").select("id, exam_id, name, slug, description, seo_title, seo_description, is_active").order("display_order"),
      supabase.from("exam_specializations").select("id, exam_group_id, name, slug, description, seo_title, seo_description, is_active").order("display_order"),
      supabase.from("papers").select("id, exam_group_id, specialization_id, name, slug, description, seo_title, seo_description, display_order, question_count, default_correct_marks, is_active").order("display_order"),
      supabase.from("subjects").select("id, paper_id, name, slug, description, seo_title, seo_description, is_active").order("display_order"),
      supabase.from("mock_tests").select("id, paper_id, subject_id, test_scope, series_number, title, slug, description, seo_title, seo_description, duration_minutes, target_question_count, access_type, updated_at").eq("status", "published").order("series_number"),
      supabase.rpc("get_published_mock_test_stats"),
    ]);

    const allStates = statesResult.data ?? [];
    const allCategories = categoriesResult.data ?? [];
    const allExams = examsResult.data ?? [];
    const allSpecializations = specializationsResult.data ?? [];
    const allPapers = papersResult.data ?? [];
    const allSubjects = subjectsResult.data ?? [];
    const tests = testsResult.data ?? [];
    const publishedPaperIds = new Set(tests.map((test) => test.paper_id));
    const publishedSubjectIds = new Set(tests.map((test) => test.subject_id).filter((id): id is string => Boolean(id)));
    const testPapers = allPapers.filter((paper) => publishedPaperIds.has(paper.id));
    const publishedExamIds = new Set(testPapers.map((paper) => paper.exam_group_id));
    const publishedSpecializationIds = new Set(testPapers.map((paper) => paper.specialization_id).filter((id): id is string => Boolean(id)));
    const publishedCategoryIds = new Set(allExams.filter((exam) => publishedExamIds.has(exam.id)).map((exam) => exam.exam_id));
    const publishedStateIds = new Set(allCategories.filter((category) => publishedCategoryIds.has(category.id)).map((category) => category.state_id));

    return {
      states: allStates.filter((state) => state.is_active || publishedStateIds.has(state.id)),
      categories: allCategories.filter((category) => category.is_active || publishedCategoryIds.has(category.id)),
      exams: allExams.filter((exam) => exam.is_active || publishedExamIds.has(exam.id)),
      specializations: allSpecializations.filter((specialization) => specialization.is_active || publishedSpecializationIds.has(specialization.id)),
      papers: allPapers.filter((paper) => paper.is_active || publishedPaperIds.has(paper.id)),
      subjects: allSubjects.filter((subject) => subject.is_active || publishedSubjectIds.has(subject.id)),
      tests,
      stats: statsResult.data ?? [],
      hasError: Boolean(
        statesResult.error ||
          categoriesResult.error ||
          examsResult.error ||
          papersResult.error ||
          subjectsResult.error ||
          testsResult.error,
      ),
      hasSupplementaryError: Boolean(specializationsResult.error || statsResult.error),
    };
  },
  ["mock-test-catalog-v6"],
  { tags: [PUBLIC_CATALOG_TAG], revalidate: 300 },
);
