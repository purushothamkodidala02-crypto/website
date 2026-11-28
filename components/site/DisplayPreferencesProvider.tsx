"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  applyDisplayPreferencesToDocument,
  DEFAULT_DISPLAY_PREFERENCES,
  DISPLAY_PREFERENCES_STORAGE_KEY,
  readStoredDisplayPreferences,
  sanitizeDisplayPreferences,
  type DisplayPreferences,
} from "@/lib/preferences/display-preferences";

type DisplayPreferencesContextValue = {
  preferences: DisplayPreferences;
  hydrated: boolean;
  updatePreferences: (patch: Partial<DisplayPreferences>) => void;
  resetPreferences: () => void;
};

const DisplayPreferencesContext = createContext<DisplayPreferencesContextValue>({
  preferences: DEFAULT_DISPLAY_PREFERENCES,
  hydrated: false,
  updatePreferences: () => {},
  resetPreferences: () => {},
});

export function DisplayPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<DisplayPreferences>(DEFAULT_DISPLAY_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredDisplayPreferences();
    setPreferences(stored);
    applyDisplayPreferencesToDocument(stored);
    setHydrated(true);

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== DISPLAY_PREFERENCES_STORAGE_KEY) return;
      const next = readStoredDisplayPreferences();
      setPreferences(next);
      applyDisplayPreferencesToDocument(next);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updatePreferences = useCallback((patch: Partial<DisplayPreferences>) => {
    setPreferences((prev) => {
      const next = sanitizeDisplayPreferences({ ...prev, ...patch });
      applyDisplayPreferencesToDocument(next);
      try {
        window.localStorage.setItem(DISPLAY_PREFERENCES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage quota or private mode errors
      }
      return next;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    applyDisplayPreferencesToDocument(DEFAULT_DISPLAY_PREFERENCES);
    setPreferences(DEFAULT_DISPLAY_PREFERENCES);
    try {
      window.localStorage.removeItem(DISPLAY_PREFERENCES_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const value = useMemo(
    () => ({
      preferences,
      hydrated,
      updatePreferences,
      resetPreferences,
    }),
    [preferences, hydrated, updatePreferences, resetPreferences],
  );

  return (
    <DisplayPreferencesContext.Provider value={value}>
      {children}
    </DisplayPreferencesContext.Provider>
  );
}

export function useDisplayPreferences() {
  return useContext(DisplayPreferencesContext);
}
