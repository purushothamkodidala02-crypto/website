import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { indiaDateKey } from "@/lib/date";
import { DownloadQuestionsButton } from "../../DownloadQuestionsButton";
import { MockTestCsvImport } from "../edit/MockTestCsvImport";
import { QuestionAssignments } from "../edit/QuestionAssignments";

export default async function MockTestQuestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [testResult, papersResult, subjectsResult, assignmentsResult] = await Promise.all([
    supabase.from("mock_tests").select("id, paper_id, subject_id, test_scope, title, status, target_question_count").eq("id", id).maybeSingle(),
    supabase.from("papers").select("id, name, default_correct_marks, default_negative_marks"),
    supabase.from("subjects").select("id, paper_id, name"),
    supabase.from("mock_test_questions").select("id, question_id, question_order, marks, negative_marks").eq("mock_test_id", id).order("question_order"),
  ]);
  if (!testResult.data) notFound();
  const test = testResult.data;
  const assignmentRows = assignmentsResult.data ?? [];
  const questionIds = [...new Set(assignmentRows.map((item) => item.question_id))];
  const questionsResult = questionIds.length
    ? await supabase.from("questions").select("id, question_text, is_active, expires_on").in("id", questionIds)
    : { data: [], error: null };
  if (assignmentsResult.error || questionsResult.error) {
    throw new Error("Assigned questions could not be loaded.");
  }
  const paper = (papersResult.data ?? []).find((item) => item.id === test.paper_id);
  const subjects = subjectsResult.data ?? [];
  const questionById = new Map((questionsResult.data ?? []).map((item) => [item.id, item]));
  const today = indiaDateKey();
  const assignments = assignmentRows.map((item) => {
    const question = questionById.get(item.question_id);
    return {
      ...item,
      question_text: question?.question_text ?? "Question unavailable",
      is_active: Boolean(
        question?.is_active && (!question.expires_on || question.expires_on >= today),
      ),
      is_score_valid: Number(item.marks) > 0 && Number(item.negative_marks) >= 0,
    };
  });
  const subjectName = test.subject_id ? subjects.find((item) => item.id === test.subject_id)?.name ?? null : null;
  const questionsPath = `/admin/mock-tests/${test.id}/questions`;

  return <main>
    <div className="flex flex-wrap items-center justify-between gap-3"><Link href={`/admin/mock-tests/${test.id}/edit`} className="text-sm font-semibold text-teal-700 hover:underline">← Back to Mock Test Settings</Link>{assignments.length > 0 && <DownloadQuestionsButton mockTestId={test.id} />}</div>
    <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-teal-700">{paper?.name ?? "Mock test"}{subjectName ? ` · ${subjectName}` : ""}</p>
    <h1 className="mt-2 text-3xl font-black">{test.title}: Questions</h1>
    <p className="mt-2 max-w-3xl text-slate-600">Manage only this mock test&apos;s questions. Upload a file, add one question, edit a question, remove it, or replace the full draft.</p>
    <MockTestCsvImport mockTestId={test.id} isDraft={test.status === "draft"} targetQuestionCount={test.target_question_count} assignedQuestionCount={assignments.length} paperName={paper?.name ?? "this Paper"} subjectName={subjectName} />
    <QuestionAssignments mockTestId={test.id} isDraft={test.status === "draft"} targetQuestionCount={test.target_question_count} assignedQuestions={assignments} questionsPath={questionsPath} />
  </main>;
}
