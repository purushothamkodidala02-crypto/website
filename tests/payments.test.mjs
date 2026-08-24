import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("exam passes use verified PhonePe payments and preserve legacy test access", async () => {
  const [migration, checkout, phonepe, webhook, detail] = await Promise.all([
    read("supabase/migrations/20260824110000_add_phonepe_exam_passes.sql"),
    read("app/dashboard/passes/actions.ts"),
    read("lib/payments/phonepe.ts"),
    read("app/api/payments/phonepe/webhook/route.ts"),
    read("components/mock-tests/MockTestDetailPage.tsx"),
  ]);
  assert.match(migration, /create table public\.access_products/);
  assert.match(migration, /create table public\.student_entitlements/);
  assert.match(migration, /mock_test_entitlements legacy/);
  assert.match(migration, /product_exam\.exam_group_id = paper\.exam_group_id/);
  assert.match(migration, /Create an active Exam Pass/);
  assert.match(phonepe, /PhonePe payments are not configured yet/);
  assert.match(checkout, /referral_redemptions/);
  assert.match(webhook, /getPhonePeOrderStatus/);
  assert.match(webhook, /grant_payment_entitlement/);
  assert.match(detail, /BuyExamPassForm/);
  assert.match(detail, /isAccessibleForFree: test\.access_type === "free"/);
});
