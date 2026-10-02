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
          category:categories (
            id,
            name,
            active,
            display_order
          )
        )
      `)
      .eq("location_id", locationId);

    if (error) {
      console.error(
        "ERROR CARGANDO INVENTARIO:",
        error
      );

      return NextResponse.json(
        { error: "No se pudo cargar el inventario" },
        { status: 500 }
      );
    }

    const inventory = (data || []).map((item: any) => ({
      id: item.product_id,
      name: item.products?.name,
      category_id: item.products?.category_id,
      category: item.products?.category?.name || null,
      price: item.products?.price,
      image: item.products?.image,
      stock: item.stock,
      active: item.active,
    }));

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("ERROR INTERNO:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

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

    const {
      productId,
      stock,
      active,
      locationId,
      reason,
    } = body;

    if (!productId || !locationId) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      );
    }

    // Cambiar disponibilidad
    if (active !== undefined) {
      const { data, error } = await supabaseServer
        .from("inventory")
        .update({
          active: Boolean(active),
          updated_at: new Date().toISOString(),
        })
        .eq("product_id", productId)
        .eq("location_id", locationId)
        .select("product_id, stock, active")
        .single();

      if (error) {
        console.error(
          "ERROR ACTUALIZANDO DISPONIBILIDAD:",
          error
        );

        return NextResponse.json(
          {
            error:
              "No se pudo actualizar la disponibilidad",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        id: data.product_id,
        stock: data.stock,
        active: data.active,
      });
    }

    // Ajustar stock
    if (stock !== undefined) {
      const newStock = Number(stock);

      if (
        !Number.isInteger(newStock) ||
        newStock < 0
      ) {
        return NextResponse.json(
          {
            error:
              "El stock debe ser un numero entero mayor o igual a 0",
          },
          { status: 400 }
        );
      }

      if (!reason?.trim()) {
        return NextResponse.json(
          {
            error:
              "Debes indicar el motivo del ajuste de inventario",
          },
          { status: 400 }
        );
      }

      // Obtener stock actual
      const {
        data: currentInventory,
        error: inventoryError,
      } = await supabaseServer
        .from("inventory")
        .select("stock, active")
        .eq("product_id", productId)
        .eq("location_id", locationId)
        .single();

      if (inventoryError || !currentInventory) {
        return NextResponse.json(
          {
            error:
              "No se encontro el inventario del producto",
          },
          { status: 404 }
        );
      }

      const quantityChange =
        newStock - currentInventory.stock;

      // No crear movimiento si el stock no cambio
      if (quantityChange === 0) {
        return NextResponse.json({
          id: productId,
          stock: currentInventory.stock,
          active: currentInventory.active,
        });
      }

      // Ajustar stock + registrar movimiento
      const {
        data: resultingStock,
        error: adjustmentError,
      } = await supabaseServer.rpc(
        "adjust_inventory",
        {
          p_product_id: productId,
          p_location_id: locationId,
          p_quantity_change: quantityChange,
          p_reason: reason.trim(),
        }
      );

      if (adjustmentError) {
        console.error(
          "ERROR AJUSTANDO INVENTARIO:",
          adjustmentError
        );

        return NextResponse.json(
          {
            error:
              adjustmentError.message ||
              "No se pudo ajustar el inventario",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        id: productId,
        stock: resultingStock,
        active: currentInventory.active,
      });
    }

    return NextResponse.json(
      { error: "No hay cambios para aplicar" },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "ERROR INTERNO ACTUALIZANDO INVENTARIO:",
      error
    );

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}