"use client";

import { useActionState, useEffect, useState } from "react";
import { PendingSubmitButton } from "@/components/feedback/PendingSubmitButton";
import { updateQuestionReport, type ReportAdminState } from "./actions";

const initialState: ReportAdminState = { success: false, message: "" };

const PRESET_NOTES = [
  "Answer key corrected in Question Bank",
  "Question text and options revised",
  "Translation discrepancy corrected",
  "Verified accurate — question is valid as intended",
  "Duplicate report marked as resolved",
];

const STATUS_OPTIONS = [
  { value: "open", label: "Open", activeClass: "border-rose-700 bg-rose-700 text-white font-semibold" },
  { value: "reviewing", label: "Reviewing", activeClass: "border-amber-700 bg-amber-700 text-white font-semibold" },
  { value: "resolved", label: "Resolved", activeClass: "border-emerald-700 bg-emerald-700 text-white font-semibold" },
  { value: "dismissed", label: "Dismissed", activeClass: "border-slate-800 bg-slate-800 text-white font-semibold" },
];

export function ReportAdminForm({
  reportId,
  status: initialStatus,
  notes: initialNotes,
  resolvedAt,
  resolvedByName,
}: {
  reportId: string;
  status: string;
  notes: string | null;
  resolvedAt?: string | null;
  resolvedByName?: string | null;
}) {
  const [state, formAction] = useActionState(updateQuestionReport, initialState);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [notesValue, setNotesValue] = useState(initialNotes ?? "");

  useEffect(() => {
    if (state.success && typeof window !== "undefined") {
      window.dispatchEvent(new Event("admin-badge-refresh"));
    }
  }, [state.success]);

  const handleApplyPreset = (preset: string) => {
    if (!notesValue.trim()) {
      setNotesValue(preset);
    } else if (!notesValue.includes(preset)) {
      setNotesValue(`${notesValue.trim()}. ${preset}`);
    }
    // If resolving or dismissing, automatically suggest resolved status if currently open
    if (selectedStatus === "open" || selectedStatus === "reviewing") {
      if (preset.includes("dismissed")) {
        setSelectedStatus("dismissed");
      } else {
        setSelectedStatus("resolved");
      }
    }
  };

  const formattedResolvedAt = resolvedAt
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      }).format(new Date(resolvedAt))
    : null;

  return (
    <form action={formAction} className="mt-4 rounded-2xl border border-slate-200/90 bg-slate-50 p-3.5 transition-all sm:p-5">
      <input type="hidden" name="report_id" value={reportId} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-slate-200/70 pb-3">
        <p className="text-xs font-black uppercase tracking-wider text-slate-700">Admin Triage & Resolution</p>
        {formattedResolvedAt && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 break-words">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 text-emerald-600 shrink-0">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Resolved on {formattedResolvedAt} {resolvedByName ? `by ${resolvedByName}` : ""}</span>
          </span>
        )}
      </div>

      <div className="mt-3.5 grid gap-4 lg:grid-cols-[16rem_1fr] lg:items-start">
        {/* Status selection */}
        <div>
          <label htmlFor={`status-${reportId}`} className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Report Status
          </label>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-2">
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = selectedStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedStatus(opt.value)}
                  className={`flex items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? opt.activeClass
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
          {/* Native select to ensure standard form submission */}
          <select
            id={`status-${reportId}`}
            name="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="sr-only"
            aria-label="Report Status"
          >
            <option value="open">Open</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        {/* Notes & Actions */}
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={`admin_notes-${reportId}`} className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Internal Admin Notes
            </label>
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">
              {notesValue.length} / 2,000
            </span>
          </div>

          <div className="mt-1.5">
            <textarea
              id={`admin_notes-${reportId}`}
              name="admin_notes"
              rows={2}
              maxLength={2000}
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-400 break-words"
              placeholder="Record actions taken, correction details, or reasons for resolving/dismissing this report..."
            />
          </div>

          {/* Quick preset chips */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Presets:</span>
            {PRESET_NOTES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 break-words text-left"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200/70 pt-3">
        <div className="min-h-5 min-w-0">
          {state.message && (
            <p
              aria-live="polite"
              className={`inline-flex items-center gap-1.5 text-xs font-bold break-words ${
                state.success ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {state.success ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              <span>{state.message}</span>
            </p>
          )}
        </div>

        <PendingSubmitButton
          pendingLabel="Saving…"
          className="w-full sm:w-auto rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-black text-white shadow-xs transition hover:bg-teal-800 disabled:opacity-60 text-center justify-center"
        >
          Save Changes
        </PendingSubmitButton>
      </div>
    </form>
  );
}
