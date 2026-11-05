"use client";

import { useState } from "react";
import Link from "next/link";

export function ViewTestLink({
  href,
  className = "inline-flex items-center gap-1.5 rounded-lg bg-[#ea580c] px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-2xs transition hover:bg-[#d94f08] min-h-[36px]",
}: {
  href: string;
  className?: string;
}) {
  const [isOpening, setIsOpening] = useState(false);

  return (
    <Link
      href={href}
      prefetch={true}
      onClick={() => setIsOpening(true)}
      className={className}
    >
      {isOpening ? (
        <>
          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Opening...</span>
        </>
      ) : (
        <>
          <span>View test</span>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </>
      )}
    </Link>
  );
}
