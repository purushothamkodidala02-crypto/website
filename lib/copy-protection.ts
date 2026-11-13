/**
 * Content Selection & Editing Helpers
 *
 * Helpers to identify editable form elements and inputs across Varadhi Prep.
 */

export function isEditableElement(target: EventTarget | null): boolean {
  if (!target || typeof target !== "object") return false;

  const el = target as {
    tagName?: unknown;
    isContentEditable?: unknown;
    closest?: (selector: string) => unknown;
  };

  const tagName = typeof el.tagName === "string" ? el.tagName.toUpperCase() : "";
  if (tagName === "INPUT" || tagName === "TEXTAREA") {
    return true;
  }
  if (Boolean(el.isContentEditable)) {
    return true;
  }
  if (
    typeof el.closest === "function" &&
    Boolean(el.closest("input, textarea, [contenteditable='true'], [contenteditable='plaintext-only']"))
  ) {
    return true;
  }
  return false;
}
