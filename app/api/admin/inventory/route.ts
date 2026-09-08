import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("products")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("ERROR CARGANDO INVENTARIO:", error);

      return NextResponse.json(
        { error: "No se pudo cargar el inventario" },
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

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const { productId, stock } = body;

    if (!productId || stock === undefined) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      );
    }

    const newStock = Number(stock);

    if (!Number.isInteger(newStock) || newStock < 0) {
      return NextResponse.json(
        { error: "El stock debe ser un número entero mayor o igual a 0" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("products")
      .update({ stock: newStock })
      .eq("id", productId)
      .select("id, stock")
      .single();

    if (error) {
      console.error("ERROR ACTUALIZANDO STOCK:", error);

      return NextResponse.json(
        { error: "No se pudo actualizar el stock" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("ERROR INTERNO:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}