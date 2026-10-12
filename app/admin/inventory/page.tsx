"use client";

import { useEffect, useMemo, useState } from "react";

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

const adjustmentReasons = [
  "Reposición",
  "Venta presencial",
  "Producto dañado",
  "Merma",
  "Corrección de inventario",
  "Otro",
];

type Product = {
  id: string;
  name: string;
  category_id: string;
  category: string | null;
  price: number;
  image: string | null;
  stock: number;
  active: boolean;
};

type Movement = {
  id: string;
  productId: string;
  productName: string;
  quantityChange: number;
  reason: string;
  createdAt: string;
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [locationId, setLocationId] = useState(locations[0].id);
  const [loading, setLoading] = useState(true);
  const [loadingMovements, setLoadingMovements] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [adjustingProduct, setAdjustingProduct] =
    useState<Product | null>(null);

  const [adjustmentAmount, setAdjustmentAmount] =
    useState("1");

  const [adjustmentReason, setAdjustmentReason] =
    useState(adjustmentReasons[0]);

  const [movementProductFilter, setMovementProductFilter] =
    useState("all");

  const [movementReasonFilter, setMovementReasonFilter] =
    useState("all");

  const [movementFromDate, setMovementFromDate] =
    useState("");

  const [movementToDate, setMovementToDate] =
    useState("");

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

  const loadMovements = async () => {
    try {
      setLoadingMovements(true);

      const response = await fetch(
        `/api/admin/inventory/movements?locationId=${locationId}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudo cargar el historial de inventario"
        );
      }

      setMovements(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el historial de inventario."
      );
    } finally {
      setLoadingMovements(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadMovements();

    setMovementProductFilter("all");
    setMovementReasonFilter("all");
    setMovementFromDate("");
    setMovementToDate("");
  }, [locationId]);

  const updateStock = async (
    id: string,
    stock: number,
    reason: string
  ) => {
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
          reason,
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

      await loadMovements();

      return true;
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el stock."
      );

      return false;
    } finally {
      setSaving(null);
    }
  };

  const openAdjustment = (
    product: Product,
    direction: "increase" | "decrease"
  ) => {
    setAdjustingProduct(product);

    setAdjustmentAmount(
      direction === "increase" ? "1" : "-1"
    );

    setAdjustmentReason(
      direction === "increase"
        ? "Reposición"
        : "Venta presencial"
    );
  };

  const closeAdjustment = () => {
    if (saving) {
      return;
    }

    setAdjustingProduct(null);
    setAdjustmentAmount("1");
    setAdjustmentReason(adjustmentReasons[0]);
  };

  const confirmAdjustment = async () => {
    if (!adjustingProduct) {
      return;
    }

    const amount = Number(adjustmentAmount);

    if (!Number.isInteger(amount) || amount === 0) {
      setError(
        "La cantidad debe ser un número entero distinto de 0."
      );
      return;
    }

    const newStock =
      adjustingProduct.stock + amount;

    if (newStock < 0) {
      setError(
        "El stock no puede quedar por debajo de 0."
      );
      return;
    }

    const success = await updateStock(
      adjustingProduct.id,
      newStock,
      adjustmentReason
    );

    if (success) {
      closeAdjustment();
    }
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

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el producto."
      );
    } finally {
      setSaving(null);
    }
  };

  const getStockClass = (stock: number) => {
    if (stock === 0) {
      return "font-bold text-red-400";
    }

    if (stock <= 5) {
      return "font-semibold text-orange-400";
    }

    return "font-semibold text-green-400";
  };

  const formatMovementDate = (date: string) => {
    return new Date(date).toLocaleString("es-CL", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const movementProducts = useMemo(() => {
    const uniqueProducts = new Map<
      string,
      string
    >();

    movements.forEach((movement) => {
      uniqueProducts.set(
        movement.productId,
        movement.productName
      );
    });

    return Array.from(uniqueProducts.entries()).sort(
      ([, nameA], [, nameB]) =>
        nameA.localeCompare(nameB, "es")
    );
  }, [movements]);

  const movementReasons = useMemo(() => {
    return Array.from(
      new Set(
        movements.map((movement) => movement.reason)
      )
    ).sort((a, b) => a.localeCompare(b, "es"));
  }, [movements]);

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      const movementDate = new Date(
        movement.createdAt
      );

      const matchesProduct =
        movementProductFilter === "all" ||
        movement.productId === movementProductFilter;

      const matchesReason =
        movementReasonFilter === "all" ||
        movement.reason === movementReasonFilter;

      let matchesFromDate = true;
      let matchesToDate = true;

      if (movementFromDate) {
        const [year, month, day] =
          movementFromDate.split("-").map(Number);

        const fromDate = new Date(
          year,
          month - 1,
          day,
          0,
          0,
          0,
          0
        );

        matchesFromDate = movementDate >= fromDate;
      }

      if (movementToDate) {
        const [year, month, day] =
          movementToDate.split("-").map(Number);

        const toDate = new Date(
          year,
          month - 1,
          day,
          23,
          59,
          59,
          999
        );

        matchesToDate = movementDate <= toDate;
      }

      return (
        matchesProduct &&
        matchesReason &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [
    movements,
    movementProductFilter,
    movementReasonFilter,
    movementFromDate,
    movementToDate,
  ]);

  const hasMovementFilters =
    movementProductFilter !== "all" ||
    movementReasonFilter !== "all" ||
    movementFromDate !== "" ||
    movementToDate !== "";

  const clearMovementFilters = () => {
    setMovementProductFilter("all");
    setMovementReasonFilter("all");
    setMovementFromDate("");
    setMovementToDate("");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
        <div className="mx-auto max-w-6xl">
          <p className="text-zinc-400">
            Cargando inventario...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Hanami Admin
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
              Inventario
            </h1>

            <p className="mt-2 text-zinc-400">
              Administra el stock de los productos de Hanami.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-400">
              Local
            </label>

            <select
              value={locationId}
              onChange={(event) => {
                setLocationId(event.target.value);
              }}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-medium text-white outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-700"
            >
              {locations.map((location) => (
                <option
                  key={location.id}
                  value={location.id}
                  className="bg-zinc-900 text-white"
                >
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg shadow-black/20">
          <div>
            <p className="text-sm text-zinc-500">
              Inventario actual
            </p>

            <p className="text-xl font-bold text-white">
              {currentLocation?.name}
            </p>
          </div>

          <button
            onClick={() => {
              loadProducts();
              loadMovements();
            }}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-2 font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
          >
            Actualizar
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-900/60 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/20">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1.5fr_1fr] gap-4 border-b border-zinc-800 bg-zinc-950 px-6 py-4 text-sm font-semibold text-zinc-400 md:grid">
            <div>Producto</div>
            <div>Categoría</div>
            <div>Stock</div>
            <div>Modificar</div>
            <div>Estado</div>
          </div>

          <div className="divide-y divide-zinc-800">
            {products.map((product) => (
              <div
                key={product.id}
                className="grid gap-4 px-6 py-5 transition hover:bg-zinc-800/40 md:grid-cols-[2fr_1fr_1fr_1.5fr_1fr] md:items-center"
              >
                <div>
                  <div className="font-semibold text-zinc-100">
                    {product.name}
                  </div>

                  <div className="mt-1 text-sm text-zinc-500">
                    ${product.price.toLocaleString("es-CL")}
                  </div>
                </div>

                <div className="text-sm text-zinc-400">
                  {product.category}
                </div>

                <div>
                  <span className={getStockClass(product.stock)}>
                    {product.stock} unidades
                  </span>

                  {product.stock === 0 && (
                    <div className="mt-1 text-xs text-red-400">
                      Sin stock
                    </div>
                  )}

                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="mt-1 text-xs text-orange-400">
                      Stock bajo
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={saving === product.id}
                    onClick={() =>
                      openAdjustment(product, "decrease")
                    }
                    className="h-10 w-10 rounded-xl border border-zinc-700 bg-zinc-950 text-lg font-bold text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
                  >
                    −
                  </button>

                  <div className="flex h-10 w-20 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950 font-semibold text-zinc-100">
                    {product.stock}
                  </div>

                  <button
                    disabled={saving === product.id}
                    onClick={() =>
                      openAdjustment(product, "increase")
                    }
                    className="h-10 w-10 rounded-xl border border-zinc-700 bg-zinc-950 text-lg font-bold text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                <div>
                  <button
                    disabled={saving === product.id}
                    onClick={() => toggleActive(product)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      product.active
                        ? "border-green-800/60 bg-green-950/60 text-green-300 hover:bg-green-900/70"
                        : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
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

        <div className="mt-10">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Historial de movimientos
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Últimos movimientos de inventario en{" "}
                {currentLocation?.name}.
              </p>
            </div>

            <button
              onClick={loadMovements}
              disabled={loadingMovements}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {loadingMovements
                ? "Cargando..."
                : "Actualizar"}
            </button>
          </div>

          <div className="mb-4 grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Producto
              </label>

              <select
                value={movementProductFilter}
                onChange={(event) =>
                  setMovementProductFilter(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-700"
              >
                <option value="all">
                  Todos los productos
                </option>

                {movementProducts.map(
                  ([productId, productName]) => (
                    <option
                      key={productId}
                      value={productId}
                    >
                      {productName}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Motivo
              </label>

              <select
                value={movementReasonFilter}
                onChange={(event) =>
                  setMovementReasonFilter(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-700"
              >
                <option value="all">
                  Todos los motivos
                </option>

                {movementReasons.map((reason) => (
                  <option
                    key={reason}
                    value={reason}
                  >
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Desde
              </label>

              <input
                type="date"
                value={movementFromDate}
                max={movementToDate || undefined}
                onChange={(event) =>
                  setMovementFromDate(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-700"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Hasta
              </label>

              <input
                type="date"
                value={movementToDate}
                min={movementFromDate || undefined}
                onChange={(event) =>
                  setMovementToDate(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-700"
              />
            </div>
          </div>

          {hasMovementFilters && (
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-zinc-400">
                Mostrando{" "}
                <span className="font-semibold text-zinc-200">
                  {filteredMovements.length}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-zinc-200">
                  {movements.length}
                </span>{" "}
                movimientos.
              </p>

              <button
                onClick={clearMovementFilters}
                className="text-left text-sm font-semibold text-zinc-300 transition hover:text-white hover:underline sm:text-right"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/20">
            {loadingMovements ? (
              <div className="p-6 text-zinc-500">
                Cargando historial...
              </div>
            ) : filteredMovements.length === 0 ? (
              <div className="p-6 text-zinc-500">
                {movements.length === 0
                  ? "No hay movimientos registrados todavía."
                  : "No hay movimientos que coincidan con los filtros seleccionados."}
              </div>
            ) : (
              <>
                <div className="hidden grid-cols-[2fr_1fr_1.5fr_1.5fr] gap-4 border-b border-zinc-800 bg-zinc-950 px-6 py-4 text-sm font-semibold text-zinc-400 md:grid">
                  <div>Producto</div>
                  <div>Cambio</div>
                  <div>Motivo</div>
                  <div>Fecha</div>
                </div>

                <div className="divide-y divide-zinc-800">
                  {filteredMovements.map((movement) => (
                    <div
                      key={movement.id}
                      className="grid gap-3 px-6 py-4 transition hover:bg-zinc-800/40 md:grid-cols-[2fr_1fr_1.5fr_1.5fr] md:items-center"
                    >
                      <div>
                        <div className="font-semibold text-zinc-100">
                          {movement.productName}
                        </div>

                        <div className="mt-1 text-xs text-zinc-600">
                          {movement.productId}
                        </div>
                      </div>

                      <div
                        className={`font-bold ${
                          movement.quantityChange > 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {movement.quantityChange > 0
                          ? `+${movement.quantityChange}`
                          : movement.quantityChange}
                      </div>

                      <div className="text-sm text-zinc-400">
                        {movement.reason}
                      </div>

                      <div className="text-sm text-zinc-500">
                        {formatMovementDate(
                          movement.createdAt
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-2xl shadow-black/50">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Ajustar inventario
                </h2>

                <p className="mt-1 text-zinc-400">
                  {adjustingProduct.name}
                </p>
              </div>

              <button
                onClick={closeAdjustment}
                disabled={Boolean(saving)}
                className="text-2xl text-zinc-600 transition hover:text-white disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-500">
                Stock actual
              </p>

              <p className="text-3xl font-bold text-white">
                {adjustingProduct.stock}
              </p>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Cantidad
              </label>

              <input
                type="number"
                value={adjustmentAmount}
                onChange={(event) =>
                  setAdjustmentAmount(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-700"
                placeholder="Ej: 5 o -2"
              />

              <p className="mt-2 text-xs text-zinc-500">
                Usa un número positivo para agregar stock y uno
                negativo para descontarlo.
              </p>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Motivo
              </label>

              <select
                value={adjustmentReason}
                onChange={(event) =>
                  setAdjustmentReason(event.target.value)
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-700"
              >
                {adjustmentReasons.map((reason) => (
                  <option
                    key={reason}
                    value={reason}
                  >
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeAdjustment}
                disabled={Boolean(saving)}
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                onClick={confirmAdjustment}
                disabled={Boolean(saving)}
                className="flex-1 rounded-xl bg-white px-4 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50"
              >
                {saving
                  ? "Guardando..."
                  : "Guardar ajuste"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}