# Varadhi Prep — Full Project Report

**Report date:** 25 August 2026  
**Website:** [https://varadhiprep.in](https://varadhiprep.in)  
**Latest recorded production commit:** `4f284eb`  
**Purpose:** A complete record of the current platform, delivered features, operating setup, and recommended future work.

---

## 1. Project overview

Varadhi Prep is a web-based competitive-exam preparation platform. It enables students to discover relevant examinations, practise mock tests, receive scored results, and review every answer. It gives administrators a controlled workspace to organise examination content and build mock tests without losing student history.

The current platform supports Telangana, Andhra Pradesh, and Central examination catalogues, and is designed so future states and examinations can be added by an administrator without creating new hard-coded website pages.

### Primary goals

- Provide a reliable, mobile-friendly mock-test experience.
- Let administrators manage question content safely and independently.
- Build search visibility using permanent, descriptive URLs and strong SEO metadata.
- Protect student accounts, results, and assessment history.
- Support both free tests and future paid access by examination.

---

## 2. Technology and hosting

| Area | Current service / technology | Purpose |
| --- | --- | --- |
| Website | Next.js | Student, public, and administrator web application |
| Database | Supabase PostgreSQL | Content, users, mock tests, attempts, results, and access records |
| Authentication | Supabase Auth | Password login, email confirmation, password reset, and authenticated sessions |
| Six-digit email login | Varadhi server + Brevo API | Secure custom sign-in code delivery |
| Email delivery | Brevo | Transactional email sender and SMTP provider |
| Human-verification | Cloudflare Turnstile | Protects login, registration, recovery, and OTP requests |
| DNS and email routing | Cloudflare | Domain DNS, routing, and mailbox forwarding |
| Website hosting | Vercel | Production website hosting and server execution |
| Source control | GitHub | Version history and production deployments |
| Payments | PhonePe Payment Gateway | Prepared Exam Pass checkout; not enabled until onboarding is complete |

---

## 3. User roles

### Public visitor

- Browse states, examinations, papers, subjects, and public mock-test listings.
- Read SEO content, test information, and support details.
- Register or sign in.

### Student

- Sign in with password or a six-digit email code.
- Start, pause, resume, retake, and submit mock tests.
- View results, answer review, question images, and test history.
- Use free tests immediately.
- Purchase an Exam Pass after PhonePe is enabled.

### Administrator

- Manage the exam catalogue.
- Create, edit, import, export, search, publish, and manage questions and mock tests.
- Configure question count, free/paid availability, SEO information, and access products.
- Review student results and safely protect retained history.

---

## 4. Delivered public and student features

### 4.1 Examination catalogue and navigation

- State-based catalogue structure.
- Examination, specialisation, paper, subject, and mock-test levels.
- Mobile-friendly left-side navigation opened from the menu button.
- Home item included in the mobile navigation.
- Stable navigation controls designed to avoid layout movement.
- Support contact links using `support@varadhiprep.in`.

### 4.2 SEO and Google readiness

- Permanent, readable URLs instead of public database UUID links.
- Example structure:

  ```text
  /mock-tests/telangana
  /mock-tests/telangana/executive-officer
  /mock-tests/telangana/executive-officer/paper-1
  /mock-tests/telangana/executive-officer/paper-1/mock-test-01
  ```

- Automatic slug generation for future catalogue entries.
- Administrator-editable, stable slugs.
- Historic UUID/query links redirect to the current canonical public URL.
- Previous slugs redirect after a future slug change.
- Page-specific titles, descriptions, canonical URLs, Open Graph metadata, Twitter metadata, breadcrumbs, and sitemap entries.
- Invalid public slugs return a proper 404 response.
- Public sharing imagery and Varadhi Prep branding have been prepared for search and sharing.

### 4.3 Student accounts and security

- Password registration and login.
- Email confirmation and password recovery.
- Password reset flow that works across devices.
- Six-digit email-code sign-in as an alternative to password sign-in.
- Cloudflare Turnstile verification for account-related forms.
- Pending states, disabled buttons, readable failure messages, and timeout messages.
- Administrator MFA requirement and role-sensitive protections.

### 4.4 Mock-test experience

- Start, pause, resume, and retake flows.
- Timed test sessions.
- Clear first-time test start behaviour.
- Submission safeguards that reduce duplicate submissions.
- Results page and answer review.
- Stable answer-review controls.
- Student attempt history and lifetime summaries.
- Mobile display of total question numbers during the test.
- Loading feedback throughout test navigation and submission.

### 4.5 Question presentation

- English and Telugu question support.
- Improved Assertion–Reason display format.
- Improved matching-question format.
- Question images in student attempts and answer review.
- Image enlargement / zoom for small or difficult-to-read images.
- Compatible image support for URL images and embedded Excel images.

---

## 5. Delivered administrator features

### 5.1 Catalogue management

- Create and edit examination categories, exams, specialisations, papers, and subjects.
- Controlled sorting and activation status.
- Custom SEO title, description, and other search metadata fields.
- Custom slugs with uniqueness and reserved-route protections.

### 5.2 Mock-test management

- Create draft mock tests and publish them when ready.
- Set a mock test as free or paid.
- Set target question counts.
- Full-paper tests can use a configured paper count; subject tests can have their own count.
- Preserve admin filters when returning from an edit screen.
- Download a mock test's questions as an Excel file in the accepted import format.
- Search questions within a selected mock test.

### 5.3 Question workspace

The main operating path is:

```text
Admin → Mock Tests → Selected Mock Test → Questions
```

Inside a draft mock test, the administrator can:

- Add individual questions.
- Search assigned questions.
- Edit a question for that mock test.
- Remove a question from that mock test.
- Import new questions from Excel/CSV.
- Replace the full question set before the test is published or attempted.
- Add questions without replacing existing ones.
- Fill remaining slots using latest eligible questions.
- Export the question set.

### 5.4 Question imports and images

- Excel and CSV question imports.
- Question image URLs.
- Embedded image extraction from Excel.
- Admin image upload and editing.
- Duplicate prevention and import-key support for corrections.
- Import validation and readable row-level failure messages.

### 5.5 Data-protection rules

- Removing a question from a mock test only removes the assignment; it does not automatically delete the Question Bank entry.
- Published tests and student attempts retain the required question and answer history.
- Questions used by students cannot be permanently deleted in a way that damages results or answer reviews.
- A question can be made unavailable for future tests while retained historic records remain intact.
- Mock-test changes after student attempts are restricted to protect results.

---

## 6. Email operation

### 6.1 Intended email identity

All student-facing authentication mail should use:

```text
From name: Varadhi Prep
From email: no-reply@varadhiprep.in
```

### 6.2 Email types

| Email type | System that sends it | Required setting |
| --- | --- | --- |
| Six-digit sign-in code | Varadhi server through Brevo API | Vercel custom sender variables |
| Password reset | Supabase Auth through Brevo SMTP | Supabase SMTP sender email/name |
| Registration confirmation | Supabase Auth through Brevo SMTP | Supabase SMTP sender email/name |

### 6.3 Mailbox routing

Cloudflare Email Routing should forward:

```text
no-reply@varadhiprep.in → varadhiprep@gmail.com
```

This allows Brevo sender-verification messages for the no-reply address to reach the administrator's Gmail inbox. It does **not** mean Gmail sends student emails; Brevo sends the student emails.

### 6.4 Required private Vercel variables for six-digit login

```text
BREVO_API_KEY
CUSTOM_OTP_PEPPER
TURNSTILE_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY
CUSTOM_OTP_FROM_EMAIL=no-reply@varadhiprep.in
CUSTOM_OTP_FROM_NAME=Varadhi Prep
```

No secret value should be stored in source code, shared in chat, or exposed through a `NEXT_PUBLIC_` environment variable.

---

## 7. Payments and paid access

### 7.1 Designed access model

Varadhi Prep uses an **Exam Pass** model.

- An administrator creates a pass for one examination.
- The pass has a price and validity period.
- A paid mock test is linked to an examination.
- A student with an active pass can access every paid mock test belonging to that examination until the pass expires.
- Free tests remain available without a pass.

This gives students a simple purchase decision and avoids selling each mock test separately.

### 7.2 Referral support

Referral codes can be configured for:

- Percentage discount.
- Fixed-amount discount.
- Free Exam Pass.
- Extra validity days.
- Usage limits and expiry dates.

### 7.3 Secure payment flow

1. Student signs in and chooses an Exam Pass.
2. The server creates an internal payment order.
3. Student is taken to PhonePe hosted checkout.
4. Student completes or cancels payment on PhonePe.
5. Varadhi Prep checks the payment status directly with PhonePe.
6. Only a confirmed payment creates the student's pass access.
7. A failed, cancelled, or unconfirmed payment grants no paid-test access.

The server does not trust a browser redirect alone. This prevents a forged redirect from unlocking paid tests.

### 7.4 Status

Payment code is prepared, but **paid tests must not be enabled yet**. First complete PhonePe merchant onboarding, production configuration, and a real test payment.

PhonePe callback URL:

```text
https://varadhiprep.in/api/payments/phonepe/webhook
```

Required private Vercel variables:

```text
PHONEPE_CLIENT_ID
PHONEPE_CLIENT_SECRET
PHONEPE_CLIENT_VERSION
SUPABASE_SERVICE_ROLE_KEY
```

---

## 8. Quality, safety, and reliability work

- Shared loading components and top navigation progress feedback.
- Pending button labels such as “Saving…”, “Importing questions…”, “Submitting test…”, and “Deleting…”.
- Buttons are disabled while their action is running.
- Timeout messages appear for unusually slow operations.
- Loading feedback includes accessible status roles and live announcements.
- Regression coverage includes pending buttons, duplicate-submission prevention, route loading, errors, accessibility, SEO routes, question handling, imports, image display, and attempt protection.
- Production content security policy improvements and nonce hydration fixes.
- SQL and access-control review work is included in the production hardening history.

---

## 9. Current validation status

The following checks passed on 25 August 2026:

- TypeScript validation.
- ESLint validation.
- All 24 automated regression tests.
- Production build.
- Public HTTP availability checks for the homepage, login, mock-test catalogue, and password recovery page.

The following need real external confirmation whenever settings change:

- A new six-digit email-code login email arrives from `no-reply@varadhiprep.in`.
- A password-reset email arrives from `no-reply@varadhiprep.in`.
- PhonePe has approved the merchant account and a real payment succeeds.

---

## 10. Recommended future roadmap

### Priority 1 — Complete launch configuration

1. Confirm Brevo sender verification for `no-reply@varadhiprep.in`.
2. Confirm Supabase SMTP sender email/name use the same no-reply address.
3. Test six-digit email-code sign-in on mobile and desktop.
4. Test password-reset delivery on mobile and desktop.
5. Finish PhonePe onboarding and run one small real payment before turning on paid mock tests.

### Priority 2 — Grow search traffic and student value

1. Strengthen Telangana Police Constable and Executive Officer pages with:
   - Clear exam introduction.
   - Syllabus and paper details.
   - Free mock-test links.
   - Frequently asked questions.
   - FAQ structured data.
2. Create equivalent content pages for each important new exam.
3. Use Google Search Console to monitor indexing, sitemap health, and search terms.
4. Improve titles/descriptions using actual student search queries.

### Priority 3 — Student engagement

1. Bookmarked questions and revision lists.
2. Better performance analytics by subject, topic, accuracy, and time spent.
3. Practice recommendations based on weak areas.
4. Optional study streaks and preparation reminders.
5. Test explanations and learning notes where content is available.

### Priority 4 — Administration and operations

1. More detailed import preview before publishing a large question set.
2. Content version notes for corrected questions.
3. Administrator activity log for important content changes.
4. Scheduled exports/backups of question data and important records.
5. Monitoring for failed email sends, payment failures, and application errors.

### Priority 5 — Scale and resilience

1. Confirm database and storage usage regularly against free-plan limits.
2. Keep a documented database recovery/export routine.
3. Consider Cloudflare R2 for large question-image storage if storage usage increases.
4. Consider a paid hosting/database plan only when real traffic or storage requires it.
5. Maintain a separate recovery project/export plan for emergencies.

---

## 11. Selected implementation history

| Commit | Delivered work |
| --- | --- |
| `8a6bf8d` | Correct Assertion–Reason question formatting |
| `81e56d8` | Question images in imports and mock tests |
| `8f0964c` | Public navigation changed to mobile sidebar |
| `b50b2ca` | Page review and SEO strengthening |
| `db56873` | Varadhi Prep search/logo asset publication |
| `7e26c2f` | Mock-test question export |
| `63ff01a` | Site-wide loading and interaction feedback |
| `5724c81` | Permanent SEO-friendly public URLs |
| `e8e876f` | Editable SEO metadata |
| `0d9edd7` | Safe mock-test question management |
| `59df714` | Embedded Excel image support |
| `2a114fe` | Admin free/paid mock-test control |
| `9c2a16e` | Questions managed inside an individual mock test |
| `f994769` | Search within selected mock-test questions |
| `39944e0` | PhonePe Exam Pass foundation |
| `2aa1de2` | Custom six-digit email-code login |
| `5a61110` | Reliable session persistence after email-code login |
| `f4671b1` | Professional authentication wording |
| `4f284eb` | Initial concise project handover summary |

---

## 12. Important operating rules

- Never share API keys, SMTP passwords, Supabase service keys, OTP pepper, or PhonePe secrets in chat, GitHub, Excel files, or public documents.
- Keep paid tests disabled until a genuine PhonePe test payment is confirmed.
- Do not permanently delete questions that have been used in student attempts.
- Export important question sets before large replacements.
- Keep email DNS authentication records in place when changing DNS providers.
- Make new public content pages with meaningful text; URLs alone are not enough to rank well in Google.

---

## 13. Supporting documents

- `docs/VARADHI-PREP-WORK-SUMMARY.md` — concise handover summary.
- `docs/email-otp-setup.md` — six-digit email-code technical setup.
- `docs/phonepe-setup.md` — PhonePe production setup checklist.
- `docs/SECURITY-LAUNCH-CHECKLIST.md` — security and launch review checklist.

