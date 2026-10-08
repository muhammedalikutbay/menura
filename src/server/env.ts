import "server-only";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  APP_URL: z.url().default("http://localhost:3000"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Menura <noreply@menura.app>"),
  /** Development only: "console" enables email flows and prints messages instead of sending. */
  EMAIL_TRANSPORT: z.enum(["resend", "console"]).optional(),
});

// Netlify exposes the site URL as URL; use it when APP_URL is not set explicitly.
const parsed = schema.safeParse({ ...process.env, APP_URL: process.env.APP_URL || process.env.URL || undefined });
if (!parsed.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
}

const isBuild = process.env.NEXT_PHASE === "phase-production-build";
if (parsed.data.NODE_ENV === "production" && !isBuild) {
  for (const key of ["DATABASE_URL", "BETTER_AUTH_SECRET"] as const) {
    if (!process.env[key]) throw new Error(`${key} must be set in production.`);
  }
  if (!process.env.APP_URL && !process.env.URL) throw new Error("APP_URL must be set in production.");
}

export const env = {
  ...parsed.data,
  /** Public base URL without a trailing slash; used for QR codes and emails. */
  APP_URL: parsed.data.APP_URL.replace(/\/$/, ""),
  isEmailEnabled:
    Boolean(parsed.data.RESEND_API_KEY) ||
    (parsed.data.NODE_ENV !== "production" && parsed.data.EMAIL_TRANSPORT === "console"),
  /** Production requires a real secret (checked above); dev, test and build use a fixed placeholder. */
  authSecret: parsed.data.BETTER_AUTH_SECRET ?? "menura-insecure-dev-secret-do-not-use-in-production",
};
