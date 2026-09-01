import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("production CSS uses the Next.js 16 App Router inliner", async () => {
  const config = await read("next.config.ts");

  assert.match(config, /inlineCss:\s*true/);
  assert.doesNotMatch(config, /optimizeCss:\s*true/);
});

test("the root layout self-hosts a swap font", async () => {
  const layout = await read("app/layout.tsx");

  assert.match(layout, /from "next\/font\/google"/);
  assert.match(layout, /display:\s*"swap"/);
  assert.match(layout, /variable:\s*"--font-varadhi-ui"/);
});

test("the above-the-fold brand asset uses next image preload", async () => {
  const brand = await read("components/brand/VaradhiBrand.tsx");

  assert.match(brand, /from "next\/image"/);
  assert.match(brand, /<BrandMark preload/);
  assert.match(brand, /width=\{48\}/);
  assert.match(brand, /height=\{48\}/);
});

test("non-critical question dialogs load on demand", async () => {
  const [media, reporting, runner] = await Promise.all([
    read("components/questions/QuestionMedia.tsx"),
    read("components/questions/ReportQuestionButton.tsx"),
    read("app/mock-tests/[id]/StudentTestRunner.tsx"),
  ]);

  assert.match(media, /dynamic\(/);
  assert.match(media, /QuestionImageViewer/);
  assert.match(reporting, /dynamic\(/);
  assert.match(reporting, /ReportQuestionDialog/);
  assert.match(runner, /dynamic\(/);
  assert.match(runner, /SubmissionDialog/);
});

test("functional payment and authentication scripts are not loaded globally", async () => {
  const [layout, google, turnstile, cashfree] = await Promise.all([
    read("app/layout.tsx"),
    read("components/auth/GoogleSignInButton.tsx"),
    read("components/auth/TurnstileChallenge.tsx"),
    read("app/billing/cashfree/CashfreeCheckoutLauncher.tsx"),
  ]);

  assert.doesNotMatch(layout, /next\/script/);
  assert.match(google, /strategy="afterInteractive"/);
  assert.match(turnstile, /strategy="afterInteractive"/);
  assert.match(cashfree, /strategy="afterInteractive"/);
});
