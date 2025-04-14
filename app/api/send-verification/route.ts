import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { generateSixDigitToken } from "@/lib/tokens";
import { sendTwoFactorTokenEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    console.log("[SEND_VERIFICATION] Iniciando proceso...");
    const { email } = await req.json();
    console.log("[SEND_VERIFICATION] Email recibido:", email);

    console.log("[SEND_VERIFICATION] Generando token...");
    const verificationToken = await generateSixDigitToken(email);
    console.log("[SEND_VERIFICATION] Token generado:", {
      email: verificationToken.email,
      tokenLength: verificationToken.token.length,
      expires: verificationToken.expires
    });

    console.log("[SEND_VERIFICATION] Intentando enviar email...");
    try {
      await sendTwoFactorTokenEmail(
        verificationToken.email,
        verificationToken.token
      );
      console.log("[SEND_VERIFICATION] Email enviado exitosamente");
    } catch (emailError) {
      console.error("[SEND_VERIFICATION] Error al enviar email:", emailError);
      throw emailError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SEND_VERIFICATION] Error general:", error);
    return NextResponse.json(
      { error: "Error sending verification" }, 
      { status: 500 }
    );
  }
} 