import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Scissors, Users, Building2 } from "lucide-react";
import type { ClientDetails } from "../types";

interface BookingHistoryProps {
  bookings: ClientDetails['bookings'];
}

export function BookingHistory({ bookings }: BookingHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de visitas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <div key={index} className="border-b pb-4 last:border-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(booking.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  <span>{booking.service.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{booking.worker.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{booking.shop.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 