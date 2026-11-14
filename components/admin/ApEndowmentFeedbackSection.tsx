"use client";

import { useEffect, useState } from "react";
import {
  getApEndowmentFeedbackSummaryAction,
  type ApEndowmentFeedbackSummary,
  AP_EO_CAMPAIGN_EXPIRY_MS,
} from "@/app/actions/ap-endowment-feedback";

export function ApEndowmentFeedbackSection() {
  const [data, setData] = useState<ApEndowmentFeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    setIsExpired(Date.now() > AP_EO_CAMPAIGN_EXPIRY_MS);
    let ignore = false;
    void getApEndowmentFeedbackSummaryAction().then((res) => {
      if (!ignore) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

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
    <section className="overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-200/90 bg-white shadow-sm">
      <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/90 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`flex h-2.5 w-2.5 rounded-full ${isExpired ? "bg-slate-400" : "bg-amber-500 animate-pulse"}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                {isExpired ? "Campaign Expired" : "Targeted 1-Week Campaign (Live)"}
              </span>
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-black text-slate-900">
              AP Endowment Officer — Subject Priority Responses
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-600">
              Targeted exclusively to students who attempt AP Endowment Officer mock tests. Asks which Paper and Subjects they want prioritized.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={loading || !data || data.totalResponses === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-40 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition"
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="rounded-xl border border-amber-200/80 bg-white p-3 text-center shadow-2xs">
            <strong className="block text-xl sm:text-2xl font-black text-slate-900">
              {loading ? "…" : data?.totalResponses ?? 0}
            </strong>
            <span className="mt-0.5 block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Responses
            </span>
          </div>

          <div className="rounded-xl border border-teal-200/80 bg-white p-3 text-center shadow-2xs">
            <strong className="block text-xl sm:text-2xl font-black text-teal-700">
              {loading ? "…" : data?.paper1Count ?? 0}
            </strong>
            <span className="mt-0.5 block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Paper 1 Focus
            </span>
          </div>

          <div className="rounded-xl border border-indigo-200/80 bg-white p-3 text-center shadow-2xs">
            <strong className="block text-xl sm:text-2xl font-black text-indigo-700">
              {loading ? "…" : data?.paper2Count ?? 0}
            </strong>
            <span className="mt-0.5 block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Paper 2 Focus
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-2xs">
            <strong className="block text-xl sm:text-2xl font-black text-slate-700">
              {loading ? "…" : data?.bothCount ?? 0}
            </strong>
            <span className="mt-0.5 block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Both Papers
            </span>
          </div>
        </div>
      </div>

      {/* Responses Table */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <p className="py-8 text-center text-xs sm:text-sm font-semibold text-slate-500">
            Loading student responses…
          </p>
        ) : !data || data.recentResponses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center">
            <p className="text-sm font-bold text-slate-700">No responses collected yet</p>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              When students who have attempted AP Endowment Officer mock tests visit the site, they will see the form. Their priorities will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-3">Date</th>
                  <th className="pb-3 pr-3">Student</th>
                  <th className="pb-3 pr-3">Paper Choice</th>
                  <th className="pb-3 pr-3">Priority Subject Focus</th>
                  <th className="pb-3">Notes / Specific Topics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentResponses.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 pr-3 whitespace-nowrap text-xs text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 pr-3">
                      <span className="block font-bold text-slate-900">{r.studentName}</span>
                      <span className="block text-xs text-slate-500">{r.studentEmail}</span>
                    </td>
                    <td className="py-3 pr-3 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          r.paperChoice.includes("Paper 1")
                            ? "bg-teal-50 text-teal-800 border border-teal-200"
                            : r.paperChoice.includes("Paper 2")
                            ? "bg-indigo-50 text-indigo-800 border border-indigo-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {r.paperChoice.includes("Paper 1")
                          ? "Paper 1"
                          : r.paperChoice.includes("Paper 2")
                          ? "Paper 2"
                          : "Both Papers"}
                      </span>
                    </td>
                    <td className="py-3 pr-3 font-semibold text-slate-900 break-words">
                      {r.subjectFocus}
                    </td>
                    <td className="py-3 text-xs text-slate-600 break-words">
                      {r.specificTopics || <span className="text-slate-400 italic">None</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
