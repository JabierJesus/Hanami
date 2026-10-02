import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const MAX_CART_ITEMS = 50;
const MAX_PROMOTION_CODE_LENGTH = 50;

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          valid: false,
          error: "Solicitud inválida.",
        },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: "Datos inválidos.",
        },
        { status: 400 }
      );
    }

    const {
      code,
      cart,
      customerId,
      locationId,
      channel = "online",
    } = body as Record<string, unknown>;

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        {
          valid: false,
          error: "El carrito está vacío.",
        },
        { status: 400 }
      );
    }

    if (cart.length > MAX_CART_ITEMS) {
      return NextResponse.json(
        {
          valid: false,
          error: "El carrito contiene demasiados productos.",
        },
        { status: 400 }
      );
    }

    // Este endpoint es público y está destinado al checkout online.
    // Las promociones POS deben pasar por las rutas administrativas.
    if (channel !== "online") {
      return NextResponse.json(
        {
          valid: false,
          error: "Canal de venta no válido.",
        },
        { status: 400 }
      );
    }

    if (
      customerId !== null &&
      customerId !== undefined &&
      typeof customerId !== "string"
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: "Cliente inválido.",
        },
        { status: 400 }
      );
    }

    if (
      typeof customerId === "string" &&
      customerId.trim() !== "" &&
      !uuidRegex.test(customerId)
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: "Cliente inválido.",
        },
        { status: 400 }
      );
    }

    if (
      locationId !== null &&
      locationId !== undefined &&
      typeof locationId !== "string"
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: "Local inválido.",
        },
        { status: 400 }
      );
    }

    if (
      typeof locationId === "string" &&
      locationId.trim() !== "" &&
      !uuidRegex.test(locationId)
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: "Local inválido.",
        },
        { status: 400 }
      );
    }

    if (
      code !== null &&
      code !== undefined &&
      typeof code !== "string"
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: "Código promocional inválido.",
        },
        { status: 400 }
      );
    }

    const cleanCode =
      typeof code === "string"
        ? code.trim()
        : null;

    if (
      cleanCode &&
      cleanCode.length > MAX_PROMOTION_CODE_LENGTH
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: "Código promocional demasiado largo.",
        },
        { status: 400 }
      );
    }

    const { data, error } =
      await supabaseServer.rpc(
        "apply_promotion",
        {
          p_code: cleanCode,
          p_cart: cart,
          p_customer_id:
            typeof customerId === "string" &&
            customerId.trim() !== ""
              ? customerId
              : null,
          p_location_id:
            typeof locationId === "string" &&
            locationId.trim() !== ""
              ? locationId
              : null,
          p_channel: "online",
        }
      );

    if (error) {
      console.error(
        "ERROR APLICANDO PROMOCIÓN:",
        error
      );

      return NextResponse.json(
        {
          valid: false,
          error:
            "No se pudo aplicar la promoción.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "ERROR INTERNO APLICANDO PROMOCIÓN:",
      error
    );

    return NextResponse.json(
      {
        valid: false,
        error: "Solicitud inválida.",
      },
      { status: 400 }
    );
  }
}