"use client";

import { useEffect, useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  display_order: number;
};

type Product = {
  id: string;
  name: string;
  category_id: string;
  price: number;
  image: string | null;
  active: boolean;
  category: Category | null;
};

type CartItem = {
  product: Product;
  quantity: number;
  option: string | null;
};

type Location = {
  id: string;
  name: string;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

const locations: Location[] = [
  {
    id: "4fab6b19-afd1-4b8d-824a-3dacdfd7e7a3",
    name: "Vivo Imperio",
  },
  {
    id: "331ce436-a291-4ba1-83a4-851f62c44a28",
    name: "Mirador",
  },
];

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedLocation, setSelectedLocation] = useState(
    locations[0].id
  );

  const [selectedCategory, setSelectedCategory] =
    useState<string>("all");

  const [cart, setCart] = useState<CartItem[]>([]);

  const [paymentMethod, setPaymentMethod] =
    useState<"efectivo" | "transferencia">("efectivo");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState<Customer | null>(null);

  const [showCustomerModal, setShowCustomerModal] =
    useState(false);

  const [customerSearch, setCustomerSearch] =
    useState("");

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [showCreateCustomer, setShowCreateCustomer] =
    useState(false);

  const [newCustomerName, setNewCustomerName] =
    useState("");

  const [newCustomerPhone, setNewCustomerPhone] =
    useState("");

  const [newCustomerEmail, setNewCustomerEmail] =
    useState("");

  const [creatingCustomer, setCreatingCustomer] =
    useState(false);

  const [charging, setCharging] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/products",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudieron cargar los productos"
        );
      }

      const loadedProducts: Product[] = Array.isArray(data)
        ? data
        : data.products || [];

      setProducts(loadedProducts);

      const categoryMap = new Map<string, Category>();

      for (const product of loadedProducts) {
        if (product.category) {
          categoryMap.set(
            product.category.id,
            product.category
          );
        }
      }

      setCategories(
        Array.from(categoryMap.values()).sort(
          (a, b) =>
            a.display_order - b.display_order
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error cargando productos"
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    let result = products.filter(
      (product) => product.active
    );

    if (selectedCategory !== "all") {
      result = result.filter(
        (product) =>
          product.category_id === selectedCategory
      );
    }

    return result;
  }, [
    products,
    selectedCategory,
  ]);

  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        item.product.price * item.quantity,
      0
    );
  }, [cart]);

  function addToCart(product: Product) {
    setSuccessMessage("");

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) =>
          item.product.id === product.id
      );

      if (existing) {
        return currentCart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          product,
          quantity: 1,
          option: null,
        },
      ];
    });
  }

  function increaseQuantity(productId: string) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(productId: string) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  }

  function removeFromCart(productId: string) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item.product.id !== productId
      )
    );
  }

  function clearCart() {
    setCart([]);
    setCustomer(null);
    setSuccessMessage("");
  }

  async function searchCustomers() {
    if (!customerSearch.trim()) {
      setCustomers([]);
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `/api/admin/customers?search=${encodeURIComponent(
          customerSearch.trim()
        )}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudieron buscar clientes"
        );
      }

      setCustomers(data.customers || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error buscando clientes"
      );
    }
  }

  async function createCustomer() {
    if (!newCustomerName.trim()) {
      setError(
        "El nombre del cliente es obligatorio"
      );
      return;
    }

    if (!newCustomerPhone.trim()) {
      setError(
        "El teléfono del cliente es obligatorio"
      );
      return;
    }

    try {
      setCreatingCustomer(true);
      setError("");

      const response = await fetch(
        "/api/admin/customers",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: newCustomerName.trim(),
            phone: newCustomerPhone.trim(),
            email:
              newCustomerEmail.trim() ||
              null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudo crear el cliente"
        );
      }

      setCustomer(data.customer);

      setNewCustomerName("");
      setNewCustomerPhone("");
      setNewCustomerEmail("");

      setShowCreateCustomer(false);
      setShowCustomerModal(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error creando cliente"
      );
    } finally {
      setCreatingCustomer(false);
    }
  }

  async function chargeSale() {
    if (cart.length === 0) {
      setError("El carrito está vacío");
      return;
    }

    try {
      setCharging(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        "/api/admin/pos",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            cart,
            paymentMethod,
            locationId: selectedLocation,
            customerId: customer?.id || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudo completar la venta"
        );
      }

      setSuccessMessage(
        `Venta #${data.orderNumber} completada — $${data.total.toLocaleString(
          "es-CL"
        )}`
      );

      setCart([]);
      setCustomer(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error procesando la venta"
      );
    } finally {
      setCharging(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-6">
        <p className="text-gray-500">
          Cargando POS...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-4 md:p-6">
      <div className="mx-auto max-w-[1600px]">

        {/* HEADER */}

        <div className="mb-4 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              POS
            </h1>

            <p className="text-sm text-gray-500">
              Venta presencial
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <select
              value={selectedLocation}
              onChange={(event) =>
                setSelectedLocation(
                  event.target.value
                )
              }
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 outline-none focus:border-black"
            >
              {locations.map(
                (location) => (
                  <option
                    key={location.id}
                    value={location.id}
                  >
                    {location.name}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              onClick={() =>
                setShowCustomerModal(true)
              }
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:border-gray-500"
            >
              {customer
                ? `👤 ${customer.name}`
                : "👤 Sin cliente"}
            </button>

          </div>
        </div>

        {/* MESSAGES */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {successMessage}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[1fr_400px]">

          {/* PRODUCTS */}

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">

              <button
                type="button"
                onClick={() =>
                  setSelectedCategory("all")
                }
                className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium ${
                  selectedCategory === "all"
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                Todos
              </button>

              {categories.map(
                (category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(
                        category.id
                      )
                    }
                    className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium ${
                      selectedCategory ===
                      category.id
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {category.name}
                  </button>
                )
              )}

            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                No hay productos activos.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">

                {filteredProducts.map(
                  (product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() =>
                        addToCart(product)
                      }
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white text-left transition hover:border-gray-400 hover:shadow-md active:scale-[0.98]"
                    >

                      <div className="aspect-square bg-gray-50">

                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-3xl">
                            🍡
                          </div>
                        )}

                      </div>

                      <div className="p-3">

                        <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                          {product.name}
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-500">
                          $
                          {product.price.toLocaleString(
                            "es-CL"
                          )}
                        </p>

                      </div>

                    </button>
                  )
                )}

              </div>
            )}

          </section>

          {/* CART */}

          <aside className="flex h-fit flex-col rounded-2xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-4">

            <div className="border-b border-gray-200 p-4">

              <div className="flex items-center justify-between">

                <h2 className="text-lg font-bold text-gray-900">
                  Venta
                </h2>

                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Vaciar
                  </button>
                )}

              </div>

              {customer && (
                <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3 text-sm">
                  <p className="font-semibold text-gray-900">
                    👤 {customer.name}
                  </p>

                  <p className="text-gray-500">
                    {customer.phone}
                  </p>
                </div>
              )}

            </div>

            <div className="max-h-[45vh] overflow-y-auto p-4">

              {cart.length === 0 ? (
                <div className="py-12 text-center">

                  <div className="text-4xl">
                    🛒
                  </div>

                  <p className="mt-3 font-medium text-gray-700">
                    Carrito vacío
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    Selecciona productos para comenzar
                  </p>

                </div>
              ) : (
                <div className="space-y-3">

                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="rounded-xl border border-gray-200 bg-white p-3"
                    >

                      <div className="flex justify-between gap-3">

                        <div className="min-w-0">

                          <p className="font-semibold text-gray-900">
                            {item.product.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            $
                            {item.product.price.toLocaleString(
                              "es-CL"
                            )}{" "}
                            c/u
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              item.product.id
                            )
                          }
                          className="text-gray-400 hover:text-red-600"
                        >
                          ×
                        </button>

                      </div>

                      <div className="mt-3 flex items-center justify-between">

                        <div className="flex items-center rounded-lg border border-gray-200">

                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item.product.id
                              )
                            }
                            className="px-3 py-1 text-lg text-gray-700 hover:bg-gray-50"
                          >
                            −
                          </button>

                          <span className="min-w-8 text-center text-sm font-semibold text-gray-900">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                item.product.id
                              )
                            }
                            className="px-3 py-1 text-lg text-gray-700 hover:bg-gray-50"
                          >
                            +
                          </button>

                        </div>

                        <p className="font-bold text-gray-900">
                          $
                          {(
                            item.product.price *
                            item.quantity
                          ).toLocaleString(
                            "es-CL"
                          )}
                        </p>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>

            <div className="border-t border-gray-200 p-4">

              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-500">
                  Total
                </span>

                <span className="text-2xl font-bold text-gray-900">
                  $
                  {total.toLocaleString(
                    "es-CL"
                  )}
                </span>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod("efectivo")
                  }
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                    paymentMethod ===
                    "efectivo"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  💵 Efectivo
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod(
                      "transferencia"
                    )
                  }
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                    paymentMethod ===
                    "transferencia"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  🏦 Transferencia
                </button>

              </div>

              <button
                type="button"
                disabled={
                  cart.length === 0 ||
                  charging
                }
                onClick={chargeSale}
                className="w-full rounded-xl bg-black px-4 py-4 text-base font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                {charging
                  ? "Procesando..."
                  : `Cobrar $${total.toLocaleString(
                      "es-CL"
                    )}`}
              </button>

            </div>

          </aside>

        </div>

      </div>

      {/* CUSTOMER MODAL */}

      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">

            <div className="mb-4 flex items-center justify-between">

              <h2 className="text-xl font-bold text-gray-900">
                Cliente
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowCustomerModal(false)
                }
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>

            </div>

            {!showCreateCustomer ? (
              <>
                <div className="flex gap-2">

                  <input
                    value={customerSearch}
                    onChange={(event) =>
                      setCustomerSearch(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        searchCustomers();
                      }
                    }}
                    placeholder="Buscar por nombre o teléfono"
                    className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-black"
                  />

                  <button
                    type="button"
                    onClick={searchCustomers}
                    className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    Buscar
                  </button>

                </div>

                <div className="mt-4 max-h-64 overflow-y-auto">

                  {customers.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-400">
                      Busca un cliente existente.
                    </p>
                  ) : (
                    <div className="space-y-2">

                      {customers.map(
                        (customerItem) => (
                          <button
                            key={
                              customerItem.id
                            }
                            type="button"
                            onClick={() => {
                              setCustomer(
                                customerItem
                              );
                              setShowCustomerModal(
                                false
                              );
                            }}
                            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-left hover:border-gray-400"
                          >

                            <p className="font-semibold text-gray-900">
                              {
                                customerItem.name
                              }
                            </p>

                            <p className="text-sm text-gray-500">
                              {
                                customerItem.phone
                              }
                            </p>

                          </button>
                        )
                      )}

                    </div>
                  )}

                </div>

                <div className="mt-4 border-t border-gray-200 pt-4">

                  <button
                    type="button"
                    onClick={() =>
                      setShowCreateCustomer(true)
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:border-gray-500"
                  >
                    + Crear nuevo cliente
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCustomer(null);
                      setShowCustomerModal(false);
                    }}
                    className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Vender sin cliente
                  </button>

                </div>
              </>
            ) : (
              <div className="space-y-3">

                <input
                  value={newCustomerName}
                  onChange={(event) =>
                    setNewCustomerName(
                      event.target.value
                    )
                  }
                  placeholder="Nombre *"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-black"
                />

                <input
                  value={newCustomerPhone}
                  onChange={(event) =>
                    setNewCustomerPhone(
                      event.target.value
                    )
                  }
                  placeholder="Teléfono *"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-black"
                />

                <input
                  value={newCustomerEmail}
                  onChange={(event) =>
                    setNewCustomerEmail(
                      event.target.value
                    )
                  }
                  placeholder="Email (opcional)"
                  type="email"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-black"
                />

                <div className="flex gap-2 pt-2">

                  <button
                    type="button"
                    onClick={() =>
                      setShowCreateCustomer(false)
                    }
                    className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:border-gray-500"
                  >
                    Volver
                  </button>

                  <button
                    type="button"
                    onClick={createCustomer}
                    disabled={
                      creatingCustomer
                    }
                    className="flex-1 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    {creatingCustomer
                      ? "Creando..."
                      : "Crear cliente"}
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </main>
  );
}