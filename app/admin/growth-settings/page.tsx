import type { Metadata } from "next";
import Link from "next/link";
import { getGrowthSettings } from "@/lib/growth-settings";
import { getGrowthInteractions } from "./actions";
import { AdminGrowthWorkspace } from "./AdminGrowthWorkspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Help Us Grow Pop-up Settings | Admin Workspace | Varadhi Prep",
  description:
    "Control candidate support pop-up settings, mock test completion threshold, frequency rules, cooldown days, and copy.",
};

export default async function AdminGrowthSettingsPage() {
  const [settings, interactions] = await Promise.all([
    getGrowthSettings(),
    getGrowthInteractions(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0055a2]" />
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0055a2]">
              Growth & Sustainability Operations
            </p>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Growth &amp; Feedback Settings
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl">
            Configure Stage 1 Post-Test Survey Form (1–4 mock tests), Stage 2 Voluntary Support Pop-up (5+ mock tests), and view candidate feedback &amp; click analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/surveys"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-slate-800 transition"
          >
            Unified Pop-ups Engine &rarr;
          </Link>
          <Link
            href="/help-us-to-grow"
            target="_blank"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition"
          >
            View Live Public Page ↗
          </Link>
        </div>
      </div>

      {/* Unified Engine Notice Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/80 via-emerald-50/50 to-amber-50/40 p-4 sm:p-5 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white text-lg shadow-xs">
            ✨
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Growth and Survey Forms Are Now Combined
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              You can now dynamically create any future growth pop-up, student survey, or announcement with visual app icons, page routing, and candidate criteria in the unified <strong>Pop-ups &amp; Surveys Engine</strong>.
            </p>
          </div>
        </div>
        <Link
          href="/admin/surveys"
          className="inline-flex items-center justify-center rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition active:scale-95 shrink-0 whitespace-nowrap shadow-xs"
        >
          Open Unified Builder &rarr;
        </Link>
      </div>

      <AdminGrowthWorkspace
        initialSettings={settings}
        interactions={interactions}
      />
    </div>
  );
}
