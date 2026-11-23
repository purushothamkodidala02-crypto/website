"use client";

import { useEffect, useState } from "react";
import type { NewUserSurveySettings } from "@/lib/growth-settings";
import { DEFAULT_SURVEY_SETTINGS } from "@/lib/growth-settings";
import { getLocalAttemptedTestIds } from "@/lib/storage/student-practice-storage";
import { submitGrowthSurveyAction } from "@/app/admin/growth-settings/actions";
import { recordGrowthInteractionAction } from "@/app/actions/growth-tracking";

type PostTestGrowthSurveyModalProps = {
  completedAttempts?: number;
  settings?: NewUserSurveySettings;
  upperThreshold?: number; // Usually 5 (where contribution popup takes over)
};

const EXAM_OPTIONS = [
  "APPSC (Group 1 / 2 / Endowment)",
  "TGPSC (Group 1 / 2 / 3)",
  "Police (SI / Constable)",
  "AP / TG DSC & TET",
  "Central Exams (SSC, RRB, Banking)",
  "Other State Exam",
];

const MEDIUM_OPTIONS = [
  "Bilingual (Telugu & English)",
  "Telugu Only",
  "English Only",
];

export function PostTestGrowthSurveyModal({
  completedAttempts: serverCompletedAttempts,
  settings = DEFAULT_SURVEY_SETTINGS,
  upperThreshold = 5,
}: PostTestGrowthSurveyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [effectiveCount, setEffectiveCount] = useState<number>(serverCompletedAttempts ?? 0);

  // Form State
  const [targetExam, setTargetExam] = useState<string>("");
  const [medium, setMedium] = useState<string>("Bilingual (Telugu & English)");
  const [suggestions, setSuggestions] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Allow opening via custom event from any button (e.g. from Results page)
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      recordGrowthInteractionAction({
        eventType: "trigger",
        buttonLabel: "Growth Survey Event Trigger",
        pagePath: typeof window !== "undefined" ? window.location.pathname : undefined,
      }).catch(() => null);
    };
    window.addEventListener("open-growth-survey", handleOpen);
    return () => window.removeEventListener("open-growth-survey", handleOpen);
  }, []);

  useEffect(() => {
    // 0. Preview mode check (?preview_survey=true or ?preview=survey)
    const urlParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const isPreview =
      urlParams?.get("preview_survey") === "true" ||
      urlParams?.get("preview") === "survey";

    if (isPreview) {
      setEffectiveCount(1);
      setIsOpen(true);
      recordGrowthInteractionAction({
        eventType: "view",
        buttonLabel: "Viewed Survey Pop-up (Preview)",
        pagePath: typeof window !== "undefined" ? window.location.pathname : undefined,
      }).catch(() => null);
      return;
    }

    // 1. Master enable check
    if (!settings.enabled) return;

    // 2. Resolve count: use server count or local storage
    let count = serverCompletedAttempts ?? 0;
    if (count <= 0) {
      count = getLocalAttemptedTestIds().length;
    }

    // 3. User Filtering:
    // - Must have completed at least minCompletedTests (default: 1 test, 0-test users are ignored)
    // - Must have completed FEWER than upperThreshold (default: 5 tests, where support prompt starts)
    const minThreshold = settings.minCompletedTests ?? 1;
    if (count < minThreshold || count >= upperThreshold) {
      return;
    }

    // 4. Check if already submitted
    const submittedAt = localStorage.getItem("varadhi_growth_survey_submitted_at");
    if (submittedAt) return;

    // 5. Check dismissal cooldown
    const dismissedAt = localStorage.getItem("varadhi_growth_survey_dismissed_at");
    if (dismissedAt) {
      const cooldownMs = (settings.cooldownDays ?? 3) * 24 * 60 * 60 * 1000;
      const timePassed = Date.now() - parseInt(dismissedAt, 10);
      if (timePassed < cooldownMs) return;
    }

    // 6. Check max appearance count
    const appearanceCount = parseInt(
      localStorage.getItem("varadhi_growth_survey_appearance_count") || "0",
      10,
    );
    const maxAppearances = settings.maxAppearances ?? 2;
    if (maxAppearances > 0 && appearanceCount >= maxAppearances) return;

    // 7. Respectful display delay
    const delayMs = Math.max(800, (settings.displayDelaySeconds ?? 2.5) * 1000);
    const timer = setTimeout(() => {
      setEffectiveCount(count);
      setIsOpen(true);
      recordGrowthInteractionAction({
        eventType: "view",
        buttonLabel: "Viewed Growth Survey Pop-up",
        pagePath: typeof window !== "undefined" ? window.location.pathname : undefined,
      }).catch(() => null);

      try {
        localStorage.setItem(
          "varadhi_growth_survey_appearance_count",
          String(appearanceCount + 1),
        );
      } catch {}
    }, delayMs);

    return () => clearTimeout(timer);
  }, [serverCompletedAttempts, settings, upperThreshold]);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(
        "varadhi_growth_survey_dismissed_at",
        String(Date.now()),
      );
    } catch {}
    recordGrowthInteractionAction({
      eventType: "dismiss",
      buttonLabel: settings.dismissButtonText || "Maybe Later",
      pagePath: typeof window !== "undefined" ? window.location.pathname : undefined,
    }).catch(() => null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const res = await submitGrowthSurveyAction({
      targetExam: targetExam || undefined,
      medium: medium || undefined,
      suggestions: suggestions || undefined,
      phone: phone || undefined,
      completedAttempts: effectiveCount,
      pagePath: typeof window !== "undefined" ? window.location.pathname : undefined,
    });

    if (!res.success) {
      setError(res.message || "Failed to submit survey. Please try again.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitted(true);
    try {
      localStorage.setItem(
        "varadhi_growth_survey_submitted_at",
        String(Date.now()),
      );
    } catch {}

    setTimeout(() => {
      setIsOpen(false);
    }, 2200);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="growth-survey-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity"
        onClick={handleDismiss}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Accent Rule */}
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 via-emerald-500 to-amber-500" />

        <div className="p-5 sm:p-7">
          {/* Header Bar */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-100 text-teal-800 text-lg font-bold">
                🤝
              </div>
              <div>
                <span className="inline-flex items-center rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[11px] font-bold text-teal-800">
                  Help Us Grow Varadhi Prep
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close survey"
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {isSubmitted ? (
            <div className="py-8 text-center animate-in fade-in duration-200">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
                🎉
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-900">
                Thank you for helping us grow!
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your feedback directly guides which mock tests, syllabus topics, and features we release next. Happy preparation!
              </p>
            </div>
          ) : (
            <>
              {/* Heading & Intro */}
              <h2
                id="growth-survey-modal-title"
                className="mt-3.5 text-lg sm:text-xl font-black text-slate-950 tracking-tight"
              >
                {settings.headline || "Help Us Grow Varadhi Prep"}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {settings.description ||
                  "All mock tests on Varadhi Prep are 100% free and ad-free. Tell us how your preparation is going and which mock tests you need next!"}
              </p>

              {error && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
                  {error}
                </div>
              )}

              {/* Survey Form */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {/* 1. Target Exam */}
                {settings.askTargetExam && (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      1. Which competitive exam are you targeting?
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {EXAM_OPTIONS.map((opt) => {
                        const isSelected = targetExam === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setTargetExam(opt)}
                            className={`rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition cursor-pointer border ${
                              isSelected
                                ? "border-teal-600 bg-teal-50 text-teal-950 ring-1 ring-teal-600 font-bold"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:border-slate-300"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Language Preference */}
                {settings.askMediumPreference && (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      2. Preferred question medium / language?
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {MEDIUM_OPTIONS.map((opt) => {
                        const isSelected = medium === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setMedium(opt)}
                            className={`rounded-xl px-2 py-2 text-center text-xs font-semibold transition cursor-pointer border ${
                              isSelected
                                ? "border-teal-600 bg-teal-50 text-teal-950 ring-1 ring-teal-600 font-bold"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:border-slate-300"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Desired Tests / Feedback */}
                {settings.askSuggestions && (
                  <div>
                    <label
                      htmlFor="survey-suggestions"
                      className="block text-xs font-bold text-slate-800 mb-1"
                    >
                      3. What mock tests or subjects should we add next?
                    </label>
                    <textarea
                      id="survey-suggestions"
                      rows={2}
                      value={suggestions}
                      onChange={(e) => setSuggestions(e.target.value)}
                      placeholder="e.g. Current Affairs weekly mocks, Group 2 Paper 2 topic tests..."
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                )}

                {/* 4. Optional Phone */}
                {settings.askPhone && (
                  <div>
                    <label
                      htmlFor="survey-phone"
                      className="block text-xs font-bold text-slate-800 mb-1"
                    >
                      WhatsApp / Mobile <span className="font-normal text-slate-500">(Optional - for new test alerts)</span>
                    </label>
                    <input
                      id="survey-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer text-center"
                  >
                    {settings.dismissButtonText || "Maybe Later"}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? "Submitting..." : settings.submitButtonText || "Submit & Help Us Grow"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
