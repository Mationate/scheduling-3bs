"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Shop, Worker, Service, ShopSchedule, ShopBreak } from "@prisma/client";
import LocationStep from "./steps/location-step";
import { ServicesStep } from "./steps/services-step";
import { UserStep } from "./steps/user-step";
import ConfirmationStep from "./steps/confirmation-step";
import { ScheduleStep } from "./steps/schedule-step";
import { PaymentStep } from "./steps/payment-step";
import { toast } from "sonner";

const steps = [
  { id: 1, name: "Local", emoji: "🏠" },
  { id: 2, name: "Servicios", emoji: "💇" },
  { id: 3, name: "Tus Datos", emoji: "📝" },
  { id: 4, name: "Fecha y Hora", emoji: "🗓️" },
  { id: 5, name: "Pago", emoji: "💳" },
  { id: 6, name: "Confirmación", emoji: "✅" },
];

type ShopWithRelations = Shop & {
  workers: (Worker & {
    services: Service[];
  })[];
  schedules: ShopSchedule[];
  breaks: ShopBreak[];
};

interface BookingFormProps {
  initialData: ShopWithRelations[];
}

export type BookingData = {
  location: ShopWithRelations;
  service: Service;
  staff: Worker;
  user: {
    name: string;
    phone: string;
    email?: string;
    notes?: string;
  };
  date: Date;
  time: string;
  paymentOption?: "full" | "partial" | "later";
  paymentAmount?: number;
};

export default function BookingForm({ initialData }: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    if (!bookingData.location || !bookingData.service || !bookingData.staff || 
        !bookingData.user || !bookingData.date || !bookingData.time) {
      toast.error("Faltan datos requeridos");
      return;
    }

    try {
      setIsLoading(true);

      const availabilityResponse = await fetch(`/api/availability?date=${bookingData.date.toISOString()}&workerId=${bookingData.staff.id}&time=${bookingData.time}`);
      
      if (!availabilityResponse.ok) {
        throw new Error("Error al verificar disponibilidad");
      }

      const { available } = await availabilityResponse.json();
      
      if (!available) {
        toast.error("El horario seleccionado ya no está disponible");
        return;
      }

      const [hours, minutes] = bookingData.time.split(':');
      const startDate = new Date(bookingData.date);
      startDate.setHours(parseInt(hours), parseInt(minutes));
      
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + bookingData.service.duration);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: bookingData.date,
          startTime: bookingData.time,
          endTime: `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
          workerId: bookingData.staff.id,
          serviceId: bookingData.service.id,
          shopId: bookingData.location.id,
          userName: bookingData.user.name,
          userPhone: bookingData.user.phone,
          userEmail: bookingData.user.email,
          notes: bookingData.user.notes
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast.success("Reserva creada exitosamente");
      setBookingData({});
      setCurrentStep(1);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error instanceof Error ? error.message : "Error al crear la reserva");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-lg border-t-4 border-t-primary">
      <div className="mb-8">
        <div className="flex justify-between mb-2 overflow-x-auto">
          {steps.map((step) => (
            <motion.span
              key={step.id}
              className={`text-xs sm:text-sm font-medium transition-colors duration-200 flex flex-col items-center ${
                step.id === currentStep
                  ? "text-primary"
                  : step.id < currentStep
                  ? "text-green-500"
                  : "text-gray-400"
              }`}
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-2xl mb-1">{step.emoji}</span>
              {step.name}
            </motion.span>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px]"
        >
          {currentStep === 1 && (
            <LocationStep
              onNext={handleNext}
              updateBookingData={updateBookingData}
              locations={initialData}
            />
          )}
          {currentStep === 2 && bookingData.location && (
            <ServicesStep
              onNext={handleNext}
              onBack={handleBack}
              updateBookingData={updateBookingData}
              location={bookingData.location}
            />
          )}
          {currentStep === 3 && (
            <UserStep
              onNext={handleNext}
              onBack={handleBack}
              updateBookingData={updateBookingData}
            />
          )}
          {currentStep === 4 && bookingData.location && bookingData.staff && bookingData.service && (
            <ScheduleStep
              onNext={handleNext}
              onBack={handleBack}
              updateBookingData={updateBookingData}
              location={bookingData.location}
              staff={bookingData.staff}
              service={bookingData.service}
            />
          )}
          {currentStep === 5 && bookingData.service && (
            <PaymentStep
              onNext={handleNext}
              onBack={handleBack}
              servicePrice={bookingData.service.price}
              updateBookingData={updateBookingData}
            />
          )}
          {currentStep === 6 && bookingData.location && bookingData.service && 
           bookingData.staff && bookingData.user && bookingData.date && 
           bookingData.time && bookingData.paymentOption && (
            <ConfirmationStep
              onBack={handleBack}
              bookingData={bookingData as BookingData}
              onConfirm={handleSubmit}
              isLoading={isLoading}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}
