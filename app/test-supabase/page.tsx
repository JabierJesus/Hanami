import { supabase } from "../../lib/supabase";

export default async function TestSupabase() {
  const { data, error } = await supabase
    .from("customers")
    .select("*");

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">
        Prueba Supabase
      </h1>

      <pre className="mt-6 rounded-xl border p-4">
        {JSON.stringify({ data, error }, null, 2)}
      </pre>
    </main>
  );
}