import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    console.log("[CHECK_CLIENT] Verificando email:", email);

    const client = await db.client.findUnique({
      where: { email }
    });

    console.log("[CHECK_CLIENT] Resultado:", client ? "Cliente encontrado" : "Cliente no encontrado");

    return NextResponse.json({ 
      exists: !!client,
      client: client ? {
        id: client.id,
        name: client.name,
        lastName: client.lastName,
        phone: client.phone,
        email: client.email
      } : null
    });
  } catch (error) {
    console.error("[CHECK_CLIENT] Error:", error);
    return NextResponse.json({ error: "Error checking client" }, { status: 500 });
  }
} 