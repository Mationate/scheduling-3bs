import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { workerId: string; serviceId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verificar que el worker pertenece a una tienda del usuario
    const worker = await db.worker.findUnique({
      where: { id: params.workerId },
      include: { shop: true },
    });

    if (!worker?.shop || worker.shop.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Desconectar el servicio del trabajador
    await db.worker.update({
      where: { id: params.workerId },
      data: {
        services: {
          disconnect: { id: params.serviceId },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WORKER_SERVICES_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 