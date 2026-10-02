import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 30;
const MAX_EMAIL_LENGTH = 254;
const MAX_PROMOTION_CODE_LENGTH = 50;
const MAX_CART_ITEMS = 50;

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const allowedPaymentMethods = [
  "tarjeta",
  "transferencia",
];

const allowedOrderTypes = [
  "retiro",
];

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "El cuerpo de la solicitud no es válido" },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Datos del pedido inválidos" },
        { status: 400 }
      );
    }

    const {
      name,
      phone,
      email,
      birthday,
      marketingConsent,
      orderType,
      orderTime,
      paymentMethod,
      cart,
      total,
      locationId,
      promotionCode,
    } = body as Record<string, unknown>;

    if (
      typeof name !== "string" ||
      typeof phone !== "string" ||
      typeof paymentMethod !== "string" ||
      typeof locationId !== "string" ||
      !Array.isArray(cart) ||
      cart.length === 0
    ) {
      return NextResponse.json(
        { error: "Faltan datos del pedido" },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanPhone) {
      return NextResponse.json(
        { error: "El nombre y teléfono son obligatorios" },
        { status: 400 }
      );
    }

    if (cleanName.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: "El nombre es demasiado largo" },
        { status: 400 }
      );
    }

    if (cleanPhone.length > MAX_PHONE_LENGTH) {
      return NextResponse.json(
        { error: "El teléfono es demasiado largo" },
        { status: 400 }
      );
    }

    if (!uuidRegex.test(locationId)) {
      return NextResponse.json(
        { error: "Identificador de local inválido" },
        { status: 400 }
      );
    }

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Método de pago no válido" },
        { status: 400 }
      );
    }

    const cleanOrderType =
      typeof orderType === "string"
        ? orderType
        : "retiro";

    if (!allowedOrderTypes.includes(cleanOrderType)) {
      return NextResponse.json(
        { error: "Tipo de pedido no válido" },
        { status: 400 }
      );
    }

    if (cart.length > MAX_CART_ITEMS) {
      return NextResponse.json(
        { error: "El pedido contiene demasiados productos" },
        { status: 400 }
      );
    }

    if (
      email !== undefined &&
      email !== null &&
      typeof email !== "string"
    ) {
      return NextResponse.json(
        { error: "El correo electrónico no es válido" },
        { status: 400 }
      );
    }

    const cleanEmail =
      typeof email === "string"
        ? email.trim()
        : "";

    if (cleanEmail.length > MAX_EMAIL_LENGTH) {
      return NextResponse.json(
        { error: "El correo electrónico es demasiado largo" },
        { status: 400 }
      );
    }

    if (
      birthday !== undefined &&
      birthday !== null &&
      typeof birthday !== "string"
    ) {
      return NextResponse.json(
        { error: "La fecha de nacimiento no es válida" },
        { status: 400 }
      );
    }

    if (
      marketingConsent !== undefined &&
      typeof marketingConsent !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Consentimiento de marketing inválido" },
        { status: 400 }
      );
    }

    if (
      promotionCode !== undefined &&
      promotionCode !== null &&
      typeof promotionCode !== "string"
    ) {
      return NextResponse.json(
        { error: "Código de promoción inválido" },
        { status: 400 }
      );
    }

    const cleanPromotionCode =
      typeof promotionCode === "string"
        ? promotionCode.trim()
        : null;

    if (
      cleanPromotionCode &&
      cleanPromotionCode.length > MAX_PROMOTION_CODE_LENGTH
    ) {
      return NextResponse.json(
        { error: "Código de promoción demasiado largo" },
        { status: 400 }
      );
    }

    // 1. Verificar que el local exista y esté activo
    const { data: location, error: locationError } =
      await supabaseServer
        .from("locations")
        .select("id, name, active")
        .eq("id", locationId)
        .single();

    if (locationError || !location) {
      return NextResponse.json(
        { error: "El local seleccionado no existe" },
        { status: 400 }
      );
    }

    if (!location.active) {
      return NextResponse.json(
        { error: "El local seleccionado no está activo" },
        { status: 400 }
      );
    }

    // 2. Buscar o crear cliente
    let customer;

    const {
      data: existingCustomer,
      error: existingCustomerError,
    } = await supabaseServer
      .from("customers")
      .select(
        "id, name, phone, email, birthday, marketing_consent, marketing_consent_at"
      )
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (existingCustomerError) {
      console.error(
        "ERROR BUSCANDO CLIENTE:",
        existingCustomerError
      );

      return NextResponse.json(
        { error: "No se pudo buscar el cliente" },
        { status: 500 }
      );
    }

    const wantsMarketing = marketingConsent === true;

    if (existingCustomer) {
      let marketingConsentAt =
        existingCustomer.marketing_consent_at || null;

      if (
        wantsMarketing &&
        !existingCustomer.marketing_consent
      ) {
        marketingConsentAt = new Date().toISOString();
      }

      if (!wantsMarketing) {
        marketingConsentAt = null;
      }

      const {
        data: updatedCustomer,
        error: updateCustomerError,
      } = await supabaseServer
        .from("customers")
        .update({
          name: cleanName,
          email:
            cleanEmail ||
            existingCustomer.email ||
            null,
          birthday:
            typeof birthday === "string" && birthday
              ? birthday
              : null,
          marketing_consent: wantsMarketing,
          marketing_consent_at: marketingConsentAt,
        })
        .eq("id", existingCustomer.id)
        .select()
        .single();

      if (updateCustomerError) {
        console.error(
          "ERROR ACTUALIZANDO CLIENTE:",
          updateCustomerError
        );

        return NextResponse.json(
          { error: "No se pudo actualizar el cliente" },
          { status: 500 }
        );
      }

      customer = updatedCustomer;
    } else {
      const marketingConsentAt = wantsMarketing
        ? new Date().toISOString()
        : null;

      const {
        data: newCustomer,
        error: customerError,
      } = await supabaseServer
        .from("customers")
        .insert({
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail || null,
          birthday:
            typeof birthday === "string" && birthday
              ? birthday
              : null,
          marketing_consent: wantsMarketing,
          marketing_consent_at: marketingConsentAt,
          hanami_id:
            "HN-" +
            crypto.randomUUID()
              .replace(/-/g, "")
              .substring(0, 6)
              .toUpperCase(),
        })
        .select()
        .single();

      if (customerError) {
        console.error(
          "ERROR CREANDO CLIENTE:",
          customerError
        );

        return NextResponse.json(
          { error: "No se pudo crear el cliente" },
          { status: 500 }
        );
      }

      customer = newCustomer;
    }

    // 3. Crear pedido mediante la función transaccional.
    // El RPC vuelve a validar productos, precios, stock,
    // promociones y total en el servidor.
    const { data, error } =
      await supabaseServer.rpc(
        "create_online_order",
        {
          p_cart: cart,
          p_total:
            typeof total === "number"
              ? total
              : 0,
          p_payment_method: paymentMethod,
          p_location_id: locationId,
          p_customer_id: customer.id,
          p_order_type: cleanOrderType,
          p_order_time:
            typeof orderTime === "string" &&
            orderTime
              ? orderTime
              : null,
          p_promotion_code:
            cleanPromotionCode,
        }
      );

    if (error) {
      console.error(
        "ERROR CREANDO PEDIDO ONLINE:",
        error
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "No se pudo crear el pedido",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "ERROR INTERNO CREANDO PEDIDO:",
      error
    );

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}