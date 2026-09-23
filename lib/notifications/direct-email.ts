const BREVO_SEND_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";

function getBrevoApiKey(): string | null {
  return process.env.BREVO_API_KEY || null;
}

export function buildDirectAdminEmail({
  recipientName,
  subject,
  message,
  siteName = "Varadhi Prep",
}: {
  recipientName?: string;
  subject: string;
  message: string;
  siteName?: string;
}) {
  const safeName = recipientName?.trim() || "Student";
  const escapedMessage = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const messageParagraphs = escapedMessage
    .split(/\n\s*\n/)
    .map((p) => `<p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 16px;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  const textContent = `Hi ${safeName},

${message.trim()}

Best regards,
Team ${siteName}
https://varadhiprep.in`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased;">
  <div style="max-width:580px;margin:32px auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background-color:#042f2e;padding:24px 32px;text-align:left;">
      <p style="margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5eead4;font-weight:800;">VARADHI PREP · OFFICIAL COMMUNICATION</p>
      <h1 style="margin:8px 0 0;font-size:20px;color:#ffffff;font-weight:800;line-height:1.3;">${subject}</h1>
    </div>

    <div style="padding:32px;">
      <p style="font-size:16px;line-height:1.6;color:#1e293b;margin:0 0 16px;">
        Hi <strong>${safeName}</strong>,
      </p>

      ${messageParagraphs}

      <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e2e8f0;">
        <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">Team ${siteName}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#64748b;">
          Online Test Platform for State and Central Competitive Examinations
        </p>
        <p style="margin:8px 0 0;">
          <a href="https://varadhiprep.in" style="font-size:13px;color:#0f766e;font-weight:600;text-decoration:none;">
            varadhiprep.in
          </a>
        </p>
      </div>
    </div>

    <div style="background-color:#f1f5f9;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="font-size:11px;color:#64748b;margin:0;">
        You received this email because you are a registered student or candidate on ${siteName}.
      </p>
    </div>
  </div>
</body>
</html>
`;

  return { subject, textContent, htmlContent };
}

export type SendDirectEmailParams = {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  message: string;
};

export async function sendDirectUserEmail({
  recipientEmail,
  recipientName,
  subject,
  message,
}: SendDirectEmailParams): Promise<{ success: boolean; message: string }> {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured on the server.");
  }

  const normalizedEmail = recipientEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error("Invalid recipient email address.");
  }

  const trimmedSubject = subject.trim();
  if (!trimmedSubject) {
    throw new Error("Email subject cannot be empty.");
  }

  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    throw new Error("Email message body cannot be empty.");
  }

  const senderEmail = process.env.CUSTOM_OTP_FROM_EMAIL ?? "no-reply@varadhiprep.in";
  const senderName = process.env.CUSTOM_OTP_FROM_NAME ?? "Varadhi Prep";

  const emailContent = buildDirectAdminEmail({
    recipientName,
    subject: trimmedSubject,
    message: trimmedMessage,
  });

  const response = await fetch(BREVO_SEND_EMAIL_URL, {
    method: "POST",
    cache: "no-store",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [
        {
          email: normalizedEmail,
          name: recipientName?.trim() || undefined,
        },
      ],
      subject: emailContent.subject,
      textContent: emailContent.textContent,
      htmlContent: emailContent.htmlContent,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Email sending failed (${response.status}): ${errText}`);
  }

  return {
    success: true,
    message: `Email successfully sent to ${normalizedEmail}!`,
  };
}
