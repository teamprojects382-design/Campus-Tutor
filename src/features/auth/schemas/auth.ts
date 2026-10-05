import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
export const FULL_NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .max(EMAIL_MAX_LENGTH, "Email is too long.")
  .email("Please enter a valid email address.")
  .transform((value) => value.toLowerCase());

export const fullNameSchema = z
  .string()
  .trim()
  .min(1, "Full name is required.")
  .max(FULL_NAME_MAX_LENGTH, "Full name is too long.")
  .transform((value) => value.replace(/\s+/g, " ").trim());

export const signupSchema = z.object({
  full_name: fullNameSchema,
  email: emailSchema,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
    .max(PASSWORD_MAX_LENGTH, "Password is too long."),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
    .max(PASSWORD_MAX_LENGTH, "Password is too long."),
});

export const requestResetSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
    .max(PASSWORD_MAX_LENGTH, "Password is too long."),
});

export function safeRedirectPath(input: unknown, fallback = "/dashboard") {
  if (typeof input !== "string") {
    return fallback;
  }

  const candidate = input.trim();
  if (!candidate) {
    return fallback;
  }

  if (candidate.includes("\\") || /[\u0000-\u001F\u007F]/.test(candidate)) {
    return fallback;
  }

  if (!candidate.startsWith("/")) {
    return fallback;
  }

  if (candidate.startsWith("//") || candidate.startsWith("/\\") || candidate.startsWith("//")) {
    return fallback;
  }

  const decoded = (() => {
    try {
      return decodeURIComponent(candidate);
    } catch {
      return "";
    }
  })();

  if (!decoded || decoded.includes("\\") || /[\u0000-\u001F\u007F]/.test(decoded)) {
    return fallback;
  }

  if (/^(?:[a-zA-Z][a-zA-Z\d+.-]*:)/.test(decoded) || decoded.startsWith("//")) {
    return fallback;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate, "http://localhost");
  } catch {
    return fallback;
  }

  if (parsed.origin !== "http://localhost") {
    return fallback;
  }

  const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  if (!path.startsWith("/")) {
    return fallback;
  }

  return path;
}

export function buildAuthErrorMessage(code?: string, fallback = "Something went wrong. Please try again.") {
  switch (code) {
    case "user_already_exists":
      return "This account already exists. Please sign in instead.";
    case "invalid_credentials":
      return "Invalid email or password.";
    case "email_not_confirmed":
      return "Please confirm your email before signing in.";
    case "over_email_send_rate_limit":
      return "Too many reset emails have been sent. Please try again later.";
    case "over_request_rate_limit":
      return "Too many requests. Please wait a moment and try again.";
    case "signup_disabled":
      return "Signups are disabled right now.";
    case "weak_password":
      return "Choose a stronger password.";
    default:
      return fallback;
  }
}
