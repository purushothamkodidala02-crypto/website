# Email OTP sign-in setup

Varadhi Prep sends Email OTPs through Supabase Auth using the existing Brevo SMTP configuration. Password sign-in remains available.

Before enabling this feature in production, open **Supabase Dashboard → Authentication → Email Templates → Magic Link** and replace the email body with a branded message that includes the one-time code:

```html
<h2>Your Varadhi Prep sign-in code</h2>
<p>Use this code to sign in:</p>
<p style="font-size:28px;font-weight:700;letter-spacing:6px">{{ .Token }}</p>
<p>This code expires automatically. Do not share it with anyone.</p>
```

The Magic Link template controls passwordless email delivery. `{{ .Token }}` is required for the 6-digit code; do not use only `{{ .ConfirmationURL }}`.

Keep **Captcha protection** enabled in Supabase Auth. Set the authentication rate limits deliberately:

- OTP resend cooldown: at least 60 seconds
- OTP requests: start at 10 per hour per project/IP
- OTP verification: retain Supabase defaults unless there is evidence users need a change

Brevo should stay configured as the custom SMTP sender, with a verified Varadhi Prep sender address. Never expose SMTP credentials in the website or repository.
