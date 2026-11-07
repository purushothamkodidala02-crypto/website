"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LogoutButton from "@/components/admin/LogoutButton";
import { createClient } from "@/lib/supabase/client";

export function PublicAccountActions({ initialEmail, initialIsAdmin = false }: { initialEmail?: string | null; initialIsAdmin?: boolean }) {
  const [email, setEmail] = useState<string | null>(initialEmail ?? null);
  const [accountReady, setAccountReady] = useState(initialEmail !== undefined);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [activePurchases, setActivePurchases] = useState(0);
  const [paidSalesEnabled, setPaidSalesEnabled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const username = email ? email.split("@")[0] : "Student";
  const avatarLetter = (username || email || "U").charAt(0).toUpperCase();

  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
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
              className="relative inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 sm:px-3 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-700 transition hover:border-teal-300 hover:text-teal-800"
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

          {!isAdmin && (
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                title={email}
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-label={`Account menu for ${username}`}
                className="group flex items-center gap-1.5 sm:gap-2 rounded-full sm:rounded-xl border border-slate-200/90 bg-white p-1 sm:px-2.5 sm:py-1.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs transition hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-950 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <span
                  className="grid h-7 w-7 sm:h-6 sm:w-6 shrink-0 place-items-center rounded-full bg-teal-800 text-[11px] font-bold text-white uppercase shadow-2xs group-hover:bg-teal-900"
                  aria-hidden="true"
                >
                  {avatarLetter}
                </span>
                <span className="hidden sm:inline-block max-w-[120px] md:max-w-[180px] lg:max-w-[220px] truncate text-slate-800">
                  {username}
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                    menuOpen ? "rotate-180 text-teal-700" : ""
                  }`}
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  aria-label="User account actions"
                  className="absolute right-0 top-full mt-2 w-64 sm:w-72 origin-top-right rounded-2xl border border-slate-200/90 bg-white shadow-xl ring-1 ring-slate-900/5 transition-all z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Account Header: Avatar + Username + Full Email (no sign-in badge) */}
                  <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 p-3.5">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-800 text-sm font-bold text-white uppercase shadow-xs"
                      aria-hidden="true"
                    >
                      {avatarLetter}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900" title={username}>
                        {username}
                      </p>
                      <p className="truncate text-xs font-medium text-slate-500" title={email}>
                        {email}
                      </p>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="p-1.5 space-y-0.5">
                    <Link
                      href="/dashboard"
                      prefetch={true}
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50/70 hover:text-teal-900 transition"
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-teal-700 fill-none stroke-current stroke-2">
                        <path d="M5 19V9m7 10V5m7 14v-7" strokeLinecap="round" />
                        <path d="M3.5 19.5h17" strokeLinecap="round" />
                      </svg>
                      <span>My Progress</span>
                    </Link>

                    {paidSalesEnabled && (
                      <Link
                        href="/dashboard/passes"
                        prefetch={true}
                        onClick={() => setMenuOpen(false)}
                        role="menuitem"
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50/70 hover:text-teal-900 transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-teal-700 fill-none stroke-current stroke-2">
                            <path d="M6 8h12l-1 12H7L6 8Z" />
                            <path d="M9 9V6a3 3 0 0 1 6 0v3" />
                          </svg>
                          <span>Purchases</span>
                        </div>
                        {activePurchases > 0 && (
                          <span className="grid h-4 min-w-4 place-items-center rounded-full bg-teal-600 px-1 text-[9px] font-black text-white">
                            {activePurchases}
                          </span>
                        )}
                      </Link>
                    )}

                    <Link
                      href="/dashboard/study-book"
                      prefetch={true}
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50/70 hover:text-teal-900 transition"
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-teal-700 fill-none stroke-current stroke-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <span>Study Book & Bookmarks</span>
                    </Link>
                  </div>

                  {/* Dropdown Logout Action */}
                  <div className="border-t border-slate-100 p-2 bg-slate-50/40">
                    <LogoutButton className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/60 py-2 text-xs font-bold text-slate-700 hover:text-rose-700 transition" />
                  </div>
                </div>
              )}
            </div>
          )}

          <LogoutButton className="hidden sm:inline-flex rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs hover:border-teal-300 hover:bg-teal-50 hover:text-teal-950 disabled:opacity-50" />
        </>
      ) : (
        <>
          <Link
            href="/login"
            prefetch={true}
            className="hidden rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
          >
            Login
          </Link>
          <Link
            href="/register"
            prefetch={true}
            className="group/button inline-flex items-center gap-2 rounded-xl bg-[#0a2922] px-3 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-950/15 transition hover:-translate-y-0.5 hover:bg-[#11382f] hover:shadow-xl sm:py-2 sm:pl-4 sm:pr-2 sm:text-sm"
          >
            Create account
            <span className="hidden h-7 w-7 place-items-center rounded-lg bg-[#ea580c] text-white transition group-hover/button:translate-x-0.5 sm:grid" aria-hidden="true">→</span>
          </Link>
        </>
      )}
    </div>
  );
}