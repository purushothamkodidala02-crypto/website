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

A new mock test has just been uploaded for ${examName} on ${siteName}!

📝 ${testTitle}
• ⏱ Duration: ${durationMinutes} minutes
• 📝 Questions: ${questionCount}

Attempt this latest test in real examination mode to benchmark your preparation, check your statewide percentile rank, and review detailed question-wise explanations:

👉 Start your test:
${testUrl}

Key Highlights:
✓ Real exam simulation with official countdown timer
✓ Instant result analytics & statewide rank
✓ Step-by-step explanations for all questions

All the best for your preparation!
Team ${siteName}
https://varadhiprep.in`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:580px;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;box-shadow:0 8px 20px -4px rgba(15,23,42,0.08);">
          
          <!-- Brand Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #042f2e 0%, #0f766e 100%);padding:32px 36px;text-align:left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="display:inline-block;background-color:rgba(94,234,212,0.18);border:1px solid rgba(94,234,212,0.35);color:#5eead4;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;padding:4px 10px;border-radius:20px;">
                      🔥 NEW PRACTICE PAPER LIVE
                    </span>
                    <h1 style="margin:12px 0 0;font-size:24px;color:#ffffff;font-weight:800;line-height:1.25;letter-spacing:-0.02em;">
                      New Mock Test Published!
                    </h1>
                    <p style="margin:6px 0 0;font-size:13px;color:#ccfbf1;font-weight:500;">
                      ${examName} · Practice on ${siteName}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding:32px 36px;">
              <p style="font-size:16px;line-height:1.6;color:#1e293b;margin:0 0 16px;">
                Hi <strong>${safeName}</strong>,
              </p>

              <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 24px;">
                A brand-new mock test has been added for your target examination <strong>${examName}</strong>. Benchmark your preparation, practice under real examination pressure, and check your rank among candidates across Telangana and Andhra Pradesh:
              </p>

              <!-- Test Card Box -->
              <div style="background-color:#f0fdfa;border:1.5px solid #a7f3d0;border-radius:14px;padding:22px;margin:0 0 26px;">
                <span style="display:inline-block;background-color:#0f766e;color:#ffffff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:6px;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">
                  Latest Exam Pattern
                </span>
                <h2 style="font-size:19px;color:#042f2e;margin:4px 0 14px;font-weight:800;line-height:1.35;">
                  ${testTitle}
                </h2>
                
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:12px;border-top:1px dashed #99f6e4;padding-top:12px;">
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#334155;font-weight:600;">
                      ⏱ Duration: <span style="color:#0f766e;font-weight:700;">${durationMinutes} mins</span>
                    </td>
                    <td style="padding:6px 0;font-size:14px;color:#334155;font-weight:600;text-align:right;">
                      📝 Questions: <span style="color:#0f766e;font-weight:700;">${questionCount}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Main Call To Action Button -->
              <div style="text-align:center;margin:28px 0 24px;">
                <a href="${testUrl}" style="display:inline-block;background:linear-gradient(135deg, #0f766e 0%, #042f2e 100%);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:15px 36px;border-radius:12px;box-shadow:0 4px 12px rgba(15,118,110,0.3);letter-spacing:0.01em;">
                  👉 Start Mock Test Now
                </a>
              </div>

              <!-- Why Take Test Highlights -->
              <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin:24px 0 0;">
                <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">
                  What you get with this test:
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding:3px 0;font-size:13px;color:#475569;line-height:1.4;">
                      ⚡ <strong>Real exam interface:</strong> Timed practice with negative marking simulation
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:3px 0;font-size:13px;color:#475569;line-height:1.4;">
                      📊 <strong>Instant statewide percentile:</strong> Compare your score with top aspirants
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:3px 0;font-size:13px;color:#475569;line-height:1.4;">
                      💡 <strong>Detailed explanations:</strong> Comprehensive solutions for every single question
                    </td>
                  </tr>
                </table>
              </div>

              <p style="font-size:14px;color:#64748b;line-height:1.5;margin:24px 0 0;text-align:center;">
                All the best for your examination preparation!
                <br>
                <strong style="color:#0f172a;">Team ${siteName}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:22px 36px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
                You received this alert because you are a registered student practicing ${examName} tests on ${siteName}.
              </p>
              <p style="margin:8px 0 0;font-size:12px;">
                <a href="https://varadhiprep.in" style="color:#0f766e;font-weight:600;text-decoration:none;">
                  Visit Varadhi Prep
                </a>
                <span style="color:#cbd5e1;margin:0 8px;">·</span>
                <a href="${testUrl}" style="color:#0f766e;font-weight:600;text-decoration:none;">
                  Take Test
                </a>
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#94a3b8;">
                © ${new Date().getFullYear()} ${siteName} · State Competitive Examination Preparation Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, textContent, htmlContent };
}
