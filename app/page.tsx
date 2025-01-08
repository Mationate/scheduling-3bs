import { Poppins } from 'next/font/google'
import { Scissors } from 'lucide-react'
import { db } from "@/lib/db"
import BookingForm from "@/components/booking/booking-form";

const font = Poppins({ subsets: ["latin"], weight: ["600"] })

export default async function Home() {
  // Obtener todas las tiendas con sus trabajadores y servicios
  const shops = await db.shop.findMany({
    include: {
      workers: {
        include: {
          services: true
        }
      },
      schedules: true,
      breaks: true,
    }
  });

  return (
    <main className={`min-h-screen p-4 md:p-8 bg-gray-900 text-white ${font.className}`}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Scissors className="h-8 w-8 text-primary animate-[spin_3s_ease-in-out_infinite]" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 text-transparent bg-clip-text">
              Servicio de Agenda
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Reserva tu hora en pocos pasos ✨
          </p>
        </div>
        <BookingForm initialData={shops} />
      </div>
    </main>
  )
}

