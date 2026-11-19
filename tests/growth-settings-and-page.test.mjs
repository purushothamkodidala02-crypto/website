import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("growth-settings: defaults and type definition enforce minimum 5 mock test threshold", () => {
  const filePath = path.resolve("lib/growth-settings.ts");
  assert.ok(fs.existsSync(filePath), "lib/growth-settings.ts must exist");
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(content.includes("DEFAULT_GROWTH_SETTINGS"), "must export DEFAULT_GROWTH_SETTINGS");
  assert.ok(content.includes("minCompletedTests: 5"), "must default minCompletedTests to 5");
  assert.ok(content.includes("cooldownDays: 7"), "must default cooldownDays to 7");
  assert.ok(content.includes("maxAppearances: 3"), "must default maxAppearances to 3");
  assert.ok(content.includes("primaryButtonText: \"Support Varadhi\""), "must provide primary button label");
  assert.ok(content.includes("secondaryButtonText: \"Maybe Later\""), "must provide secondary button label");
  assert.ok(content.includes("getGrowthSettings"), "must export getGrowthSettings with cache fallback");
});

test("help-us-to-grow page: exists, adheres to news broadsheet styling and Cashfree integration", () => {
  const filePath = path.resolve("app/help-us-to-grow/page.tsx");
  assert.ok(fs.existsSync(filePath), "app/help-us-to-grow/page.tsx must exist");
  const content = fs.readFileSync(filePath, "utf8");

  // Editorial news color palette
  assert.ok(content.includes("#0055a2"), "must use news primary navy blue #0055a2");
  assert.ok(content.includes("#0f172a"), "must use news slate heading color #0f172a");
  assert.ok(content.includes("#fb8916"), "must use news accent line #fb8916");
  assert.ok(content.includes("#cde7f7"), "must use news border blue #cde7f7");

  // Operational cost breakdown areas
  assert.ok(content.includes("Cloud & Edge Servers"), "must detail cloud edge compute costs");
  assert.ok(content.includes("Managed Database Hosting"), "must detail database storage costs");
  assert.ok(content.includes("Bilingual Question Verification"), "must detail question curation costs");
  assert.ok(content.includes("100% Ad-Free Guarantee"), "must detail ad-free policy");

  // Policy on asking only after 5+ mock tests
  assert.ok(content.includes("5 or more tests"), "must state 5+ mock tests completion policy");

  // Cashfree integration
  assert.ok(content.includes("CashfreeContributionBox"), "must integrate Cashfree contribution box");

  const cashfreeBoxPath = path.resolve("components/growth/CashfreeContributionBox.tsx");
  assert.ok(fs.existsSync(cashfreeBoxPath), "CashfreeContributionBox component must exist");
  const cashfreeBoxContent = fs.readFileSync(cashfreeBoxPath, "utf8");
  assert.ok(cashfreeBoxContent.includes("Cashfree"), "must use Cashfree JS SDK");
  assert.ok(cashfreeBoxContent.includes("initiateCashfreeGrowthContribution"), "must invoke Cashfree contribution action");
  assert.ok(cashfreeBoxContent.includes("CopyUpiButton"), "must integrate UPI copying fallback");
});

test("sidebar navigation: PublicHeader and PublicNavigationMenu contain Help Us to Grow", () => {
  const headerPath = path.resolve("components/site/PublicHeader.tsx");
  const headerContent = fs.readFileSync(headerPath, "utf8");
  assert.ok(headerContent.includes("/help-us-to-grow"), "PublicHeader must route to /help-us-to-grow");
  assert.ok(headerContent.includes("Help Us to Grow"), "PublicHeader must label 'Help Us to Grow'");
  assert.ok(headerContent.includes("icon: \"grow\""), "PublicHeader must specify grow icon");

  const menuPath = path.resolve("components/site/PublicNavigationMenu.tsx");
  const menuContent = fs.readFileSync(menuPath, "utf8");
  assert.ok(menuContent.includes("\"grow\""), "PublicNavigationMenu must support grow icon type");
  assert.ok(menuContent.includes("name === \"grow\""), "PublicNavigationMenu must render SVG for grow icon");
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
