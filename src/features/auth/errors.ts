/** Shape of the `error` object returned by the Better Auth client. */
export type AuthClientError = { code?: string; status?: number; message?: string } | null | undefined;

export const GENERIC_AUTH_ERROR = "Bir sorun oluştu. Lütfen tekrar deneyin.";
export const RATE_LIMIT_MESSAGE = "Çok fazla deneme yaptınız, lütfen biraz bekleyin.";

const EXPIRED_LINK = "Bu bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir bağlantı isteyin.";
const STALE_SESSION = "Oturumunuz zaman aşımına uğradı. Çıkış yapıp yeniden giriş yapın.";
const ACCOUNT_EXISTS = "Bu e-posta adresiyle zaten bir hesap var. Giriş yapmayı deneyin.";

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "E-posta veya şifre hatalı.",
  USER_NOT_FOUND: "E-posta veya şifre hatalı.",
  INVALID_PASSWORD: "Şifre hatalı.",
  INVALID_EMAIL: "Geçerli bir e-posta adresi girin.",
  USER_ALREADY_EXISTS: ACCOUNT_EXISTS,
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: ACCOUNT_EXISTS,
  PASSWORD_TOO_SHORT: "Şifre en az 8 karakter olmalı.",
  PASSWORD_TOO_LONG: "Şifre en fazla 128 karakter olabilir.",
  INVALID_TOKEN: EXPIRED_LINK,
  TOKEN_EXPIRED: EXPIRED_LINK,
  SESSION_EXPIRED: STALE_SESSION,
  SESSION_NOT_FRESH: STALE_SESSION,
  CREDENTIAL_ACCOUNT_NOT_FOUND: "Bu hesapta şifre tanımlı değil.",
  EMAIL_NOT_VERIFIED: "E-posta adresiniz doğrulanmamış.",
};

/** Turkish message for a Better Auth client error. Unknown errors get `fallback`. */
export function authErrorMessage(error: AuthClientError, fallback: string = GENERIC_AUTH_ERROR): string {
  if (!error) return fallback;
  if (error.status === 429) return RATE_LIMIT_MESSAGE;
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code]!;
  return fallback;
}
