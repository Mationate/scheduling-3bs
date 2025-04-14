import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 p-6">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">¡Reserva Confirmada!</h1>
        <p className="text-gray-600">
          Hemos enviado un correo con los detalles de tu reserva.
        </p>
        <Button asChild>
          <Link href="/">Volver al Inicio</Link>
        </Button>
      </div>
    </div>
  );
} 