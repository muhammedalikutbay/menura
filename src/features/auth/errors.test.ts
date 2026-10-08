import { describe, expect, it } from "vitest";
import { authErrorMessage, GENERIC_AUTH_ERROR, RATE_LIMIT_MESSAGE } from "./errors";

describe("authErrorMessage", () => {
  it("maps wrong credentials", () => {
    expect(authErrorMessage({ code: "INVALID_EMAIL_OR_PASSWORD", status: 401 })).toBe("E-posta veya şifre hatalı.");
  });

  it("maps rate limiting by status even without a code", () => {
    expect(authErrorMessage({ status: 429, message: "Too many requests" })).toBe(RATE_LIMIT_MESSAGE);
  });

  it("maps existing users and short passwords", () => {
    expect(authErrorMessage({ code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" })).toMatch(/zaten bir hesap/);
    expect(authErrorMessage({ code: "PASSWORD_TOO_SHORT" })).toMatch(/en az 8/);
  });

  it("falls back for unknown or missing errors", () => {
    expect(authErrorMessage({ code: "SOMETHING_NEW", status: 500 })).toBe(GENERIC_AUTH_ERROR);
    expect(authErrorMessage(null, "Özel mesaj")).toBe("Özel mesaj");
  });
});
