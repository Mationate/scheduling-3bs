import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { workerId: string; serviceId: string } }
) {
  try {
    const user = await currentUser();
    
    // Para los bloqueos, permitimos la operación sin autenticación
    const isBlockOperation = req.headers.get("x-block-operation") === "true";
    
    if (!user && !isBlockOperation) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verificamos si el servicio y el trabajador existen
    const [worker, service] = await Promise.all([
      db.worker.findUnique({
        where: { id: params.workerId },
        include: { 
          services: {
            where: { id: params.serviceId }
          }
        }
      }),
      db.service.findUnique({
        where: { id: params.serviceId }
      })
    ]);

    if (!worker) {
      return new NextResponse("Trabajador no encontrado", { status: 404 });
    }

    if (!service) {
      return new NextResponse("Servicio no encontrado", { status: 404 });
    }

    // Verificar si el servicio ya está asignado
    if (worker.services && worker.services.length > 0) {
      return new NextResponse("El servicio ya está asignado a este trabajador", { status: 200 });
    }

    // Conectar el servicio al trabajador
    await db.worker.update({
      where: { id: params.workerId },
      data: {
        services: {
          connect: { id: params.serviceId },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WORKER_SERVICE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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