export function formatMockTestNotificationSubject({
  examName,
  testTitle,
  siteName = "Varadhi Prep",
}: {
  examName: string;
  testTitle: string;
  siteName?: string;
}): string {
  const trimmedExam = examName.trim();
  const trimmedTitle = testTitle.trim();
  const titleIncludesExam = trimmedTitle.toLowerCase().startsWith(trimmedExam.toLowerCase());
  const mainPart = titleIncludesExam ? trimmedTitle : `${trimmedExam} - ${trimmedTitle}`;
  return `🎯 New Mock Test Live: ${mainPart} | ${siteName}`;
}

export function buildMockTestNotificationEmail({
  studentName,
  examName,
  testTitle,
  testUrl,
  durationMinutes,
  questionCount,
  siteName = "Varadhi Prep",
}: {
  studentName: string;
  examName: string;
  testTitle: string;
  testUrl: string;
  durationMinutes: number;
  questionCount: number;
  siteName?: string;
}) {
  const safeName = studentName.trim() || "Student";
  const subject = formatMockTestNotificationSubject({ examName, testTitle, siteName });

  const textContent = `Hi ${safeName},

A new mock test has just been uploaded for ${examName} on ${siteName}:

${testTitle}
• Duration: ${durationMinutes} minutes
• Questions: ${questionCount}

You previously practiced ${examName} tests on ${siteName}. Attempt this latest test to benchmark your preparation and check your state rank:

${testUrl}

All the best,
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
    <div style="background-color:#042f2e;padding:28px 32px;text-align:left;">
      <p style="margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5eead4;font-weight:800;">VARADHI PREP · EXAM ALERT</p>
      <h1 style="margin:8px 0 0;font-size:22px;color:#ffffff;font-weight:800;line-height:1.3;">New Mock Test Published</h1>
    </div>

    <div style="padding:32px;">
      <p style="font-size:16px;line-height:1.6;color:#1e293b;margin:0 0 16px;">
        Hi <strong>${safeName}</strong>,
      </p>

      <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 24px;">
        A brand new mock test has been added for your target exam <strong>${examName}</strong>. Since you previously practiced tests for this exam on ${siteName}, this is ready for you to take right now:
      </p>

      <div style="background-color:#f0fdfa;border:1px solid #ccfbf1;border-radius:12px;padding:20px;margin:0 0 28px;">
        <span style="display:inline-block;background-color:#0f766e;color:#ffffff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">
          Latest Pattern Test
        </span>
        <h2 style="font-size:18px;color:#0f766e;margin:6px 0 12px;font-weight:700;line-height:1.4;">
          ${testTitle}
        </h2>
        <table style="width:100%;border-collapse:collapse;margin-top:8px;">
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#475569;"><strong>⏱ Duration:</strong> ${durationMinutes} mins</td>
            <td style="padding:4px 0;font-size:13px;color:#475569;"><strong>📝 Questions:</strong> ${questionCount}</td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;margin:32px 0 24px;">
        <a href="${testUrl}" style="display:inline-block;background-color:#0f766e;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:10px;box-shadow:0 2px 4px rgba(15,118,110,0.2);">
          👉 Start Mock Test Now
        </a>
      </div>

      <p style="font-size:13px;color:#64748b;line-height:1.5;margin:24px 0 0;text-align:center;">
        Practice in real exam-timed conditions, get instant analytics, and view your statewide percentile.
      </p>
    </div>

    <div style="background-color:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
        You received this email because you previously attempted or registered for ${examName} tests on ${siteName}.
        <br>
        <a href="https://varadhiprep.in" style="color:#0f766e;text-decoration:underline;">Visit Varadhi Prep</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, textContent, htmlContent };
}
