"use client";

import { useActionState, useState } from "react";
import type { GrowthPopupSettings } from "@/lib/growth-settings";
import { saveGrowthSettings } from "./actions";

export function GrowthSettingsForm({
  initialSettings,
}: {
  initialSettings: GrowthPopupSettings;
}) {
  const [state, formAction, isPending] = useActionState(saveGrowthSettings, {
    success: false,
    message: "",
  });

  const [enabled, setEnabled] = useState(initialSettings.enabled);
  const [minCompletedTests, setMinCompletedTests] = useState(
    initialSettings.minCompletedTests ?? 5,
  );
  const [cooldownDays, setCooldownDays] = useState(
    initialSettings.cooldownDays ?? 7,
  );
  const [supporterCooldownDays, setSupporterCooldownDays] = useState(
    initialSettings.supporterCooldownDays ?? 90,
  );
  const [maxAppearances, setMaxAppearances] = useState(
    initialSettings.maxAppearances ?? 3,
  );
  const [displayDelaySeconds, setDisplayDelaySeconds] = useState(
    initialSettings.displayDelaySeconds ?? 2.5,
  );
  const [targetDashboard, setTargetDashboard] = useState(
    initialSettings.targetRoutes.dashboard ?? true,
  );
  const [targetHome, setTargetHome] = useState(
    initialSettings.targetRoutes.home ?? false,
  );
  const [targetMockTests, setTargetMockTests] = useState(
    initialSettings.targetRoutes.mockTests ?? true,
  );
  const [targetExams, setTargetExams] = useState(
    initialSettings.targetRoutes.exams ?? true,
  );
  const [headline, setHeadline] = useState(initialSettings.headline);
  const [message, setMessage] = useState(initialSettings.message);
  const [primaryButtonText, setPrimaryButtonText] = useState(
    initialSettings.primaryButtonText,
  );
  const [secondaryButtonText, setSecondaryButtonText] = useState(
    initialSettings.secondaryButtonText,
  );
  const [amountsStr, setAmountsStr] = useState(
    (initialSettings.suggestedAmounts || [99, 199, 499, 999]).join(", "),
  );
  const [upiId, setUpiId] = useState(initialSettings.upiId || "");
  const [upiName, setUpiName] = useState(initialSettings.upiName || "");
  const [validityRewardEnabled, setValidityRewardEnabled] = useState(
    initialSettings.validityRewardEnabled ?? false,
  );
  const [validityDaysGranted, setValidityDaysGranted] = useState(
    initialSettings.validityDaysGranted ?? 30,
  );
  const [validityMinContribution, setValidityMinContribution] = useState(
    initialSettings.validityMinContribution ?? 99,
  );
  const [validityMessage, setValidityMessage] = useState(
    initialSettings.validityMessage ??
      "Contribute ₹99 or more to receive +30 days bonus validity extension on all active mock tests.",
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Form Controls Column */}
      <form action={formAction} className="lg:col-span-7 space-y-6">
        {state.message && (
          <div
            className={`rounded-xl border p-4 text-sm font-semibold ${
              state.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {state.message}
          </div>
        )}

        {/* Master Switch Card */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Pop-up & Page Active Status
              </h2>
              <p className="mt-0.5 text-xs text-slate-600">
                Enable or disable the &ldquo;Help Us to Grow&rdquo; page and candidate support pop-up (Disabled = Hide Mode, completely invisible to regular visitors).
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="enabled"
                value="true"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-7 w-12 rounded-full bg-slate-300 transition-colors after:absolute after:top-1 after:left-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-[#0055a2] peer-checked:after:translate-x-5" />
            </label>
          </div>
        </section>

        {/* Audience & Eligibility Rules */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-950">
            Eligibility & Targeting Rules
          </h2>
          <p className="text-xs text-slate-600">
            New users will never be interrupted. Only candidates reaching your completion threshold see this prompt.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label
                htmlFor="minCompletedTests"
                className="block text-xs font-bold text-slate-700"
              >
                Minimum Completed Mock Tests
              </label>
              <input
                type="number"
                id="minCompletedTests"
                name="minCompletedTests"
                min={1}
                max={50}
                value={minCompletedTests}
                onChange={(e) => setMinCompletedTests(parseInt(e.target.value, 10) || 5)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-[#0055a2] focus:outline-none"
              />
              <span className="mt-1 block text-[11px] text-slate-500">
                Threshold gate: Candidates must complete at least this many tests before the pop-up is shown (the pop-up does not display test counts; it addresses them as long-time users).
              </span>
            </div>

            <div>
              <label
                htmlFor="maxAppearances"
                className="block text-xs font-bold text-slate-700"
              >
                Max Total Appearances
              </label>
              <input
                type="number"
                id="maxAppearances"
                name="maxAppearances"
                min={0}
                max={20}
                value={maxAppearances}
                onChange={(e) => setMaxAppearances(parseInt(e.target.value, 10) || 0)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-[#0055a2] focus:outline-none"
              />
              <span className="mt-1 block text-[11px] text-slate-500">
                Max times a candidate can see it (0 = unlimited until supported).
              </span>
            </div>

            <div>
              <label
                htmlFor="cooldownDays"
                className="block text-xs font-bold text-slate-700"
              >
                Dismissal Cooldown (Days)
              </label>
              <input
                type="number"
                id="cooldownDays"
                name="cooldownDays"
                min={0}
                max={60}
                value={cooldownDays}
                onChange={(e) => setCooldownDays(parseInt(e.target.value, 10) || 7)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-[#0055a2] focus:outline-none"
              />
              <span className="mt-1 block text-[11px] text-slate-500">
                Days to wait after candidate clicks &ldquo;Maybe Later&rdquo;.
              </span>
            </div>

            <div>
              <label
                htmlFor="supporterCooldownDays"
                className="block text-xs font-bold text-slate-700"
              >
                Paid Supporter Renewal (Days)
              </label>
              <input
                type="number"
                id="supporterCooldownDays"
                name="supporterCooldownDays"
                min={0}
                max={365}
                value={supporterCooldownDays}
                onChange={(e) => setSupporterCooldownDays(parseInt(e.target.value, 10) || 0)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-[#0055a2] focus:outline-none"
              />
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {[
                  { label: "3 Months (90d)", days: 90 },
                  { label: "6 Months (180d)", days: 180 },
                  { label: "1 Year (365d)", days: 365 },
                  { label: "Never (0d)", days: 0 },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setSupporterCooldownDays(preset.days)}
                    className={`rounded-lg px-2 py-0.5 text-[11px] font-bold transition cursor-pointer ${
                      supporterCooldownDays === preset.days
                        ? "bg-[#0055a2] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <span className="mt-1 block text-[11px] text-slate-500">
                Days after a candidate contributes before the support prompt can appear again (default: 90 days / 3 months; 0 = never show to paid supporters).
              </span>
            </div>

            <div>
              <label
                htmlFor="displayDelaySeconds"
                className="block text-xs font-bold text-slate-700"
              >
                Page Delay (Seconds)
              </label>
              <input
                type="number"
                step="0.5"
                id="displayDelaySeconds"
                name="displayDelaySeconds"
                min={0.5}
                max={30}
                value={displayDelaySeconds}
                onChange={(e) => setDisplayDelaySeconds(parseFloat(e.target.value) || 2.5)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-[#0055a2] focus:outline-none"
              />
              <span className="mt-1 block text-[11px] text-slate-500">
                Gentle delay so pop-up does not feel abrupt on page load.
              </span>
            </div>
          </div>
        </section>

        {/* Page Placements */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-950">
            Display Placements
          </h2>
          <p className="text-xs text-slate-600">
            Choose which sections eligible candidates can encounter this pop-up on.
          </p>

          <div className="space-y-3 pt-1">
            {/* Mock Tests Directory */}
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-slate-300 transition cursor-pointer">
              <input
                type="checkbox"
                name="targetRouteMockTests"
                value="true"
                checked={targetMockTests}
                onChange={(e) => setTargetMockTests(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f2942] focus:ring-[#0f2942]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    Mock Tests
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                    /mock-tests
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  When candidates browse full-length mock tests and syllabus papers.
                </p>
              </div>
            </label>

            {/* Exams Directory */}
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-slate-300 transition cursor-pointer">
              <input
                type="checkbox"
                name="targetRouteExams"
                value="true"
                checked={targetExams}
                onChange={(e) => setTargetExams(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f2942] focus:ring-[#0f2942]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    Exams
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                    /exams
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  When candidates explore competitive exam patterns and recruitment pages.
                </p>
              </div>
            </label>

            {/* Dashboard */}
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-slate-300 transition cursor-pointer">
              <input
                type="checkbox"
                name="targetRouteDashboard"
                value="true"
                checked={targetDashboard}
                onChange={(e) => setTargetDashboard(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f2942] focus:ring-[#0f2942]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    Dashboard (My Progress)
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                    /dashboard
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  When candidates view their attempt history, analysis, and scorecard bookmarks.
                </p>
              </div>
            </label>

            {/* Home Page */}
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-slate-300 transition cursor-pointer">
              <input
                type="checkbox"
                name="targetRouteHome"
                value="true"
                checked={targetHome}
                onChange={(e) => setTargetHome(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f2942] focus:ring-[#0f2942]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    Public Home Page
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                    /
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Only shown to returning candidates who meet the completed tests threshold.
                </p>
              </div>
            </label>
          </div>
        </section>

        {/* Messaging & Customization */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-950">
            Pop-up Copy & Action Buttons
          </h2>

          <div>
            <label
              htmlFor="headline"
              className="block text-xs font-bold text-slate-700"
            >
              Pop-up Headline
            </label>
            <input
              type="text"
              id="headline"
              name="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-[#0055a2] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-xs font-bold text-slate-700"
            >
              Message Body
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm text-slate-900 focus:border-[#0055a2] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="primaryButtonText"
                className="block text-xs font-bold text-slate-700"
              >
                Primary Button Label
              </label>
              <input
                type="text"
                id="primaryButtonText"
                name="primaryButtonText"
                value={primaryButtonText}
                onChange={(e) => setPrimaryButtonText(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-[#0055a2] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="secondaryButtonText"
                className="block text-xs font-bold text-slate-700"
              >
                Secondary Button Label
              </label>
              <input
                type="text"
                id="secondaryButtonText"
                name="secondaryButtonText"
                value={secondaryButtonText}
                onChange={(e) => setSecondaryButtonText(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-[#0055a2] focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Contribution & UPI Configuration */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-950">
            Contribution & UPI Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="upiId"
                className="block text-xs font-bold text-slate-700"
              >
                Official UPI ID
              </label>
              <input
                type="text"
                id="upiId"
                name="upiId"
                placeholder="Optional (leave empty if using Cashfree only)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-[#0f2942] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="upiName"
                className="block text-xs font-bold text-slate-700"
              >
                Payee Account Name
              </label>
              <input
                type="text"
                id="upiName"
                name="upiName"
                placeholder="Optional"
                value={upiName}
                onChange={(e) => setUpiName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-[#0f2942] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="suggestedAmounts"
              className="block text-xs font-bold text-slate-700"
            >
              Suggested Contribution Tiers (Comma-separated)
            </label>
            <input
              type="text"
              id="suggestedAmounts"
              name="suggestedAmounts"
              value={amountsStr}
              onChange={(e) => setAmountsStr(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-[#0f2942] focus:outline-none"
            />
            <span className="mt-1 block text-[11px] text-slate-500">
              Example: 49, 99, 199, 499
            </span>
          </div>
        </section>

        {/* Contribution to Validity Extension */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">⏳</span>
                <h2 className="text-base font-bold text-slate-950">
                  Contribution to Validity Extension
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-slate-600">
                Grant mock test validity bonus to candidates when they make a voluntary contribution.
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="validityRewardEnabled"
                value="true"
                checked={validityRewardEnabled}
                onChange={(e) => setValidityRewardEnabled(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-7 w-12 rounded-full bg-slate-300 transition-colors after:absolute after:top-1 after:left-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-[#0055a2] peer-checked:after:translate-x-5" />
            </label>
          </div>

          {validityRewardEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Validity Days Granted
                </label>
                <input
                  type="number"
                  name="validityDaysGranted"
                  min="1"
                  value={validityDaysGranted}
                  onChange={(e) => setValidityDaysGranted(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-[#0055a2] focus:outline-none"
                />
                <span className="mt-1 block text-[11px] text-slate-500">
                  e.g. 30 days added to candidate&apos;s active series
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Minimum Contribution Required (₹)
                </label>
                <input
                  type="number"
                  name="validityMinContribution"
                  min="1"
                  value={validityMinContribution}
                  onChange={(e) => setValidityMinContribution(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-[#0055a2] focus:outline-none"
                />
                <span className="mt-1 block text-[11px] text-slate-500">
                  e.g. ₹99 minimum to qualify for validity extension
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">
                  Perk Message Displayed to Candidates
                </label>
                <input
                  type="text"
                  name="validityMessage"
                  value={validityMessage}
                  onChange={(e) => setValidityMessage(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0055a2] focus:outline-none"
                />
              </div>
            </div>
          )}
        </section>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-[#0f2942] px-6 py-3 text-sm font-bold text-white shadow-xs hover:bg-[#0a1e30] transition disabled:opacity-60 disabled:cursor-wait cursor-pointer"
          >
            {isPending ? "Saving Settings…" : "Save Pop-up Settings"}
          </button>
        </div>
      </form>

      {/* Live Preview Column */}
      <div className="lg:col-span-5 sticky top-20 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Live Candidate Preview
          </p>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              enabled
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {enabled ? "Active" : "Disabled"}
          </span>
        </div>

        {/* Mock Modal Preview */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />

          <div className="p-5 sm:p-6 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-100 text-sm">
                  🌱
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  100% Ad-Free • Community Supported
                </span>
              </div>
              <span className="text-slate-400 text-xs cursor-default">✕</span>
            </div>

            <h3 className="text-base font-black text-slate-900 leading-snug">
              {headline || "Support Varadhi Prep"}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              All mock tests are free and ad-free. If this platform helps your preparation, consider a small voluntary contribution to keep it running for everyone.
            </p>

            <div className="pt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Quick Contribution Tiers
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-1.5 text-center text-[10px] font-bold text-slate-600">
                  Custom
                </div>
                {[49, 99, 199, 499].map((amt, idx) => (
                  <div
                    key={amt}
                    className={`rounded-lg py-1.5 text-center text-xs font-extrabold ${
                      idx === 0
                        ? "border-2 border-[#059669] bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-[#059669]"
                        : "border border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    ₹{amt}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
                {secondaryButtonText || "Maybe Later"}
              </span>
              <span className="rounded-lg bg-[#059669] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs">
                {primaryButtonText || "Support Varadhi"} (₹49)
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">Preview Notes:</p>
          <p>• Only candidates completing ≥ {minCompletedTests} tests see this (no test count is shown to candidates).</p>
          <p>• Dismissing via &ldquo;{secondaryButtonText}&rdquo; cools down for {cooldownDays} days.</p>
          <p>• Clean news colors strictly enforced; zero distracting emojis.</p>
        </div>
      </div>
    </div>
  );
}
