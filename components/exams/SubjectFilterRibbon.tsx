"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type SubjectFilterRibbonProps = {
  headerLabel: string;
  subjectCount: number;
  hasSelectedSubject: boolean;
  allSubjectsHref: string;
  scrollContainerClassName?: string;
  children: ReactNode;
};

export function SubjectFilterRibbon({
  headerLabel,
  subjectCount,
  hasSelectedSubject,
  allSubjectsHref,
  scrollContainerClassName = "flex items-center gap-2 overflow-x-auto touch-pan-x no-scrollbar scroll-smooth py-0.5",
  children,
}: SubjectFilterRibbonProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(maxScroll > 4 && el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const selected = el.querySelector<HTMLElement>("[data-selected='true']");
    if (selected) {
      selected.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" });
    }

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScrollState) : null;
    observer?.observe(el);
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      observer?.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, children]);

  const scrollByAmount = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const reduced =
      document.documentElement.dataset.motion === "reduced" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = Math.max(220, Math.round(el.clientWidth * 0.65));
    el.scrollBy({
      left: direction * step,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const hasOverflow = canScrollLeft || canScrollRight;

  return (
    <div className="mb-6 rounded-2xl border border-teal-100/90 bg-white p-3 sm:p-4 shadow-2xs">
      <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 truncate">
          {headerLabel}
        </span>
        <div className="flex shrink-0 items-center gap-2.5">
          {hasSelectedSubject && (
            <Link
              href={allSubjectsHref}
              className="text-[11px] font-bold text-teal-800 hover:text-teal-950 hover:underline"
            >
              Reset
            </Link>
          )}
          <span className="text-[11px] font-semibold text-slate-500">
            {subjectCount} subject{subjectCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {hasOverflow && (
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll subjects left"
            title="Scroll subjects left"
            className="hidden sm:grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900 disabled:pointer-events-none disabled:opacity-35"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}

        <div className="relative min-w-0 flex-1">
          <div ref={trackRef} className={scrollContainerClassName}>
            {children}
          </div>
          {canScrollLeft && (
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent"
              aria-hidden="true"
            />
          )}
          {canScrollRight && (
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent"
              aria-hidden="true"
            />
          )}
        </div>

        {hasOverflow && (
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            disabled={!canScrollRight}
            aria-label="Scroll subjects right"
            title="Scroll subjects right"
            className="hidden sm:grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900 disabled:pointer-events-none disabled:opacity-35"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
