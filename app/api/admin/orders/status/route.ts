import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-auth";

const validStatuses = [
  "pending",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

const allowedTransitions: Record<string, string[]> = {
  pending: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: ["cancelled"],
  cancelled: [],
};

export async function PATCH(request: Request) {
  const { authorized } = await requireAdmin();

  if (!authorized) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        {
          error:
            "Faltan datos para actualizar el pedido",
        },
        { status: 400 }
      );
    }

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado de pedido no válido" },
        { status: 400 }
      );
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(orderId)) {
      return NextResponse.json(
        { error: "Identificador de pedido inválido" },
        { status: 400 }
      );
    }

    const {
      data: order,
      error: orderError,
    } = await supabaseServer
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error(
        "ERROR BUSCANDO PEDIDO:",
        orderError
      );

      return NextResponse.json(
        { error: "No se encontró el pedido" },
        { status: 404 }
      );
    }

    if (order.status === "cancelled") {
      return NextResponse.json(
        {
          error:
            "Esta venta ya está cancelada y no puede volver a activarse.",
        },
        { status: 400 }
      );
    }

    if (order.status === status) {
      return NextResponse.json({
        success: true,
        status,
      });
    }

    const allowedNextStatuses =
      allowedTransitions[order.status] || [];

    if (!allowedNextStatuses.includes(status)) {
      return NextResponse.json(
        {
          error:
            `No se puede cambiar el pedido de "${order.status}" a "${status}".`,
        },
        { status: 400 }
      );
    }

    /*
      Cancellation is handled by a database transaction.
      The RPC restores inventory, records the movement,
      locks the relevant rows, and changes the order status
      atomically.
    */
    if (status === "cancelled") {
      const { data, error } =
        await supabaseServer.rpc(
          "cancel_order",
          {
            p_order_id: orderId,
          }
        );

      if (error) {
        console.error(
          "ERROR CANCELANDO PEDIDO:",
          error
        );

        return NextResponse.json(
          {
            error:
              error.message ||
              "No se pudo cancelar el pedido.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(data);
    }

    const {
      error: updateError,
    } = await supabaseServer
      .from("orders")
      .update({
        status,
      })
      .eq("id", orderId);

    if (updateError) {
      console.error(
        "ERROR ACTUALIZANDO ESTADO:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "No se pudo actualizar el estado del pedido.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error(
      "ERROR INTERNO ACTUALIZANDO PEDIDO:",
      error
    );

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}