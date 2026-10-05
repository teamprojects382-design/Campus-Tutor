import { redirect } from "next/navigation";
import { safeRedirectPath } from "@/features/auth/schemas/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export function redirectToLogin(nextTarget?: unknown) {
  const safeNext = safeRedirectPath(nextTarget, "/dashboard");
  redirect(`/login?next=${encodeURIComponent(safeNext)}`);
}

export async function requireUser(nextTarget?: unknown) {
  const user = await getCurrentUser();

  if (!user) {
    redirectToLogin(nextTarget);
  }

  return user;
}

export async function requireGuest() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }
}
