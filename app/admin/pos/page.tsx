"use client";

import { useEffect, useState } from "react";
import { products } from "@/data/products";

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

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type StockProduct = {
  id: string;
  stock: number;
  active: boolean;
};

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [stockProducts, setStockProducts] = useState<StockProduct[]>([]);

  const [locationId, setLocationId] = useState(
    locations[0].id
  );

  const currentLocation = locations.find(
    (location) => location.id === locationId
  );

  useEffect(() => {
    async function loadStock() {
      try {
        const response = await fetch(
          `/api/products?locationId=${locationId}`
        );

        const data = await response.json();

        console.log("POS STOCK DATA:", data);

        if (response.ok) {
          setStockProducts(data);
        }
      } catch (error) {
        console.error("ERROR CARGANDO STOCK:", error);
      }
    }

    loadStock();
  }, [locationId]);

  useEffect(() => {
    console.log("STOCK STATE:", stockProducts);
  }, [stockProducts]);

  function getStock(productId: string) {
    return (
      stockProducts.find(
        (item) => item.id === productId
      )?.stock ?? 0
    );
  }

  function getProductStatus(productId: string) {
    return stockProducts.find(
      (item) => item.id === productId
    );
  }

  function addToCart(product: (typeof products)[number]) {
    const stock = getStock(product.id);
    const stockProduct = getProductStatus(product.id);

    if (stockProduct?.active === false) {
      alert(`${product.name} no está disponible.`);
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.productId === product.id
      );

      if (existing) {
        if (existing.quantity >= stock) {
          alert("No hay más stock disponible.");
          return currentCart;
        }

        return currentCart.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      if (stock <= 0) {
        alert(`${product.name} está agotado.`);
        return currentCart;
      }

      return [
        ...currentCart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(productId: string) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  async function handleCheckout() {
    if (!cart.length) return;

    if (!paymentMethod) {
      alert("Selecciona un método de pago.");
      return;
    }

    try {
      const response = await fetch("/api/admin/pos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart,
          total,
          paymentMethod,
          locationId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "No se pudo registrar la venta"
        );
      }

      alert(
        `Venta registrada en ${currentLocation?.name}. Pedido #${result.orderNumber}`
      );

      setCart([]);
      setPaymentMethod("");

      const stockResponse = await fetch(
        `/api/products?locationId=${locationId}`
      );

      const stockData = await stockResponse.json();

      if (stockResponse.ok) {
        setStockProducts(stockData);
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo registrar la venta"
      );
    }
  }

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_380px]">
        {/* PRODUCTOS */}
        <section className="rounded-2xl bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                POS
              </h1>

              <p className="mt-1 text-gray-500">
                Venta presencial
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
                  setCart([]);
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

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const stock = getStock(product.id);

              console.log(
                "PRODUCT STOCK:",
                product.id,
                stock
              );

              const stockProduct =
                getProductStatus(product.id);

              const isInactive =
                stockProduct?.active === false;

              const isOutOfStock = stock === 0;

              const isUnavailable =
                isInactive || isOutOfStock;

              return (
                <button
                  key={product.id}
                  onClick={() =>
                    addToCart(product)
                  }
                  disabled={isUnavailable}
                  className={`rounded-2xl border bg-white p-4 text-left transition ${
                    isUnavailable
                      ? "cursor-not-allowed opacity-50"
                      : "hover:shadow-md"
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />

                    {isUnavailable && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="rounded-full bg-black px-3 py-2 text-sm font-semibold text-white">
                          {isInactive
                            ? "No disponible"
                            : "Agotado"}
                        </span>
                      </div>
                    )}
                  </div>

                  <h2 className="mt-3 font-semibold">
                    {product.name}
                  </h2>

                  <p className="mt-1 text-gray-600">
                    $
                    {product.price.toLocaleString(
                      "es-CL"
                    )}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Stock: {stock}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* CARRITO */}
        <aside className="h-fit rounded-2xl bg-white p-6 lg:sticky lg:top-6">
          <h2 className="text-2xl font-bold">
            Venta
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {currentLocation?.name}
          </p>

          <div className="mt-6 space-y-4">
            {cart.length === 0 ? (
              <p className="text-gray-500">
                No hay productos agregados.
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {item.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      $
                      {item.price.toLocaleString(
                        "es-CL"
                      )}{" "}
                      × {item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        removeFromCart(
                          item.productId
                        )
                      }
                      className="h-8 w-8 rounded-full border"
                    >
                      −
                    </button>

                    <span className="w-5 text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => {
                        const product =
                          products.find(
                            (p) =>
                              p.id ===
                              item.productId
                          );

                        if (product) {
                          addToCart(product);
                        }
                      }}
                      className="h-8 w-8 rounded-full border"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>

              <span>
                $
                {total.toLocaleString("es-CL")}
              </span>
            </div>

            {/* MÉTODO DE PAGO */}
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">
                Método de pago
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    setPaymentMethod("efectivo")
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                    paymentMethod === "efectivo"
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Efectivo
                </button>

                <button
                  onClick={() =>
                    setPaymentMethod("tarjeta")
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                    paymentMethod === "tarjeta"
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Tarjeta
                </button>

                <button
                  onClick={() =>
                    setPaymentMethod(
                      "transferencia"
                    )
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                    paymentMethod ===
                    "transferencia"
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Transferencia
                </button>

                <button
                  onClick={() =>
                    setPaymentMethod("otro")
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                    paymentMethod === "otro"
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Otro
                </button>
              </div>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="mt-6 w-full rounded-full bg-black px-4 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Cobrar $
              {total.toLocaleString("es-CL")}
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}