"use client";

import { useState } from "react";
import type {
  SurveySettings,
  SurveyFormType,
  SurveyThemeColor,
} from "@/lib/surveys/survey-settings";
import { DEFAULT_SURVEY_SETTINGS } from "@/lib/surveys/survey-settings";

interface SurveySettingsPanelProps {
  surveyId: string;
  surveyTitle: string;
  initialSettings?: Partial<SurveySettings> | null;
  onSave: (newSettings: SurveySettings) => Promise<boolean | void>;
  onClose?: () => void;
}

const AVAILABLE_ICONS = [
  "🤝", "📝", "💖", "🌱", "🎯", "⭐", "🚀", "📢",
  "🎁", "💡", "🔔", "🏆", "🎓", "✍️", "⚡", "🔥",
];

const THEME_OPTIONS: Array<{
  key: SurveyThemeColor;
  label: string;
  badgeClass: string;
  gradientClass: string;
  btnClass: string;
}> = [
  {
    key: "teal",
    label: "Deep Teal",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
    gradientClass: "from-teal-600 via-emerald-500 to-amber-500",
    btnClass: "bg-teal-700 hover:bg-teal-800 text-white",
  },
  {
    key: "emerald",
    label: "Emerald",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    gradientClass: "from-emerald-600 via-teal-500 to-amber-500",
    btnClass: "bg-emerald-700 hover:bg-emerald-800 text-white",
  },
  {
    key: "blue",
    label: "Royal Blue",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    gradientClass: "from-blue-600 via-indigo-500 to-cyan-500",
    btnClass: "bg-blue-700 hover:bg-blue-800 text-white",
  },
  {
    key: "amber",
    label: "Amber Gold",
    badgeClass: "bg-amber-50 text-amber-900 border-amber-200",
    gradientClass: "from-amber-600 via-orange-500 to-yellow-500",
    btnClass: "bg-amber-700 hover:bg-amber-800 text-white",
  },
  {
    key: "rose",
    label: "Rose Crimson",
    badgeClass: "bg-rose-50 text-rose-800 border-rose-200",
    gradientClass: "from-rose-600 via-pink-500 to-amber-500",
    btnClass: "bg-rose-700 hover:bg-rose-800 text-white",
  },
  {
    key: "indigo",
    label: "Indigo Purple",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200",
    gradientClass: "from-indigo-600 via-purple-500 to-pink-500",
    btnClass: "bg-indigo-700 hover:bg-indigo-800 text-white",
  },
];

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
    criteria: {
      ...DEFAULT_SURVEY_SETTINGS.criteria,
      ...(initialSettings?.criteria || {}),
    },
    contribution: {
      ...DEFAULT_SURVEY_SETTINGS.contribution,
      ...(initialSettings?.contribution || {}),
    },
  }));

  const [activeTab, setActiveTab] = useState<"appearance" | "criteria" | "routes" | "contribution">("appearance");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedTheme =
    THEME_OPTIONS.find((t) => t.key === settings.themeColor) || THEME_OPTIONS[0];

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
    if (confirm("Reset all settings for this form/popup to default rules?")) {
      setSettings(DEFAULT_SURVEY_SETTINGS);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`varadhi_survey_settings_${surveyId}`);
      }
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 space-y-6 text-slate-800 shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{settings.appIcon || "📝"}</span>
            <h4 className="text-base font-extrabold text-slate-950">
              Form &amp; Pop-up Automation Settings: &ldquo;{surveyTitle}&rdquo;
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure App Icon visual styling, exact audience criteria (mock tests completed, registration date), page routing, and display timing — without writing any code.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              ✓ Saved Live
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-[#0f2942] hover:bg-[#0a1e30] px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
            >
              ✕ Close
            </button>
          )}
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("appearance")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer border ${
            activeTab === "appearance"
              ? "border-slate-900 bg-slate-900 text-white shadow-xs"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
          }`}
        >
          <span>🎨 1. App Icon &amp; Styling</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("criteria")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer border ${
            activeTab === "criteria"
              ? "border-teal-700 bg-teal-800 text-white shadow-xs"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
          }`}
        >
          <span>🎯 2. Audience Criteria (Tests &amp; Date)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("routes")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer border ${
            activeTab === "routes"
              ? "border-blue-700 bg-blue-800 text-white shadow-xs"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
          }`}
        >
          <span>📍 3. Page Routes &amp; Delays</span>
        </button>

        {settings.formType === "growth_support" && (
          <button
            type="button"
            onClick={() => setActiveTab("contribution")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer border ${
              activeTab === "contribution"
                ? "border-emerald-700 bg-emerald-800 text-white shadow-xs"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
            }`}
          >
            <span>💖 4. Support &amp; UPI Details</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* TAB 1: APP ICON & VISUAL STYLING */}
          {activeTab === "appearance" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Form Purpose */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Form Type &amp; Purpose
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { key: "survey", label: "📝 Survey / Questionnaire", desc: "Collect custom candidate answers" },
                    { key: "growth_support", label: "💖 Support / Contribution", desc: "Voluntary UPI / Cashfree prompt" },
                    { key: "announcement", label: "📢 Announcement Pop-up", desc: "Feature notice or exam alert" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() =>
                        setSettings((s) => ({
                          ...s,
                          formType: t.key as SurveyFormType,
                        }))
                      }
                      className={`rounded-xl p-3 text-left transition cursor-pointer border ${
                        settings.formType === t.key
                          ? "border-slate-900 bg-white shadow-xs ring-1 ring-slate-900"
                          : "border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
                      }`}
                    >
                      <span className="block text-xs font-extrabold text-slate-900">{t.label}</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* App Icon Picker */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                <label className="block text-xs font-bold text-slate-800">
                  App Icon Picker (No Code)
                </label>
                <p className="text-[11px] text-slate-500">
                  Select an application icon shown inside the modal badge and notification pill:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {AVAILABLE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, appIcon: icon }))}
                      className={`grid h-10 w-10 place-items-center rounded-xl text-lg transition cursor-pointer border ${
                        settings.appIcon === icon
                          ? "border-slate-900 bg-slate-100 ring-2 ring-slate-900 scale-110 shadow-xs"
                          : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Badge Text & Theme Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Badge Pill Text
                  </label>
                  <input
                    type="text"
                    value={settings.badgeText}
                    onChange={(e) => setSettings((s) => ({ ...s, badgeText: e.target.value }))}
                    placeholder="e.g. Help Us Grow Varadhi Prep"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Shown beside the icon at top of modal
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Accent Theme Color
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    {THEME_OPTIONS.map((theme) => (
                      <button
                        key={theme.key}
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, themeColor: theme.key }))}
                        className={`rounded-lg py-1.5 px-1 text-center text-[10px] font-bold transition cursor-pointer border ${
                          settings.themeColor === theme.key
                            ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                        }`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Display Mode */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <label className="block text-xs font-bold text-slate-800">Display Placement</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { key: "both", label: "Popup Modal + Page", desc: "Shows pop-up & accessible via /survey link" },
                    { key: "popup_modal", label: "Popup Modal Only", desc: "Only pops up based on criteria" },
                    { key: "page_only", label: "Page Link Only", desc: "No popup; only accessible via link" },
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, displayMode: m.key as any }))}
                      className={`rounded-xl p-2.5 text-left border transition cursor-pointer ${
                        settings.displayMode === m.key
                          ? "border-slate-900 bg-white ring-1 ring-slate-900 font-bold"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                      }`}
                    >
                      <span className="block text-xs font-bold">{m.label}</span>
                      <span className="block text-[10px] text-slate-500 font-normal">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIENCE CRITERIA ENGINE */}
          {activeTab === "criteria" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Mock Test Count Rule */}
              <div className="rounded-xl border border-teal-200/80 bg-teal-50/40 p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">✍️</span>
                  <label className="text-xs font-extrabold text-teal-950 uppercase tracking-wider">
                    Mock Test Activity Criteria
                  </label>
                </div>
                <p className="text-xs text-teal-900/80">
                  Target students based on how many tests they have completed on Varadhi Prep:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {[
                    { key: "any", label: "All Users (Any test count)", min: 0, max: 999 },
                    { key: "zero_tests", label: "Brand New Users (0 tests completed)", min: 0, max: 0 },
                    { key: "one_to_four", label: "Post-Test Candidates (1 to 4 tests)", min: 1, max: 4 },
                    { key: "five_plus", label: "Power Users (5 or more tests)", min: 5, max: 999 },
                  ].map((opt) => {
                    const isSelected = settings.criteria.testCondition === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() =>
                          setSettings((s) => ({
                            ...s,
                            criteria: {
                              ...s.criteria,
                              testCondition: opt.key as any,
                              minTests: opt.min,
                              maxTests: opt.max,
                            },
                          }))
                        }
                        className={`rounded-xl p-3 text-left border transition cursor-pointer ${
                          isSelected
                            ? "border-teal-700 bg-white ring-1 ring-teal-700 shadow-xs"
                            : "border-slate-200 bg-white/70 hover:bg-white"
                        }`}
                      >
                        <span className="block text-xs font-bold text-slate-900">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((s) => ({
                        ...s,
                        criteria: { ...s.criteria, testCondition: "custom_range" },
                      }))
                    }
                    className={`text-xs font-bold underline cursor-pointer ${
                      settings.criteria.testCondition === "custom_range" ? "text-teal-950" : "text-teal-700"
                    }`}
                  >
                    + Or define custom test range (min and max)
                  </button>

                  {settings.criteria.testCondition === "custom_range" && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700">Minimum Tests</label>
                        <input
                          type="number"
                          min={0}
                          value={settings.criteria.minTests ?? 0}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              criteria: { ...s.criteria, minTests: parseInt(e.target.value, 10) || 0 },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700">Maximum Tests</label>
                        <input
                          type="number"
                          min={0}
                          value={settings.criteria.maxTests ?? 999}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              criteria: { ...s.criteria, maxTests: parseInt(e.target.value, 10) || 999 },
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Registration Date Rule */}
              <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">📅</span>
                  <label className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                    Registration Date Criteria
                  </label>
                </div>
                <p className="text-xs text-blue-900/80">
                  Target students by their account creation date:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {[
                    { key: "all", label: "All Registration Dates" },
                    { key: "last_7_days", label: "Joined in Last 7 Days (New)" },
                    { key: "last_30_days", label: "Joined in Last 30 Days" },
                  ].map((opt) => {
                    const isSelected = settings.criteria.registrationCondition === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() =>
                          setSettings((s) => ({
                            ...s,
                            criteria: {
                              ...s.criteria,
                              registrationCondition: opt.key as any,
                            },
                          }))
                        }
                        className={`rounded-xl p-2.5 text-left border transition cursor-pointer ${
                          isSelected
                            ? "border-blue-700 bg-white ring-1 ring-blue-700 shadow-xs"
                            : "border-slate-200 bg-white/70 hover:bg-white"
                        }`}
                      >
                        <span className="block text-xs font-bold text-slate-900">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">
                      Registered After Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={settings.criteria.registeredAfterDate || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          criteria: {
                            ...s.criteria,
                            registeredAfterDate: e.target.value || null,
                            registrationCondition: e.target.value ? "registered_after" : s.criteria.registrationCondition,
                          },
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">
                      Registered Before Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={settings.criteria.registeredBeforeDate || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          criteria: {
                            ...s.criteria,
                            registeredBeforeDate: e.target.value || null,
                            registrationCondition: e.target.value ? "registered_before" : s.criteria.registrationCondition,
                          },
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Target Exam Focus */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Target Exam Focus / Cohort
                </label>
                <select
                  value={settings.criteria.targetExam}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      criteria: {
                        ...s.criteria,
                        targetExam: e.target.value as any,
                      },
                      targetAudience: e.target.value as any,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="all">All Website Visitors &amp; Students</option>
                  <option value="ap_endowment">Targeted: AP Endowment Officer Mock Test Takers</option>
                  <option value="tg_police">Targeted: TG Police Constable Mock Test Takers</option>
                  <option value="appsc">Targeted: APPSC Group / Departmental Exams</option>
                  <option value="tgpsc">Targeted: TGPSC Group / State Exams</option>
                  <option value="dsc">Targeted: AP / TG DSC &amp; Teacher Exams</option>
                </select>
              </div>

              {/* Authentication */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <label className="block text-xs font-bold text-slate-800">Authentication Gate</label>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`auth_${surveyId}`}
                      checked={!settings.criteria.requireAuth}
                      onChange={() =>
                        setSettings((s) => ({
                          ...s,
                          criteria: { ...s.criteria, requireAuth: false },
                          allowAnonymous: true,
                        }))
                      }
                    />
                    <span>Allow Anyone (Public &amp; Logged in)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`auth_${surveyId}`}
                      checked={settings.criteria.requireAuth}
                      onChange={() =>
                        setSettings((s) => ({
                          ...s,
                          criteria: { ...s.criteria, requireAuth: true },
                          allowAnonymous: false,
                        }))
                      }
                    />
                    <span>Registered / Logged-in Students Only</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAGE ROUTING & DELAYS */}
          {activeTab === "routes" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Target Pages */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Which Pages Can This Form Show On?
                </label>
                <p className="text-[11px] text-slate-500">
                  Select all pages where candidates can see this pop-up:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {[
                    { key: "dashboard", label: "Student Dashboard (/dashboard)" },
                    { key: "mockTests", label: "Mock Tests Catalog (/mock-tests)" },
                    { key: "testReview", label: "Test Result / Review (/dashboard/attempts/*)" },
                    { key: "exams", label: "Exam Portals (/exams/*)" },
                    { key: "home", label: "Homepage (/)" },
                    { key: "all", label: "All Pages on Website" },
                  ].map((r) => {
                    const isChecked = (settings.targetRoutes as any)[r.key] ?? false;
                    return (
                      <label
                        key={r.key}
                        className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-semibold cursor-pointer transition ${
                          isChecked
                            ? "border-blue-600 bg-blue-50/50 text-blue-950 font-bold"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              targetRoutes: {
                                ...s.targetRoutes,
                                [r.key]: e.target.checked,
                              },
                            }))
                          }
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span>{r.label}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Custom Route Pattern (Optional)
                  </label>
                  <input
                    type="text"
                    value={settings.targetRoutes.customPath || ""}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        targetRoutes: {
                          ...s.targetRoutes,
                          customPath: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. /mock-tests/andhra-pradesh/*"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Timing & Delays */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Timing &amp; Display Frequency
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">
                      Page Delay (Seconds)
                    </label>
                    <select
                      value={settings.triggerDelaySeconds}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          triggerDelaySeconds: parseFloat(e.target.value) || 2.5,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none"
                    >
                      <option value={0}>Immediately (0s)</option>
                      <option value={1.5}>After 1.5 seconds</option>
                      <option value={2.5}>After 2.5 seconds</option>
                      <option value={5}>After 5 seconds</option>
                      <option value={10}>After 10 seconds</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">
                      Dismissal Cooldown
                    </label>
                    <select
                      value={settings.cooldownDays}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          cooldownDays: parseInt(e.target.value, 10) || 3,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none"
                    >
                      <option value={1}>After 1 day</option>
                      <option value={3}>After 3 days</option>
                      <option value={7}>After 7 days (1 week)</option>
                      <option value={14}>After 14 days</option>
                      <option value={999}>Never reappear</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">
                      Max Appearances
                    </label>
                    <select
                      value={settings.maxSkipAppearances}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          maxSkipAppearances: parseInt(e.target.value, 10) || 2,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none"
                    >
                      <option value={1}>1 time only</option>
                      <option value={2}>2 times</option>
                      <option value={3}>3 times</option>
                      <option value={5}>5 times</option>
                      <option value={0}>Unlimited</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">
                      Active Start Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={settings.startDate || ""}
                      onChange={(e) => setSettings((s) => ({ ...s, startDate: e.target.value || null }))}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={settings.expiryDate || ""}
                      onChange={(e) => setSettings((s) => ({ ...s, expiryDate: e.target.value || null }))}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUPPORT & CONTRIBUTION (IF GROWTH SUPPORT FORM) */}
          {activeTab === "contribution" && settings.formType === "growth_support" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                <label className="block text-xs font-bold text-emerald-950">
                  Voluntary Contribution Details
                </label>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">
                    Contribution Tiers (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(settings.contribution?.suggestedAmounts || [49, 99, 199, 499]).join(", ")}
                    onChange={(e) => {
                      const amounts = e.target.value
                        .split(",")
                        .map((n) => parseInt(n.trim(), 10))
                        .filter((n) => !isNaN(n) && n > 0);
                      setSettings((s) => ({
                        ...s,
                        contribution: {
                          ...s.contribution,
                          suggestedAmounts: amounts.length ? amounts : [49, 99, 199, 499],
                        },
                      }));
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">UPI ID</label>
                    <input
                      type="text"
                      value={settings.contribution?.upiId || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          contribution: { ...s.contribution, upiId: e.target.value },
                        }))
                      }
                      placeholder="e.g. support@varadhiprep.in"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Payee Name</label>
                    <input
                      type="text"
                      value={settings.contribution?.upiName || ""}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          contribution: { ...s.contribution, upiName: e.target.value },
                        }))
                      }
                      placeholder="Varadhi Prep"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-xl bg-[#0f2942] hover:bg-[#0a1e30] px-5 py-2.5 text-xs font-extrabold text-white shadow-xs transition disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? "Saving Settings..." : "Save All Automation Settings"}
            </button>
          </div>
        </div>

        {/* Live Interactive Preview Column ("Like an app icon without writing code") */}
        <div className="lg:col-span-5 sticky top-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">
              Live In-App Pop-up Preview
            </p>
            <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
              Real-time Rendering
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            {/* Top Gradient Rule */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${selectedTheme.gradientClass}`} />

            <div className="p-5 space-y-3">
              {/* Header Pill */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-base shadow-2xs">
                    {settings.appIcon || "📝"}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${selectedTheme.badgeClass}`}
                  >
                    {settings.badgeText || "Varadhi Prep"}
                  </span>
                </div>
                <span className="text-slate-400 text-xs cursor-default">✕</span>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-black text-slate-950 leading-snug">
                {surveyTitle}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All mock tests on Varadhi Prep are 100% free and ad-free.
              </p>

              {/* Preview Body based on Form Type */}
              {settings.formType === "growth_support" ? (
                <div className="pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Select Contribution Amount
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(settings.contribution?.suggestedAmounts || [49, 99, 199, 499]).map((amt, idx) => (
                      <div
                        key={amt}
                        className={`rounded-lg py-1.5 text-center text-xs font-extrabold border ${
                          idx === 0
                            ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        ₹{amt}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-1 text-xs">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-[11px] text-slate-600 font-medium">
                    📋 Dynamic questions from this survey will display here.
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
                  Maybe Later
                </span>
                <span className={`rounded-lg px-3.5 py-1.5 text-xs font-bold shadow-2xs ${selectedTheme.btnClass}`}>
                  {settings.formType === "growth_support" ? "Support Varadhi" : "Submit Answers"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">Targeting Summary:</p>
            <p>• <strong>Mock Tests:</strong> {settings.criteria.testCondition}</p>
            <p>• <strong>Registration:</strong> {settings.criteria.registrationCondition}</p>
            <p>• <strong>Pages:</strong> {Object.entries(settings.targetRoutes).filter(([_, v]) => Boolean(v)).map(([k]) => k).join(", ") || "Dashboard"}</p>
            <p>• <strong>Delay:</strong> {settings.triggerDelaySeconds}s | <strong>Cooldown:</strong> {settings.cooldownDays} days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
