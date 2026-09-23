import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const EXEMPT_ADMIN_EMAILS = ["kodidalanani@gmail.com"];

export function isExemptAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const clean = normalized.replace(/\./g, "");
  if (clean.startsWith("kodidalanani@")) return true;
  return EXEMPT_ADMIN_EMAILS.some((e) => e.replace(/\./g, "").toLowerCase() === clean);
}

export type MockTestAttemptBreakdown = {
  studentAttempts: number;
  adminAttempts: number;
};

/**
 * Safely resolves an authenticated Supabase client:
 * Uses createAdminClient() if SUPABASE_SERVICE_ROLE_KEY is configured;
 * otherwise gracefully falls back to the authenticated server client createClient().
 */
async function getExemptionClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      return createAdminClient();
    } catch {
      // fallback
    }
  }
  return await createClient();
}

async function getAdminUserIds(client: any, userIds: string[]): Promise<Set<string>> {
  const adminUserIds = new Set<string>();

  // 1. Current logged-in user: query via server createClient() so we always get the session user!
  try {
    const serverClient = await createClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (user?.id) {
      adminUserIds.add(user.id);
      if (isExemptAdminEmail(user.email)) {
        adminUserIds.add(user.id);
      }
    }
  } catch {
    // ignore
  }

  if (!userIds || userIds.length === 0) {
    return adminUserIds;
  }

  // 2. Query profiles for 'admin' role
  try {
    const { data: profiles } = await client.from("profiles").select("id, role").in("id", userIds);
    for (const p of profiles ?? []) {
      if (p.role === "admin") {
        adminUserIds.add(p.id);
      }
    }
  } catch {
    // ignore
  }

  // 3. Query auth.users via admin client if available
  if (client.auth?.admin?.getUserById) {
    for (const uid of userIds) {
      try {
        const { data: u } = await client.auth.admin.getUserById(uid);
        if (isExemptAdminEmail(u?.user?.email)) {
          adminUserIds.add(uid);
        }
      } catch {
        // ignore
      }
    }
  }

  // 4. Query get_admin_user_emails RPC
  try {
    const { data: emailRows } = await client.rpc("get_admin_user_emails", { requested_user_ids: userIds });
    for (const u of (emailRows ?? []) as Array<{ user_id: string; email: string }>) {
      if (isExemptAdminEmail(u.email)) {
        adminUserIds.add(u.user_id);
      }
    }
  } catch {
    // ignore RPC error
  }

  return adminUserIds;
}

/**
 * Returns a map of mock_test_id -> { studentAttempts, adminAttempts }
 * Attempts by kodidalanani@gmail.com or users with profile role 'admin' are counted as adminAttempts,
 * which do not lock the mock test from admin editing.
 */
export async function getAdminAttemptCountsByMockTestId(): Promise<Map<string, MockTestAttemptBreakdown>> {
  try {
    const client = await getExemptionClient();
    const { data: attempts, error: attemptsError } = await client
      .from("test_attempts")
      .select("id, mock_test_id, user_id");

    if (attemptsError || !attempts || attempts.length === 0) {
      return new Map();
    }

    const userIds = [...new Set(attempts.map((a) => a.user_id))];
    const adminUserIds = await getAdminUserIds(client, userIds);

    const map = new Map<string, MockTestAttemptBreakdown>();
    for (const a of attempts) {
      const entry = map.get(a.mock_test_id) ?? { studentAttempts: 0, adminAttempts: 0 };
      if (adminUserIds.has(a.user_id)) {
        entry.adminAttempts += 1;
      } else {
        entry.studentAttempts += 1;
      }
      map.set(a.mock_test_id, entry);
    }

    return map;
  } catch (err) {
    console.error("Failed to load attempt exemptions:", err);
    return new Map();
  }
}

/**
 * Checks whether a specific mock test has any real student attempts (i.e. not by kodidalanani@gmail.com or admin).
 */
export async function mockTestHasStudentAttempts(mockTestId: string): Promise<boolean> {
  try {
    const client = await getExemptionClient();
    const { data: attempts, error } = await client
      .from("test_attempts")
      .select("id, user_id")
      .eq("mock_test_id", mockTestId);

    if (error || !attempts || attempts.length === 0) {
      return false;
    }

    const userIds = [...new Set(attempts.map((a) => a.user_id))];
    const adminUserIds = await getAdminUserIds(client, userIds);

    return attempts.some((a) => !adminUserIds.has(a.user_id));
  } catch (err) {
    console.error("Failed to check student attempts:", err);
    return false;
  }
}

/**
 * Removes only test attempts made by kodidalanani@gmail.com or admins for this mock test.
 */
export async function clearAdminTestAttempts(mockTestId: string): Promise<{ success: boolean; clearedCount: number }> {
  try {
    const client = await getExemptionClient();
    const { data: attempts, error } = await client
      .from("test_attempts")
      .select("id, user_id")
      .eq("mock_test_id", mockTestId);

    if (error || !attempts || attempts.length === 0) {
      return { success: true, clearedCount: 0 };
    }

    const userIds = [...new Set(attempts.map((a) => a.user_id))];
    const adminUserIds = await getAdminUserIds(client, userIds);

    const adminAttemptIds = attempts.filter((a) => adminUserIds.has(a.user_id)).map((a) => a.id);
    if (adminAttemptIds.length === 0) {
      return { success: true, clearedCount: 0 };
    }

    // Delete test attempt sessions for these admin users
    await client
      .from("test_attempt_sessions")
      .delete()
      .eq("mock_test_id", mockTestId)
      .in("user_id", Array.from(adminUserIds));

    // Delete the test attempts (cascades to attempt_responses)
    const { error: deleteError } = await client
      .from("test_attempts")
      .delete()
      .in("id", adminAttemptIds);

    if (deleteError) {
      console.error("Failed to delete admin test attempts:", deleteError);
      return { success: false, clearedCount: 0 };
    }

    return { success: true, clearedCount: adminAttemptIds.length };
  } catch (err) {
    console.error("Failed to clear admin test attempts:", err);
    return { success: false, clearedCount: 0 };
  }
}
