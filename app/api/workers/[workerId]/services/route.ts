import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { workerId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { serviceId } = body;

    // Verificar que el worker pertenece a una tienda del usuario
    const worker = await db.worker.findUnique({
      where: { id: params.workerId },
      include: { shop: true },
    });

    if (!worker?.shop || worker.shop.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Conectar el servicio al trabajador
    await db.worker.update({
      where: { id: params.workerId },
      data: {
        services: {
          connect: { id: serviceId },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WORKER_SERVICES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { workerId: string } }
) {
  try {
    const worker = await db.worker.findUnique({
      where: { id: params.workerId },
      include: {
        services: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true
          }
        }
      }
    });

    if (!worker) {
      return new NextResponse("Trabajador no encontrado", { status: 404 });
    }

    return NextResponse.json(worker.services);
  } catch (error) {
    console.error("[WORKER_SERVICES_GET]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
} 