"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Booking } from "../types";
import { Clock, Mail, Phone, User, MapPin, Scissors } from "lucide-react";

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (bookingId: string, newStatus: string) => void;
}

export function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onStatusChange,
}: BookingDetailsModalProps) {
  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalles de la Reserva</DialogTitle>
          <DialogDescription>
            Reserva #{booking.id.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={
                booking.status === "CONFIRMED" ? "success" :
                booking.status === "PENDING" ? "warning" :
                "destructive"
              }>
                {booking.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(booking.date, "PPP", { locale: es })} - {booking.startTime} a {booking.endTime}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-muted-foreground" />
                <span>{booking.service.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{booking.worker.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium">{booking.user.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {booking.user.email}
                  </div>
                  {booking.user.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {booking.user.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {booking.status === "PENDING" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => onStatusChange(booking.id, "CANCELLED")}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => onStatusChange(booking.id, "CONFIRMED")}
                >
                  Confirmar
                </Button>
              </>
            )}
            {booking.status === "CONFIRMED" && (
              <Button
                variant="destructive"
                onClick={() => onStatusChange(booking.id, "CANCELLED")}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 