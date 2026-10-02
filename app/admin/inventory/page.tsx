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
      return "font-bold text-red-600";
    }

    if (stock <= 5) {
      return "font-semibold text-orange-600";
    }

    return "font-semibold text-green-600";
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
            onClick={() => {
              loadProducts();
              loadMovements();
            }}
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
                    onClick={() =>
                      openAdjustment(product, "decrease")
                    }
                    className="h-10 w-10 rounded-xl border text-lg font-bold hover:bg-gray-50 disabled:opacity-50"
                  >
                    −
                  </button>

                  <div className="flex h-10 w-20 items-center justify-center rounded-xl border bg-gray-50 font-semibold">
                    {product.stock}
                  </div>

                  <button
                    disabled={saving === product.id}
                    onClick={() =>
                      openAdjustment(product, "increase")
                    }
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

        <div className="mt-10">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Historial de movimientos
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Últimos movimientos de inventario en{" "}
                {currentLocation?.name}.
              </p>
            </div>

            <button
              onClick={loadMovements}
              disabled={loadingMovements}
              className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {loadingMovements
                ? "Cargando..."
                : "Actualizar"}
            </button>
          </div>

          <div className="mb-4 grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Producto
              </label>

              <select
                value={movementProductFilter}
                onChange={(event) =>
                  setMovementProductFilter(event.target.value)
                }
                className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
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
              <label className="mb-2 block text-sm font-semibold">
                Motivo
              </label>

              <select
                value={movementReasonFilter}
                onChange={(event) =>
                  setMovementReasonFilter(event.target.value)
                }
                className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
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
              <label className="mb-2 block text-sm font-semibold">
                Desde
              </label>

              <input
                type="date"
                value={movementFromDate}
                max={movementToDate || undefined}
                onChange={(event) =>
                  setMovementFromDate(event.target.value)
                }
                className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Hasta
              </label>

              <input
                type="date"
                value={movementToDate}
                min={movementFromDate || undefined}
                onChange={(event) =>
                  setMovementToDate(event.target.value)
                }
                className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          {hasMovementFilters && (
            <div className="mb-4 flex flex-col gap-3 rounded-xl bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                Mostrando{" "}
                <span className="font-semibold">
                  {filteredMovements.length}
                </span>{" "}
                de{" "}
                <span className="font-semibold">
                  {movements.length}
                </span>{" "}
                movimientos.
              </p>

              <button
                onClick={clearMovementFilters}
                className="text-left text-sm font-semibold hover:underline sm:text-right"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border bg-white">
            {loadingMovements ? (
              <div className="p-6 text-gray-500">
                Cargando historial...
              </div>
            ) : filteredMovements.length === 0 ? (
              <div className="p-6 text-gray-500">
                {movements.length === 0
                  ? "No hay movimientos registrados todavía."
                  : "No hay movimientos que coincidan con los filtros seleccionados."}
              </div>
            ) : (
              <>
                <div className="hidden grid-cols-[2fr_1fr_1.5fr_1.5fr] gap-4 bg-gray-50 px-6 py-4 text-sm font-semibold md:grid">
                  <div>Producto</div>
                  <div>Cambio</div>
                  <div>Motivo</div>
                  <div>Fecha</div>
                </div>

                <div className="divide-y">
                  {filteredMovements.map((movement) => (
                    <div
                      key={movement.id}
                      className="grid gap-3 px-6 py-4 md:grid-cols-[2fr_1fr_1.5fr_1.5fr] md:items-center"
                    >
                      <div>
                        <div className="font-semibold">
                          {movement.productName}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {movement.productId}
                        </div>
                      </div>

                      <div
                        className={`font-bold ${
                          movement.quantityChange > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {movement.quantityChange > 0
                          ? `+${movement.quantityChange}`
                          : movement.quantityChange}
                      </div>

                      <div className="text-sm text-gray-600">
                        {movement.reason}
                      </div>

                      <div className="text-sm text-gray-500">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Ajustar inventario
                </h2>

                <p className="mt-1 text-gray-500">
                  {adjustingProduct.name}
                </p>
              </div>

              <button
                onClick={closeAdjustment}
                disabled={Boolean(saving)}
                className="text-2xl text-gray-400 hover:text-gray-700 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Stock actual
              </p>

              <p className="text-3xl font-bold">
                {adjustingProduct.stock}
              </p>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold">
                Cantidad
              </label>

              <input
                type="number"
                value={adjustmentAmount}
                onChange={(event) =>
                  setAdjustmentAmount(event.target.value)
                }
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Ej: 5 o -2"
              />

              <p className="mt-2 text-xs text-gray-500">
                Usa un número positivo para agregar stock y uno
                negativo para descontarlo.
              </p>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold">
                Motivo
              </label>

              <select
                value={adjustmentReason}
                onChange={(event) =>
                  setAdjustmentReason(event.target.value)
                }
                className="w-full rounded-xl border bg-white px-4 py-3 outline-none"
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
                className="flex-1 rounded-xl border px-4 py-3 font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                onClick={confirmAdjustment}
                disabled={Boolean(saving)}
                className="flex-1 rounded-xl bg-black px-4 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
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