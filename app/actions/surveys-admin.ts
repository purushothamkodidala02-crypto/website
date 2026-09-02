"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAdminSurvey(title: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dynamic_surveys")
    .insert({ title, description: "" })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/surveys");
  return { id: data.id };
}

export async function toggleSurveyStatus(surveyId: string, isActive: boolean) {
  const supabase = await createClient();
  
  if (isActive) {
    // Deactivate all others first
    await supabase.from("dynamic_surveys").update({ is_active: false }).neq("id", surveyId);
  }

  const { error } = await supabase
    .from("dynamic_surveys")
    .update({ is_active: isActive })
    .eq("id", surveyId);

  revalidatePath("/admin/surveys");
  revalidatePath("/dashboard");
  return { success: !error };
}

export async function saveSurveyQuestion(
  surveyId: string, 
  questionText: string, 
  questionType: string, 
  options: string[],
  displayOrder: number
) {
  const supabase = await createClient();
  const { error } = await supabase.from("dynamic_survey_questions").insert({
    survey_id: surveyId,
    question_text: questionText,
    question_type: questionType,
    options: options.length > 0 ? options : null,
    display_order: displayOrder
  });
  
  revalidatePath(`/admin/surveys/${surveyId}`);
  return { success: !error };
}

export async function deleteSurveyQuestion(questionId: string, surveyId: string) {
  const supabase = await createClient();
  await supabase.from("dynamic_survey_questions").delete().eq("id", questionId);
  revalidatePath(`/admin/surveys/${surveyId}`);
  return { success: true };
}
