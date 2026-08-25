"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReportAdminState = { success: boolean; message: string };
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES = new Set(["open", "reviewing", "resolved", "dismissed"]);

export async function updateQuestionReport(_previous: ReportAdminState, formData: FormData): Promise<ReportAdminState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Administrator sign-in is required." };
  const [{ data: profile }, { data: assurance }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  if (profile?.role !== "admin" || assurance?.currentLevel !== "aal2") return { success: false, message: "Verified administrator access is required." };

  const id = String(formData.get("report_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const notes = String(formData.get("admin_notes") ?? "").trim();
  if (!UUID_PATTERN.test(id) || !STATUSES.has(status)) return { success: false, message: "Choose a valid report status." };
  if (notes.length > 2000) return { success: false, message: "Keep internal notes within 2,000 characters." };
  const resolved = status === "resolved" || status === "dismissed";
  const { error } = await supabase.from("question_reports").update({
    status,
    admin_notes: notes || null,
    resolved_by: resolved ? user.id : null,
    resolved_at: resolved ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) return { success: false, message: "The report could not be updated. Please try again." };
  revalidatePath("/admin/question-reports");
  return { success: true, message: "Report updated." };
}
