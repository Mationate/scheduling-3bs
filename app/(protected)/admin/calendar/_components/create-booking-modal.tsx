"use client";

import { useState, useEffect } from "react";
import { format, addMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: Date;
  selectedWorkerId?: string;
}

// Schema de validación
const formSchema = z.object({
  workerId: z.string().min(1, "Selecciona un profesional"),
  serviceId: z.string().min(1, "Selecciona un servicio"),
  clientName: z.string().min(1, "Nombre del cliente es requerido"),
  clientEmail: z.string().email("Email inválido"),
  clientPhone: z.string().optional(),
  date: z.date({ required_error: "La fecha es requerida" }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Hora inválida"),
});

export function CreateBookingModal({
  isOpen,
  onClose,
  onSuccess,
  selectedDate,
  selectedWorkerId
}: CreateBookingModalProps) {
  const [workers, setWorkers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [workerServices, setWorkerServices] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workerId: selectedWorkerId || "",
      serviceId: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      date: selectedDate || new Date(),
      startTime: "09:00",
    },
  });

  // Cargar trabajadores
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await fetch("/api/workers");
        const data = await response.json();
        setWorkers(data);
      } catch (error) {
        console.error("Error loading workers:", error);
        toast.error("Error al cargar los profesionales");
      }
    };
    fetchWorkers();
  }, []);

  // Cargar servicios del trabajador seleccionado
  useEffect(() => {
    const selectedWorker = form.watch("workerId");
    if (selectedWorker) {
      const fetchWorkerServices = async () => {
        setIsLoadingServices(true);
        try {
          const response = await fetch(`/api/workers/${selectedWorker}/services`);
          if (!response.ok) throw new Error("Error al cargar servicios");
          const data = await response.json();
          setWorkerServices(data);
        } catch (error) {
          console.error('Error fetching worker services:', error);
          toast.error("Error al cargar los servicios");
        } finally {
          setIsLoadingServices(false);
        }
      };
      fetchWorkerServices();
    }
  }, [form.watch("workerId")]);

  // Verificar disponibilidad
  const checkAvailability = async (values: z.infer<typeof formSchema>) => {
    setIsCheckingAvailability(true);
    try {
      const response = await fetch("/api/bookings/available?" + new URLSearchParams({
        workerId: values.workerId,
        date: values.date.toISOString(),
        time: values.startTime,
      }));
      
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error("Error checking availability:", error);
      return false;
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    // Verificar disponibilidad antes de crear
    const isAvailable = await checkAvailability(values);
    if (!isAvailable) {
      toast.error("El horario seleccionado no está disponible");
      setIsLoading(false);
      return;
    }

    try {
      // Obtener duración del servicio
      const service = services.find(s => s.id === values.serviceId);
      const endTime = addMinutes(
        new Date(`${format(values.date, 'yyyy-MM-dd')}T${values.startTime}`),
        service.duration
      );

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          endTime: format(endTime, 'HH:mm'),
          status: "PENDING"
        }),
      });

      if (!response.ok) throw new Error();

      toast.success("Reserva creada exitosamente");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error al crear la reserva");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Crear Nueva Reserva</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-12 gap-6 p-6">
              {/* Columna Izquierda - Calendario y Hora */}
              <div className="col-span-5 space-y-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de la Reserva</FormLabel>
                      <div className="border rounded-md p-3">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={es}
                          className="w-full"
                          disabled={(date) => date < new Date()}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de inicio</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          type="time"
                          min="08:00"
                          max="20:00"
                          step="1800"
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Columna Central - Profesional y Servicio */}
              <div className="col-span-3 space-y-4">
                <FormField
                  control={form.control}
                  name="workerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profesional</FormLabel>
                      <Select
                        disabled={isLoading}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar profesional" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workers.map((worker) => (
                            <SelectItem key={worker.id} value={worker.id}>
                              {worker.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Servicio</FormLabel>
                      <Select
                        disabled={!form.watch("workerId") || isLoading || isLoadingServices}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              isLoadingServices 
                                ? "Cargando servicios..." 
                                : "Seleccionar servicio"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workerServices.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} ({service.duration} min)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Columna Derecha - Datos del Cliente */}
              <div className="col-span-4 space-y-4">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del cliente</FormLabel>
                      <FormControl>
                        <Input disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email del cliente</FormLabel>
                      <FormControl>
                        <Input disabled={isLoading} type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono (opcional)</FormLabel>
                      <FormControl>
                        <Input disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Footer con botones */}
            <div className="flex items-center justify-end gap-2 p-6 bg-gray-50">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isCheckingAvailability}
                className="min-w-[100px]"
              >
                {isLoading || isCheckingAvailability ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : "Crear Reserva"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 