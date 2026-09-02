"use server";

export async function submitSurveyToCloudflare(prevState: any, formData: FormData) {
  const exam = formData.get("exam")?.toString() || "";
  const preference = formData.get("preference")?.toString() || "";
  const suggestion = formData.get("suggestion")?.toString() || "";

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const dbId = process.env.CLOUDFLARE_D1_DB_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !dbId || !token) {
    console.error("Cloudflare credentials missing in .env.local");
    return { error: "Server configuration error. Please contact support." };
  }

  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sql: "INSERT INTO surveys (exam, mock_preference, suggestion) VALUES (?, ?, ?)",
        params: [exam, preference, suggestion]
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Cloudflare D1 Error:", errorText);
      return { error: "Failed to save survey. Please try again." };
    }

    return { success: true };
  } catch (err) {
    console.error("Survey submission error:", err);
    return { error: "An unexpected error occurred." };
  }
}
