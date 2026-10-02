"use client";

import {
  FormEvent,
  Suspense,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo =
    searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF8F2] px-5 py-10 text-[#2B1A16]">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-[#3A211B]/10 bg-white p-7 shadow-sm sm:p-9">
          <div className="text-center">
            <img
              src="/images/hanami-logo.jpg?v=2"
              alt="Hanami"
              className="mx-auto h-16 w-auto"
            />

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-[#C96F8D]">
              Administración
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Iniciar sesión
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#3A211B]/55">
              Accede al panel de administración de Hanami.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
              >
                Correo
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                className="w-full rounded-2xl border border-[#3A211B]/15 bg-[#FFF8F2] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#3A211B]/35 focus:border-[#E8A0B8] focus:ring-2 focus:ring-[#E8A0B8]/20"
                placeholder="admin@hanami.cl"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold"
              >
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                className="w-full rounded-2xl border border-[#3A211B]/15 bg-[#FFF8F2] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#3A211B]/35 focus:border-[#E8A0B8] focus:ring-2 focus:ring-[#E8A0B8]/20"
                placeholder="********"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#3A211B] px-6 py-3.5 text-sm font-bold text-[#FFF8F2] transition hover:bg-[#513029] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Iniciando sesión..."
                : "Iniciar sesión"}
            </button>
          </form>

          <div className="mt-7 border-t border-[#3A211B]/10 pt-6 text-center">
            <a
              href="/"
              className="text-sm font-medium text-[#6F3548] transition hover:text-[#3A211B]"
            >
              Volver a Hanami
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#3A211B]/35">
          Hanami - Panel privado
        </p>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#FFF8F2] px-5 text-[#2B1A16]">
          <p className="text-sm font-medium">
            Cargando...
          </p>
        </main>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}