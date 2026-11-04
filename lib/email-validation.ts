/**
 * Email validation utility.
 * Validates that an email ID has valid syntax, requires a domain with a dot and top-level domain,
 * and blocks invalid formats like "@gmailcom" before submission.
 */

// HTML5 input pattern requiring an @, a domain with a dot, and a TLD of at least 2 alpha characters
export const EMAIL_INPUT_PATTERN = "^[^\\s@]+@[^\\s@]+\\.[a-zA-Z]{2,}$";

export type EmailValidationResult = {
  isValid: boolean;
  normalized: string;
  error?: string;
};

/**
 * Validates that an email address has correct formatting and a valid domain with a dot and TLD.
 */
export function validateRegistrationEmail(rawEmail: string | null | undefined): EmailValidationResult {
  const normalized = (rawEmail ?? "").trim().toLowerCase();

  if (!normalized) {
    return {
      isValid: false,
      normalized: "",
      error: "Enter a valid email address.",
    };
  }

  if (normalized.length > 254) {
    return {
      isValid: false,
      normalized,
      error: "Enter a valid email address.",
    };
  }

  const atIndex = normalized.indexOf("@");
  if (atIndex <= 0 || atIndex !== normalized.lastIndexOf("@")) {
    return {
      isValid: false,
      normalized,
      error: "Enter a valid email address.",
    };
  }

  const local = normalized.slice(0, atIndex);
  const domain = normalized.slice(atIndex + 1);

  if (!local || !domain || !domain.includes(".")) {
    return {
      isValid: false,
      normalized,
      error: "Enter a valid email address.",
    };
  }

  if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) {
    return {
      isValid: false,
      normalized,
      error: "Enter a valid email address.",
    };
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(normalized)) {
    return {
      isValid: false,
      normalized,
      error: "Enter a valid email address.",
    };
  }

  return {
    isValid: true,
    normalized,
  };
}
