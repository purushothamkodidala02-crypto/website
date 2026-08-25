"use server";

import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CATEGORIES = new Set(["wrong_answer", "unclear_wording", "translation", "broken_image", "duplicate", "other"]);

export type QuestionReportResult = { success: boolean; message: string };

export async function submitQuestionReport(
  questionId: string,
  attemptId: string | null,
  category: string,
  details: string,
): Promise<QuestionReportResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cleanDetails = details.trim();
  if (!user) return { success: false, message: "Sign in to report a question." };
  if (!UUID_PATTERN.test(questionId) || !CATEGORIES.has(category)) return { success: false, message: "Choose a valid report reason." };
  if (attemptId && !UUID_PATTERN.test(attemptId)) return { success: false, message: "This attempt could not be verified." };
  if (cleanDetails.length > 1000) return { success: false, message: "Keep the description within 1,000 characters." };
  if (category === "other" && cleanDetails.length < 10) return { success: false, message: "Briefly describe the problem." };

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase.from("question_reports").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since);
  if ((count ?? 0) >= 10) return { success: false, message: "You have submitted several reports recently. Please try again later." };

  const { error } = await supabase.from("question_reports").insert({
    user_id: user.id,
    question_id: questionId,
    attempt_id: attemptId,
    category,
    details: cleanDetails || null,
    status: "open",
  });
  if (error?.code === "23505") return { success: true, message: "You already reported this issue. It is awaiting review." };
  if (error) return { success: false, message: "The report could not be submitted. Please try again." };
  return { success: true, message: "Report submitted. Thank you for helping us improve this question." };
}
