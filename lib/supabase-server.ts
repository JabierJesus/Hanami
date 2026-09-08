import { createClient } from "@supabase/supabase-js";

console.log("SUPABASE URL:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SUPABASE SECRET:", !!process.env.SUPABASE_SECRET_KEY);

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export { supabaseServer };