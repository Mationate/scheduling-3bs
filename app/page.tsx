import { Poppins } from "next/font/google"
import { Scissors } from "lucide-react"
import BookingForm from "@/components/booking/booking-form"


const font = Poppins({ subsets: ["latin"], weight:["600"] })


export default async function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Scissors className="h-8 w-8 text-primary animate-[spin_3s_ease-in-out_infinite]" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 text-transparent bg-clip-text">
            3BS Barbershop
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Reserva tu hora en pocos pasos
        </p>
      </div>
      <BookingForm />
    </div>
  </main>
  )
}
