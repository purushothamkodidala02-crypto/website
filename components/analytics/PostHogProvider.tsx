"use client";

import { useEffect, useState, Suspense, type ComponentType } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [phState, setPhState] = useState<{
    client: any;
    Provider: ComponentType<{ client: any; children: React.ReactNode }>;
  } | null>(null);

  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!posthogKey) return;
    if (localStorage.getItem("varadhi_disable_tracking") === "true") return;

    let active = true;
    let unsubscribe: (() => void) | undefined;

    Promise.all([
      import("posthog-js"),
      import("posthog-js/react"),
      import("@/lib/supabase/client"),
    ]).then(([{ default: posthog }, { PostHogProvider: PHProvider }, { createClient }]) => {
      if (!active) return;

      posthog.init(posthogKey, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: false,
        disable_session_recording: true,
      });

      const supabase = createClient();
      const updateIdentity = async (session: any) => {
        if (session?.user) {
          posthog.identify(session.user.id, { email: session.user.email });
        } else {
          posthog.reset();
        }
      };

      supabase.auth.getSession().then(({ data }) => updateIdentity(data.session));
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        updateIdentity(session);
      });
      unsubscribe = () => listener.subscription.unsubscribe();

      setPhState({ client: posthog, Provider: PHProvider });
    });

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!phState) {
    return <>{children}</>;
  }

  const { Provider, client } = phState;
  return (
    <Provider client={client}>
      <Suspense fallback={null}>
        <PostHogPageView client={client} />
      </Suspense>
      {children}
    </Provider>
  );
}

function PostHogPageView({ client }: { client: any }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && client) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = `${url}?${searchParams.toString()}`;
      }
      client.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [client, pathname, searchParams]);

  return null;
}
