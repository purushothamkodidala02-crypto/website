"use client";

export type RecentPracticeItem = {
  testId: string;
  testTitle: string;
  testPath: string;
  folderUrl: string;
  folderName: string;
  folderType: "subject" | "paper";
  examName: string;
  paperName?: string;
  subjectName?: string;
  stateCode?: string;
  score?: number;
  totalMarks?: number;
  submittedAt?: string;
  timestamp: number;
  userId?: string | null;
};

const PRACTICE_KEY = "varadhi_recent_practice_v1";
const ATTEMPTED_IDS_KEY = "varadhi_attempted_tests_v1";
const SYNC_EVENT = "varadhi_practice_updated";

export function getLocalRecentPractice(expectedUserId?: string | null): RecentPracticeItem | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PRACTICE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RecentPracticeItem;
    // If expectedUserId is specified, only return if it matches
    if (expectedUserId) {
      if (!parsed.userId || parsed.userId !== expectedUserId) {
        return null;
      }
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setLocalRecentPractice(item: RecentPracticeItem): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRACTICE_KEY, JSON.stringify(item));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch {
    // Ignore storage quota or disabled errors
  }
}

export function clearLocalRecentPractice(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PRACTICE_KEY);
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch {
    // Ignore storage errors
  }
}

export function clearLocalPracticeStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PRACTICE_KEY);
    localStorage.removeItem(ATTEMPTED_IDS_KEY);
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch {
    // Ignore storage errors
  }
}

export function getLocalAttemptedTestIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ATTEMPTED_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function setLocalAttemptedTestIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const unique = Array.from(new Set(ids.filter(Boolean)));
    localStorage.setItem(ATTEMPTED_IDS_KEY, JSON.stringify(unique));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch {
    // Ignore storage quota or disabled errors
  }
}

export function addLocalAttemptedTestId(id: string): void {
  if (typeof window === "undefined" || !id) return;
  const current = getLocalAttemptedTestIds();
  if (!current.includes(id)) {
    setLocalAttemptedTestIds([...current, id]);
  }
}

export function subscribePracticeUpdates(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(SYNC_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SYNC_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
