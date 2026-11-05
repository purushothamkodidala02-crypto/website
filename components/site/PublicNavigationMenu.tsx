"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";

type NavigationIconName = "home" | "tests" | "support" | "progress" | "admin";

type NavigationItem = {
  href: string;
  label: string;
  icon: NavigationIconName;
};

const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function PublicNavigationMenu({ items }: { items: NavigationItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navigatingHref, setNavigatingHref] = useState<string | null>(null);

  useEffect(() => {
    setNavigatingHref(null);
  }, [pathname]);
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribeToClient, getClientSnapshot, getServerSnapshot);
  const [hasUser, setHasUser] = useState(false);
  const [hasAdminRole, setHasAdminRole] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const visibleItems = [
    ...items,
    ...(hasUser ? [{ href: "/dashboard", label: "My progress", icon: "progress" as const }] : []),
    ...(hasAdminRole ? [{ href: "/admin", label: "Admin workspace", icon: "admin" as const }] : []),
  ];

  const closeMenu = useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    const updateAccount = async (userId?: string) => {
      if (!active) return;
      setHasUser(Boolean(userId));
      if (!userId) {
        setHasAdminRole(false);
        return;
      }
      try {
        router.prefetch("/dashboard");
      } catch {}
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      if (active) setHasAdminRole(profile?.role === "admin");
    };
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user.id) {
        try {
          router.prefetch("/dashboard");
        } catch {}
      }
      void updateAccount(data.session?.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user.id) {
        try {
          router.prefetch("/dashboard");
        } catch {}
      }
      void updateAccount(session?.user.id);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeMenu, open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={() => {
          if (hasUser) {
            try { router.prefetch("/dashboard"); } catch {}
          }
        }}
        onTouchStart={() => {
          if (hasUser) {
            try { router.prefetch("/dashboard"); } catch {}
          }
        }}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Open navigation menu"
        className="grid h-9 w-9 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900"
      >
        <span className="space-y-1.5" aria-hidden="true">
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
        </span>
      </button>

      {mounted && createPortal(<div className={`fixed inset-0 z-[100] ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          className={`absolute inset-0 bg-[#0a2922]/50 backdrop-blur-[2px] transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          tabIndex={open ? 0 : -1}
        />
        <aside
          id={menuId}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          inert={!open}
          className={`absolute left-0 top-0 flex h-dvh w-[min(21rem,88vw)] flex-col border-r border-teal-100 bg-gradient-to-b from-white via-white to-teal-50/60 shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between border-b border-teal-100 px-5 py-4">
            <div>
              <p className="font-display text-lg text-slate-950">Varadhi <span className="text-teal-700">Prep</span></p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeMenu}
              aria-label="Close navigation menu"
              className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-xl font-semibold text-transparent before:content-['×'] before:text-slate-700 hover:bg-slate-200"
            >
              ×
            </button>
          </div>

          <nav className="font-brand flex-1 space-y-2 overflow-y-auto p-4" aria-label="Sidebar navigation">
            {visibleItems.map((item) => {
              const tone = navigationIconStyles[item.icon];
              const isCurrentPage = item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const iconClass = isCurrentPage ? "bg-white text-teal-800" : tone;
              const isNavigating = navigatingHref === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => {
                    setNavigatingHref(item.href);
                    setOpen(false);
                  }}
                  aria-current={isCurrentPage ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-black transition hover:translate-x-0.5 ${
                    isCurrentPage
                      ? "border-teal-600 bg-teal-700 text-white shadow-lg shadow-teal-900/15"
                      : "border-teal-100 bg-white/90 text-slate-950 hover:border-teal-200 hover:bg-teal-50"
                  }`}
                >
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${iconClass}`}>
                    <NavigationIcon name={item.icon} />
                  </span>
                  <span>{item.label}</span>
                  {isNavigating ? (
                    <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-teal-700">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </span>
                  ) : (
                    <span className="ml-auto text-lg opacity-50 transition group-hover:translate-x-0.5" aria-hidden="true">→</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-teal-100 bg-white/60 p-5 text-xs leading-5 text-slate-500">
            Need help? Email <a href="mailto:support@varadhiprep.in" className="font-bold text-teal-700">support@varadhiprep.in</a>
          </div>
        </aside>
      </div>, document.body)}
    </>
  );
}

const navigationIconStyles = {
  home: "border border-teal-100 bg-teal-50 text-teal-800",
  tests: "border border-teal-100 bg-teal-50 text-teal-800",
  progress: "border border-teal-100 bg-teal-50 text-teal-800",
  admin: "border border-teal-100 bg-teal-50 text-teal-800",
  support: "border border-teal-100 bg-teal-50 text-teal-800",
} as const;

function NavigationIcon({ name }: { name: NavigationIconName }) {
  if (name === "home") return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]"><path d="m4 10 8-6 8 6v9.5h-6v-6h-4v6H4z" strokeLinejoin="round" /></svg>;
  if (name === "tests") return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]"><path d="M7 3.5h8l3 3V20H7z" strokeLinejoin="round" /><path d="M15 3.5V7h3M9.5 11h6M9.5 14.5h6" strokeLinecap="round" /></svg>;
  if (name === "support") return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]"><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m5 7 7 5.5L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === "admin") return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]"><path d="M4 20V8l8-4 8 4v12" strokeLinejoin="round" /><path d="M8 20v-6h8v6M9 9h.01M15 9h.01" strokeLinecap="round" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]"><path d="M5 19V9m7 10V5m7 14v-7" strokeLinecap="round" /><path d="M3.5 19.5h17" strokeLinecap="round" /></svg>;
}
