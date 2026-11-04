import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  validateRegistrationEmail,
} from "../lib/email-validation.ts";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("rejects ramakrishna33903@gmailcom with clean Enter a valid email address message", () => {
  const result = validateRegistrationEmail("ramakrishna33903@gmailcom");
  assert.equal(result.isValid, false);
  assert.equal(result.suggestion, undefined);
  assert.equal(result.error, "Enter a valid email address.");
});

test("rejects domains without dots", () => {
  assert.equal(validateRegistrationEmail("student@gmailcom").isValid, false);
  assert.equal(validateRegistrationEmail("student@yahoocom").isValid, false);
  assert.equal(validateRegistrationEmail("student@customdomain").isValid, false);
});

test("rejects invalid dot placements like double dots or leading/trailing dots", () => {
  assert.equal(validateRegistrationEmail("student@gmail..com").isValid, false);
  assert.equal(validateRegistrationEmail("student@.gmail.com").isValid, false);
  assert.equal(validateRegistrationEmail("student@gmail.com.").isValid, false);
});

test("rejects single character TLDs like student@gmail.c", () => {
  const result = validateRegistrationEmail("student@gmail.c");
  assert.equal(result.isValid, false);
});

test("accepts valid email addresses", () => {
  assert.equal(validateRegistrationEmail("ramakrishna33903@gmail.com").isValid, true);
  assert.equal(validateRegistrationEmail("v3vehicles@gmail.com").isValid, true);
  assert.equal(validateRegistrationEmail("user.name+tag@domain.co.in").isValid, true);
  assert.equal(validateRegistrationEmail("student@varadhiprep.in").isValid, true);
});

test("forms enforce email ID validation pattern without did-you-mean suggestions", async () => {
  const [registerSource, forgotSource, loginSource, otpSource] = await Promise.all([
    read("app/register/RegisterForm.tsx"),
    read("app/forgot-password/ForgotPasswordForm.tsx"),
    read("app/login/LoginForm.tsx"),
    read("app/login/EmailOtpLoginForm.tsx"),
  ]);

  // RegisterForm enforces validateRegistrationEmail and pattern
  assert.match(registerSource, /validateRegistrationEmail\(email\)/);
  assert.match(registerSource, /pattern=\{EMAIL_INPUT_PATTERN\}/);
  assert.doesNotMatch(registerSource, /Did you mean/);
  assert.doesNotMatch(registerSource, /Fix typo/);

  // ForgotPasswordForm enforces validateRegistrationEmail and pattern
  assert.match(forgotSource, /validateRegistrationEmail\(email\)/);
  assert.match(forgotSource, /pattern=\{EMAIL_INPUT_PATTERN\}/);
  assert.doesNotMatch(forgotSource, /Did you mean/);

  // LoginForm enforces pattern
  assert.match(loginSource, /pattern=\{EMAIL_INPUT_PATTERN\}/);
  assert.doesNotMatch(loginSource, /Did you mean/);

  // EmailOtpLoginForm enforces validateRegistrationEmail and pattern
  assert.match(otpSource, /validateRegistrationEmail\(email\)/);
  assert.match(otpSource, /pattern=\{EMAIL_INPUT_PATTERN\}/);
  assert.doesNotMatch(otpSource, /Did you mean/);
});
