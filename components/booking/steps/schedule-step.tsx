"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import type { Shop, ShopSchedule, ShopBreak, Worker, Service } from "@prisma/client";
import { addMinutes, isBefore, isAfter, setHours, setMinutes, isEqual } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { BookingData } from "../booking-form";
import { ScrollArea } from "@/components/ui/scroll-area";

type ShopWithRelations = Shop & {
  workers: Worker[];
  schedules: ShopSchedule[];
  breaks: ShopBreak[];
};

interface ScheduleStepProps {
  onNext: () => void;
  onBack: () => void;
  updateBookingData: (data: Partial<BookingData>) => void;
  location: ShopWithRelations;
  staff: Worker & {
    services: Service[];
  };
  service: Service;
}

// Tipo para las reservas ocupadas
interface BookedSlot {
  startTime: string;
  endTime: string;
  workerId: string;
}

export function ScheduleStep({ onNext, onBack, updateBookingData, location, staff, service }: ScheduleStepProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [availableWorkers, setAvailableWorkers] = useState<{ id: string; name: string }[]>([]);

  // Verificar si un horario está dentro de un período de descanso
  const isInBreakTime = (slotTime: Date, shopBreaks: ShopBreak[]) => {
    const dayBreaks = shopBreaks.filter(b => b.dayOfWeek === slotTime.getDay());
    
    return dayBreaks.some(breakTime => {
      const [breakStartHour, breakStartMinute] = breakTime.startTime.split(":").map(Number);
      const [breakEndHour, breakEndMinute] = breakTime.endTime.split(":").map(Number);
      
      const breakStart = setHours(setMinutes(new Date(slotTime), breakStartMinute), breakStartHour);
      const breakEnd = setHours(setMinutes(new Date(slotTime), breakEndMinute), breakEndHour);
      
      return !isBefore(slotTime, breakStart) && !isAfter(slotTime, breakEnd);
    });
  };

  // Verificar si un horario ya está reservado
  const isTimeSlotBooked = (timeStr: string, durationMinutes: number) => {
    if (!date) return false;
    
    const slotStartTime = parse(timeStr, "HH:mm", date);
    const slotEndTime = addMinutes(slotStartTime, durationMinutes);
    
    console.log(`[SCHEDULE_STEP] Verificando slot ${timeStr} (duración: ${durationMinutes} min)`, {
      fecha: format(date, 'yyyy-MM-dd'),
      reservasActivas: bookedSlots.length,
      esAnyStaff: staff.id === "any"
    });
    
    if (staff.id === "any") {
      // Si es "cualquier profesional", solo bloqueamos si TODOS los profesionales están ocupados
      // en ese horario (para ello necesitaríamos la lista de todos los workers)
      
      // Extraer IDs únicos de profesionales de las reservas
      const bookedWorkerIds = new Set(bookedSlots.map(slot => slot.workerId));
      
      // Si hay datos de workers disponibles (recibidos del servidor)
      if (availableWorkers.length > 0) {
        // Contar cuántos trabajadores están disponibles (no tienen reserva en ese horario)
        const availableWorkersForSlot = availableWorkers.filter(worker => 
          !bookedWorkerIds.has(worker.id)
        );
        
        const allWorkersBooked = availableWorkersForSlot.length === 0;
        
        if (allWorkersBooked) {
          console.log(`[SCHEDULE_STEP] Slot ${timeStr} bloqueado - todos los profesionales están ocupados`);
        }
        
        return allWorkersBooked;
      }
      
      // Si no tenemos datos de workers, asumimos que hay al menos uno disponible
      // (este caso es improbable con los cambios implementados)
      return false;
    }
    
    // Para un trabajador específico, comprobamos si tiene una reserva en ese horario
    return bookedSlots.some(booking => {
      // Solo comprobamos reservas para este trabajador específico
      if (booking.workerId !== staff.id) return false;
      
      const bookingStartTime = parse(booking.startTime, "HH:mm", date);
      const bookingEndTime = parse(booking.endTime, "HH:mm", date);
      
      // Verificar si hay solapamiento entre los horarios
      const isOverlapping = (
        (isBefore(slotStartTime, bookingEndTime) || isEqual(slotStartTime, bookingEndTime)) && 
        (isAfter(slotEndTime, bookingStartTime) || isEqual(slotEndTime, bookingStartTime))
      );
      
      if (isOverlapping) {
        console.log(`[SCHEDULE_STEP] Slot ${timeStr} está ocupado por una reserva de ${booking.startTime} a ${booking.endTime}`);
      }
      
      return isOverlapping;
    });
  };

  // Cargar las reservas existentes cuando se selecciona una fecha
  useEffect(() => {
    // Reset de estado cada vez que cambia la fecha
    setTime("");
    
    if (!date) return;
    
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setTimeError(null);
        setAvailableSlots([]);
        
        // Formatear la fecha como YYYY-MM-DD para evitar problemas de zona horaria
        const formattedDate = format(date, 'yyyy-MM-dd');
        console.log("[SCHEDULE_STEP] Obteniendo reservas para:", {
          fecha: formattedDate,
          trabajador: staff.id,
          nombreTrabajador: staff.name,
          local: location.id,
          nombreLocal: location.name,
          esAnyStaff: staff.id === "any"
        });
        
        // Añadir el filtro de local (shopId) a la solicitud
        const response = await fetch(`/api/bookings/all?date=${formattedDate}&workerId=${staff.id}&shopId=${location.id}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("[SCHEDULE_STEP] Error al obtener reservas:", errorText);
          setTimeError("Error al cargar las reservas. Intenta de nuevo.");
          setBookedSlots([]);
          return;
        }
        
        const data = await response.json();
        console.log("[SCHEDULE_STEP] Respuesta del servidor:", data);
        console.log(`[SCHEDULE_STEP] Se encontraron ${data.totalBookings} reservas para la fecha ${data.date}`);
        console.log('[SCHEDULE_STEP] Fecha solicitada vs recibida:', {
          solicitada: formattedDate,
          recibida: data.date,
          requestedDate: data.requestedDate
        });
        
        if (data.bookings && Array.isArray(data.bookings)) {
          data.bookings.forEach((booking: BookedSlot, index: number) => {
            console.log(`[SCHEDULE_STEP] Reserva #${index + 1}:`, booking);
          });
        }
        
        // Guardar los trabajadores disponibles si estamos en modo "any"
        if (staff.id === "any" && data.workers && Array.isArray(data.workers)) {
          console.log("[SCHEDULE_STEP] Trabajadores disponibles para el local:", data.workers);
          setAvailableWorkers(data.workers);
        }
        
        // Verificar que la fecha recibida coincida con la solicitada
        if (data.date !== formattedDate) {
          console.warn('[SCHEDULE_STEP] Advertencia: La fecha devuelta por el servidor no coincide con la solicitada');
        }
        
        setBookedSlots(data.bookings || []);
        
        // Generar slots disponibles
        generateAvailableTimeSlots(data.bookings || []);
      } catch (error) {
        console.error("[SCHEDULE_STEP] Error cargando reservas:", error);
        setTimeError("Error al cargar horarios. Por favor, intenta de nuevo.");
        setBookedSlots([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, [date, staff.id, location.id]);
  
  // Generar los horarios disponibles basados en el horario del local y las reservas
  const generateAvailableTimeSlots = (bookings: BookedSlot[]) => {
    if (!date) return;
    
    // Buscar el horario del día de la semana
    const daySchedule = location.schedules.find(
      (s) => s.dayOfWeek === date.getDay() && s.isEnabled
    );
    
    if (!daySchedule) {
      setAvailableSlots([]);
      setTimeError("Este día no hay atención.");
      return;
    }
    
    const [startHour, startMinute] = daySchedule.startTime.split(":").map(Number);
    const [endHour, endMinute] = daySchedule.endTime.split(":").map(Number);
    
    // Crear slot inicial
    let currentTime = new Date(date);
    currentTime.setHours(startHour, startMinute, 0, 0);
    
    // Hora de fin
    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    const slots: string[] = [];
    const serviceDuration = service.duration; // Duración del servicio en minutos
    
    // Generar slots en intervalos de 5 minutos
    while (isBefore(currentTime, endTime)) {
      const timeString = format(currentTime, "HH:mm");
      
      // Verificar si el horario está libre
      const isBreakTime = isInBreakTime(currentTime, location.breaks);
      const isBooked = isTimeSlotBooked(timeString, serviceDuration);
      const wouldEndAfterClosing = isAfter(addMinutes(currentTime, serviceDuration), endTime);
      
      if (!isBreakTime && !isBooked && !wouldEndAfterClosing) {
        slots.push(timeString);
      }
      
      // Avanzar 5 minutos
      currentTime = addMinutes(currentTime, 5);
    }
    
    console.log("[SCHEDULE_STEP] Slots disponibles generados:", slots.length);
    setAvailableSlots(slots);
    
    if (slots.length === 0) {
      setTimeError("No hay horarios disponibles para este día");
    } else {
      setTimeError(null);
    }
  };
  
  // Función para deshabilitar fechas no disponibles en el calendario
  const disabledDates = (date: Date) => {
    const daySchedule = location.schedules.find(
      (s) => s.dayOfWeek === date.getDay()
    );
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return isBefore(date, today) || !daySchedule || !daySchedule.isEnabled;
  };
  
  // Agrupar horarios por hora para UI
  const groupTimeSlotsByHour = () => {
    const grouped: Record<string, string[]> = {};
    
    availableSlots.forEach(slot => {
      const hour = slot.split(':')[0];
      if (!grouped[hour]) {
        grouped[hour] = [];
      }
      grouped[hour].push(slot);
    });
    
    return grouped;
  };
  
  const groupedSlots = groupTimeSlotsByHour();
  
  // Continuar al siguiente paso
  const handleNext = () => {
    if (!date || !time) {
      toast.error("Por favor selecciona fecha y hora");
      return;
    }
    updateBookingData({ date, time });
    onNext();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">🗓️ Selecciona Fecha y Hora</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selección de Fecha */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Selecciona Fecha</h3>
              </div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border w-full"
                locale={es}
                disabled={disabledDates}
              />
            </div>
          </Card>
        </motion.div>

        {/* Selección de Hora */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Selecciona Hora</h3>
              </div>
              
              <AnimatePresence mode="wait">
                {isLoading && (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-10"
                  >
                    <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                    <p className="text-sm text-gray-500">Cargando horarios disponibles...</p>
                  </motion.div>
                )}
                
                {!isLoading && timeError && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Horario No Disponible</AlertTitle>
                      <AlertDescription className="space-y-2">
                        <p>{timeError}</p>
                        {date && (
                          <div>
                            Puedes:
                            <ul className="list-disc list-inside mt-2">
                              <li>Seleccionar otra fecha</li>
                              <li>Probar con otro profesional</li>
                              <li>Elegir otro servicio</li>
                            </ul>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
                
                {!isLoading && !timeError && availableSlots.length > 0 && (
                  <motion.div
                    key="timeslots"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-4">
                        {Object.entries(groupedSlots).map(([hour, slots]) => (
                          <div key={hour} className="border rounded-md p-2">
                            <h4 className="text-sm font-medium mb-2 bg-muted/50 p-1 rounded">
                              {hour}:00 - {hour}:59
                            </h4>
                            <div className="grid grid-cols-3 gap-1">
                              {slots.map((slot) => (
                                <Button
                                  key={slot}
                                  variant={time === slot ? "default" : "outline"}
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => setTime(slot)}
                                >
                                  {slot}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    {time && (
                      <div className="mt-4 bg-primary/10 p-3 rounded-md">
                        <p className="text-sm font-medium">Horario seleccionado: <span className="text-primary">{time}</span></p>
                        <p className="text-xs text-gray-500">
                          Duración: {service.duration} minutos (hasta las {
                            format(addMinutes(parse(time, "HH:mm", new Date()), service.duration), "HH:mm")
                          })
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          Volver
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!date || !time || isLoading}
          className="relative"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Continuar
        </Button>
      </div>
    </div>
  );
}
