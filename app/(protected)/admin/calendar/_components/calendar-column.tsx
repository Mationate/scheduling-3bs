import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Booking } from "../types";

interface CalendarColumnProps {
  title: string;
  timeSlots: Date[];
  bookings: Booking[];
  getColumnBookings: (time: Date) => Booking[];
  showBookingContent: (booking: Booking) => {
    title: string;
    subtitle: string;
  };
  onBookingClick: (booking: Booking) => void;
}

export function CalendarColumn({
  title,
  timeSlots,
  bookings,
  getColumnBookings,
  showBookingContent,
  onBookingClick,
}: CalendarColumnProps) {
  return (
    <div className="flex-1 min-w-[300px] border-r last:border-r-0">
      <div className="h-12 border-b bg-muted p-2">
        <h3 className="font-medium text-sm">{title}</h3>
      </div>

      {timeSlots.map((time) => {
        const slotBookings = getColumnBookings(time);
        console.log('Slot bookings for time:', {
          time: format(time, "HH:mm"),
          bookings: slotBookings
        });
        
        return (
          <div
            key={time.toISOString()}
            className="h-10 border-b relative group"
          >
            {slotBookings.map((booking) => {
              const content = showBookingContent(booking);
              
              // Calcular la posición y altura del booking
              const [startHour, startMinute] = booking.startTime.split(":").map(Number);
              const [endHour, endMinute] = booking.endTime.split(":").map(Number);
              const [slotHour, slotMinute] = format(time, "HH:mm").split(":").map(Number);

              const bookingStartMinutes = startHour * 60 + startMinute;
              const slotMinutes = slotHour * 60 + slotMinute;
              const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
              
              // Solo mostrar el booking en su slot de inicio
              if (bookingStartMinutes !== slotMinutes) return null;

              // Calcular la posición relativa desde las 8:00 AM
              const minutesSince8AM = bookingStartMinutes - (8 * 60); // 8 AM es nuestra hora de inicio
              const totalSlotsHeight = timeSlots.length * 40; // 40px por cada slot de 30 minutos
              const positionPercentage = (minutesSince8AM / (12 * 60)) * 100; // 12 horas es nuestro rango total

              return (
                <div
                  key={booking.id}
                  className={cn(
                    "absolute inset-x-1 rounded-md p-2 text-sm",
                    "bg-primary/10 hover:bg-primary/20 transition-colors",
                    "cursor-pointer"
                  )}
                  onClick={() => onBookingClick(booking)}
                  style={{
                    top: `${positionPercentage}%`,
                    height: `${(durationMinutes / 30) * 40}px`, // Altura basada en la duración
                    zIndex: 10
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      booking.status === "CONFIRMED" ? "success" :
                      booking.status === "PENDING" ? "warning" :
                      "destructive"
                    }>
                      {booking.status}
                    </Badge>
                    <span className="font-medium truncate">
                      {content.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{booking.startTime} - {booking.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{content.subtitle}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
} 