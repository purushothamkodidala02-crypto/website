"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type GrowthInteractionPayload = {
  eventType: "view" | "click_support" | "select_tier" | "dismiss" | "close" | "trigger";
  buttonLabel: string;
  amount?: number;
  pagePath?: string;
  metadata?: Record<string, unknown>;
};

export async function recordGrowthInteractionAction(
  payload: GrowthInteractionPayload,
): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let studentName = "Guest Aspirant";
    let studentEmail = "";

    if (user) {
      studentEmail = user.email || "";
      studentName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        (user.email ? user.email.split("@")[0] : "Student");

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.full_name) {
          studentName = profile.full_name;
        }
      } catch {
        // Fallback to metadata name
      }
    }

    const db = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : supabase;

    await db.from("growth_popup_interactions").insert({
      user_id: user?.id ?? null,
      student_name: studentName,
      student_email: studentEmail || null,
      event_type: payload.eventType,
      button_label: payload.buttonLabel,
      amount: payload.amount ?? null,
      page_path: payload.pagePath ?? null,
      metadata: payload.metadata ?? {},
    });

    return { success: true };
  } catch (err) {
    // Fail gracefully so candidate practice flow is never interrupted
    console.warn("Could not record growth popup interaction:", err instanceof Error ? err.message : err);
    return { success: false };
  }
}
