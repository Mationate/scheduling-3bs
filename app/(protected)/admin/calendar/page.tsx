'use client'

import { useState, useEffect } from "react";
import { format, addDays, subDays, startOfDay, endOfDay} from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { BookingDetailsModal } from "./_components/booking-details-modal";
import { CalendarSidebar } from "./_components/calendar-sidebar";
import { TimeIndicator } from "./_components/time-indicator";

interface Booking {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  service: { 
    id: string; 
    name: string;
  };
  worker: { 
    id: string; 
    name: string; 
    avatar: string;
  };
}

const getColumnWidth = (itemCount: number) => {
  if (itemCount <= 4) {
    // Para 1-4 items, distribuir el espacio equitativamente
    return `calc((100% - ${(itemCount - 1) * 0.5}rem) / ${itemCount})`;
  }
  // Para 5+ items, ancho fijo con scroll
  return "250px";
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedView, setSelectedView] = useState<"workers" | "services">("workers");
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [timeInterval, setTimeInterval] = useState<string>("5");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const [servicesRes, workersRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/workers")
        ]);
        
        const [servicesData, workersData] = await Promise.all([
          servicesRes.json(),
          workersRes.json()
        ]);

        setServices(servicesData);
        setWorkers(workersData);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Fetch bookings for selected date
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const start = startOfDay(selectedDate);
        const end = endOfDay(selectedDate);
        
        const response = await fetch(
          `/api/bookings?start=${start.toISOString()}&end=${end.toISOString()}`
        );
        const rawData = await response.json();
        const data = rawData.map((booking: any) => ({
          ...booking,
          date: new Date(booking.date)
        }));
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [selectedDate]);

  const getBookingsForColumn = (columnId: string) => {
    return bookings.filter(booking => 
      selectedView === "workers" 
        ? booking.worker.id === columnId
        : booking.service.id === columnId
    );
  };

  const renderTimeSlot = (time: string, columnId: string) => {
    const columnBookings = getBookingsForColumn(columnId);
    const booking = columnBookings.find(b => b.startTime === time);

    if (booking) {
      return (
        <div 
          className="bg-primary/10 rounded-md p-2 cursor-pointer hover:bg-primary/20 transition-colors"
          onClick={() => setSelectedBooking(booking)}
        >
          <p className="font-medium text-sm">
            {selectedView === "workers" ? booking.service.name : booking.user.name}
          </p>
          <p className="text-xs text-gray-500">
            {booking.startTime} - {booking.endTime}
          </p>
        </div>
      );
    }

    return <div className="h-full border border-dashed border-gray-200 rounded-md"></div>;
  };

  const itemCount = selectedView === "workers" ? workers.length : services.length;
  const columnWidth = getColumnWidth(itemCount);

  return (
    <div className="h-full flex bg-white">
      <div className="w-80 flex-shrink-0 overflow-y-auto">
        <CalendarSidebar
          selectedDate={selectedDate}
          onDateChange={(date) => date && setSelectedDate(date)}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          selectedView={selectedView}
          onViewChange={(value) => setSelectedView(value)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b bg-gray-50/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text flex items-center gap-2">
                <span>✨ Agenda</span>
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="px-4 py-2 rounded-md bg-white border shadow-sm">
                  {format(selectedDate, "PPP", { locale: es })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Cargando agenda...</p>
              </div>
            </div>
          ) : (
            <div className="relative min-h-[600px] p-2">
              <div className="grid grid-cols-[auto,1fr] gap-2">
                <div className="w-16 mt-12">
                  {Array.from({ length: 13 }).map((_, i) => (
                    <div key={i} className="h-14 text-xs text-gray-500 text-right pr-2">
                      {`${(i + 9).toString().padStart(2, '0')}:00`}
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <div className="flex gap-2 mb-2 overflow-x-auto">
                    {selectedView === "workers" ? (
                      workers.map(worker => (
                        <div 
                          key={worker.id} 
                          className="text-center p-2 bg-gray-50 rounded-lg flex-shrink-0"
                          style={{ width: columnWidth }}
                        >
                          <div className="font-medium text-sm">{worker.name}</div>
                          <div className="text-xs text-gray-500">Profesional</div>
                        </div>
                      ))
                    ) : (
                      services.map(service => (
                        <div 
                          key={service.id} 
                          className="text-center p-2 bg-gray-50 rounded-lg flex-shrink-0"
                          style={{ width: columnWidth }}
                        >
                          <div className="font-medium text-sm">{service.name}</div>
                          <div className="text-xs text-gray-500">{service.duration} min</div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2 relative">
                    <TimeIndicator />
                    
                    {(selectedView === "workers" ? workers : services).map(item => (
                      <div 
                        key={item.id} 
                        className="space-y-2 flex-shrink-0"
                        style={{ width: columnWidth }}
                      >
                        {Array.from({ length: 13 }).map((_, i) => {
                          const time = `${(i + 9).toString().padStart(2, '0')}:00`;
                          return (
                            <div key={time} className="h-14">
                              {renderTimeSlot(time, item.id)}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={() => {
            setSelectedBooking(null);
          }}
        />
      </div>
    </div>
  );
}