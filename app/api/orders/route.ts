import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      phone,
      email,
      orderType,
      orderTime,
      paymentMethod,
      cart,
      total,
    } = body;

    if (!name || !phone || !paymentMethod || !cart?.length) {
      return NextResponse.json(
        { error: "Faltan datos del pedido" },
        { status: 400 }
      );
    }

    // 1. Verificar stock disponible
    for (const item of cart) {
      const { data: product, error: productError } =
        await supabaseServer
          .from("products")
          .select("id, name, stock, active")
          .eq("id", item.product.id)
          .single();

      if (productError || !product) {
        console.error("ERROR OBTENIENDO PRODUCTO:", productError);

        return NextResponse.json(
          {
            error: `No se encontró el producto ${item.product.name}`,
          },
          { status: 400 }
        );
      }

      if (!product.active) {
        return NextResponse.json(
          {
            error: `${product.name} no está disponible.`,
          },
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

    // 2. Crear cliente
    const { data: customer, error: customerError } =
      await supabaseServer
        .from("customers")
        .insert({
          name,
          phone,
          email: email || null,
        })
        .select()
        .single();

    if (customerError) {
      console.error(customerError);

      return NextResponse.json(
        { error: "No se pudo crear el cliente" },
        { status: 500 }
      );
    }

    // 3. Crear pedido
    const { data: order, error: orderError } =
      await supabaseServer
        .from("orders")
        .insert({
          customer_id: customer.id,
          order_type: orderType || "retiro",
          order_time: orderTime || null,
          payment_method: paymentMethod,
          total,
        })
        .select()
        .single();

    if (orderError) {
      console.error(orderError);

      return NextResponse.json(
        { error: "No se pudo crear el pedido" },
        { status: 500 }
      );
    }

    // 4. Crear productos del pedido
    const items = cart.map(
      (item: {
        product: {
          id: string;
          name: string;
          price: number;
        };
        quantity: number;
        option?: string;
      }) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        option: item.option || null,
      })
    );

    const { error: itemsError } =
      await supabaseServer
        .from("order_items")
        .insert(items);

    if (itemsError) {
      console.error(itemsError);

      return NextResponse.json(
        { error: "No se pudieron guardar los productos" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
