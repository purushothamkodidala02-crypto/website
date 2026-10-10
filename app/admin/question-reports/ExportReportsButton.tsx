"use client";

import { useState } from "react";

export type ExportReportRow = {
  id: string;
  createdAt: string;
  status: string;
  category: string;
  categoryLabel: string;
  subject: string;
  questionId: string;
  questionText: string;
  correctAnswer?: string | null;
  studentName: string;
  studentEmail?: string | null;
  studentDetails?: string | null;
  adminNotes?: string | null;
  resolvedAt?: string | null;
  resolvedByName?: string | null;
};

export function ExportReportsButton({ reports }: { reports: ExportReportRow[] }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (!reports.length) return;
    setIsExporting(true);

    try {
      const headers = [
        "Report ID",
        "Reported Date (IST)",
        "Status",
        "Category Code",
        "Problem Type",
        "Subject",
        "Question ID",
        "Question Text",
        "Official Key",
        "Student Name",
        "Student Email",
        "Student Feedback",
        "Admin Notes",
        "Resolved Date",
        "Resolved By",
      ];

      const csvRows = [
        headers.join(","),
        ...reports.map((row) => {
          const values = [
            row.id,
            row.createdAt,
            row.status,
            row.category,
            row.categoryLabel,
            row.subject,
            row.questionId,
            row.questionText,
            row.correctAnswer ?? "",
            row.studentName,
            row.studentEmail ?? "",
            row.studentDetails ?? "",
            row.adminNotes ?? "",
            row.resolvedAt ?? "",
            row.resolvedByName ?? "",
          ];

          return values
            .map((val) => {
              const str = String(val ?? "").replace(/"/g, '""');
              return `"${str}"`;
            })
            .join(",");
        }),
      ];

      const blob = new Blob(["\uFEFF" + csvRows.join("\r\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute("href", url);
      link.setAttribute("download", `question-reports-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting || reports.length === 0}
      title="Export visible reports to CSV"
      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs font-black text-slate-800 shadow-xs transition hover:border-teal-400 hover:bg-slate-50 hover:text-teal-900 disabled:cursor-not-allowed disabled:opacity-50 text-center whitespace-nowrap"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-teal-700 shrink-0"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      <span>{isExporting ? "Exporting…" : "Export CSV"}</span>
    </button>
  );
}
