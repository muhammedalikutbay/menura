import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail } from "./email";
import { env } from "./env";

export const auth = betterAuth({
  appName: "Menura",
  baseURL: env.APP_URL,
  secret: env.authSecret,
  telemetry: { enabled: false },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      rateLimit: schema.rateLimit,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    // With an email provider configured, accounts must prove they own the address
    // (prevents signing up with someone else's email). Without one, sign-up stays instant.
    requireEmailVerification: env.isEmailEnabled,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Menura şifre sıfırlama",
        text: `Merhaba ${user.name},\n\nŞifreni sıfırlamak için bu bağlantıyı aç (1 saat geçerli):\n${url}\n\nBu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: env.isEmailEnabled,
    sendOnSignIn: env.isEmailEnabled,
    autoSignInAfterVerification: true,
    expiresIn: 24 * 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Menura e-posta doğrulama",
        text: `Merhaba ${user.name},\n\nMenura hesabını etkinleştirmek için bu bağlantıyı aç (24 saat geçerli):\n${url}\n\nBu kaydı sen yapmadıysan bu e-postayı yok sayabilirsin.`,
      });
    },
  },
  user: {
    deleteUser: { enabled: true },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
    // Deleting the account without re-entering the password needs a session younger than this.
    freshAge: 10 * 60,
  },
  rateLimit: {
    // E2E runs a production build and signs up repeatedly; it opts out explicitly.
    enabled: process.env.NODE_ENV === "production" && process.env.E2E !== "1",
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 300, max: 3 },
    },
  },
  advanced: {
    useSecureCookies: env.APP_URL.startsWith("https://"),
    // Netlify sets x-nf-client-connection-ip to the real client; fall back to common proxies.
    ipAddress: { ipAddressHeaders: ["x-nf-client-connection-ip", "x-real-ip", "x-forwarded-for"] },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
