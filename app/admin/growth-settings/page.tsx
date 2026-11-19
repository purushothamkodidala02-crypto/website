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
            Help Us Grow Pop-up Controls &amp; Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl">
            Configure targeting rules, completion milestones, and view student interaction analytics (who saw it, what buttons they clicked, and click counts).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/help-us-to-grow"
            target="_blank"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition"
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
