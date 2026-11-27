export type RecipientPriorityTier =
  | "inactive_test_taker"
  | "active_or_entitled"
  | "recent_signup";

export type CandidateRecipient = {
  user_id: string;
  email: string;
  full_name: string;
  last_seen_at?: string | null;
  registered_at?: string | null;
  priority_tier?: RecipientPriorityTier | null;
  inactive_days?: number | null;
  has_taken_exam?: boolean;
};

const INACTIVE_THRESHOLD_DAYS = 7;
const MS_PER_DAY = 86_400_000;

function toTimestampMs(value?: string | null): number | null {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Orders candidate recipients so inactive past test-takers (who haven't
 * visited/attempted for >= 7 days) are emailed first, followed by active/entitled
 * users, with recently registered users (within 7 days) placed at the bottom.
 */
export function prioritizeCandidateRecipients(
  recipients: CandidateRecipient[],
  now: Date = new Date()
): CandidateRecipient[] {
  const nowMs = now.getTime();
  const thresholdMs = nowMs - INACTIVE_THRESHOLD_DAYS * MS_PER_DAY;

  const enriched = recipients.map((r) => {
    const registeredMs = toTimestampMs(r.registered_at);
    const lastSeenMs = toTimestampMs(r.last_seen_at) ?? registeredMs;
    const isRecentSignup = registeredMs !== null && registeredMs >= thresholdMs;

    let tier: RecipientPriorityTier;
    if (r.priority_tier) {
      tier = r.priority_tier;
    } else if (isRecentSignup) {
      tier = "recent_signup";
    } else if ((r.has_taken_exam ?? true) && lastSeenMs !== null && lastSeenMs < thresholdMs) {
      tier = "inactive_test_taker";
    } else {
      tier = "active_or_entitled";
    }

    const inactiveDays =
      typeof r.inactive_days === "number"
        ? r.inactive_days
        : lastSeenMs !== null
        ? Math.max(0, Math.floor((nowMs - lastSeenMs) / MS_PER_DAY))
        : null;

    const sortRank =
      tier === "inactive_test_taker" ? 1 : tier === "active_or_entitled" ? 2 : 3;

    return {
      recipient: {
        ...r,
        priority_tier: tier,
        inactive_days: inactiveDays,
      },
      sortRank,
      lastSeenMs: lastSeenMs ?? nowMs,
      registeredMs: registeredMs ?? nowMs,
    };
  });

  enriched.sort((a, b) => {
    if (a.sortRank !== b.sortRank) return a.sortRank - b.sortRank;
    if (a.sortRank === 3) {
      // Recently registered: older of the recent registrations first, newest at the very bottom
      if (a.registeredMs !== b.registeredMs) return a.registeredMs - b.registeredMs;
    } else if (a.lastSeenMs !== b.lastSeenMs) {
      // Inactive & active tiers: longest-inactive first
      return a.lastSeenMs - b.lastSeenMs;
    }
    return a.recipient.full_name.localeCompare(b.recipient.full_name);
  });

  return enriched.map((item) => item.recipient);
}
