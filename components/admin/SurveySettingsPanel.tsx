"use client";

import { useState } from "react";
import type { SurveySettings } from "@/lib/surveys/survey-settings";
import { DEFAULT_SURVEY_SETTINGS } from "@/lib/surveys/survey-settings";

interface SurveySettingsPanelProps {
  surveyId: string;
  surveyTitle: string;
  initialSettings?: Partial<SurveySettings> | null;
  onSave: (newSettings: SurveySettings) => Promise<boolean | void>;
  onClose?: () => void;
}

export function SurveySettingsPanel({
  surveyId,
  surveyTitle,
  initialSettings,
  onSave,
  onClose,
}: SurveySettingsPanelProps) {
  const [settings, setSettings] = useState<SurveySettings>(() => ({
    ...DEFAULT_SURVEY_SETTINGS,
    ...(initialSettings || {}),
    targetRoutes: {
      ...DEFAULT_SURVEY_SETTINGS.targetRoutes,
      ...(initialSettings?.targetRoutes || {}),
    },
    specificTargetUsers: initialSettings?.specificTargetUsers || [],
  }));

  const [activeTab, setActiveTab] = useState<"targeting" | "display" | "rewards" | "frequency">("targeting");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [specificUsersText, setSpecificUsersText] = useState(
    (initialSettings?.specificTargetUsers || []).join("\n"),
  );

  const handleSpecificUsersChange = (text: string) => {
    setSpecificUsersText(text);
    const users = text
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter(Boolean);
    setSettings((s) => ({ ...s, specificTargetUsers: users }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(`varadhi_survey_settings_${surveyId}`, JSON.stringify(settings));
      }
      await onSave(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset all settings for this survey to default rules?")) {
      setSettings(DEFAULT_SURVEY_SETTINGS);
      setSpecificUsersText("");
      if (typeof window !== "undefined") {
        localStorage.removeItem(`varadhi_survey_settings_${surveyId}`);
      }
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-6 space-y-5 text-slate-800 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span>⚙️</span> Survey Conditions, Targeting &amp; Controls
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure who can see &ldquo;{surveyTitle}&rdquo;, mock test conditions, rewards offered, and display styles.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
            >
              ✕ Close
            </button>
          )}
        </div>
      </div>

      {/* Internal Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("targeting")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            activeTab === "targeting"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          🎯 1. Who Can See (Audience Rules)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rewards")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            activeTab === "rewards"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          🎁 2. What They Receive (Validity / Reward)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("display")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            activeTab === "display"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          🎨 3. Side Button &amp; Display Style
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("frequency")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            activeTab === "frequency"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          ⏱️ 4. Frequency &amp; Limits
        </button>
      </div>

      {/* Tab 1: Audience & Targeting Engine */}
      {activeTab === "targeting" && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* User Lifecycle & Mock Test Criteria */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Candidate Lifecycle Criteria
              </span>
              <h5 className="text-xs font-bold text-slate-900 mt-0.5">
                Target by mock tests written &amp; user stage
              </h5>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Student Stage</label>
              <select
                value={settings.targetUserType || "all"}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    targetUserType: e.target.value as SurveySettings["targetUserType"],
                  }))
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
              >
                <option value="all">All Students &amp; Visitors</option>
                <option value="new_users">New Users Only (0 mock tests taken or new signups)</option>
                <option value="returning_users">Active / Returning Students (Taken mock tests)</option>
                <option value="specific_users">Specific Candidates Only (Whitelisted emails/phones)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Min Mock Tests Taken
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.minMockTestsTaken ?? 0}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      minMockTestsTaken: Math.max(0, parseInt(e.target.value || "0", 10)),
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">0 = any, 1 = written 1+, 5 = written 5+</span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Max Mock Tests Taken <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="No upper limit"
                  value={settings.maxMockTestsTaken ?? ""}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      maxMockTestsTaken: e.target.value ? parseInt(e.target.value, 10) : null,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Set 0 to strictly target users before test</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Target State
              </label>
              <select
                value={settings.targetState || "all"}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    targetState: e.target.value as any,
                  }))
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
              >
                <option value="all">All States (Both Telangana &amp; Andhra Pradesh)</option>
                <option value="telangana">Telangana Candidates (TG Police, TGPSC)</option>
                <option value="andhra_pradesh">Andhra Pradesh Candidates (AP Endowment, APPSC)</option>
              </select>
            </div>
          </div>

          {/* Exam Specific & Candidate Whitelist */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Exam &amp; Specific Candidate Targeting
              </span>
              <h5 className="text-xs font-bold text-slate-900 mt-0.5">
                Filter by exam attempted or individual users
              </h5>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Target Exam / Series</label>
              <select
                value={settings.targetExamSlug || "all"}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    targetExamSlug: e.target.value,
                    targetAudience: e.target.value === "ap-endowment-officer" ? "ap_endowment" : e.target.value === "telangana-police-constable" ? "tg_police" : "all",
                  }))
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
              >
                <option value="all">All Exams</option>
                <option value="telangana-police-constable">Telangana Police Constable (TSSPDCL / Police)</option>
                <option value="ap-endowment-officer">AP Endowment Officer (Paper 1 &amp; Paper 2)</option>
                <option value="tgpcb-assistant-scientist">TGPCB Assistant Scientist Notification</option>
                <option value="appsc-group2">APPSC Group 2 Series</option>
                <option value="tgpsc-group1">TGPSC Group 1 Series</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Target Specific Candidates <span className="text-slate-400 font-normal">(Emails or Mobile numbers)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Enter candidate emails or phone numbers, separated by comma or new line"
                value={specificUsersText}
                onChange={(e) => handleSpecificUsersChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 font-mono placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">
                {settings.specificTargetUsers?.length || 0} candidate(s) explicitly targeted. Leave empty for open targeting.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: What They Are Receiving (Rewards / Validity Bonus) */}
      {activeTab === "rewards" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Incentive &amp; Reward Configuration
            </span>
            <h5 className="text-xs font-bold text-slate-900 mt-0.5">
              What students receive when they complete this survey (Validity extension, study notes, or free pass)
            </h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Reward / Incentive Type</label>
              <select
                value={settings.rewardType || "none"}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    rewardType: e.target.value as any,
                  }))
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
              >
                <option value="none">None (Standard Voluntary Feedback)</option>
                <option value="validity_extension">⏳ Mock Test Validity Extension (+30 or +60 Days)</option>
                <option value="free_pass">🎟️ Free Mock Test Series Pass</option>
                <option value="study_notes">📚 Free High-Yield Study Notes / Blueprint PDF</option>
                <option value="discount_code">🏷️ Special Discount Coupon Code</option>
                <option value="custom">✨ Custom Reward / Direct Mentor Call</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Reward Display Title</label>
              <input
                type="text"
                placeholder="e.g. Free High-Yield Blueprint PDF"
                value={settings.rewardTitle || ""}
                onChange={(e) => setSettings((s) => ({ ...s, rewardTitle: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Reward Value / Code <span className="text-slate-400 font-normal">(e.g. +30 Days or Coupon)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. +30_DAYS, CODE: VARADHI2026, or PDF_LINK"
                value={settings.rewardValue || ""}
                onChange={(e) => setSettings((s) => ({ ...s, rewardValue: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Student Thank-You &amp; Reward Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Thank you! Your account validity has been credited with 30 extra days."
                value={settings.rewardDescription || ""}
                onChange={(e) => setSettings((s) => ({ ...s, rewardDescription: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {settings.rewardType && settings.rewardType !== "none" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900 flex items-center gap-2">
              <span className="text-base">🎁</span>
              <span>
                <strong className="font-bold">Active Incentive:</strong> When students complete &ldquo;{surveyTitle}&rdquo;, they will be rewarded with &ldquo;{settings.rewardTitle || "Specified Reward"}&rdquo;.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Side Button & Presentation Style */}
      {activeTab === "display" && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Display Mode */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Display Presentation Format
              </span>
              <h5 className="text-xs font-bold text-slate-900 mt-0.5">How students interact with this form</h5>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex cursor-pointer items-center justify-center rounded-lg border p-2 text-xs transition ${
                  settings.displayMode === "side_button"
                    ? "border-slate-800 bg-slate-900 text-white font-semibold"
                    : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  name={`mode_${surveyId}`}
                  className="sr-only"
                  checked={settings.displayMode === "side_button"}
                  onChange={() => setSettings((s) => ({ ...s, displayMode: "side_button" }))}
                />
                <span>🔘 Side Floating Button</span>
              </label>

              <label
                className={`flex cursor-pointer items-center justify-center rounded-lg border p-2 text-xs transition ${
                  settings.displayMode === "popup_modal"
                    ? "border-slate-800 bg-slate-900 text-white font-semibold"
                    : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  name={`mode_${surveyId}`}
                  className="sr-only"
                  checked={settings.displayMode === "popup_modal"}
                  onChange={() => setSettings((s) => ({ ...s, displayMode: "popup_modal" }))}
                />
                <span>💬 Pop-up Modal</span>
              </label>

              <label
                className={`flex cursor-pointer items-center justify-center rounded-lg border p-2 text-xs transition ${
                  settings.displayMode === "both"
                    ? "border-slate-800 bg-slate-900 text-white font-semibold"
                    : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  name={`mode_${surveyId}`}
                  className="sr-only"
                  checked={settings.displayMode === "both"}
                  onChange={() => setSettings((s) => ({ ...s, displayMode: "both" }))}
                />
                <span>Both (Modal + Link)</span>
              </label>

              <label
                className={`flex cursor-pointer items-center justify-center rounded-lg border p-2 text-xs transition ${
                  settings.displayMode === "page_only"
                    ? "border-slate-800 bg-slate-900 text-white font-semibold"
                    : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  name={`mode_${surveyId}`}
                  className="sr-only"
                  checked={settings.displayMode === "page_only"}
                  onChange={() => setSettings((s) => ({ ...s, displayMode: "page_only" }))}
                />
                <span>🔗 Standalone Page Only</span>
              </label>
            </div>

            {/* Side Button Customization */}
            {(settings.displayMode === "side_button" || settings.displayMode === "both") && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Side Button Button Label
                  </label>
                  <input
                    type="text"
                    value={settings.sideButtonLabel || "💬 1-Min Feedback"}
                    onChange={(e) => setSettings((s) => ({ ...s, sideButtonLabel: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                    placeholder="e.g. 💬 Help Us Improve"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Screen Anchor Position
                  </label>
                  <select
                    value={settings.sideButtonPosition || "bottom_right"}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        sideButtonPosition: e.target.value as any,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                  >
                    <option value="bottom_right">Bottom Right Corner</option>
                    <option value="bottom_left">Bottom Left Corner</option>
                    <option value="right_middle">Right Margin (Middle)</option>
                    <option value="left_middle">Left Margin (Middle)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Page Placements & Delays */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Placements &amp; Trigger Timing
              </span>
              <h5 className="text-xs font-bold text-slate-900 mt-0.5">Which pages can surface this form</h5>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Target Pages</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.targetRoutes?.dashboard ?? true}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        targetRoutes: { ...(s.targetRoutes || DEFAULT_SURVEY_SETTINGS.targetRoutes!), dashboard: e.target.checked },
                      }))
                    }
                    className="rounded border-slate-300 text-slate-900"
                  />
                  <span>Student Dashboard</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.targetRoutes?.mockTests ?? true}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        targetRoutes: { ...(s.targetRoutes || DEFAULT_SURVEY_SETTINGS.targetRoutes!), mockTests: e.target.checked },
                      }))
                    }
                    className="rounded border-slate-300 text-slate-900"
                  />
                  <span>Mock Tests Catalogue</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.targetRoutes?.results ?? true}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        targetRoutes: { ...(s.targetRoutes || DEFAULT_SURVEY_SETTINGS.targetRoutes!), results: e.target.checked },
                      }))
                    }
                    className="rounded border-slate-300 text-slate-900"
                  />
                  <span>Results &amp; Submissions</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.targetRoutes?.exams ?? false}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        targetRoutes: { ...(s.targetRoutes || DEFAULT_SURVEY_SETTINGS.targetRoutes!), exams: e.target.checked },
                      }))
                    }
                    className="rounded border-slate-300 text-slate-900"
                  />
                  <span>Exam Details Pages</span>
                </label>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="block text-xs font-semibold text-slate-700">Trigger Delay</label>
              <select
                value={settings.triggerDelaySeconds}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    triggerDelaySeconds: Number(e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
              >
                <option value={0}>Immediately after page loads</option>
                <option value={2}>After 2 seconds</option>
                <option value={5}>After 5 seconds</option>
                <option value={10}>After 10 seconds</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Frequency & Limits */}
      {activeTab === "frequency" && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Quota & Authentication */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Access &amp; Quota
              </span>
              <h5 className="text-xs font-bold text-slate-900 mt-0.5">Response limits and authentication</h5>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Guest Submissions</label>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700 pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name={`allowAnon_${surveyId}`}
                    checked={settings.allowAnonymous}
                    onChange={() => setSettings((s) => ({ ...s, allowAnonymous: true }))}
                    className="text-slate-900"
                  />
                  <span>Allow Anyone (Public)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name={`allowAnon_${surveyId}`}
                    checked={!settings.allowAnonymous}
                    onChange={() => setSettings((s) => ({ ...s, allowAnonymous: false }))}
                    className="text-slate-900"
                  />
                  <span>Registered Students Only</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Phone Prompt</label>
                <select
                  value={settings.requirePhone}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      requirePhone: e.target.value as SurveySettings["requirePhone"],
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                >
                  <option value="optional">Optional</option>
                  <option value="required">Mandatory</option>
                  <option value="none">Do Not Ask</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Response Quota</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Unlimited"
                  value={settings.responseQuota ?? ""}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      responseQuota: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Survey Expiry Date <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="date"
                value={settings.expiryDate ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    expiryDate: e.target.value || null,
                  }))
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Re-appearance Rules */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Re-appearance Cooldown
              </span>
              <h5 className="text-xs font-bold text-slate-900 mt-0.5">Rules when student submits or dismisses</h5>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">If Student Completed Survey</label>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name={`reappearSubmitted_${surveyId}`}
                    checked={!settings.reappearIfSubmitted}
                    onChange={() => setSettings((s) => ({ ...s, reappearIfSubmitted: false }))}
                    className="text-slate-900"
                  />
                  <span>Do not show again</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name={`reappearSubmitted_${surveyId}`}
                    checked={settings.reappearIfSubmitted}
                    onChange={() => setSettings((s) => ({ ...s, reappearIfSubmitted: true }))}
                    className="text-slate-900"
                  />
                  <span>Re-appear after interval</span>
                </label>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700">If Student Dismissed / Skipped</label>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name={`reappearSkipped_${surveyId}`}
                    checked={!settings.reappearIfSkipped}
                    onChange={() => setSettings((s) => ({ ...s, reappearIfSkipped: false }))}
                    className="text-slate-900"
                  />
                  <span>Do not prompt again</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name={`reappearSkipped_${surveyId}`}
                    checked={settings.reappearIfSkipped}
                    onChange={() => setSettings((s) => ({ ...s, reappearIfSkipped: true }))}
                    className="text-slate-900"
                  />
                  <span>Re-prompt student</span>
                </label>
              </div>

              {settings.reappearIfSkipped && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">Max Appearances</label>
                    <select
                      value={settings.maxSkipAppearances}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, maxSkipAppearances: Number(e.target.value) }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800"
                    >
                      <option value={1}>1 time</option>
                      <option value={2}>2 times</option>
                      <option value={3}>3 times</option>
                      <option value={5}>5 times</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">Prompt Interval</label>
                    <select
                      value={settings.skipIntervalHours}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, skipIntervalHours: Number(e.target.value) }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800"
                    >
                      <option value={12}>12 hours</option>
                      <option value={24}>24 hours (1 day)</option>
                      <option value={48}>48 hours (2 days)</option>
                      <option value={168}>7 days (1 week)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Save & Reset Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline transition cursor-pointer"
        >
          ↺ Reset to Default Rules
        </button>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-700 animate-in fade-in">
              ✓ Settings saved successfully!
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-2xs transition active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? "Saving…" : "Save Survey Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
