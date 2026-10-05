"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { buildAuthErrorMessage, loginSchema, requestResetSchema, safeRedirectPath, signupSchema, updatePasswordSchema } from "@/features/auth/schemas/auth";
import { logger } from "@/lib/logger";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthActionState = {
  ok: boolean;
  message: string;
  fieldErrors: Record<string, string>;
};

function extractFieldErrors(error: z.ZodError) {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const name = issue.path[0];
    if (typeof name === "string") {
      acc[name] = issue.message;
    }
    return acc;
  }, {});
}

function mapSupabaseError(error: { code?: string; message?: string }) {
  const code = error.code ?? "";
  if (code === "user_already_exists") {
    return "This account already exists. Please sign in instead.";
  }
  if (code === "invalid_credentials") {
    return "Invalid email or password.";
  }
  if (code === "email_not_confirmed") {
    return "Please confirm your email before signing in.";
  }
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit") {
    return "Too many requests. Please wait a moment and try again.";
  }
  if (code === "weak_password") {
    return "Choose a stronger password.";
  }
  return buildAuthErrorMessage(code, "Something went wrong. Please try again.");
}

export async function signUp(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const payload = {
    full_name: String(formData.get("full_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = signupSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the sign-up details and try again.",
      fieldErrors: extractFieldErrors(parsed.error),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    const requestId = crypto.randomUUID();
    logger.error("auth_signup_failed", { code: error.code ?? "unknown" }, requestId);
    return {
      ok: false,
      message: mapSupabaseError(error),
      fieldErrors: {},
    };
  }

  redirect("/check-email");
}

export async function signIn(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const payload = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the sign-in details and try again.",
      fieldErrors: extractFieldErrors(parsed.error),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    const requestId = crypto.randomUUID();
    logger.error("auth_signin_failed", { code: error.code ?? "unknown" }, requestId);
    return {
      ok: false,
      message: "Invalid email or password.",
      fieldErrors: {},
    };
  }

  const next = safeRedirectPath(formData.get("next"), "/dashboard");
  redirect(next);
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const payload = {
    email: String(formData.get("email") ?? ""),
  };

  const parsed = requestResetSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please enter a valid email address.",
      fieldErrors: extractFieldErrors(parsed.error),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback?next=%2Fupdate-password`,
  });

  if (error) {
    const requestId = crypto.randomUUID();
    logger.error("auth_reset_request_failed", { code: error.code ?? "unknown" }, requestId);
  }

  redirect("/check-email");
}

export async function updatePassword(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const payload = {
    password: String(formData.get("password") ?? ""),
  };

  const parsed = updatePasswordSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please choose a stronger password.",
      fieldErrors: extractFieldErrors(parsed.error),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    const requestId = crypto.randomUUID();
    logger.error("auth_update_password_failed", { code: error.code ?? "unknown" }, requestId);
    return {
      ok: false,
      message: mapSupabaseError(error),
      fieldErrors: {},
    };
  }

  redirect("/login");
}
