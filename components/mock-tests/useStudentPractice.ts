"use client";

import { useEffect, useState, useMemo } from "react";
import {
  getLocalAttemptedTestIds,
  getLocalRecentPractice,
  setLocalAttemptedTestIds,
  setLocalRecentPractice,
  subscribePracticeUpdates,
  type RecentPracticeItem,
} from "@/lib/storage/student-practice-storage";
import { getStudentPracticeStatus } from "@/app/actions/practice-status";

export function useStudentPractice() {
  const [attemptedList, setAttemptedList] = useState<string[]>([]);
  const [recentPractice, setRecentPractice] = useState<RecentPracticeItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Initial read from localStorage for 0ms immediate render
    const localAttempted = getLocalAttemptedTestIds();
    const localPractice = getLocalRecentPractice();

    if (localAttempted.length > 0) setAttemptedList(localAttempted);
    if (localPractice) setRecentPractice(localPractice);
    setIsLoaded(true);

    // 2. Fetch authoritative state from server
    let active = true;
    void getStudentPracticeStatus().then((status) => {
      if (!active) return;
      if (status.attemptedMockTestIds.length > 0) {
        setAttemptedList((prev) => {
          const merged = Array.from(new Set([...prev, ...status.attemptedMockTestIds]));
          setLocalAttemptedTestIds(merged);
          return merged;
        });
      }

      if (status.lastPractice) {
        setRecentPractice(status.lastPractice);
        setLocalRecentPractice(status.lastPractice);
      }
    });

    // 3. Subscribe to local updates across components / tabs
    const unsubscribe = subscribePracticeUpdates(() => {
      setAttemptedList(getLocalAttemptedTestIds());
      setRecentPractice(getLocalRecentPractice());
    });

    return () => {
      active = false;
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
