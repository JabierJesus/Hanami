import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
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
    const { searchParams } = new URL(request.url);
    const search =
      searchParams.get("search")?.trim() || "";

    if (!search) {
      return NextResponse.json({
        customers: [],
      });
    }

    const { data, error } = await supabaseServer
      .from("customers")
      .select("id, name, phone, email")
      .or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
      .order("name", {
        ascending: true,
      })
      .limit(20);

    if (error) {
      console.error(
        "Customer search error:",
        error
      );

      return NextResponse.json(
        {
          error: "No se pudieron buscar los clientes",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      customers: data || [],
    });
  } catch (error) {
    console.error("Customer GET error:", error);

    return NextResponse.json(
      {
        error: "Error interno del servidor",
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
      name,
      phone,
      email,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {
          error:
            "El nombre del cliente es obligatorio",
        },
        { status: 400 }
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        {
          error:
            "El telefono del cliente es obligatorio",
        },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email?.trim() || null;

    const {
      data: existingCustomer,
      error: searchError,
    } = await supabaseServer
      .from("customers")
      .select("id, name, phone, email")
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (searchError) {
      console.error(
        "Customer duplicate check error:",
        searchError
      );

      return NextResponse.json(
        {
          error: "No se pudo verificar el cliente",
        },
        { status: 500 }
      );
    }

    if (existingCustomer) {
      return NextResponse.json(
        {
          error:
            "Ya existe un cliente con ese telefono",
          customer: existingCustomer,
        },
        { status: 409 }
      );
    }

    const {
      data: customer,
      error,
    } = await supabaseServer
      .from("customers")
      .insert({
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
      })
      .select("id, name, phone, email")
      .single();

    if (error) {
      console.error(
        "Customer creation error:",
        error
      );

      return NextResponse.json(
        {
          error: "No se pudo crear el cliente",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Customer POST error:", error);

    return NextResponse.json(
      {
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}