import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const { authorized } = await requireAdmin();

  if (!authorized) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const { data, error } = await supabaseServer
      .from("categories")
      .select(
        "id, name, active, display_order, created_at"
      )
      .order("display_order", {
        ascending: true,
      });

    if (error) {
      console.error(
        "ERROR CARGANDO CATEGORIAS:",
        error
      );

      return NextResponse.json(
        {
          error:
            "No se pudieron cargar las categorias",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error(
      "ERROR INTERNO CARGANDO CATEGORIAS:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error interno cargando categorias",
      },
      { status: 500 }
    );
  }
}