"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function setQuestionBookmark(questionId: string, bookmarked: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !UUID_PATTERN.test(questionId)) return { success: false };

  const result = bookmarked
    ? await supabase.from("student_question_bookmarks").upsert({ user_id: user.id, question_id: questionId })
    : await supabase.from("student_question_bookmarks").delete().eq("user_id", user.id).eq("question_id", questionId);

  if (!result.error) {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/study-book");
  }
  return { success: !result.error };
}
