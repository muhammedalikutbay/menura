import "server-only";
import { env } from "./env";

type Email = { to: string; subject: string; text: string; html?: string };

/** Sends a transactional email through Resend; logs to the console when no key is configured. */
export async function sendEmail(email: Email): Promise<void> {
  if (!env.RESEND_API_KEY) {
    if (env.NODE_ENV === "production") {
      // Bodies can contain password-reset links; never write them to production logs.
      throw new Error("Email delivery is not configured (RESEND_API_KEY is missing).");
    }
    console.info(`[email:dev] to=${email.to} subject="${email.subject}"\n${email.text}`);
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM, ...email }),
  });
  if (!response.ok) {
    throw new Error(`Email delivery failed with status ${response.status}`);
  }
}
