import { NextResponse, type NextRequest } from "next/server";
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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: mockTestId } = await context.params;

    if (!UUID_PATTERN.test(mockTestId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid test ID." },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const mode = body?.mode === "restart" ? "restart" : "resume";
    const clientDeviceId =
      typeof body?.deviceId === "string" ? body.deviceId.trim() : undefined;

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          ok: false,
          error: "You must be signed in to take a mock test.",
          loginRequired: true,
        },
        { status: 401 },
      );
    }

    const sessionToken = await getActiveSessionToken();
    const deviceToken = clientDeviceId || sessionToken || null;

    const functionName =
      mode === "restart"
        ? "restart_mock_test_session"
        : "start_mock_test_session";

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
    const session = data?.[0] as { session_id?: string; expires_at?: string } | undefined;

    if (error || !session?.session_id) {
      const errorMsg = error?.message || "Failed to start mock test session.";
      console.warn("Could not start mock test session in API:", errorMsg);

      let friendlyMessage = "This mock test could not be started.";
      let errorCode = "general";
      if (/no active questions/i.test(errorMsg)) {
        friendlyMessage =
          "This mock test does not have active questions available yet. Please check back shortly.";
        errorCode = "no_questions";
      } else if (/does not match its paper/i.test(errorMsg)) {
        friendlyMessage =
          "This mock test question count is being updated. Please try again shortly.";
        errorCode = "count_mismatch";
      } else if (/not available/i.test(errorMsg)) {
        friendlyMessage =
          "This mock test is temporarily unavailable. Please select another test.";
        errorCode = "not_available";
      } else if (/access/i.test(errorMsg)) {
        friendlyMessage =
          "You do not have access to this test. Please unlock it with an active pass.";
        errorCode = "no_access";
      }

      return NextResponse.json(
        { ok: false, error: friendlyMessage, errorCode },
        { status: 400 },
      );
    }

    const attemptUrl = `/mock-tests/${mockTestId}/attempt?session=${encodeURIComponent(session.session_id)}`;

    return NextResponse.json({
      ok: true,
      sessionId: session.session_id,
      expiresAt: session.expires_at,
      url: attemptUrl,
    });
  } catch (err) {
    console.error("Unexpected error in /api/mock-tests/[id]/start:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Temporary server issue while starting the mock test. Please try again.",
      },
      { status: 500 },
    );
  }
}
