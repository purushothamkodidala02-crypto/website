"use client";

import { useTransition } from "react";
import { PendingButtonContent } from "@/components/feedback/LoadingSpinner";

export function RetryButton({ retry, className }: { retry: () => void; className: string }) {
  const [pending, startTransition] = useTransition();

  const handleRetry = () => {
    startTransition(() => {
      try {
        retry();
      } catch {
        // Fallback
      }
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleRetry}
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      <PendingButtonContent pending={pending} pendingLabel="Reloading…">
        Try again
      </PendingButtonContent>
    </button>
  );
}
