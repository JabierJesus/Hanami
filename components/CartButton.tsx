"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function CartButton() {
  const { cart } = useCart();

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const total = cart.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  if (totalItems === 0) {
    return null;
  }

  return (
    <Link
      href="/pedido"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-[#3A211B] px-5 py-3 font-semibold text-[#FFF8F2] shadow-lg transition hover:scale-105 hover:bg-[#513029]"
      aria-label={`Ver carrito con ${totalItems} productos`}
    >
      <span>🛒</span>

      <span>
        Ver carrito ({totalItems})
      </span>

      <span className="border-l border-white/30 pl-3">
        ${total.toLocaleString("es-CL")}
      </span>
    </Link>
  );
}