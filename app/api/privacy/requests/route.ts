import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const validRequestTypes = [
  "marketing_unsubscribe",
  "access",
  "rectification",
  "deletion",
  "opposition",
  "portability",
];

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
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
          error: "Solicitud inválida.",
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      requestType,
      message,
    } = body as {
      name?: unknown;
      email?: unknown;
      phone?: unknown;
      requestType?: unknown;
      message?: unknown;
    };

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "El nombre es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        {
          error:
            "El nombre es demasiado largo.",
        },
        { status: 400 }
      );
    }

    if (
      typeof email !== "string" ||
      !email.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "El correo electrónico es obligatorio.",
        },
        { status: 400 }
      );
    }

    const cleanEmail =
      email.trim().toLowerCase();

    if (
      cleanEmail.length > 254 ||
      !emailRegex.test(cleanEmail)
    ) {
      return NextResponse.json(
        {
          error:
            "Ingresa un correo electrónico válido.",
        },
        { status: 400 }
      );
    }

    if (
      typeof requestType !== "string" ||
      !validRequestTypes.includes(requestType)
    ) {
      return NextResponse.json(
        {
          error:
            "El tipo de solicitud no es válido.",
        },
        { status: 400 }
      );
    }

    if (
      phone !== undefined &&
      phone !== null &&
      typeof phone !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "El teléfono no es válido.",
        },
        { status: 400 }
      );
    }

    if (
      message !== undefined &&
      message !== null &&
      typeof message !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "El mensaje no es válido.",
        },
        { status: 400 }
      );
    }

    const cleanName = name.trim();

    const cleanPhone =
      typeof phone === "string"
        ? phone.trim().slice(0, 30) || null
        : null;

    const cleanMessage =
      typeof message === "string"
        ? message.trim().slice(0, 5000) || null
        : null;

    let customerId: string | null = null;

    const {
      data: customer,
      error: customerLookupError,
    } = await supabaseServer
      .from("customers")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (customerLookupError) {
      console.error(
        "Privacy customer lookup error:",
        customerLookupError
      );

      return NextResponse.json(
        {
          error:
            "No se pudo procesar la solicitud.",
        },
        { status: 500 }
      );
    }

    if (customer) {
      customerId = customer.id;
    }

    const {
      data: privacyRequest,
      error: insertError,
    } = await supabaseServer
      .from("privacy_requests")
      .insert({
        customer_id: customerId,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        request_type: requestType,
        message: cleanMessage,
        status: "pending",
      })
      .select(
        "id, request_type, status, created_at"
      )
      .single();

    if (insertError) {
      console.error(
        "Privacy request insert error:",
        insertError
      );

      return NextResponse.json(
        {
          error:
            "No se pudo registrar la solicitud. Inténtalo nuevamente.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      request: privacyRequest,
    });
  } catch (error) {
    console.error(
      "Privacy request API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}