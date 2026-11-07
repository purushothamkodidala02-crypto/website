"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function NavigationProgress() {
  const router = useRouter();
  const pathname = usePathname();
  const [navigation, setNavigation] = useState<{ sourceHref: string; id: number } | null>(null);
  const [visiblePending, setVisiblePending] = useState(false);
  const navigationId = useRef(0);
  const prefetchedUrls = useRef<Map<string, number>>(new Map());
  const pending = navigation !== null;

  // 150ms grace period before showing progress bar so fast/prefetched transitions don't flash
  useEffect(() => {
    if (!navigation) return;
    const timer = window.setTimeout(() => {
      setVisiblePending(true);
    }, 150);
    return () => {
      window.clearTimeout(timer);
      setVisiblePending(false);
    };
  }, [navigation]);

  // Background context-sensitive route warming during idle time and recurring keep-alive
  useEffect(() => {
    const prefetchRoutes = (routes: string[]) => {
      const currentPathAndQuery = window.location.pathname + window.location.search;
      for (const route of routes) {
        if (route === currentPathAndQuery) continue;
        const now = Date.now();
        const lastPrefetched = prefetchedUrls.current.get(route) ?? 0;
        // Refresh every 18 seconds to beat Next.js 30-second client cache expiration
        if (now - lastPrefetched > 18000) {
          prefetchedUrls.current.set(route, now);
          router.prefetch(route);
          try {
            (router as unknown as { prefetch: (href: string, opts?: { kind?: string }) => void }).prefetch(route, { kind: "full" });
          } catch {}
        }
      }
    };

    const runWarm = () => {
      if (pathname === "/dashboard") {
        prefetchRoutes([
          "/dashboard/study-book",
          "/dashboard/study-book?view=bookmarks",
          "/mock-tests",
          "/dashboard/passes",
        ]);
      } else if (pathname === "/dashboard/study-book") {
        const isBookmarks = typeof window !== "undefined" && window.location.search.includes("view=bookmarks");
        prefetchRoutes([
          isBookmarks ? "/dashboard/study-book" : "/dashboard/study-book?view=bookmarks",
          "/dashboard",
          "/mock-tests",
        ]);
      } else if (pathname.startsWith("/admin")) {
        prefetchRoutes([
          "/admin/mock-tests",
          "/admin/questions",
          "/admin/results",
          "/admin/access",
          "/admin/question-reports",
          "/admin/exams",
        ]);
      } else if (pathname === "/" || pathname === "/mock-tests") {
        prefetchRoutes(["/mock-tests", "/dashboard"]);
      }

      // On mobile & desktop: warm top 6 visible internal navigation links on the page during idle
      if (typeof document !== "undefined") {
        const pageLinks = document.querySelectorAll<HTMLAnchorElement>("a[href^='/']");
        let count = 0;
        for (const link of pageLinks) {
          if (count >= 6) break;
          const rawHref = link.getAttribute("href");
          if (!rawHref || rawHref.startsWith("/_") || rawHref.includes("?") || rawHref.endsWith("/questions-export")) continue;
          if (rawHref === window.location.pathname) continue;
          const now = Date.now();
          const lastPrefetched = prefetchedUrls.current.get(rawHref) ?? 0;
          if (now - lastPrefetched > 18000) {
            prefetchedUrls.current.set(rawHref, now);
            router.prefetch(rawHref);
            try {
              (router as unknown as { prefetch: (href: string, opts?: { kind?: string }) => void }).prefetch(rawHref, { kind: "full" });
            } catch {}
            count++;
          }
        }
      }
    };

    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;

    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        idleId = (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(runWarm, { timeout: 1500 });
      } else {
        timerId = setTimeout(runWarm, 250);
      }
    }

    // Keep dynamic routes warm every 60 seconds while student is active on page
    const intervalId = window.setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        runWarm();
      }
    }, 60000);

    return () => {
      if (idleId !== undefined && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      }
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
      window.clearInterval(intervalId);
    };
  }, [pathname, router]);

  useEffect(() => {
    function warmLink(event: Event) {
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(target instanceof HTMLAnchorElement) || target.target === "_blank" || target.hasAttribute("download")) return;
      const rawHref = target.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:") || rawHref.startsWith("javascript:")) return;
      try {
        const next = new URL(target.href, window.location.href);
        if (next.origin === window.location.origin) {
          if (next.pathname.endsWith("/questions-export")) return;
          const pathAndQuery = next.pathname + next.search;
          const currentPathAndQuery = window.location.pathname + window.location.search;
          if (pathAndQuery === currentPathAndQuery) return;

          const now = Date.now();
          const lastPrefetched = prefetchedUrls.current.get(pathAndQuery) ?? 0;
          if (now - lastPrefetched > 18000) {
            prefetchedUrls.current.set(pathAndQuery, now);
            router.prefetch(pathAndQuery);
            try {
              (router as unknown as { prefetch: (href: string, opts?: { kind?: string }) => void }).prefetch(pathAndQuery, { kind: "full" });
            } catch {}
          }
        }
      } catch {}
    }

    function startForLink(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(target instanceof HTMLAnchorElement) || target.target === "_blank" || target.hasAttribute("download")) return;
      const next = new URL(target.href, window.location.href);
      if (next.origin !== window.location.origin || next.href === window.location.href || (next.hash && next.pathname === window.location.pathname && next.search === window.location.search)) return;
      if (next.pathname.endsWith("/questions-export")) return;
      navigationId.current += 1;
      setNavigation({ sourceHref: window.location.href, id: navigationId.current });
    }

    function startForGetForm(event: SubmitEvent) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      const declaredMethod = form.getAttribute("method")?.toLowerCase();
      if (declaredMethod !== "get") return;
      const next = new URL(form.action || window.location.href, window.location.href);
      const values = new URLSearchParams();
      for (const [name, value] of new FormData(form)) {
        if (typeof value === "string") values.append(name, value);
      }
      if (event.submitter instanceof HTMLButtonElement && event.submitter.name) {
        values.append(event.submitter.name, event.submitter.value);
      }
      next.search = values.toString();
      if (next.href === window.location.href) return;
      navigationId.current += 1;
      setNavigation({ sourceHref: window.location.href, id: navigationId.current });
    }

    document.addEventListener("pointerover", warmLink, { passive: true, capture: true });
    document.addEventListener("pointerenter", warmLink, { passive: true, capture: true });
    document.addEventListener("touchstart", warmLink, { passive: true, capture: true });
    document.addEventListener("focusin", warmLink, { passive: true, capture: true });
    document.addEventListener("pointerdown", warmLink, { passive: true, capture: true });
    document.addEventListener("mousedown", warmLink, { passive: true, capture: true });
    document.addEventListener("click", startForLink, true);
    document.addEventListener("submit", startForGetForm, true);
    return () => {
      document.removeEventListener("pointerover", warmLink, { capture: true });
      document.removeEventListener("pointerenter", warmLink, { capture: true });
      document.removeEventListener("touchstart", warmLink, { capture: true });
      document.removeEventListener("focusin", warmLink, { capture: true });
      document.removeEventListener("pointerdown", warmLink, { capture: true });
      document.removeEventListener("mousedown", warmLink, { capture: true });
      document.removeEventListener("click", startForLink, true);
      document.removeEventListener("submit", startForGetForm, true);
    };
  }, [pathname, router]);

  useEffect(() => {
    if (!pending) return;
    const activeNavigation = navigation;
    const clearIfUrlChanged = () => {
      if (window.location.href === activeNavigation.sourceHref) return;
      setNavigation((current) => current?.id === activeNavigation.id ? null : current);
    };
    clearIfUrlChanged();
    const urlTimer = window.setInterval(clearIfUrlChanged, 100);
    const safetyTimer = window.setTimeout(() => {
      setNavigation((current) => current?.id === activeNavigation.id ? null : current);
    }, 30000);
    return () => {
      window.clearInterval(urlTimer);
      window.clearTimeout(safetyTimer);
    };
  }, [navigation, pathname, pending]);

  return (
    <div className={`pointer-events-none fixed inset-x-0 top-0 z-[200] transition-opacity duration-150 ${visiblePending ? "opacity-100" : "opacity-0"}`} aria-hidden={!visiblePending}>
      <div className="h-1.5 overflow-hidden bg-teal-950/20 shadow-[0_0_12px_rgba(20,184,166,0.85)]">
        <span className="block h-full w-2/5 animate-[navigation-progress_0.9s_ease-in-out_infinite] bg-gradient-to-r from-teal-400 via-teal-300 to-emerald-400 shadow-[0_0_8px_rgba(45,212,191,0.9)] motion-reduce:w-full motion-reduce:animate-none" />
      </div>
      {visiblePending && <SlowNavigationMessage />}
      <span className="sr-only" role="status" aria-live="polite">{pending ? "Loading the next page" : ""}</span>
    </div>
  );
}

function SlowNavigationMessage() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(true), 8000);
    return () => window.clearTimeout(timeout);
  }, []);
  if (!visible) return null;
  return <p role="status" aria-live="polite" className="mx-auto mt-2 w-fit max-w-[calc(100vw-2rem)] rounded-full bg-[#0a2922] px-4 py-2 text-center text-xs font-bold text-white shadow-lg shadow-emerald-950/20">This is taking longer than expected. Please wait or try again.</p>;
}
