"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveSessionToken } from "@/lib/auth/single-session";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRpcSignatureMismatch(error?: { message?: string; code?: string }) {
  if (!error) return false;
  const msg = error.message || "";
  return (
    error.code === "PGRST202" ||
    msg.includes("parameter") ||
    msg.includes("Could not find") ||
    msg.includes("candidate") ||
    msg.includes("schema cache")
  );
}

function isRedirectError(err: unknown): boolean {
  return Boolean(
    err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest: string }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT"),
  );
}

export async function beginMockTest(
  mockTestId: string,
  publicPath: string,
  mode: "resume" | "restart",
  clientDeviceId?: string,
) {
  try {
    if (!UUID_PATTERN.test(mockTestId)) redirect("/mock-tests");

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect(`/login?next=${encodeURIComponent(publicPath)}`);
    }

    const sessionToken = await getActiveSessionToken();
    const deviceToken = clientDeviceId?.trim() || sessionToken || null;

    const functionName =
      mode === "restart"
        ? "restart_mock_test_session"
        : "start_mock_test_session";

    // Try with requested_device_token first, fallback gracefully to legacy signature
    let rpcResult = await supabase.rpc(functionName, {
      requested_mock_test_id: mockTestId,
      requested_device_token: deviceToken,
    });

    if (rpcResult.error && isRpcSignatureMismatch(rpcResult.error)) {
      rpcResult = await supabase.rpc(functionName, {
        requested_mock_test_id: mockTestId,
      });
    }

    const { data, error } = rpcResult;
    const session = data?.[0] as { session_id?: string } | undefined;

    if (error || !session?.session_id) {
      const errorMsg = error?.message || "";
      console.warn("Could not start mock test session in server action:", errorMsg);
      let errorCode = "1";
      if (/no active questions/i.test(errorMsg)) {
        errorCode = "no_questions";
      } else if (/does not match its paper/i.test(errorMsg)) {
        errorCode = "count_mismatch";
      } else if (/not available/i.test(errorMsg)) {
        errorCode = "not_available";
      } else if (/access/i.test(errorMsg)) {
        errorCode = "no_access";
      }
      redirect(`${publicPath}?start_error=${errorCode}`);
    }

    // Ensure active_device_token is stamped for this device session
    if (deviceToken && session.session_id) {
      try {
        await supabase
          .from("test_attempt_sessions")
          .update({
            active_device_token: deviceToken,
            last_device_heartbeat_at: new Date().toISOString(),
          })
          .eq("id", session.session_id)
          .eq("user_id", user.id);
      } catch {
        // start_mock_test_session RPC already records active_device_token
      }
    }

    redirect(
      `/mock-tests/${mockTestId}/attempt?session=${encodeURIComponent(session.session_id)}`,
    );
  } catch (err) {
    if (isRedirectError(err)) {
      throw err;
    }
    console.error("Unexpected error in beginMockTest:", err);
    redirect(`${publicPath}?start_error=1`);
  }
}
