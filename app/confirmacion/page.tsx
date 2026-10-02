"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

type Order = {
  order_number: number;
  status: OrderStatus;
  order_type: string;
  order_time: string | null;
  total: number;
  location_id: string;
  locations: {
    name: string;
  } | null;
};

function ConfirmacionContenido() {
  const searchParams = useSearchParams();

  const pedido = searchParams.get("pedido");
  const local = searchParams.get("local");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pedido) {
      setLoading(false);
      return;
    }

    async function loadOrder() {
      try {
        const response = await fetch(
          `/api/orders/${pedido}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "No se pudo cargar el pedido"
          );
        }

        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error(
          "ERROR CARGANDO PEDIDO:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [pedido]);

  useEffect(() => {
    if (!pedido || !order) {
      return;
    }

    if (
      order.status === "completed" ||
      order.status === "cancelled"
    ) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/orders/${pedido}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error(
          "ERROR ACTUALIZANDO PEDIDO:",
          error
        );
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [pedido, order]);

  function getStatusTitle(status: OrderStatus) {
    switch (status) {
      case "pending":
        return "Pedido recibido";

      case "preparing":
        return "Preparando tu pedido";

      case "ready":
        return "¡Tu pedido está listo!";

      case "completed":
        return "Pedido entregado";

      case "cancelled":
        return "Pedido cancelado";

      default:
        return "Pedido recibido";
    }
  }

  function getStatusMessage(status: OrderStatus) {
    switch (status) {
      case "pending":
        return "Recibimos tu pedido y estamos por comenzar a prepararlo.";

      case "preparing":
        return "Estamos preparando tu pedido. Te avisaremos cuando esté listo.";

      case "ready":
        return "Puedes acercarte al local para retirar tu pedido.";

      case "completed":
        return "Este pedido ya fue entregado. ¡Gracias por comprar en Hanami!";

      case "cancelled":
        return "Este pedido fue cancelado.";

      default:
        return "Estamos procesando tu pedido.";
    }
  }

  function getStatusIcon(status: OrderStatus) {
    switch (status) {
      case "pending":
        return "🌸";

      case "preparing":
        return "🥡";

      case "ready":
        return "✨";

      case "completed":
        return "✓";

      case "cancelled":
        return "×";

      default:
        return "🌸";
    }
  }

  function getStatusAccent(status: OrderStatus) {
    switch (status) {
      case "cancelled":
        return "border-red-200 bg-red-50 text-red-800";

      case "completed":
        return "border-green-200 bg-green-50 text-green-800";

      case "ready":
        return "border-[#E8A0B8] bg-[#FCEEF2] text-[#6F3548]";

      case "preparing":
        return "border-[#E8A0B8] bg-[#FFF4F7] text-[#6F3548]";

      default:
        return "border-[#E8A0B8]/60 bg-[#FFF8F2] text-[#6F3548]";
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFF8F2] px-6 py-8 text-[#2B1A16]">
      {/* Decorative background */}

      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#E8A0B8]/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#E8A0B8]/15 blur-3xl" />

      <div className="pointer-events-none absolute right-[12%] top-[18%] text-5xl opacity-10">
        ✿
      </div>

      <div className="pointer-events-none absolute bottom-[18%] left-[10%] text-4xl opacity-10">
        ✿
      </div>

      <div className="relative z-10 mx-auto max-w-2xl">
        {/* Header */}

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

          <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#3A211B]/40">
            Tu pedido
          </span>
        </header>

        {/* Main */}

        <div className="py-16 text-center sm:py-20">
          {loading ? (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F7DCE4] text-3xl">
                🌸
              </div>

              <h1 className="mt-7 text-3xl font-bold tracking-tight sm:text-4xl">
                Cargando tu pedido...
              </h1>

              <p className="mt-3 text-[#3A211B]/55">
                Un momento.
              </p>
            </>
          ) : !order ? (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F7DCE4] text-3xl">
                ?
              </div>

              <h1 className="mt-7 text-3xl font-bold tracking-tight sm:text-4xl">
                No encontramos tu pedido
              </h1>

              <p className="mx-auto mt-3 max-w-md text-[#3A211B]/55">
                Puede que el enlace haya expirado o
                que haya ocurrido un problema al cargar
                la información.
              </p>

              <Link
                href="/menu"
                className="mt-8 inline-flex rounded-full bg-[#3A211B] px-7 py-3.5 font-semibold text-[#FFF8F2] transition hover:bg-[#513029]"
              >
                Volver al menú
              </Link>
            </>
          ) : (
            <>
              {/* Status icon */}

              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#F7DCE4] text-4xl shadow-sm">
                {getStatusIcon(order.status)}
              </div>

              {/* BIG ORDER NUMBER */}

              <h1 className="mt-8 text-6xl font-extrabold tracking-tight text-[#3A211B] sm:text-7xl md:text-8xl">
                #{order.order_number}
              </h1>

              <p className="mt-2 text-base font-bold uppercase tracking-[0.3em] text-[#C96F8D] sm:text-lg">
                Pedido
              </p>

              {/* Status */}

              <p className="mt-6 text-xl font-bold text-[#3A211B] sm:text-2xl">
                {getStatusTitle(order.status)}
              </p>

              <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-[#3A211B]/60 sm:text-lg">
                {getStatusMessage(order.status)}
              </p>

              {/* Order card */}

              <div className="mt-10 overflow-hidden rounded-3xl border border-[#3A211B]/10 bg-white text-left shadow-sm">
                <div className="border-b border-[#3A211B]/10 px-6 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C96F8D]">
                    Detalles del pedido
                  </p>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#3A211B]/40">
                        Local de retiro
                      </p>

                      <p className="mt-1.5 font-semibold">
                        📍{" "}
                        {order.locations?.name ||
                          local ||
                          "Local seleccionado"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#3A211B]/40">
                        Total
                      </p>

                      <p className="mt-1.5 font-semibold">
                        $
                        {order.total.toLocaleString(
                          "es-CL"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-5">
                  <div
                    className={`rounded-2xl border p-5 ${getStatusAccent(
                      order.status
                    )}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">
                        {getStatusIcon(order.status)}
                      </div>

                      <div>
                        <p className="font-bold">
                          {getStatusTitle(order.status)}
                        </p>

                        <p className="mt-1 text-sm leading-6 opacity-75">
                          {getStatusMessage(
                            order.status
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {order.status !== "completed" &&
                    order.status !== "cancelled" && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-[#3A211B]/45">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#E8A0B8]" />
                        Esta página se actualiza
                        automáticamente.
                      </div>
                    )}
                </div>
              </div>

              {/* Pickup reminder */}

              {order.status !== "cancelled" &&
                order.status !== "completed" && (
                  <div className="mt-6 rounded-3xl border border-[#E8A0B8]/40 bg-[#FCEEF2] px-6 py-5 text-left">
                    <p className="text-sm font-bold text-[#6F3548]">
                      ⚡ Retiro inmediato
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#6F3548]/70">
                      Normalmente tu pedido estará
                      listo en aproximadamente 10–15
                      minutos.
                    </p>
                  </div>
                )}

              <Link
                href="/menu"
                className="mt-8 inline-flex rounded-full bg-[#3A211B] px-8 py-3.5 font-semibold text-[#FFF8F2] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#513029] hover:shadow-md"
              >
                Volver al menú →
              </Link>
            </>
          )}
        </div>

        {/* Footer */}

        <footer className="border-t border-[#3A211B]/10 py-8 text-center">
          <p className="text-xs text-[#3A211B]/40">
            Gracias por elegir Hanami 🌸
          </p>
        </footer>
      </div>
    </main>
  );
}

export default function Confirmacion() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FFF8F2] px-6 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <img
              src="/images/hanami-logo.jpg?v=2"
              alt="Hanami"
              className="mx-auto h-12 w-auto"
            />

            <p className="mt-12 text-[#3A211B]/50">
              Cargando...
            </p>
          </div>
        </main>
      }
    >
      <ConfirmacionContenido />
    </Suspense>
  );
}