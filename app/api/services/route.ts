import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    // Extraer workerId si existe
    const { workerId, ...serviceData } = body;
    
    // Crear el servicio
    const service = await db.service.create({
      data: {
        ...serviceData,
        ownerId: serviceData.ownerId || user.id,
      },
    });
    
    // Si se proporciona workerId, conectar el servicio con el trabajador
    if (workerId) {
      await db.worker.update({
        where: { id: workerId },
        data: {
          services: {
            connect: { id: service.id }
          }
        }
      });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("[SERVICES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');

    // Si hay un parámetro de nombre, buscar servicios que coincidan
    if (name) {
      const services = await db.service.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive'
          }
        },
        include: {
          workers: true,
        },
        orderBy: {
          name: 'asc'
        }
      });
      return NextResponse.json(services);
    }

    // Si no hay nombre, retornar todos los servicios
    const services = await db.service.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error("[SERVICES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 