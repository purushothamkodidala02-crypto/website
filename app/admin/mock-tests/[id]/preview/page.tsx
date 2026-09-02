import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentPreview, type PreviewQuestion } from "./StudentPreview";
import { mockTestQuestionsHref, mockTestsListReturnTo } from "@/lib/admin/mock-test-navigation";
import { BackButton } from "@/components/admin/BackButton";

export default async function MockTestStudentPreviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ question?: string | string[]; returnTo?: string | string[] }> }) {
  const { id } = await params;
  const { question, returnTo } = await searchParams;
  const initialQuestion = typeof question === "string" && /^\d+$/.test(question) ? Number(question) : 1;
  const supabase = await createClient();
  const [testResult, assignmentsResult, attemptCountResult, subjectsResult] = await Promise.all([
    supabase.from("mock_tests").select("id, title, status").eq("id", id).maybeSingle(),
    supabase.from("mock_test_questions").select("question_id, question_order, marks, negative_marks").eq("mock_test_id", id).order("question_order"),
    supabase.from("test_attempts").select("id", { count: "exact", head: true }).eq("mock_test_id", id),
    supabase.from("subjects").select("id, content_language_mode"),
  ]);
  if (!testResult.data) notFound();
  if (assignmentsResult.error) throw new Error("Questions could not be loaded for preview.");
  const assignments = assignmentsResult.data ?? [];
  const questionsResult = assignments.length ? await supabase.from("questions").select("id, subject_id, question_text, option_a, option_b, option_c, option_d, question_text_te, option_a_te, option_b_te, option_c_te, option_d_te, correct_answer, explanation, explanation_te, image_url").in("id", assignments.map((assignment) => assignment.question_id)) : { data: [], error: null };
  if (questionsResult.error) throw new Error("Question content could not be loaded for preview.");
  const questionById = new Map((questionsResult.data ?? []).map((item) => [item.id, item]));
  const languageBySubject = new Map((subjectsResult.data ?? []).map((subject) => [subject.id, subject.content_language_mode as PreviewQuestion["languageMode"]]));
  const questions: PreviewQuestion[] = assignments.flatMap((assignment) => { const item = questionById.get(assignment.question_id); return item ? [{ id: item.id, marks: Number(assignment.marks), negativeMarks: Number(assignment.negative_marks), questionText: item.question_text, optionA: item.option_a, optionB: item.option_b, optionC: item.option_c, optionD: item.option_d, questionTextTe: item.question_text_te, optionATe: item.option_a_te, optionBTe: item.option_b_te, optionCTe: item.option_c_te, optionDTe: item.option_d_te, correctAnswer: item.correct_answer, explanation: item.explanation, explanationTe: item.explanation_te, imageUrl: item.image_url, languageMode: languageBySubject.get(item.subject_id) ?? "bilingual" }] : []; });
  const listReturnTo = mockTestsListReturnTo(returnTo);
  const questionsHref = mockTestQuestionsHref(id, listReturnTo);
  const settingsHref = `/admin/mock-tests/${id}/edit?returnTo=${encodeURIComponent(listReturnTo)}`;
  const canEdit = testResult.data.status === "draft" && (attemptCountResult.count ?? 0) === 0;
  return <main><div className="flex flex-wrap items-center justify-between gap-3"><BackButton fallbackHref={questionsHref} label="← Back" className="text-sm font-semibold text-teal-700 hover:underline" /><Link href={settingsHref} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50">Mock Test Settings</Link></div><p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-teal-700">Quality check</p><h1 className="mt-2 text-3xl font-black text-slate-950">Student Preview</h1><p className="mt-2 max-w-3xl text-slate-600">Review exactly how students will read each question, including images and mobile-friendly navigation. The answer key and explanations below are visible only to administrators.</p>{!canEdit && <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-950">This mock test is no longer editable because it is published or has student attempts. The preview remains available for quality review.</p>}<StudentPreview mockTestId={id} questions={questions} canEdit={canEdit} backHref={questionsHref} listReturnTo={listReturnTo} initialQuestion={initialQuestion} /></main>;
}

