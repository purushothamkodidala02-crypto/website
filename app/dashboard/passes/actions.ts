"use server";

import { redirect } from "next/navigation";
import { absoluteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createPhonePeCheckout } from "@/lib/payments/phonepe";

function safeReturnPath(value: FormDataEntryValue | null) {
  const path = String(value ?? "/dashboard/passes");
  return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard/passes";
}

export async function beginExamPassCheckout(formData: FormData) {
  const productId = String(formData.get("product_id") ?? "");
  const referralCode = String(formData.get("referral_code") ?? "").trim().toUpperCase();
  const returnTo = safeReturnPath(formData.get("return_to"));
  if (!/^[0-9a-f-]{36}$/i.test(productId)) redirect(`${returnTo}?payment_error=invalid_product`);

  const sessionClient = await createClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);

  const admin = createAdminClient();
  const { data: product } = await admin.from("access_products").select("id, name, price_inr, duration_days, is_active").eq("id", productId).maybeSingle();
  if (!product?.is_active) redirect(`${returnTo}?payment_error=unavailable`);

  let amountPaise = Math.round(Number(product.price_inr) * 100);
  let referralId: string | null = null;
  let bonusDays = 0;
  if (referralCode) {
    const { data: referral } = await admin.from("referral_codes").select("id, product_id, discount_type, discount_value, max_redemptions, per_user_limit, starts_at, expires_at, is_active").eq("code", referralCode).maybeSingle();
    const now = Date.now();
    const isOpen = referral?.is_active && (!referral.product_id || referral.product_id === product.id) && (!referral.starts_at || Date.parse(referral.starts_at) <= now) && (!referral.expires_at || Date.parse(referral.expires_at) > now);
    if (!isOpen) redirect(`${returnTo}?payment_error=invalid_referral`);
    const { count: usedByStudent } = await admin.from("referral_redemptions").select("id", { count: "exact", head: true }).eq("referral_code_id", referral.id).eq("user_id", user.id);
    const { count: totalUses } = await admin.from("referral_redemptions").select("id", { count: "exact", head: true }).eq("referral_code_id", referral.id);
    if ((usedByStudent ?? 0) >= referral.per_user_limit || (referral.max_redemptions !== null && (totalUses ?? 0) >= referral.max_redemptions)) redirect(`${returnTo}?payment_error=referral_used`);
    referralId = referral.id;
    const value = Number(referral.discount_value);
    if (referral.discount_type === "percent") amountPaise = Math.max(0, Math.round(amountPaise * (1 - value / 100)));
    if (referral.discount_type === "amount") amountPaise = Math.max(0, amountPaise - Math.round(value * 100));
    if (referral.discount_type === "free_pass") amountPaise = 0;
    if (referral.discount_type === "bonus_days") bonusDays = Math.round(value);
  }

  const merchantOrderId = `VP${Date.now()}${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const { data: order, error: orderError } = await admin.from("payment_orders").insert({ user_id: user.id, product_id: product.id, merchant_order_id: merchantOrderId, amount_paise: amountPaise, referral_code: referralCode || null, bonus_days: bonusDays, status: amountPaise === 0 ? "paid" : "created", paid_at: amountPaise === 0 ? new Date().toISOString() : null }).select("id").single();
  if (orderError || !order) redirect(`${returnTo}?payment_error=order`);

  if (referralId) await admin.from("referral_redemptions").insert({ referral_code_id: referralId, user_id: user.id, product_id: product.id, payment_order_id: order.id, discount_paise: Math.round(Number(product.price_inr) * 100) - amountPaise });
  if (amountPaise === 0) {
    const expiresAt = new Date(Date.now() + (Number(product.duration_days) + bonusDays) * 86400000).toISOString();
    await admin.from("student_entitlements").insert({ user_id: user.id, product_id: product.id, payment_order_id: order.id, source: "referral", expires_at: expiresAt });
    redirect(`${returnTo}?payment=success`);
  }

  let checkout: Awaited<ReturnType<typeof createPhonePeCheckout>>;
  try {
    checkout = await createPhonePeCheckout({ merchantOrderId, amount: amountPaise, message: `${product.name} on Varadhi Prep`, redirectUrl: absoluteUrl(`/billing/payment-result?order=${encodeURIComponent(order.id)}&return_to=${encodeURIComponent(returnTo)}`) });
  } catch {
    await admin.from("payment_orders").update({ status: "failed" }).eq("id", order.id);
    redirect(`${returnTo}?payment_error=phonepe`);
  }
  await admin.from("payment_orders").update({ status: "pending", provider_order_id: checkout.providerOrderId, provider_payload: checkout.payload }).eq("id", order.id);
  redirect(checkout.redirectUrl);
}
