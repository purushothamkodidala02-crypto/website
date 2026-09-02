"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export function BackButton({ fallbackHref, label, className }: { fallbackHref: string; label: string; className?: string }) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // If window.history.length > 2, it's highly likely they navigated from within the app
    // and can safely go back without exiting the site.
    setCanGoBack(window.history.length > 2);
  }, []);

  if (!canGoBack) {
    return (
      <Link href={fallbackHref} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <button
      onClick={() => router.back()}
      className={className}
      type="button"
    >
      {label}
    </button>
  );
}
