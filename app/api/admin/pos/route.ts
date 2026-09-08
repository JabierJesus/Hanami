import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { cart, total, paymentMethod } = body;

    if (!cart?.length || !paymentMethod) {
      return NextResponse.json(
        { error: "Faltan datos de la venta" },
        { status: 400 }
      );
    }

    // Verificar stock
    for (const item of cart) {
      const { data: product, error } = await supabaseServer
        .from("products")
        .select("id, name, stock, active")
        .eq("id", item.productId)
        .single();

      if (error || !product) {
        return NextResponse.json(
          { error: `No se encontró el producto ${item.name}` },
          { status: 400 }
        );
      }

      if (!product.active) {
        return NextResponse.json(
          { error: `${product.name} no está disponible.` },
          { status: 400 }
        );
      }

      if (item.quantity > product.stock) {
        return NextResponse.json(
          {
            error: `No hay suficiente stock de ${product.name}. Disponible: ${product.stock}.`,
          },
          { status: 400 }
        );
      }
    }

    // Crear venta
    const { data: order, error: orderError } = await supabaseServer
      .from("orders")
      .insert({
        order_type: "presencial",
        payment_method: paymentMethod,
        total,
        status: "completed",
      })
      .select()
      .single();

    if (orderError) {
      console.error("ERROR CREANDO VENTA:", orderError);

      return NextResponse.json(
        { error: "No se pudo crear la venta" },
        { status: 500 }
      );
    }

    // Crear productos de la venta
    const items = cart.map(
      (item: {
        productId: string;
        name: string;
        price: number;
        quantity: number;
      }) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      })
    );

    const { error: itemsError } = await supabaseServer
      .from("order_items")
      .insert(items);

    if (itemsError) {
      console.error("ERROR GUARDANDO PRODUCTOS:", itemsError);

      return NextResponse.json(
        { error: "No se pudieron guardar los productos de la venta" },
        { status: 500 }
      );
    }

    // Descontar stock
    for (const item of cart) {
      const { data: product, error } = await supabaseServer
        .from("products")
        .select("stock")
        .eq("id", item.productId)
        .single();

      if (error || !product) {
        return NextResponse.json(
          { error: "No se pudo actualizar el stock" },
          { status: 500 }
        );
      }

      await supabaseServer
        .from("products")
        .update({
          stock: product.stock - item.quantity,
        })
        .eq("id", item.productId);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (error) {
    console.error("ERROR INTERNO:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}