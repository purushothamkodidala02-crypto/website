import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { indiaDateKey } from "@/lib/date";
import { DownloadQuestionsButton } from "../../DownloadQuestionsButton";
import { MockTestCsvImport } from "../edit/MockTestCsvImport";
import { QuestionAssignments } from "../edit/QuestionAssignments";
import { mockTestPreviewHref, mockTestsListReturnTo } from "@/lib/admin/mock-test-navigation";

export default async function MockTestQuestionsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ returnTo?: string | string[] }> }) {
  const { id } = await params;
  const { returnTo } = await searchParams;
  const supabase = await createClient();
  const db = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase;

  const [testResult, papersResult, subjectsResult, assignmentsResult] = await Promise.all([
    db.from("mock_tests").select("id, paper_id, subject_id, test_scope, title, status, target_question_count").eq("id", id).maybeSingle(),
    db.from("papers").select("id, name, default_correct_marks, default_negative_marks"),
    db.from("subjects").select("id, paper_id, name, display_order"),
    db.from("mock_test_questions").select("id, question_id, question_order, marks, negative_marks").eq("mock_test_id", id).order("question_order"),
  ]);
  if (!testResult.data) notFound();
  const test = testResult.data;
  const assignmentRows = assignmentsResult.data ?? [];
  const questionIds = [...new Set(assignmentRows.map((item) => item.question_id))];

  // Batch query questions in chunks of 40 to avoid URL query string limits on 150-question AEE tests
  const questionsData: Array<{ id: string; subject_id: string; question_text: string; is_active: boolean; expires_on: string | null }> = [];
  if (questionIds.length > 0) {
    if (questionIds.length <= 40) {
      const res = await db
        .from("questions")
        .select("id, subject_id, question_text, is_active, expires_on")
        .in("id", questionIds);
      if (res.data) questionsData.push(...res.data);
    } else {
      const chunkSize = 40;
      for (let i = 0; i < questionIds.length; i += chunkSize) {
        const chunk = questionIds.slice(i, i + chunkSize);
        const res = await db
          .from("questions")
          .select("id, subject_id, question_text, is_active, expires_on")
          .in("id", chunk);
        if (res.data) questionsData.push(...res.data);
      }
    }
  }

  const paper = (papersResult.data ?? []).find((item) => item.id === test.paper_id);
  const subjects = subjectsResult.data ?? [];
  const questionById = new Map(questionsData.map((item) => [item.id, item]));
  const today = indiaDateKey();
  const subjectDisplayOrder = new Map(subjects.map((s) => [s.id, Number(s.display_order ?? 999)]));
  const assignments = assignmentRows.map((item) => {
    const question = questionById.get(item.question_id);
    const m = Number(item.marks);
    const nm = Number(item.negative_marks);
    const marksVal = Number.isFinite(m) ? m : 1;
    const negMarksVal = Number.isFinite(nm) ? nm : 0;
    return {
      ...item,
      marks: marksVal,
      negative_marks: negMarksVal,
      subject_id: question?.subject_id,
      question_text: question?.question_text ?? "Question unavailable",
      is_active: Boolean(
        question?.is_active && (!question.expires_on || question.expires_on >= today),
      ),
      is_score_valid: marksVal > 0 && negMarksVal >= 0,
    };
  }).sort((a, b) => {
    const orderA = subjectDisplayOrder.get(a.subject_id ?? "") ?? 999;
    const orderB = subjectDisplayOrder.get(b.subject_id ?? "") ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.question_order - b.question_order;
  });
  const subjectName = test.subject_id ? subjects.find((item) => item.id === test.subject_id)?.name ?? null : null;
  const mockTestsPath = mockTestsListReturnTo(returnTo);
  const questionsPath = `/admin/mock-tests/${test.id}/questions`;
  const settingsPath = `/admin/mock-tests/${test.id}/edit?returnTo=${encodeURIComponent(mockTestsPath)}`;
  const previewPath = mockTestPreviewHref(test.id, mockTestsPath);

  return <main>
    {assignments.length > 0 && <div className="mb-4 flex justify-end"><Link href={previewPath} className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-900 hover:bg-teal-100">Student Preview</Link></div>}
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3 text-sm font-semibold">
        <Link href={mockTestsPath} className="text-teal-700 hover:underline">
          ← Back to Mock Tests
        </Link>
        <span className="text-slate-300" aria-hidden="true">·</span>
        <Link href={settingsPath} className="text-slate-600 hover:text-teal-700 hover:underline">
          Mock Test Settings
        </Link>
      </div>
      {assignments.length > 0 && <DownloadQuestionsButton mockTestId={test.id} />}
    </div>
    <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-teal-700">{paper?.name ?? "Mock test"}{subjectName ? ` · ${subjectName}` : ""}</p>
    <h1 className="mt-2 text-3xl font-black">{test.title}: Questions</h1>
    <p className="mt-2 max-w-3xl text-slate-600">Manage only this mock test&apos;s questions. Upload a file, add one question, edit a question, remove it, or replace the full draft.</p>
    <MockTestCsvImport mockTestId={test.id} isDraft={test.status === "draft"} targetQuestionCount={test.target_question_count} assignedQuestionCount={assignments.length} paperName={paper?.name ?? "this Paper"} subjectName={subjectName} />
    <QuestionAssignments mockTestId={test.id} isDraft={test.status === "draft"} targetQuestionCount={test.target_question_count} assignedQuestions={assignments} questionsPath={questionsPath} returnTo={mockTestsPath} />
  </main>;
}
