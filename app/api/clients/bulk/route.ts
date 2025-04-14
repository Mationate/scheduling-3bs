import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { clients } = await req.json();

    // Validar datos básicos
    const validClients = clients.filter((client: any) => 
      client.name && 
      client.email &&
      typeof client.email === 'string' &&
      client.email.includes('@')
    );

    if (!validClients.length) {
      return new NextResponse("No hay clientes válidos para importar", { status: 400 });
    }

    // Crear clientes en batch
    const result = await db.$transaction(
      validClients.map((client: any) => 
        db.client.create({
          data: {
            name: client.name,
            email: client.email.toLowerCase(),
            phone: client.phone?.toString() || null,
            notes: client.notes || null,
            status: "ACTIVE"
          }
        })
      )
    );

    return NextResponse.json({
      message: `${result.length} clientes importados exitosamente`,
      count: result.length
    });
  } catch (error) {
    console.error("[CLIENTS_BULK_POST]", error);
    return new NextResponse("Error al importar clientes", { status: 500 });
  }
} 