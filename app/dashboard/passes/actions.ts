"use server";

import { redirect } from "next/navigation";
import { createCashfreeOrder } from "@/lib/payments/cashfree";
import { absoluteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function safeReturnPath(value: FormDataEntryValue | null) {
  const path = String(value ?? "/dashboard/passes");
  return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard/passes";
}

function redirectWithPaymentError(returnTo: string, reason: string) {
  redirect(`${returnTo}?payment_error=${reason}`);
}

export async function beginExamPassCheckout(formData: FormData) {
  const productId = String(formData.get("product_id") ?? "");
  const referralCode = String(formData.get("referral_code") ?? "").trim().toUpperCase();
  const returnTo = safeReturnPath(formData.get("return_to"));
  if (!/^[0-9a-f-]{36}$/i.test(productId)) redirectWithPaymentError(returnTo, "invalid_product");

  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);

  const admin = createAdminClient();
  const [{ data: product }, { data: profile }] = await Promise.all([
    admin
      .from("access_products")
      .select("id, name, price_inr, duration_days, is_active")
      .eq("id", productId)
      .maybeSingle(),
    admin.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);
  if (!product?.is_active) redirectWithPaymentError(returnTo, "unavailable");
  const activeProduct = product as NonNullable<typeof product>;

  let amountPaise = Math.round(Number(activeProduct.price_inr) * 100);
  let referralId: string | null = null;
  let bonusDays = 0;
  if (referralCode) {
    const { data: referral } = await admin
      .from("referral_codes")
      .select(
        "id, product_id, discount_type, discount_value, max_redemptions, per_user_limit, starts_at, expires_at, is_active",
      )
      .eq("code", referralCode)
      .maybeSingle();
    const now = Date.now();
    const isOpen =
      referral?.is_active &&
      (!referral.product_id || referral.product_id === activeProduct.id) &&
      (!referral.starts_at || Date.parse(referral.starts_at) <= now) &&
      (!referral.expires_at || Date.parse(referral.expires_at) > now);
    if (!isOpen) redirectWithPaymentError(returnTo, "invalid_referral");
    const activeReferral = referral as NonNullable<typeof referral>;

    const [{ count: usedByStudent }, { count: totalUses }] = await Promise.all([
      admin
        .from("referral_redemptions")
        .select("id", { count: "exact", head: true })
        .eq("referral_code_id", activeReferral.id)
        .eq("user_id", user.id),
      admin
        .from("referral_redemptions")
        .select("id", { count: "exact", head: true })
        .eq("referral_code_id", activeReferral.id),
    ]);

    if (
      (usedByStudent ?? 0) >= activeReferral.per_user_limit ||
      (activeReferral.max_redemptions !== null && (totalUses ?? 0) >= activeReferral.max_redemptions)
    ) {
      redirectWithPaymentError(returnTo, "referral_used");
    }

    referralId = activeReferral.id;
    const value = Number(activeReferral.discount_value);
    if (activeReferral.discount_type === "percent") amountPaise = Math.max(0, Math.round(amountPaise * (1 - value / 100)));
    if (activeReferral.discount_type === "amount") amountPaise = Math.max(0, amountPaise - Math.round(value * 100));
    if (activeReferral.discount_type === "free_pass") amountPaise = 0;
    if (activeReferral.discount_type === "bonus_days") bonusDays = Math.round(value);
  }

  const merchantOrderId = `VP${Date.now()}${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const { data: order, error: orderError } = await admin
    .from("payment_orders")
    .insert({
      user_id: user.id,
      product_id: activeProduct.id,
      provider: "cashfree",
      merchant_order_id: merchantOrderId,
      amount_paise: amountPaise,
      referral_code: referralCode || null,
      bonus_days: bonusDays,
      status: amountPaise === 0 ? "paid" : "created",
      paid_at: amountPaise === 0 ? new Date().toISOString() : null,
    })
    .select("id")
    .single();
  if (orderError || !order) redirectWithPaymentError(returnTo, "order");
  const createdOrder = order as NonNullable<typeof order>;

  if (referralId) {
    await admin.from("referral_redemptions").insert({
      referral_code_id: referralId,
      user_id: user.id,
      product_id: activeProduct.id,
      payment_order_id: createdOrder.id,
      discount_paise: Math.round(Number(activeProduct.price_inr) * 100) - amountPaise,
    });
  }

  if (amountPaise === 0) {
    const expiresAt = new Date(Date.now() + (Number(activeProduct.duration_days) + bonusDays) * 86400000).toISOString();
    await admin.from("student_entitlements").insert({
      user_id: user.id,
      product_id: activeProduct.id,
      payment_order_id: createdOrder.id,
      source: "referral",
      expires_at: expiresAt,
    });
    redirect(`${returnTo}?payment=success`);
  }

  let checkout: Awaited<ReturnType<typeof createCashfreeOrder>> | null = null;
  try {
    checkout = await createCashfreeOrder({
      merchantOrderId,
      amountInr: amountPaise / 100,
      customerId: user.id,
      customerName:
        profile?.full_name?.trim() ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Varadhi Prep Student",
      customerEmail: user.email ?? "support@varadhiprep.in",
      customerPhone:
        typeof user.phone === "string" && user.phone
          ? user.phone
          : typeof user.user_metadata?.phone === "string"
            ? user.user_metadata.phone
            : "9999999999",
      returnUrl: absoluteUrl(
        `/billing/payment-result?order=${encodeURIComponent(createdOrder.id)}&return_to=${encodeURIComponent(returnTo)}`,
      ),
      note: `${activeProduct.name} on Varadhi Prep`,
    });
  } catch {
    await admin.from("payment_orders").update({ status: "failed" }).eq("id", createdOrder.id);
    redirectWithPaymentError(returnTo, "cashfree");
  }
  if (!checkout) redirectWithPaymentError(returnTo, "cashfree");
  const readyCheckout = checkout as NonNullable<typeof checkout>;

  await admin
    .from("payment_orders")
    .update({
      status: "pending",
      provider_order_id: readyCheckout.providerOrderId,
      provider_payload: readyCheckout.payload,
    })
    .eq("id", createdOrder.id);

  redirect(
    `/billing/cashfree?order=${encodeURIComponent(createdOrder.id)}&return_to=${encodeURIComponent(returnTo)}`,
  );
}
