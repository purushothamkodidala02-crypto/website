"use client";

import { useEffect } from "react";
import { exitFullscreenSafely, isCurrentlyFullscreen } from "@/lib/fullscreen";

/**
 * Ensures any active browser fullscreen is safely dismissed when mounted.
 * Useful on error pages, test not ready screens, and test detail pages with error states.
 */
export function AutoExitFullscreen() {
  useEffect(() => {
    if (isCurrentlyFullscreen()) {
      void exitFullscreenSafely();
    }
  }, []);

  return null;
}
