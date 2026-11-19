import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("growth-settings: defaults and type definition enforce live mode and 5 mock test threshold", () => {
  const filePath = path.resolve("lib/growth-settings.ts");
  assert.ok(fs.existsSync(filePath), "lib/growth-settings.ts must exist");
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(content.includes("DEFAULT_GROWTH_SETTINGS"), "must export DEFAULT_GROWTH_SETTINGS");
  assert.ok(content.includes("enabled: true"), "must default enabled to true for live accessibility");
  assert.ok(content.includes("minCompletedTests: 5"), "must default minCompletedTests to 5");
  assert.ok(content.includes("cooldownDays: 7"), "must default cooldownDays to 7");
  assert.ok(content.includes("maxAppearances: 3"), "must default maxAppearances to 3");
  assert.ok(content.includes("primaryButtonText: \"Support Varadhi\""), "must provide primary button label");
  assert.ok(content.includes("secondaryButtonText: \"Maybe Later\""), "must provide secondary button label");
  assert.ok(content.includes("getGrowthSettings"), "must export getGrowthSettings with cache fallback");
});

test("help-us-to-grow page: hide mode active for user side, admin preview preserved", () => {
  const filePath = path.resolve("app/help-us-to-grow/page.tsx");
  assert.ok(fs.existsSync(filePath), "app/help-us-to-grow/page.tsx must exist");
  const content = fs.readFileSync(filePath, "utf8");

  // User side hide mode: non-admins receive 404 notFound()
  assert.ok(content.includes("notFound"), "must import and invoke notFound for user side");
  assert.ok(content.includes("!settings.enabled && !isPreview"), "must guard user-side access with notFound");
  assert.ok(content.includes("robots: { index: false, follow: false }"), "must disable search engine indexing");

  // Amazon Pay inspired human-made color palette
  assert.ok(content.includes("#131921"), "must use Amazon dark slate heading color #131921");
  assert.ok(content.includes("🚀 Contribute to Varadhi Prep"), "must include rocket before Contribute to Varadhi Prep");
  assert.ok(content.includes("Help Us to Grow"), "must keep Help Us to Grow below");
  assert.ok(content.includes("#c45500"), "must use warm Amazon orange accent #c45500 for subtitle");
  assert.ok(!content.includes("Zero Interruptions"), "must not use Zero Interruptions");
  assert.ok(content.includes("border-l-[#059669]"), "must use shared emerald border for cost cards");
  assert.ok(content.includes("text-emerald-800"), "must use shared emerald color for category words");

  // Operational cost breakdown areas
  assert.ok(content.includes("Cloud & Edge Servers"), "must detail cloud edge compute costs");
  assert.ok(content.includes("Managed Database Hosting"), "must detail database storage costs");
  assert.ok(content.includes("Bilingual Question Verification"), "must detail question curation costs");
  assert.ok(content.includes("Ad-Free"), "must detail ad-free policy");

  // Cashfree integration
  assert.ok(content.includes("CashfreeContributionBox"), "must integrate Cashfree contribution box");

  const cashfreeBox = fs.readFileSync(path.resolve("components/growth/CashfreeContributionBox.tsx"), "utf8");
  assert.ok(!cashfreeBox.includes("Required for Cashfree"), "must not mention required for Cashfree");
  assert.ok(!cashfreeBox.includes("support@varadhiprep.in"), "must not hardcode incorrect support@varadhiprep.in");
  assert.ok(!cashfreeBox.includes("with Cashfree"), "must not show 'with Cashfree' to users");
  assert.ok(cashfreeBox.indexOf("Custom") < cashfreeBox.indexOf("suggestedAmounts.map"), "Custom button must appear before suggested amounts");
  assert.ok(cashfreeBox.includes("Preparing Your Contribution"), "must provide floating loading card");
  assert.ok(!content.includes("Top Editorial Accent Bar"), "must remove top rendering bar");
});

test("sidebar navigation: Help Us to Grow is displayed in public navigation drawer", () => {
  const headerPath = path.resolve("components/site/PublicHeader.tsx");
  const headerContent = fs.readFileSync(headerPath, "utf8");
  assert.ok(headerContent.includes("/help-us-to-grow"), "PublicHeader must include /help-us-to-grow in navigation");
  assert.ok(headerContent.includes("Help Us to Grow"), "PublicHeader must label Help Us to Grow in navigation");
});

test("admin workspace: navigation and growth settings control panel are configured", () => {
  const navPath = path.resolve("components/admin/AdminNavigation.tsx");
  const navContent = fs.readFileSync(navPath, "utf8");
  assert.ok(navContent.includes("/admin/growth-settings"), "AdminNavigation must link to /admin/growth-settings");
  assert.ok(navContent.includes("Help Us Grow Pop-up"), "AdminNavigation must label Help Us Grow Pop-up");

  const adminPagePath = path.resolve("app/admin/growth-settings/page.tsx");
  assert.ok(fs.existsSync(adminPagePath), "admin growth settings page must exist");

  const adminFormPath = path.resolve("app/admin/growth-settings/GrowthSettingsForm.tsx");
  assert.ok(fs.existsSync(adminFormPath), "admin growth settings form must exist");
  const formContent = fs.readFileSync(adminFormPath, "utf8");
  assert.ok(formContent.includes("minCompletedTests"), "admin form must control minCompletedTests");
  assert.ok(formContent.includes("cooldownDays"), "admin form must control cooldownDays");
  assert.ok(formContent.includes("maxAppearances"), "admin form must control maxAppearances");
  assert.ok(formContent.includes("Live Candidate Preview"), "admin form must render live preview");

  const actionsPath = path.resolve("app/admin/growth-settings/actions.ts");
  assert.ok(fs.existsSync(actionsPath), "admin growth settings actions must exist");
});

test("support modal: SupportPromptModal enforces eligibility and graceful dismissal", () => {
  const modalPath = path.resolve("components/growth/SupportPromptModal.tsx");
  assert.ok(fs.existsSync(modalPath), "SupportPromptModal must exist");
  const modalContent = fs.readFileSync(modalPath, "utf8");

  assert.ok(modalContent.includes("minCompletedTests ?? 5"), "must check minCompletedTests threshold");
  assert.ok(modalContent.includes("varadhi_growth_dismissed_at"), "must track dismissal timestamp");
  assert.ok(modalContent.includes("varadhi_growth_appearance_count"), "must track appearance count");
  assert.ok(modalContent.includes("varadhi_growth_supported_at"), "must track support completion");
  assert.ok(modalContent.includes("settings.primaryButtonText"), "must render primary button");
  assert.ok(modalContent.includes("settings.secondaryButtonText"), "must render secondary button");
});

test("dashboard: integrates SupportPromptModal conditionally with server-verified total attempts", () => {
  const dashPath = path.resolve("app/dashboard/page.tsx");
  const dashContent = fs.readFileSync(dashPath, "utf8");

  assert.ok(dashContent.includes("SupportPromptModal"), "dashboard must import SupportPromptModal");
  assert.ok(dashContent.includes("getGrowthSettings"), "dashboard must fetch getGrowthSettings");
  assert.ok(dashContent.includes("completedAttempts={totalAttempts}"), "dashboard must pass server-verified totalAttempts");
});

test("growth payment: thank you banner requires verified paid status, never shown on cancellation", () => {
  const actionPath = path.resolve("app/actions/growth-payment.ts");
  const actionContent = fs.readFileSync(actionPath, "utf8");
  assert.ok(!actionContent.includes("status=thank_you"), "returnPath must not assume thank_you status in action");
  assert.ok(actionContent.includes("order_id="), "returnPath must pass order_id for server verification");

  const pagePath = path.resolve("app/help-us-to-grow/page.tsx");
  const pageContent = fs.readFileSync(pagePath, "utf8");
  assert.ok(pageContent.includes("getCashfreeOrderStatus"), "page must verify order status via Cashfree API");
  assert.ok(pageContent.includes("isVerifiedPaid"), "thank you banner must be gated on isVerifiedPaid");
  assert.ok(pageContent.includes("isPaymentCancelled"), "page must track isPaymentCancelled");
  assert.ok(!pageContent.includes("isThankYou &&"), "must not blindly use unverified isThankYou flag");
});
