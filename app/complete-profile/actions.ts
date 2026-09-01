"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normaliseIndianMobile } from "@/lib/phone";

export type CompleteProfileState = { message: string };

function safeNextPath(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/";
}

export async function completeSocialProfile(
  _previousState: CompleteProfileState,
  formData: FormData,
): Promise<CompleteProfileState> {
  const fullNameValue = formData.get("full_name");
  const phoneValue = formData.get("phone");
  const fullName = typeof fullNameValue === "string" ? fullNameValue.trim() : "";
  const phone = normaliseIndianMobile(typeof phoneValue === "string" ? phoneValue : "");
  const nextPath = safeNextPath(formData.get("next"));

  if (fullName.length < 2 || fullName.length > 120) {
    return { message: "Enter your full name using 2 to 120 characters." };
  }
  if (!phone) {
    return { message: "Enter a valid 10-digit Indian mobile number." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { message: "Your sign-in session has expired. Return to the login page and try again." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.role !== "student") {
    return { message: "This profile cannot be updated from the student registration page." };
  }

  try {
    const admin = createAdminClient();
    const { error: authError } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, full_name: fullName, phone },
    });
    if (authError) {
      return { message: "Your mobile number could not be saved. Please try again." };
    }

    const { error: profileError } = await admin
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", user.id);
    if (profileError) {
      return { message: "Your profile could not be completed. Please try again." };
    }
  } catch {
    return { message: "The profile service is temporarily unavailable. Please try again shortly." };
  }

  redirect(nextPath);
}
