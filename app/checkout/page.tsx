"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

const locations: Record<string, string> = {
  "4fab6b19-afd1-4b8d-824a-3dacdfd7e7a3": "Vivo Imperio",
  "331ce436-a291-4ba1-83a4-851f62c44a28": "Mirador",
};

export default function Checkout() {
  const { cart, locationId, clearCart } = useCart();

  const locationName =
    locations[locationId] || "Local seleccionado";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [marketingConsent, setMarketingConsent] =
    useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState("transferencia");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promotion, setPromotion] = useState<any>(null);
  const [discount, setDiscount] = useState(0);

  const router = useRouter();

  const cartItemCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.product.price * item.quantity,
    0
  );

  const total = Math.max(subtotal - discount, 0);

  const applyPromotion = async (
    code: string | null = null
  ) => {
    if (cart.length === 0) {
      return;
    }

    setPromoLoading(true);
    setPromoError("");

    try {
      const response = await fetch(
        "/api/promotions/apply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            cart,
            locationId,
            channel: "online",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.valid) {
        setPromotion(null);
        setDiscount(0);

        setPromoError(
          result.error ||
            "No se pudo aplicar la promoción."
        );

        return;
      }

      setPromotion(result.promotion);
      setDiscount(result.discount || 0);
      setPromoError("");
    } catch (error) {
      console.error(
        "Promotion application error:",
        error
      );

      setPromotion(null);
      setDiscount(0);

      setPromoError(
        "No se pudo verificar la promoción."
      );
    } finally {
      setPromoLoading(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError(
        "Ingresa un código promocional."
      );
      return;
    }

    await applyPromotion(
      promoCode.trim()
    );
  };

  useEffect(() => {
    if (promoCode.trim()) {
      return;
    }

    if (cart.length === 0) {
      setPromotion(null);
      setDiscount(0);
      setPromoError("");
      return;
    }

    applyPromotion(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, locationId]);

  useEffect(() => {
    if (!promoCode.trim()) {
      return;
    }

    if (cart.length === 0) {
      setPromotion(null);
      setDiscount(0);
      return;
    }

    const timeout = setTimeout(() => {
      applyPromotion(
        promoCode.trim()
      );
    }, 300);

    return () => clearTimeout(timeout);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError(
        "Por favor completa tu nombre y teléfono."
      );
      return;
    }

    if (!locationId) {
      setError(
        "Por favor selecciona un local."
      );
      return;
    }

    if (
      email.trim() &&
      !email.includes("@")
    ) {
      setError(
        "Por favor ingresa un email válido."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      let finalDiscount = discount;
      let finalPromotion = promotion;

      /*
       * Revalidate the promotion immediately before
       * creating the order.
       *
       * No customer database lookup happens here.
       */
      if (promotion) {
        const promoResponse = await fetch(
          "/api/promotions/apply",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code:
                promotion.code || null,
              cart,
              locationId,
              channel: "online",
            }),
          }
        );

        const promoResult =
          await promoResponse.json();

        if (
          !promoResponse.ok ||
          !promoResult.valid
        ) {
          throw new Error(
            promoResult.error ||
              "La promoción ya no está disponible."
          );
        }

        finalDiscount =
          promoResult.discount || 0;

        finalPromotion =
          promoResult.promotion;
      }

      const response = await fetch(
        "/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            phone,
            email,
            birthday: birthday || null,
            marketingConsent,

            orderType: "retiro",
            orderTime: null,

            paymentMethod,
            cart,

            subtotal,

            total,
            discount: finalDiscount,
            promotionId:
              finalPromotion?.id || null,
            promotionCode:
              finalPromotion?.code || null,

            locationId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "No se pudo crear el pedido."
        );
      }

      /*
       * The order UUID is used for public tracking.
       * The human-friendly order number is still returned
       * by the tracking API and displayed to the customer.
       */
      if (!result.orderId) {
        throw new Error(
          "El pedido se creó, pero no se recibió su identificador."
        );
      }

      clearCart();

      router.push(
        `/confirmacion?pedido=${
          result.orderId
        }&local=${encodeURIComponent(
          locationName
        )}`
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "No pudimos procesar tu pedido. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#FFF8F2] px-6 py-8 text-[#2B1A16]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#E8A0B8]/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#E8A0B8]/15 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl">
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

          <div className="py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F7DCE4] text-3xl">
              🌸
            </div>

            <h1 className="mt-7 text-3xl font-bold sm:text-4xl">
              Tu pedido está vacío
            </h1>

            <p className="mx-auto mt-3 max-w-md text-[#3A211B]/55">
              Agrega algunos productos al carrito
              antes de finalizar tu pedido.
            </p>

            <Link
              href="/menu"
              className="mt-7 inline-flex rounded-full bg-[#3A211B] px-7 py-3.5 font-semibold text-[#FFF8F2] transition hover:-translate-y-0.5 hover:bg-[#513029]"
            >
              Ver menú →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFF8F2] px-5 py-8 text-[#2B1A16] sm:px-6">
      {/* Decorative background */}

      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#E8A0B8]/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#E8A0B8]/15 blur-3xl" />

      <div className="pointer-events-none absolute right-[8%] top-[15%] text-5xl opacity-10">
        ✿
      </div>

      <div className="pointer-events-none absolute bottom-[20%] left-[7%] text-4xl opacity-10">
        ✿
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        {/* Header */}

        <header className="flex items-center justify-between gap-3 border-b border-[#3A211B]/10 pb-5">
          <Link
            href="/"
            className="inline-flex shrink-0 transition-transform hover:scale-[1.02]"
            aria-label="Volver al inicio"
          >
            <img
              src="/images/hanami-logo.jpg?v=2"
              alt="Hanami"
              className="h-10 w-auto sm:h-12"
            />
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/pedido"
              className="inline-flex items-center gap-2 rounded-full border border-[#3A211B]/10 bg-white px-3 py-2 text-xs font-semibold transition hover:border-[#E8A0B8] hover:bg-[#FCEEF2] sm:px-4 sm:text-sm"
            >
              🛒
              <span>
                Pedido ({cartItemCount})
              </span>
            </Link>

            <span className="hidden text-xs font-medium uppercase tracking-[0.2em] text-[#3A211B]/40 sm:inline">
              Finalizar pedido
            </span>
          </div>
        </header>

        {/* Heading */}

        <div className="pb-8 pt-12 sm:pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C96F8D]">
            Casi listo 🌸
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Finalizar pedido
          </h1>

          <p className="mt-3 text-[#3A211B]/55">
            Completa tus datos y elige cómo pagar.
          </p>
        </div>

        {/* Local */}

        <section className="rounded-3xl border border-[#3A211B]/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C96F8D]">
            Local de retiro
          </p>

          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xl font-bold">
                📍 {locationName}
              </p>

              <p className="mt-2 text-sm leading-6 text-[#3A211B]/55">
                Retiro inmediato. Preparamos tu
                pedido apenas lo recibimos.
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-[#FCEEF2] px-3 py-1.5 text-xs font-semibold text-[#6F3548]">
              10–15 min
            </span>
          </div>

          <Link
            href="/menu"
            className="mt-4 inline-block text-sm font-semibold text-[#9B5268] transition hover:text-[#3A211B]"
          >
            ← Cambiar local
          </Link>
        </section>

        {/* Customer information */}

        <section className="mt-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C96F8D]">
              01
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Tus datos
            </h2>

            <p className="mt-1 text-sm text-[#3A211B]/50">
              Los usaremos para identificar tu pedido
              y contactarte si es necesario.
            </p>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold"
              >
                Nombre *
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Tu nombre"
                autoComplete="name"
                className="w-full rounded-2xl border border-[#3A211B]/12 bg-white px-4 py-3.5 outline-none transition placeholder:text-[#3A211B]/30 focus:border-[#E8A0B8] focus:ring-4 focus:ring-[#E8A0B8]/10"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold"
              >
                WhatsApp / teléfono *
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="+56 9 1234 5678"
                autoComplete="tel"
                className="w-full rounded-2xl border border-[#3A211B]/12 bg-white px-4 py-3.5 outline-none transition placeholder:text-[#3A211B]/30 focus:border-[#E8A0B8] focus:ring-4 focus:ring-[#E8A0B8]/10"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
              >
                Email{" "}
                <span className="font-normal text-[#3A211B]/40">
                  (opcional)
                </span>
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="tu@email.com"
                autoComplete="email"
                className="w-full rounded-2xl border border-[#3A211B]/12 bg-white px-4 py-3.5 outline-none transition placeholder:text-[#3A211B]/30 focus:border-[#E8A0B8] focus:ring-4 focus:ring-[#E8A0B8]/10"
              />
            </div>

            <div>
              <label
                htmlFor="birthday"
                className="mb-2 block text-sm font-semibold"
              >
                Fecha de cumpleaños{" "}
                <span className="font-normal text-[#3A211B]/40">
                  (opcional)
                </span>
              </label>

              <input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(event) =>
                  setBirthday(event.target.value)
                }
                className="w-full rounded-2xl border border-[#3A211B]/12 bg-white px-4 py-3.5 outline-none transition focus:border-[#E8A0B8] focus:ring-4 focus:ring-[#E8A0B8]/10"
              />

              <p className="mt-2 text-xs leading-5 text-[#3A211B]/45">
                La usaremos para enviarte beneficios
                de cumpleaños si aceptas recibir
                promociones.
              </p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#E8A0B8]/30 bg-[#FCEEF2]/60 p-4 transition hover:bg-[#FCEEF2]">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(event) =>
                  setMarketingConsent(
                    event.target.checked
                  )
                }
                className="mt-1 h-4 w-4 accent-[#C96F8D]"
              />

              <span className="text-sm leading-6 text-[#3A211B]/70">
                Quiero recibir promociones,
                novedades y beneficios de Hanami por
                email.
              </span>
            </label>
          </div>
        </section>

        {/* Pickup */}

        <section className="mt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C96F8D]">
            02
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            Retiro
          </h2>

          <div className="mt-5 rounded-3xl border border-[#E8A0B8]/40 bg-[#FCEEF2] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-xl">
                ⚡
              </div>

              <div>
                <p className="text-lg font-bold text-[#6F3548]">
                  Retiro inmediato
                </p>

                <p className="mt-1 text-sm leading-6 text-[#6F3548]/70">
                  Recibimos tu pedido y comenzamos a
                  prepararlo de inmediato.
                </p>

                <p className="mt-3 text-sm font-semibold text-[#6F3548]">
                  Normalmente estará listo en
                  aproximadamente 10–15 minutos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment */}

        <section className="mt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C96F8D]">
            03
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            Método de pago
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                setPaymentMethod("tarjeta")
              }
              className={`rounded-3xl border p-5 text-left transition ${
                paymentMethod === "tarjeta"
                  ? "border-[#C96F8D] bg-[#FCEEF2] shadow-sm"
                  : "border-[#3A211B]/10 bg-white hover:border-[#E8A0B8]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF8F2] text-xl">
                  💳
                </div>

                {paymentMethod === "tarjeta" && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C96F8D] text-xs font-bold text-white">
                    ✓
                  </span>
                )}
              </div>

              <p className="mt-4 font-bold">
                Tarjeta
              </p>

              <p className="mt-1 text-sm leading-5 text-[#3A211B]/50">
                Paga online con tarjeta.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setPaymentMethod(
                  "transferencia"
                )
              }
              className={`rounded-3xl border p-5 text-left transition ${
                paymentMethod ===
                "transferencia"
                  ? "border-[#C96F8D] bg-[#FCEEF2] shadow-sm"
                  : "border-[#3A211B]/10 bg-white hover:border-[#E8A0B8]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF8F2] text-xl">
                  🏦
                </div>

                {paymentMethod ===
                  "transferencia" && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C96F8D] text-xs font-bold text-white">
                    ✓
                  </span>
                )}
              </div>

              <p className="mt-4 font-bold">
                Transferencia
              </p>

              <p className="mt-1 text-sm leading-5 text-[#3A211B]/50">
                Recibirás las instrucciones para
                realizar la transferencia.
              </p>
            </button>
          </div>
        </section>

        {/* Promotion */}

        <section className="mt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C96F8D]">
            Descuentos
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            ¿Tienes un código promocional?
          </h2>

          <div className="mt-5 flex gap-3">
            <input
              type="text"
              value={promoCode}
              onChange={(event) => {
                setPromoCode(
                  event.target.value.toUpperCase()
                );
                setPromoError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleApplyPromo();
                }
              }}
              placeholder="Ej. HANAMI15"
              className="min-w-0 flex-1 rounded-2xl border border-[#3A211B]/12 bg-white px-4 py-3.5 uppercase outline-none transition placeholder:text-[#3A211B]/30 focus:border-[#E8A0B8] focus:ring-4 focus:ring-[#E8A0B8]/10"
            />

            <button
              type="button"
              onClick={handleApplyPromo}
              disabled={promoLoading}
              className="rounded-2xl bg-[#3A211B] px-5 py-3.5 font-semibold text-[#FFF8F2] transition hover:bg-[#513029] disabled:opacity-50"
            >
              {promoLoading
                ? "..."
                : "Aplicar"}
            </button>
          </div>

          {promotion && (
            <div className="mt-4 rounded-3xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-green-800">
                    {promotion.name}
                  </p>

                  {promotion.code && (
                    <p className="mt-1 text-sm text-green-700">
                      Código:{" "}
                      {promotion.code}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPromoCode("");
                    setPromotion(null);
                    setDiscount(0);
                    setPromoError("");
                  }}
                  className="text-sm font-medium text-green-800 underline"
                >
                  Quitar
                </button>
              </div>

              <p className="mt-3 text-sm text-green-700">
                Descuento aplicado:{" "}
                <strong>
                  $
                  {discount.toLocaleString(
                    "es-CL"
                  )}
                </strong>
              </p>
            </div>
          )}

          {promoError && (
            <p className="mt-3 text-sm text-red-600">
              {promoError}
            </p>
          )}
        </section>

        {/* Summary */}

        <section className="mt-12 overflow-hidden rounded-3xl border border-[#3A211B]/10 bg-white shadow-sm">
          <div className="px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C96F8D]">
              Resumen
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex justify-between text-sm text-[#3A211B]/55">
                <span>Subtotal</span>

                <span>
                  ${subtotal.toLocaleString("es-CL")}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm font-medium text-green-700">
                  <span>Descuento</span>

                  <span>
                    -$
                    {discount.toLocaleString(
                      "es-CL"
                    )}
                  </span>
                </div>
              )}

              <div className="mt-4 flex items-end justify-between border-t border-[#3A211B]/10 pt-5">
                <span className="text-lg font-semibold">
                  Total
                </span>

                <span className="text-3xl font-extrabold">
                  ${total.toLocaleString("es-CL")}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#3A211B]/10 bg-[#FCEEF2]/60 p-5">
            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-full bg-[#3A211B] px-6 py-4 text-lg font-bold text-[#FFF8F2] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#513029] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Procesando pedido..."
                : "Confirmar pedido →"}
            </button>

            <p className="mt-3 text-center text-xs leading-5 text-[#3A211B]/40">
              Al confirmar, tu pedido será enviado a
              Hanami para preparación.
            </p>
          </div>
        </section>

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