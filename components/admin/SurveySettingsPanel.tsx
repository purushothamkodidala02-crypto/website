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
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
            <span>⚙️</span> Survey Conditions & Controls
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure display mode, student targeting, re-appearance frequency, and quota for &ldquo;{surveyTitle}&rdquo;.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              ✕ Close
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Section 1: Display Mode & Audience Targeting */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5">
          <div className="border-b border-slate-100 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              1. Display Mode & Placement
            </span>
            <h5 className="text-xs font-bold text-slate-900 mt-0.5">How students access this survey</h5>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Display Placement</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                <span>Both (Popup + Page)</span>
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
                <span>Popup Modal Only</span>
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
                <span>Page Link Only</span>
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Target Audience</label>
            <select
              value={settings.targetAudience}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  targetAudience: e.target.value as SurveySettings["targetAudience"],
                }))
              }
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
            >
              <option value="all">All Website Visitors & Students</option>
              <option value="ap_endowment">Targeted: AP Endowment Officer Mock Test Takers</option>
              <option value="tg_police">Targeted: TG Police Constable Mock Test Takers</option>
              <option value="appsc">Targeted: APPSC Group / Departmental Exams</option>
              <option value="tgpsc">Targeted: TGPSC Group / State Exams</option>
            </select>
          </div>

          {settings.displayMode !== "page_only" && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Popup Trigger Delay</label>
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
          )}
        </div>

        {/* Section 2: Quota & Restrictions */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5">
          <div className="border-b border-slate-100 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              2. Access, Quota & Deadline
            </span>
            <h5 className="text-xs font-bold text-slate-900 mt-0.5">Response limits and authentication</h5>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Guest / Unauthenticated Submissions</label>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-700 pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name={`allowAnon_${surveyId}`}
                  checked={settings.allowAnonymous}
                  onChange={() => setSettings((s) => ({ ...s, allowAnonymous: true }))}
                  className="text-slate-900 focus:ring-slate-400"
                />
                <span>Allow Anyone (Public)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name={`allowAnon_${surveyId}`}
                  checked={!settings.allowAnonymous}
                  onChange={() => setSettings((s) => ({ ...s, allowAnonymous: false }))}
                  className="text-slate-900 focus:ring-slate-400"
                />
                <span>Registered Students Only</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Phone Number Prompt</label>
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
              <label className="block text-xs font-semibold text-slate-700">Response Quota Limit</label>
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

        {/* Section 3: Re-appearance Conditions (When Student Submitted) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              3. Condition: Student Already Submitted
            </span>
            <h5 className="text-xs font-bold text-slate-900 mt-0.5">
              Can this survey appear again to a student who completed it?
            </h5>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name={`reappearSubmitted_${surveyId}`}
                checked={!settings.reappearIfSubmitted}
                onChange={() => setSettings((s) => ({ ...s, reappearIfSubmitted: false }))}
                className="text-slate-900 focus:ring-slate-400"
              />
              <span>No (Do not show again)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name={`reappearSubmitted_${surveyId}`}
                checked={settings.reappearIfSubmitted}
                onChange={() => setSettings((s) => ({ ...s, reappearIfSubmitted: true }))}
                className="text-slate-900 focus:ring-slate-400"
              />
              <span>Yes (Re-appear)</span>
            </label>
          </div>

          {settings.reappearIfSubmitted && (
            <div className="pt-1 space-y-1">
              <label className="block text-[11px] font-semibold text-slate-600">
                Re-appearance Interval
              </label>
              <select
                value={settings.submittedIntervalDays}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    submittedIntervalDays: Number(e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
              >
                <option value={3}>After 3 days</option>
                <option value={7}>After 7 days (1 week)</option>
                <option value={14}>After 14 days (2 weeks)</option>
                <option value={30}>After 30 days (1 month)</option>
              </select>
            </div>
          )}
        </div>

        {/* Section 4: Re-appearance Conditions (When Student Skipped) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              4. Condition: Student Skipped / Dismissed
            </span>
            <h5 className="text-xs font-bold text-slate-900 mt-0.5">
              Should the popup appear again if student clicked &ldquo;Skip for now&rdquo;?
            </h5>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name={`reappearSkipped_${surveyId}`}
                checked={!settings.reappearIfSkipped}
                onChange={() => setSettings((s) => ({ ...s, reappearIfSkipped: false }))}
                className="text-slate-900 focus:ring-slate-400"
              />
              <span>No (Do not re-prompt)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name={`reappearSkipped_${surveyId}`}
                checked={settings.reappearIfSkipped}
                onChange={() => setSettings((s) => ({ ...s, reappearIfSkipped: true }))}
                className="text-slate-900 focus:ring-slate-400"
              />
              <span>Yes (Re-prompt student)</span>
            </label>
          </div>

          {settings.reappearIfSkipped && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Max Times to Appear
                </label>
                <select
                  value={settings.maxSkipAppearances}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      maxSkipAppearances: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                >
                  <option value={1}>1 time only</option>
                  <option value={2}>2 times</option>
                  <option value={3}>3 times</option>
                  <option value={5}>5 times</option>
                  <option value={0}>Unlimited</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Interval Between Prompts
                </label>
                <select
                  value={settings.skipIntervalHours}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      skipIntervalHours: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                >
                  <option value={4}>After 4 hours</option>
                  <option value={12}>After 12 hours</option>
                  <option value={24}>After 24 hours (1 day)</option>
                  <option value={48}>After 48 hours (2 days)</option>
                  <option value={72}>After 72 hours (3 days)</option>
                  <option value={168}>After 7 days (1 week)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Save & Reset Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline transition"
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
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-2xs transition active:scale-95 disabled:opacity-60"
          >
            {isSaving ? "Saving…" : "Save Survey Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
