"use client";

import { useEffect, useState } from "react";

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

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string | null;
  stock: number;
  active: boolean;
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [locationId, setLocationId] = useState(locations[0].id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const currentLocation = locations.find(
    (location) => location.id === locationId
  );

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/inventory?locationId=${locationId}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudo cargar el inventario"
        );
      }

      setProducts(data);
    } catch (error) {
      console.error(error);
      setError("No se pudo cargar el inventario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [locationId]);

  const updateStock = async (id: string, stock: number) => {
    if (stock < 0) {
      stock = 0;
    }

    try {
      setSaving(id);
      setError("");

      const response = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: id,
          stock,
          locationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudo actualizar el stock"
        );
      }

      setProducts((current) =>
        current.map((product) =>
          product.id === id
            ? {
                ...product,
                stock: data.stock,
              }
            : product
        )
      );
    } catch (error) {
      console.error(error);
      setError("No se pudo actualizar el stock.");
    } finally {
      setSaving(null);
    }
  };

  const changeStock = (product: Product, amount: number) => {
    updateStock(product.id, product.stock + amount);
  };

  const toggleActive = async (product: Product) => {
    try {
      setSaving(product.id);
      setError("");

      const response = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          active: !product.active,
          locationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudo actualizar el producto"
        );
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                active: data.active,
              }
            : item
        )
      );
    } catch (error) {
      console.error(error);
      setError("No se pudo actualizar el producto.");
    } finally {
      setSaving(null);
    }
  };

  const getStockClass = (stock: number) => {
    if (stock === 0) {
      return "font-bold text-red-600";
    }

    if (stock <= 5) {
      return "font-semibold text-orange-600";
    }

    return "font-semibold text-green-600";
  };

  if (loading) {
    return (
      <main className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p>Cargando inventario...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              Inventario
            </h1>

            <p className="mt-2 text-gray-600">
              Administra el stock de los productos de Hanami.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Local
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
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm text-gray-500">
              Inventario actual
            </p>

            <p className="text-xl font-bold">
              {currentLocation?.name}
            </p>
          </div>

          <button
            onClick={loadProducts}
            className="rounded-full border px-5 py-2 font-medium hover:bg-gray-50"
          >
            Actualizar
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border bg-white">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1.5fr_1fr] gap-4 bg-gray-50 px-6 py-4 text-sm font-semibold md:grid">
            <div>Producto</div>
            <div>Categoría</div>
            <div>Stock</div>
            <div>Modificar</div>
            <div>Estado</div>
          </div>

          <div className="divide-y">
            {products.map((product) => (
              <div
                key={product.id}
                className="grid gap-4 px-6 py-5 md:grid-cols-[2fr_1fr_1fr_1.5fr_1fr] md:items-center"
              >
                <div>
                  <div className="font-semibold">
                    {product.name}
                  </div>

                  <div className="mt-1 text-sm text-gray-500">
                    ${product.price.toLocaleString("es-CL")}
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  {product.category}
                </div>

                <div>
                  <span className={getStockClass(product.stock)}>
                    {product.stock} unidades
                  </span>

                  {product.stock === 0 && (
                    <div className="mt-1 text-xs text-red-600">
                      Sin stock
                    </div>
                  )}

                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="mt-1 text-xs text-orange-600">
                      Stock bajo
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={saving === product.id}
                    onClick={() => changeStock(product, -1)}
                    className="h-10 w-10 rounded-xl border text-lg font-bold hover:bg-gray-50 disabled:opacity-50"
                  >
                    −
                  </button>

                  <input
                    type="number"
                    min="0"
                    value={product.stock}
                    disabled={saving === product.id}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      setProducts((current) =>
                        current.map((item) =>
                          item.id === product.id
                            ? {
                                ...item,
                                stock: Number.isNaN(value)
                                  ? 0
                                  : Math.max(0, value),
                              }
                            : item
                        )
                      );
                    }}
                    onBlur={() =>
                      updateStock(product.id, product.stock)
                    }
                    className="h-10 w-20 rounded-xl border px-3 text-center"
                  />

                  <button
                    disabled={saving === product.id}
                    onClick={() => changeStock(product, 1)}
                    className="h-10 w-10 rounded-xl border text-lg font-bold hover:bg-gray-50 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                <div>
                  <button
                    disabled={saving === product.id}
                    onClick={() => toggleActive(product)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      product.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {product.active
                      ? "Disponible"
                      : "Oculto"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}