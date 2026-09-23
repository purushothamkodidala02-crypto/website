"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  sendDirectUserEmail,
  type SendDirectEmailParams,
} from "@/lib/notifications/direct-email";

async function verifyAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, error: "You must be logged in." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return { user: null, error: "You are not authorized to perform this action." };
  }

  return { user, error: null };
}

export type DirectEmailActionResult = {
  success: boolean;
  message: string;
};

export async function sendDirectUserEmailAction(
  params: SendDirectEmailParams
): Promise<DirectEmailActionResult> {
  const { user, error } = await verifyAdminUser();
  if (!user) {
    return { success: false, message: error ?? "Unauthorized" };
  }

  try {
    const result = await sendDirectUserEmail(params);
    revalidatePath("/admin/students");
    return result;
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to send email.",
    };
  }
}
