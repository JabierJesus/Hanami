import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const { authorized } = await requireAdmin();

  if (!authorized) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");

    if (!locationId) {
      return NextResponse.json(
        { error: "Falta el local" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("inventory_movements")
      .select(`
        id,
        product_id,
        location_id,
        quantity_change,
        reason,
        created_at,
        products (
          name
        )
      `)
      .eq("location_id", locationId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error(
        "ERROR CARGANDO MOVIMIENTOS:",
        error
      );

      return NextResponse.json(
        {
          error:
            "No se pudo cargar el historial de inventario",
        },
        { status: 500 }
      );
    }

    const movements = (data || []).map((movement: any) => ({
      id: movement.id,
      productId: movement.product_id,
      productName:
        movement.products?.name ||
        movement.product_id,
      quantityChange: movement.quantity_change,
      reason: movement.reason,
      createdAt: movement.created_at,
    }));

    return NextResponse.json(movements);
  } catch (error) {
    console.error(
      "ERROR INTERNO CARGANDO MOVIMIENTOS:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error interno cargando el historial de inventario",
      },
      { status: 500 }
    );
  }
}