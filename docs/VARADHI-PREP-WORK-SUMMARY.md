# Varadhi Prep — Work Summary

Last updated: 25 August 2026  
Production website: [varadhiprep.in](https://varadhiprep.in)  
Latest production commit: `398e820`

## Purpose

Varadhi Prep is an online mock-test platform for competitive-exam preparation. Students can discover exams, take timed tests, review answers, and track their history. Administrators can organise exams and create, import, edit, publish, and manage mock tests.

## Completed student features

- Public catalogue for states, exams, papers, subjects, and mock tests.
- Permanent, readable public URLs for catalogue and mock-test pages.
- Legacy UUID and older public links redirect to the current canonical page.
- Search-engine metadata, canonical URLs, Open Graph sharing data, structured breadcrumbs, and sitemap coverage for public pages.
- Password registration, sign-in, email confirmation, password recovery, and cross-device reset links.
- Six-digit email-code sign-in, sent through Brevo after the registered email address passes security verification.
- Cloudflare Turnstile protection on public authentication forms.
- Clear loading, pending, error, retry, and timeout feedback across student and admin flows.
- Timed mock tests with start, resume, pause, retake, submission, result, and answer-review flows.
- Question images in tests and reviews, including image enlargement for readability.
- Mobile improvements, including stable navigation and visible question totals during a test.
- Student test-history summaries and retained result/review data.
- Official support contact links using `support@varadhiprep.in`.

## Completed administrator features

- Admin MFA protection and role-based access controls.
- Management of states, exam categories, exams, specialisations, papers, subjects, and mock tests.
- Editable SEO titles, descriptions, and related metadata for catalogue entries.
- Free/paid setting for each mock test.
- Mock-test question workspace: **Mock Tests → selected Mock Test → Questions**.
- Add, search, edit, remove, import, replace, and export questions for an individual draft mock test.
- Excel/CSV imports, including image URLs and embedded Excel images.
- Question-image upload and editing.
- Export a mock test's questions in the same format accepted by the import process.
- Target question count for mock tests, safe filling of remaining slots, and duplicate prevention.
- Safe question handling: questions used in student attempts cannot be permanently deleted, protecting past results and reviews.
- Preserved filters when returning to Question Bank or Mock Test management after editing.

## Question and result safety rules

- Removing a question from a mock test does not automatically delete it from the Question Bank.
- A question used in a published test or student attempt is retained for result accuracy.
- Mock tests with student attempts protect the questions and core assessment data required for those attempts.
- Draft mock tests support controlled imports, edits, and replacements before publishing.

## Email configuration

Two email flows are used:

| Purpose | Delivery system | Intended sender |
| --- | --- | --- |
| Six-digit sign-in code | Varadhi server → Brevo API | `no-reply@varadhiprep.in` |
| Password reset and email confirmation | Supabase Auth → Brevo SMTP | `no-reply@varadhiprep.in` |

`no-reply@varadhiprep.in` should remain a verified Brevo sender. Cloudflare Email Routing forwards mail sent to that address to `varadhiprep@gmail.com`, allowing Brevo sender-verification messages to be received.

Private Vercel variables required for six-digit sign-in are:

```text
BREVO_API_KEY
CUSTOM_OTP_PEPPER
TURNSTILE_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY
CUSTOM_OTP_FROM_EMAIL=no-reply@varadhiprep.in
CUSTOM_OTP_FROM_NAME=Varadhi Prep
```

Do not put these values in source code, Git, browser code, or chat.

## Payments: prepared, not yet live

The platform contains an Exam Pass payment foundation using PhonePe hosted checkout:

1. An administrator creates an Exam Pass with a price, duration, and covered exam.
2. A student signs in and purchases the pass through PhonePe.
3. The server independently checks the final PhonePe payment status.
4. Only a confirmed payment grants access to paid mock tests covered by that pass.
5. Referral codes can apply discounts, free access, or additional validity days.

Paid tests should remain unavailable to students until PhonePe onboarding is approved, production credentials are added, the callback URL is configured, and a real test payment succeeds.

PhonePe callback URL:

```text
https://varadhiprep.in/api/payments/phonepe/webhook
```

Required private Vercel variables for PhonePe:

```text
PHONEPE_CLIENT_ID
PHONEPE_CLIENT_SECRET
PHONEPE_CLIENT_VERSION
SUPABASE_SERVICE_ROLE_KEY
```

## Latest authentication wording

- Password option: **Sign in to continue**
- Email-code option: **Sign in using a six-digit email code**
- OTP action: **Send sign-in code**
- Password recovery action: **Send password reset email**

## Validation completed on 25 August 2026

- TypeScript check passed.
- Lint check passed.
- All 24 automated regression tests passed.
- Production build passed.
- Public production pages returned HTTP 200: homepage, login, mock-test catalogue, and password recovery.

## Recommended next actions

1. Test a real six-digit email-code sign-in and a real password-reset email from `no-reply@varadhiprep.in`.
2. Finish PhonePe merchant onboarding and complete one small real payment before enabling paid mock tests.
3. Add high-quality exam content, syllabus details, FAQs, and free-test links for Telangana Police Constable and Executive Officer pages.
4. Monitor Google Search Console for indexing, sitemap status, and search terms.
5. Regularly export question files and keep a secure copy of essential database data.

## Selected delivered changes

| Commit | Work |
| --- | --- |
| `2aa1de2` | Custom six-digit email-code sign-in |
| `5a61110` | Reliable session cookie after email-code sign-in |
| `39944e0` | PhonePe Exam Pass foundation |
| `9c2a16e` | Manage questions inside an individual mock test |
| `f994769` | Search questions within a mock test |
| `5724c81` | Permanent SEO-friendly public URLs |
| `e8e876f` | Editable SEO metadata |
| `63ff01a` | Site-wide loading and interaction feedback |
| `59df714` | Embedded Excel question-image imports |
| `7e26c2f` | Mock-test question export |
| `db56873` | Published Varadhi Prep search/logo asset |
| `398e820` | Latest production redeployment |
