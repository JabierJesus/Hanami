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
        return "border-yellow-800/60 bg-yellow-950/60 text-yellow-300";

      case "preparing":
        return "border-blue-800/60 bg-blue-950/60 text-blue-300";

      case "ready":
        return "border-green-800/60 bg-green-950/60 text-green-300";

      case "completed":
        return "border-zinc-700 bg-zinc-800 text-zinc-300";

      case "cancelled":
        return "border-red-800/60 bg-red-950/60 text-red-300";

      default:
        return "border-zinc-700 bg-zinc-800 text-zinc-300";
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.location_id === locationId
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
        <div className="mx-auto max-w-5xl">
          <p className="text-zinc-400">
            Cargando pedidos...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
        <div className="mx-auto max-w-5xl">
          <p className="text-red-400">
            {error}
          </p>

          <button
            onClick={loadOrders}
            className="mt-4 rounded-xl bg-white px-4 py-2 font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            Intentar nuevamente
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        {newOrderNumber !== null && (
          <div className="mb-6 rounded-2xl border border-yellow-700/70 bg-yellow-950/50 p-5 shadow-lg shadow-yellow-950/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-yellow-300">
                  🔔 ¡Nuevo pedido!
                </p>

                <p className="mt-1 text-sm text-yellow-200/80">
                  Pedido #HANAMI-{newOrderNumber} acaba de llegar.
                </p>
              </div>

              <button
                onClick={() =>
                  setNewOrderNumber(null)
                }
                className="rounded-xl border border-yellow-700/60 bg-yellow-900/60 px-4 py-2 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-800/70"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Hanami Admin
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
              Pedidos Hanami
            </h1>

            <p className="mt-2 text-zinc-400">
              Gestiona los pedidos recibidos.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-400">
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

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-500">
            {filteredOrders.length} pedido
            {filteredOrders.length !== 1
              ? "s"
              : ""}
          </p>

          <div className="flex flex-wrap gap-2">
            {soundEnabled ? (
              <button
                onClick={disableSound}
                className="rounded-xl border border-green-800/60 bg-green-950/50 px-4 py-2 font-medium text-green-300 transition hover:bg-green-900/60"
              >
                🔊 Sonidos activados
              </button>
            ) : (
              <button
                onClick={enableSound}
                className="rounded-xl bg-white px-4 py-2 font-medium text-zinc-950 transition hover:bg-zinc-200"
              >
                🔊 Activar sonidos
              </button>
            )}

            {notificationsEnabled ? (
              <button
                onClick={disableNotifications}
                className="rounded-xl border border-green-800/60 bg-green-950/50 px-4 py-2 font-medium text-green-300 transition hover:bg-green-900/60"
              >
                🔔 Notificaciones activadas
              </button>
            ) : (
              <button
                onClick={enableNotifications}
                className="rounded-xl bg-white px-4 py-2 font-medium text-zinc-950 transition hover:bg-zinc-200"
              >
                🔔 Activar notificaciones
              </button>
            )}

            <button
              onClick={loadOrders}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 font-medium text-zinc-200 shadow-sm transition hover:border-zinc-600 hover:bg-zinc-800"
            >
              Actualizar
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <p className="text-zinc-500">
                No hay pedidos para este local.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg shadow-black/20"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <p className="text-sm font-medium text-zinc-500">
                      Pedido
                    </p>

                    <h2 className="text-2xl font-bold text-white">
                      #HANAMI-{order.order_number}
                    </h2>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm text-zinc-500">
                      Estado
                    </p>

                    <span
                      className={`mt-1 inline-block rounded-full border px-3 py-1 text-sm font-semibold ${getStatusClass(
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
                    <p className="text-sm text-zinc-500">
                      Cliente
                    </p>

                    <p className="font-semibold text-zinc-100">
                      {order.customers?.name ||
                        "Sin nombre"}
                    </p>

                    <p className="text-sm text-zinc-400">
                      {order.customers?.phone ||
                        "Sin teléfono"}
                    </p>

                    {order.customers?.email && (
                      <p className="break-all text-sm text-zinc-400">
                        {order.customers.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500">
                      Tipo de pedido
                    </p>

                    <p className="font-semibold text-zinc-100">
                      {order.order_type ===
                      "retiro"
                        ? "🏪 Retiro"
                        : order.order_type ===
                          "presencial"
                        ? "🏬 Presencial"
                        : "🚚 Delivery"}
                    </p>

                    <p className="mt-1 text-sm text-zinc-400">
                      Pago:{" "}
                      {order.payment_method}
                    </p>

                    {order.order_time && (
                      <p className="text-sm text-zinc-400">
                        Hora:{" "}
                        {order.order_time}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500">
                      Total
                    </p>

                    <p className="text-xl font-bold text-white">
                      $
                      {order.total.toLocaleString(
                        "es-CL"
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-zinc-800 pt-5">
                  <p className="mb-3 text-sm font-medium text-zinc-500">
                    Productos
                  </p>

                  <div className="space-y-3">
                    {order.order_items?.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3"
                        >
                          <div>
                            <p className="font-semibold text-zinc-100">
                              {item.quantity} ×{" "}
                              {
                                item.product_name
                              }
                            </p>

                            {item.option && (
                              <p className="text-sm text-zinc-500">
                                Opción:{" "}
                                {item.option}
                              </p>
                            )}
                          </div>

                          <p className="font-semibold text-zinc-200">
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

                <div className="mt-6 border-t border-zinc-800 pt-4">
                  <p className="text-sm text-zinc-500">
                    Recibido
                  </p>

                  <p className="text-sm text-zinc-300">
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
                    <div className="mt-6 border-t border-zinc-800 pt-5">
                      <p className="text-sm font-medium text-zinc-500">
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
                            className="rounded-xl border border-blue-800/60 bg-blue-950/60 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-900/70"
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
                            className="rounded-xl border border-green-800/60 bg-green-950/60 px-4 py-2 text-sm font-semibold text-green-300 transition hover:bg-green-900/70"
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
                            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-700"
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
                          className="rounded-xl border border-red-800/60 bg-red-950/60 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-900/70"
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                {order.status ===
                  "completed" && (
                  <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-sm font-semibold text-zinc-200">
                      Pedido completado
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      El pedido fue entregado al cliente.
                    </p>

                    <button
                      onClick={() =>
                        updateStatus(
                          order.id,
                          "cancelled"
                        )
                      }
                      className="mt-3 rounded-xl border border-red-800/60 bg-red-950/60 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-900/70"
                    >
                      ❌ Cancelar venta
                    </button>
                  </div>
                )}

                {order.status ===
                  "cancelled" && (
                  <div className="mt-6 rounded-xl border border-red-900/60 bg-red-950/40 p-4">
                    <p className="text-sm font-semibold text-red-300">
                      Venta cancelada
                    </p>

                    <p className="mt-1 text-sm text-red-200/70">
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