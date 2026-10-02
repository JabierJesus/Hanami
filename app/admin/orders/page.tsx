"use client";

import { useEffect, useRef, useState } from "react";

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

type OrderItem = {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  option: string | null;
};

type Order = {
  id: string;
  order_number: number;
  customer_id: string | null;
  order_type: string;
  order_time: string | null;
  payment_method: string;
  total: number;
  status: string;
  created_at: string;
  location_id: string | null;
  customers: {
    name: string;
    phone: string;
    email: string | null;
  } | null;
  order_items: OrderItem[];
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [locationId, setLocationId] = useState(
    locations[0].id
  );

  const [newOrderNumber, setNewOrderNumber] =
    useState<number | null>(null);

  const [knownOrderIds, setKnownOrderIds] = useState<
    Set<string>
  >(new Set());

  const [soundEnabled, setSoundEnabled] =
    useState(false);

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(
    null
  );

  useEffect(() => {
    audioRef.current = new Audio(
      "/sounds/new-order.mp3"
    );

    audioRef.current.volume = 1;

    loadOrders();
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    const interval = setInterval(() => {
      checkForNewOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [
    loading,
    locationId,
    knownOrderIds,
    soundEnabled,
    notificationsEnabled,
  ]);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/orders",
        {
          cache: "no-store",
        }
      );

      const text = await response.text();

      if (!response.ok) {
        let errorMessage =
          "No se pudieron cargar los pedidos.";

        if (text) {
          try {
            const data = JSON.parse(text);

            if (data.error) {
              errorMessage = data.error;
            }
          } catch {
            console.error(
              "RESPUESTA NO JSON DEL SERVIDOR:",
              text
            );
          }
        }

        throw new Error(errorMessage);
      }

      const data: Order[] = text
        ? JSON.parse(text)
        : [];

      setOrders(data || []);

      setKnownOrderIds(
        new Set(
          (data || []).map(
            (order) => order.id
          )
        )
      );
    } catch (error) {
      console.error(
        "ERROR CARGANDO PEDIDOS:",
        error
      );

      setError(
        "No se pudieron cargar los pedidos."
      );
    } finally {
      setLoading(false);
    }
  }

  async function enableSound() {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(
          "/sounds/new-order.mp3"
        );
      }

      audioRef.current.currentTime = 0;

      await audioRef.current.play();

      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      setSoundEnabled(true);
    } catch (error) {
      console.error(
        "ERROR ACTIVANDO SONIDO:",
        error
      );

      alert(
        "No se pudo activar el sonido. Revisa que new-order.mp3 exista en public/sounds/."
      );
    }
  }

  function disableSound() {
    setSoundEnabled(false);
  }

  async function enableNotifications() {
    if (!("Notification" in window)) {
      alert(
        "Este navegador no admite notificaciones de escritorio."
      );
      return;
    }

    try {
      const permission =
        await Notification.requestPermission();

      if (permission === "granted") {
        setNotificationsEnabled(true);

        new Notification("Hanami", {
          body: "Las notificaciones de nuevos pedidos están activadas.",
        });
      } else if (permission === "denied") {
        alert(
          "Las notificaciones están bloqueadas en el navegador. Debes permitirlas desde la configuración del navegador."
        );
      }
    } catch (error) {
      console.error(
        "ERROR ACTIVANDO NOTIFICACIONES:",
        error
      );

      alert(
        "No se pudieron activar las notificaciones."
      );
    }
  }

  function disableNotifications() {
    setNotificationsEnabled(false);
  }

  function showNewOrderNotification(
    orderNumber: number
  ) {
    if (!notificationsEnabled) {
      return;
    }

    if (
      !("Notification" in window) ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    new Notification("Hanami — Nuevo pedido", {
      body: `Pedido #HANAMI-${orderNumber} está esperando.`,
      icon: "/favicon.ico",
    });
  }

  async function playNewOrderSound() {
    if (!soundEnabled) {
      return;
    }

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(
          "/sounds/new-order.mp3"
        );
      }

      audioRef.current.currentTime = 0;

      await audioRef.current.play();
    } catch (error) {
      console.error(
        "ERROR REPRODUCIENDO SONIDO:",
        error
      );
    }
  }

  async function checkForNewOrders() {
    try {
      const response = await fetch(
        "/api/admin/orders",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return;
      }

      const text = await response.text();

      if (!text) {
        return;
      }

      const data: Order[] = JSON.parse(text);

      const currentKnownIds = knownOrderIds;

      const newOrders = data.filter(
        (order) =>
          !currentKnownIds.has(order.id) &&
          order.location_id === locationId &&
          order.status === "pending"
      );

      if (newOrders.length > 0) {
        const newestOrder = newOrders[0];

        setNewOrderNumber(
          newestOrder.order_number
        );

        await playNewOrderSound();

        showNewOrderNotification(
          newestOrder.order_number
        );

        setTimeout(() => {
          setNewOrderNumber(null);
        }, 8000);
      }

      setOrders(data || []);

      setKnownOrderIds(
        new Set(
          (data || []).map(
            (order) => order.id
          )
        )
      );
    } catch (error) {
      console.error(
        "ERROR BUSCANDO NUEVOS PEDIDOS:",
        error
      );
    }
  }

  async function updateStatus(
    orderId: string,
    status: string
  ) {
    const order = orders.find(
      (currentOrder) =>
        currentOrder.id === orderId
    );

    if (!order) {
      return;
    }

    if (order.status === "cancelled") {
      alert(
        "Esta venta ya está cancelada y no puede volver a activarse."
      );
      return;
    }

    if (status === "cancelled") {
      const confirmed = window.confirm(
        `¿Seguro que quieres cancelar la venta #HANAMI-${order.order_number}?\n\nEsta acción devolverá el stock de los productos y la venta quedará registrada como cancelada.`
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      const response = await fetch(
        "/api/admin/orders/status",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            status,
          }),
        }
      );

      const text = await response.text();

      let data: { error?: string } = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          console.error(
            "RESPUESTA NO JSON DEL SERVIDOR:",
            text
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudo actualizar el pedido"
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === orderId
            ? {
                ...currentOrder,
                status,
              }
            : currentOrder
        )
      );
    } catch (error) {
      console.error(
        "ERROR ACTUALIZANDO ESTADO:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado del pedido."
      );
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "pending":
        return "Pendiente";

      case "preparing":
        return "Preparando";

      case "ready":
        return "Listo";

      case "completed":
        return "Completado";

      case "cancelled":
        return "Cancelado";

      default:
        return status;
    }
  }

  function getStatusClass(status: string) {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";

      case "preparing":
        return "bg-blue-100 text-blue-800";

      case "ready":
        return "bg-green-100 text-green-800";

      case "completed":
        return "bg-gray-100 text-gray-800";

      case "cancelled":
        return "bg-red-100 text-red-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.location_id === locationId
  );

  if (loading) {
    return (
      <main className="px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <p>Cargando pedidos...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-red-600">
            {error}
          </p>

          <button
            onClick={loadOrders}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-white"
          >
            Intentar nuevamente
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">

        {newOrderNumber !== null && (
          <div className="mb-6 rounded-2xl border border-yellow-300 bg-yellow-100 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-yellow-900">
                  🔔 ¡Nuevo pedido!
                </p>

                <p className="mt-1 text-sm text-yellow-800">
                  Pedido #HANAMI-{newOrderNumber} acaba de llegar.
                </p>
              </div>

              <button
                onClick={() =>
                  setNewOrderNumber(null)
                }
                className="rounded-xl bg-yellow-200 px-4 py-2 text-sm font-semibold text-yellow-900 hover:bg-yellow-300"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-bold">
              Pedidos Hanami
            </h1>

            <p className="mt-2 text-gray-600">
              Gestiona los pedidos recibidos.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Local
            </label>

            <select
              value={locationId}
              onChange={(event) => {
                setLocationId(
                  event.target.value
                );
                setNewOrderNumber(null);
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

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            {filteredOrders.length} pedido
            {filteredOrders.length !== 1
              ? "s"
              : ""}
          </p>

          <div className="flex flex-wrap gap-2">
            {soundEnabled ? (
              <button
                onClick={disableSound}
                className="rounded-xl border bg-white px-4 py-2 font-medium shadow-sm hover:bg-gray-50"
              >
                🔊 Sonidos activados
              </button>
            ) : (
              <button
                onClick={enableSound}
                className="rounded-xl bg-black px-4 py-2 font-medium text-white hover:bg-gray-800"
              >
                🔊 Activar sonidos
              </button>
            )}

            {notificationsEnabled ? (
              <button
                onClick={disableNotifications}
                className="rounded-xl border bg-white px-4 py-2 font-medium shadow-sm hover:bg-gray-50"
              >
                🔔 Notificaciones activadas
              </button>
            ) : (
              <button
                onClick={enableNotifications}
                className="rounded-xl bg-black px-4 py-2 font-medium text-white hover:bg-gray-800"
              >
                🔔 Activar notificaciones
              </button>
            )}

            <button
              onClick={loadOrders}
              className="rounded-xl border bg-white px-4 py-2 font-medium shadow-sm hover:bg-gray-50"
            >
              Actualizar
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center">
              <p className="text-gray-500">
                No hay pedidos para este local.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Pedido
                    </p>

                    <h2 className="text-2xl font-bold">
                      #HANAMI-{order.order_number}
                    </h2>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-500">
                      Estado
                    </p>

                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(
                        order.status
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      Cliente
                    </p>

                    <p className="font-semibold">
                      {order.customers?.name ||
                        "Sin nombre"}
                    </p>

                    <p className="text-sm text-gray-600">
                      {order.customers?.phone ||
                        "Sin teléfono"}
                    </p>

                    {order.customers?.email && (
                      <p className="text-sm text-gray-600">
                        {order.customers.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Tipo de pedido
                    </p>

                    <p className="font-semibold">
                      {order.order_type ===
                      "retiro"
                        ? "🏪 Retiro"
                        : order.order_type ===
                          "presencial"
                        ? "🏬 Presencial"
                        : "🚚 Delivery"}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Pago:{" "}
                      {order.payment_method}
                    </p>

                    {order.order_time && (
                      <p className="text-sm text-gray-600">
                        Hora:{" "}
                        {order.order_time}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Total
                    </p>

                    <p className="text-xl font-bold">
                      $
                      {order.total.toLocaleString(
                        "es-CL"
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t pt-5">
                  <p className="mb-3 text-sm font-medium text-gray-500">
                    Productos
                  </p>

                  <div className="space-y-3">
                    {order.order_items?.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
                        >
                          <div>
                            <p className="font-semibold">
                              {item.quantity} ×{" "}
                              {
                                item.product_name
                              }
                            </p>

                            {item.option && (
                              <p className="text-sm text-gray-500">
                                Opción:{" "}
                                {item.option}
                              </p>
                            )}
                          </div>

                          <p className="font-semibold">
                            $
                            {(
                              item.unit_price *
                              item.quantity
                            ).toLocaleString(
                              "es-CL"
                            )}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t pt-4">
                  <p className="text-sm text-gray-500">
                    Recibido
                  </p>

                  <p className="text-sm">
                    {new Date(
                      order.created_at
                    ).toLocaleString(
                      "es-CL"
                    )}
                  </p>
                </div>

                {order.status !==
                  "cancelled" &&
                  order.status !==
                    "completed" && (
                    <div className="mt-6 border-t pt-5">
                      <p className="text-sm font-medium text-gray-500">
                        Cambiar estado
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {order.status ===
                          "pending" && (
                          <button
                            onClick={() =>
                              updateStatus(
                                order.id,
                                "preparing"
                              )
                            }
                            className="rounded-xl bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-200"
                          >
                            🛠️ Aceptar y preparar
                          </button>
                        )}

                        {order.status ===
                          "preparing" && (
                          <button
                            onClick={() =>
                              updateStatus(
                                order.id,
                                "ready"
                              )
                            }
                            className="rounded-xl bg-green-100 px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-200"
                          >
                            ✅ Marcar como listo
                          </button>
                        )}

                        {order.status ===
                          "ready" && (
                          <button
                            onClick={() =>
                              updateStatus(
                                order.id,
                                "completed"
                              )
                            }
                            className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200"
                          >
                            🏪 Entregar pedido
                          </button>
                        )}

                        <button
                          onClick={() =>
                            updateStatus(
                              order.id,
                              "cancelled"
                            )
                          }
                          className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-200"
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                {order.status ===
                  "completed" && (
                  <div className="mt-6 rounded-xl bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-800">
                      Pedido completado
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      El pedido fue entregado al cliente.
                    </p>

                    <button
                      onClick={() =>
                        updateStatus(
                          order.id,
                          "cancelled"
                        )
                      }
                      className="mt-3 rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-200"
                    >
                      ❌ Cancelar venta
                    </button>
                  </div>
                )}

                {order.status ===
                  "cancelled" && (
                  <div className="mt-6 rounded-xl bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-800">
                      Venta cancelada
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                      Esta venta se mantiene en el historial y
                      no puede volver a activarse.
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}