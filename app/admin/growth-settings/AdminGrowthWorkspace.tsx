"use client";

import { useState } from "react";
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
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === "settings"
              ? "bg-[#0f2942] text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>⚙️ Pop-up Settings &amp; Preview</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "analytics"}
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === "analytics"
              ? "bg-[#0f2942] text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>📊 {"Student Interactions & Clicks"}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
              activeTab === "analytics"
                ? "bg-white/20 text-white"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {interactions.length}
          </span>
        </button>
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
