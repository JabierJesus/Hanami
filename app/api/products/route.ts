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

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(locationId)) {
      return NextResponse.json(
        { error: "Identificador de local inválido" },
        { status: 400 }
      );
    }

    const { data: location, error: locationError } =
      await supabaseServer
        .from("locations")
        .select("id, active")
        .eq("id", locationId)
        .single();

    if (locationError || !location) {
      return NextResponse.json(
        { error: "El local no existe" },
        { status: 404 }
      );
    }

    if (!location.active) {
      return NextResponse.json(
        { error: "El local no está activo" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("inventory")
      .select(`
        product_id,
        stock,
        active,
        products (
          id,
          name,
          category_id,
          price,
          image,
          active,
          categories (
            id,
            name,
            display_order,
            active
          )
        )
      `)
      .eq("location_id", locationId)
      .eq("active", true);

    if (error) {
      console.error(
        "ERROR CARGANDO PRODUCTOS:",
        error
      );

      return NextResponse.json(
        { error: "No se pudo cargar el menú" },
        { status: 500 }
      );
    }

    const products = (data || [])
      .map((item: any) => {
        const product = Array.isArray(item.products)
          ? item.products[0]
          : item.products;

        if (!product || !product.active) {
          return null;
        }

        const category = Array.isArray(product.categories)
          ? product.categories[0]
          : product.categories;

        if (!category || !category.active) {
          return null;
        }

        return {
          id: product.id,
          name: product.name,
          category_id: product.category_id,
          category: {
            id: category.id,
            name: category.name,
            display_order: category.display_order,
          },
          price: product.price,
          image: product.image,
          stock: item.stock,
        };
      })
      .filter(Boolean);

    return NextResponse.json(products);
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