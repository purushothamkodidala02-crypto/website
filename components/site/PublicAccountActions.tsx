"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/admin/LogoutButton";
import { createClient } from "@/lib/supabase/client";

export function PublicAccountActions() {
  const [email, setEmail] = useState<string | null>(null);
  const [accountReady, setAccountReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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
      setAccountReady(true);
      if (!userId) {
        setActivePurchases(0);
        setIsAdmin(false);
        return;
      }
      const now = new Date().toISOString();
      const [{ count }, { data: profile }] = await Promise.all([
        supabase
          .from("student_entitlements")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .lte("starts_at", now)
          .gt("expires_at", now),
        supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
      ]);
      if (active) {
        setActivePurchases(count ?? 0);
        setIsAdmin(profile?.role === "admin");
      }
    };
    void supabase.auth.getSession().then(({ data }) => {
      void loadAccount(data.session?.user.email ?? null, data.session?.user.id);
    }).catch(() => {
      if (active) setAccountReady(true);
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
      {!accountReady ? (
        <div
          role="status"
          aria-label="Loading account options"
          className="h-10 w-24 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none sm:w-40"
        />
      ) : email ? (
        <>
          {isAdmin && (
            <Link
              href="/admin"
              aria-label="Return to admin workspace"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm font-bold text-white transition hover:border-teal-700 hover:bg-teal-800"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
                <path d="M4 20V8l8-4 8 4v12" />
                <path d="M8 20v-6h8v6M9 9h.01M15 9h.01" />
              </svg>
              <span className="hidden sm:inline">Admin workspace</span>
            </Link>
          )}
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
            Create account
            <span className="hidden h-7 w-7 place-items-center rounded-lg bg-teal-300 text-slate-950 transition group-hover/button:translate-x-0.5 sm:grid" aria-hidden="true">→</span>
          </Link>
        </>
      )}
    </div>
  );
}
