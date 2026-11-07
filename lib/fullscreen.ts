/**
 * Safe, cross-browser Fullscreen API utilities for test runner and CBT exam mode.
 * Supports Chrome, Edge, Firefox, Safari (macOS & iPadOS), with multi-target fallback
 * (container element -> documentElement -> body) and F11 window detection.
 */

let lastFullscreenStatus: {
  error?: string;
  isBlockedByBrowser?: boolean;
} = {};

export function getLastFullscreenStatus(): {
  error?: string;
  isBlockedByBrowser?: boolean;
} {
  return lastFullscreenStatus;
}

export function isBigScreen(): boolean {
  if (typeof window === "undefined") return false;
  // Standard tablet / desktop breakpoint (iPad is 768px+, laptops/desktops 1024px+)
  // Viewport width in CSS pixels determines mobile vs desktop behavior
  const width =
    window.innerWidth ||
    (typeof document !== "undefined" && document.documentElement
      ? document.documentElement.clientWidth
      : 0);
  const height =
    window.innerHeight ||
    (typeof document !== "undefined" && document.documentElement
      ? document.documentElement.clientHeight
      : 0);
  // Phones in landscape orientation have wide width (e.g. 844px) but short height (< 500px)
  if (height > 0 && height < 500) return false;
  if (width > 0) return width >= 768;
  const screenWidth = typeof window.screen !== "undefined" ? window.screen.width : 0;
  return screenWidth >= 768;
}

export function isFullscreenSupported(): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as Document & {
    webkitFullscreenEnabled?: boolean;
    mozFullScreenEnabled?: boolean;
    msFullscreenEnabled?: boolean;
  };

  const docEl = (document.documentElement || {}) as HTMLElement & {
    webkitRequestFullscreen?: unknown;
    webkitRequestFullScreen?: unknown;
    mozRequestFullScreen?: unknown;
    msRequestFullscreen?: unknown;
  };

  return Boolean(
    doc.fullscreenEnabled ??
      doc.webkitFullscreenEnabled ??
      doc.mozFullScreenEnabled ??
      doc.msFullscreenEnabled ??
      docEl.requestFullscreen ??
      docEl.webkitRequestFullscreen ??
      docEl.webkitRequestFullScreen ??
      docEl.mozRequestFullScreen ??
      docEl.msRequestFullscreen ??
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

  // Standard or vendor-prefixed Fullscreen API element
  if (
    Boolean(
      doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement,
    )
  ) {
    return true;
  }

  // Detect browser F11 / OS hardware fullscreen on tablet / desktop
  if (typeof window !== "undefined" && typeof window.screen !== "undefined") {
    const isHeightFull = Math.abs(window.innerHeight - window.screen.height) <= 4;
    const isWidthFull = Math.abs(window.innerWidth - window.screen.width) <= 4;
    if (isHeightFull && isWidthFull && isBigScreen()) {
      return true;
    }
  }

  return false;
}

export async function requestFullscreenSafely(
  element?: HTMLElement | null,
): Promise<boolean> {
  if (typeof document === "undefined") {
    lastFullscreenStatus = { error: "Document unavailable" };
    return false;
  }

  lastFullscreenStatus = {};

  // Multiple candidates in order of preference
  const candidates: HTMLElement[] = [
    element ?? null,
    document.documentElement,
    document.body,
  ].filter((item): item is HTMLElement => Boolean(item));

  let lastError: unknown = null;

  for (const target of candidates) {
    const el = target as HTMLElement & {
      webkitRequestFullscreen?: (options?: unknown) => Promise<void> | void;
      webkitRequestFullScreen?: (options?: unknown) => Promise<void> | void;
      mozRequestFullScreen?: () => Promise<void> | void;
      msRequestFullscreen?: () => Promise<void> | void;
    };

    try {
      if (typeof el.requestFullscreen === "function") {
        try {
          await el.requestFullscreen({ navigationUI: "hide" });
          return true;
        } catch {
          await el.requestFullscreen();
          return true;
        }
      }

      if (typeof el.webkitRequestFullscreen === "function") {
        const keyboardConstant =
          typeof Element !== "undefined" && "ALLOW_KEYBOARD_INPUT" in Element
            ? (Element as unknown as { ALLOW_KEYBOARD_INPUT: unknown }).ALLOW_KEYBOARD_INPUT
            : undefined;
        try {
          const res = el.webkitRequestFullscreen(keyboardConstant);
          if (res instanceof Promise) await res;
          return true;
        } catch {
          const res = el.webkitRequestFullscreen();
          if (res instanceof Promise) await res;
          return true;
        }
      }

      if (typeof el.webkitRequestFullScreen === "function") {
        const res = el.webkitRequestFullScreen();
        if (res instanceof Promise) await res;
        return true;
      }

      if (typeof el.mozRequestFullScreen === "function") {
        const res = el.mozRequestFullScreen();
        if (res instanceof Promise) await res;
        return true;
      }

      if (typeof el.msRequestFullscreen === "function") {
        const res = el.msRequestFullscreen();
        if (res instanceof Promise) await res;
        return true;
      }
    } catch (err) {
      lastError = err;
      console.warn("Fullscreen attempt failed on target:", target.tagName, err);
    }
  }

  const errorMessage =
    lastError instanceof Error ? lastError.message : String(lastError ?? "");
  const isBlocked =
    errorMessage.toLowerCase().includes("denied") ||
    errorMessage.toLowerCase().includes("not allowed") ||
    errorMessage.toLowerCase().includes("permission") ||
    errorMessage.toLowerCase().includes("gesture");

  lastFullscreenStatus = {
    error: errorMessage || "Fullscreen request failed",
    isBlockedByBrowser: isBlocked,
  };

  return false;
}

export async function exitFullscreenSafely(): Promise<boolean> {
  if (typeof document === "undefined") return false;
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void> | void;
    webkitCancelFullScreen?: () => Promise<void> | void;
    mozCancelFullScreen?: () => Promise<void> | void;
    msExitFullscreen?: () => Promise<void> | void;
  };

  try {
    if (typeof document.exitFullscreen === "function") {
      const res = document.exitFullscreen();
      if (res instanceof Promise) await res;
      return true;
    }
    if (typeof doc.webkitExitFullscreen === "function") {
      const res = doc.webkitExitFullscreen();
      if (res instanceof Promise) await res;
      return true;
    }
    if (typeof doc.webkitCancelFullScreen === "function") {
      const res = doc.webkitCancelFullScreen();
      if (res instanceof Promise) await res;
      return true;
    }
    if (typeof doc.mozCancelFullScreen === "function") {
      const res = doc.mozCancelFullScreen();
      if (res instanceof Promise) await res;
      return true;
    }
    if (typeof doc.msExitFullscreen === "function") {
      const res = doc.msExitFullscreen();
      if (res instanceof Promise) await res;
      return true;
    }
  } catch (err) {
    console.warn("exitFullscreenSafely warning:", err);
  }
  return false;
}

export async function toggleFullscreenSafely(
  element?: HTMLElement | null,
): Promise<boolean> {
  if (isCurrentlyFullscreen()) {
    return exitFullscreenSafely();
  }
  return requestFullscreenSafely(element);
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

  if (typeof window !== "undefined") {
    window.addEventListener("resize", handler);
    window.addEventListener("orientationchange", handler);
  }

  return () => {
    document.removeEventListener("fullscreenchange", handler);
    document.removeEventListener("webkitfullscreenchange", handler);
    document.removeEventListener("mozfullscreenchange", handler);
    document.removeEventListener("MSFullscreenChange", handler);

    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handler);
      window.removeEventListener("orientationchange", handler);
    }
  };
}
