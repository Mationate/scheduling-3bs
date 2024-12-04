"use client";

import { useState, useEffect } from "react";
import { format, addHours, startOfDay, eachHourOfInterval, addDays, subDays, setHours, setMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarColumn } from "./_components/calendar-column";
import { TimeLine } from "./_components/time-line";
import { Booking } from "./types";
import { BookingDetailsModal } from "./_components/booking-details-modal";
import { toast } from "sonner";

const timeSlots = eachHourOfInterval({
  start: setHours(setMinutes(startOfDay(new Date()), 0), 8), // Comienza a las 8 AM
  end: setHours(setMinutes(startOfDay(new Date()), 0), 20), // Termina a las 8 PM
});

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [viewType, setViewType] = useState<"services" | "workers">("services");
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    // Cargar servicios
    fetch("/api/services")
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar los servicios');
        return res.json();
      })
      .then(data => {
        setServices(data || []);
      })
      .catch(error => {
        console.error('Error:', error);
        setServices([]);
      });
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetch(`/api/bookings?date=${selectedDate.toISOString()}`)
        .then(res => {
          if (!res.ok) throw new Error('Error al cargar las reservas');
          return res.json();
        })
        .then(data => {
          setBookings(data || []); // Aseguramos que siempre sea un array
        })
        .catch(error => {
          console.error('Error:', error);
          setBookings([]); // En caso de error, establecemos un array vacío
        });
    }
  }, [selectedDate]);

  useEffect(() => {
    // Agregar efecto para cargar workers
    fetch("/api/workers")
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar los trabajadores');
        return res.json();
      })
      .then(data => setWorkers(data || []))
      .catch(error => {
        console.error('Error:', error);
        setWorkers([]);
      });
  }, []);

  const getBookingsForServiceAndTime = (serviceId: string, time: Date) => {
    return bookings.filter(booking => 
      booking.service.id === serviceId && 
      booking.startTime === format(time, "HH:mm")
    );
  };

  const getBookingsForWorkerAndTime = (workerId: string, time: Date) => {
    return bookings.filter(booking => 
      booking.worker.id === workerId && 
      booking.startTime === format(time, "HH:mm")
    );
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error();

      // Actualizar bookings localmente
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));

      toast.success("Estado actualizado correctamente");
      setSelectedBooking(null);
    } catch (error) {
      toast.error("Error al actualizar el estado");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {format(selectedDate, "PPP", { locale: es })}
          </h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="view-mode"
            checked={viewType === "workers"}
            onCheckedChange={(checked) => 
              setViewType(checked ? "workers" : "services")
            }
          />
          <Label htmlFor="view-mode">
            Ver por {viewType === "services" ? "Barberos" : "Servicios"}
          </Label>
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div className="flex relative">
          {/* Columna de horas */}
          <div className="w-20 flex-shrink-0 border-r">
            <div className="h-12 border-b bg-muted" />
            {timeSlots.map((time) => (
              <div
                key={time.toISOString()}
                className="h-20 border-b px-2 py-1"
              >
                <span className="text-sm text-muted-foreground">
                  {format(time, "HH:mm")}
                </span>
              </div>
            ))}
          </div>

          <div className="flex-1 relative">
            <TimeLine />
            
            <div className="flex">
              {viewType === "services" ? (
                services.map((service) => (
                  <CalendarColumn
                    key={service.id}
                    title={service.name}
                    timeSlots={timeSlots}
                    bookings={bookings}
                    getColumnBookings={(time) => getBookingsForServiceAndTime(service.id, time)}
                    showBookingContent={(booking) => ({
                      title: booking.user.name,
                      subtitle: booking.worker.name,
                    })}
                    onBookingClick={setSelectedBooking}
                  />
                ))
              ) : (
                workers.map((worker) => (
                  <CalendarColumn
                    key={worker.id}
                    title={worker.name}
                    timeSlots={timeSlots}
                    bookings={bookings}
                    getColumnBookings={(time) => getBookingsForWorkerAndTime(worker.id, time)}
                    showBookingContent={(booking) => ({
                      title: booking.service.name,
                      subtitle: booking.user.name,
                    })}
                    onBookingClick={setSelectedBooking}
                  />
                ))
              )}
            </div>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
} 