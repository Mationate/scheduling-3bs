'use client'
import { useState, useEffect } from 'react';
import {
  ScheduleComponent, Day, ResourcesDirective, 
  ResourceDirective, ViewsDirective, ViewDirective, 
  Inject, EventSettingsModel
} from '@syncfusion/ej2-react-schedule';
import { loadCldr, L10n } from '@syncfusion/ej2-base';
import * as numberingSystems from '@syncfusion/ej2-cldr-data/supplemental/numberingSystems.json';
import * as gregorian from '@syncfusion/ej2-cldr-data/main/es/ca-gregorian.json';
import * as numbers from '@syncfusion/ej2-cldr-data/main/es/numbers.json';
import * as timeZoneNames from '@syncfusion/ej2-cldr-data/main/es/timeZoneNames.json';
import { format, addDays, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import { CalendarHeader } from './_components/calendar-header';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { registerLicense } from '@syncfusion/ej2-base';

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
      'title': 'Título',
      'location': 'Ubicación',
      'description': 'Descripción',
      'timezone': 'Zona horaria',
      'startTimezone': 'Zona horaria inicial',
      'endTimezone': 'Zona horaria final',
      'repeat': 'Repetir',
      'saveButton': 'Guardar',
      'cancelButton': 'Cancelar',
      'deleteButton': 'Eliminar',
      'newEvent': 'Nueva Reserva'
    }
  }
});

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  user: { name: string };
  service: { id: string; name: string };
  worker: { id: string; name: string; avatar: string };
}

export default function CalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [viewType, setViewType] = useState<"services" | "workers">("services");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
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
      }
    };

    fetchResources();
  }, []);

  // Fetch bookings for selected date
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const start = startOfDay(selectedDate);
        const end = endOfDay(selectedDate);
        
        console.log('Fetching bookings between:', {
          start: start.toISOString(),
          end: end.toISOString()
        });
        
        const response = await fetch(
          `/api/bookings?start=${start.toISOString()}&end=${end.toISOString()}`
        );
        const data = await response.json();
        
        console.log('Received bookings:', data);
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setBookings([]);
      }
    };

    fetchBookings();
  }, [selectedDate]);

  // Transform bookings for scheduler
  const transformedBookings = bookings.map(booking => {
    // Convertir la fecha UTC a local
    const bookingDate = parseISO(booking.date);
    
    // Crear fechas completas combinando fecha y hora
    const [startHour, startMinute] = booking.startTime.split(':');
    const [endHour, endMinute] = booking.endTime.split(':');
    
    const startTime = new Date(bookingDate);
    startTime.setHours(parseInt(startHour), parseInt(startMinute), 0);
    
    const endTime = new Date(bookingDate);
    endTime.setHours(parseInt(endHour), parseInt(endMinute), 0);
    
    const transformedBooking = {
      Id: booking.id,
      Subject: "Reserva",
      StartTime: startTime,
      EndTime: endTime,
      IsAllDay: false,
      ResourceId: viewType === "services" ? booking.service.id : booking.worker.id,
      Status: booking.status,
      Description: `Servicio: ${booking.service.name}\nBarbero: ${booking.worker.name}`
    };

    console.log('Transformed booking:', transformedBooking);
    return transformedBooking;
  });

  const eventSettings: EventSettingsModel = { 
    dataSource: transformedBookings,
    fields: {
      id: 'Id',
      subject: { name: 'Subject' },
      startTime: { name: 'StartTime' },
      endTime: { name: 'EndTime' },
      isAllDay: { name: 'IsAllDay' },
      description: { name: 'Description' }
    }
  };

  const resourceData = viewType === "services" 
    ? services.map(service => ({
        text: service.name,
        id: service.id,
        color: '#cb6bb2'
      }))
    : workers.map(worker => ({
        text: worker.name,
        id: worker.id,
        color: '#56ca85'
      }));

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handlePrevDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevDay}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CalendarHeader 
            viewType={viewType}
            setViewType={setViewType}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextDay}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

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
        ref={(schedule: ScheduleComponent | null) => {
          if (schedule) {
            schedule.getCurrentTime();
          }
        }}
      >
        <ResourcesDirective>
          <ResourceDirective
            field='ResourceId'
            title={viewType === "services" ? 'Servicios' : 'Barberos'}
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
    </div>
  );
}