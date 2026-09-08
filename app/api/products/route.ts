import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: Request) {
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
      .from("inventory")
      .select("product_id, stock, active")
      .eq("location_id", locationId);

    if (error) {
      console.error("ERROR CARGANDO INVENTARIO:", error);

      return NextResponse.json(
        { error: "No se pudo cargar el inventario" },
        { status: 500 }
      );
    }

    const products = (data || []).map((item) => ({
      id: item.product_id,
      stock: item.stock,
      active: item.active,
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error("ERROR INTERNO:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}