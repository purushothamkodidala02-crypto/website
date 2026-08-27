"use client";

import { useState } from "react";
import { LongPendingNotice, PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton({ nextPath }: { nextPath: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function continueWithGoogle() {
    setPending(true);
    setError(null);

    const callbackUrl = new URL("/auth/oauth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", nextPath);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          skipBrowserRedirect: false,
        },
      });

      if (signInError) {
        setError("Google sign-in is temporarily unavailable. Use email sign-in or try again shortly.");
        setPending(false);
      }
    } catch {
      setError("Google sign-in could not be started. Check your connection and try again.");
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={continueWithGoogle}
        disabled={pending}
        aria-busy={pending}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <PendingButtonContent pending={pending} pendingLabel="Connecting to Google…">
          <span className="flex items-center justify-center gap-3">
            <GoogleMark />
            Continue with Google
          </span>
        </PendingButtonContent>
      </button>
      <LongPendingNotice pending={pending} />
      {error && (
        <p role="alert" aria-live="polite" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.86A6.02 6.02 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.05A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.48l3.34-2.62Z" />
      <path fill="#EA4335" d="M12 6.01c1.47 0 2.79.5 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.95 5.52l3.34 2.62C7.18 7.77 9.39 6.01 12 6.01Z" />
    </svg>
  );
}
