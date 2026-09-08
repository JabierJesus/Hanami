"use client";

import { useState } from "react";
import { Product } from "@/data/products";
import { useCart } from "@/components/CartProvider";

type ProductWithStock = Product & {
  stock: number;
  active: boolean;
};

type ProductCardProps = {
  product: ProductWithStock;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const [selectedOption, setSelectedOption] = useState(
    product.options?.[0] || ""
  );

  const hasOptions = product.options && product.options.length > 0;
  const isOutOfStock = product.stock === 0;

  return (
    <article className="rounded-2xl border p-4">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className={`h-full w-full object-cover ${
            isOutOfStock ? "opacity-50" : ""
          }`}
        />

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
              Agotado
            </span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>

        <p className="mt-1 text-gray-600">
          ${product.price.toLocaleString("es-CL")}
        </p>

        {hasOptions && !isOutOfStock && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium">
              Elige tu salsa
            </p>

            <div className="flex gap-2">
              {product.options?.map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedOption(option)}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    selectedOption === option
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          disabled={isOutOfStock}
          onClick={() =>
            addToCart(
              product,
              hasOptions ? selectedOption : undefined
            )
          }
          className={`mt-4 w-full rounded-full px-4 py-2 text-white ${
            isOutOfStock
              ? "cursor-not-allowed bg-gray-300"
              : "bg-black"
          }`}
        >
          {isOutOfStock ? "Agotado" : "Agregar"}
        </button>
      </div>
    </article>
  );
}