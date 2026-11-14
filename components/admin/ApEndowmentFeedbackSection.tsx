"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  getApEndowmentFeedbackSummaryAction,
  deleteApEndowmentFeedbackAction,
  type ApEndowmentFeedbackSummary,
} from "@/app/actions/ap-endowment-feedback";
import { AP_EO_CAMPAIGN_EXPIRY_MS } from "@/lib/campaigns/ap-endowment";

export function ApEndowmentFeedbackSection({ surveyIndex = 1 }: { surveyIndex?: number } = {}) {
  const [data, setData] = useState<ApEndowmentFeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showResponses, setShowResponses] = useState(false);

  const fetchFeedbackSafely = useCallback(async (): Promise<ApEndowmentFeedbackSummary> => {
    const emptySummary: ApEndowmentFeedbackSummary = {
      totalResponses: 0,
      paper1Count: 0,
      paper2Count: 0,
      bothCount: 0,
      recentResponses: [],
    };

    // Strategy 1: Server Action
    try {
      const res = await getApEndowmentFeedbackSummaryAction();
      if (res && res.totalResponses !== undefined) {
        return res;
      }
    } catch (err) {
      console.warn("Server action getApEndowmentFeedbackSummaryAction failed:", err);
    }

    // Strategy 2: Dedicated HTTP GET API route
    try {
      const apiRes = await fetch("/api/admin/feedback", { cache: "no-store" });
      if (apiRes.ok) {
        const apiJson = await apiRes.json();
        if (apiJson && apiJson.totalResponses !== undefined) {
          return apiJson;
        }
      }
    } catch (err) {
      console.warn("API /api/admin/feedback failed:", err);
    }

    return emptySummary;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchFeedbackSafely();
      setData(res);
    } catch {
      setData({
        totalResponses: 0,
        paper1Count: 0,
        paper2Count: 0,
        bothCount: 0,
        recentResponses: [],
      });
    } finally {
      setLoading(false);
    }
  }, [fetchFeedbackSafely]);

  useEffect(() => {
    setIsExpired(Date.now() > AP_EO_CAMPAIGN_EXPIRY_MS);
    let ignore = false;
    void (async () => {
      try {
        const res = await fetchFeedbackSafely();
        if (!ignore) {
          setData(res);
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setData({
            totalResponses: 0,
            paper1Count: 0,
            paper2Count: 0,
            bothCount: 0,
            recentResponses: [],
          });
          setLoading(false);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [fetchFeedbackSafely]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student feedback response?")) {
      return;
    }
    setDeletingId(id);
    await deleteApEndowmentFeedbackAction(id);
    await loadData();
    setDeletingId(null);
  };

  const filteredResponses = useMemo(() => {
    if (!data?.recentResponses) return [];
    if (!searchTerm.trim()) return data.recentResponses;
    const term = searchTerm.toLowerCase().trim();
    return data.recentResponses.filter((r) =>
      r.studentName.toLowerCase().includes(term) ||
      r.studentEmail.toLowerCase().includes(term) ||
      (r.studentPhone && r.studentPhone.toLowerCase().includes(term)) ||
      r.paperChoice.toLowerCase().includes(term) ||
      r.subjectFocus.toLowerCase().includes(term) ||
      (r.specificTopics && r.specificTopics.toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

  const handleExportCSV = () => {
    if (!data || data.recentResponses.length === 0) return;

    const headers = [
      "Submitted At",
      "Student Name",
      "Email",
      "Phone",
      "Paper Choice",
      "Subject Focus Priority",
      "Specific Topics / Notes",
    ];

    const escapeCSV = (val: string | null | undefined) => {
      if (val === null || val === undefined) return '""';
      const clean = String(val).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = data.recentResponses.map((r) => [
      escapeCSV(new Date(r.createdAt).toLocaleString()),
      escapeCSV(r.studentName),
      escapeCSV(r.studentEmail),
      escapeCSV(r.studentPhone || ""),
      escapeCSV(r.paperChoice),
      escapeCSV(r.subjectFocus),
      escapeCSV(r.specificTopics || ""),
    ]);

    const csvContent = [headers.map(escapeCSV).join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ap_endowment_officer_subject_priorities_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-6 shadow-2xs hover:border-slate-300 transition">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-slate-200 text-slate-800 border border-slate-300 px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
              Survey {surveyIndex}
            </span>
            <span className="inline-flex items-center rounded-md bg-white text-slate-700 border border-slate-200 px-2 py-0.5 text-xs font-medium">
              {isExpired ? "Campaign Expired" : "Targeted Campaign"}
            </span>
            <span className="inline-flex items-center rounded-md bg-white text-slate-600 border border-slate-200 px-2 py-0.5 text-xs font-medium">
              {loading ? "…" : data?.totalResponses ?? 0}{" "}
              {(data?.totalResponses ?? 0) === 1 ? "response" : "responses"}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 sm:text-xl break-words">
              AP Endowment Officer — Subject Priority Responses
            </h3>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-600 break-words">
              Targeted exclusively to students who attempt AP Endowment Officer mock tests. Asks which Paper and Subjects they want prioritized.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Targeted 1-Week Campaign</span>
            <span>|</span>
            <span>Priority Feedback</span>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto shrink-0 sm:self-center">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition active:scale-95 touch-manipulation"
          >
            {loading ? "…" : "↻ Refresh"}
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={loading || !data || data.totalResponses === 0}
            className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition active:scale-95 touch-manipulation"
          >
            📥 Export CSV
          </button>
          <button
            type="button"
            onClick={() => setShowResponses((prev) => !prev)}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition active:scale-95 touch-manipulation text-center"
          >
            {showResponses ? "Hide Responses" : `View Responses (${data?.totalResponses ?? 0})`}
          </button>
        </div>
      </div>

      {/* Quick Stats Grid - Light cement boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-2xs">
          <strong className="block text-xl sm:text-2xl font-bold text-slate-800">
            {loading ? "…" : data?.totalResponses ?? 0}
          </strong>
          <span className="mt-0.5 block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-500">
            Total Responses
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-2xs">
          <strong className="block text-xl sm:text-2xl font-bold text-slate-800">
            {loading ? "…" : data?.paper1Count ?? 0}
          </strong>
          <span className="mt-0.5 block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-500">
            Paper 1 Focus
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-2xs">
          <strong className="block text-xl sm:text-2xl font-bold text-slate-800">
            {loading ? "…" : data?.paper2Count ?? 0}
          </strong>
          <span className="mt-0.5 block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-500">
            Paper 2 Focus
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-2xs">
          <strong className="block text-xl sm:text-2xl font-bold text-slate-800">
            {loading ? "…" : data?.bothCount ?? 0}
          </strong>
          <span className="mt-0.5 block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-500">
            Both Papers
          </span>
        </div>
      </div>

      {/* Responses Table & Search */}
      {showResponses && (
        <div className="border-t border-slate-200 pt-4 space-y-4">
          {data && data.recentResponses.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by student, email, phone, topic…"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 pl-9 text-xs sm:text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <span className="text-xs text-slate-500">
                Showing {filteredResponses.length} of {data.recentResponses.length} responses
              </span>
            </div>
          )}

          {loading ? (
            <p className="py-8 text-center text-xs sm:text-sm font-semibold text-slate-500">
              Loading student responses…
            </p>
          ) : !data || data.recentResponses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white py-8 text-center">
              <p className="text-sm font-semibold text-slate-700">No responses collected yet</p>
              <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                When students who have attempted AP Endowment Officer mock tests visit the site, they will see the form. Their priorities will appear here.
              </p>
            </div>
          ) : filteredResponses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white py-8 text-center text-xs sm:text-sm text-slate-500">
              No responses matching &ldquo;{searchTerm}&rdquo;
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Paper Choice</th>
                    <th className="py-2.5 px-3">Priority Subject Focus</th>
                    <th className="py-2.5 px-3">Notes / Specific Topics</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResponses.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 whitespace-nowrap text-xs text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <span className="block font-semibold text-slate-900">{r.studentName}</span>
                        <span className="block text-xs text-slate-500">{r.studentEmail}</span>
                        {r.studentPhone && (
                          <span className="inline-block mt-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                            📱 {r.studentPhone.startsWith("+") ? r.studentPhone : `+91 ${r.studentPhone}`}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-block rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {r.paperChoice.includes("Paper 1")
                            ? "Paper 1"
                            : r.paperChoice.includes("Paper 2")
                            ? "Paper 2"
                            : "Both Papers"}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900 break-words">
                        {r.subjectFocus}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-600 break-words">
                        {r.specificTopics || <span className="text-slate-400 italic">None</span>}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 transition"
                          title="Delete feedback response"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
