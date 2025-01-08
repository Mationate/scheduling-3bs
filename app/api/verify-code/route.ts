import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    
    console.log("Recibida solicitud de verificación:", { email, code });

    const verificationToken = await db.twoFactorToken.findFirst({
      where: {
        email,
        token: code,
        expires: { gt: new Date() }
      }
    });

    console.log("Token encontrado:", verificationToken);

    if (!verificationToken) {
      console.log("Token no encontrado o expirado");
      return NextResponse.json(
        { error: "Código inválido o expirado" }, 
        { status: 400 }
      );
    }

    // Eliminar el token usado
    await db.twoFactorToken.delete({
      where: { id: verificationToken.id }
    });

    console.log("Token verificado y eliminado correctamente");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en verificación:", error);
    return NextResponse.json(
      { error: "Error al verificar el código" }, 
      { status: 500 }
    );
  }
} 