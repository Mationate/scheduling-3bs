"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Clock } from 'lucide-react';
import { motion } from "framer-motion";
import { BookingData } from "../booking-form";
import type { Shop, ShopSchedule, ShopBreak, Worker, Service } from "@prisma/client";
import { addMinutes, isBefore, isAfter, setHours, setMinutes } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

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
  staff: Worker;
  service: Service;
}

export function ScheduleStep({ onNext, onBack, updateBookingData, location, staff, service }: ScheduleStepProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<{startTime: string, endTime: string}[]>([]);

  const isInBreakTime = (date: Date, shopSchedules: ShopSchedule[], shopBreaks: ShopBreak[]) => {
    const dayBreaks = shopBreaks.filter(b => b.dayOfWeek === date.getDay());
    
    return dayBreaks.some(breakTime => {
      const [breakStartHour, breakStartMinute] = breakTime.startTime.split(":").map(Number);
      const [breakEndHour, breakEndMinute] = breakTime.endTime.split(":").map(Number);
      
      const breakStart = setHours(setMinutes(date, breakStartMinute), breakStartHour);
      const breakEnd = setHours(setMinutes(date, breakEndMinute), breakEndHour);
      
      return !isBefore(date, breakStart) && !isAfter(date, breakEnd);
    });
  };

  const isSlotAvailable = (slot: string) => {
    return !bookedSlots.some(booking => {
      const bookingStart = booking.startTime;
      const bookingEnd = booking.endTime;
      return slot >= bookingStart && slot < bookingEnd;
    });
  };

  useEffect(() => {
    if (date && staff.id !== "any") {
      const fetchBookings = async () => {
        const response = await fetch(`/api/bookings/available?date=${date.toISOString()}&workerId=${staff.id}`);
        if (response.ok) {
          const data = await response.json();
          setBookedSlots(data);
        }
      };
      fetchBookings();
    }
  }, [date, staff]);

  const generateAvailableSlots = (selectedDate: Date) => {
    const daySchedule = location.schedules.find(
      (s: ShopSchedule) => s.dayOfWeek === selectedDate.getDay() && s.isEnabled
    );

    if (!daySchedule) return [];

    const slots: string[] = [];
    const [startHour, startMinute] = daySchedule.startTime.split(":").map(Number);
    const [endHour, endMinute] = daySchedule.endTime.split(":").map(Number);
    
    let currentSlot = setHours(setMinutes(selectedDate, startMinute), startHour);
    const endTime = setHours(setMinutes(selectedDate, endMinute), endHour);

    while (isBefore(currentSlot, endTime)) {
      const timeString = format(currentSlot, "HH:mm");
      if (!isInBreakTime(currentSlot, location.schedules, location.breaks) && 
          isSlotAvailable(timeString)) {
        slots.push(timeString);
      }
      currentSlot = addMinutes(currentSlot, 30);
    }

    return slots;
  };

  useEffect(() => {
    if (date) {
      const slots = generateAvailableSlots(date);
      setAvailableSlots(slots);
      setTime("");
    }
  }, [date, location]);

  const disabledDates = (date: Date) => {
    const daySchedule = location.schedules.find(
      (s: ShopSchedule) => s.dayOfWeek === date.getDay()
    );
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return isBefore(date, today) || !daySchedule || !daySchedule.isEnabled;
  };

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
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <motion.div
                    key={slot}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={time === slot ? "default" : "outline"}
                      className={`w-full ${!isSlotAvailable(slot) ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => setTime(slot)}
                      disabled={!isSlotAvailable(slot)}
                    >
                      {slot}
                    </Button>
                  </motion.div>
                ))}
                {availableSlots.length === 0 && date && (
                  <div className="col-span-3 space-y-4">
                    <p className="text-gray-500 text-center py-4">
                      No hay horarios disponibles para este día
                    </p>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Horario No Disponible</AlertTitle>
                      <AlertDescription className="space-y-2">
                        <p>
                          Lo sentimos, este profesional no tiene horarios disponibles para la fecha seleccionada.
                        </p>
                        <p>
                          Puedes:
                          <ul className="list-disc list-inside mt-2">
                            <li>Seleccionar otra fecha</li>
                            <li>Probar con otro profesional</li>
                            <li>&quot;Cualquier Profesional Disponible&quot; en el paso anterior</li>
                          </ul>
                        </p>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!date || !time}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
