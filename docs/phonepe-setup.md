# PhonePe PG production setup

The Exam Pass feature uses PhonePe's hosted checkout. It never trusts a browser redirect: access is only granted after a server-side PhonePe order-status check.

Add these **server-only** variables to the Vercel production environment (do not put them in `NEXT_PUBLIC_*` variables and do not paste them into chat):

```
SUPABASE_SERVICE_ROLE_KEY=
PHONEPE_CLIENT_ID=
PHONEPE_CLIENT_SECRET=
PHONEPE_CLIENT_VERSION=
```

Optional endpoints are already set to PhonePe's standard production endpoints. Only set these if PhonePe gives this merchant a different endpoint, such as sandbox credentials:

```
PHONEPE_API_BASE_URL=https://api.phonepe.com/apis/pg
PHONEPE_AUTH_URL=https://api.phonepe.com/apis/identity-manager/v1/oauth/token
```

In the PhonePe merchant dashboard, set the webhook / callback notification URL to:

```
https://varadhiprep.in/api/payments/phonepe/webhook
```

Then:

1. Deploy the database migration and app.
2. In Admin → Exam passes, create a pass, choose the exam it covers, price, and validity days.
3. Make a test draft paid, then publish it. Publishing is blocked if no active Exam Pass covers that exam.
4. Make one PhonePe test payment. Confirm the payment result page shows the pass active, then confirm the paid test starts.

Use PhonePe test credentials first. Do not enable paid tests for students until a test payment succeeds.
