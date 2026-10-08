import { z } from "zod";

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

const emailSchema = z
  .string()
  .trim()
  .min(1, "E-posta adresinizi girin.")
  .pipe(z.email("Geçerli bir e-posta adresi girin."));

const newPasswordSchema = z
  .string()
  .min(PASSWORD_MIN, `Şifre en az ${PASSWORD_MIN} karakter olmalı.`)
  .max(PASSWORD_MAX, `Şifre en fazla ${PASSWORD_MAX} karakter olabilir.`);

const passwordMismatch = { path: ["passwordConfirm"], message: "Şifreler eşleşmiyor." };

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Şifrenizi girin."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Adınızı girin.").max(80, "Ad en fazla 80 karakter olabilir."),
    email: emailSchema,
    password: newPasswordSchema,
    passwordConfirm: z.string().min(1, "Şifrenizi tekrar girin."),
    consent: z.boolean().refine((value) => value, "Devam etmek için onay vermeniz gerekiyor."),
  })
  .refine((data) => data.password === data.passwordConfirm, passwordMismatch);

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({ password: newPasswordSchema, passwordConfirm: z.string().min(1, "Şifrenizi tekrar girin.") })
  .refine((data) => data.password === data.passwordConfirm, passwordMismatch);

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifrenizi girin."),
    newPassword: newPasswordSchema,
    newPasswordConfirm: z.string().min(1, "Yeni şifrenizi tekrar girin."),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    path: ["newPasswordConfirm"],
    message: "Şifreler eşleşmiyor.",
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ["newPassword"],
    message: "Yeni şifre mevcut şifreden farklı olmalı.",
  });
