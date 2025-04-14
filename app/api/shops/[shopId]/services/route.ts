import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { shopId: string } }
) {
  try {
    const services = await db.service.findMany({
      where: {
        workers: {
          some: {
            shopId: params.shopId
          }
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log("Servicios encontrados:", services);
    return NextResponse.json(services);
  } catch (error) {
    console.error("[SERVICES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 