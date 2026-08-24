"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function adminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Sign in is required." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { supabase, error: "Administrator access is required." };
  return { supabase };
}

function slugify(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

export async function createAccessProduct(formData: FormData) {
  const result = await adminClient(); if ("error" in result) return;
  const name = String(formData.get("name") ?? "").trim(); const slug = slugify(String(formData.get("slug") ?? name));
  const price = Number(formData.get("price_inr")); const duration = Number(formData.get("duration_days")); const examGroupIds = formData.getAll("exam_group_ids").map(String).filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  if (!name || !slug || !Number.isFinite(price) || price < 0 || !Number.isInteger(duration) || duration < 1 || !examGroupIds.length) return;
  const { data: product, error } = await result.supabase.from("access_products").insert({ name, slug, description: String(formData.get("description") ?? "").trim() || null, price_inr: price, duration_days: duration, is_active: true }).select("id").single();
  if (!error && product) await result.supabase.from("access_product_exam_groups").insert(examGroupIds.map((exam_group_id) => ({ product_id: product.id, exam_group_id })));
  revalidatePath("/admin/access"); revalidatePath("/dashboard/passes");
}

export async function toggleAccessProduct(formData: FormData) {
  const result = await adminClient(); if ("error" in result) return;
  const id = String(formData.get("id") ?? ""); const active = String(formData.get("active")) === "true";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  await result.supabase.from("access_products").update({ is_active: !active }).eq("id", id);
  revalidatePath("/admin/access"); revalidatePath("/dashboard/passes");
}

export async function createReferralCode(formData: FormData) {
  const result = await adminClient(); if ("error" in result) return;
  const code = String(formData.get("code") ?? "").trim().toUpperCase(); const productId = String(formData.get("product_id") ?? ""); const type = String(formData.get("discount_type") ?? ""); const value = Number(formData.get("discount_value") ?? 0);
  if (!/^[A-Z0-9-]{3,40}$/.test(code) || !["percent", "amount", "free_pass", "bonus_days"].includes(type) || !Number.isFinite(value) || value < 0) return;
  await result.supabase.from("referral_codes").insert({ code, product_id: /^[0-9a-f-]{36}$/i.test(productId) ? productId : null, discount_type: type, discount_value: value, max_redemptions: Number(formData.get("max_redemptions")) || null, description: String(formData.get("description") ?? "").trim() || null });
  revalidatePath("/admin/access");
}
