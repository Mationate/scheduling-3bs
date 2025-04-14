import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const body = await req.json();
    
    // Solo permitir actualizar estos campos
    const updateData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      notes: body.notes,
    };

    const client = await db.client.update({
      where: { id: params.clientId },
      data: updateData
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("[CLIENT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    await db.client.delete({
      where: { id: params.clientId }
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CLIENT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 