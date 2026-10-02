import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { authorized } = await requireAdmin();

  if (!authorized) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const {
      cart,
      paymentMethod,
      locationId,
      customerId,
    } = body;

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: "El carrito esta vacio" },
        { status: 400 }
      );
    }

    if (
      paymentMethod !== "efectivo" &&
      paymentMethod !== "transferencia"
    ) {
      return NextResponse.json(
        { error: "Metodo de pago no valido" },
        { status: 400 }
      );
    }

    if (!locationId) {
      return NextResponse.json(
        { error: "Debes seleccionar un local" },
        { status: 400 }
      );
    }

    if (customerId) {
      const {
        data: customer,
        error: customerError,
      } = await supabaseServer
        .from("customers")
        .select("id")
        .eq("id", customerId)
        .single();

      if (customerError || !customer) {
        return NextResponse.json(
          {
            error:
              "El cliente seleccionado no existe",
          },
          { status: 400 }
        );
      }
    }

    const {
      data,
      error,
    } = await supabaseServer.rpc(
      "create_pos_order",
      {
        p_cart: cart,
        p_payment_method: paymentMethod,
        p_location_id: locationId,
        p_customer_id:
          customerId || null,
      }
    );

    if (error) {
      console.error(
        "POS order error:",
        error
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "No se pudo completar la venta",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "POS API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}