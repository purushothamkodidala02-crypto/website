"use client";

import { useMemo, useState } from "react";
import type { GrowthInteractionRecord } from "@/app/admin/growth-settings/actions";

type Props = {
  interactions: GrowthInteractionRecord[];
};

const istFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export function GrowthAnalyticsTab({ interactions }: Props) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "view" | "click_support" | "select_tier" | "dismiss_or_close">("all");

  // 1. KPI Calculations
  const metrics = useMemo(() => {
    let views = 0;
    let supportClicks = 0;
    let tierClicks = 0;
    let dismissals = 0;
    let triggerClicks = 0;
    const uniqueStudents = new Set<string>();

    for (const record of interactions) {
      const studentKey = record.student_email || record.user_id || record.student_name || "guest";
      uniqueStudents.add(studentKey);

      if (record.event_type === "view") views++;
      else if (record.event_type === "click_support") supportClicks++;
      else if (record.event_type === "select_tier") tierClicks++;
      else if (record.event_type === "dismiss" || record.event_type === "close") dismissals++;
      else if (record.event_type === "trigger") triggerClicks++;
    }

    const totalClicks = supportClicks + tierClicks + dismissals + triggerClicks;

    return {
      totalInteractions: interactions.length,
      views,
      uniqueStudentsCount: uniqueStudents.size,
      totalClicks,
      supportClicks,
      tierClicks,
      dismissals,
      triggerClicks,
    };
  }, [interactions]);

  // 2. Button Click Count Aggregation ("count of he clicked button")
  const buttonCounts = useMemo(() => {
    const counts = new Map<string, { count: number; uniqueUsers: Set<string>; type: string }>();

    for (const record of interactions) {
      if (record.event_type === "view") continue; // only count button clicks

      const label = record.button_label || "Unknown Button";
      const userKey = record.student_email || record.user_id || record.student_name || "guest";

      if (!counts.has(label)) {
        counts.set(label, { count: 0, uniqueUsers: new Set(), type: record.event_type });
      }

      const entry = counts.get(label)!;
      entry.count++;
      entry.uniqueUsers.add(userKey);
    }

    return Array.from(counts.entries())
      .map(([label, data]) => ({
        label,
        count: data.count,
        uniqueStudents: data.uniqueUsers.size,
        type: data.type,
      }))
      .sort((a, b) => b.count - a.count);
  }, [interactions]);

  // 3. Student-level Aggregation ("which student seen it and what he clicked")
  const studentProfiles = useMemo(() => {
    const map = new Map<string, {
      key: string;
      studentName: string;
      studentEmail: string | null;
      seenCount: number;
      clickCount: number;
      clicks: { label: string; eventType: string; amount: number | null; createdAt: string; pagePath: string | null }[];
      lastSeenAt: string;
    }>();

    for (const record of interactions) {
      const studentKey = record.student_email || record.user_id || record.student_name || "guest";
      const displayName = record.student_name || (record.student_email ? record.student_email.split("@")[0] : "Guest Aspirant");

      if (!map.has(studentKey)) {
        map.set(studentKey, {
          key: studentKey,
          studentName: displayName,
          studentEmail: record.student_email || null,
          seenCount: 0,
          clickCount: 0,
          clicks: [],
          lastSeenAt: record.created_at,
        });
      }

      const profile = map.get(studentKey)!;

      if (record.event_type === "view") {
        profile.seenCount++;
      } else {
        profile.clickCount++;
        profile.clicks.push({
          label: record.button_label,
          eventType: record.event_type,
          amount: record.amount,
          createdAt: record.created_at,
          pagePath: record.page_path,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());
  }, [interactions]);

  // 4. Filtered Raw Log Records
  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();

    return interactions.filter((rec) => {
      // Type filter
      if (filterType === "view" && rec.event_type !== "view") return false;
      if (filterType === "click_support" && rec.event_type !== "click_support") return false;
      if (filterType === "select_tier" && rec.event_type !== "select_tier") return false;
      if (filterType === "dismiss_or_close" && rec.event_type !== "dismiss" && rec.event_type !== "close") return false;

      // Text search
      if (!q) return true;
      const name = (rec.student_name || "").toLowerCase();
      const email = (rec.student_email || "").toLowerCase();
      const label = (rec.button_label || "").toLowerCase();
      const path = (rec.page_path || "").toLowerCase();

      return name.includes(q) || email.includes(q) || label.includes(q) || path.includes(q);
    });
  }, [interactions, search, filterType]);

  // CSV Export
  const handleExportCsv = () => {
    const headers = ["Timestamp (IST)", "Student Name", "Student Email", "Event Type", "Button Clicked", "Amount (INR)", "Page Path"];
    const rows = filteredRecords.map((r) => [
      `"${istFormatter.format(new Date(r.created_at))}"`,
      `"${(r.student_name || "Guest").replace(/"/g, '""')}"`,
      `"${(r.student_email || "N/A").replace(/"/g, '""')}"`,
      `"${r.event_type}"`,
      `"${(r.button_label || "").replace(/"/g, '""')}"`,
      r.amount ? `"${r.amount}"` : '""',
      `"${r.page_path || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `growth-popup-student-clicks-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pop-up Impressions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pop-up Seen (Views)
            </span>
            <span className="text-base">👁️</span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
            {metrics.views}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Across {metrics.uniqueStudentsCount} unique candidate(s)
          </p>
        </div>

        {/* Total Button Clicks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Button Clicks
            </span>
            <span className="text-base">👆</span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-blue-900 tabular-nums">
            {metrics.totalClicks}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            All user button interactions
          </p>
        </div>

        {/* Support Initiated Clicks */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Support Clicks (CTA)
            </span>
            <span className="text-base">💚</span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-emerald-900 tabular-nums">
            {metrics.supportClicks}
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            Proceeded to contribution page
          </p>
        </div>

        {/* Dismissals / Closes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Dismissed / Closed
            </span>
            <span className="text-base">⏸️</span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-700 tabular-nums">
            {metrics.dismissals}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Clicked &ldquo;Maybe Later&rdquo; or ✕
          </p>
        </div>
      </div>

      {/* Button Click Count Summary Table ("count of he clicked button") */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            📊 Button Click Count Breakdown
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Aggregated count of every specific button clicked by students
          </p>
        </div>

        {buttonCounts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No button clicks logged yet. When candidates interact with the pop-up buttons, their click counts will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-5 py-3">Button Name / Action</th>
                  <th className="px-5 py-3 text-center">Type</th>
                  <th className="px-5 py-3 text-right">Click Count</th>
                  <th className="px-5 py-3 text-right">Unique Students</th>
                  <th className="px-5 py-3 text-right">% of Total Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {buttonCounts.map((btn) => {
                  const pct = metrics.totalClicks > 0 ? Math.round((btn.count / metrics.totalClicks) * 100) : 0;
                  return (
                    <tr key={btn.label} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {btn.label}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            btn.type === "click_support"
                              ? "bg-emerald-100 text-emerald-800"
                              : btn.type === "select_tier"
                              ? "bg-amber-100 text-amber-900"
                              : btn.type === "trigger"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {btn.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-slate-950 tabular-nums">
                        {btn.count}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-600 tabular-nums">
                        {btn.uniqueStudents}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-slate-500 tabular-nums">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Candidate-Level Interaction Log ("which student seen it what he clicked") */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              👥 {"Candidate Interaction & Click History"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Detailed breakdown of which students saw the pop-up and which buttons they clicked
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredRecords.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
            >
              📥 Export CSV ({filteredRecords.length})
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                filterType === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Events ({interactions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("view")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                filterType === "view" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              👁️ Seen Pop-up ({metrics.views})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("click_support")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                filterType === "click_support" ? "bg-emerald-800 text-white" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              💚 Support Clicks ({metrics.supportClicks})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("select_tier")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                filterType === "select_tier" ? "bg-amber-800 text-white" : "bg-amber-50 text-amber-900 hover:bg-amber-100"
              }`}
            >
              🔘 Tier Selected ({metrics.tierClicks})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("dismiss_or_close")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                filterType === "dismiss_or_close" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              ⏸️ Dismissed ({metrics.dismissals})
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or button..."
              className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0f2942] focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1.5 text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Detailed Interaction Table */}
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            {interactions.length === 0
              ? "No candidate interactions logged yet. Pop-up impressions and button clicks will appear here live."
              : "No records match your search filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-5 py-3">Candidate / Student</th>
                  <th className="px-5 py-3">Event Action</th>
                  <th className="px-5 py-3">Button Clicked</th>
                  <th className="px-5 py-3 text-center">Student Total Clicks</th>
                  <th className="px-5 py-3">Page</th>
                  <th className="px-5 py-3 text-right">Date &amp; Time (IST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRecords.map((item) => {
                  const studentKey = item.student_email || item.user_id || item.student_name || "guest";
                  const profile = studentProfiles.find((s) => s.key === studentKey);
                  const studentTotalClicks = profile?.clickCount ?? 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-black text-slate-700">
                            {(item.student_name?.[0] || "G").toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {item.student_name || "Guest Aspirant"}
                            </p>
                            {item.student_email ? (
                              <p className="text-[11px] text-slate-500">{item.student_email}</p>
                            ) : (
                              <p className="text-[10px] text-slate-400">Anonymous Visitor</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            item.event_type === "view"
                              ? "bg-slate-100 text-slate-700"
                              : item.event_type === "click_support"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.event_type === "select_tier"
                              ? "bg-amber-100 text-amber-900"
                              : item.event_type === "trigger"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {item.event_type === "view"
                            ? "Seen Pop-up"
                            : item.event_type === "click_support"
                            ? "Support Varadhi"
                            : item.event_type === "select_tier"
                            ? "Selected Tier"
                            : item.event_type === "trigger"
                            ? "Opened Pop-up"
                            : "Dismissed"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {item.button_label}
                        {item.amount && (
                          <span className="ml-1.5 rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[10px] text-emerald-800">
                            ₹{item.amount}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-block rounded-lg bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-black text-blue-900 tabular-nums">
                          {studentTotalClicks} click{studentTotalClicks === 1 ? "" : "s"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                        {item.page_path || "/"}
                      </td>

                      <td className="px-5 py-3.5 text-right text-slate-600 font-medium whitespace-nowrap tabular-nums">
                        {istFormatter.format(new Date(item.created_at))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
