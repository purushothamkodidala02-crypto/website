import type { Metadata } from "next";
import Link from "next/link";
import { getGrowthSettings } from "@/lib/growth-settings";
import { getGrowthInteractions } from "./actions";
import { AdminGrowthWorkspace } from "./AdminGrowthWorkspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  description:
    "Control candidate support pop-up settings, mock test completion threshold, frequency rules, cooldown days, and copy.",
};

export default async function AdminGrowthSettingsPage() {
  const [settings, interactions] = await Promise.all([
    getGrowthSettings(),
    getGrowthInteractions(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200/80 pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0055a2]">
            Growth &amp; Sustainability Operations
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
            Help Us Grow Pop-up Controls &amp; Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Configure targeting milestones, preview student pop-up prompts, and review button click analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/help-us-to-grow"
            target="_blank"
            prefetch={false}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition"
          >
            View Live Public Page ↗
          </Link>
        </div>
      </div>

      <AdminGrowthWorkspace
        initialSettings={settings}
        interactions={interactions}
      />
    </div>
  );
}
