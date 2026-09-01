import Link from "next/link";
import { notFound } from "next/navigation";
import { EntitySeoForm } from "@/components/admin/EntitySeoForm";
import { mockTestPreviewHref, mockTestQuestionsHref, mockTestsListReturnTo } from "@/lib/admin/mock-test-navigation";
import { studentFacingMockTestTitle } from "@/lib/exam-catalog";
import { buildPaperDisplayMap, type OrderedPaper } from "@/lib/papers";
import { createClient } from "@/lib/supabase/server";
import type { MockTest } from "@/types/mock-test";
import { EditMockTestForm } from "./EditMockTestForm";

export default async function EditMockTestPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ returnTo?: string | string[] }> }) {
  const { id } = await params;
  const { returnTo } = await searchParams;
  const backHref = mockTestsListReturnTo(returnTo);
  const supabase = await createClient();
  const [testResult, subjectsResult, papersResult, groupsResult, categoriesResult, specializationsResult] = await Promise.all([
    supabase.from("mock_tests").select("id, paper_id, subject_id, test_scope, series_number, title, slug, description, seo_title, seo_description, instructions, duration_minutes, target_question_count, difficulty, status, version, display_order, published_at, access_type, price_inr, created_at, updated_at").eq("id", id).maybeSingle(),
    supabase.from("subjects").select("id, paper_id, name").order("display_order"),
    supabase.from("papers").select("id, exam_group_id, specialization_id, name, duration_minutes, display_order"),
    supabase.from("exam_groups").select("id, exam_id, name"),
    supabase.from("exams").select("id, name"),
    supabase.from("exam_specializations").select("id, name"),
  ]);
  if (!testResult.data) notFound();
  const test = testResult.data as MockTest;
  const papers = papersResult.data ?? [];
  const groups = new Map((groupsResult.data ?? []).map((item) => [item.id, item]));
  const categories = new Map((categoriesResult.data ?? []).map((item) => [item.id, item]));
  const specializations = new Map((specializationsResult.data ?? []).map((item) => [item.id, item.name]));
  const selectedPaper = papers.find((paper) => paper.id === test.paper_id);
  const selectedExam = selectedPaper ? groups.get(selectedPaper.exam_group_id) : undefined;
  const selectedSubject = test.subject_id ? (subjectsResult.data ?? []).find((subject) => subject.id === test.subject_id) : undefined;
  const paperDisplayById = buildPaperDisplayMap(papers as OrderedPaper[]);
  const studentTitle = selectedPaper && selectedExam
    ? studentFacingMockTestTitle({ examName: selectedExam.name, paperLabel: paperDisplayById.get(selectedPaper.id)?.shortLabel ?? selectedPaper.name, seriesNumber: Number(test.series_number ?? 1), subjectName: selectedSubject?.name ?? null })
    : test.title;

  return <main>
    <div className="mb-4 flex justify-end"><Link href={mockTestPreviewHref(test.id, backHref)} className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-900 hover:bg-teal-100">Student Preview</Link></div>
    <div className="flex flex-wrap items-center justify-between gap-3"><Link href={backHref} className="text-sm font-semibold text-teal-700 hover:underline">← Back to Mock Tests</Link><Link href={mockTestQuestionsHref(test.id, backHref)} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800">Manage Questions</Link></div>
    <h1 className="mt-5 text-3xl font-black">Mock Test Settings</h1>
    <p className="mt-2 text-slate-600">Edit the mock test details here. Use Manage Questions for this test&apos;s Excel upload, individual questions, editing, and removal.</p>
    <EditMockTestForm mockTest={test} studentTitle={studentTitle} papers={papers.map((paper) => { const group = groups.get(paper.exam_group_id); return { id: paper.id, label: `${categories.get(group?.exam_id ?? "")?.name ?? "Unknown Recruiting Board"} → ${group?.name ?? "Unknown Exam"}${paper.specialization_id ? ` → ${specializations.get(paper.specialization_id) ?? "Unknown Specialisation"}` : ""} → ${paper.name}`, duration: paper.duration_minutes }; })} subjects={(subjectsResult.data ?? []).map((subject) => ({ id: subject.id, paperId: subject.paper_id, name: subject.name }))} />
    <EntitySeoForm entityType="mock_test" entityId={test.id} title={test.seo_title} description={test.seo_description} titlePlaceholder={test.title} descriptionPlaceholder={test.description ?? "Take this free timed mock test with detailed result review."} />
  </main>;
}
