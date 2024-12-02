"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, MapPin, Clock, User, Scissors, Mail, Phone, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatPrice } from "@/lib/utils";
import { Shop, Worker, Service } from "@prisma/client";

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30"
];

type BookingData = {
  location: Shop;
  service: Service;
  staff: Worker;
  user: {
    name: string;
    phone: string;
    email?: string;
    notes?: string;
  };
  date: Date | null;
  time: string | null;
};

interface ConfirmationStepProps {
  onBack: () => void;
  bookingData: BookingData;
}

export default function ConfirmationStep({ onBack, bookingData }: ConfirmationStepProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!date || !time) {
      toast.error("Por favor selecciona fecha y hora");
      return;
    }

    try {
      setLoading(true);
      // Aquí iría la llamada a la API para crear la reserva
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      toast.success("¡Reserva confirmada! Te esperamos");
      
      // Enviar email de confirmación, etc.
    } catch (error) {
      toast.error("Error al confirmar la reserva");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Resumen de la Reserva */}
        <Card className="p-6 md:col-span-2 bg-primary/5">
          <h3 className="text-lg font-semibold mb-4">Resumen de tu Reserva</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Local</p>
                  <p className="text-sm text-muted-foreground">{bookingData.location.name}</p>
                  <p className="text-sm text-muted-foreground">{bookingData.location.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Scissors className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Servicio</p>
                  <p className="text-sm text-muted-foreground">{bookingData.service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(bookingData.service.price)} · {bookingData.service.duration} min
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Profesional</p>
                  <p className="text-sm text-muted-foreground">
                    {bookingData.staff.id === "any" ? "Cualquier Profesional Disponible" : bookingData.staff.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Tus Datos</p>
                  <p className="text-sm text-muted-foreground">{bookingData.user.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {bookingData.user.phone}
                  </div>
                  {bookingData.user.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {bookingData.user.email}
                    </div>
                  )}
                </div>
              </div>

              {bookingData.user.notes && (
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Notas</p>
                    <p className="text-sm text-muted-foreground">{bookingData.user.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Selección de Fecha */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Selecciona Fecha</h3>
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border w-full"
              locale={es}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
            />
          </div>
        </Card>

        {/* Selección de Hora */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Selecciona Hora</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot}
                  variant={time === slot ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setTime(slot)}
                >
                  {slot}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Alerta de Confirmación */}
      {date && time && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Confirma tu reserva</AlertTitle>
            <AlertDescription>
              Tu cita está programada para el {format(date, "PPP", { locale: es })} a las {time} hrs.
              Al confirmar, recibirás un correo electrónico con los detalles de tu reserva.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Volver
        </Button>
        <Button 
          onClick={handleConfirm} 
          disabled={!date || !time || loading}
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? "Confirmando..." : "Confirmar Reserva"}
        </Button>
      </div>
    </div>
  );
}