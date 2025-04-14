'use client'

import { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfDay, endOfDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { BookingDetailsModal } from "./_components/booking-details-modal";
import { CalendarSidebar } from "./_components/calendar-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ArrivalControlModal } from "../(dashboard)/shops/_components/arrival-control-modal";
import {
  ScheduleComponent, Day, ResourcesDirective, 
  ResourceDirective, ViewsDirective, ViewDirective, 
  Inject
} from '@syncfusion/ej2-react-schedule';
import { loadCldr, L10n, registerLicense } from '@syncfusion/ej2-base';
import * as numberingSystems from '@syncfusion/ej2-cldr-data/supplemental/numberingSystems.json';
import * as gregorian from '@syncfusion/ej2-cldr-data/main/es/ca-gregorian.json';
import * as numbers from '@syncfusion/ej2-cldr-data/main/es/numbers.json';
import * as timeZoneNames from '@syncfusion/ej2-cldr-data/main/es/timeZoneNames.json';
import { CreateBookingModal } from "./_components/create-booking-modal";

registerLicense('Ngo9BigBOggjHTQxAR8/V1NDaF1cWGhIfEx1RHxQdld5ZFRHallYTnNWUj0eQnxTdEBjWH9XcXBRRWVYWE13Vg==');

// Cargar datos CLDR
loadCldr(numberingSystems, gregorian, numbers, timeZoneNames);

// Cargar traducciones
L10n.load({
  'es': {
    'schedule': {
      'day': 'Día',
      'week': 'Semana',
      'workWeek': 'Semana Laboral',
      'month': 'Mes',
      'today': 'Hoy',
      'noEvents': 'No hay eventos',
      'emptyContainer': 'No hay reservas programadas para este día.',
      'allDay': 'Todo el día',
      'start': 'Inicio',
      'end': 'Fin',
      'more': 'más',
      'close': 'Cerrar',
      'cancel': 'Cancelar',
      'noTitle': '(Sin Título)',
      'delete': 'Eliminar',
      'deleteEvent': 'Eliminar Reserva',
      'deleteMultipleEvent': 'Eliminar Múltiples Reservas',
      'selectedItems': 'Elementos seleccionados',
      'edit': 'Editar',
      'editEvent': 'Editar Reserva',
      'createEvent': 'Crear',
      'subject': 'Asunto',
      'save': 'Guardar',
      'saveButton': 'Guardar',
    }
  }
});

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [viewType, setViewType] = useState<"services" | "workers">("services");
  const [selectedView, setSelectedView] = useState<"workers" | "services">("workers");
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch resources basado en el local seleccionado
  useEffect(() => {
    const fetchResources = async () => {
      setIsLoadingData(true);
      try {
        const workersEndpoint = selectedLocation === "all" 
          ? '/api/workers'
          : `/api/shops/${selectedLocation}/workers`;
        
        const servicesEndpoint = selectedLocation === "all"
          ? '/api/services'
          : `/api/shops/${selectedLocation}/services`;

        const [workersRes, servicesRes] = await Promise.all([
          fetch(workersEndpoint),
          fetch(servicesEndpoint)
        ]);
        
        const [workersData, servicesData] = await Promise.all([
          workersRes.json(),
          servicesRes.json()
        ]);

        setWorkers(workersData);
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchResources();
  }, [selectedLocation]);

  const fetchBookings = async () => {
    setIsLoadingData(true);
    try {
      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);
      
      console.log('🔍 Fetching bookings for:', {
        start: start.toISOString(),
        end: end.toISOString(),
        selectedLocation
      });

      const queryParams = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
        ...(selectedLocation !== "all" && { shopId: selectedLocation })
      });

      const response = await fetch(`/api/bookings?${queryParams}`);
      const data = await response.json();
      
      console.log('📅 Raw bookings received:', data);
      setBookings(data);
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Usar fetchBookings en el useEffect
  useEffect(() => {
    fetchBookings();
  }, [selectedDate, selectedLocation]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

    // Transform bookings for scheduler
    const transformedBookings = bookings.map(booking => {
      console.log('🔄 Processing booking:', booking);
      
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      
      const transformed = {
        Id: booking.id,
        Subject: `${booking.service.name} - ${booking.client.name}`,
        StartTime: startTime,
        EndTime: endTime,
        IsAllDay: false,
        ResourceId: selectedView === "workers" ? booking.workerId : booking.serviceId,
        Description: `Cliente: ${booking.client.name}\nServicio: ${booking.service.name}\nProfesional: ${booking.worker.name}`
      };
  
      console.log('✨ Transformed booking:', transformed);
      return transformed;
    });

    // Antes de pasar los datos al calendario
    console.log('📊 Final eventSettings:', {
      dataSource: transformedBookings,
      fields: {
        subject: { name: 'service.name', title: 'Servicio' },
        startTime: { name: 'startTime' },
        endTime: { name: 'endTime' },
        description: { name: 'client.name', title: 'Cliente' }
      }
    });

  // Configuración del calendario
  const eventSettings = {
    dataSource: transformedBookings,
    fields: {
      id: 'Id',
      subject: { name: 'Subject' },
      startTime: { name: 'StartTime' },
      endTime: { name: 'EndTime' },
      description: { name: 'Description' },
      resourceId: 'ResourceId'
    }
  };

  // Datos de recursos (trabajadores/servicios)
  const resourceData = selectedView === "workers" 
    ? workers.map(worker => ({
        id: worker.id,
        text: worker.name,
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      }))
    : services.map(service => ({
        id: service.id,
        text: service.name,
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      }));

  return (
    <div className="h-full flex">
      {/* Sidebar para móviles */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <CalendarSidebar
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            selectedView={selectedView}
            onViewChange={setSelectedView}
          />
        </SheetContent>
      </Sheet>

      {/* Sidebar para desktop */}
      <div className="hidden md:block w-72 border-r">
        <CalendarSidebar
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          selectedView={selectedView}
          onViewChange={setSelectedView}
        />
      </div>

      <div className="flex-1">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousDay}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextDay}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Crear Reserva
              </Button>
              <ArrivalControlModal />
            </div>
          </div>

          {isLoadingData ? (
            <div className="h-[650px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Cargando agenda...
                </p>
              </div>
            </div>
          ) : (
            <ScheduleComponent
              width='100%'
              height='650px'
              selectedDate={selectedDate}
              currentView='Day'
              eventSettings={eventSettings}
              group={{ resources: ['Resources'] }}
              locale='es'
              timeFormat="HH:mm"
              dateFormat="dd/MM/yyyy"
              startHour='08:00'
              endHour='20:00'
              showHeaderBar={false}
              showTimeIndicator={true}
              timeScale={{ 
                enable: true, 
                interval: 30,
                slotCount: 2
              }}
            >
              <ResourcesDirective>
                <ResourceDirective
                  field='ResourceId'
                  title={selectedView === "services" ? 'Servicios' : 'Barberos'}
                  name='Resources'
                  allowMultiple={false}
                  dataSource={resourceData}
                  textField='text'
                  idField='id'
                  colorField='color'
                />
              </ResourcesDirective>
              <ViewsDirective>
                <ViewDirective option='Day' />
              </ViewsDirective>
              <Inject services={[Day]} />
            </ScheduleComponent>
          )}
        </div>

        <CreateBookingModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            // Recargar bookings
            fetchBookings();
          }}
          selectedDate={selectedDate}
        />

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