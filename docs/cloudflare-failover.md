# Cloudflare Workers Production Deployment & Failover Architecture

## 1. Overview
Varadhi Prep (`varadhiprep.in`) was migrated from Vercel to **Cloudflare Workers (via OpenNext)** after Vercel plan limits (serverless function execution GB-hours) were exhausted, which caused React minified error #441.

* **Primary Hosting:** Cloudflare Workers (OpenNext)
* **Live Domain:** `https://varadhiprep.in` & `https://www.varadhiprep.in`
* **Cloudflare Account ID:** `d3702f7db169467c175de56b30355997` (Markettalkstelugumtt@gmail.com's Account)
* **Cloudflare Zone ID:** `43742526167f2e898a1637485d0621ad`
* **Worker Name:** `varadhi`
* **Fallback URL:** `https://varadhi.kodidalanani.workers.dev`

---

## 2. Key Architecture Details

### Database & State
* All user accounts, 2,600+ test attempts, score reviews, questions, and surveys live in **Supabase PostgreSQL** (`https://eauomwkwaxqpvzogdltq.supabase.co`).
* The database is completely independent of the hosting provider.

### DNS & Custom Domains
* Managed directly in Cloudflare under account `d3702f7db169467c175de56b30355997`.
* `varadhiprep.in` and `www.varadhiprep.in` are connected natively as **Custom Domains** on the `varadhi` Worker.
* Do not add manual A or CNAME records for `@` or `www` in DNS; Cloudflare Workers manages its own DNS binding.

### Required Environment Variables
* **Public Variables (`wrangler.jsonc`):**
  * `NEXT_PUBLIC_SUPABASE_URL`: `https://eauomwkwaxqpvzogdltq.supabase.co`
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon key
  * `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: Turnstile site key
  * `CASHFREE_ENV`: `production`
* **Encrypted Secrets (In Cloudflare Worker runtime / not committed to Git):**
  * `SUPABASE_SERVICE_ROLE_KEY`: Required for Email OTP (`createAdminClient()`), test attempt reviews, and dynamic survey counts.
  * `TURNSTILE_SECRET_KEY`: Server-side secret paired with Cloudflare Turnstile widget for human verification.
  * `CUSTOM_OTP_PEPPER`: Server-side HMAC secret for secure 6-digit OTP code challenge hashes.
  * `CASHFREE_APP_ID`: Production Cashfree App ID (in `vars`).
  * `CASHFREE_SECRET_KEY`: Production Cashfree Secret Key (in `vars`).
  * `BREVO_API_KEY`: Production Brevo API Key for transactional OTP emails (in `vars`).

---

## 3. How to Build & Deploy Updates

To deploy new code changes to production:

```bash
# 1. Build the OpenNext Cloudflare bundle
npm run build:worker

# 2. Deploy to Cloudflare Workers using the API token
$env:CLOUDFLARE_API_TOKEN="<CLOUDFLARE_API_TOKEN>"; npx wrangler deploy
```
