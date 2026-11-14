import { notFound } from "next/navigation";
import { EditQuestionForm } from "@/app/admin/questions/[id]/edit/EditQuestionForm";
import { getAdminTaxonomy } from "@/lib/admin/taxonomy";
import { createClient } from "@/lib/supabase/server";
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

  const [
    mockTestResult,
    assignmentsResult,
    questionResult,
    attemptsResult,
    taxonomy,
  ] = await Promise.all([
    supabase
      .from("mock_tests")
      .select("id, title, status")
      .eq("id", mockTestId)
      .maybeSingle(),
    supabase
      .from("mock_test_questions")
      .select("id, question_id, question_order, marks, negative_marks, questions(id, subject_id, question_text, is_active, expires_on)")
      .eq("mock_test_id", mockTestId)
      .order("question_order", { ascending: true })
      .then(async (res) => {
        if (!res.data) {
          return supabase
            .from("mock_test_questions")
            .select("id, question_id, question_order, marks, negative_marks")
            .eq("mock_test_id", mockTestId)
            .order("question_order", { ascending: true });
        }
        return res;
      }),
    supabase
      .from("questions")
      .select(
        "id, subject_id, question_text, question_type, option_a, option_b, option_c, option_d, question_text_te, option_a_te, option_b_te, option_c_te, option_d_te, correct_answer, explanation, explanation_te, difficulty, image_url, source_reference, is_active, content_lifecycle, review_on, expires_on, created_at, updated_at",
      )
      .eq("id", questionId)
      .maybeSingle(),
    supabase
      .from("test_attempts")
      .select("id", { count: "exact", head: true })
      .eq("mock_test_id", mockTestId),
    getAdminTaxonomy(),
  ]);

  if (!mockTestResult.data || !assignmentsResult.data || !questionResult.data) {
    notFound();
  }

  const assignments = assignmentsResult.data;
  const currentAssignment = assignments.find((a) => a.question_id === questionId);
  if (!currentAssignment) notFound();

  const questionIds = assignments.map((a) => a.question_id);
  const questionSummaryById = new Map<
    string,
    { id: string; subject_id: string; question_text: string; is_active: boolean; expires_on: string | null }
  >();
  for (const item of assignments as unknown as { question_id: string; questions: unknown }[]) {
    const q = Array.isArray(item.questions) ? item.questions[0] : item.questions;
    if (q && typeof q === "object" && "id" in q) {
      questionSummaryById.set(
        item.question_id,
        q as { id: string; subject_id: string; question_text: string; is_active: boolean; expires_on: string | null },
      );
    }
  }

  if (questionSummaryById.size === 0 && questionIds.length > 0) {
    const questionsSummaryResult = await supabase
      .from("questions")
      .select("id, subject_id, question_text, is_active, expires_on")
      .in("id", questionIds);
    for (const q of questionsSummaryResult.data ?? []) {
      questionSummaryById.set(q.id, q);
    }
  }

  const isDraft = mockTestResult.data.status === "draft";
  const hasAttempts = (attemptsResult.count ?? 0) > 0 || !isDraft;

  const subjects = taxonomy.subjects;
  const papers = new Map(taxonomy.papers.map((item) => [item.id, item]));
  const groups = new Map(taxonomy.groups.map((item) => [item.id, item]));
  const categories = new Map(
    taxonomy.categories.map((item) => [item.id, item]),
  );

  const subjectOptions = subjects.map((subject) => {
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
      return {
        ...item,
        subject_id: q?.subject_id,
        question_text: q?.question_text ?? "Question unavailable",
        is_active: Boolean(
          q?.is_active && (!q.expires_on || q.expires_on >= today),
        ),
        is_score_valid:
          Number(item.marks) > 0 && Number(item.negative_marks) >= 0,
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
  if (currentIndex === -1) notFound();

  const prevItem = currentIndex > 0 ? sortedAssignments[currentIndex - 1] : null;
  const nextItem =
    currentIndex < sortedAssignments.length - 1
      ? sortedAssignments[currentIndex + 1]
      : null;

  const returningToPreview = isMockTestPreviewHref(returnTo, mockTestId);
  const mockTestsPath = returningToPreview
    ? listReturnToFromMockTestPreview(returnTo)
    : mockTestsListReturnTo(returnTo);
  const questionsPath = mockTestQuestionsHref(mockTestId, mockTestsPath);
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
    mockTestTitle: mockTestResult.data.title,
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
      : `${mockTestResult.data.title} Questions`,
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
          {mockTestResult.data.title}
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
        key={questionResult.data.id}
        question={questionResult.data as Question}
        subjects={subjectOptions}
        mockTestId={mockTestId}
        hasAttempts={hasAttempts}
        navigation={navigation}
      />
    </main>
  );
}
