"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
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
        nonce: string;
        use_fedcm_for_button: true;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: { theme: "outline"; size: "large"; width: number; text: "continue_with" },
      ) => void;
    };
  };
};

async function createGoogleNonce() {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(nonce));
  const hashedNonce = Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");

  return { nonce, hashedNonce };
}

declare global {
  interface Window {
    google?: GoogleIdentityApi;
  }
}

export function GoogleSignInButton({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const nonceRef = useRef<string | null>(null);

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
        nonce: nonceRef.current ?? undefined,
      });

      if (signInError) {
        setError("Google sign-in is temporarily unavailable. Use email sign-in or try again shortly.");
        setPending(false);
        return;
      }

      router.replace(`/auth/session/complete?next=${encodeURIComponent(nextPath)}`);
    } catch {
      setError("Google sign-in could not be completed. Check your connection and try again.");
      setPending(false);
    }
  }, [nextPath, router]);

  useEffect(() => {
    if (!scriptReady || !buttonRef.current || !window.google) return;

    let cancelled = false;

    void createGoogleNonce().then(({ nonce, hashedNonce }) => {
      if (cancelled || !buttonRef.current || !window.google) return;

      nonceRef.current = nonce;
      buttonRef.current.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: completeGoogleSignIn,
        ux_mode: "popup",
        nonce: hashedNonce,
        use_fedcm_for_button: true,
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: Math.max(220, Math.min(400, Math.floor(buttonRef.current.getBoundingClientRect().width))),
        text: "continue_with",
      });
    }).catch(() => {
      setError("Google sign-in could not be prepared. Please use email sign-in or try again shortly.");
    });

    return () => {
      cancelled = true;
    };
  }, [completeGoogleSignIn, scriptReady]);

  return (
    <div>
      <link rel="preconnect" href="https://accounts.google.com" />
      <link rel="dns-prefetch" href="https://accounts.google.com" />
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => {
          setScriptReady(true);
        }}
        onError={() => setError("Google sign-in could not load. Please use email sign-in or try again shortly.")}
      />
      <div className="relative mx-auto min-h-11 w-full max-w-[400px]">
        <div
          ref={buttonRef}
          className={`flex min-h-11 w-full items-center justify-center overflow-hidden transition-opacity duration-150 ${
            pending ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          aria-hidden={pending}
        />
        {pending && (
          <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="absolute inset-0 flex items-center justify-center gap-2.5 rounded-lg border border-teal-200 bg-teal-50/75 px-4 text-sm font-semibold text-teal-950 shadow-2xs"
          >
            <progress aria-label="Signing in with Google" className="loading-spinner loading-spinner-sm" />
            <span>Signing in with Google…</span>
          </div>
        )}
      </div>
      <LongPendingNotice
        pending={pending}
        label="Still connecting with Google. Please wait a moment…"
      />
      {error && (
        <p role="alert" aria-live="polite" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
