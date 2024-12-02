"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, MapPin, Clock, User, Scissors } from "lucide-react";
import { motion } from "framer-motion";

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30"
];

export default function ConfirmationStep({ onBack, bookingData }: any) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");

  const handleConfirm = async () => {
    if (!date || !time) {
      toast.error("Por favor selecciona fecha y hora");
      return;
    }

    // Here you would typically make an API call to save the booking
    toast.success("¡Reserva confirmada!");
    
    console.log("Booking Data:", {
      ...bookingData,
      date,
      time,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Confirma tu Reserva</h2>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 mb-6 bg-primary/5">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Local</h3>
                  <p className="text-sm text-muted-foreground">
                    {bookingData.location.name}
                    <br />
                    {bookingData.location.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Scissors className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Servicio</h3>
                  <p className="text-sm text-muted-foreground">
                    {bookingData.service.name}
                    <br />
                    ${bookingData.service.price} - {bookingData.service.duration} min
                  </p>
                </div>
              </div>

              {bookingData.staff && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Profesional</h3>
                    <p className="text-sm text-muted-foreground">
                      {bookingData.staff.name}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Fecha y Hora</h3>
                  <p className="text-sm text-muted-foreground">
                    {date ? format(date, "PPP", { locale: es }) : "Selecciona una fecha"}
                    {time && ` - ${time} hrs`}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Selecciona Fecha
            </h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              locale={es}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Selecciona Hora
            </h3>
            <Select onValueChange={setTime} value={time}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una hora" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot} hrs
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!date || !time}
          className="bg-primary hover:bg-primary/90"
        >
          Confirmar Reserva
        </Button>
      </div>
    </div>
  );
}