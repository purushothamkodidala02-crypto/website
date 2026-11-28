"use client";

import { useEffect, useMemo, useState } from "react";
import { PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import {
  formatDuplicateLocation,
  isDuplicateIssue,
  type ImportIssueItem,
} from "@/lib/questions/import-issues";

type FilterTab = "all" | "duplicates" | "errors";

export type RetryImportPayload = {
  overrides: Record<number, Record<string, string>>;
  excludedRows: number[];
  allowDuplicatesOverride?: boolean;
};

type ImportIssuesPanelProps = {
  success: boolean;
  message: string;
  issues?: ImportIssueItem[];
  availableSubjects?: string[];
  isMockTest?: boolean;
  importMode?: "add" | "replace";
  hasSelectedFile: boolean;
  pending: boolean;
  currentAllowDuplicates?: boolean;
  onRetryImport: (payload: RetryImportPayload) => void;
};

function issueBadge(issue: ImportIssueItem): { label: string; className: string } {
  if (isDuplicateIssue(issue)) {
    return {
      label: "Duplicate",
      className: "bg-amber-100 text-amber-900 border-amber-200",
    };
  }
  switch (issue.kind) {
    case "date_format":
      return {
        label: "Date format",
        className: "bg-sky-100 text-sky-900 border-sky-200",
      };
    case "content_lifecycle":
      return {
        label: "Lifecycle",
        className: "bg-purple-100 text-purple-900 border-purple-200",
      };
    case "subject":
      return {
        label: "Subject",
        className: "bg-rose-100 text-rose-900 border-rose-200",
      };
    case "correct_answer":
      return {
        label: "Answer",
        className: "bg-rose-100 text-rose-900 border-rose-200",
      };
    default:
      return {
        label: "Error",
        className: "bg-red-100 text-red-900 border-red-200",
      };
  }
}

export function ImportIssuesPanel({
  success,
  message,
  issues,
  availableSubjects = [],
  isMockTest = false,
  importMode = "add",
  hasSelectedFile,
  pending,
  currentAllowDuplicates = false,
  onRetryImport,
}: ImportIssuesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const issuesKey = useMemo(
    () => (issues?.length ? issues.map((item) => item.id).join("|") : "none"),
    [issues],
  );

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, pending]);

  const duplicateIssues = useMemo(
    () => (issues ?? []).filter(isDuplicateIssue),
    [issues],
  );
  const errorIssues = useMemo(
    () => (issues ?? []).filter((item) => !isDuplicateIssue(item)),
    [issues],
  );

  if (!message) return null;

  if (success || !issues?.length) {
    return (
      <p
        aria-live="polite"
        className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
          success
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-red-200 bg-red-50 text-red-700"
        }`}
      >
        {message}
      </p>
    );
  }

  function openModalWithTab(tab: FilterTab) {
    setActiveTab(tab);
    setIsOpen(true);
  }

  return (
    <>
      <div
        aria-live="polite"
        className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-red-800">{message}</span>
          {duplicateIssues.length > 0 && (
            <button
              type="button"
              onClick={() => openModalWithTab("duplicates")}
              className="rounded-lg border border-amber-300 bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-950 transition hover:bg-amber-200"
            >
              Duplicates found ({duplicateIssues.length})
            </button>
          )}
          {errorIssues.length > 0 && (
            <button
              type="button"
              onClick={() => openModalWithTab("errors")}
              className="rounded-lg border border-red-300 bg-white px-2.5 py-1 text-xs font-bold text-red-800 transition hover:bg-red-100"
            >
              Fix errors ({errorIssues.length})
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => openModalWithTab("all")}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800"
        >
          View &amp; fix ({issues.length})
        </button>
      </div>

      {isOpen && (
        <ImportIssuesModalContent
          key={issuesKey}
          issues={issues}
          duplicateIssues={duplicateIssues}
          errorIssues={errorIssues}
          availableSubjects={availableSubjects}
          isMockTest={isMockTest}
          importMode={importMode}
          hasSelectedFile={hasSelectedFile}
          pending={pending}
          currentAllowDuplicates={currentAllowDuplicates}
          isExpanded={isExpanded}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onToggleExpand={() => setIsExpanded((prev) => !prev)}
          onClose={() => setIsOpen(false)}
          onRetryImport={onRetryImport}
        />
      )}
    </>
  );
}

function ImportIssuesModalContent({
  issues,
  duplicateIssues,
  errorIssues,
  availableSubjects,
  isMockTest,
  importMode,
  hasSelectedFile,
  pending,
  currentAllowDuplicates,
  isExpanded,
  activeTab,
  onChangeTab,
  onToggleExpand,
  onClose,
  onRetryImport,
}: {
  issues: ImportIssueItem[];
  duplicateIssues: ImportIssueItem[];
  errorIssues: ImportIssueItem[];
  availableSubjects: string[];
  isMockTest: boolean;
  importMode: "add" | "replace";
  hasSelectedFile: boolean;
  pending: boolean;
  currentAllowDuplicates: boolean;
  isExpanded: boolean;
  activeTab: FilterTab;
  onChangeTab: (tab: FilterTab) => void;
  onToggleExpand: () => void;
  onClose: () => void;
  onRetryImport: (payload: RetryImportPayload) => void;
}) {
  const [overrides, setOverrides] = useState<Record<number, Record<string, string>>>({});
  const [excludedRows, setExcludedRows] = useState<number[]>([]);
  const [editingDuplicateRows, setEditingDuplicateRows] = useState<Record<number, boolean>>({});
  const [allowDuplicatesOverride, setAllowDuplicatesOverride] = useState(currentAllowDuplicates);

  const visibleIssues = useMemo(() => {
    if (activeTab === "duplicates") return duplicateIssues;
    if (activeTab === "errors") return errorIssues;
    return issues;
  }, [issues, activeTab, duplicateIssues, errorIssues]);

  const hasCrossTestDuplicate = useMemo(
    () =>
      duplicateIssues.some(
        (item) =>
          item.kind === "duplicate_in_other_test" ||
          item.kind === "duplicate_in_other_subject",
      ),
    [duplicateIssues],
  );

  const hasConvertibleDates = useMemo(
    () => errorIssues.some((item) => item.kind === "date_format" && Boolean(item.suggestedValue)),
    [errorIssues],
  );

  const hasInvalidLifecycles = useMemo(
    () => errorIssues.some((item) => item.kind === "content_lifecycle"),
    [errorIssues],
  );

  function updateFieldOverride(rowNumber: number, field: string, value: string) {
    setOverrides((prev) => ({
      ...prev,
      [rowNumber]: {
        ...(prev[rowNumber] ?? {}),
        [field]: value,
      },
    }));
  }

  function toggleExcludeRow(rowNumber: number) {
    setExcludedRows((prev) =>
      prev.includes(rowNumber) ? prev.filter((item) => item !== rowNumber) : [...prev, rowNumber],
    );
  }

  function convertAllDates() {
    setOverrides((prev) => {
      const next = { ...prev };
      for (const issue of errorIssues) {
        if (issue.kind === "date_format" && issue.suggestedValue) {
          next[issue.rowNumber] = {
            ...(next[issue.rowNumber] ?? {}),
            [issue.field]: issue.suggestedValue,
          };
        }
      }
      return next;
    });
  }

  function setAllInvalidLifecyclesPermanent() {
    setOverrides((prev) => {
      const next = { ...prev };
      for (const issue of errorIssues) {
        if (issue.kind === "content_lifecycle") {
          next[issue.rowNumber] = {
            ...(next[issue.rowNumber] ?? {}),
            content_lifecycle: "permanent",
          };
        }
      }
      return next;
    });
  }

  const editedRowCount = Object.keys(overrides).length;
  const skippedCount = excludedRows.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-issues-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-5"
      onClick={(event) => {
        if (event.target === event.currentTarget && !pending) {
          onClose();
        }
      }}
    >
      <div
        className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all ${
          isExpanded
            ? "h-[94vh] w-[97vw] max-w-none"
            : "max-h-[86vh] w-full max-w-5xl"
        }`}
      >
        {/* Modal Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <h3
              id="import-issues-modal-title"
              className="text-lg font-black text-slate-950"
            >
              Excel / CSV Import Issues ({issues.length})
            </h3>
            <p className="mt-0.5 text-xs text-slate-600">
              Review duplicate locations, fix date formats or lifecycle values directly in the table, and re-import.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleExpand}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              {isExpanded ? (
                <>
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
                  </svg>
                  Restore
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                  Expand
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              aria-label="Close modal"
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs & Bulk Quick Fixes */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onChangeTab("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All ({issues.length})
            </button>
            {duplicateIssues.length > 0 && (
              <button
                type="button"
                onClick={() => onChangeTab("duplicates")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === "duplicates"
                    ? "bg-amber-700 text-white"
                    : "bg-amber-50 text-amber-900 hover:bg-amber-100"
                }`}
              >
                Duplicates ({duplicateIssues.length})
              </button>
            )}
            {errorIssues.length > 0 && (
              <button
                type="button"
                onClick={() => onChangeTab("errors")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === "errors"
                    ? "bg-red-700 text-white"
                    : "bg-red-50 text-red-800 hover:bg-red-100"
                }`}
              >
                Errors ({errorIssues.length})
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasConvertibleDates && (
              <button
                type="button"
                onClick={convertAllDates}
                className="rounded-lg border border-sky-300 bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-900 hover:bg-sky-100"
              >
                Convert all dates to YYYY-MM-DD
              </button>
            )}
            {hasInvalidLifecycles && (
              <button
                type="button"
                onClick={setAllInvalidLifecyclesPermanent}
                className="rounded-lg border border-purple-300 bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-900 hover:bg-purple-100"
              >
                Set invalid lifecycles to permanent
              </button>
            )}
          </div>
        </div>

        {/* Table Body */}
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3 w-44">Row / Q#</th>
                <th className="px-4 py-3 w-36">Issue</th>
                <th className="px-4 py-3 w-52">Current Value</th>
                <th className="px-4 py-3">Where Found / Fix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {visibleIssues.map((issue) => {
                const badge = issueBadge(issue);
                const isDup = isDuplicateIssue(issue);
                const isExcluded = excludedRows.includes(issue.rowNumber);
                const rowEdits = overrides[issue.rowNumber] ?? {};
                const currentEditedValue = rowEdits[issue.field];
                const effectiveValue =
                  currentEditedValue !== undefined ? currentEditedValue : issue.currentValue;
                const lifecycleValue = (
                  rowEdits.content_lifecycle ??
                  issue.currentValue ??
                  ""
                )
                  .trim()
                  .toLowerCase();

                return (
                  <tr
                    key={issue.id}
                    className={isExcluded ? "bg-slate-50 opacity-60" : "hover:bg-slate-50/70"}
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
                          Row {issue.rowNumber}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
                          Q{issue.questionNumber}
                        </span>
                      </div>
                      {issue.questionPreview && (
                        <p
                          title={issue.questionPreview}
                          className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-slate-600"
                        >
                          {issue.questionPreview}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-bold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <p className="mt-1 font-mono text-[11px] text-slate-500">
                        {issue.field}
                      </p>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-800 break-words">
                        {issue.currentValue ? issue.currentValue : "(blank)"}
                      </div>
                      {issue.requiredFormat && (
                        <p className="mt-1 text-[11px] text-slate-500">
                          Required: <span className="font-semibold text-slate-700">{issue.requiredFormat}</span>
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 align-top">
                      {isDup ? (
                        <div className="space-y-2">
                          <div className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 font-semibold text-amber-950">
                            {formatDuplicateLocation(issue.duplicateLocation)}
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            {importMode !== "replace" ? (
                              <label className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={isExcluded}
                                  onChange={() => toggleExcludeRow(issue.rowNumber)}
                                  className="h-3.5 w-3.5 rounded border-slate-300"
                                />
                                <span>Skip this row</span>
                              </label>
                            ) : (
                              <span className="text-[11px] text-slate-500">
                                Replace mode needs exact question count; edit text or allow duplicates.
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setEditingDuplicateRows((prev) => ({
                                  ...prev,
                                  [issue.rowNumber]: !prev[issue.rowNumber],
                                }))
                              }
                              className="font-bold text-teal-700 hover:underline"
                            >
                              {editingDuplicateRows[issue.rowNumber] ? "Hide editor" : "Edit question text"}
                            </button>
                          </div>
                          {editingDuplicateRows[issue.rowNumber] && (
                            <textarea
                              rows={2}
                              value={effectiveValue}
                              onChange={(e) =>
                                updateFieldOverride(issue.rowNumber, issue.field, e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
                            />
                          )}
                        </div>
                      ) : issue.editableType === "date" ? (
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              placeholder="YYYY-MM-DD"
                              value={currentEditedValue ?? ""}
                              onChange={(e) =>
                                updateFieldOverride(issue.rowNumber, issue.field, e.target.value)
                              }
                              className="w-36 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
                            />
                            <input
                              type="date"
                              aria-label={`Pick ${issue.field} for row ${issue.rowNumber}`}
                              value={
                                /^\d{4}-\d{2}-\d{2}$/.test(currentEditedValue ?? "")
                                  ? currentEditedValue
                                  : ""
                              }
                              onChange={(e) =>
                                updateFieldOverride(issue.rowNumber, issue.field, e.target.value)
                              }
                              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 focus:border-teal-600 focus:outline-none"
                            />
                            {issue.suggestedValue && currentEditedValue !== issue.suggestedValue && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateFieldOverride(
                                    issue.rowNumber,
                                    issue.field,
                                    issue.suggestedValue!,
                                  )
                                }
                                className="rounded-lg border border-sky-300 bg-sky-50 px-2.5 py-1 font-bold text-sky-900 hover:bg-sky-100"
                              >
                                Use {issue.suggestedValue}
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">{issue.message}</p>
                        </div>
                      ) : issue.editableType === "lifecycle" ? (
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={
                                ["permanent", "review", "expires"].includes(lifecycleValue)
                                  ? lifecycleValue
                                  : ""
                              }
                              onChange={(e) =>
                                updateFieldOverride(
                                  issue.rowNumber,
                                  "content_lifecycle",
                                  e.target.value,
                                )
                              }
                              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:outline-none"
                            >
                              <option value="">Choose lifecycle…</option>
                              <option value="permanent">permanent</option>
                              <option value="review">review</option>
                              <option value="expires">expires</option>
                            </select>
                            {(lifecycleValue === "review" || lifecycleValue === "expires") && (
                              <input
                                type="date"
                                aria-label={`Date for ${lifecycleValue} on row ${issue.rowNumber}`}
                                value={
                                  (lifecycleValue === "review"
                                    ? rowEdits.review_on
                                    : rowEdits.expires_on) ??
                                  issue.relatedDateValue ??
                                  ""
                                }
                                onChange={(e) =>
                                  updateFieldOverride(
                                    issue.rowNumber,
                                    lifecycleValue === "review" ? "review_on" : "expires_on",
                                    e.target.value,
                                  )
                                }
                                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
                              />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">{issue.message}</p>
                        </div>
                      ) : issue.editableType === "subject" && availableSubjects.length > 0 ? (
                        <div className="space-y-1.5">
                          <select
                            value={currentEditedValue ?? ""}
                            onChange={(e) =>
                              updateFieldOverride(issue.rowNumber, "subject", e.target.value)
                            }
                            className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:outline-none"
                          >
                            <option value="">Choose subject…</option>
                            {availableSubjects.map((subj) => (
                              <option key={subj} value={subj}>
                                {subj}
                              </option>
                            ))}
                          </select>
                          <p className="text-[11px] text-slate-500">{issue.message}</p>
                        </div>
                      ) : issue.editableType === "answer" ? (
                        <div className="space-y-1.5">
                          <select
                            value={(currentEditedValue ?? "").toUpperCase()}
                            onChange={(e) =>
                              updateFieldOverride(
                                issue.rowNumber,
                                "correct_answer",
                                e.target.value,
                              )
                            }
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:outline-none"
                          >
                            <option value="">Choose A / B / C / D…</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                          <p className="text-[11px] text-slate-500">{issue.message}</p>
                        </div>
                      ) : issue.editableType === "boolean" ? (
                        <div className="space-y-1.5">
                          <select
                            value={currentEditedValue ?? ""}
                            onChange={(e) =>
                              updateFieldOverride(issue.rowNumber, issue.field, e.target.value)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-teal-600 focus:outline-none"
                          >
                            <option value="">Choose true / false…</option>
                            <option value="true">true</option>
                            <option value="false">false</option>
                          </select>
                          <p className="text-[11px] text-slate-500">{issue.message}</p>
                        </div>
                      ) : issue.editableType === "number" ? (
                        <div className="space-y-1.5">
                          <input
                            type="number"
                            step="any"
                            value={currentEditedValue ?? ""}
                            onChange={(e) =>
                              updateFieldOverride(issue.rowNumber, issue.field, e.target.value)
                            }
                            className="w-36 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
                          />
                          <p className="text-[11px] text-slate-500">{issue.message}</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={currentEditedValue ?? ""}
                            placeholder={`Enter ${issue.field}…`}
                            onChange={(e) =>
                              updateFieldOverride(issue.rowNumber, issue.field, e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
                          />
                          <p className="text-[11px] text-slate-500">{issue.message}</p>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span>
              {editedRowCount} edited · {skippedCount} skipped
            </span>
            {isMockTest && hasCrossTestDuplicate && (
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={allowDuplicatesOverride}
                  onChange={(e) => setAllowDuplicatesOverride(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300"
                />
                <span>Allow duplicates</span>
              </label>
            )}
            {!hasSelectedFile && (
              <span className="font-semibold text-red-700">
                Re-select your file in the form to apply fixes.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Close
            </button>
            <button
              type="button"
              disabled={pending || !hasSelectedFile}
              onClick={() =>
                onRetryImport({
                  overrides,
                  excludedRows,
                  allowDuplicatesOverride,
                })
              }
              className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PendingButtonContent pending={pending} pendingLabel="Importing…">
                Apply fixes &amp; Re-import
              </PendingButtonContent>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
