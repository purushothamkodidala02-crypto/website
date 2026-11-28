import Link from "next/link";
import { notFound } from "next/navigation";
import { EntitySeoForm } from "@/components/admin/EntitySeoForm";
import { mockTestPreviewHref, mockTestQuestionsHref, mockTestsListReturnTo } from "@/lib/admin/mock-test-navigation";
import { studentFacingMockTestTitle } from "@/lib/exam-catalog";
import { buildPaperDisplayMap, type OrderedPaper } from "@/lib/papers";
import { createClient } from "@/lib/supabase/server";
import type { MockTest } from "@/types/mock-test";
import { EditMockTestForm } from "./EditMockTestForm";

import { BackButton } from "@/components/admin/BackButton";

export default async function EditMockTestPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ returnTo?: string | string[] }> }) {
  const { id } = await params;
  const { returnTo } = await searchParams;
  const backHref = mockTestsListReturnTo(returnTo);
  const supabase = await createClient();
  const [testResult, subjectsResult, papersResult, groupsResult, categoriesResult, specializationsResult, sectionsResult] = await Promise.all([
    supabase.from("mock_tests").select("id, paper_id, subject_id, subject_section_id, test_scope, series_number, title, slug, description, seo_title, seo_description, instructions, duration_minutes, target_question_count, difficulty, status, version, display_order, published_at, access_type, price_inr, pdf_url, allow_duplicate_questions, created_at, updated_at").eq("id", id).maybeSingle(),
    supabase.from("subjects").select("id, paper_id, name").order("display_order"),
    supabase.from("papers").select("id, exam_group_id, specialization_id, name, duration_minutes, display_order"),
    supabase.from("exam_groups").select("id, exam_id, name"),
    supabase.from("exams").select("id, name"),
    supabase.from("exam_specializations").select("id, name"),
    supabase.from("subject_sections").select("id, subject_id, name, slug").order("display_order"),
  ]);
  if (!testResult.data) notFound();
  const test = testResult.data as MockTest;
  const papers = papersResult.data ?? [];
  const sections = sectionsResult.data ?? [];
  const groups = new Map((groupsResult.data ?? []).map((item) => [item.id, item]));
  const categories = new Map((categoriesResult.data ?? []).map((item) => [item.id, item.name]));
  const specializations = new Map((specializationsResult.data ?? []).map((item) => [item.id, item.name]));
  const selectedPaper = papers.find((paper) => paper.id === test.paper_id);
  const selectedExam = selectedPaper ? groups.get(selectedPaper.exam_group_id) : undefined;
  const selectedSubject = test.subject_id ? (subjectsResult.data ?? []).find((subject) => subject.id === test.subject_id) : undefined;
  const selectedSection = test.subject_section_id ? sections.find((sec) => sec.id === test.subject_section_id) : undefined;
  const paperDisplayById = buildPaperDisplayMap(papers as OrderedPaper[]);
  const studentTitle = selectedPaper && selectedExam
    ? studentFacingMockTestTitle({ examName: selectedExam.name, paperLabel: paperDisplayById.get(selectedPaper.id)?.shortLabel ?? selectedPaper.name, seriesNumber: Number(test.series_number ?? 1), subjectName: selectedSubject?.name ?? null, sectionName: selectedSection?.name ?? null })
    : test.title;

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <BackButton fallbackHref={backHref} label="← Back to Mock Tests" className="text-sm font-semibold text-teal-800 hover:underline" />
      <div className="flex flex-wrap items-center gap-2">
        <Link href={mockTestPreviewHref(test.id, backHref)} prefetch={false} className="rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2 text-xs sm:text-sm font-bold text-teal-900 hover:bg-teal-100 transition">Student Preview</Link>
        <Link href={mockTestQuestionsHref(test.id, backHref)} prefetch={false} className="rounded-xl bg-slate-950 px-3.5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 transition">Manage Questions</Link>
      </div>
    </div>
    <div className="border-b border-slate-200/80 pb-4">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">Mock Test Settings</h1>
      <p className="mt-1 text-sm text-slate-600">Edit the mock test details here. Use Manage Questions for file import, editing, and removal.</p>
    </div>
    <EditMockTestForm mockTest={test} studentTitle={studentTitle} papers={papers.map((paper) => { const group = groups.get(paper.exam_group_id); return { id: paper.id, label: `${categories.get(group?.exam_id ?? "") ?? "Unknown Recruiting Board"} → ${group?.name ?? "Unknown Exam"}${paper.specialization_id ? ` → ${specializations.get(paper.specialization_id) ?? "Unknown Specialisation"}` : ""} → ${paper.name}`, duration: paper.duration_minutes }; })} subjects={(subjectsResult.data ?? []).map((subject) => ({ id: subject.id, paperId: subject.paper_id, name: subject.name }))} sections={sections.map((s) => ({ id: s.id, subjectId: s.subject_id, name: s.name, slug: s.slug }))} />
    <EntitySeoForm entityType="mock_test" entityId={test.id} title={test.seo_title} description={test.seo_description} titlePlaceholder={test.title} descriptionPlaceholder={test.description ?? "Take this free timed mock test with detailed result review."} />
  </div>;
}
