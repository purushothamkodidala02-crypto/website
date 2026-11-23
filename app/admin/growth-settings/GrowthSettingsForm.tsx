"use client";

import { useActionState, useState } from "react";
import type { GrowthPopupSettings } from "@/lib/growth-settings";
import { DEFAULT_SURVEY_SETTINGS } from "@/lib/growth-settings";
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

  const [activeSubTab, setActiveSubTab] = useState<"survey" | "contribution" | "threshold">("survey");
  const [previewTab, setPreviewTab] = useState<"survey" | "contribution">("survey");

  // Master Switch
  const [enabled, setEnabled] = useState(initialSettings.enabled);

  // Common Threshold (dividing Stage 1 and Stage 2)
  const [minCompletedTests, setMinCompletedTests] = useState(
    initialSettings.minCompletedTests ?? 5,
  );

  // Stage 1: Survey Form States (1 to 4 tests completed)
  const initialSurvey = initialSettings.survey || DEFAULT_SURVEY_SETTINGS;
  const [surveyEnabled, setSurveyEnabled] = useState(initialSurvey.enabled ?? true);
  const [surveyMinCompletedTests, setSurveyMinCompletedTests] = useState(
    initialSurvey.minCompletedTests ?? 1,
  );
  const [surveyHeadline, setSurveyHeadline] = useState(
    initialSurvey.headline || "Help Us Grow Varadhi Prep",
  );
  const [surveyDescription, setSurveyDescription] = useState(
    initialSurvey.description ||
      "All mock tests on Varadhi Prep are 100% free and ad-free. Tell us how your preparation is going and which mock tests you need next!",
  );
  const [surveySubmitButtonText, setSurveySubmitButtonText] = useState(
    initialSurvey.submitButtonText || "Submit & Help Us Grow",
  );
  const [surveyDismissButtonText, setSurveyDismissButtonText] = useState(
    initialSurvey.dismissButtonText || "Maybe Later",
  );
  const [surveyCooldownDays, setSurveyCooldownDays] = useState(
    initialSurvey.cooldownDays ?? 3,
  );
  const [surveyMaxAppearances, setSurveyMaxAppearances] = useState(
    initialSurvey.maxAppearances ?? 2,
  );
  const [surveyDisplayDelaySeconds, setSurveyDisplayDelaySeconds] = useState(
    initialSurvey.displayDelaySeconds ?? 2.5,
  );
  const [surveyTargetDashboard, setSurveyTargetDashboard] = useState(
    initialSurvey.targetRoutes?.dashboard ?? true,
  );
  const [surveyTargetMockTests, setSurveyTargetMockTests] = useState(
    initialSurvey.targetRoutes?.mockTests ?? true,
  );
  const [surveyTargetHome, setSurveyTargetHome] = useState(
    initialSurvey.targetRoutes?.home ?? false,
  );
  const [surveyTargetExams, setSurveyTargetExams] = useState(
    initialSurvey.targetRoutes?.exams ?? true,
  );
  const [surveyAskTargetExam, setSurveyAskTargetExam] = useState(
    initialSurvey.askTargetExam ?? true,
  );
  const [surveyAskMediumPreference, setSurveyAskMediumPreference] = useState(
    initialSurvey.askMediumPreference ?? true,
  );
  const [surveyAskSuggestions, setSurveyAskSuggestions] = useState(
    initialSurvey.askSuggestions ?? true,
  );
  const [surveyAskPhone, setSurveyAskPhone] = useState(
    initialSurvey.askPhone ?? false,
  );

  // Stage 2: Contribution Pop-up States (5+ tests completed)
  const [cooldownDays, setCooldownDays] = useState(
    initialSettings.cooldownDays ?? 7,
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
    (initialSettings.suggestedAmounts || [49, 99, 199, 499]).join(", "),
  );
  const [upiId, setUpiId] = useState(initialSettings.upiId || "");
  const [upiName, setUpiName] = useState(initialSettings.upiName || "");

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
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base font-bold text-slate-950">
                  Growth Engine Master Switch
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-slate-600">
                Master switch for both Stage 1 (Survey) and Stage 2 (Support) pop-ups across the site.
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

        {/* Lifecycle Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab("survey");
              setPreviewTab("survey");
            }}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer border ${
              activeSubTab === "survey"
                ? "border-teal-700 bg-teal-800 text-white shadow-xs"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>📝 Stage 1: Survey Form (1–4 Tests)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab("contribution");
              setPreviewTab("contribution");
            }}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer border ${
              activeSubTab === "contribution"
                ? "border-emerald-700 bg-emerald-800 text-white shadow-xs"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>💖 Stage 2: Support Pop-up (5+ Tests)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("threshold")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer border ${
              activeSubTab === "threshold"
                ? "border-slate-800 bg-slate-900 text-white shadow-xs"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>⚙️ Milestones & Routing</span>
          </button>
        </div>

        {/* SUBTAB 1: STAGE 1 SURVEY FORM (1-4 TESTS) */}
        {activeSubTab === "survey" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Survey Status & Threshold */}
            <section className="rounded-2xl border border-teal-200/80 bg-teal-50/40 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-teal-950 flex items-center gap-2">
                    <span>📝</span> Stage 1: Post-Test Growth Survey Form
                  </h3>
                  <p className="mt-0.5 text-xs text-teal-900/80">
                    Triggers for candidates who have completed at least 1 mock test (and fewer than {minCompletedTests} tests). Brand new visitors with 0 tests are ignored.
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name="surveyEnabled"
                    value="true"
                    checked={surveyEnabled}
                    onChange={(e) => setSurveyEnabled(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-teal-700 peer-checked:after:translate-x-5" />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">
                    Min Tests to Trigger (Default: 1)
                  </label>
                  <input
                    type="number"
                    name="surveyMinCompletedTests"
                    min={1}
                    max={10}
                    value={surveyMinCompletedTests}
                    onChange={(e) => setSurveyMinCompletedTests(parseInt(e.target.value, 10) || 1)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                  <span className="mt-0.5 block text-[10px] text-slate-500">
                    0-test users are ignored
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700">
                    Cooldown if Dismissed (Days)
                  </label>
                  <input
                    type="number"
                    name="surveyCooldownDays"
                    min={0}
                    max={30}
                    value={surveyCooldownDays}
                    onChange={(e) => setSurveyCooldownDays(parseInt(e.target.value, 10) || 3)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                  <span className="mt-0.5 block text-[10px] text-slate-500">
                    Days before next prompt
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700">
                    Max Appearances
                  </label>
                  <input
                    type="number"
                    name="surveyMaxAppearances"
                    min={1}
                    max={10}
                    value={surveyMaxAppearances}
                    onChange={(e) => setSurveyMaxAppearances(parseInt(e.target.value, 10) || 2)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                  <span className="mt-0.5 block text-[10px] text-slate-500">
                    Total times shown per student
                  </span>
                </div>
              </div>
            </section>

            {/* Questions to Include */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-950">
                Form Questions to Include
              </h3>
              <p className="text-xs text-slate-600">
                Toggle questions shown in the 1st test survey modal. Keep it quick (under 30 seconds) for maximum submission rate.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="surveyAskTargetExam"
                    value="true"
                    checked={surveyAskTargetExam}
                    onChange={(e) => setSurveyAskTargetExam(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">1. Target Exam Selection</span>
                    <span className="block text-[11px] text-slate-500">APPSC, TGPSC, Police, DSC, SSC</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="surveyAskMediumPreference"
                    value="true"
                    checked={surveyAskMediumPreference}
                    onChange={(e) => setSurveyAskMediumPreference(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">2. Medium Preference</span>
                    <span className="block text-[11px] text-slate-500">Bilingual, Telugu, English</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="surveyAskSuggestions"
                    value="true"
                    checked={surveyAskSuggestions}
                    onChange={(e) => setSurveyAskSuggestions(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">3. Missing Tests & Suggestions</span>
                    <span className="block text-[11px] text-slate-500">Free text input for student needs</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="surveyAskPhone"
                    value="true"
                    checked={surveyAskPhone}
                    onChange={(e) => setSurveyAskPhone(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">4. Optional WhatsApp / Phone</span>
                    <span className="block text-[11px] text-slate-500">For notifying when tests release</span>
                  </div>
                </label>
              </div>
            </section>

            {/* Survey Copywriting */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-950">
                Survey Copywriting & Button Labels
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Headline</label>
                  <input
                    type="text"
                    name="surveyHeadline"
                    value={surveyHeadline}
                    onChange={(e) => setSurveyHeadline(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Description Message</label>
                  <textarea
                    rows={2}
                    name="surveyDescription"
                    value={surveyDescription}
                    onChange={(e) => setSurveyDescription(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Submit Button Label</label>
                    <input
                      type="text"
                      name="surveySubmitButtonText"
                      value={surveySubmitButtonText}
                      onChange={(e) => setSurveySubmitButtonText(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Dismiss Button Label</label>
                    <input
                      type="text"
                      name="surveyDismissButtonText"
                      value={surveyDismissButtonText}
                      onChange={(e) => setSurveyDismissButtonText(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* SUBTAB 2: STAGE 2 CONTRIBUTION PROMPT (5+ TESTS) */}
        {activeSubTab === "contribution" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Contribution Message */}
            <section className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5 sm:p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <span>💖</span> Stage 2: Voluntary Support Pop-up (5+ Tests)
              </h3>
              <p className="text-xs text-emerald-900/80">
                Shown strictly to serious candidates who reached ≥ {minCompletedTests} completed mock tests. Free candidates who haven&apos;t taken 5 tests will never be asked for contributions.
              </p>
            </section>

            {/* Support Copy */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-950">
                Pop-up Copy & Messaging
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700">Modal Headline</label>
                <input
                  type="text"
                  name="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Support Message</label>
                <textarea
                  rows={3}
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Primary Button Label</label>
                  <input
                    type="text"
                    name="primaryButtonText"
                    value={primaryButtonText}
                    onChange={(e) => setPrimaryButtonText(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Secondary Button Label</label>
                  <input
                    type="text"
                    name="secondaryButtonText"
                    value={secondaryButtonText}
                    onChange={(e) => setSecondaryButtonText(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Amounts & UPI */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-950">
                Contribution Amounts & UPI Details
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Suggested Contribution Tiers (Comma-separated)
                </label>
                <input
                  type="text"
                  name="suggestedAmounts"
                  value={amountsStr}
                  onChange={(e) => setAmountsStr(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
                <span className="mt-1 block text-[11px] text-slate-500">
                  Example: 49, 99, 199, 499
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Official UPI ID</label>
                  <input
                    type="text"
                    name="upiId"
                    placeholder="Optional (if accepting direct UPI)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Payee Account Name</label>
                  <input
                    type="text"
                    name="upiName"
                    placeholder="Optional"
                    value={upiName}
                    onChange={(e) => setUpiName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Dismissal Cooldown (Days)</label>
                  <input
                    type="number"
                    name="cooldownDays"
                    min={0}
                    max={60}
                    value={cooldownDays}
                    onChange={(e) => setCooldownDays(parseInt(e.target.value, 10) || 7)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Max Total Appearances</label>
                  <input
                    type="number"
                    name="maxAppearances"
                    min={0}
                    max={20}
                    value={maxAppearances}
                    onChange={(e) => setMaxAppearances(parseInt(e.target.value, 10) || 3)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* SUBTAB 3: MILESTONES & ROUTING */}
        {activeSubTab === "threshold" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Threshold Master Rule */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-950">
                User Lifecycle Milestone Gate
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This cutoff determines when a student transitions from the <strong>Stage 1 Survey</strong> to the <strong>Stage 2 Support Pop-up</strong>.
              </p>

              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <label className="block text-xs font-bold text-slate-900">
                  Cutoff Threshold: Completed Mock Tests
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    name="minCompletedTests"
                    min={2}
                    max={20}
                    value={minCompletedTests}
                    onChange={(e) => setMinCompletedTests(parseInt(e.target.value, 10) || 5)}
                    className="w-28 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-base font-extrabold text-slate-900 focus:border-amber-600 focus:outline-none"
                  />
                  <span className="text-xs text-slate-600">
                    tests completed
                  </span>
                </div>
                <div className="mt-3 text-xs space-y-1 text-slate-700">
                  <p>• <strong>0 tests:</strong> Ignored (zero pop-ups for brand new users).</p>
                  <p>• <strong>1 to {minCompletedTests - 1} tests:</strong> Sees Stage 1 &ldquo;Help Us to Grow&rdquo; Survey Form.</p>
                  <p>• <strong>&ge; {minCompletedTests} tests:</strong> Eligible for Stage 2 &ldquo;Support Varadhi&rdquo; Voluntary Contribution.</p>
                </div>
              </div>
            </section>

            {/* Placements for Both Stages */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-950">
                Page Placements
              </h3>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-700">Stage 1 Survey Form Placements:</p>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-xs cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      name="surveyTargetRouteDashboard"
                      value="true"
                      checked={surveyTargetDashboard}
                      onChange={(e) => setSurveyTargetDashboard(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600"
                    />
                    <span>Dashboard (/dashboard)</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-xs cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      name="surveyTargetRouteMockTests"
                      value="true"
                      checked={surveyTargetMockTests}
                      onChange={(e) => setSurveyTargetMockTests(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600"
                    />
                    <span>Mock Tests (/mock-tests)</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-xs cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      name="surveyTargetRouteExams"
                      value="true"
                      checked={surveyTargetExams}
                      onChange={(e) => setSurveyTargetExams(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600"
                    />
                    <span>Exam Portals (/exams)</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-xs cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      name="surveyTargetRouteHome"
                      value="true"
                      checked={surveyTargetHome}
                      onChange={(e) => setSurveyTargetHome(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600"
                    />
                    <span>Home Page (/)</span>
                  </label>
                </div>

                <p className="text-xs font-semibold text-slate-700 pt-2">Stage 2 Contribution Prompt Placements:</p>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-xs cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      name="targetRouteDashboard"
                      value="true"
                      checked={targetDashboard}
                      onChange={(e) => setTargetDashboard(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600"
                    />
                    <span>Dashboard (/dashboard)</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-xs cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      name="targetRouteMockTests"
                      value="true"
                      checked={targetMockTests}
                      onChange={(e) => setTargetMockTests(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600"
                    />
                    <span>Mock Tests (/mock-tests)</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-xs cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      name="targetRouteExams"
                      value="true"
                      checked={targetExams}
                      onChange={(e) => setTargetExams(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600"
                    />
                    <span>Exam Portals (/exams)</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-xs cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      name="targetRouteHome"
                      value="true"
                      checked={targetHome}
                      onChange={(e) => setTargetHome(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600"
                    />
                    <span>Home Page (/)</span>
                  </label>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Hidden inputs to preserve other tab state on submit */}
        {activeSubTab !== "survey" && (
          <>
            <input type="hidden" name="surveyEnabled" value={surveyEnabled ? "true" : "false"} />
            <input type="hidden" name="surveyMinCompletedTests" value={surveyMinCompletedTests} />
            <input type="hidden" name="surveyHeadline" value={surveyHeadline} />
            <input type="hidden" name="surveyDescription" value={surveyDescription} />
            <input type="hidden" name="surveySubmitButtonText" value={surveySubmitButtonText} />
            <input type="hidden" name="surveyDismissButtonText" value={surveyDismissButtonText} />
            <input type="hidden" name="surveyCooldownDays" value={surveyCooldownDays} />
            <input type="hidden" name="surveyMaxAppearances" value={surveyMaxAppearances} />
            <input type="hidden" name="surveyDisplayDelaySeconds" value={surveyDisplayDelaySeconds} />
            {surveyTargetDashboard && <input type="hidden" name="surveyTargetRouteDashboard" value="true" />}
            {surveyTargetMockTests && <input type="hidden" name="surveyTargetRouteMockTests" value="true" />}
            {surveyTargetHome && <input type="hidden" name="surveyTargetRouteHome" value="true" />}
            {surveyTargetExams && <input type="hidden" name="surveyTargetRouteExams" value="true" />}
            {surveyAskTargetExam && <input type="hidden" name="surveyAskTargetExam" value="true" />}
            {surveyAskMediumPreference && <input type="hidden" name="surveyAskMediumPreference" value="true" />}
            {surveyAskSuggestions && <input type="hidden" name="surveyAskSuggestions" value="true" />}
            {surveyAskPhone && <input type="hidden" name="surveyAskPhone" value="true" />}
          </>
        )}

        {activeSubTab !== "contribution" && (
          <>
            <input type="hidden" name="headline" value={headline} />
            <input type="hidden" name="message" value={message} />
            <input type="hidden" name="primaryButtonText" value={primaryButtonText} />
            <input type="hidden" name="secondaryButtonText" value={secondaryButtonText} />
            <input type="hidden" name="suggestedAmounts" value={amountsStr} />
            <input type="hidden" name="upiId" value={upiId} />
            <input type="hidden" name="upiName" value={upiName} />
            <input type="hidden" name="cooldownDays" value={cooldownDays} />
            <input type="hidden" name="maxAppearances" value={maxAppearances} />
            <input type="hidden" name="displayDelaySeconds" value={displayDelaySeconds} />
            {targetDashboard && <input type="hidden" name="targetRouteDashboard" value="true" />}
            {targetMockTests && <input type="hidden" name="targetRouteMockTests" value="true" />}
            {targetHome && <input type="hidden" name="targetRouteHome" value="true" />}
            {targetExams && <input type="hidden" name="targetRouteExams" value="true" />}
          </>
        )}

        {activeSubTab !== "threshold" && (
          <input type="hidden" name="minCompletedTests" value={minCompletedTests} />
        )}

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-[#0f2942] px-6 py-3 text-sm font-bold text-white shadow-xs hover:bg-[#0a1e30] transition disabled:opacity-60 disabled:cursor-wait cursor-pointer"
          >
            {isPending ? "Saving Settings…" : "Save All Growth Settings"}
          </button>
        </div>
      </form>

      {/* Live Preview Column */}
      <div className="lg:col-span-5 sticky top-20 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Live Modal Preview
          </p>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setPreviewTab("survey")}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                previewTab === "survey"
                  ? "bg-white text-teal-800 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Stage 1 (1–4)
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab("contribution")}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                previewTab === "contribution"
                  ? "bg-white text-emerald-800 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Stage 2 (5+)
            </button>
          </div>
        </div>

        {/* PREVIEW: STAGE 1 SURVEY */}
        {previewTab === "survey" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg animate-in fade-in duration-150">
            <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 via-emerald-500 to-amber-500" />

            <div className="p-5 sm:p-6 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-teal-100 text-sm">
                    🤝
                  </div>
                  <span className="inline-flex items-center rounded-full bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                    Help Us Grow Varadhi Prep
                  </span>
                </div>
                <span className="text-slate-400 text-xs cursor-default">✕</span>
              </div>

              <h3 className="text-base font-black text-slate-900 leading-snug">
                {surveyHeadline || "Help Us Grow Varadhi Prep"}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {surveyDescription || "All mock tests are free and ad-free. Tell us how your preparation is going!"}
              </p>

              <div className="space-y-2.5 pt-1 text-xs">
                {surveyAskTargetExam && (
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px] mb-1">1. Target Exam</span>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 font-semibold">
                      <span className="border rounded-md px-2 py-1 bg-teal-50 border-teal-500 text-teal-950">APPSC (Group 1/2)</span>
                      <span className="border rounded-md px-2 py-1 bg-slate-50 border-slate-200">TGPSC (Group 1/2/3)</span>
                      <span className="border rounded-md px-2 py-1 bg-slate-50 border-slate-200">Police (SI/Constable)</span>
                      <span className="border rounded-md px-2 py-1 bg-slate-50 border-slate-200">AP/TG DSC & TET</span>
                    </div>
                  </div>
                )}

                {surveyAskMediumPreference && (
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px] mb-1">2. Preferred Medium</span>
                    <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-600 font-semibold text-center">
                      <span className="border rounded-md px-1.5 py-1 bg-teal-50 border-teal-500 text-teal-950">Bilingual</span>
                      <span className="border rounded-md px-1.5 py-1 bg-slate-50 border-slate-200">Telugu</span>
                      <span className="border rounded-md px-1.5 py-1 bg-slate-50 border-slate-200">English</span>
                    </div>
                  </div>
                )}

                {surveyAskSuggestions && (
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px] mb-1">3. Missing Tests / Suggestions</span>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-[10px] text-slate-400">
                      e.g. Current affairs weekly mocks, Group 2 Paper 2...
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
                  {surveyDismissButtonText || "Maybe Later"}
                </span>
                <span className="rounded-lg bg-teal-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs">
                  {surveySubmitButtonText || "Submit & Help Us Grow"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW: STAGE 2 CONTRIBUTION */}
        {previewTab === "contribution" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg animate-in fade-in duration-150">
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
        )}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">Funnel Rules:</p>
          <p>• <strong>0 Tests:</strong> No pop-ups at all (free exploration).</p>
          <p>• <strong>1–{minCompletedTests - 1} Tests:</strong> Candidates see the Stage 1 Survey Form.</p>
          <p>• <strong>{minCompletedTests}+ Tests:</strong> Candidates see the Stage 2 Support Modal.</p>
        </div>
      </div>
    </div>
  );
}
