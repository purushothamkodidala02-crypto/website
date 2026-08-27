"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { LongPendingNotice } from "@/components/feedback/LoadingSpinner";
import { createClient } from "@/lib/supabase/client";

// OAuth client IDs are designed to be public. The secret remains only in Supabase.
const GOOGLE_CLIENT_ID = "331636610025-hrkt50q6bro9qrsdgkvpusr62s9h26q1.apps.googleusercontent.com";

type GoogleCredentialResponse = { credential?: string };

type GoogleIdentityApi = {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        ux_mode: "popup";
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: { theme: "outline"; size: "large"; width: number; text: "continue_with" },
      ) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentityApi;
  }
}

export function GoogleSignInButton({ nextPath }: { nextPath: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const completeGoogleSignIn = useCallback(async (response: GoogleCredentialResponse) => {
    if (!response.credential) {
      setError("Google did not return a sign-in credential. Please try again.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });

      if (signInError) {
        setError("Google sign-in is temporarily unavailable. Use email sign-in or try again shortly.");
        setPending(false);
        return;
      }

      window.location.assign(`/auth/session/complete?next=${encodeURIComponent(nextPath)}`);
    } catch {
      setError("Google sign-in could not be completed. Check your connection and try again.");
      setPending(false);
    }
  }, [nextPath]);

  useEffect(() => {
    if (!scriptReady || !buttonRef.current || !window.google) return;

    buttonRef.current.replaceChildren();
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: completeGoogleSignIn,
      ux_mode: "popup",
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: Math.max(280, Math.floor(buttonRef.current.getBoundingClientRect().width)),
      text: "continue_with",
    });
  }, [completeGoogleSignIn, scriptReady]);

  return (
    <div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => setError("Google sign-in could not load. Please use email sign-in or try again shortly.")}
      />
      <div ref={buttonRef} className="min-h-11" aria-busy={pending} aria-live="polite" />
      <LongPendingNotice pending={pending} />
      {error && (
        <p role="alert" aria-live="polite" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
