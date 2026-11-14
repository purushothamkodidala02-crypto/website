import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminTaxonomy } from "@/lib/admin/taxonomy";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Question } from "@/types/question";
import type { SubjectContentLanguageMode } from "@/types/subject";
import { EditQuestionForm } from "./EditQuestionForm";

export default async function EditQuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { id } = await params;
  const { returnTo } = await searchParams;
  const backHref =
    typeof returnTo === "string" &&
    (returnTo === "/admin/questions" || returnTo.startsWith("/admin/questions?"))
      ? returnTo
      : "/admin/questions";
  const supabase = await createClient();
  const db = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase;

  const [questionResult, sessionResult, assignmentsResult, taxonomy] =
    await Promise.all([
      db
        .from("questions")
        .select(
          "id, subject_id, question_text, question_type, option_a, option_b, option_c, option_d, question_text_te, option_a_te, option_b_te, option_c_te, option_d_te, correct_answer, explanation, explanation_te, difficulty, image_url, source_reference, is_active, content_lifecycle, review_on, expires_on, created_at, updated_at",
        )
        .eq("id", id)
        .maybeSingle(),
      db
        .from("test_attempt_session_questions")
        .select("session_id", { count: "exact", head: true })
        .eq("question_id", id),
      db
        .from("mock_test_questions")
        .select("mock_test_id, question_order, mock_tests(id, title, status)")
        .eq("question_id", id)
        .order("question_order", { ascending: true }),
      getAdminTaxonomy(),
    ]);

  if (!questionResult.data) notFound();
  const hasAttempts = (sessionResult.count ?? 0) > 0;

  const papers = new Map(taxonomy.papers.map((item) => [item.id, item]));
  const groups = new Map(taxonomy.groups.map((item) => [item.id, item]));
  const categories = new Map(taxonomy.categories.map((item) => [item.id, item]));
  const options = taxonomy.subjects.map((subject) => {
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

  return (
    <main>
      <Link
        href={backHref}
        className="text-sm font-semibold text-teal-700 hover:underline"
      >
        ← Back to Question Bank
      </Link>
      <h1 className="mt-5 text-3xl font-black">Edit Question</h1>
      {assignmentsResult.data && assignmentsResult.data.length > 0 && (
        <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50/70 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-teal-900">
            Assigned in {assignmentsResult.data.length} Mock Test{assignmentsResult.data.length > 1 ? "s" : ""}:
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {assignmentsResult.data.map((assignment) => {
              const mockTest = Array.isArray(assignment.mock_tests)
                ? assignment.mock_tests[0]
                : assignment.mock_tests;
              return (
                <Link
                  key={assignment.mock_test_id}
                  href={`/admin/mock-tests/${assignment.mock_test_id}/questions/${id}/edit`}
                  className="inline-flex items-center gap-2 rounded-xl border border-teal-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xs transition hover:border-teal-500 hover:bg-teal-50"
                >
                  <span>{mockTest?.title ?? "Mock Test"}</span>
                  <span className="rounded-md bg-teal-700 px-1.5 py-0.5 text-[11px] font-black text-white">
                    Question #{assignment.question_order}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      <EditQuestionForm
        key={questionResult.data.id}
        question={questionResult.data as Question}
        subjects={options}
        hasAttempts={hasAttempts}
      />
    </main>
  );
}
