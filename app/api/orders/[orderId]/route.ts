import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const TRACKING_EXPIRATION_HOURS = 48;

export async function GET(
  request: Request,
  context: {
    params: Promise<{ orderId: string }>;
  }
) {
  try {
    const { orderId } = await context.params;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(orderId)) {
      return NextResponse.json(
        { error: "Identificador de pedido inválido" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("orders")
      .select(`
        order_number,
        status,
        order_type,
        order_time,
        total,
        location_id,
        created_at,
        locations (
          name
        )
      `)
      .eq("id", orderId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    const createdAt = new Date(data.created_at);

    const expiresAt =
      createdAt.getTime() +
      TRACKING_EXPIRATION_HOURS * 60 * 60 * 1000;

    if (Date.now() > expiresAt) {
      return NextResponse.json(
        {
          error:
            "El seguimiento de este pedido ya no está disponible.",
        },
        { status: 410 }
      );
    }

    return NextResponse.json({
      order_number: data.order_number,
      status: data.status,
      order_type: data.order_type,
      order_time: data.order_time,
      total: data.total,
      location_id: data.location_id,
      locations: data.locations,
    });
  } catch (error) {
    console.error(
      "ERROR INTERNO:",
      error
    );

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}