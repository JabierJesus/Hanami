import Link from "next/link";

const refills = [
  {
    size: "1 L",
    price: "$2.800",
  },
  {
    size: "2 L",
    price: "$5.500",
  },
  {
    size: "3 L",
    price: "$8.500",
  },
  {
    size: "5 L",
    price: "$14.000",
  },
];

const newContainers = [
  {
    size: "1 L",
    price: "$4.000",
  },
  {
    size: "2 L",
    price: "$7.500",
  },
  {
    size: "3 L",
    price: "$10.500",
  },
  {
    size: "5 L",
    price: "$19.000",
  },
];

export default function RecargaPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFF8F2] px-5 py-8 text-[#2B1A16] sm:px-6">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#E8A0B8]/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#E8A0B8]/15 blur-3xl" />

      <div className="pointer-events-none absolute right-[10%] top-[18%] text-6xl opacity-[0.07]">
        ✿
      </div>

      <div className="pointer-events-none absolute bottom-[20%] left-[8%] text-5xl opacity-[0.07]">
        ✿
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="flex items-center justify-between border-b border-[#3A211B]/10 pb-5">
          <Link
            href="/"
            className="inline-flex transition-transform hover:scale-[1.02]"
            aria-label="Volver al inicio"
          >
            <img
              src="/images/hanami-logo.jpg?v=2"
              alt="Hanami"
              className="h-12 w-auto"
            />
          </Link>

          <Link
            href="/menu"
            className="rounded-full border border-[#3A211B]/10 bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:border-[#E8A0B8]"
          >
            Ver menú →
          </Link>
        </header>

        <section className="py-16 text-center sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C96F8D]">
            Mote con Huesillo · Mirador
          </p>

          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            ¿Ya tienes tu bidón?
            <br />
            <span className="text-[#C96F8D]">
              Recárgalo.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#3A211B]/60 sm:text-lg">
            Si ya tienes tu recipiente, puedes traerlo
            directamente a nuestro local Mirador y
            recargarlo con nuestro Mote con Huesillo a
            un precio especial.
          </p>

          <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-[#FCEEF2] px-5 py-3 text-sm font-semibold text-[#6F3548]">
            ♻️ Trae tu propio recipiente
          </div>
        </section>

        <section>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C96F8D]">
              Precios de recarga
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Llena tu bidón por menos
            </h2>

            <p className="mt-2 text-sm text-[#3A211B]/50">
              Disponible directamente en nuestro local
              Mirador.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {refills.map((refill) => (
              <div
                key={refill.size}
                className="rounded-3xl border border-[#E8A0B8]/30 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FCEEF2] text-sm font-bold text-[#C96F8D]">
                  {refill.size}
                </div>

                <p className="mt-6 text-sm text-[#3A211B]/45">
                  Recarga
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {refill.price}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[#E8A0B8]/40 bg-[#FCEEF2] p-7 sm:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm">
              ♻️
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Importante sobre las recargas
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6F3548]/75">
                No importa si el bidón es nuestro o no.
                Mientras sea un recipiente apto y le entren
                los huesillos y el jugo, estamos al otro
                lado.
              </p>

              <p className="mt-3 text-sm font-semibold text-[#6F3548]">
                Solo tráelo y ven con sed de mote. 🧋
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C96F8D]">
              ¿No tienes bidón?
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              También puedes comprar uno nuevo
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#3A211B]/50">
              Los bidones nuevos sí están disponibles
              para pedir online y retirar en Mirador.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {newContainers.map((container) => {
              const refill = refills.find(
                (item) =>
                  item.size === container.size
              );

              return (
                <div
                  key={container.size}
                  className="rounded-3xl border border-[#3A211B]/10 bg-white p-6 shadow-sm"
                >
                  <p className="text-sm font-semibold">
                    Bidón {container.size}
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {container.price}
                  </p>

                  {refill && (
                    <div className="mt-4 border-t border-[#3A211B]/10 pt-4">
                      <p className="text-xs text-[#3A211B]/40">
                        Próxima recarga
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#C96F8D]">
                        {refill.price}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/menu"
              className="inline-flex rounded-full bg-[#3A211B] px-7 py-3.5 text-sm font-bold text-[#FFF8F2] transition hover:bg-[#513027]"
            >
              Comprar un bidón nuevo →
            </Link>
          </div>
        </section>

        <section className="mt-16 overflow-hidden rounded-[2rem] bg-[#3A211B] p-8 text-[#FFF8F2] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#E8A0B8]">
            Venta mayorista
          </p>

          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            ¿Quieres llevar más?
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#FFF8F2]/60">
            Si tienes un negocio, evento o quieres
            comenzar a vender Mote con Huesillo,
            también trabajamos con ventas por volumen.
          </p>

          <Link
            href="/contacto?tipo=mayorista"
            className="mt-7 inline-flex rounded-full bg-[#E8A0B8] px-7 py-3.5 text-sm font-bold text-[#3A211B] transition hover:bg-[#F0B5C8]"
          >
            Consultar por mayor →
          </Link>
        </section>

        <section className="mt-8 rounded-3xl border border-[#3A211B]/10 bg-white p-7 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C96F8D]">
            Encuéntranos
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Mirador Azul
          </h2>

          <p className="mt-2 text-sm text-[#3A211B]/50">
            Vicuña Mackenna Oriente 6.420, local 3
            <br />
            La Florida, Santiago
          </p>

          <Link
            href="/como-llegar"
            className="mt-5 inline-flex rounded-full border border-[#3A211B]/10 px-5 py-2.5 text-sm font-semibold transition hover:border-[#E8A0B8]"
          >
            Cómo llegar →
          </Link>
        </section>

        <footer className="py-12 text-center">
          <p className="text-xs text-[#3A211B]/40">
            Hanami · Hecho con cariño 🌸
          </p>
        </footer>
      </div>
    </main>
  );
}