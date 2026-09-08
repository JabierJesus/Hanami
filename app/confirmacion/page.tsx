"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Confirmacion() {
  const searchParams = useSearchParams();
  const pedido = searchParams.get("pedido");

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-6xl">🎉</div>

        <h1 className="mt-6 text-4xl font-bold">
          ¡Pedido confirmado!
        </h1>

        <p className="mt-4 text-gray-600">
          Recibimos tu pedido correctamente.
        </p>

        <div className="mt-8 rounded-2xl border p-6">
          <p className="text-sm text-gray-500">
            Número de pedido
          </p>

          <p className="mt-2 text-2xl font-bold">
            {pedido ? `#${pedido}` : "Pedido confirmado"}
          </p>

          <p className="mt-6 text-gray-600">
            Te avisaremos cuando tu pedido esté listo
            para retirar.
          </p>
        </div>

        <Link
          href="/menu"
          className="mt-8 inline-block rounded-full bg-black px-6 py-3 font-semibold text-white"
        >
          Volver al menú
        </Link>
      </div>
    </main>
  );
}