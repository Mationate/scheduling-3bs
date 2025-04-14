'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarHeader } from './_components/calendar-header';
import { format, addDays, subDays, startOfDay, endOfDay } from 'date-fns';

// Mover las importaciones de Syncfusion dentro de un try-catch
let ScheduleComponent: any;
let ResourcesDirective: any;
let ResourceDirective: any;
let ViewsDirective: any;
let ViewDirective: any;
let Inject: any;
let Day: any;

if (typeof window !== 'undefined') {
  const syncfusion = require('@syncfusion/ej2-react-schedule');
  ScheduleComponent = syncfusion.ScheduleComponent;
  ResourcesDirective = syncfusion.ResourcesDirective;
  ResourceDirective = syncfusion.ResourceDirective;
  ViewsDirective = syncfusion.ViewsDirective;
  ViewDirective = syncfusion.ViewDirective;
  Inject = syncfusion.Inject;
  Day = syncfusion.Day;

  const { loadCldr, L10n, registerLicense } = require('@syncfusion/ej2-base');
  const numberingSystems = require('@syncfusion/ej2-cldr-data/supplemental/numberingSystems.json');
  const gregorian = require('@syncfusion/ej2-cldr-data/main/es/ca-gregorian.json');
  const numbers = require('@syncfusion/ej2-cldr-data/main/es/numbers.json');
  const timeZoneNames = require('@syncfusion/ej2-cldr-data/main/es/timeZoneNames.json');

  registerLicense('tu-licencia-aquí');
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
}

export default function CalendarComponent() {
  const [bookings, setBookings] = useState<any[]>([]);
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
        
        const response = await fetch(
          `/api/bookings?start=${start.toISOString()}&end=${end.toISOString()}`
        );
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setBookings([]);
      }
    };

    fetchBookings();
  }, [selectedDate]);

  // Transform bookings for scheduler
  const transformedBookings = bookings.map(booking => ({
    Id: booking.id,
    Subject: viewType === "services" ? booking.client.name : booking.service.name,
    StartTime: new Date(booking.startTime),
    EndTime: new Date(booking.endTime),
    IsAllDay: false,
    ResourceId: viewType === "services" ? booking.serviceId : booking.workerId,
    Status: booking.status,
    Description: `Servicio: ${booking.service.name}\nBarbero: ${booking.worker.name}`
  }));

  const eventSettings = { 
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