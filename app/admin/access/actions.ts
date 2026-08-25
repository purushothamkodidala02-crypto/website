"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AccessProductState = { success: boolean; message: string };

async function adminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Sign in is required." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { supabase, error: "Administrator access is required." };
  return { supabase };
}

function slugify(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

export async function createAccessProduct(_previous: AccessProductState, formData: FormData): Promise<AccessProductState> {
  const result = await adminClient();
  if ("error" in result) return { success: false, message: result.error ?? "Administrator access is required." };
  const name = String(formData.get("name") ?? "").trim();
  const requestedSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(requestedSlug || name);
  const price = Number(formData.get("price_inr")); const duration = Number(formData.get("duration_days")); const examGroupIds = formData.getAll("exam_group_ids").map(String).filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  if (!name || !slug) return { success: false, message: "Enter a name for the exam series." };
  if (!Number.isFinite(price) || price <= 0) return { success: false, message: "Enter a price greater than ₹0." };
  if (!Number.isInteger(duration) || duration < 1) return { success: false, message: "Enter the number of access days." };
  if (!examGroupIds.length) return { success: false, message: "Select at least one exam for this series." };

  const uniqueExamGroupIds = [...new Set(examGroupIds)];
  const { data: selectedGroups, error: groupError } = await result.supabase
    .from("exam_groups")
    .select("id")
    .in("id", uniqueExamGroupIds);
  if (groupError || (selectedGroups?.length ?? 0) !== uniqueExamGroupIds.length) {
    return { success: false, message: "One or more selected exams could not be found. Refresh the page and try again." };
  }

  const { data: product, error } = await result.supabase
    .from("access_products")
    .insert({ name, slug, description: String(formData.get("description") ?? "").trim() || null, price_inr: price, duration_days: duration, is_active: true })
    .select("id")
    .single();
  if (error || !product) {
    return { success: false, message: error?.code === "23505" ? "That URL label is already used. Change the name or URL label." : "The exam series could not be created. Please try again." };
  }
  const { error: mappingError } = await result.supabase
    .from("access_product_exam_groups")
    .insert(uniqueExamGroupIds.map((exam_group_id) => ({ product_id: product.id, exam_group_id })));
  if (mappingError) return { success: false, message: "The series was created, but its exam coverage could not be saved. Please contact support before publishing paid tests." };
  revalidatePath("/admin/access"); revalidatePath("/dashboard/passes"); revalidatePath("/mock-tests", "layout");
  return { success: true, message: `“${name}” is active and ready to sell.` };
}

export async function toggleAccessProduct(formData: FormData) {
  const result = await adminClient(); if ("error" in result) return;
  const id = String(formData.get("id") ?? ""); const active = String(formData.get("active")) === "true";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  await result.supabase.from("access_products").update({ is_active: !active }).eq("id", id);
  revalidatePath("/admin/access"); revalidatePath("/dashboard/passes"); revalidatePath("/mock-tests", "layout");
}

export async function createReferralCode(formData: FormData) {
  const result = await adminClient(); if ("error" in result) return;
  const code = String(formData.get("code") ?? "").trim().toUpperCase(); const productId = String(formData.get("product_id") ?? ""); const type = String(formData.get("discount_type") ?? ""); const value = Number(formData.get("discount_value") ?? 0);
  if (!/^[A-Z0-9-]{3,40}$/.test(code) || !["percent", "amount", "free_pass", "bonus_days"].includes(type) || !Number.isFinite(value) || value < 0) return;
  await result.supabase.from("referral_codes").insert({ code, product_id: /^[0-9a-f-]{36}$/i.test(productId) ? productId : null, discount_type: type, discount_value: value, max_redemptions: Number(formData.get("max_redemptions")) || null, description: String(formData.get("description") ?? "").trim() || null });
  revalidatePath("/admin/access");
}
