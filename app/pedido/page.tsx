"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function Pedido() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFF8F2] px-5 py-8 text-[#2B1A16] sm:px-6">
      {/* Decorative background */}

      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#E8A0B8]/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#E8A0B8]/15 blur-3xl" />

      <div className="pointer-events-none absolute right-[8%] top-[20%] text-5xl opacity-10">
        ✿
      </div>

      <div className="pointer-events-none absolute bottom-[20%] left-[8%] text-4xl opacity-10">
        ✿
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
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

        {/* Title */}

        <div className="pb-8 pt-12 sm:pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C96F8D]">
            Hanami
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Tu pedido
          </h1>

          <p className="mt-3 text-[#3A211B]/55">
            Revisa tus productos antes de continuar.
          </p>
        </div>

        {cart.length === 0 ? (
          /* Empty cart */

          <div className="rounded-3xl border border-[#3A211B]/10 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F7DCE4] text-3xl">
              🌸
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Tu carrito está vacío
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#3A211B]/55">
              Todavía no has agregado ningún producto.
              ¡Vamos a buscar algo rico!
            </p>

            <Link
              href="/menu"
              className="mt-7 inline-flex rounded-full bg-[#3A211B] px-7 py-3.5 font-semibold text-[#FFF8F2] transition hover:-translate-y-0.5 hover:bg-[#513029]"
            >
              Ver el menú →
            </Link>
          </div>
        ) : (
          <>
            {/* Products */}

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.option || "default"}`}
                  className="rounded-3xl border border-[#3A211B]/10 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-[#3A211B]">
                        {item.product.name}
                      </h2>

                      <p className="mt-1 text-sm text-[#3A211B]/50">
                        $
                        {item.product.price.toLocaleString(
                          "es-CL"
                        )}{" "}
                        c/u
                      </p>

                      {item.option && (
                        <p className="mt-2 inline-flex rounded-full bg-[#FCEEF2] px-3 py-1 text-xs font-medium text-[#6F3548]">
                          Salsa: {item.option}
                        </p>
                      )}
                    </div>

                    <p className="shrink-0 text-lg font-bold text-[#3A211B]">
                      $
                      {(
                        item.product.price *
                        item.quantity
                      ).toLocaleString("es-CL")}
                    </p>
                  </div>

                  {/* Controls */}

                  <div className="mt-5 flex items-center justify-between border-t border-[#3A211B]/10 pt-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          decreaseQuantity(
                            item.product.id,
                            item.option
                          )
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-[#3A211B]/15 bg-[#FFF8F2] text-xl font-medium text-[#3A211B] transition hover:border-[#E8A0B8] hover:bg-[#FCEEF2]"
                        aria-label={`Disminuir cantidad de ${item.product.name}`}
                      >
                        −
                      </button>

                      <span className="w-7 text-center text-lg font-bold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(
                            item.product.id,
                            item.option
                          )
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-[#3A211B]/15 bg-[#FFF8F2] text-xl font-medium text-[#3A211B] transition hover:border-[#E8A0B8] hover:bg-[#FCEEF2]"
                        aria-label={`Aumentar cantidad de ${item.product.name}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        removeFromCart(
                          item.product.id,
                          item.option
                        )
                      }
                      className="rounded-full px-3 py-2 text-sm font-medium text-[#9B5268] transition hover:bg-[#FCEEF2]"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}

            <div className="mt-8 overflow-hidden rounded-3xl border border-[#3A211B]/10 bg-white shadow-sm">
              <div className="flex items-center justify-between px-6 py-6">
                <span className="text-lg font-semibold text-[#3A211B]/70">
                  Total
                </span>

                <span className="text-3xl font-extrabold text-[#3A211B]">
                  ${total.toLocaleString("es-CL")}
                </span>
              </div>

              <div className="border-t border-[#3A211B]/10 bg-[#FCEEF2]/60 p-4">
                <Link
                  href="/checkout"
                  className="block w-full rounded-full bg-[#3A211B] px-6 py-4 text-center text-base font-bold text-[#FFF8F2] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#513029] hover:shadow-md"
                >
                  Continuar con el pedido →
                </Link>

                <Link
                  href="/menu"
                  className="mt-3 block text-center text-sm font-medium text-[#6F3548] transition hover:text-[#3A211B]"
                >
                  ← Seguir comprando
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Footer */}

        <footer className="py-10 text-center">
          <p className="text-xs text-[#3A211B]/40">
            Hanami · Hecho con cariño 🌸
          </p>
        </footer>
      </div>
    </main>
  );
}