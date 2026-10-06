import { redirect } from "next/navigation";

import { createUserScopedServerClient } from "@/lib/supabase/server";

export async function requireUser(): Promise<{ id: string }> {
  const supabase = await createUserScopedServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return { id: user.id };
}

export async function getDb() {
  return createUserScopedServerClient();
}
