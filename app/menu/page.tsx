"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/components/CartProvider";

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

const MIRADOR_ID =
  "331ce436-a291-4ba1-83a4-851f62c44a28";

type ApiProduct = {
  id: string;
  name: string;
  category_id: string;
  category: {
    id: string;
    name: string;
    display_order: number;
  };
  price: number;
  image: string | null;
  stock: number;
};

export default function Menu() {
  const { locationId, setLocationId } = useCart();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const locationName =
    locations.find(
      (location) => location.id === locationId
    )?.name || "Local seleccionado";

  const isMirador = locationId === MIRADOR_ID;

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/products?locationId=${locationId}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "No se pudo cargar el menú"
          );
        }

        setProducts(data);
      } catch (error) {
        console.error(
          "ERROR CARGANDO MENÚ:",
          error
        );

        setError(
          "No pudimos cargar el menú. Intenta nuevamente."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [locationId]);

  /*
   * The API already filters:
   * - active inventory
   * - active products
   * - active categories
   *
   * So here we only need to hide products
   * that currently have no stock.
   */
  const activeProducts = products.filter(
    (product) => product.stock > 0
  );

  function toCardProduct(product: ApiProduct) {
    return {
      id: product.id,
      name: product.name,
      category: product.category.name,
      price: product.price,
      image:
        product.image ||
        "/images/placeholder.jpg",
      active: true,
      stock: product.stock,
    };
  }

  /*
   * Mote is only displayed specially at Mirador.
   */
  const moteProducts = useMemo(() => {
    if (!isMirador) {
      return [];
    }

    return activeProducts.filter((product) =>
      product.name.toLowerCase().includes("mote")
    );
  }, [activeProducts, isMirador]);

  /*
   * Everything that isn't Mote follows the
   * normal category system.
   */
  const normalProducts = useMemo(() => {
    return activeProducts.filter(
      (product) =>
        !product.name.toLowerCase().includes("mote")
    );
  }, [activeProducts]);

  const categories = useMemo(() => {
    const categoryMap = new Map<
      string,
      {
        id: string;
        name: string;
        display_order: number;
      }
    >();

    normalProducts.forEach((product) => {
      categoryMap.set(
        product.category.id,
        product.category
      );
    });

    return Array.from(categoryMap.values()).sort(
      (a, b) =>
        a.display_order - b.display_order
    );
  }, [normalProducts]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFF8F2] px-5 py-8 text-[#2B1A16] sm:px-6">
      {/* Decorative background */}

      <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-[#E8A0B8]/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -left-28 h-96 w-96 rounded-full bg-[#E8A0B8]/15 blur-3xl" />

      <div className="pointer-events-none absolute right-[8%] top-[20%] text-6xl opacity-[0.07]">
        ✿
      </div>

      <div className="pointer-events-none absolute bottom-[15%] left-[7%] text-5xl opacity-[0.07]">
        ✿
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}

        <header className="flex items-center justify-between border-b border-[#3A211B]/10 pb-5">
          <Link
            href="/"
            className="inline-flex transition-transform hover:scale-[1.02]"
            aria-label="Volver al inicio"
          >
            <img
              src="/images/hanami-logo.jpg?v=2"
              alt="Hanami"
              className="h-12 w-auto"
            />
          </Link>

          <Link
            href="/pedido"
            className="rounded-full border border-[#3A211B]/10 bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:border-[#E8A0B8]"
          >
            Ver pedido →
          </Link>
        </header>

        {/* Page heading */}

        <div className="pb-8 pt-12 sm:pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C96F8D]">
            Hanami
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Menú
          </h1>

          <p className="mt-3 max-w-xl text-base leading-7 text-[#3A211B]/55 sm:text-lg">
            Elige tus favoritos y prepara tu
            pedido para retirar en el local.
          </p>
        </div>

        {/* Location selector */}

        <section className="rounded-3xl border border-[#3A211B]/10 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C96F8D]">
            ¿Dónde retirarás tu pedido?
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {locations.map((location) => {
              const selected =
                locationId === location.id;

              return (
                <button
                  key={location.id}
                  onClick={() =>
                    setLocationId(location.id)
                  }
                  className={`rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-[#C96F8D] bg-[#FCEEF2] shadow-sm"
                      : "border-[#3A211B]/10 bg-[#FFF8F2] hover:border-[#E8A0B8]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold">
                        📍 {location.name}
                      </p>

                      <p className="mt-1 text-xs text-[#3A211B]/45">
                        Ver menú disponible
                      </p>
                    </div>

                    {selected && (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#C96F8D] text-sm font-bold text-white">
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Current location */}

        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C96F8D]">
            Retiro en
          </p>

          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
            📍 {locationName}
          </h2>
        </div>

        {/* Loading */}

        {loading && (
          <div className="py-24 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F7DCE4] text-2xl">
              🌸
            </div>

            <p className="mt-5 text-sm text-[#3A211B]/50">
              Cargando menú...
            </p>
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-xl">
              !
            </div>

            <p className="mt-5 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-5 rounded-full bg-[#3A211B] px-6 py-3 text-sm font-semibold text-[#FFF8F2]"
            >
              Intentar nuevamente
            </button>
          </div>
        )}

        {/* Empty */}

        {!loading &&
          !error &&
          activeProducts.length === 0 && (
            <div className="py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F7DCE4] text-3xl">
                🌸
              </div>

              <h2 className="mt-6 text-2xl font-bold">
                No hay productos disponibles
              </h2>

              <p className="mt-2 text-[#3A211B]/50">
                No hay productos disponibles en
                este local por ahora.
              </p>
            </div>
          )}

        {/* ================================================== */}
        {/* MIRADOR — MOTE FIRST */}
        {/* ================================================== */}

        {!loading &&
          !error &&
          isMirador &&
          moteProducts.length > 0 && (
            <section className="mt-10">
              <div className="overflow-hidden rounded-[2rem] border border-[#E8A0B8]/50 bg-[#FCEEF2] shadow-sm">
                <div className="p-7 sm:p-9">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C96F8D]">
                        Especial de Mirador
                      </p>

                      <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                        Mote con Huesillo
                      </h2>

                      <p className="mt-3 max-w-xl text-sm leading-6 text-[#6F3548]/75 sm:text-base">
                        Nuestro Mote con Huesillo,
                        listo para disfrutar o
                        llevar a casa.
                      </p>
                    </div>

                    <Link
                      href="/recarga"
                      className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-[#6F3548] shadow-sm transition hover:bg-[#FFF8F2]"
                    >
                      ¿Ya tienes bidón? Recarga →
                    </Link>
                  </div>

                  <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {moteProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={toCardProduct(product)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

        {/* ================================================== */}
        {/* NORMAL PRODUCTS */}
        {/* ================================================== */}

        {!loading &&
          !error &&
          normalProducts.length > 0 && (
            <div
              className={`space-y-16 ${
                isMirador
                  ? "mt-14"
                  : "mt-12"
              }`}
            >
              {categories.map((category) => {
                const categoryProducts =
                  normalProducts.filter(
                    (product) =>
                      product.category.id ===
                      category.id
                  );

                if (
                  categoryProducts.length === 0
                ) {
                  return null;
                }

                return (
                  <section
                    key={category.id}
                  >
                    <div className="flex items-end justify-between border-b border-[#3A211B]/10 pb-4">
                      <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                          {category.name}
                        </h2>

                        <p className="mt-1 text-sm text-[#3A211B]/45">
                          {categoryProducts.length}{" "}
                          {categoryProducts.length ===
                          1
                            ? "producto"
                            : "productos"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      {categoryProducts.map(
                        (product) => (
                          <ProductCard
                            key={product.id}
                            product={toCardProduct(
                              product
                            )}
                          />
                        )
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

        {/* Footer */}

        <footer className="py-12 text-center">
          <p className="text-xs text-[#3A211B]/40">
            Hanami · Hecho con cariño 🌸
          </p>
        </footer>
      </div>
    </main>
  );
}