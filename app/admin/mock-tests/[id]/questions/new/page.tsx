import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateQuestionForm } from "@/app/admin/questions/CreateQuestionForm";
import type { SubjectContentLanguageMode } from "@/types/subject";
import { createClient } from "@/lib/supabase/server";

export default async function NewMockTestQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [mockTestResult, categoriesResult, examsResult, specializationsResult, papersResult, subjectsResult] = await Promise.all([
    supabase.from("mock_tests").select("id, paper_id, subject_id, test_scope, title").eq("id", id).maybeSingle(),
    supabase.from("exams").select("id, name"),
    supabase.from("exam_groups").select("id, exam_id, name"),
    supabase.from("exam_specializations").select("id, exam_group_id, name"),
    supabase.from("papers").select("id, exam_group_id, specialization_id, name"),
    supabase.from("subjects").select("id, paper_id, name, content_language_mode"),
  ]);
  if (!mockTestResult.data) notFound();
  const mockTest = mockTestResult.data;
  const questionsPath = `/admin/mock-tests/${id}/questions`;
  const papers = papersResult.data ?? [];
  const testPaper = papers.find((paper) => paper.id === mockTest.paper_id);
  const examGroup = testPaper ? (examsResult.data ?? []).find((group) => group.id === testPaper.exam_group_id) : null;

  return <main>
    <Link href={questionsPath} className="text-sm font-semibold text-teal-700 hover:underline">← Back to {mockTest.title} Questions</Link>
    <h1 className="mt-5 text-3xl font-black">Add question to this mock test</h1>
    <p className="mt-2 text-slate-600">This question is created and assigned only to {mockTest.title}.</p>
    <CreateQuestionForm
      categories={(categoriesResult.data ?? []).map((item) => ({ id: item.id, name: item.name }))}
      exams={(examsResult.data ?? []).map((item) => ({ id: item.id, categoryId: item.exam_id, name: item.name }))}
      specializations={(specializationsResult.data ?? []).map((item) => ({ id: item.id, examId: item.exam_group_id, name: item.name }))}
      papers={papers.map((item) => ({ id: item.id, examId: item.exam_group_id, specializationId: item.specialization_id, name: item.name }))}
      subjects={(subjectsResult.data ?? []).map((item) => ({ id: item.id, paperId: item.paper_id, name: item.name, contentLanguageMode: item.content_language_mode as SubjectContentLanguageMode }))}
      mockTest={{ id: mockTest.id, paperId: mockTest.paper_id, subjectId: mockTest.subject_id, testScope: mockTest.test_scope as "paper" | "subject", label: `${examGroup?.name ?? "Exam"} · ${testPaper?.name ?? "Paper"}${mockTest.subject_id ? ` · ${(subjectsResult.data ?? []).find((subject) => subject.id === mockTest.subject_id)?.name ?? "Subject"}` : ""}` }}
    />
  </main>;
}
