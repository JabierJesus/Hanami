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
      .from("promotions")
      .select(`
        id,
        code,
        name,
        type,
        discount_value,
        minimum_purchase,
        max_discount,
        starts_at,
        expires_at,
        usage_limit,
        one_per_customer,
        automatic,
        active,
        buy_quantity,
        free_quantity,
        location_id,
        channel,
        description,
        usage_count,
        created_at,
        promotion_products (
          product_id
        ),
        locations (
          id,
          name
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "ERROR CARGANDO PROMOCIONES:",
        error
      );

      return NextResponse.json(
        {
          error:
            "No se pudieron cargar las promociones.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error(
      "ERROR INTERNO PROMOCIONES:",
      error
    );

    return NextResponse.json(
      {
        error: "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
  return savePromotion(request, null);
}

export async function PATCH(
  request: Request
) {
  try {
    const body = await request.json();

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

    if (
      typeof body.id !== "string" ||
      !body.id
    ) {
      return NextResponse.json(
        {
          error: "El ID de la promoción es obligatorio.",
        },
        { status: 400 }
      );
    }

    return savePromotion(
      request,
      body.id
    );
  } catch (error) {
    console.error(
      "ERROR PATCH PROMOCIÓN:",
      error
    );

    return NextResponse.json(
      {
        error: "Solicitud inválida.",
      },
      { status: 400 }
    );
  }
}

async function savePromotion(
  request: Request,
  existingId: string | null
) {
  const { authorized } = await requireAdmin();

  if (!authorized) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

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
      code,
      name,
      type,
      discountValue,
      minimumPurchase,
      maxDiscount,
      startsAt,
      expiresAt,
      usageLimit,
      onePerCustomer,
      automatic,
      active,
      buyQuantity,
      freeQuantity,
      locationId,
      channel,
      description,
      productIds,
    } = body as {
      code?: unknown;
      name?: unknown;
      type?: unknown;
      discountValue?: unknown;
      minimumPurchase?: unknown;
      maxDiscount?: unknown;
      startsAt?: unknown;
      expiresAt?: unknown;
      usageLimit?: unknown;
      onePerCustomer?: unknown;
      automatic?: unknown;
      active?: unknown;
      buyQuantity?: unknown;
      freeQuantity?: unknown;
      locationId?: unknown;
      channel?: unknown;
      description?: unknown;
      productIds?: unknown;
    };

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "El nombre de la promoción es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (name.trim().length > 150) {
      return NextResponse.json(
        {
          error:
            "El nombre de la promoción es demasiado largo.",
        },
        { status: 400 }
      );
    }

    if (
      type !== "percentage" &&
      type !== "fixed" &&
      type !== "3x2"
    ) {
      return NextResponse.json(
        {
          error: "Tipo de promoción no válido.",
        },
        { status: 400 }
      );
    }

    if (
      channel !== "online" &&
      channel !== "pos" &&
      channel !== "both"
    ) {
      return NextResponse.json(
        {
          error: "Canal no válido.",
        },
        { status: 400 }
      );
    }

    const cleanCode =
      typeof code === "string"
        ? code.trim().toUpperCase()
        : "";

    if (
      cleanCode.length > 50
    ) {
      return NextResponse.json(
        {
          error:
            "El código es demasiado largo.",
        },
        { status: 400 }
      );
    }

    const cleanDescription =
      typeof description === "string"
        ? description.trim().slice(0, 1000)
        : null;

    const parsedDiscountValue =
      discountValue === null ||
      discountValue === undefined ||
      discountValue === ""
        ? null
        : Number(discountValue);

    const parsedMinimumPurchase =
      minimumPurchase === null ||
      minimumPurchase === undefined ||
      minimumPurchase === ""
        ? 0
        : Number(minimumPurchase);

    const parsedMaxDiscount =
      maxDiscount === null ||
      maxDiscount === undefined ||
      maxDiscount === ""
        ? null
        : Number(maxDiscount);

    const parsedUsageLimit =
      usageLimit === null ||
      usageLimit === undefined ||
      usageLimit === ""
        ? null
        : Number(usageLimit);

    if (
      parsedDiscountValue !== null &&
      (!Number.isInteger(parsedDiscountValue) ||
        parsedDiscountValue <= 0)
    ) {
      return NextResponse.json(
        {
          error:
            "El descuento debe ser un número entero mayor que 0.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(parsedMinimumPurchase) ||
      parsedMinimumPurchase < 0
    ) {
      return NextResponse.json(
        {
          error:
            "El mínimo de compra no es válido.",
        },
        { status: 400 }
      );
    }

    if (
      parsedMaxDiscount !== null &&
      (!Number.isInteger(parsedMaxDiscount) ||
        parsedMaxDiscount <= 0)
    ) {
      return NextResponse.json(
        {
          error:
            "El descuento máximo no es válido.",
        },
        { status: 400 }
      );
    }

    if (
      parsedUsageLimit !== null &&
      (!Number.isInteger(parsedUsageLimit) ||
        parsedUsageLimit <= 0)
    ) {
      return NextResponse.json(
        {
          error:
            "El límite de usos no es válido.",
        },
        { status: 400 }
      );
    }

    const parsedBuyQuantity =
      type === "3x2" ? 3 : null;

    const parsedFreeQuantity =
      type === "3x2" ? 1 : null;

    let parsedProductIds: string[] = [];

    if (Array.isArray(productIds)) {
      parsedProductIds = productIds.filter(
        (id): id is string =>
          typeof id === "string" &&
          id.trim().length > 0
      );
    }

    if (
      type === "3x2" &&
      parsedProductIds.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Debes seleccionar al menos un producto para el 3x2.",
        },
        { status: 400 }
      );
    }

    const parsedAutomatic =
      Boolean(automatic);

    if (
      parsedAutomatic &&
      cleanCode
    ) {
      return NextResponse.json(
        {
          error:
            "Una promoción automática no puede tener código.",
        },
        { status: 400 }
      );
    }

    if (
      !parsedAutomatic &&
      !cleanCode
    ) {
      return NextResponse.json(
        {
          error:
            "Una promoción con código debe tener código.",
        },
        { status: 400 }
      );
    }

    const parsedStartsAt =
      typeof startsAt === "string" &&
      startsAt
        ? new Date(startsAt).toISOString()
        : null;

    const parsedExpiresAt =
      typeof expiresAt === "string" &&
      expiresAt
        ? new Date(expiresAt).toISOString()
        : null;

    if (
      parsedStartsAt &&
      Number.isNaN(
        new Date(parsedStartsAt).getTime()
      )
    ) {
      return NextResponse.json(
        {
          error: "La fecha de inicio no es válida.",
        },
        { status: 400 }
      );
    }

    if (
      parsedExpiresAt &&
      Number.isNaN(
        new Date(parsedExpiresAt).getTime()
      )
    ) {
      return NextResponse.json(
        {
          error:
            "La fecha de término no es válida.",
        },
        { status: 400 }
      );
    }

    const { data, error } =
      await supabaseServer.rpc(
        "save_promotion",
        {
          p_id: existingId,
          p_code:
            cleanCode || null,
          p_name: name.trim(),
          p_type: type,
          p_discount_value:
            parsedDiscountValue,
          p_minimum_purchase:
            parsedMinimumPurchase,
          p_max_discount:
            parsedMaxDiscount,
          p_starts_at:
            parsedStartsAt,
          p_expires_at:
            parsedExpiresAt,
          p_usage_limit:
            parsedUsageLimit,
          p_one_per_customer:
            Boolean(onePerCustomer),
          p_automatic:
            parsedAutomatic,
          p_active:
            active === undefined
              ? true
              : Boolean(active),
          p_buy_quantity:
            parsedBuyQuantity,
          p_free_quantity:
            parsedFreeQuantity,
          p_location_id:
            typeof locationId === "string" &&
            locationId
              ? locationId
              : null,
          p_channel: channel,
          p_description:
            cleanDescription,
          p_product_ids:
            parsedProductIds,
        }
      );

    if (error) {
      console.error(
        "ERROR GUARDANDO PROMOCIÓN:",
        error
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "No se pudo guardar la promoción.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "ERROR INTERNO PROMOCIÓN:",
      error
    );

    return NextResponse.json(
      {
        error:
          "No se pudo guardar la promoción.",
      },
      { status: 500 }
    );
  }
}