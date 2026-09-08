"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/components/CartProvider";
import { products } from "@/data/products";

const categories = ["Mochis", "Taiyakis", "Onigiris"];

const locations = [
  {
    id: "4fab6b19-afd1-4b8d-824a-3dacdfd7e7a3",
    name: "Vivo Imperio",
  },
  {
    id: "331ce436-a291-4ba1-83a4-851f62c44a28",
    name: "Mirador",
  },
];

type StockProduct = {
  id: string;
  stock: number;
  active: boolean;
};

export default function Menu() {
  const { locationId, setLocationId } = useCart();

  const [stockProducts, setStockProducts] = useState<StockProduct[]>([]);

  useEffect(() => {
    async function loadStock() {
      try {
        const response = await fetch(
          `/api/products?locationId=${locationId}`
        );

        const data = await response.json();

        if (response.ok) {
          setStockProducts(data);
        }
      } catch (error) {
        console.error("ERROR CARGANDO STOCK:", error);
      }
    }

    loadStock();
  }, [locationId]);

  const productsWithStock = products
    .map((product) => {
      const stockProduct = stockProducts.find(
        (item) => item.id === product.id
      );

      return {
        ...product,
        stock: stockProduct?.stock ?? 0,
        active: stockProduct?.active ?? false,
      };
    })
    .filter((product) => product.active);

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold">Menú</h1>

        <p className="mt-2 text-gray-600">
          Elige tus favoritos.
        </p>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium">
            Selecciona tu local
          </label>

          <select
            value={locationId}
            onChange={(event) => {
              setLocationId(event.target.value);
            }}
            className="rounded-xl border bg-white px-4 py-3 font-medium outline-none"
          >
            {locations.map((location) => (
              <option
                key={location.id}
                value={location.id}
              >
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-12 space-y-16">
          {categories.map((category) => {
            const categoryProducts = productsWithStock.filter(
              (product) => product.category === category
            );

            return (
              <section key={category}>
                <h2 className="text-3xl font-bold">{category}</h2>

                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {categoryProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}