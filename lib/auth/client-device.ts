"use client";

const DEVICE_ID_KEY = "varadhi_client_device_id";

/**
 * Returns a persistent unique identifier for this browser/device installation.
 * Uses localStorage with fallback to sessionStorage/memory.
 */
export function getClientDeviceId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id || id.length < 16) {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    // If localStorage is blocked (e.g. private mode in strict browsers)
    try {
      let id = sessionStorage.getItem(DEVICE_ID_KEY);
      if (!id) {
        id = `mem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(DEVICE_ID_KEY, id);
      }
      return id;
    } catch {
      return `temp-${Math.random().toString(36).slice(2)}`;
    }
  }
}
