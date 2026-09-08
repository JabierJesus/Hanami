"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function Navbar() {
  const { cart } = useCart();

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <nav className="flex items-center justify-between px-8 py-6">
      <Link href="/" className="text-2xl font-bold">
        HANAMI 🍡
      </Link>

      <div className="flex gap-8">
        <Link href="/menu">Menú</Link>

        <Link href="/nosotros">
          Quiénes somos
        </Link>

        <Link href="/como-llegar">
          Cómo llegar
        </Link>

        <Link href="/pedido">
          🛒 Pedido {totalItems > 0 && `(${totalItems})`}
        </Link>
      </div>
    </nav>
  );
}