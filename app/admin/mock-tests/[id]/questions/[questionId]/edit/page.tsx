import { notFound, redirect } from "next/navigation";
import { EditQuestionForm } from "@/app/admin/questions/[id]/edit/EditQuestionForm";
import { getAdminTaxonomy } from "@/lib/admin/taxonomy";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { indiaDateKey } from "@/lib/date";
import type { Question, MockTestQuestionNav } from "@/types/question";
import type { SubjectContentLanguageMode } from "@/types/subject";
import {
  isMockTestPreviewHref,
  listReturnToFromMockTestPreview,
  mockTestPreviewHref,
  mockTestQuestionsHref,
  mockTestsListReturnTo,
} from "@/lib/admin/mock-test-navigation";

export default async function EditMockTestQuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; questionId: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const { id: mockTestId, questionId } = await params;
  const { returnTo } = await searchParams;
  const supabase = await createClient();
  const db = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase;

  const [
    mockTestResult,
    assignmentsResult,
    questionResult,
    attemptsResult,
    taxonomy,
  ] = await Promise.all([
    db
      .from("mock_tests")
      .select("id, title, status, paper_id, subject_id, test_scope")
      .eq("id", mockTestId)
      .maybeSingle(),
    db
      .from("mock_test_questions")
      .select("id, question_id, question_order, marks, negative_marks")
      .eq("mock_test_id", mockTestId)
      .order("question_order", { ascending: true }),
    db
      .from("questions")
      .select(
        "id, subject_id, question_text, question_type, option_a, option_b, option_c, option_d, question_text_te, option_a_te, option_b_te, option_c_te, option_d_te, correct_answer, explanation, explanation_te, difficulty, image_url, source_reference, is_active, content_lifecycle, review_on, expires_on, created_at, updated_at",
      )
      .eq("id", questionId)
      .maybeSingle(),
    db
      .from("test_attempts")
      .select("id", { count: "exact", head: true })
      .eq("mock_test_id", mockTestId),
    getAdminTaxonomy(),
  ]);

  const mockTest = mockTestResult.data;
  const question = questionResult.data;
  if (!mockTest || !question) {
    notFound();
  }

  const returningToPreview = isMockTestPreviewHref(returnTo, mockTestId);
  const mockTestsPath = returningToPreview
    ? listReturnToFromMockTestPreview(returnTo)
    : mockTestsListReturnTo(returnTo);
  const questionsPath = mockTestQuestionsHref(mockTestId, mockTestsPath);

  const assignments = assignmentsResult.data ?? [];
  const currentAssignment = assignments.find((a) => a.question_id === questionId);
  if (!currentAssignment) {
    redirect(questionsPath);
  }

  const currentMarks = Number.isFinite(Number(currentAssignment.marks))
    ? Number(currentAssignment.marks)
    : 1;
  const currentNegativeMarks = Number.isFinite(Number(currentAssignment.negative_marks))
    ? Number(currentAssignment.negative_marks)
    : 0;

  const questionIds = assignments.map((a) => a.question_id);
  const questionSummaryById = new Map<
    string,
    { id: string; subject_id: string; question_text: string; is_active: boolean; expires_on: string | null }
  >();

  // Fetch in batches of 40 to avoid 5.5KB URL query-string overflow on 150-question AEE tests
  if (questionIds.length > 0) {
    const chunkSize = 40;
    for (let i = 0; i < questionIds.length; i += chunkSize) {
      const chunk = questionIds.slice(i, i + chunkSize);
      const { data: qRows } = await db
        .from("questions")
        .select("id, subject_id, question_text, is_active, expires_on")
        .in("id", chunk);
      for (const q of qRows ?? []) {
        questionSummaryById.set(q.id, q);
      }
    }
  }

  const isDraft = mockTest.status === "draft";
  const hasAttempts = (attemptsResult.count ?? 0) > 0 || !isDraft;

  const subjects = taxonomy.subjects;
  const papers = new Map(taxonomy.papers.map((item) => [item.id, item]));
  const groups = new Map(taxonomy.groups.map((item) => [item.id, item]));
  const categories = new Map(
    taxonomy.categories.map((item) => [item.id, item]),
  );

  const paperId = mockTest.paper_id;
  const relevantSubjects = paperId
    ? subjects.filter(
        (s) =>
          s.paper_id === paperId ||
          s.id === question.subject_id,
      )
    : subjects;

  const subjectOptions = relevantSubjects.map((subject) => {
    const paper = papers.get(subject.paper_id);
    const group = paper ? groups.get(paper.exam_group_id) : undefined;
    const category = group ? categories.get(group.exam_id) : undefined;
    return {
      id: subject.id,
      contentLanguageMode:
        subject.content_language_mode as SubjectContentLanguageMode,
      label: `${category?.name ?? "Unknown Recruiting Board"} → ${group?.name ?? "Unknown Exam"} → ${paper?.name ?? "Unknown Paper"} → ${subject.name}`,
    };
  });

  const today = indiaDateKey();
  const subjectDisplayOrder = new Map(
    subjects.map((s) => [s.id, Number(s.display_order ?? 999)]),
  );

  const sortedAssignments = [...assignments]
    .map((item) => {
      const q = questionSummaryById.get(item.question_id);
      const m = Number(item.marks);
      const nm = Number(item.negative_marks);
      const marksVal = Number.isFinite(m) ? m : 1;
      const negMarksVal = Number.isFinite(nm) ? nm : 0;
      return {
        ...item,
        marks: marksVal,
        negative_marks: negMarksVal,
        subject_id: q?.subject_id,
        question_text: q?.question_text ?? "Question unavailable",
        is_active: Boolean(
          q?.is_active && (!q.expires_on || q.expires_on >= today),
        ),
        is_score_valid: marksVal > 0 && negMarksVal >= 0,
      };
    })
    .sort((a, b) => {
      const orderA = subjectDisplayOrder.get(a.subject_id ?? "") ?? 999;
      const orderB = subjectDisplayOrder.get(b.subject_id ?? "") ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.question_order - b.question_order;
    });

  const currentIndex = sortedAssignments.findIndex(
    (a) => a.question_id === questionId,
  );
  if (currentIndex === -1) {
    redirect(questionsPath);
  }

  const prevItem = currentIndex > 0 ? sortedAssignments[currentIndex - 1] : null;
  const nextItem =
    currentIndex < sortedAssignments.length - 1
      ? sortedAssignments[currentIndex + 1]
      : null;

  const backHref =
    returningToPreview && typeof returnTo === "string"
      ? returnTo
      : questionsPath;

  const returnToParam =
    typeof returnTo === "string"
      ? returnTo
      : Array.isArray(returnTo)
        ? returnTo[0]
        : undefined;
  const returnToQuery = returnToParam
    ? `?returnTo=${encodeURIComponent(returnToParam)}`
    : "";

  const prevHref = prevItem
    ? `/admin/mock-tests/${mockTestId}/questions/${prevItem.question_id}/edit${returnToQuery}`
    : undefined;
  const nextHref = nextItem
    ? `/admin/mock-tests/${mockTestId}/questions/${nextItem.question_id}/edit${returnToQuery}`
    : undefined;
  const previewHref = mockTestPreviewHref(
    mockTestId,
    mockTestsPath,
    currentIndex + 1,
  );

  const paletteItems = sortedAssignments.map((item, idx) => ({
    questionId: item.question_id,
    questionNumber: idx + 1,
    isActive: item.is_active,
    isScoreValid: item.is_score_valid,
    questionText: item.question_text,
    href: `/admin/mock-tests/${mockTestId}/questions/${item.question_id}/edit${returnToQuery}`,
  }));

  const navigation: MockTestQuestionNav = {
    mockTestId,
    mockTestTitle: mockTest.title,
    currentIndex,
    currentQuestionNumber: currentIndex + 1,
    totalCount: sortedAssignments.length,
    prevHref,
    nextHref,
    prevQuestionNumber: prevItem ? currentIndex : undefined,
    nextQuestionNumber: nextItem ? currentIndex + 2 : undefined,
    backHref,
    backLabel: returningToPreview
      ? "Student Preview"
      : `${mockTest.title} Questions`,
    previewHref,
    items: paletteItems,
  };

  return (
    <main>
      <h1 className="text-3xl font-black">
        Edit Question #{currentIndex + 1}
      </h1>
      <p className="mt-1 text-slate-600">
        Editing question in{" "}
        <span className="font-bold text-slate-900">
          {mockTest.title}
        </span>
        . Changes apply to this mock test and synchronize to student attempt reviews.
      </p>

      {!isDraft && (
        <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm font-medium leading-6 text-sky-950">
          <span className="font-bold">Live Mock Test Rectification: </span>
          This mock test is published. You can add diagram images, fix typos, and enrich explanations. Your changes will safely update the question and reflect in both student attempt reviews and future attempts.
        </div>
      )}

      <EditQuestionForm
        key={question.id}
        question={question as Question}
        subjects={subjectOptions}
        mockTestId={mockTestId}
        hasAttempts={hasAttempts}
        navigation={navigation}
        marks={currentMarks}
        negativeMarks={currentNegativeMarks}
      />
    </main>
  );
}
