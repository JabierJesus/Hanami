"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import PromoCarousel from "@/components/PromoCarousel";

export default function Home() {
  const router = useRouter();
  const { setLocationId } = useCart();

  const selectLocation = (locationId: string) => {
    setLocationId(locationId);
    router.push("/menu");
  };

  return (
    <main className="min-h-screen bg-[#FFF8F2] text-[#2B1A16]">
      <section className="relative overflow-hidden px-5 py-5 sm:px-10 sm:py-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#E8A0B8]/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#E8A0B8]/15 blur-3xl" />

        <header className="relative z-10 flex items-center justify-between border-b border-[#3A211B]/10 pb-4 sm:pb-5">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center"
              aria-label="Volver al inicio"
            >
              <img
                src="/images/hanami-logo.jpg?v=2"
                alt="Hanami"
                className="h-9 w-auto sm:h-10"
              />
            </Link>

            <span className="hidden text-xs uppercase tracking-[0.25em] text-[#3A211B]/50 sm:inline">
              Mochis · Taiyakis · Onigiris
            </span>
          </div>

          <nav className="flex shrink-0 items-center gap-2 sm:gap-5 text-sm font-medium">
            <a
              href="/como-llegar"
              className="rounded-full px-2.5 py-2 transition-colors hover:bg-[#FCEEF2] hover:text-[#C96F8D] sm:rounded-none sm:px-0 sm:py-0"
              aria-label="Cómo llegar"
            >
              <span className="sm:hidden">📍</span>
              <span className="hidden sm:inline">Cómo llegar</span>
            </a>

            <a
              href="/contacto"
              className="rounded-full px-2.5 py-2 transition-colors hover:bg-[#FCEEF2] hover:text-[#C96F8D] sm:rounded-none sm:px-0 sm:py-0"
              aria-label="Contacto"
            >
              <span className="sm:hidden">✉️</span>
              <span className="hidden sm:inline">Contacto</span>
            </a>

            <a
              href="https://www.instagram.com/hanami.heladeria/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full px-2.5 py-2 transition-colors hover:bg-[#FCEEF2] hover:text-[#C96F8D] sm:rounded-none sm:px-0 sm:py-0"
              aria-label="Instagram"
            >
              <span className="sm:hidden">◎</span>
              <span className="hidden sm:inline">Instagram</span>
            </a>
          </nav>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-7xl items-center justify-center py-12 sm:py-16">
          <div className="w-full">
            <div className="text-center">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-[#C96F8D] sm:tracking-[0.45em]">
                Hecho para disfrutar
              </p>

              <Link
                href="/"
                className="mx-auto inline-flex justify-center transition-transform duration-300 hover:scale-[1.02]"
                aria-label="Volver al inicio"
              >
                <img
                  src="/images/hanami-logo.jpg?v=2"
                  alt="Hanami"
                  className="h-auto w-[65vw] max-w-[420px] sm:w-[55vw]"
                />
              </Link>

              <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-[#3A211B]/65 sm:mt-8 sm:text-lg">
                Mochis, taiyakis, onigiris y más.
                <br />
                Ven a disfrutar algo rico. 🌸
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:mt-14 md:grid-cols-2">
              <button
                onClick={() =>
                  selectLocation("4fab6b19-afd1-4b8d-824a-3dacdfd7e7a3")
                }
                className="group rounded-3xl border border-[#3A211B]/10 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#E8A0B8] hover:shadow-xl sm:p-7"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C96F8D]">
                      Nuestro menú
                    </p>

                    <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                      Vivo Imperio
                    </h2>
                  </div>

                  <span className="text-2xl transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <p className="mt-5 text-sm leading-6 text-[#3A211B]/55">
                  Mochis · Taiyakis · Onigiris · Helados
                </p>

                <div className="mt-7 inline-flex rounded-full bg-[#F7DCE4] px-4 py-2 text-sm font-semibold text-[#6F3548]">
                  Ver menú
                </div>
              </button>

              <button
                onClick={() =>
                  selectLocation("331ce436-a291-4ba1-83a4-851f62c44a28")
                }
                className="group rounded-3xl border border-[#3A211B]/10 bg-[#3A211B] p-6 text-left text-[#FFF8F2] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#E8A0B8]">
                      Nuestro menú
                    </p>

                    <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                      Mirador
                    </h2>
                  </div>

                  <span className="text-2xl text-[#E8A0B8] transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <p className="mt-5 text-sm leading-6 text-white/65">
                  Mote con Huesillo · Mochis · Taiyakis · Onigiris
                </p>

                <div className="mt-7 inline-flex rounded-full bg-[#E8A0B8] px-4 py-2 text-sm font-semibold text-[#3A211B]">
                  Ver menú
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <PromoCarousel />

      <section className="px-5 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <Link
                href="/"
                className="inline-flex"
                aria-label="Volver al inicio"
              >
                <img
                  src="/images/hanami-logo.jpg?v=2"
                  alt="Hanami"
                  className="h-12 w-auto"
                />
              </Link>

              <p className="mt-3 max-w-xs text-sm leading-6 text-[#3A211B]/55">
                Un pequeño lugar para disfrutar algo dulce, diferente y hecho
                con cariño.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C96F8D]">
                Encuéntranos
              </p>

              <div className="mt-4 space-y-2 text-sm text-[#3A211B]/65">
                <p>📍 Vivo Imperio</p>
                <p>📍 Mirador</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#C96F8D]">
                Más Hanami
              </p>

              <div className="mt-4 flex flex-col gap-2 text-sm font-medium">
                <a
                  href="/como-llegar"
                  className="transition-colors hover:text-[#C96F8D]"
                >
                  Cómo llegar →
                </a>

                <a
                  href="/contacto"
                  className="transition-colors hover:text-[#C96F8D]"
                >
                  Contacto →
                </a>

                <a
                  href="https://www.instagram.com/hanami.heladeria/"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-[#C96F8D]"
                >
                  Instagram →
                </a>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-[#3A211B]/10 pt-6 text-xs text-[#3A211B]/40">
            © {new Date().getFullYear()} Hanami
          </div>
        </div>
      </section>
    </main>
  );
}