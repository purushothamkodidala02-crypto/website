/**
 * Safe, cross-browser Fullscreen API utilities for test runner and CBT exam mode.
 */

export function isBigScreen(): boolean {
  if (typeof window === "undefined") return false;
  // Standard tablet / desktop breakpoint (iPad is 768px+, laptops/desktops 1024px+)
  const width = window.innerWidth || 0;
  const screenWidth = typeof window.screen !== "undefined" ? window.screen.width : 0;
  return width >= 768 || screenWidth >= 768;
}

export function isFullscreenSupported(): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as Document & {
    webkitFullscreenEnabled?: boolean;
    mozFullScreenEnabled?: boolean;
    msFullscreenEnabled?: boolean;
  };
  return Boolean(
    doc.fullscreenEnabled ??
      doc.webkitFullscreenEnabled ??
      doc.mozFullScreenEnabled ??
      doc.msFullscreenEnabled ??
      false,
  );
}

export function isCurrentlyFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
    mozFullScreenElement?: Element | null;
    msFullscreenElement?: Element | null;
  };
  return Boolean(
    doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement,
  );
}

export async function requestFullscreenSafely(
  element?: HTMLElement,
): Promise<boolean> {
  if (typeof document === "undefined") return false;
  const target = (element ?? document.documentElement) as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  };

  try {
    if (target.requestFullscreen) {
      await target.requestFullscreen();
      return true;
    }
    if (target.webkitRequestFullscreen) {
      await target.webkitRequestFullscreen();
      return true;
    }
    if (target.mozRequestFullScreen) {
      await target.mozRequestFullScreen();
      return true;
    }
    if (target.msRequestFullscreen) {
      await target.msRequestFullscreen();
      return true;
    }
  } catch {
    // User declined, or browser permissions prevented fullscreen.
    // Gracefully allow normal screen or OS split-screen mode.
  }
  return false;
}

export async function exitFullscreenSafely(): Promise<boolean> {
  if (typeof document === "undefined") return false;
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void>;
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
  };

  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
      return true;
    }
    if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
      return true;
    }
    if (doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen();
      return true;
    }
    if (doc.msExitFullscreen) {
      await doc.msExitFullscreen();
      return true;
    }
  } catch {
    // Gracefully ignore exit errors
  }
  return false;
}

export async function toggleFullscreenSafely(): Promise<boolean> {
  if (isCurrentlyFullscreen()) {
    return exitFullscreenSafely();
  }
  return requestFullscreenSafely();
}

export function subscribeToFullscreenChange(
  callback: (isFullscreen: boolean) => void,
): () => void {
  if (typeof document === "undefined") return () => {};

  const handler = () => {
    callback(isCurrentlyFullscreen());
  };

  document.addEventListener("fullscreenchange", handler);
  document.addEventListener("webkitfullscreenchange", handler);
  document.addEventListener("mozfullscreenchange", handler);
  document.addEventListener("MSFullscreenChange", handler);

  return () => {
    document.removeEventListener("fullscreenchange", handler);
    document.removeEventListener("webkitfullscreenchange", handler);
    document.removeEventListener("mozfullscreenchange", handler);
    document.removeEventListener("MSFullscreenChange", handler);
  };
}
