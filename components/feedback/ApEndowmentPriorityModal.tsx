"use client";

import { useEffect, useState } from "react";
import {
  checkApEndowmentFeedbackEligibilityAction,
  submitApEndowmentFeedbackAction,
  DEFAULT_SURVEY_CONDITIONS,
  type ApEndowmentSurveyConditions,
} from "@/app/actions/ap-endowment-feedback";
import { AP_EO_CAMPAIGN_EXPIRY_MS } from "@/lib/campaigns/ap-endowment";

const STORAGE_SUBMITTED = "varadhi_ap_eo_feedback_submitted";
const STORAGE_DISMISSED = "varadhi_ap_eo_feedback_dismissed";

export function ApEndowmentPriorityModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [paperChoice, setPaperChoice] = useState("Paper 2 - Hindu Philosophy & Temple System");
  const [subjectFocus, setSubjectFocus] = useState("");
  const [specificTopics, setSpecificTopics] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // 1. Check if campaign has expired (1 week duration)
    if (Date.now() > AP_EO_CAMPAIGN_EXPIRY_MS) {
      return;
    }

    // 2. Check Zoho survey conditions:
    if (typeof window !== "undefined") {
      if (localStorage.getItem("varadhi_ap_endowment_survey_active") === "false") {
        return;
      }
      if (localStorage.getItem("varadhi_ap_endowment_survey_deleted") === "true") {
        return;
      }

      let conditions: ApEndowmentSurveyConditions = DEFAULT_SURVEY_CONDITIONS;
      try {
        const saved = localStorage.getItem("varadhi_ap_endowment_survey_conditions");
        if (saved) {
          conditions = { ...DEFAULT_SURVEY_CONDITIONS, ...JSON.parse(saved) };
        }
      } catch {
        // default conditions
      }

      // Condition 1: Check if student already submitted
      const submittedTimeStr = localStorage.getItem(STORAGE_SUBMITTED);
      if (submittedTimeStr) {
        if (!conditions.reappearIfSubmitted) {
          return; // No: do not show again once submitted
        }
        const submittedTime = Number(submittedTimeStr) || 0;
        const daysPassed = (Date.now() - submittedTime) / (1000 * 60 * 60 * 24);
        if (daysPassed < conditions.submittedIntervalDays) {
          return; // Interval has not yet elapsed
        }
      }

      // Condition 2: Check if student skipped / dismissed
      const dismissedTimeStr = localStorage.getItem(STORAGE_DISMISSED);
      if (dismissedTimeStr) {
        if (!conditions.reappearIfSkipped) {
          return; // No: do not show again once skipped
        }
        const skipCount = Number(localStorage.getItem("varadhi_ap_eo_feedback_skip_count") || "1");
        if (conditions.maxSkipAppearances > 0 && skipCount >= conditions.maxSkipAppearances) {
          return; // Exceeded maximum appearances
        }
        const dismissedTime = Number(dismissedTimeStr) || new Date(dismissedTimeStr).getTime() || 0;
        const hoursPassed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
        if (hoursPassed < conditions.skipIntervalHours) {
          return; // Interval between appearances has not yet elapsed
        }
      }
    }

    // 3. Verify server-side eligibility:
    // User must be signed in AND have attempted AP Endowment Officer exam
    let cancelled = false;

    void checkApEndowmentFeedbackEligibilityAction().then((res) => {
      if (cancelled) return;

      if (!res.eligible) {
        // If already submitted in database, save flag in localStorage so we don't query again
        if (res.reason === "already_submitted") {
          localStorage.setItem(STORAGE_SUBMITTED, String(Date.now()));
        }
        return;
      }

      if (res.studentName) {
        setStudentName(res.studentName);
      }

      // Show modal smoothly with a short natural delay after page load
      const timer = setTimeout(() => {
        if (!cancelled) {
          setIsOpen(true);
        }
      }, 1200);

      return () => clearTimeout(timer);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    // Mark as dismissed and increment skip count according to Zoho rules
    if (typeof window !== "undefined") {
      const currentCount = Number(localStorage.getItem("varadhi_ap_eo_feedback_skip_count") || "0");
      localStorage.setItem("varadhi_ap_eo_feedback_skip_count", String(currentCount + 1));
      localStorage.setItem(STORAGE_DISMISSED, String(Date.now()));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectFocus.trim()) {
      setErrorMsg("Please enter which subject or topic you want us to focus on.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const res = await submitApEndowmentFeedbackAction({
      paperChoice,
      subjectFocus: subjectFocus.trim(),
      specificTopics: specificTopics.trim() || undefined,
      studentName: studentName.trim() || undefined,
      studentPhone: studentPhone.trim() || undefined,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setIsSuccess(true);
    // Mark as submitted with timestamp
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_SUBMITTED, String(Date.now()));
    }

    setTimeout(() => {
      setIsOpen(false);
    }, 2400);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ap-eo-feedback-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Close / Skip button at top-right */}
        <button
          type="button"
          onClick={handleDismiss}
          disabled={isSubmitting}
          aria-label="Skip survey"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
        >
          ✕
        </button>

        {isSuccess ? (
          <div className="py-8 text-center animate-in fade-in zoom-in-90 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-3xl shadow-xs">
              🎉
            </div>
            <h2 className="mt-4 text-xl sm:text-2xl font-black text-slate-900">
              Priority Recorded!
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 max-w-sm mx-auto">
              Thank you for sharing your feedback. We will prioritize these subjects for upcoming AP Endowment Officer mock tests!
            </p>
            <div className="mt-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                ✓ Saved to Varadhi Prep
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Header */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-900 border border-amber-200">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                AP Endowment Officer · Preparation Priority
              </span>
              <h2 id="ap-eo-feedback-title" className="mt-2.5 text-xl sm:text-2xl font-black text-slate-950">
                Which subject should we focus on next?
              </h2>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-600">
                Help Varadhi Prep prioritize your upcoming mock tests. Choose which paper and tell us the specific subjects you need most!
              </p>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-rose-800">
                {errorMsg}
              </div>
            )}

            {/* Field 1: Choose Paper */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-900">
                1. Choose the Paper <span className="text-rose-500">*</span>
              </label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label
                  className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 sm:p-3 text-xs sm:text-sm transition ${
                    paperChoice.includes("Paper 1")
                      ? "border-teal-600 bg-teal-50/80 ring-1 ring-teal-500 font-bold text-teal-950"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700 font-medium"
                  }`}
                >
                  <input
                    type="radio"
                    name="paperChoice"
                    value="Paper 1 - General Studies & Mental Ability"
                    checked={paperChoice.includes("Paper 1")}
                    onChange={(e) => setPaperChoice(e.target.value)}
                    className="mt-0.5 h-4 w-4 text-teal-700 focus:ring-teal-500"
                  />
                  <div>
                    <span className="block font-black">Paper 1</span>
                    <span className="text-[11px] text-slate-500 font-normal">General Studies & Mental Ability</span>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 sm:p-3 text-xs sm:text-sm transition ${
                    paperChoice.includes("Paper 2")
                      ? "border-teal-600 bg-teal-50/80 ring-1 ring-teal-500 font-bold text-teal-950"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700 font-medium"
                  }`}
                >
                  <input
                    type="radio"
                    name="paperChoice"
                    value="Paper 2 - Hindu Philosophy & Temple System"
                    checked={paperChoice.includes("Paper 2")}
                    onChange={(e) => setPaperChoice(e.target.value)}
                    className="mt-0.5 h-4 w-4 text-teal-700 focus:ring-teal-500"
                  />
                  <div>
                    <span className="block font-black">Paper 2</span>
                    <span className="text-[11px] text-slate-500 font-normal">Hindu Philosophy & Temple System</span>
                  </div>
                </label>
              </div>

              <label
                className={`mt-1.5 flex cursor-pointer items-center gap-2.5 rounded-xl border p-2 text-xs transition ${
                  paperChoice.includes("Both")
                    ? "border-teal-600 bg-teal-50/80 ring-1 ring-teal-500 font-bold text-teal-950"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="paperChoice"
                  value="Both Paper 1 & Paper 2"
                  checked={paperChoice.includes("Both")}
                  onChange={(e) => setPaperChoice(e.target.value)}
                  className="h-3.5 w-3.5 text-teal-700 focus:ring-teal-500"
                />
                <span className="font-semibold text-slate-800">I need priority mock tests for Both Papers</span>
              </label>
            </div>

            {/* Field 2: Which Subject to Focus On (Text Box 1) */}
            <div>
              <label htmlFor="ap-eo-subject-focus" className="block text-xs sm:text-sm font-bold text-slate-900">
                2. Which subject or topic should we focus on? <span className="text-rose-500">*</span>
              </label>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Enter the subject or topic you want prioritized for mock test preparation.
              </p>
              <input
                id="ap-eo-subject-focus"
                type="text"
                required
                value={subjectFocus}
                onChange={(e) => setSubjectFocus(e.target.value)}
                placeholder="e.g. Hindu Puranams, Temple Administration Acts, Indian Polity..."
                className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-hidden focus:ring-1 focus:ring-teal-600"
              />
            </div>

            {/* Field 3: Specific Chapters / Notes (Text Box 2 - Optional) */}
            <div>
              <label htmlFor="ap-eo-specific-topics" className="block text-xs sm:text-sm font-bold text-slate-900">
                3. Any specific chapters or details? <span className="font-normal text-slate-500">(Optional)</span>
              </label>
              <textarea
                id="ap-eo-specific-topics"
                rows={2}
                value={specificTopics}
                onChange={(e) => setSpecificTopics(e.target.value)}
                placeholder="e.g. Need more practice questions on Ramayanam, previous year pattern questions, etc."
                className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-hidden focus:ring-1 focus:ring-teal-600 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDismiss}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-teal-700 px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-sm hover:bg-teal-800 transition disabled:opacity-50"
              >
                {isSubmitting ? "Saving priority…" : "Submit Priority"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
