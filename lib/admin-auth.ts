import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return {
      supabase,
      authorized: false,
    };
  }

  return {
    supabase,
    authorized: true,
  };
}
