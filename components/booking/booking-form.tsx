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
import { format } from "date-fns";

const steps = [
  { id: 1, name: "Local", emoji: "🏠" },
  { id: 2, name: "Servicios", emoji: "💇" },
  { id: 3, name: "Fecha y Hora", emoji: "🗓️" },
  { id: 4, name: "Pago", emoji: "💳" },
  { id: 5, name: "Tus Datos", emoji: "📝" },
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

export interface BookingData {
  location: Shop & {
    schedules: ShopSchedule[];
    breaks: ShopBreak[];
    workers: (Worker & {
      services: Service[];
    })[];
  };
  service: Service;
  staff: Worker & {
    services: Service[];
  };
  client: {
    name: string;
    phone: string;
    email: string;
    notes?: string;
  };
  date: Date;
  time: string;
  paymentOption?: "full" | "partial" | "later";
  paymentAmount?: number;
}

export default function BookingForm({ initialData }: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigningWorker, setIsAssigningWorker] = useState(false);

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
    console.log("[BOOKING_FORM] Iniciando handleSubmit");
    console.log("[BOOKING_FORM] Estado completo de bookingData:", bookingData);
    console.log("[BOOKING_FORM] Datos del cliente:", bookingData.client);
    
    if (!bookingData.location || !bookingData.service || !bookingData.staff || 
        !bookingData.client || !bookingData.date || !bookingData.time) {
      console.log("[BOOKING_FORM] Validación fallida. Datos faltantes:", {
        location: !!bookingData.location,
        service: !!bookingData.service,
        staff: !!bookingData.staff,
        client: !!bookingData.client,
        date: !!bookingData.date,
        time: !!bookingData.time
      });
      toast.error("Faltan datos requeridos");
      return;
    }

    if (!bookingData.client.phone) {
      toast.error("El número de teléfono es obligatorio");
      return;
    }

    try {
      setIsLoading(true);
      console.log("[BOOKING_FORM] Preparando datos para enviar:", {
        phone: bookingData.client.phone,
        name: bookingData.client.name,
        email: bookingData.client.email || ""
      });

      // Verificar si necesitamos encontrar un profesional disponible (caso "any")
      let staffToUse = bookingData.staff;
      
      if (bookingData.staff.id === "any") {
        setIsAssigningWorker(true);
        console.log("[BOOKING_FORM] Buscando profesional disponible para 'Cualquier Profesional Disponible'");
        
        const dateParam = format(bookingData.date, 'yyyy-MM-dd');
        const availabilityResponse = await fetch(
          `/api/bookings/available?date=${dateParam}&workerId=any&time=${bookingData.time}&shopId=${bookingData.location.id}&serviceId=${bookingData.service.id}`
        );
        
        if (!availabilityResponse.ok) {
          throw new Error(`Error al verificar disponibilidad: ${availabilityResponse.status}`);
        }
        
        const availabilityData = await availabilityResponse.json();
        console.log("[BOOKING_FORM] Respuesta de búsqueda de profesional:", availabilityData);
        
        if (!availabilityData.available || !availabilityData.suggestedWorker) {
          setIsAssigningWorker(false);
          toast.error(availabilityData.error || "No hay profesionales disponibles para este horario");
          return;
        }
        
        // Usar el profesional sugerido
        staffToUse = availabilityData.suggestedWorker;
        console.log("[BOOKING_FORM] Se asignará el profesional:", staffToUse.name);
        
        // Actualizar el estado del bookingData con el profesional asignado
        const updatedStaff = {
          ...staffToUse,
          shopId: bookingData.location.id
        };
        
        updateBookingData({ staff: updatedStaff });
        setIsAssigningWorker(false);
      } else {
        // Verificar disponibilidad para el profesional específico
        const dateParam = format(bookingData.date, 'yyyy-MM-dd');
        console.log(`[BOOKING_FORM] Verificando disponibilidad para: fecha=${dateParam}, trabajador=${bookingData.staff.id}, hora=${bookingData.time}`);
        
        const availabilityResponse = await fetch(`/api/bookings/available?date=${dateParam}&workerId=${bookingData.staff.id}&time=${bookingData.time}&serviceId=${bookingData.service.id}`);
        
        console.log(`[BOOKING_FORM] Respuesta de disponibilidad: status=${availabilityResponse.status}`);
        
        if (!availabilityResponse.ok) {
          throw new Error(`Error al verificar disponibilidad: ${availabilityResponse.status}`);
        }

        const availabilityData = await availabilityResponse.json();
        console.log("[BOOKING_FORM] Datos de disponibilidad:", availabilityData);
        
        if (!availabilityData.available) {
          toast.error(availabilityData.error || "El horario seleccionado ya no está disponible");
          return;
        }
      }

      // Preparar datos para la reserva
      const [hours, minutes] = bookingData.time.split(':');
      const startDate = new Date(bookingData.date);
      startDate.setHours(parseInt(hours), parseInt(minutes));
      
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + bookingData.service.duration);

      // Formatear la fecha como YYYY-MM-DD para evitar problemas de zona horaria
      // Usamos la fecha en el formato YYYY-MM-DD extraída directamente del objeto fecha para 
      // evitar conversiones de zona horaria automáticas
      const formattedDate = format(bookingData.date, 'yyyy-MM-dd');
      console.log("[BOOKING_FORM] Fecha formateada para enviar:", formattedDate);
      
      // Crear versiones simplificadas de los objetos complejos
      const simplifiedService = {
        id: bookingData.service.id,
        name: bookingData.service.name,
        price: bookingData.service.price,
        duration: bookingData.service.duration
      };
      
      // Usar el profesional asignado (puede ser el original o uno encontrado para "any")
      const simplifiedStaff = {
        id: staffToUse.id,
        name: staffToUse.name,
        shopId: bookingData.location.id
      };
      
      // Intentar primero con /api/public/bookings con datos simplificados
      const requestBody = {
        service: simplifiedService,
        staff: simplifiedStaff,
        date: formattedDate,
        time: bookingData.time,
        userData: {
          name: bookingData.client.name,
          phone: bookingData.client.phone,
          email: bookingData.client.email || "",
          notes: bookingData.client.notes || ""
        }
      };

      console.log("[BOOKING_FORM] Enviando request con body:", JSON.stringify(requestBody));

      const response = await fetch("/api/public/bookings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`[BOOKING_FORM] Respuesta de API: status=${response.status}`);
      
      if (!response.ok) {
        // Intenta obtener el texto del error
        let errorText;
        try {
          errorText = await response.text();
          console.error(`[BOOKING_FORM] Error en respuesta API: ${errorText}`);
        } catch (e) {
          console.error(`[BOOKING_FORM] No se pudo leer el texto del error: ${e}`);
          errorText = "Error desconocido al crear la reserva";
        }
        throw new Error(errorText || "Error al crear la reserva");
      }

      // Intenta parsear la respuesta como JSON
      let responseData;
      try {
        responseData = await response.json();
        console.log("[BOOKING_FORM] Reserva creada exitosamente:", responseData);
      } catch (e) {
        console.error(`[BOOKING_FORM] Error al parsear respuesta JSON: ${e}`);
        // Si no podemos parsear JSON, al menos hemos tenido una respuesta exitosa
        responseData = { success: true };
      }
      
      toast.success("Reserva creada exitosamente");
      return responseData;
    } catch (error) {
      console.error('[BOOKING_FORM] Error creating booking:', error);
      setIsAssigningWorker(false);
      throw error; // Re-lanzamos el error para que lo maneje el componente de confirmación
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setBookingData({});
    setCurrentStep(1);
  };

  return (
    <Card className="p-6 shadow-lg border-t-4 border-t-primary">
      <div className="mb-8">
        <div className="flex justify-between mb-2 overflow-x-auto px-2 pb-4">
          {steps.map((step) => (
            <motion.span
              key={step.id}
              className={`text-[10px] sm:text-xs md:text-sm font-medium transition-colors duration-200 flex flex-col items-center min-w-[60px] sm:min-w-[80px] mx-1 ${
                step.id === currentStep
                  ? "text-primary"
                  : step.id < currentStep
                  ? "text-green-500"
                  : "text-gray-400"
              }`}
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-xl sm:text-2xl mb-1">{step.emoji}</span>
              <span className="text-center whitespace-normal sm:whitespace-nowrap">
                {step.name}
              </span>
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
          {currentStep === 3 && bookingData.location && bookingData.staff && bookingData.service && (
            <ScheduleStep
              onNext={handleNext}
              onBack={handleBack}
              updateBookingData={updateBookingData}
              location={bookingData.location}
              staff={bookingData.staff}
              service={bookingData.service}
            />
          )}
          {currentStep === 4 && bookingData.service && (
            <PaymentStep
              onNext={handleNext}
              onBack={handleBack}
              servicePrice={bookingData.service.price}
              updateBookingData={updateBookingData}
            />
          )}
          {currentStep === 5 && (
            <UserStep
              onNext={handleNext}
              onBack={handleBack}
              updateBookingData={updateBookingData}
            />
          )}
          {currentStep === 6 && bookingData.location && bookingData.service && 
           bookingData.staff && bookingData.client && bookingData.date && 
           bookingData.time && bookingData.paymentOption && (
            <ConfirmationStep
              onBack={handleBack}
              bookingData={bookingData as BookingData}
              onConfirm={handleSubmit}
              isLoading={isLoading}
              isAssigningWorker={isAssigningWorker}
              resetForm={resetForm}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}
