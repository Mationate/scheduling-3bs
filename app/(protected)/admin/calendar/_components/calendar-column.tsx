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
        
        return (
          <div
            key={time.toISOString()}
            className="h-20 border-b relative group"
          >
            {slotBookings.map((booking) => {
              const content = showBookingContent(booking);
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
                    top: "4px",
                    height: "calc(100% - 8px)",
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