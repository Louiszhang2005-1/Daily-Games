import "server-only";

// Emails the owner when generation falls back to the backup bank (via Resend).
// Without RESEND_API_KEY / ALERT_EMAIL_TO the alert is only logged.
export async function alertOwner(subject: string, body: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL_TO;
  console.warn(`[alert] ${subject}\n${body}`);
  if (!key || !to) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({ from: process.env.ALERT_EMAIL_FROM || "Daily Games <alerts@resend.dev>", to: [to], subject, text: body }),
    });
    if (!res.ok) console.error("alert email failed", res.status, await res.text());
  } catch (err) {
    console.error("alert email failed", err);
  }
}
