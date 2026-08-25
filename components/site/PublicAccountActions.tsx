"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/admin/LogoutButton";
import { createClient } from "@/lib/supabase/client";

export function PublicAccountActions() {
  const [email, setEmail] = useState<string | null>(null);
  const [activePurchases, setActivePurchases] = useState(0);
  const [paidSalesEnabled, setPaidSalesEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    void supabase
      .from("site_settings")
      .select("enabled")
      .eq("key", "paid_sales")
      .maybeSingle()
      .then(({ data }) => {
        if (active) setPaidSalesEnabled(data?.enabled === true);
      });
    const loadAccount = async (userEmail: string | null, userId?: string) => {
      if (!active) return;
      setEmail(userEmail);
      if (!userId) {
        setActivePurchases(0);
        return;
      }
      const now = new Date().toISOString();
      const { count } = await supabase
        .from("student_entitlements")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .lte("starts_at", now)
        .gt("expires_at", now);
      if (active) setActivePurchases(count ?? 0);
    };
    void supabase.auth.getUser().then(({ data }) => {
      void loadAccount(data.user?.email ?? null, data.user?.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadAccount(session?.user.email ?? null, session?.user.id);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      {email ? (
        <>
          {paidSalesEnabled && (
            <Link
              href="/dashboard/passes"
              aria-label={`My purchases${activePurchases ? `, ${activePurchases} active` : ""}`}
              className="relative inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
                <path d="M6 8h12l-1 12H7L6 8Z" />
                <path d="M9 9V6a3 3 0 0 1 6 0v3" />
              </svg>
              <span className="hidden sm:inline">Purchases</span>
              {activePurchases > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-teal-600 px-1 text-[10px] font-black text-white">
                  {activePurchases}
                </span>
              )}
            </Link>
          )}
          <LogoutButton />
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="hidden rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="group/button inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl sm:py-2 sm:pl-4 sm:pr-2 sm:text-sm"
          >
            Start free
            <span className="hidden h-7 w-7 place-items-center rounded-lg bg-teal-300 text-slate-950 transition group-hover/button:translate-x-0.5 sm:grid" aria-hidden="true">→</span>
          </Link>
        </>
      )}
    </div>
  );
}
