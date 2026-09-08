import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("orders")
      .select(`
        *,
        customers (
          name,
          phone,
          email
        ),
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          option
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ERROR CARGANDO PEDIDOS:", error);

      return NextResponse.json(
        { error: "No se pudieron cargar los pedidos" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("ERROR INTERNO:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}