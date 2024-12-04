"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MapPin, Clock, User, Scissors, Mail, Phone, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatPrice } from "@/lib/utils";
import { Shop, Worker, Service, ShopSchedule, ShopBreak } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type BookingData = {
  location: Shop & {
    schedules: ShopSchedule[];
    breaks: ShopBreak[];
  };
  service: Service;
  staff: Worker;
  user: {
    name: string;
    phone: string;
    email?: string;
    notes?: string;
  };
  date: Date;
  time: string;
};

interface ConfirmationStepProps {
  onBack: () => void;
  bookingData: BookingData;
}

export default function ConfirmationStep({ onBack, bookingData }: ConfirmationStepProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);

      // Calcular hora de fin basado en la duración del servicio
      const [hours, minutes] = bookingData.time.split(":").map(Number);
      const startDate = new Date(bookingData.date);
      startDate.setHours(hours, minutes);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + bookingData.service.duration);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: bookingData.service.id,
          workerId: bookingData.staff.id,
          shopId: bookingData.location.id,
          date: bookingData.date,
          startTime: bookingData.time,
          endTime: `${endDate.getHours()}:${endDate.getMinutes().toString().padStart(2, '0')}`,
          status: "PENDING"
        }),
      });

      if (!response.ok) throw new Error();

      // TODO: Enviar email de confirmación
      // await sendEmail({
      //   to: bookingData.user.email,
      //   subject: "Confirmación de Reserva",
      //   template: "booking-confirmation",
      //   data: {
      //     userName: bookingData.user.name,
      //     serviceName: bookingData.service.name,
      //     workerName: bookingData.staff.name,
      //     shopName: bookingData.location.name,
      //     date: format(bookingData.date, "PPP", { locale: es }),
      //     time: bookingData.time,
      //     duration: bookingData.service.duration,
      //     price: bookingData.service.price
      //   }
      // });

      setShowConfirmation(true);
    } catch (error) {
      toast.error("Error al crear la reserva");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 bg-primary/5">
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
                <Clock className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Fecha y Hora</p>
                  <p className="text-sm text-muted-foreground">
                    {format(bookingData.date, "PPP", { locale: es })}
                  </p>
                  <p className="text-sm text-muted-foreground">{bookingData.time} hrs</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Profesional</p>
                  <p className="text-sm text-muted-foreground">
                    {bookingData.staff.id === "any" ? "Cualquier Profesional Disponible" : bookingData.staff.name}
                  </p>
                </div>
              </div>

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

        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Confirma tu reserva</AlertTitle>
          <AlertDescription>
            Al confirmar, se procesará tu reserva y recibirás un correo electrónico con los detalles.
          </AlertDescription>
        </Alert>
      </motion.div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Volver
        </Button>
        <Button 
          onClick={handleConfirm} 
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? "Confirmando..." : "Confirmar Reserva"}
        </Button>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Reserva Confirmada!</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                Tu reserva ha sido confirmada exitosamente. Te hemos enviado un correo 
                electrónico con todos los detalles.
              </p>
              <p className="font-medium">
                Fecha: {format(bookingData.date, "PPP", { locale: es })}
                <br />
                Hora: {bookingData.time}
                <br />
                Local: {bookingData.location.name}
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setShowConfirmation(false);
                router.push("/");
              }}
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}