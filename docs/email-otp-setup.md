# Six-digit Email OTP setup

Varadhi Prep uses its own six-digit login codes. The raw code is held only in server memory while Brevo receives the message; the database stores a keyed hash, expiry, attempt count, and rate-limit metadata.

Add these server-only values to Vercel Production and Preview. Do not add a `NEXT_PUBLIC_` prefix and never paste them into chat:

```
BREVO_API_KEY=
CUSTOM_OTP_PEPPER=
TURNSTILE_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CUSTOM_OTP_FROM_EMAIL=no-reply@varadhiprep.in
CUSTOM_OTP_FROM_NAME=Varadhi Prep
```

- Create `BREVO_API_KEY` in Brevo → Transactional → SMTP & API → API Keys. The sender address must be verified in Brevo.
- Generate `CUSTOM_OTP_PEPPER` as a long random secret, for example 32 or more random bytes encoded as text. It cannot be changed casually because it protects active code hashes.
- Copy `TURNSTILE_SECRET_KEY` from Cloudflare Turnstile. It is the secret paired with the existing public site key.
- `SUPABASE_SERVICE_ROLE_KEY` is required only on the server to look up and sign in a verified user. Never expose it to the browser.

Apply the migration `20260824140000_add_custom_six_digit_email_otp.sql` in Supabase before enabling the feature. It creates the secure OTP challenge table and service-only database functions.

Protections included:

- code is exactly 6 digits and expires after 10 minutes
- one request per user per minute
- at most 5 requests per user per hour and 10 per connection per hour
- at most 5 incorrect attempts per code
- Cloudflare Turnstile is validated on the server before any email is sent
- email responses do not disclose whether an account exists
