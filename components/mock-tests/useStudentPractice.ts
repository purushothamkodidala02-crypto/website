"use client";

import { useSyncExternalStore, useMemo } from "react";
import {
  clearLocalPracticeStorage,
  clearLocalRecentPractice,
  getLocalAttemptedTestIds,
  getLocalRecentPractice,
  setLocalAttemptedTestIds,
  setLocalRecentPractice,
  subscribePracticeUpdates,
  type RecentPracticeItem,
} from "@/lib/storage/student-practice-storage";
import { getStudentPracticeStatus } from "@/app/actions/practice-status";
import { createClient } from "@/lib/supabase/client";

type StoreState = {
  attemptedList: string[];
  recentPractice: RecentPracticeItem | null;
  isLoaded: boolean;
};

let globalState: StoreState = {
  attemptedList: [],
  recentPractice: null,
  isLoaded: false,
};

const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

let isInitialized = false;
let lastGlobalPracticeFetchTime = 0;

function initGlobalPracticeStore() {
  if (isInitialized || typeof window === "undefined") return;
  isInitialized = true;

  const supabase = createClient();

  const applyStatus = (status: Awaited<ReturnType<typeof getStudentPracticeStatus>>) => {
    if (status.isAuthenticated) {
      if (status.lastPractice) {
        globalState = {
          ...globalState,
          recentPractice: status.lastPractice,
          attemptedList: status.attemptedMockTestIds,
          isLoaded: true,
        };
        setLocalRecentPractice(status.lastPractice);
      } else {
        globalState = {
          ...globalState,
          recentPractice: null,
          attemptedList: status.attemptedMockTestIds,
          isLoaded: true,
        };
        clearLocalRecentPractice();
      }
      setLocalAttemptedTestIds(status.attemptedMockTestIds);
    } else {
      globalState = {
        attemptedList: [],
        recentPractice: null,
        isLoaded: true,
      };
      clearLocalPracticeStorage();
    }
    notifyListeners();
  };

  const fetchStatus = (force = false) => {
    const now = Date.now();
    if (!force && now - lastGlobalPracticeFetchTime < 10000) return;
    lastGlobalPracticeFetchTime = now;
    void getStudentPracticeStatus().then(applyStatus);
  };

  // 1. Initial check: restore verified local storage first
  void supabase.auth.getSession().then(({ data }) => {
    const currentUserId = data.session?.user?.id;
    if (currentUserId) {
      const localPractice = getLocalRecentPractice(currentUserId);
      const localAttempted = getLocalAttemptedTestIds();
      globalState = {
        ...globalState,
        recentPractice: localPractice && localPractice.userId === currentUserId ? localPractice : globalState.recentPractice,
        attemptedList: localAttempted.length > 0 ? localAttempted : globalState.attemptedList,
      };
      notifyListeners();
    } else {
      clearLocalPracticeStorage();
    }
    fetchStatus();
  }).catch(() => {
    fetchStatus();
  });

  // 2. Auth changes: single listener for the entire application
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT" || !session) {
      globalState = {
        attemptedList: [],
        recentPractice: null,
        isLoaded: true,
      };
      clearLocalPracticeStorage();
      notifyListeners();
    } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
      fetchStatus(true);
    }
  });

  // 3. Local tab / component practice updates
  subscribePracticeUpdates(() => {
    globalState = {
      ...globalState,
      attemptedList: getLocalAttemptedTestIds(),
      recentPractice: getLocalRecentPractice(),
    };
    notifyListeners();
  });
}

const SERVER_SNAPSHOT: StoreState = {
  attemptedList: [],
  recentPractice: null,
  isLoaded: false,
};

export function useStudentPractice() {
  if (typeof window !== "undefined" && !isInitialized) {
    initGlobalPracticeStore();
  }

  const state = useSyncExternalStore(
    (callback) => {
      initGlobalPracticeStore();
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
    () => globalState,
    () => SERVER_SNAPSHOT,
  );

  const attemptedIds = useMemo(() => new Set(state.attemptedList), [state.attemptedList]);
  const hasAttempted = useMemo(() => {
    return (testId: string) => attemptedIds.has(testId);
  }, [attemptedIds]);

  return {
    attemptedIds,
    lastPractice: state.recentPractice,
    isLoaded: state.isLoaded,
    hasAttempted,
  };
}
