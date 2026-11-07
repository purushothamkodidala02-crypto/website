"use client";

import { useEffect, useState, useMemo } from "react";
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

export function useStudentPractice() {
  const [attemptedList, setAttemptedList] = useState<string[]>([]);
  const [recentPractice, setRecentPractice] = useState<RecentPracticeItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    const applyStatus = (status: Awaited<ReturnType<typeof getStudentPracticeStatus>>) => {
      if (!active) return;
      if (status.isAuthenticated) {
        if (status.lastPractice) {
          setRecentPractice(status.lastPractice);
          setLocalRecentPractice(status.lastPractice);
        } else {
          // New student with 0 attempts: clear any stale banner from past users
          setRecentPractice(null);
          clearLocalRecentPractice();
        }
        setAttemptedList(status.attemptedMockTestIds);
        setLocalAttemptedTestIds(status.attemptedMockTestIds);
      } else {
        // Not authenticated: clear all student practice data
        setRecentPractice(null);
        setAttemptedList([]);
        clearLocalPracticeStorage();
      }
      setIsLoaded(true);
    };

    let lastFetched = 0;
    const fetchStatus = () => {
      const now = Date.now();
      if (now - lastFetched < 2500) return;
      lastFetched = now;
      void getStudentPracticeStatus().then(applyStatus);
    };

    // 1. Check local session and verified local practice cache
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const currentUserId = data.session?.user.id;
      if (currentUserId) {
        const localPractice = getLocalRecentPractice(currentUserId);
        if (localPractice && localPractice.userId === currentUserId) {
          setRecentPractice(localPractice);
        }
        const localAttempted = getLocalAttemptedTestIds();
        if (localAttempted.length > 0) setAttemptedList(localAttempted);
      } else {
        // Guest user: discard any leftover practice from prior logins
        clearLocalPracticeStorage();
      }

      // 2. Fetch authoritative state from server
      fetchStatus();
    }).catch(() => {
      fetchStatus();
    });

    // 3. Listen to auth changes (sign-in, sign-out, account switches)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "SIGNED_OUT" || !session) {
        setRecentPractice(null);
        setAttemptedList([]);
        clearLocalPracticeStorage();
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        fetchStatus();
      }
    });

    // 4. Subscribe to local updates across components / tabs
    const unsubscribe = subscribePracticeUpdates(() => {
      setAttemptedList(getLocalAttemptedTestIds());
      setRecentPractice(getLocalRecentPractice());
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
      unsubscribe();
    };
  }, []);

  const attemptedIds = useMemo(() => new Set(attemptedList), [attemptedList]);

  return {
    attemptedIds,
    lastPractice: recentPractice,
    isLoaded,
    hasAttempted: (testId: string) => attemptedIds.has(testId),
  };
}
