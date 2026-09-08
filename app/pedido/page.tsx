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
    <main className="px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold">Tu pedido</h1>

        {cart.length === 0 ? (
          <div className="mt-8">
            <p className="text-gray-600">
              Tu carrito está vacío.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {cart.map((item) => (
              <div
                key={`${item.product.id}-${item.option || "default"}`}
                className="rounded-2xl border p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">
                      {item.product.name}
                    </h2>

                    <p className="mt-1 text-gray-600">
                      ${item.product.price.toLocaleString("es-CL")} c/u
                    </p>

                    {item.option && (
                      <p className="mt-1 text-sm text-gray-500">
                        Salsa: {item.option}
                      </p>
                    )}
                  </div>

                  <p className="font-semibold">
                    $
                    {(
                      item.product.price * item.quantity
                    ).toLocaleString("es-CL")}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        decreaseQuantity(
                          item.product.id,
                          item.option
                        )
                      }
                      className="h-9 w-9 rounded-full border"
                    >
                      −
                    </button>

                    <span className="w-6 text-center font-semibold">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        increaseQuantity(
                          item.product.id,
                          item.option
                        )
                      }
                      className="h-9 w-9 rounded-full border"
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
                    className="text-sm text-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between border-t pt-6 text-xl font-bold">
              <span>Total</span>
              <span>
                ${total.toLocaleString("es-CL")}
              </span>
            </div>

            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-full bg-black px-6 py-4 text-center font-semibold text-white"
            >
              Continuar con el pedido →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}