import Link from "next/link";
import { notFound } from "next/navigation";
import { EditQuestionForm } from "@/app/admin/questions/[id]/edit/EditQuestionForm";
import { createClient } from "@/lib/supabase/server";
import type { Question } from "@/types/question";
import type { SubjectContentLanguageMode } from "@/types/subject";
import { isMockTestPreviewHref, listReturnToFromMockTestPreview, mockTestQuestionsHref, mockTestsListReturnTo } from "@/lib/admin/mock-test-navigation";

export default async function EditMockTestQuestionPage({ params, searchParams }: { params: Promise<{ id: string; questionId: string }>; searchParams: Promise<{ returnTo?: string | string[] }> }) {
  const { id: mockTestId, questionId } = await params;
  const { returnTo } = await searchParams;
  const supabase = await createClient();
  const [mockTestResult, assignmentResult, questionResult, subjectsResult, papersResult, groupsResult, categoriesResult, attemptsResult] = await Promise.all([
    supabase.from("mock_tests").select("id, title, status").eq("id", mockTestId).maybeSingle(),
    supabase.from("mock_test_questions").select("id").eq("mock_test_id", mockTestId).eq("question_id", questionId).maybeSingle(),
    supabase.from("questions").select("id, subject_id, question_text, question_type, option_a, option_b, option_c, option_d, question_text_te, option_a_te, option_b_te, option_c_te, option_d_te, correct_answer, explanation, explanation_te, difficulty, image_url, source_reference, is_active, content_lifecycle, review_on, expires_on, created_at, updated_at").eq("id", questionId).maybeSingle(),
    supabase.from("subjects").select("id, paper_id, name, content_language_mode").order("display_order"),
    supabase.from("papers").select("id, exam_group_id, name"),
    supabase.from("exam_groups").select("id, exam_id, name"),
    supabase.from("exams").select("id, name"),
    supabase.from("test_attempts").select("id", { count: "exact", head: true }).eq("mock_test_id", mockTestId),
  ]);
  if (!mockTestResult.data || !assignmentResult.data || !questionResult.data) notFound();
  const isDraft = mockTestResult.data.status === "draft";
  const hasAttempts = (attemptsResult.count ?? 0) > 0 || !isDraft;
  const papers = new Map((papersResult.data ?? []).map((item) => [item.id, item]));
  const groups = new Map((groupsResult.data ?? []).map((item) => [item.id, item]));
  const categories = new Map((categoriesResult.data ?? []).map((item) => [item.id, item]));
  const subjects = (subjectsResult.data ?? []).map((subject) => {
    const paper = papers.get(subject.paper_id);
    const group = paper ? groups.get(paper.exam_group_id) : undefined;
    const category = group ? categories.get(group.exam_id) : undefined;
    return { id: subject.id, contentLanguageMode: subject.content_language_mode as SubjectContentLanguageMode, label: `${category?.name ?? "Unknown Recruiting Board"} → ${group?.name ?? "Unknown Exam"} → ${paper?.name ?? "Unknown Paper"} → ${subject.name}` };
  });
  const returningToPreview = isMockTestPreviewHref(returnTo, mockTestId);
  const mockTestsPath = returningToPreview ? listReturnToFromMockTestPreview(returnTo) : mockTestsListReturnTo(returnTo);
  const questionsPath = mockTestQuestionsHref(mockTestId, mockTestsPath);
  const backHref = returningToPreview && typeof returnTo === "string" ? returnTo : questionsPath;
  return <main>
    <Link href={backHref} className="text-sm font-semibold text-teal-700 hover:underline">← Back to {returningToPreview ? "Student Preview" : `${mockTestResult.data.title} Questions`}</Link>
    <h1 className="mt-5 text-3xl font-black">Edit question in this mock test</h1>
    <p className="mt-2 text-slate-600">This edit applies to this mock test and synchronizes to student attempt reviews.</p>
    {!isDraft && (
      <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm leading-6 text-sky-950 font-medium">
        <span className="font-bold">Live Mock Test Rectification: </span>
        This mock test is published. You can add diagram images, fix typos, and enrich explanations. Your changes will safely update the question and reflect in both student attempt reviews and future attempts.
      </div>
    )}
    <EditQuestionForm question={questionResult.data as Question} subjects={subjects} mockTestId={mockTestId} hasAttempts={hasAttempts} />
  </main>;
}
