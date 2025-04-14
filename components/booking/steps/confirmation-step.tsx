"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MapPin, Clock, User, Scissors, Mail, Phone, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatPrice } from "@/lib/utils";
import { Shop, Worker, Service, ShopSchedule, ShopBreak } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookingData } from "../booking-form";

interface ConfirmationStepProps {
  onBack: () => void;
  bookingData: BookingData;
  onConfirm: () => Promise<any>;
  isLoading: boolean;
  isAssigningWorker?: boolean;
  resetForm?: () => void;
}

export default function ConfirmationStep({ 
  onBack, 
  bookingData, 
  onConfirm, 
  isLoading,
  isAssigningWorker = false,
  resetForm 
}: ConfirmationStepProps) {
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [assignedWorker, setAssignedWorker] = useState<any>(null);

  // Efecto para verificar disponibilidad al cargar el componente
  useEffect(() => {
    const checkAvailability = async () => {
      // Solo verificar para "any" profesional
      if (bookingData.staff.id === "any") {
        try {
          setCheckingAvailability(true);
          setAvailabilityError(null);
          
          console.log("[CONFIRMATION_STEP] Verificando disponibilidad al cargar el componente");
          const dateParam = format(bookingData.date, 'yyyy-MM-dd');
          const response = await fetch(
            `/api/bookings/available?date=${dateParam}&workerId=any&time=${bookingData.time}&shopId=${bookingData.location.id}&serviceId=${bookingData.service.id}`
          );
          
          if (!response.ok) {
            throw new Error(`Error al verificar disponibilidad: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("[CONFIRMATION_STEP] Respuesta de disponibilidad:", data);
          
          if (!data.available || !data.suggestedWorker) {
            setAvailabilityError(data.error || "No hay profesionales disponibles para este horario");
          } else {
            // Guardar el profesional sugerido
            setAssignedWorker(data.suggestedWorker);
            toast.success(`Profesional disponible: ${data.suggestedWorker.name}`);
          }
        } catch (error) {
          console.error("[CONFIRMATION_STEP] Error al verificar disponibilidad:", error);
          setAvailabilityError(error instanceof Error ? error.message : "Error al verificar disponibilidad");
        } finally {
          setCheckingAvailability(false);
        }
      }
    };

    checkAvailability();
  }, [bookingData.staff.id, bookingData.date, bookingData.time, bookingData.location.id, bookingData.service.id]);

  const handleConfirm = async () => {
    try {
      setLocalLoading(true);
      setDebugInfo(null);
      console.log("[CONFIRMATION_STEP] Iniciando confirmación...");
      
      // Usamos el método onConfirm pasado como prop en lugar de implementar nuestra propia lógica
      const result = await onConfirm();
      setBookingResult(result);
      
      console.log("[CONFIRMATION_STEP] Confirmación completada exitosamente:", result);
      
      if (result && result.success) {
        // Mostrar confirmación solo si se completó correctamente
        toast.success("¡Reserva creada exitosamente!");
        setShowConfirmation(true);
      } else {
        // En caso de respuesta sin éxito explícito
        setDebugInfo("La reserva fue procesada pero no se recibió confirmación de éxito.");
        toast.warning("Reserva procesada, pero no se recibió confirmación.");
      }
    } catch (error) {
      console.error("[CONFIRMATION_STEP] Error en la confirmación:", error);
      
      // Mostrar información detallada para diagnóstico
      if (error instanceof Error) {
        setDebugInfo(`Error: ${error.message}`);
      } else {
        setDebugInfo("Error desconocido durante la confirmación.");
      }
      
      // Mostramos un mensaje detallado del error
      toast.error(error instanceof Error ? error.message : "No se pudo completar la reserva");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleFinish = () => {
    setShowConfirmation(false);
    if (resetForm) {
      resetForm();
    }
    router.push("/");
  };

  // Determinar si el botón de confirmación debe estar deshabilitado
  const isConfirmButtonDisabled = 
    isLoading || 
    localLoading || 
    isAssigningWorker || 
    checkingAvailability || 
    (bookingData.staff.id === "any" && !assignedWorker && !availabilityError);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">✅ Confirma tu Reserva</h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 bg-primary/5">
          <h3 className="text-lg font-semibold mb-4">Resumen de tu Reserva</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Local</p>
                  <p className="text-sm text-gray-600">{bookingData.location.name}</p>
                  <p className="text-sm text-gray-600">{bookingData.location.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Scissors className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Servicio</p>
                  <p className="text-sm text-gray-600">{bookingData.service.name}</p>
                  <p className="text-sm text-gray-600">
                    {formatPrice(bookingData.service.price)} · {bookingData.service.duration} min
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Fecha y Hora</p>
                  <p className="text-sm text-gray-600">
                    {format(bookingData.date, "PPP", { locale: es })}
                  </p>
                  <p className="text-sm text-gray-600">{bookingData.time} hrs</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Profesional</p>
                  <p className="text-sm text-gray-600">
                    {bookingData.staff.id === "any" ? (
                      checkingAvailability ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Buscando profesional disponible...
                        </span>
                      ) : assignedWorker ? (
                        assignedWorker.name
                      ) : (
                        <span className="text-rose-500 flex items-center">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          No disponible
                        </span>
                      )
                    ) : (
                      bookingData.staff.name
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Tus Datos</p>
                  <p className="text-sm text-gray-600">{bookingData.client.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-3 w-3" />
                    {bookingData.client.phone}
                  </div>
                  {bookingData.client.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      {bookingData.client.email}
                    </div>
                  )}
                </div>
              </div>

              {bookingData.client.notes && (
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Notas</p>
                    <p className="text-sm text-gray-600">{bookingData.client.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Mostrar mensaje de error de disponibilidad si existe */}
        {availabilityError && (
          <Alert className="mt-6 bg-rose-50 border-rose-200">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <AlertTitle className="text-rose-700">No hay profesionales disponibles</AlertTitle>
            <AlertDescription className="text-rose-700">
              {availabilityError}. Por favor, selecciona otro horario o fecha.
            </AlertDescription>
          </Alert>
        )}

        {/* Solo mostrar esto si no hay error de disponibilidad */}
        {!availabilityError && (
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Confirma tu reserva</AlertTitle>
            <AlertDescription>
              Al confirmar, se procesará tu reserva y recibirás una confirmación por WhatsApp.
            </AlertDescription>
          </Alert>
        )}

        {debugInfo && (
          <Alert className="mt-3 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-700" />
            <AlertDescription className="text-amber-700 text-xs font-mono break-words">
              {debugInfo}
            </AlertDescription>
          </Alert>
        )}
      </motion.div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isLoading || localLoading}>
          Volver
        </Button>
        <Button 
          onClick={handleConfirm} 
          disabled={isConfirmButtonDisabled || availabilityError !== null}
          className="bg-primary hover:bg-primary/90"
        >
          {(isLoading || localLoading) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirmando...
            </>
          ) : checkingAvailability ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando disponibilidad...
            </>
          ) : isAssigningWorker ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Asignando profesional...
            </>
          ) : "Confirmar Reserva"}
        </Button>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Reserva Confirmada!</DialogTitle>
            <DialogDescription className="space-y-2">
              <div>
                Tu reserva ha sido confirmada exitosamente. Recibirás información 
                adicional a través de WhatsApp al número {bookingData.client.phone}.
              </div>
              {bookingResult && bookingResult.booking && (
                <div className="font-medium">
                  Fecha: {format(bookingData.date, "PPP", { locale: es })}
                  <br />
                  Hora: {bookingData.time}
                  <br />
                  Profesional: {bookingResult.booking.worker?.name || 
                    (assignedWorker ? assignedWorker.name : bookingData.staff.name)}
                  <br />
                  Local: {bookingData.location.name}
                </div>
              )}
              {!bookingResult && (
                <div className="font-medium">
                  Fecha: {format(bookingData.date, "PPP", { locale: es })}
                  <br />
                  Hora: {bookingData.time}
                  <br />
                  Profesional: {assignedWorker ? assignedWorker.name : bookingData.staff.name}
                  <br />
                  Local: {bookingData.location.name}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              onClick={handleFinish}
              disabled={isLoading || localLoading}
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

