"use client";

import { useState } from "react";
import Link from "next/link";
import type { GrowthPopupSettings } from "@/lib/growth-settings";
import type { GrowthInteractionRecord } from "./actions";
import { GrowthSettingsForm } from "./GrowthSettingsForm";
import { GrowthAnalyticsTab } from "@/components/admin/growth/GrowthAnalyticsTab";

type Props = {
  initialSettings: GrowthPopupSettings;
  interactions: GrowthInteractionRecord[];
};

export function AdminGrowthWorkspace({ initialSettings, interactions }: Props) {
  const [activeTab, setActiveTab] = useState<"settings" | "analytics">("settings");

  return (
    <div className="space-y-6">
      {/* Navigation Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-1">
        <div role="tablist" aria-label="Growth pop-up sections" className="admin-tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
              activeTab === "settings"
                ? "border-[#0055a2] text-[#0f2942]"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Pop-up Settings &amp; Preview
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "analytics"}
            onClick={() => setActiveTab("analytics")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
              activeTab === "analytics"
                ? "border-[#0055a2] text-[#0f2942]"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>{"Student Interactions & Clicks"}</span>
            <span
              className={`admin-stat rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                activeTab === "analytics"
                  ? "bg-[#0055a2]/10 text-[#0055a2]"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {interactions.length}
            </span>
          </button>
        </div>

        <Link
          href="/admin/surveys"
          prefetch={false}
          className="mb-1.5 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
        >
          <span>Survey Forms &amp; Targeting Rules &rarr;</span>
        </Link>
      </div>

      {/* Tab 1: Pop-up Controls */}
      {activeTab === "settings" && (
        <GrowthSettingsForm initialSettings={initialSettings} />
      )}

      {/* Tab 2: Candidate Interactions & Clicks */}
      {activeTab === "analytics" && (
        <GrowthAnalyticsTab interactions={interactions} />
      )}
    </div>
  );
}
