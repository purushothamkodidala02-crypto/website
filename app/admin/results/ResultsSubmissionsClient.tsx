"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminAttemptDetailAction,
  type AttemptInspectionDetail,
} from "./actions";

export type ScoreBand = "all" | "high" | "moderate" | "low" | "zero";

export type AttemptRowItem = {
  id: string;
  userId: string;
  studentName: string;
  studentContact: string;
  studentEmail: string;
  studentPhone: string;
  mockTestId: string;
  primaryTitle: string;
  testLabel: string | null;
  breadcrumb: string[];
  score: number;
  totalMarks: number;
  scorePercent: number;
  accuracyPercent: number | null;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  submittedAt: string;
  submittedAtFormatted: string;
  submittedAtMs: number;
};

export type MockTestOption = {
  id: string;
  label: string;
};

type SortKey = "candidate" | "mockTest" | "score" | "accuracy" | "submitted";
type SortDir = "ascending" | "descending";

type Props = {
  attempts: AttemptRowItem[];
  summary: {
    completedAttempts: number;
    participants: number;
    averageScore: number;
    averageAccuracy: number;
  };
  totalMatchedCount: number;
  page: number;
  totalPages: number;
  pageSize: number;
  mockTestOptions: MockTestOption[];
  initialSearch: string;
  initialTestId: string;
  initialBand: ScoreBand;
};

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

function escapeCsvCell(value: string | number): string {
  const raw = String(value ?? "");
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

function getBandForAttempt(attempt: AttemptRowItem): Exclude<ScoreBand, "all"> {
  if (attempt.score <= 0 || attempt.scorePercent === 0) return "zero";
  if (attempt.scorePercent >= 60) return "high";
  if (attempt.scorePercent >= 35) return "moderate";
  return "low";
}

function getScoreBadgeClasses(attempt: AttemptRowItem): string {
  const band = getBandForAttempt(attempt);
  if (band === "high") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (band === "moderate") return "border-amber-200 bg-amber-50 text-amber-800";
  if (band === "low") return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-slate-200 bg-slate-100 text-slate-700";
}

function SortChevron({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-3.5 w-3.5 shrink-0 transition-transform ${
        active ? "text-teal-800" : "text-teal-700/40"
      } ${active && dir === "ascending" ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

export function ResultsSubmissionsClient({
  attempts,
  summary,
  totalMatchedCount,
  page,
  totalPages,
  pageSize,
  mockTestOptions,
  initialSearch,
  initialTestId,
  initialBand,
}: Props) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [selectedTestId, setSelectedTestId] = useState(initialTestId);
  const [selectedBand, setSelectedBand] = useState<ScoreBand>(initialBand);
  const [sortKey, setSortKey] = useState<SortKey>("submitted");
  const [sortDir, setSortDir] = useState<SortDir>("descending");
  const [sortStatusMessage, setSortStatusMessage] = useState("");

  // Submission Inspector modal state
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [inspectedAttempt, setInspectedAttempt] = useState<AttemptRowItem | null>(null);
  const [inspectorLoading, setInspectorLoading] = useState(false);
  const [inspectorError, setInspectorError] = useState<string | null>(null);
  const [inspectorDetail, setInspectorDetail] = useState<AttemptInspectionDetail | null>(null);
  const [questionFilter, setQuestionFilter] = useState<"all" | "correct" | "incorrect" | "skipped">("all");

  useEffect(() => {
    setSearchInput(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setSelectedTestId(initialTestId);
  }, [initialTestId]);

  useEffect(() => {
    setSelectedBand(initialBand);
  }, [initialBand]);

  // Safari fallback for closedby="any" light dismiss on <dialog>
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if ("closedBy" in HTMLDialogElement.prototype) return;

    const isOutside = (e: PointerEvent) => {
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
      pressedOutside = isOutside(e);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) {
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

  const buildUrl = useCallback(
    (overrides: { q?: string; test?: string; band?: ScoreBand; page?: number }) => {
      const params = new URLSearchParams();
      const qVal = (overrides.q ?? searchInput).trim();
      const testVal = overrides.test ?? selectedTestId;
      const bandVal = overrides.band ?? selectedBand;
      const pageVal = overrides.page ?? 1;

      if (qVal) params.set("q", qVal);
      if (testVal) params.set("test", testVal);
      if (bandVal && bandVal !== "all") params.set("band", bandVal);
      if (pageVal > 1) params.set("page", String(pageVal));

      const qs = params.toString();
      return qs ? `/admin/results?${qs}` : "/admin/results";
    },
    [searchInput, selectedTestId, selectedBand],
  );

  const navigateWithFilters = useCallback(
    (overrides: { q?: string; test?: string; band?: ScoreBand; page?: number }) => {
      router.push(buildUrl(overrides));
    },
    [buildUrl, router],
  );

  // Instant client-side refinement + sorting over loaded rows
  const filteredAndSortedAttempts = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    const filtered = attempts.filter((item) => {
      if (selectedBand !== "all" && getBandForAttempt(item) !== selectedBand) {
        return false;
      }
      if (selectedTestId && item.mockTestId !== selectedTestId) {
        return false;
      }
      if (q && q !== initialSearch.trim().toLowerCase()) {
        const haystack = [
          item.studentName,
          item.studentEmail,
          item.studentPhone,
          item.primaryTitle,
          item.testLabel ?? "",
          item.breadcrumb.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const factor = sortDir === "ascending" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "candidate":
          return factor * collator.compare(a.studentName, b.studentName);
        case "mockTest":
          return factor * collator.compare(a.primaryTitle, b.primaryTitle);
        case "score":
          return factor * (a.scorePercent - b.scorePercent || a.score - b.score);
        case "accuracy":
          return factor * ((a.accuracyPercent ?? -1) - (b.accuracyPercent ?? -1));
        case "submitted":
        default:
          return factor * (a.submittedAtMs - b.submittedAtMs);
      }
    });
  }, [attempts, searchInput, initialSearch, selectedBand, selectedTestId, sortKey, sortDir]);

  // Insights computed from current server-returned window
  const windowInsights = useMemo(() => {
    const bands = { high: 0, moderate: 0, low: 0, zero: 0 };
    const testBuckets = new Map<
      string,
      { id: string; title: string; label: string | null; count: number; totalPct: number }
    >();

    for (const item of attempts) {
      bands[getBandForAttempt(item)] += 1;
      const existing = testBuckets.get(item.mockTestId) ?? {
        id: item.mockTestId,
        title: item.primaryTitle,
        label: item.testLabel,
        count: 0,
        totalPct: 0,
      };
      existing.count += 1;
      existing.totalPct += item.scorePercent;
      testBuckets.set(item.mockTestId, existing);
    }

    const topTests = [...testBuckets.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((t) => ({
        ...t,
        avgScore: Math.round(t.totalPct / t.count),
      }));

    return { bands, total: attempts.length, topTests };
  }, [attempts]);

  const handleSort = (column: SortKey, label: string) => {
    const nextDir: SortDir =
      sortKey === column
        ? sortDir === "ascending"
          ? "descending"
          : "ascending"
        : column === "candidate" || column === "mockTest"
          ? "ascending"
          : "descending";
    setSortKey(column);
    setSortDir(nextDir);
    setSortStatusMessage(
      `Sorted by ${label}, ${nextDir}, ${filteredAndSortedAttempts.length} rows`,
    );
  };

  const handleExportCsv = () => {
    const headers = [
      "Candidate Name",
      "Contact",
      "Mock Test",
      "Series Label",
      "Exam Path",
      "Score",
      "Total Marks",
      "Score %",
      "Accuracy %",
      "Correct",
      "Incorrect",
      "Unanswered",
      "Submitted At (IST)",
    ];
    const rows = filteredAndSortedAttempts.map((a) => [
      a.studentName,
      a.studentContact,
      a.primaryTitle,
      a.testLabel ?? "",
      a.breadcrumb.join(" / "),
      a.score,
      a.totalMarks,
      `${a.scorePercent}%`,
      a.accuracyPercent === null ? "N/A" : `${a.accuracyPercent}%`,
      a.correctAnswers,
      a.incorrectAnswers,
      a.unansweredQuestions,
      a.submittedAtFormatted,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvCell).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `varadhi-results-page-${page}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openInspector = async (attempt: AttemptRowItem) => {
    setInspectedAttempt(attempt);
    setInspectorDetail(null);
    setInspectorError(null);
    setQuestionFilter("all");
    setInspectorLoading(true);
    dialogRef.current?.showModal();

    const res = await getAdminAttemptDetailAction(attempt.id);
    setInspectorLoading(false);
    if (res.success && res.detail) {
      setInspectorDetail(res.detail);
    } else {
      setInspectorError(res.error ?? "Could not load detailed responses.");
    }
  };

  const closeInspector = () => {
    dialogRef.current?.close();
  };

  const handleDialogClose = () => {
    if (dialogRef.current) {
      dialogRef.current.returnValue = "";
    }
    setInspectedAttempt(null);
    setInspectorDetail(null);
    setInspectorError(null);
  };

  const filteredInspectorQuestions = useMemo(() => {
    const items = inspectorDetail?.questions ?? [];
    if (questionFilter === "all") return items;
    if (questionFilter === "correct") return items.filter((q) => q.selectedAnswer && q.isCorrect);
    if (questionFilter === "incorrect") return items.filter((q) => q.selectedAnswer && !q.isCorrect);
    return items.filter((q) => !q.selectedAnswer);
  }, [inspectorDetail, questionFilter]);

  const hasActiveServerFilters = Boolean(initialSearch || initialTestId || initialBand !== "all");
  const hasAnyFilters = Boolean(
    searchInput.trim() || selectedTestId || selectedBand !== "all" || hasActiveServerFilters,
  );
  const attemptsPerParticipant =
    summary.participants > 0
      ? (summary.completedAttempts / summary.participants).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Compact Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between border-b border-slate-200/80 pb-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-800">
            Candidate Analytics
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Results &amp; Submissions
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Audit completed test attempts, inspect question accuracy, and export filtered reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredAndSortedAttempts.length === 0}
            className="inline-flex min-h-[38px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
          >
            <svg aria-hidden="true" className="h-4 w-4 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="admin-stat">Export CSV ({filteredAndSortedAttempts.length})</span>
          </button>

          <Link
            href="/admin/mock-tests"
            prefetch={false}
            className="inline-flex min-h-[38px] items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/80 px-3.5 py-2 text-xs font-bold text-teal-900 shadow-2xs transition hover:border-teal-300 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:text-sm"
          >
            <span>Review Mock Tests</span>
            <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <section aria-label="Overall assessment metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/60 via-white to-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Attempts</p>
            <span className="grid h-8 w-8 place-items-center rounded-xl border border-teal-100 bg-teal-50 text-teal-800">
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </span>
          </div>
          <p className="admin-stat mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {Number(summary.completedAttempts).toLocaleString("en-IN")}
          </p>
          <p className="mt-1.5 text-xs font-medium text-slate-500">
            Total submitted tests across platform
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Participants</p>
            <span className="grid h-8 w-8 place-items-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-800">
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="9" cy="8" r="3" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 20v-2.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V20" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a2.5 2.5 0 1 0 0-5M17.5 20v-2a3.5 3.5 0 0 0-2-3.16" />
              </svg>
            </span>
          </div>
          <p className="admin-stat mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {Number(summary.participants).toLocaleString("en-IN")}
          </p>
          <p className="admin-stat mt-1.5 text-xs font-medium text-slate-500">
            {attemptsPerParticipant} avg attempts per candidate
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Score</p>
            <span className="grid h-8 w-8 place-items-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800">
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </span>
          </div>
          <p className="admin-stat mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {Number(summary.averageScore).toFixed(1)}%
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${Math.min(100, Math.max(0, Number(summary.averageScore)))}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Accuracy</p>
            <span className="grid h-8 w-8 place-items-center rounded-xl border border-amber-100 bg-amber-50 text-amber-800">
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </span>
          </div>
          <p className="admin-stat mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {Number(summary.averageAccuracy).toFixed(1)}%
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full rounded-full bg-amber-500"
              style={{ width: `${Math.min(100, Math.max(0, Number(summary.averageAccuracy)))}%` }}
            />
          </div>
        </div>
      </section>

      {/* Window Insights Strip */}
      {attempts.length > 0 && (
        <section aria-label="Current view distribution and active tests" className="grid gap-4 lg:grid-cols-2">
          {/* Score Band Distribution */}
          <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Score Distribution (Current Window)
              </h2>
              <span className="text-xs font-semibold text-slate-400 tabular-nums">
                {windowInsights.total} rows
              </span>
            </div>

            <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              {windowInsights.bands.high > 0 && (
                <div
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${(windowInsights.bands.high / windowInsights.total) * 100}%` }}
                  title={`High (≥60%): ${windowInsights.bands.high}`}
                />
              )}
              {windowInsights.bands.moderate > 0 && (
                <div
                  className="bg-amber-400 transition-all"
                  style={{ width: `${(windowInsights.bands.moderate / windowInsights.total) * 100}%` }}
                  title={`Moderate (35–59%): ${windowInsights.bands.moderate}`}
                />
              )}
              {windowInsights.bands.low > 0 && (
                <div
                  className="bg-rose-400 transition-all"
                  style={{ width: `${(windowInsights.bands.low / windowInsights.total) * 100}%` }}
                  title={`Low (<35%): ${windowInsights.bands.low}`}
                />
              )}
              {windowInsights.bands.zero > 0 && (
                <div
                  className="bg-slate-400 transition-all"
                  style={{ width: `${(windowInsights.bands.zero / windowInsights.total) * 100}%` }}
                  title={`Zero (0%): ${windowInsights.bands.zero}`}
                />
              )}
            </div>

            <div className="mt-3.5 flex flex-wrap gap-2">
              {[
                { key: "high" as const, label: "High ≥60%", count: windowInsights.bands.high, dot: "bg-emerald-500" },
                { key: "moderate" as const, label: "Moderate 35–59%", count: windowInsights.bands.moderate, dot: "bg-amber-400" },
                { key: "low" as const, label: "Low <35%", count: windowInsights.bands.low, dot: "bg-rose-400" },
                { key: "zero" as const, label: "Zero 0%", count: windowInsights.bands.zero, dot: "bg-slate-400" },
              ].map((band) => {
                const active = selectedBand === band.key;
                return (
                  <button
                    key={band.key}
                    type="button"
                    onClick={() => navigateWithFilters({ band: active ? "all" : band.key, page: 1 })}
                    aria-pressed={active}
                    className={`inline-flex min-h-[28px] items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                      active
                        ? "border-teal-700 bg-teal-700 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-300 hover:bg-teal-50"
                    }`}
                  >
                    <span>{band.label}</span>
                    <span className={`admin-stat ${active ? "text-teal-100" : "text-slate-500"}`}>
                      ({band.count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Most Active Mock Tests in View */}
          <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Top Tests in Current Window
              </h2>
              <span className="text-xs font-semibold text-slate-400">Click to filter</span>
            </div>

            <div className="mt-3 space-y-2">
              {windowInsights.topTests.map((t) => {
                const isSelected = selectedTestId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => navigateWithFilters({ test: isSelected ? "" : t.id, page: 1 })}
                    aria-pressed={isSelected}
                    className={`flex w-full min-h-[36px] items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                      isSelected
                        ? "border-teal-600 bg-teal-50 text-teal-950"
                        : "border-slate-100 bg-slate-50/70 text-slate-700 hover:border-teal-200 hover:bg-teal-50/40"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate font-bold text-slate-900">{t.title}</span>
                      {t.label && (
                        <span className="shrink-0 rounded-full border border-teal-200/80 bg-white px-2 py-0.5 text-[10px] font-bold text-teal-800">
                          {t.label}
                        </span>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2 tabular-nums">
                      <span className="font-bold text-slate-900">{t.count} attempts</span>
                      <span className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-bold text-teal-800 border border-slate-200">
                        avg {t.avgScore}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Filter & Search Toolbar */}
      <section aria-label="Filter submissions" className="rounded-2xl border border-teal-100 bg-white p-4 shadow-xs sm:p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigateWithFilters({ q: searchInput, page: 1 });
          }}
          className="grid gap-3 md:grid-cols-12 md:items-end"
        >
          <div className="md:col-span-5">
            <label htmlFor="results-search" className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Search Candidate or Mock Test
            </label>
            <div className="relative mt-1.5 flex items-center gap-2">
              <div className="relative flex-1">
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  id="results-search"
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Name, phone, email, or test title..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-teal-800 px-4 text-xs font-bold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                Search All
              </button>
            </div>
          </div>

          <div className="md:col-span-4">
            <label htmlFor="results-test-filter" className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Mock Test
            </label>
            <select
              id="results-test-filter"
              value={selectedTestId}
              onChange={(e) => {
                const nextTest = e.target.value;
                setSelectedTestId(nextTest);
                navigateWithFilters({ test: nextTest, page: 1 });
              }}
              className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800"
            >
              <option value="">All Mock Tests</option>
              {mockTestOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="results-band-filter" className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Performance Band
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <select
                id="results-band-filter"
                value={selectedBand}
                onChange={(e) => {
                  const nextBand = e.target.value as ScoreBand;
                  setSelectedBand(nextBand);
                  navigateWithFilters({ band: nextBand, page: 1 });
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800"
              >
                <option value="all">All Scores</option>
                <option value="high">High (≥ 60%)</option>
                <option value="moderate">Moderate (35–59%)</option>
                <option value="low">Needs Review (&lt; 35%)</option>
                <option value="zero">Zero Score (0%)</option>
              </select>

              {hasAnyFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSelectedTestId("");
                    setSelectedBand("all");
                    router.push("/admin/results");
                  }}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </form>
      </section>

      {/* Submissions Table Card */}
      {filteredAndSortedAttempts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-teal-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-800">
            <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <h2 className="mt-3 text-base font-bold text-slate-900">No matching submissions found</h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
            {hasAnyFilters
              ? "Try broadening your search query, choosing a different mock test, or resetting the performance band filter."
              : "Candidate test submissions and score reports will populate automatically when students submit mock tests."}
          </p>
          {hasAnyFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSelectedTestId("");
                setSelectedBand("all");
                router.push("/admin/results");
              }}
              className="mt-4 inline-flex min-h-[36px] items-center rounded-xl bg-teal-800 px-4 py-2 text-xs font-bold text-white hover:bg-teal-900"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100 bg-slate-50/70 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Attempt Logs
              </h2>
              <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-800 tabular-nums">
                {totalMatchedCount.toLocaleString("en-IN")} total
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500 tabular-nums">
              Showing {(page - 1) * pageSize + 1}–{(page - 1) * pageSize + filteredAndSortedAttempts.length} on page {page}
            </span>
          </div>

          <div role="status" className="sr-status-live">
            {sortStatusMessage}
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-labelledby="results-table-caption"
            className="results-table-wrapper overflow-x-auto focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-teal-700"
          >
            <table className="results-responsive-table w-full min-w-[840px] border-separate border-spacing-0 text-left text-sm">
              <caption id="results-table-caption" className="sr-only">
                Candidate test submissions, scores, accuracy, and submission timestamps
              </caption>
              <thead className="sticky top-0 z-10 bg-teal-50/95 text-xs font-black uppercase tracking-wider text-teal-900 backdrop-blur-xs">
                <tr>
                  <th
                    scope="col"
                    aria-sort={sortKey === "candidate" ? sortDir : undefined}
                    className="border-b border-teal-100/90 p-0"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("candidate", "Candidate")}
                      className="flex min-h-[44px] w-full items-center justify-between gap-2 px-5 py-3 text-left font-black uppercase tracking-wider text-teal-900 hover:bg-teal-100/60 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-teal-700"
                    >
                      <span>Candidate</span>
                      <SortChevron active={sortKey === "candidate"} dir={sortDir} />
                    </button>
                  </th>

                  <th
                    scope="col"
                    aria-sort={sortKey === "mockTest" ? sortDir : undefined}
                    className="border-b border-teal-100/90 p-0"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("mockTest", "Mock Test")}
                      className="flex min-h-[44px] w-full items-center justify-between gap-2 px-5 py-3 text-left font-black uppercase tracking-wider text-teal-900 hover:bg-teal-100/60 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-teal-700"
                    >
                      <span>Mock Test</span>
                      <SortChevron active={sortKey === "mockTest"} dir={sortDir} />
                    </button>
                  </th>

                  <th
                    scope="col"
                    aria-sort={sortKey === "score" ? sortDir : undefined}
                    className="border-b border-teal-100/90 p-0"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("score", "Score")}
                      className="flex min-h-[44px] w-full items-center justify-between gap-2 px-5 py-3 text-left font-black uppercase tracking-wider text-teal-900 hover:bg-teal-100/60 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-teal-700"
                    >
                      <span>Score</span>
                      <SortChevron active={sortKey === "score"} dir={sortDir} />
                    </button>
                  </th>

                  <th
                    scope="col"
                    aria-sort={sortKey === "accuracy" ? sortDir : undefined}
                    className="border-b border-teal-100/90 p-0"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("accuracy", "Accuracy")}
                      className="flex min-h-[44px] w-full items-center justify-between gap-2 px-5 py-3 text-left font-black uppercase tracking-wider text-teal-900 hover:bg-teal-100/60 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-teal-700"
                    >
                      <span>Accuracy</span>
                      <SortChevron active={sortKey === "accuracy"} dir={sortDir} />
                    </button>
                  </th>

                  <th scope="col" className="border-b border-teal-100/90 px-5 py-3 text-left font-black uppercase tracking-wider text-teal-900">
                    Answer Breakdown
                  </th>

                  <th
                    scope="col"
                    aria-sort={sortKey === "submitted" ? sortDir : undefined}
                    className="border-b border-teal-100/90 p-0"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort("submitted", "Submitted At")}
                      className="flex min-h-[44px] w-full items-center justify-between gap-2 px-5 py-3 text-left font-black uppercase tracking-wider text-teal-900 hover:bg-teal-100/60 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-teal-700"
                    >
                      <span>Submitted</span>
                      <SortChevron active={sortKey === "submitted"} dir={sortDir} />
                    </button>
                  </th>

                  <th scope="col" className="border-b border-teal-100/90 px-5 py-3 text-right font-black uppercase tracking-wider text-teal-900">
                    Inspect
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-teal-50">
                {filteredAndSortedAttempts.map((attempt) => {
                  const totalQ =
                    attempt.correctAnswers +
                    attempt.incorrectAnswers +
                    attempt.unansweredQuestions;
                  const correctPct = totalQ > 0 ? (attempt.correctAnswers / totalQ) * 100 : 0;
                  const incorrectPct = totalQ > 0 ? (attempt.incorrectAnswers / totalQ) * 100 : 0;
                  const unansweredPct = totalQ > 0 ? (attempt.unansweredQuestions / totalQ) * 100 : 0;
                  const initial = attempt.studentName[0]?.toUpperCase() ?? "S";

                  return (
                    <tr
                      key={attempt.id}
                      className="group transition hover:bg-teal-50/35"
                    >
                      <th scope="row" className="border-b border-teal-50 px-5 py-3.5 text-left font-normal">
                        <div className="flex items-start gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-100 text-xs font-black text-teal-800">
                            {initial}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold leading-snug text-slate-950 break-words">
                              {attempt.studentName}
                            </p>
                            <p className="text-xs text-slate-500 break-all sm:break-words">
                              {attempt.studentContact}
                            </p>
                          </div>
                        </div>
                      </th>

                      <td data-label="Mock Test" className="border-b border-teal-50 px-5 py-3.5">
                        <div className="min-w-0 max-w-xs text-right md:text-left">
                          <div className="flex flex-wrap items-center justify-end gap-1.5 md:justify-start">
                            <span className="font-semibold leading-snug text-slate-900 break-words">
                              {attempt.primaryTitle}
                            </span>
                            {attempt.testLabel && (
                              <span className="shrink-0 rounded-full border border-teal-200/80 bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                                {attempt.testLabel}
                              </span>
                            )}
                          </div>
                          {attempt.breadcrumb.length > 0 && (
                            <p className="mt-0.5 text-[11px] font-medium text-slate-500 break-words">
                              {attempt.breadcrumb.join(" · ")}
                            </p>
                          )}
                        </div>
                      </td>

                      <td data-label="Score" className="border-b border-teal-50 px-5 py-3.5">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span className="font-black text-slate-950 tabular-nums">
                            {attempt.score} / {attempt.totalMarks}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-black tabular-nums ${getScoreBadgeClasses(attempt)}`}
                          >
                            {attempt.scorePercent}%
                          </span>
                        </div>
                      </td>

                      <td data-label="Accuracy" className="border-b border-teal-50 px-5 py-3.5 whitespace-nowrap">
                        {attempt.accuracyPercent === null ? (
                          <span className="text-xs font-semibold text-slate-400">0 attempted</span>
                        ) : (
                          <span className="font-bold text-slate-800 tabular-nums">
                            {attempt.accuracyPercent}%
                          </span>
                        )}
                      </td>

                      <td data-label="Breakdown" className="border-b border-teal-50 px-5 py-3.5">
                        <div className="min-w-[140px] space-y-1.5">
                          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            {correctPct > 0 && (
                              <div className="bg-emerald-500" style={{ width: `${correctPct}%` }} />
                            )}
                            {incorrectPct > 0 && (
                              <div className="bg-rose-400" style={{ width: `${incorrectPct}%` }} />
                            )}
                            {unansweredPct > 0 && (
                              <div className="bg-slate-300" style={{ width: `${unansweredPct}%` }} />
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-2 text-[11px] font-bold tabular-nums md:justify-start">
                            <span className="text-emerald-700" title="Correct">
                              {attempt.correctAnswers}✓
                            </span>
                            <span className="text-rose-600" title="Incorrect">
                              {attempt.incorrectAnswers}✕
                            </span>
                            <span className="text-slate-500" title="Unanswered">
                              {attempt.unansweredQuestions}—
                            </span>
                          </div>
                        </div>
                      </td>

                      <td data-label="Submitted" className="border-b border-teal-50 px-5 py-3.5 text-xs font-medium text-slate-500 whitespace-nowrap">
                        <time dateTime={attempt.submittedAt}>{attempt.submittedAtFormatted}</time>
                      </td>

                      <td data-label="Inspect" className="border-b border-teal-50 px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => openInspector(attempt)}
                          className="inline-flex min-h-[32px] items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/70 px-3 py-1.5 text-xs font-bold text-teal-900 transition hover:border-teal-300 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                        >
                          <span>Details</span>
                          <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 border-t border-teal-100 bg-slate-50/60 px-6 py-3.5">
              <Link
                href={buildUrl({ page: Math.max(1, page - 1) })}
                aria-disabled={page === 1}
                className={`inline-flex min-h-[36px] items-center rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 ${
                  page === 1 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                &larr; Previous
              </Link>

              <span className="text-xs font-semibold text-slate-500 tabular-nums">
                Page {page} of {totalPages}
              </span>

              <Link
                href={buildUrl({ page: Math.min(totalPages, page + 1) })}
                aria-disabled={page === totalPages}
                className={`inline-flex min-h-[36px] items-center rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 ${
                  page === totalPages ? "pointer-events-none opacity-40" : ""
                }`}
              >
                Next &rarr;
              </Link>
            </nav>
          )}
        </div>
      )}

      {/* Native Accessible Submission Inspector Dialog */}
      <dialog
        ref={dialogRef}
        aria-labelledby="attempt-inspector-title"
        onClose={handleDialogClose}
        {...({ closedby: "any" } as Record<string, string>)}
        className="m-auto w-[min(94vw,48rem)] max-h-[88dvh] overflow-hidden rounded-3xl border border-teal-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-xs open:flex open:flex-col"
      >
        {inspectedAttempt && (
          <>
            {/* Dialog Header */}
            <div className="flex items-start justify-between gap-4 border-b border-teal-100 bg-teal-50/50 px-6 py-5">
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-teal-800">
                  Submission Inspector
                </p>
                <h1
                  id="attempt-inspector-title"
                  className="mt-1 text-xl font-black text-slate-950 break-words"
                >
                  {inspectedAttempt.studentName}
                </h1>
                <p className="mt-0.5 text-xs text-slate-600 break-all">
                  {inspectedAttempt.studentContact} · Submitted{" "}
                  <time dateTime={inspectedAttempt.submittedAt}>
                    {inspectedAttempt.submittedAtFormatted}
                  </time>
                </p>
              </div>
              <button
                type="button"
                onClick={closeInspector}
                aria-label="Close submission inspector"
                autoFocus
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-teal-200 bg-white text-slate-600 transition hover:bg-teal-50 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Dialog Scrollable Body */}
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              {/* Mock Test Banner + Quick Filters */}
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-950 break-words">
                      {inspectedAttempt.primaryTitle}
                    </p>
                    {inspectedAttempt.testLabel && (
                      <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                        {inspectedAttempt.testLabel}
                      </span>
                    )}
                  </div>
                  {inspectedAttempt.breadcrumb.length > 0 && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {inspectedAttempt.breadcrumb.join(" · ")}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const q = inspectedAttempt.studentName;
                      closeInspector();
                      setSearchInput(q);
                      navigateWithFilters({ q, page: 1 });
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:border-teal-300 hover:text-teal-900"
                  >
                    Filter Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const testId = inspectedAttempt.mockTestId;
                      closeInspector();
                      setSelectedTestId(testId);
                      navigateWithFilters({ test: testId, page: 1 });
                    }}
                    className="rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-[11px] font-bold text-teal-900 hover:bg-teal-100"
                  >
                    Filter This Test
                  </button>
                </div>
              </div>

              {/* Metric Summary Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Score</p>
                  <p className="mt-1 text-lg font-black text-slate-950 tabular-nums">
                    {inspectedAttempt.score}/{inspectedAttempt.totalMarks}
                  </p>
                  <p className="text-xs font-bold text-teal-800 tabular-nums">{inspectedAttempt.scorePercent}%</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Accuracy</p>
                  <p className="mt-1 text-lg font-black text-slate-950 tabular-nums">
                    {inspectedAttempt.accuracyPercent === null ? "—" : `${inspectedAttempt.accuracyPercent}%`}
                  </p>
                  <p className="text-xs text-slate-500">Attempted</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Correct</p>
                  <p className="mt-1 text-lg font-black text-emerald-800 tabular-nums">
                    {inspectedAttempt.correctAnswers}
                  </p>
                  <p className="text-xs text-emerald-700">Questions</p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Incorrect</p>
                  <p className="mt-1 text-lg font-black text-rose-800 tabular-nums">
                    {inspectedAttempt.incorrectAnswers}
                  </p>
                  <p className="text-xs text-rose-700">Questions</p>
                </div>
                <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Skipped</p>
                  <p className="mt-1 text-lg font-black text-slate-800 tabular-nums">
                    {inspectedAttempt.unansweredQuestions}
                  </p>
                  <p className="text-xs text-slate-500">Unanswered</p>
                </div>
              </div>

              {/* Async Detail Content */}
              {inspectorLoading ? (
                <div className="space-y-3 py-4">
                  <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
                  <div className="h-20 w-full animate-pulse rounded-2xl bg-slate-100" />
                  <div className="h-24 w-full animate-pulse rounded-2xl bg-slate-100" />
                </div>
              ) : inspectorError ? (
                <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
                  {inspectorError}
                </div>
              ) : inspectorDetail ? (
                <>
                  {/* Candidate Recent History */}
                  {inspectorDetail.recentAttempts.length > 0 && (
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
                        Candidate&apos;s Recent Submissions ({inspectorDetail.recentAttempts.length})
                      </h2>
                      <div className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        {inspectorDetail.recentAttempts.map((hist) => {
                          const histPct =
                            hist.totalMarks > 0
                              ? Math.round((hist.score / hist.totalMarks) * 100)
                              : 0;
                          const isCurrent = hist.id === inspectedAttempt.id;
                          return (
                            <div
                              key={hist.id}
                              className={`flex items-center justify-between gap-3 px-4 py-2.5 text-xs ${
                                isCurrent ? "bg-teal-50/70" : ""
                              }`}
                            >
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 break-words">
                                  {hist.mockTestTitle}
                                </span>
                                {isCurrent && (
                                  <span className="ml-2 rounded-full bg-teal-700 px-2 py-0.5 text-[10px] font-bold text-white">
                                    Current
                                  </span>
                                )}
                              </div>
                              <div className="shrink-0 font-bold text-slate-700 tabular-nums">
                                {hist.score}/{hist.totalMarks} ({histPct}%)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Question-by-Question Response Breakdown */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
                        Question Breakdown
                      </h2>
                      {inspectorDetail.detailedReviewAvailable && inspectorDetail.questions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {(
                            [
                              ["all", "All"],
                              ["correct", "Correct"],
                              ["incorrect", "Incorrect"],
                              ["skipped", "Skipped"],
                            ] as const
                          ).map(([key, label]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setQuestionFilter(key)}
                              aria-pressed={questionFilter === key}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                                questionFilter === key
                                  ? "bg-teal-800 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {!inspectorDetail.detailedReviewAvailable ? (
                      <p className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                        Question-by-question review has expired under the retention window for this attempt.
                      </p>
                    ) : filteredInspectorQuestions.length === 0 ? (
                      <p className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                        No questions match the selected response filter.
                      </p>
                    ) : (
                      <div className="mt-2.5 space-y-2">
                        {filteredInspectorQuestions.map((q) => {
                          const statusBadge = !q.selectedAnswer
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : q.isCorrect
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-rose-50 text-rose-800 border-rose-200";
                          const statusText = !q.selectedAnswer
                            ? "Skipped"
                            : q.isCorrect
                              ? `Correct (+${q.marksAwarded})`
                              : `Wrong (${q.marksAwarded})`;

                          return (
                            <div
                              key={`${q.questionId}-${q.questionOrder}`}
                              className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="font-semibold text-slate-900 leading-relaxed">
                                  <span className="mr-1.5 font-black text-teal-800">Q{q.questionOrder}.</span>
                                  {q.questionText}
                                </p>
                                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusBadge}`}>
                                  {statusText}
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                                <span>
                                  Selected:{" "}
                                  <strong className="text-slate-800">
                                    {q.selectedAnswer ?? "None"}
                                  </strong>
                                </span>
                                <span>
                                  Correct Key:{" "}
                                  <strong className="text-emerald-700">{q.correctAnswer}</strong>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Dialog Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-teal-100 bg-slate-50/70 px-6 py-3.5">
              <button
                type="button"
                onClick={closeInspector}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
