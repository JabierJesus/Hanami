"use client";

import { useEffect, useMemo, useState } from "react";

type Location = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  active: boolean;
  category?: {
    name: string;
  } | null;
};

type PromotionProduct = {
  product_id: string;
};

type Promotion = {
  id: string;
  code: string | null;
  name: string;
  type: string;
  discount_value: number | null;
  minimum_purchase: number | null;
  max_discount: number | null;
  starts_at: string | null;
  expires_at: string | null;
  usage_limit: number | null;
  one_per_customer: boolean;
  automatic: boolean;
  active: boolean;
  buy_quantity: number | null;
  free_quantity: number | null;
  location_id: string | null;
  channel: string;
  description: string | null;
  usage_count: number;
  created_at: string;
  promotion_products: PromotionProduct[];
  locations: Location | null;
};

export default function PromotionsPage() {
  const [promotions, setPromotions] =
    useState<Promotion[]>([]);

  const [locations, setLocations] =
    useState<Location[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [editingPromotion, setEditingPromotion] =
    useState<Promotion | null>(null);

  const [isCreating, setIsCreating] =
    useState(false);

  const [formName, setFormName] =
    useState("");

  const [formCode, setFormCode] =
    useState("");

  const [formType, setFormType] =
    useState("percentage");

  const [formDiscountValue, setFormDiscountValue] =
    useState("");

  const [formMinimumPurchase, setFormMinimumPurchase] =
    useState("");

  const [formMaxDiscount, setFormMaxDiscount] =
    useState("");

  const [formStartsAt, setFormStartsAt] =
    useState("");

  const [formExpiresAt, setFormExpiresAt] =
    useState("");

  const [formUsageLimit, setFormUsageLimit] =
    useState("");

  const [formOnePerCustomer, setFormOnePerCustomer] =
    useState(false);

  const [formAutomatic, setFormAutomatic] =
    useState(false);

  const [formActive, setFormActive] =
    useState(true);

  const [formLocationId, setFormLocationId] =
    useState("");

  const [formChannel, setFormChannel] =
    useState("online");

  const [formDescription, setFormDescription] =
    useState("");

  const [formProductIds, setFormProductIds] =
    useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        promotionsResponse,
        locationsResponse,
        productsResponse,
      ] = await Promise.all([
        fetch("/api/admin/promotions", {
          cache: "no-store",
        }),
        fetch("/api/admin/inventory", {
          cache: "no-store",
        }),
        fetch("/api/admin/products", {
          cache: "no-store",
        }),
      ]);

      const promotionsData =
        await promotionsResponse.json();

      const locationsData =
        await locationsResponse.json();

      const productsData =
        await productsResponse.json();

      if (!promotionsResponse.ok) {
        throw new Error(
          promotionsData.error ||
            "No se pudieron cargar las promociones."
        );
      }

      if (!productsResponse.ok) {
        throw new Error(
          productsData.error ||
            "No se pudieron cargar los productos."
        );
      }

      setPromotions(
        promotionsData
      );

      setProducts(
        Array.isArray(productsData)
          ? productsData.filter(
              (product: Product) =>
                product.active
            )
          : []
      );

      /*
       * The inventory endpoint is location-aware
       * and therefore isn't used for locations here.
       * We load the two known Hanami locations
       * from the promotion response when available.
       */
      const promotionLocations =
        promotionsData
          .map(
            (promotion: Promotion) =>
              promotion.locations
          )
          .filter(
            (
              location: Location | null
            ): location is Location =>
              Boolean(location)
          );

      const uniqueLocations =
        promotionLocations.filter(
          (
            location: Location,
            index: number,
            array: Location[]
          ) =>
            array.findIndex(
              (item) =>
                item.id === location.id
            ) === index
        );

      if (
        uniqueLocations.length > 0
      ) {
        setLocations(
          uniqueLocations
        );
      } else {
        /*
         * Fallback to the known Hanami
         * locations if no promotion exists yet.
         */
        setLocations([
          {
            id:
              "4fab6b19-afd1-4b8d-824a-3dacdfd7e7a3",
            name: "Vivo Imperio",
          },
          {
            id:
              "331ce436-a291-4ba1-83a4-851f62c44a28",
            name: "Mirador",
          },
        ]);
      }

      void locationsData;
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los datos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPromotions =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return promotions.filter(
        (promotion) => {
          const matchesSearch =
            !normalizedSearch ||
            promotion.name
              .toLowerCase()
              .includes(normalizedSearch) ||
            (promotion.code || "")
              .toLowerCase()
              .includes(normalizedSearch);

          const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" &&
              promotion.active) ||
            (statusFilter === "inactive" &&
              !promotion.active);

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      promotions,
      search,
      statusFilter,
    ]);

  const resetForm = () => {
    setFormName("");
    setFormCode("");
    setFormType("percentage");
    setFormDiscountValue("");
    setFormMinimumPurchase("");
    setFormMaxDiscount("");
    setFormStartsAt("");
    setFormExpiresAt("");
    setFormUsageLimit("");
    setFormOnePerCustomer(false);
    setFormAutomatic(false);
    setFormActive(true);
    setFormLocationId("");
    setFormChannel("online");
    setFormDescription("");
    setFormProductIds([]);
  };

  const openCreate = () => {
    setEditingPromotion(null);
    setIsCreating(true);
    resetForm();
    setError("");
  };

  const toDateTimeLocal = (
    value: string | null
  ) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const offset =
      date.getTimezoneOffset();

    const localDate = new Date(
      date.getTime() -
        offset * 60 * 1000
    );

    return localDate
      .toISOString()
      .slice(0, 16);
  };

  const openEdit = (
    promotion: Promotion
  ) => {
    setEditingPromotion(
      promotion
    );
    setIsCreating(false);

    setFormName(
      promotion.name
    );

    setFormCode(
      promotion.code || ""
    );

    setFormType(
      promotion.type
    );

    setFormDiscountValue(
      promotion.discount_value !==
        null
        ? String(
            promotion.discount_value
          )
        : ""
    );

    setFormMinimumPurchase(
      promotion.minimum_purchase !==
        null
        ? String(
            promotion.minimum_purchase
          )
        : ""
    );

    setFormMaxDiscount(
      promotion.max_discount !==
        null
        ? String(
            promotion.max_discount
          )
        : ""
    );

    setFormStartsAt(
      toDateTimeLocal(
        promotion.starts_at
      )
    );

    setFormExpiresAt(
      toDateTimeLocal(
        promotion.expires_at
      )
    );

    setFormUsageLimit(
      promotion.usage_limit !==
        null
        ? String(
            promotion.usage_limit
          )
        : ""
    );

    setFormOnePerCustomer(
      promotion.one_per_customer
    );

    setFormAutomatic(
      promotion.automatic
    );

    setFormActive(
      promotion.active
    );

    setFormLocationId(
      promotion.location_id ||
        ""
    );

    setFormChannel(
      promotion.channel
    );

    setFormDescription(
      promotion.description ||
        ""
    );

    setFormProductIds(
      promotion.promotion_products.map(
        (item) =>
          item.product_id
      )
    );

    setError("");
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setEditingPromotion(null);
    setIsCreating(false);
  };

  const toggleProduct = (
    productId: string
  ) => {
    setFormProductIds(
      (current) =>
        current.includes(productId)
          ? current.filter(
              (id) =>
                id !== productId
            )
          : [
              ...current,
              productId,
            ]
    );
  };

  const savePromotion = async () => {
    try {
      setSaving(true);
      setError("");

      if (!formName.trim()) {
        setError(
          "El nombre de la promoción es obligatorio."
        );
        return;
      }

      if (
        !formAutomatic &&
        !formCode.trim()
      ) {
        setError(
          "Una promoción con código necesita un código."
        );
        return;
      }

      if (
        formType === "3x2" &&
        formProductIds.length === 0
      ) {
        setError(
          "Selecciona al menos un producto para el 3×2."
        );
        return;
      }

      const payload = {
        ...(editingPromotion
          ? {
              id:
                editingPromotion.id,
            }
          : {}),
        name:
          formName.trim(),
        code:
          formCode.trim(),
        type:
          formType,
        discountValue:
          formType === "3x2"
            ? null
            : formDiscountValue,
        minimumPurchase:
          formMinimumPurchase,
        maxDiscount:
          formType ===
          "percentage"
            ? formMaxDiscount
            : null,
        startsAt:
          formStartsAt || null,
        expiresAt:
          formExpiresAt || null,
        usageLimit:
          formUsageLimit,
        onePerCustomer:
          formOnePerCustomer,
        automatic:
          formAutomatic,
        active:
          formActive,
        locationId:
          formLocationId || null,
        channel:
          formChannel,
        description:
          formDescription,
        productIds:
          formProductIds,
      };

      const response =
        await fetch(
          "/api/admin/promotions",
          {
            method:
              editingPromotion
                ? "PATCH"
                : "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              payload
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudo guardar la promoción."
        );
      }

      if (editingPromotion) {
        setPromotions(
          (current) =>
            current.map(
              (promotion) =>
                promotion.id ===
                data.id
                  ? {
                      ...promotion,
                      ...data,
                    }
                  : promotion
            )
        );
      } else {
        setPromotions(
          (current) => [
            data,
            ...current,
          ]
        );
      }

      closeForm();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la promoción."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (
    promotion: Promotion
  ) => {
    try {
      setSaving(true);
      setError("");

      const response =
        await fetch(
          "/api/admin/promotions",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id:
                promotion.id,
              name:
                promotion.name,
              code:
                promotion.code || "",
              type:
                promotion.type,
              discountValue:
                promotion.discount_value,
              minimumPurchase:
                promotion.minimum_purchase,
              maxDiscount:
                promotion.max_discount,
              startsAt:
                promotion.starts_at,
              expiresAt:
                promotion.expires_at,
              usageLimit:
                promotion.usage_limit,
              onePerCustomer:
                promotion.one_per_customer,
              automatic:
                promotion.automatic,
              active:
                !promotion.active,
              buyQuantity:
                promotion.buy_quantity,
              freeQuantity:
                promotion.free_quantity,
              locationId:
                promotion.location_id,
              channel:
                promotion.channel,
              description:
                promotion.description,
              productIds:
                promotion.promotion_products.map(
                  (item) =>
                    item.product_id
                ),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudo actualizar la promoción."
        );
      }

      setPromotions(
        (current) =>
          current.map(
            (item) =>
              item.id === data.id
                ? {
                    ...item,
                    ...data,
                  }
                : item
          )
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la promoción."
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDiscount = (
    promotion: Promotion
  ) => {
    if (
      promotion.type ===
      "percentage"
    ) {
      return `${promotion.discount_value}%`;
    }

    if (
      promotion.type ===
      "fixed"
    ) {
      return `$${(
        promotion.discount_value ||
        0
      ).toLocaleString(
        "es-CL"
      )}`;
    }

    return "3×2";
  };

  const formatChannel = (
    channel: string
  ) => {
    if (channel === "online") {
      return "Online";
    }

    if (channel === "pos") {
      return "POS";
    }

    return "Online + POS";
  };

  if (loading) {
    return (
      <main className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-zinc-400">
            Cargando promociones...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Promociones
            </h1>

            <p className="mt-2 text-zinc-400">
              Crea y administra descuentos controlados para Hanami.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-200"
          >
            + Nueva promoción
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-900 bg-red-950/50 p-4 font-medium text-red-300">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-300">
              Buscar
            </label>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Nombre o código..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-2 focus:ring-white/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-300">
              Estado
            </label>

            <select
              value={
                statusFilter
              }
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500 focus:ring-2 focus:ring-white/10"
            >
              <option value="all">
                Todas
              </option>

              <option value="active">
                Activas
              </option>

              <option value="inactive">
                Inactivas
              </option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1.3fr] gap-4 bg-zinc-800 px-6 py-4 text-sm font-bold text-zinc-300 md:grid">
            <div>Promoción</div>
            <div>Descuento</div>
            <div>Canal</div>
            <div>Usos</div>
            <div>Acciones</div>
          </div>

          <div className="divide-y divide-zinc-800">
            {filteredPromotions.length ===
            0 ? (
              <div className="p-8 text-center text-zinc-500">
                No se encontraron promociones.
              </div>
            ) : (
              filteredPromotions.map(
                (promotion) => (
                  <div
                    key={
                      promotion.id
                    }
                    className="grid gap-4 px-6 py-5 md:grid-cols-[2fr_1fr_1fr_1fr_1.3fr] md:items-center"
                  >
                    <div>
                      <div className="font-semibold text-white">
                        {
                          promotion.name
                        }
                      </div>

                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        {promotion.code && (
                          <span className="rounded-full border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-zinc-300">
                            {
                              promotion.code
                            }
                          </span>
                        )}

                        {promotion.automatic && (
                          <span className="rounded-full bg-purple-950 px-2 py-1 font-semibold text-purple-300">
                            Automática
                          </span>
                        )}

                        {promotion.locations && (
                          <span className="rounded-full bg-zinc-800 px-2 py-1 text-zinc-400">
                            {
                              promotion
                                .locations
                                .name
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="font-semibold text-white">
                      {formatDiscount(
                        promotion
                      )}
                    </div>

                    <div className="text-sm text-zinc-400">
                      {formatChannel(
                        promotion.channel
                      )}
                    </div>

                    <div className="text-sm text-zinc-400">
                      <span className="font-semibold text-white">
                        {
                          promotion.usage_count
                        }
                      </span>

                      {" / "}

                      {promotion.usage_limit ??
                        "∞"}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={
                          saving
                        }
                        onClick={() =>
                          toggleActive(
                            promotion
                          )
                        }
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          promotion.active
                            ? "bg-green-950 text-green-300"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {promotion.active
                          ? "Activa"
                          : "Inactiva"}
                      </button>

                      <button
                        disabled={
                          saving
                        }
                        onClick={() =>
                          openEdit(
                            promotion
                          )
                        }
                        className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>

        <div className="mt-4 text-sm text-zinc-500">
          Mostrando{" "}
          <span className="font-bold text-zinc-200">
            {
              filteredPromotions.length
            }
          </span>{" "}
          de{" "}
          <span className="font-bold text-zinc-200">
            {promotions.length}
          </span>{" "}
          promociones.
        </div>
      </div>

      {(isCreating ||
        editingPromotion) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isCreating
                    ? "Nueva promoción"
                    : "Editar promoción"}
                </h2>

                <p className="mt-1 text-zinc-400">
                  Configura una promoción controlada por Hanami.
                </p>
              </div>

              <button
                onClick={
                  closeForm
                }
                disabled={saving}
                className="text-2xl font-medium text-zinc-500 hover:text-white disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-300">
                  Nombre
                </label>

                <input
                  type="text"
                  value={
                    formName
                  }
                  onChange={(
                    event
                  ) =>
                    setFormName(
                      event.target
                        .value
                    )
                  }
                  placeholder="Ej: 10% de descuento"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-2 focus:ring-white/10"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-300">
                    Código
                  </label>

                  <input
                    type="text"
                    value={
                      formCode
                    }
                    onChange={(
                      event
                    ) =>
                      setFormCode(
                        event.target
                          .value
                          .toUpperCase()
                      )
                    }
                    disabled={
                      formAutomatic
                    }
                    placeholder="Ej: HANAMI10"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-mono text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:bg-zinc-900 disabled:text-zinc-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-300">
                    Tipo
                  </label>

                  <select
                    value={
                      formType
                    }
                    onChange={(
                      event
                    ) => {
                      setFormType(
                        event.target
                          .value
                      );

                      setFormProductIds(
                        []
                      );
                    }}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500 focus:ring-2 focus:ring-white/10"
                  >
                    <option value="percentage">
                      Porcentaje
                    </option>

                    <option value="fixed">
                      Monto fijo
                    </option>

                    <option value="3x2">
                      3×2
                    </option>
                  </select>
                </div>
              </div>

              {formType !==
                "3x2" && (
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-300">
                      {formType ===
                      "percentage"
                        ? "Descuento (%)"
                        : "Descuento ($)"}
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={
                        formDiscountValue
                      }
                      onChange={(
                        event
                      ) =>
                        setFormDiscountValue(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder={
                        formType ===
                        "percentage"
                          ? "10"
                          : "3000"
                      }
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-2 focus:ring-white/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-300">
                      Mínimo de compra
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={
                        formMinimumPurchase
                      }
                      onChange={(
                        event
                      ) =>
                        setFormMinimumPurchase(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Ej: 10000"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-2 focus:ring-white/10"
                    />
                  </div>
                </div>
              )}

              {formType ===
                "percentage" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-300">
                    Descuento máximo
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={
                      formMaxDiscount
                    }
                    onChange={(
                      event
                    ) =>
                      setFormMaxDiscount(
                        event.target
                          .value
                      )
                    }
                    placeholder="Opcional"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-2 focus:ring-white/10"
                  />

                  <p className="mt-1 text-xs text-zinc-500">
                    Ejemplo: 10% con máximo de $5.000 de descuento.
                  </p>
                </div>
              )}

              {formType ===
                "3x2" && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div>
                    <p className="font-semibold text-white">
                      Productos incluidos en el 3×2
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      El cliente compra 3 productos elegibles y el más barato de esos 3 queda gratis.
                    </p>
                  </div>

                  <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
                    {products.map(
                      (product) => {
                        const selected =
                          formProductIds.includes(
                            product.id
                          );

                        return (
                          <button
                            key={
                              product.id
                            }
                            type="button"
                            onClick={() =>
                              toggleProduct(
                                product.id
                              )
                            }
                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
                              selected
                                ? "border-white bg-zinc-800"
                                : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
                            }`}
                          >
                            <div>
                              <p className="font-semibold text-white">
                                {
                                  product.name
                                }
                              </p>

                              <p className="text-xs text-zinc-500">
                                {
                                  product
                                    .category
                                    ?.name
                                }{" "}
                                · $
                                {product.price.toLocaleString(
                                  "es-CL"
                                )}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                selected
                                  ? "bg-white text-black"
                                  : "bg-zinc-800 text-zinc-400"
                              }`}
                            >
                              {selected
                                ? "Incluido"
                                : "Agregar"}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-300">
                    Inicio
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      formStartsAt
                    }
                    onChange={(
                      event
                    ) =>
                      setFormStartsAt(
                        event
                          .target
                          .value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500 focus:ring-2 focus:ring-white/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-300">
                    Término
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      formExpiresAt
                    }
                    onChange={(
                      event
                    ) =>
                      setFormExpiresAt(
                        event
                          .target
                          .value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500 focus:ring-2 focus:ring-white/10"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-300">
                    Límite de usos
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={
                      formUsageLimit
                    }
                    onChange={(
                      event
                    ) =>
                      setFormUsageLimit(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Sin límite"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-2 focus:ring-white/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-300">
                    Local
                  </label>

                  <select
                    value={
                      formLocationId
                    }
                    onChange={(
                      event
                    ) =>
                      setFormLocationId(
                        event
                          .target
                          .value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500 focus:ring-2 focus:ring-white/10"
                  >
                    <option value="">
                      Todos los locales
                    </option>

                    {locations.map(
                      (location) => (
                        <option
                          key={
                            location.id
                          }
                          value={
                            location.id
                          }
                        >
                          {
                            location.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-300">
                    Canal
                  </label>

                  <select
                    value={
                      formChannel
                    }
                    onChange={(
                      event
                    ) =>
                      setFormChannel(
                        event
                          .target
                          .value
                      )
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500 focus:ring-2 focus:ring-white/10"
                  >
                    <option value="online">
                      Solo online
                    </option>

                    <option value="pos">
                      Solo POS
                    </option>

                    <option value="both">
                      Online + POS
                    </option>
                  </select>
                </div>

                <div className="flex items-end">
                  <div className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">
                          Una por cliente
                        </p>

                        <p className="text-xs text-zinc-500">
                          El mismo cliente no podrá reutilizarla.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setFormOnePerCustomer(
                            (
                              current
                            ) =>
                              !current
                          )
                        }
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          formOnePerCustomer
                            ? "bg-green-950 text-green-300"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {formOnePerCustomer
                          ? "Sí"
                          : "No"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">
                      Promoción automática
                    </p>

                    <p className="text-sm text-zinc-500">
                      Se intenta aplicar sin que el cliente ingrese código.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFormAutomatic(
                        (current) =>
                          !current
                      );

                      if (
                        !formAutomatic
                      ) {
                        setFormCode(
                          ""
                        );
                      }
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      formAutomatic
                        ? "bg-purple-950 text-purple-300"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {formAutomatic
                      ? "Automática"
                      : "Con código"}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-300">
                  Descripción
                </label>

                <textarea
                  value={
                    formDescription
                  }
                  onChange={(
                    event
                  ) =>
                    setFormDescription(
                      event
                        .target
                        .value
                    )
                  }
                  rows={3}
                  placeholder="Descripción interna de la promoción..."
                  className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-2 focus:ring-white/10"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <div>
                  <p className="font-semibold text-white">
                    Promoción activa
                  </p>

                  <p className="text-sm text-zinc-500">
                    Si está inactiva, ningún cliente podrá utilizarla.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFormActive(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    formActive
                      ? "bg-green-950 text-green-300"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {formActive
                    ? "Activa"
                    : "Inactiva"}
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={
                  closeForm
                }
                disabled={
                  saving
                }
                className="flex-1 rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                onClick={
                  savePromotion
                }
                disabled={
                  saving
                }
                className="flex-1 rounded-xl bg-white px-4 py-3 font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
              >
                {saving
                  ? "Guardando..."
                  : isCreating
                    ? "Crear promoción"
                    : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}