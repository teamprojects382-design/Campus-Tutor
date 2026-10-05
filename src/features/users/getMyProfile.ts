import { getCurrentUser } from "@/features/auth/services/auth";
import type { Database } from "@/lib/supabase/database.types";
import { createUserScopedServerClient } from "@/lib/supabase/server";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export async function getMyProfile(): Promise<ProfileRow | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createUserScopedServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (error) {
    return null;
  }

  return data;
}
