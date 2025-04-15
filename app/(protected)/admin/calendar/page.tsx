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
import { toast } from "sonner";

// Interfaces para TypeScript
interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  clientId: string;
  workerId: string;
  serviceId: string;
  shopId: string;
  notes?: string;
  client: {
    id: string;
    name: string;
  };
  worker: {
    id: string;
    name: string;
  };
  service: {
    id: string;
    name: string;
  };
  shop: {
    id: string;
    name: string;
  };
}

interface ScheduleEvent {
  Id: string;
  Subject: string;
  StartTime: Date;
  EndTime: Date;
  IsAllDay: boolean;
  ResourceId: string;
  Description: string;
  Color?: string;
  status?: string;
}

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
  const [selectedView, setSelectedView] = useState<"workers" | "services">("workers");
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [shops, setShops] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Cargar tiendas al inicio
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch('/api/shops');
        const data = await response.json();
        setShops(data);
        
        // Si no hay tienda seleccionada y hay tiendas disponibles, seleccionar la primera
        if ((!selectedLocation || selectedLocation === "all") && data.length > 0) {
          setSelectedLocation(data[0].id);
        }
      } catch (error) {
        console.error('Error cargando tiendas:', error);
        toast.error('No se pudieron cargar las tiendas');
      }
    };
    
    fetchShops();
  }, []);

  // Fetch resources basado en el local seleccionado
  useEffect(() => {
    const fetchResources = async () => {
      if (!selectedLocation) return; // No cargar si no hay tienda seleccionada
      
      setIsLoadingData(true);
      try {
        const workersEndpoint = `/api/shops/${selectedLocation}/workers`;
        const servicesEndpoint = `/api/shops/${selectedLocation}/services`;

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
    if (!selectedLocation) return; // No cargar si no hay tienda seleccionada
    
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
        shopId: selectedLocation
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
    if (selectedLocation) {
      fetchBookings();
    }
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
    const transformedBookings = bookings.map((booking: Booking): ScheduleEvent => {
      console.log('🔄 Processing booking:', booking);
      
      // Crear fechas completas combinando la fecha del booking con las horas
      const bookingDate = new Date(booking.date);
      
      // Determinar si es un bloqueo
      const isBlock = booking.status === "BLOCK";
      
      let startTime, endTime;
      
      if (isBlock) {
        // Para bloqueos, usar todo el día
        startTime = new Date(bookingDate);
        // Asegurarnos de que la fecha se ajuste correctamente al día seleccionado
        startTime.setHours(0, 0, 0, 0);
        
        endTime = new Date(bookingDate); 
        endTime.setHours(23, 59, 59, 999);
        
        console.log('🚫 Bloqueo procesado:', {
          id: booking.id,
          fecha: bookingDate.toISOString().split('T')[0],
          fechaLocal: format(bookingDate, 'yyyy-MM-dd'),
          horaInicio: format(startTime, 'HH:mm:ss'),
          horaFin: format(endTime, 'HH:mm:ss'),
          trabajador: booking.worker.name,
          motivo: booking.notes
        });
      } else {
        // Para reservas normales, parsear las horas correctamente
        try {
          // Verificar si tenemos el formato HH:mm para horas
          if (typeof booking.startTime === 'string' && booking.startTime.includes(':') && 
              typeof booking.endTime === 'string' && booking.endTime.includes(':')) {
            
            // Obtener horas y minutos directamente del string
            const [startHours, startMinutes] = booking.startTime.split(':').map(Number);
            const [endHours, endMinutes] = booking.endTime.split(':').map(Number);
            
            // Crear fechas para el día correcto
            startTime = new Date(bookingDate);
            startTime.setHours(startHours, startMinutes, 0, 0);
            
            endTime = new Date(bookingDate);
            endTime.setHours(endHours, endMinutes, 0, 0);
            
            // Si la hora de fin es menor que la de inicio, podría ser el día siguiente
            if (endTime < startTime) {
              endTime.setDate(endTime.getDate() + 1);
            }
          } else {
            // Intentar parsear formatos ISO
            startTime = new Date(booking.startTime);
            endTime = new Date(booking.endTime);
            
            // Asegurar que las fechas coincidan con la fecha del booking
            if (startTime.toDateString() !== bookingDate.toDateString()) {
              startTime = new Date(bookingDate);
              startTime.setHours(0, 0, 0, 0);
            }
            
            if (endTime.toDateString() !== bookingDate.toDateString()) {
              endTime = new Date(bookingDate);
              endTime.setHours(23, 59, 59, 999);
            }
          }
          
          console.log('📅 Reserva procesada:', {
            id: booking.id,
            fecha: bookingDate.toISOString().split('T')[0],
            fechaLocal: format(bookingDate, 'yyyy-MM-dd'),
            horaInicio: format(startTime, 'HH:mm:ss'),
            horaFin: format(endTime, 'HH:mm:ss'),
            cliente: booking.client.name,
            servicio: booking.service.name
          });
        } catch (error) {
          console.error('❌ Error procesando horarios de reserva:', error, booking);
          // Valores por defecto en caso de error
          startTime = new Date(bookingDate);
          startTime.setHours(9, 0, 0);
          
          endTime = new Date(bookingDate);
          endTime.setHours(10, 0, 0);
        }
      }
      
      return {
        Id: booking.id,
        Subject: isBlock 
          ? `🚫 BLOQUEADO: ${booking.notes || 'Sin motivo especificado'}`
          : `${booking.service.name} - ${booking.client.name}`,
        StartTime: startTime,
        EndTime: endTime,
        IsAllDay: isBlock,
        ResourceId: selectedView === "workers" ? booking.workerId : booking.serviceId,
        Description: isBlock
          ? `Día bloqueado: ${booking.notes || 'Sin motivo'}\nProfesional: ${booking.worker.name}`
          : `Cliente: ${booking.client.name}\nServicio: ${booking.service.name}\nProfesional: ${booking.worker.name}`,
        Color: isBlock
          ? '#E53935' // Rojo para bloqueos
          : booking.status === 'CONFIRMED' 
            ? '#4caf50' 
            : booking.status === 'PENDING' 
              ? '#ff9800' 
              : '#f44336',
        status: booking.status
      };
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
      resourceId: 'ResourceId',
      color: { name: 'Color' }
    },
    enableTooltip: true,
    tooltipTemplate: (props: any) => {
      return props.Description;
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

  // Función para manejar el clic en un evento
  const handleEventClick = (args: any) => {
    if (args.event?.Id) {
      const clickedBookingId = args.event.Id;
      const originalBooking = bookings.find(b => b.id === clickedBookingId);
      if (originalBooking) {
        // Si es un bloqueo, mostramos un toast con la información en lugar del modal detallado
        if (originalBooking.status === "BLOCK") {
          toast("Día bloqueado", {
            description: `Profesional: ${originalBooking.worker.name}\nMotivo: ${originalBooking.notes || "No especificado"}\nFecha: ${format(new Date(originalBooking.date), "dd/MM/yyyy")}`,
            action: {
              label: "Editar",
              onClick: () => setSelectedBooking(originalBooking)
            },
            duration: 5000,
          });
        } else {
          // Para reservas normales, abrimos el modal detallado
          setSelectedBooking(originalBooking);
        }
      }
    }
  };

  // Función para manejar la apertura de popups
  const handlePopupOpen = (args: any) => {
    // Cancelar todos los popups predeterminados y usar nuestro modal personalizado
    if (args.type === 'Editor' || args.type === 'QuickInfo') {
      args.cancel = true;
      if (args.data && args.data.Id) {
        const popupBookingId = args.data.Id;
        const originalBooking = bookings.find(b => b.id === popupBookingId);
        if (originalBooking) {
          setSelectedBooking(originalBooking);
        }
      }
    }
  };

  // Función para personalizar la renderización de eventos
  const handleEventRendered = (args: any) => {
    if (args.data && args.element) {
      // Aplicar estilos según el estado
      if (args.data.status === "BLOCK") {
        // Estilo para bloques de día
        args.element.style.background = 'repeating-linear-gradient(45deg, #E53935, #E53935 10px, #C62828 10px, #C62828 20px)';
        args.element.style.color = 'white';
        args.element.style.fontWeight = 'bold';
        args.element.style.border = '2px solid #B71C1C';
      } else if (args.data.status === 'CANCELLED') {
        args.element.style.textDecoration = 'line-through';
        args.element.style.opacity = '0.6';
      }
    }
  };

  // Manejo de actualizaciones después de cambios en bookings
  const handleBookingUpdated = () => {
    console.log('📅 Actualizando bookings después de un cambio...');
    setSelectedBooking(null);
    fetchBookings();
  };

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
            shops={shops}
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
          shops={shops}
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
                disabled={!selectedLocation}
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
          ) : !selectedLocation ? (
            <div className="h-[650px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 max-w-md text-center">
                <p className="text-lg font-medium">Selecciona una tienda</p>
                <p className="text-sm text-muted-foreground">
                  Por favor selecciona una tienda en el panel lateral para ver la agenda.
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
              popupOpen={handlePopupOpen}
              eventClick={handleEventClick}
              eventRendered={handleEventRendered}
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

        {selectedLocation && (
          <CreateBookingModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={handleBookingUpdated}
            selectedDate={selectedDate}
            shopId={selectedLocation}
            workers={workers}
          />
        )}

        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={handleBookingUpdated}
        />
      </div>
    </div>
  );
}