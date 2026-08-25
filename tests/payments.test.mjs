import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("exam passes use verified payment-provider checks and preserve legacy test access", async () => {
  const [migration, providerMigration, checkout, phonepe, cashfree, webhook, confirmOrder, detail, adminAccess, seriesForm, adminActions, checkoutPage, launcher, terms, refunds, register, purchaseForm, removeButton] = await Promise.all([
    read("supabase/migrations/20260824110000_add_phonepe_exam_passes.sql"),
    read("supabase/migrations/20260825121500_add_cashfree_provider_support.sql"),
    read("app/dashboard/passes/actions.ts"),
    read("lib/payments/phonepe.ts"),
    read("lib/payments/cashfree.ts"),
    read("app/api/payments/cashfree/webhook/route.ts"),
    read("lib/payments/confirm-order.ts"),
    read("components/mock-tests/MockTestDetailPage.tsx"),
    read("app/admin/access/page.tsx"),
    read("app/admin/access/CreateExamSeriesForm.tsx"),
    read("app/admin/access/actions.ts"),
    read("app/billing/cashfree/page.tsx"),
    read("app/billing/cashfree/CashfreeCheckoutLauncher.tsx"),
    read("app/terms-and-conditions/page.tsx"),
    read("app/refunds-and-cancellations/page.tsx"),
    read("app/register/RegisterForm.tsx"),
    read("app/dashboard/passes/BuyExamPassForm.tsx"),
    read("app/admin/access/RemoveExamSeriesButton.tsx"),
  ]);
  assert.match(migration, /create table public\.access_products/);
  assert.match(migration, /create table public\.student_entitlements/);
  assert.match(migration, /mock_test_entitlements legacy/);
  assert.match(migration, /product_exam\.exam_group_id = paper\.exam_group_id/);
  assert.match(migration, /Create an active Exam Pass/);
  assert.match(phonepe, /PhonePe payments are not configured yet/);
  assert.match(cashfree, /Cashfree payments are not configured yet/);
  assert.doesNotMatch(cashfree, /9999999999/);
  assert.match(providerMigration, /provider in \('phonepe', 'cashfree'\)/);
  assert.match(checkout, /referral_redemptions/);
  assert.match(checkout, /provider: "cashfree"/);
  assert.match(checkout, /createCashfreeOrder/);
  assert.match(checkout, /normaliseIndianMobile/);
  assert.doesNotMatch(checkout, /9999999999/);
  assert.doesNotMatch(checkout, /session=\$\{encodeURIComponent\(readyCheckout\.paymentSessionId\)\}/);
  assert.match(webhook, /verifyCashfreeWebhookSignature/);
  assert.match(confirmOrder, /grant_payment_entitlement/);
  assert.match(detail, /BuyExamPassForm/);
  assert.match(detail, /isAccessibleForFree: test\.access_type === "free"/);
  assert.match(adminAccess, /Manage Mock Tests/);
  assert.match(seriesForm, /name="exam_group_ids"/);
  assert.match(seriesForm, /useActionState/);
  assert.match(seriesForm, /Choose a state/);
  assert.match(seriesForm, /Recruiting board \/ category/);
  assert.match(seriesForm, /Search exact exam/);
  assert.match(adminActions, /Select at least one exam for this series/);
  assert.match(adminActions, /revalidatePath\("\/mock-tests", "layout"\)/);
  assert.match(adminActions, /slugify\(requestedSlug \|\| name\)/);
  assert.match(adminActions, /updateAccessProduct/);
  assert.match(adminActions, /removeAccessProduct/);
  assert.match(adminAccess, /\/admin\/access\/\$\{product\.id\}\/edit/);
  assert.match(removeButton, /paused safely instead of deleted/);
  assert.match(removeButton, /Permanently delete series/);
  assert.match(adminActions, /permanentlyDeleteAccessProduct/);
  assert.match(adminActions, /currentLevel !== "aal2"/);
  assert.match(adminActions, /referral_redemptions/);
  assert.match(adminActions, /student_entitlements/);
  assert.match(adminActions, /payment_orders/);
  assert.match(checkoutPage, /\(await headers\(\)\)\.get\("x-nonce"\)/);
  assert.match(checkoutPage, /provider_payload/);
  assert.match(checkoutPage, /payment_session_id/);
  assert.match(launcher, /nonce=\{nonce\}/);
  assert.match(launcher, /await checkout\.checkout/);
  assert.match(launcher, /Continue to Cashfree/);
  assert.match(launcher, /Cashfree did not open/);
  assert.match(launcher, /taking too long to load/);
  assert.match(terms, /Payments and pricing/);
  assert.match(terms, /Indian Rupees \(INR\)/);
  assert.match(refunds, /Refund review/);
  assert.match(refunds, /support@varadhiprep\.in/);
  assert.match(detail, /We could not open the secure payment page/);
  assert.match(register, /Mobile number/);
  assert.match(register, /normaliseIndianMobile/);
  assert.match(purchaseForm, /customer_phone/);
});

test("exam series are the only customer-facing paid product", async () => {
  const [
    checkout,
    detail,
    catalog,
    dashboard,
    purchases,
    accountActions,
    accessReader,
    createMock,
    editMock,
  ] = await Promise.all([
    read("app/dashboard/passes/actions.ts"),
    read("components/mock-tests/MockTestDetailPage.tsx"),
    read("app/mock-tests/page.tsx"),
    read("app/dashboard/page.tsx"),
    read("app/dashboard/passes/page.tsx"),
    read("components/site/PublicAccountActions.tsx"),
    read("lib/mock-test-access.ts"),
    read("app/admin/mock-tests/CreateMockTestForm.tsx"),
    read("app/admin/mock-tests/[id]/edit/EditMockTestForm.tsx"),
  ]);

  assert.match(checkout, /already_active/);
  assert.match(checkout, /recentOrder/);
  assert.match(detail, /access_products!inner/);
  assert.match(detail, /\.eq\("access_products\.is_active", true\)/);
  assert.match(detail, /temporarily unavailable/);
  assert.match(catalog, /Paid series/);
  assert.match(dashboard, /Paid series/);
  assert.match(purchases, /Purchased exam series/);
  assert.match(purchases, /Payment history/);
  assert.match(purchases, /Already active/);
  assert.match(accountActions, /\/dashboard\/passes/);
  assert.match(accountActions, /Purchases/);
  assert.doesNotMatch(accessReader, /formData\.get\("price_inr"\)/);
  assert.doesNotMatch(createMock, /Individual-test reference price/);
  assert.doesNotMatch(editMock, /Individual-test reference price/);
});

test("admins can review registrations and series-level sales", async () => {
  const [page, navigation, access] = await Promise.all([
    read("app/admin/students/page.tsx"),
    read("components/admin/AdminNavigation.tsx"),
    read("app/admin/access/page.tsx"),
  ]);

  assert.match(page, /Registered students/);
  assert.match(page, /Paid students/);
  assert.match(page, /Who paid for each Exam Series/);
  assert.match(page, /Recent registrations/);
  assert.match(page, /Recent payment activity/);
  assert.match(page, /profile\?\.role !== "admin"/);
  assert.match(page, /currentLevel !== "aal2"/);
  assert.match(navigation, /Registrations/);
  assert.match(access, /View registrations/);
});
