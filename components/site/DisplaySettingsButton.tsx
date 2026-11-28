"use client";

import { useEffect, useId, useRef } from "react";
import {
  DEFAULT_DISPLAY_PREFERENCES,
  type MotionOption,
  type PreferredLanguageOption,
  type QuestionFontOption,
  type ReadingToneOption,
  type TextScaleOption,
} from "@/lib/preferences/display-preferences";
import { useDisplayPreferences } from "./DisplayPreferencesProvider";

type DisplaySettingsButtonProps = {
  variant?: "header" | "compact";
  className?: string;
};

const TEXT_SCALE_OPTIONS: Array<{
  value: TextScaleOption;
  label: string;
  sample: string;
}> = [
  { value: "compact", label: "Compact", sample: "A−" },
  { value: "standard", label: "Standard", sample: "A" },
  { value: "large", label: "Large", sample: "A+" },
  { value: "xlarge", label: "Extra Large", sample: "A++" },
];

const QUESTION_FONT_OPTIONS: Array<{
  value: QuestionFontOption;
  label: string;
  detail: string;
}> = [
  { value: "serif", label: "Exam Serif", detail: "Classic paper feel" },
  { value: "sans", label: "Clean Sans", detail: "Crisp screen reading" },
];

const READING_TONE_OPTIONS: Array<{
  value: ReadingToneOption;
  label: string;
  swatchClass: string;
}> = [
  { value: "default", label: "Crisp White", swatchClass: "bg-white border-slate-300" },
  { value: "cream", label: "Warm Paper", swatchClass: "bg-[#fdf8ee] border-[#d6c5a3]" },
  { value: "contrast", label: "High Contrast", swatchClass: "bg-white border-slate-900 ring-1 ring-slate-900" },
];

const LANGUAGE_OPTIONS: Array<{
  value: PreferredLanguageOption;
  label: string;
  lang?: string;
}> = [
  { value: "en", label: "English" },
  { value: "te", label: "తెలుగు", lang: "te" },
];

const MOTION_OPTIONS: Array<{
  value: MotionOption;
  label: string;
}> = [
  { value: "auto", label: "System default" },
  { value: "reduced", label: "Reduced motion" },
];

export function DisplaySettingsButton({
  variant = "header",
  className = "",
}: DisplaySettingsButtonProps) {
  const { preferences, updatePreferences, resetPreferences } = useDisplayPreferences();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const isCustomized =
    preferences.textScale !== DEFAULT_DISPLAY_PREFERENCES.textScale ||
    preferences.questionFont !== DEFAULT_DISPLAY_PREFERENCES.questionFont ||
    preferences.readingTone !== DEFAULT_DISPLAY_PREFERENCES.readingTone ||
    preferences.defaultLanguage !== DEFAULT_DISPLAY_PREFERENCES.defaultLanguage ||
    preferences.motion !== DEFAULT_DISPLAY_PREFERENCES.motion;

  const openDialog = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
  };

  const closeDialog = () => {
    const dialog = dialogRef.current;
    if (dialog?.open) {
      dialog.close();
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if ("closedBy" in HTMLDialogElement.prototype) return;

    const outside = (e: PointerEvent) => {
      const rect = dialog.getBoundingClientRect();
      return (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      );
    };

    let pressedOutside = false;
    const onPointerDown = (e: PointerEvent) => {
      pressedOutside = outside(e);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && outside(e)) {
        dialog.close();
      }
      pressedOutside = false;
    };

    dialog.addEventListener("pointerdown", onPointerDown);
    dialog.addEventListener("pointerup", onPointerUp);
    return () => {
      dialog.removeEventListener("pointerdown", onPointerDown);
      dialog.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label="Display and reading settings"
        title="Font, text size, reading comfort & language settings"
        className={
          variant === "compact"
            ? `relative inline-flex min-h-[34px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-teal-300 hover:bg-teal-50/70 hover:text-teal-950 ${className}`
            : `relative inline-flex h-9 sm:h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition hover:border-teal-300 hover:bg-teal-50/60 hover:text-teal-950 ${className}`
        }
      >
        <span className="font-semibold tracking-tight text-teal-800" aria-hidden="true">
          Aa
        </span>
        <span className={variant === "compact" ? "hidden sm:inline" : "hidden md:inline"}>
          Display
        </span>
        {isCustomized && (
          <span
            className="h-1.5 w-1.5 rounded-full bg-teal-600"
            aria-hidden="true"
          />
        )}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        {...({ closedby: "any" } as Record<string, string>)}
        className="display-settings-dialog m-auto w-[min(32rem,calc(100vw-1.5rem))] max-h-[90dvh] overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-[#0a2922]/55 backdrop:backdrop-blur-[2px]"
      >
        <div className="flex max-h-[90dvh] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-800">
                Reading &amp; Display
              </p>
              <h1 id={titleId} className="font-display text-lg font-bold text-slate-950">
                Display Settings
              </h1>
            </div>
            <button
              type="button"
              autoFocus
              onClick={closeDialog}
              aria-label="Close display settings"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-base font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            >
              ✕
            </button>
          </div>

          <div className="shrink-0 border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
            {/* Live Preview (pinned above scroll so every control updates visibly) */}
            <div className="reading-card rounded-2xl border p-3.5 transition-colors">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                  Live Question Preview
                </span>
                <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-900">
                  {preferences.defaultLanguage === "te" ? "తెలుగు" : "English"} ·{" "}
                  {preferences.questionFont === "sans" ? "Clean Sans" : "Exam Serif"}
                </span>
              </div>
              <div className="reading-surface font-exam text-sm leading-relaxed text-slate-900">
                {preferences.defaultLanguage === "te" ? (
                  <p lang="te" className="font-telugu">
                    తెలంగాణ రాష్ట్రంలో మొదటి పురపాలక సంఘం ఏది? (సరైన సమాధానాన్ని ఎంచుకోండి)
                  </p>
                ) : (
                  <p>
                    Which article of the Indian Constitution deals with the establishment of the Finance Commission?
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-4">

            {/* Text Size */}
            <fieldset className="space-y-2">
              <legend className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Question &amp; Reading Text Size
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {TEXT_SCALE_OPTIONS.map((option) => {
                  const active = preferences.textScale === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => updatePreferences({ textScale: option.value })}
                      className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border px-3 py-2.5 text-center transition ${
                        active
                          ? "border-teal-700 bg-teal-50 text-teal-950 ring-1 ring-teal-600"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-sm font-black">{option.sample}</span>
                      <span className="text-[11px] font-semibold">
                        {active ? "✓ " : ""}
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Question Font */}
            <fieldset className="space-y-2">
              <legend className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Question Font Style
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {QUESTION_FONT_OPTIONS.map((option) => {
                  const active = preferences.questionFont === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => updatePreferences({ questionFont: option.value })}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition ${
                        active
                          ? "border-teal-700 bg-teal-50 text-teal-950 ring-1 ring-teal-600"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="min-w-0">
                        <span
                          className={`block text-sm font-bold ${
                            option.value === "serif" ? "font-brand" : "font-sans"
                          }`}
                        >
                          {option.label}
                        </span>
                        <span className="block text-[11px] text-slate-500">{option.detail}</span>
                      </span>
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                          active ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-400"
                        }`}
                        aria-hidden="true"
                      >
                        {active ? "✓" : "Aa"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Reading Comfort Surface */}
            <fieldset className="space-y-2">
              <legend className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Paper Comfort Surface
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {READING_TONE_OPTIONS.map((option) => {
                  const active = preferences.readingTone === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => updatePreferences({ readingTone: option.value })}
                      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition ${
                        active
                          ? "border-teal-700 bg-teal-50 text-teal-950 ring-1 ring-teal-600"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`h-5 w-5 shrink-0 rounded-md border ${option.swatchClass}`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        {active ? "✓ " : ""}
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Default Bilingual Language */}
            <fieldset className="space-y-2">
              <legend className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Preferred Question Language
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGE_OPTIONS.map((option) => {
                  const active = preferences.defaultLanguage === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      lang={option.lang}
                      aria-pressed={active}
                      onClick={() => updatePreferences({ defaultLanguage: option.value })}
                      className={`rounded-xl border px-3 py-2.5 text-xs sm:text-sm font-bold transition ${
                        active
                          ? "border-teal-700 bg-teal-50 text-teal-950 ring-1 ring-teal-600"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {active ? "✓ " : ""}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Motion */}
            <fieldset className="space-y-2">
              <legend className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Transitions &amp; Motion
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {MOTION_OPTIONS.map((option) => {
                  const active = preferences.motion === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => updatePreferences({ motion: option.value })}
                      className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                        active
                          ? "border-teal-700 bg-teal-50 text-teal-950 ring-1 ring-teal-600"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {active ? "✓ " : ""}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5">
            <button
              type="button"
              onClick={resetPreferences}
              disabled={!isCustomized}
              className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-40"
            >
              Reset defaults
            </button>
            <button
              type="button"
              onClick={closeDialog}
              className="rounded-xl bg-[#0a2922] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-[#11382f]"
            >
              Done
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
