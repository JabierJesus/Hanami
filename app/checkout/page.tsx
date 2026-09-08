"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import Link from "next/link";

export default function Checkout() {
  const { cart } = useCart();

  const [orderType, setOrderType] = useState("retiro");
  const [orderTime, setOrderTime] = useState("ahora");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("transferencia");
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
const handleSubmit = async () => {
  if (!name.trim() || !phone.trim()) {
    setError("Por favor completa tu nombre y teléfono.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
        orderType,
        orderTime: orderTime === "ahora" ? null : orderTime,
        paymentMethod,
        cart,
        total,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "No se pudo crear el pedido");
    }

    router.push(`/confirmacion?pedido=${result.orderNumber}`);
  } catch (error) {
    console.error(error);
    setError("No pudimos procesar tu pedido. Inténtalo nuevamente.");
  } finally {
    setLoading(false);
  }
};
  if (cart.length === 0) {
    return (
      <main className="px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold">
            Tu pedido está vacío
          </h1>

          <Link
            href="/menu"
            className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-white"
          >
            Ver menú
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold">
          Finalizar pedido
        </h1>

        {/* Tipo de entrega */}

        <section className="mt-10">
          <h2 className="text-xl font-bold">
            ¿Cómo quieres recibir tu pedido?
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => setOrderType("retiro")}
              className={`rounded-2xl border p-5 text-left ${
                orderType === "retiro"
                  ? "border-black bg-gray-50"
                  : ""
              }`}
            >
              <div className="text-lg font-semibold">
                🏪 Retiro en Hanami
              </div>

              <p className="mt-1 text-sm text-gray-600">
                Retira tu pedido en el local.
              </p>
            </button>

            <button
              disabled
              className="cursor-not-allowed rounded-2xl border p-5 text-left opacity-50"
            >
              <div className="text-lg font-semibold">
                🛵 Delivery
              </div>

              <p className="mt-1 text-sm text-gray-600">
                Próximamente.
              </p>
            </button>
          </div>
        </section>

        {/* Horario */}

        <section className="mt-10">
          <h2 className="text-xl font-bold">
            ¿Cuándo quieres retirar?
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => setOrderTime("ahora")}
              className={`rounded-2xl border p-5 text-left ${
                orderTime === "ahora"
                  ? "border-black bg-gray-50"
                  : ""
              }`}
            >
              <div className="font-semibold">
                ⚡ Lo antes posible
              </div>

              <p className="mt-1 text-sm text-gray-600">
                Tu pedido se preparará para retiro.
              </p>
            </button>

            <button
              onClick={() => setOrderTime("programado")}
              className={`rounded-2xl border p-5 text-left ${
                orderTime === "programado"
                  ? "border-black bg-gray-50"
                  : ""
              }`}
            >
              <div className="font-semibold">
                🕐 Programar pedido
              </div>

              <p className="mt-1 text-sm text-gray-600">
                Elige cuándo quieres retirarlo.
              </p>
            </button>
          </div>

          {orderTime === "programado" && (
            <div className="mt-4">
              <label className="text-sm font-medium">
                Fecha y hora
              </label>

              <input
                type="datetime-local"
                className="mt-2 w-full rounded-xl border p-3"
              />
            </div>
          )}
        </section>

        {/* Datos */}

        <section className="mt-10">
          <h2 className="text-xl font-bold">
            Tus datos
          </h2>

          <div className="mt-4 space-y-4">
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border p-3"
            />

            <input
              type="tel"
              placeholder="WhatsApp / teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>
        </section>

        {/* Método de pago */}

        <section className="mt-10">
          <h2 className="text-xl font-bold">
            Método de pago
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <button
              onClick={() => setPaymentMethod("tarjeta")}
              className={`rounded-2xl border p-5 text-left ${
                paymentMethod === "tarjeta"
                  ? "border-black bg-gray-50"
                  : ""
              }`}
            >
              <div className="font-semibold">
                💳 Tarjeta
              </div>

              <p className="mt-1 text-sm text-gray-600">
                Paga con tarjeta.
              </p>
            </button>

            <button
              onClick={() => setPaymentMethod("transferencia")}
              className={`rounded-2xl border p-5 text-left ${
                paymentMethod === "transferencia"
                  ? "border-black bg-gray-50"
                  : ""
              }`}
            >
              <div className="font-semibold">
                🏦 Transferencia
              </div>

              <p className="mt-1 text-sm text-gray-600">
                Transfiere al momento de realizar el pedido.
              </p>
            </button>

            <button
              onClick={() => setPaymentMethod("efectivo")}
              className={`rounded-2xl border p-5 text-left ${
                paymentMethod === "efectivo"
                  ? "border-black bg-gray-50"
                  : ""
              }`}
            >
              <div className="font-semibold">
                💵 Efectivo
              </div>

              <p className="mt-1 text-sm text-gray-600">
                Paga al retirar tu pedido.
              </p>
            </button>
          </div>
        </section>

        {/* Resumen */}

        <section className="mt-10 border-t pt-6">
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>

            <span>
              ${total.toLocaleString("es-CL")}
            </span>
          </div>

{error && (
  <p className="mt-4 text-center text-sm text-red-600">
    {error}
  </p>
)}

<button
  onClick={handleSubmit}
  disabled={loading}
  className="mt-6 w-full rounded-full bg-black px-6 py-4 text-center text-lg font-semibold text-white disabled:opacity-50"
>
  {loading ? "Procesando pedido..." : "Confirmar pedido"}
</button></section>
      </div>
    </main>
  );
}