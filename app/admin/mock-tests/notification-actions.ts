"use server";

import { revalidatePath } from "next/cache";
import {
  previewMockTestNotification,
  sendMockTestNotifications,
  type MockTestNotificationPreview,
  type SendNotificationResult,
} from "@/lib/notifications/mock-test-alerts";
import { createClient } from "@/lib/supabase/server";

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

export type PreviewActionResult = {
  success: boolean;
  message?: string;
  preview?: MockTestNotificationPreview;
};

export async function getMockTestNotificationPreviewAction(
  mockTestId: string
): Promise<PreviewActionResult> {
  const { user, error } = await verifyAdminUser();
  if (!user) return { success: false, message: error ?? "Unauthorized" };

  try {
    const preview = await previewMockTestNotification(mockTestId);
    return { success: true, preview };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to load notification preview.",
    };
  }
}

export async function sendMockTestNotificationAction(
  mockTestId: string,
  options?: {
    selectedEmails?: string[];
    customEmails?: string[];
  }
): Promise<SendNotificationResult> {
  const { user, error } = await verifyAdminUser();
  if (!user) {
    return {
      success: false,
      message: error ?? "Unauthorized",
      recipientCount: 0,
      sentCount: 0,
      failedCount: 0,
    };
  }

  try {
    const result = await sendMockTestNotifications({
      mockTestId,
      adminUserId: user.id,
      selectedEmails: options?.selectedEmails,
      customEmails: options?.customEmails,
    });

    revalidatePath("/admin/mock-tests");
    revalidatePath(`/admin/mock-tests/${mockTestId}/edit`);

    return result;
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to send notifications.",
      recipientCount: 0,
      sentCount: 0,
      failedCount: 0,
    };
  }
}
