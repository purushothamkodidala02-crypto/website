"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/admin/LogoutButton";
import { resolveStudentDisplayInfo } from "@/lib/student-name";
import { createClient } from "@/lib/supabase/client";

// Module-level in-memory cache to prevent redundant DB calls across client route transitions
let cachedPaidSales: boolean | null = null;
let lastPaidSalesFetchTime = 0;

let cachedAccount: {
  userId: string;
  email: string | null;
  displayName: string;
  activePurchases: number;
  isAdmin: boolean;
  timestamp: number;
} | null = null;

export function PublicAccountActions({
  initialEmail,
  initialIsAdmin = false,
  initialDisplayName,
}: {
  initialEmail?: string | null;
  initialIsAdmin?: boolean;
  initialDisplayName?: string;
} = {}) {
  const [email, setEmail] = useState<string | null>(initialEmail ?? cachedAccount?.email ?? null);
  const [accountReady, setAccountReady] = useState(initialEmail !== undefined || cachedAccount !== null);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin || (cachedAccount?.isAdmin ?? false));
  const [activePurchases, setActivePurchases] = useState(cachedAccount?.activePurchases ?? 0);
  const [paidSalesEnabled, setPaidSalesEnabled] = useState(cachedPaidSales ?? false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    // 1. Paid sales settings cache (60s TTL)
    const now = Date.now();
    if (cachedPaidSales === null || now - lastPaidSalesFetchTime >= 60000) {
      void supabase
        .from("site_settings")
        .select("enabled")
        .eq("key", "paid_sales")
        .maybeSingle()
        .then(({ data }) => {
          if (!active) return;
          const enabled = data?.enabled === true;
          cachedPaidSales = enabled;
          lastPaidSalesFetchTime = Date.now();
          setPaidSalesEnabled(enabled);
        });
    }

    const loadAccount = async (
      userEmail: string | null,
      userId?: string,
      userMetadata?: Record<string, unknown>,
    ) => {
      if (!active) return;
      const identity = resolveStudentDisplayInfo({
        fullName: userMetadata?.full_name ?? initialDisplayName,
        name: userMetadata?.name,
        email: userEmail,
      });

      setEmail(userEmail);
      setAccountReady(true);

      if (!userId) {
        cachedAccount = null;
        setActivePurchases(0);
        setIsAdmin(false);
        return;
      }

      // Check cache (30s TTL) to prevent hammering Supabase on every navigation
      const currentTime = Date.now();
      if (
        cachedAccount &&
        cachedAccount.userId === userId &&
        currentTime - cachedAccount.timestamp < 30000
      ) {
        setActivePurchases(cachedAccount.activePurchases);
        setIsAdmin(cachedAccount.isAdmin);
        return;
      }

      const nowIso = new Date().toISOString();
      const [{ count }, { data: profile }] = await Promise.all([
        supabase
          .from("student_entitlements")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .lte("starts_at", nowIso)
          .gt("expires_at", nowIso),
        supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
      ]);

      if (active) {
        const purchases = count ?? 0;
        const adminRole = profile?.role === "admin";
        cachedAccount = {
          userId,
          email: userEmail,
          displayName: identity.displayName,
          activePurchases: purchases,
          isAdmin: adminRole,
          timestamp: Date.now(),
        };
        setActivePurchases(purchases);
        setIsAdmin(adminRole);
      }
    };

    let lastLoadedId: string | undefined = cachedAccount?.userId;

    void supabase.auth.getSession()
      .then(({ data }) => {
        if (!active) return;
        lastLoadedId = data.session?.user.id;
        void loadAccount(
          data.session?.user.email ?? null,
          data.session?.user.id,
          data.session?.user.user_metadata,
        );
      })
      .catch(() => {
        if (active) setAccountReady(true);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      // Skip redundant duplicate fetch on initial session mount
      if (event === "INITIAL_SESSION" && session?.user.id === lastLoadedId) {
        return;
      }
      lastLoadedId = session?.user.id;
      void loadAccount(
        session?.user.email ?? null,
        session?.user.id,
        session?.user.user_metadata,
      );
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [initialDisplayName]);

  return (
    <div className="flex min-w-0 shrink items-center gap-1.5 sm:gap-2">
      {!accountReady ? (
        <div
          role="status"
          aria-label="Loading account options"
          className="h-9 w-20 sm:h-10 sm:w-40 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none"
        />
      ) : email ? (
        <>
          {paidSalesEnabled && (
            <Link
              href="/dashboard/passes"
              prefetch={true}
              aria-label={`My purchases${activePurchases ? `, ${activePurchases} active` : ""}`}
              className="relative inline-flex h-9 sm:h-10 min-h-[38px] sm:min-h-[40px] shrink-0 items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 text-xs sm:text-sm font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
                <path d="M6 8h12l-1 12H7L6 8Z" />
                <path d="M9 9V6a3 3 0 0 1 6 0v3" />
              </svg>
              <span className="hidden md:inline">Purchases</span>
              {activePurchases > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-teal-600 px-1 text-[10px] font-black text-white">
                  {activePurchases}
                </span>
              )}
            </Link>
          )}
          {!isAdmin && (
            <Link
              href="/dashboard"
              prefetch={true}
              title={email}
              aria-label="My progress dashboard"
              className="inline-flex h-9 sm:h-10 min-h-[38px] sm:min-h-[40px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-teal-200/90 bg-teal-50/80 px-2.5 sm:px-3.5 text-xs sm:text-sm font-bold text-teal-900 shadow-2xs transition hover:border-teal-300 hover:bg-teal-100 hover:text-teal-950"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 fill-none stroke-current"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                />
              </svg>
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          )}
          <LogoutButton allowMultipleDevices={isAdmin} />
        </>
      ) : (
        <>
          <Link
            href="/login"
            prefetch={true}
            className="hidden h-10 shrink-0 items-center whitespace-nowrap rounded-xl px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
          >
            Login
          </Link>
          <Link
            href="/register"
            prefetch={true}
            className="group/button inline-flex h-9 sm:h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-[#0a2922] px-3 text-xs font-semibold text-white shadow-lg shadow-emerald-950/15 transition hover:-translate-y-0.5 hover:bg-[#11382f] hover:shadow-xl sm:pl-4 sm:pr-2 sm:text-sm"
          >
            Create account
            <span className="hidden h-7 w-7 place-items-center rounded-lg bg-[#ea580c] text-white transition group-hover/button:translate-x-0.5 sm:grid" aria-hidden="true">→</span>
          </Link>
        </>
      )}
    </div>
  );
}
