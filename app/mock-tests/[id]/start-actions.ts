"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveSessionToken } from "@/lib/auth/single-session";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function beginMockTest(
  mockTestId: string,
  publicPath: string,
  mode: "resume" | "restart",
  clientDeviceId?: string,
) {
  if (!UUID_PATTERN.test(mockTestId)) redirect("/mock-tests");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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

  if (rpcResult.error && (rpcResult.error.message.includes("parameter") || rpcResult.error.message.includes("candidate"))) {
    rpcResult = await supabase.rpc(functionName, {
      requested_mock_test_id: mockTestId,
    });
  }

  const { data, error } = rpcResult;
  const session = data?.[0] as { session_id?: string } | undefined;

  if (error || !session?.session_id) {
    console.error("Error beginning mock test session:", error?.message);
    redirect(`${publicPath}?start_error=1`);
  }

  // Ensure active_device_token is stamped for this device
  if (deviceToken && session.session_id) {
    await supabase
      .from("test_attempt_sessions")
      .update({
        active_device_token: deviceToken,
        last_device_heartbeat_at: new Date().toISOString(),
      })
      .eq("id", session.session_id)
      .eq("user_id", user.id);
  }

  redirect(
    `/mock-tests/${mockTestId}/attempt?session=${encodeURIComponent(session.session_id)}`,
  );
}
