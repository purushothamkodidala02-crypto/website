import { createClient } from "@/lib/supabase/server";
import { ExamPageFaqManager } from "./ExamPageFaqManager";

export default async function ExamPagesPage() {
  const supabase = await createClient();
  const [statesResult, boardsResult, examsResult, faqsResult] = await Promise.all([
    supabase.from("exam_states").select("id, name, code").order("display_order"),
    supabase.from("exams").select("id, state_id, name").order("display_order"),
    supabase.from("exam_groups").select("id, exam_id, name, slug").order("display_order"),
    supabase.from("exam_page_faqs").select("id, exam_group_id, question, answer, display_order").order("display_order"),
  ]);
  const error = statesResult.error || boardsResult.error || examsResult.error || faqsResult.error;
  if (error) return <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800">Unable to load exam-page content: {error.message}</p>;
  return <ExamPageFaqManager states={statesResult.data ?? []} boards={(boardsResult.data ?? []).map((item) => ({ id: item.id, stateId: item.state_id, name: item.name }))} exams={(examsResult.data ?? []).map((item) => ({ id: item.id, boardId: item.exam_id, name: item.name, slug: item.slug }))} faqs={faqsResult.data ?? []} />;
}
