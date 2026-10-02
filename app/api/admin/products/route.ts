import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-auth";

const productSelect = `
  id,
  name,
  category_id,
  price,
  image,
  active,
  created_at,
  category:categories (
    id,
    name,
    active,
    display_order
  )
`;

export async function GET() {
  const { authorized } = await requireAdmin();

  if (!authorized) {
    return NextResponse.json(
      {
        error: "No autorizado",
      },
      { status: 401 }
    );
  }

  try {
    const { data, error } = await supabaseServer
      .from("products")
      .select(productSelect)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "ERROR CARGANDO PRODUCTOS:",
        error
      );

      return NextResponse.json(
        {
          error: "No se pudieron cargar los productos",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error(
      "ERROR INTERNO CARGANDO PRODUCTOS:",
      error
    );

    return NextResponse.json(
      {
        error: "Error interno cargando productos",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { authorized } = await requireAdmin();

  if (!authorized) {
    return NextResponse.json(
      {
        error: "No autorizado",
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const {
      id,
      name,
      category_id,
      price,
      image,
      active,
    } = body;

    if (
      !id ||
      !name ||
      !category_id ||
      price === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Faltan datos obligatorios del producto",
        },
        { status: 400 }
      );
    }

    const cleanId = String(id).trim();
    const cleanName = String(name).trim();
    const cleanCategoryId =
      String(category_id).trim();
    const numericPrice = Number(price);

    if (
      !cleanId ||
      !cleanName ||
      !cleanCategoryId
    ) {
      return NextResponse.json(
        {
          error:
            "El ID, nombre y categoria son obligatorios",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(numericPrice) ||
      numericPrice < 0
    ) {
      return NextResponse.json(
        {
          error:
            "El precio debe ser un numero entero mayor o igual a 0",
        },
        { status: 400 }
      );
    }

    const {
      data,
      error,
    } = await supabaseServer.rpc(
      "create_product_with_inventory",
      {
        p_id: cleanId,
        p_name: cleanName,
        p_category_id: cleanCategoryId,
        p_price: numericPrice,
        p_image:
          image === null || image === undefined
            ? null
            : String(image).trim() || null,
        p_active:
          active === undefined
            ? true
            : Boolean(active),
      }
    );

    if (error) {
      console.error(
        "ERROR CREANDO PRODUCTO:",
        error
      );

      if (error.code === "23505") {
        return NextResponse.json(
          {
            error:
              "Ya existe un producto con ese ID",
          },
          { status: 409 }
        );
      }

      if (error.code === "23503") {
        return NextResponse.json(
          {
            error:
              "La categoria seleccionada no existe",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error:
            error.message ||
            "No se pudo crear el producto",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "ERROR INTERNO CREANDO PRODUCTO:",
      error
    );

    return NextResponse.json(
      {
        error: "Error interno creando producto",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { authorized } = await requireAdmin();

  if (!authorized) {
    return NextResponse.json(
      {
        error: "No autorizado",
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const {
      id,
      name,
      category_id,
      price,
      image,
      active,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          error: "Falta el ID del producto",
        },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (name !== undefined) {
      const cleanName = String(name).trim();

      if (!cleanName) {
        return NextResponse.json(
          {
            error:
              "El nombre no puede estar vacio",
          },
          { status: 400 }
        );
      }

      updates.name = cleanName;
    }

    if (category_id !== undefined) {
      const cleanCategoryId =
        String(category_id).trim();

      if (!cleanCategoryId) {
        return NextResponse.json(
          {
            error:
              "La categoria no puede estar vacia",
          },
          { status: 400 }
        );
      }

      updates.category_id = cleanCategoryId;
    }

    if (price !== undefined) {
      const numericPrice = Number(price);

      if (
        !Number.isInteger(numericPrice) ||
        numericPrice < 0
      ) {
        return NextResponse.json(
          {
            error:
              "El precio debe ser un numero entero mayor o igual a 0",
          },
          { status: 400 }
        );
      }

      updates.price = numericPrice;
    }

    if (image !== undefined) {
      updates.image =
        image === null
          ? null
          : String(image).trim() || null;
    }

    if (active !== undefined) {
      updates.active = Boolean(active);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          error: "No hay cambios para aplicar",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("products")
      .update(updates)
      .eq("id", id)
      .select(productSelect)
      .single();

    if (error) {
      console.error(
        "ERROR ACTUALIZANDO PRODUCTO:",
        error
      );

      if (error.code === "23503") {
        return NextResponse.json(
          {
            error:
              "La categoria seleccionada no existe",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error:
            "No se pudo actualizar el producto",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "ERROR INTERNO ACTUALIZANDO PRODUCTO:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error interno actualizando producto",
      },
      { status: 500 }
    );
  }
}