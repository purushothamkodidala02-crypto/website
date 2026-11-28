export type TextScaleOption = "compact" | "standard" | "large" | "xlarge";
export type QuestionFontOption = "serif" | "sans";
export type ReadingToneOption = "default" | "cream" | "contrast";
export type PreferredLanguageOption = "en" | "te";
export type MotionOption = "auto" | "reduced";

export type DisplayPreferences = {
  textScale: TextScaleOption;
  questionFont: QuestionFontOption;
  readingTone: ReadingToneOption;
  defaultLanguage: PreferredLanguageOption;
  motion: MotionOption;
};

export const DISPLAY_PREFERENCES_STORAGE_KEY = "varadhi_display_preferences_v1";

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  textScale: "standard",
  questionFont: "serif",
  readingTone: "default",
  defaultLanguage: "en",
  motion: "auto",
};

export const TEXT_SCALE_FACTORS: Record<TextScaleOption, number> = {
  compact: 0.94,
  standard: 1,
  large: 1.12,
  xlarge: 1.24,
};

const VALID_SCALES = new Set<TextScaleOption>(["compact", "standard", "large", "xlarge"]);
const VALID_FONTS = new Set<QuestionFontOption>(["serif", "sans"]);
const VALID_TONES = new Set<ReadingToneOption>(["default", "cream", "contrast"]);
const VALID_LANGS = new Set<PreferredLanguageOption>(["en", "te"]);
const VALID_MOTIONS = new Set<MotionOption>(["auto", "reduced"]);

export function sanitizeDisplayPreferences(raw: unknown): DisplayPreferences {
  if (!raw || typeof raw !== "object") return DEFAULT_DISPLAY_PREFERENCES;
  const input = raw as Partial<Record<keyof DisplayPreferences, unknown>>;
  return {
    textScale: VALID_SCALES.has(input.textScale as TextScaleOption)
      ? (input.textScale as TextScaleOption)
      : DEFAULT_DISPLAY_PREFERENCES.textScale,
    questionFont: VALID_FONTS.has(input.questionFont as QuestionFontOption)
      ? (input.questionFont as QuestionFontOption)
      : DEFAULT_DISPLAY_PREFERENCES.questionFont,
    readingTone: VALID_TONES.has(input.readingTone as ReadingToneOption)
      ? (input.readingTone as ReadingToneOption)
      : DEFAULT_DISPLAY_PREFERENCES.readingTone,
    defaultLanguage: VALID_LANGS.has(input.defaultLanguage as PreferredLanguageOption)
      ? (input.defaultLanguage as PreferredLanguageOption)
      : DEFAULT_DISPLAY_PREFERENCES.defaultLanguage,
    motion: VALID_MOTIONS.has(input.motion as MotionOption)
      ? (input.motion as MotionOption)
      : DEFAULT_DISPLAY_PREFERENCES.motion,
  };
}

export function readStoredDisplayPreferences(): DisplayPreferences {
  if (typeof window === "undefined") return DEFAULT_DISPLAY_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(DISPLAY_PREFERENCES_STORAGE_KEY);
    if (!raw) return DEFAULT_DISPLAY_PREFERENCES;
    return sanitizeDisplayPreferences(JSON.parse(raw));
  } catch {
    return DEFAULT_DISPLAY_PREFERENCES;
  }
}

export function applyDisplayPreferencesToDocument(prefs: DisplayPreferences): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.readingScale = prefs.textScale;
  root.dataset.questionFont = prefs.questionFont;
  root.dataset.readingTone = prefs.readingTone;
  root.dataset.motion = prefs.motion;
  root.style.setProperty("--varadhi-reading-scale", String(TEXT_SCALE_FACTORS[prefs.textScale]));
}

export const DISPLAY_PREFS_INIT_SCRIPT = `(function(){try{var k='${DISPLAY_PREFERENCES_STORAGE_KEY}',r=localStorage.getItem(k);if(!r)return;var p=JSON.parse(r),d=document.documentElement,s={compact:0.94,standard:1,large:1.12,xlarge:1.24};if(p.textScale&&s[p.textScale]){d.dataset.readingScale=p.textScale;d.style.setProperty('--varadhi-reading-scale',String(s[p.textScale]))}if(p.questionFont==='sans'||p.questionFont==='serif')d.dataset.questionFont=p.questionFont;if(p.readingTone==='default'||p.readingTone==='cream'||p.readingTone==='contrast')d.dataset.readingTone=p.readingTone;if(p.motion==='auto'||p.motion==='reduced')d.dataset.motion=p.motion}catch(e){}})();`;
