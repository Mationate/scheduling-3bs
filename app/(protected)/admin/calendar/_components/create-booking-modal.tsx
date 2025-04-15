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
import { useRouter } from "next/navigation";

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: Date;
  selectedWorkerId?: string;
  shopId: string;
  workers: any[];
}

// Schema de validación
const formSchema = z.object({
  workerId: z.string().min(1, "Selecciona un profesional"),
  serviceId: z.string().optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().optional().or(z.string().email("Email inválido")),
  clientPhone: z.string().optional(),
  date: z.date({ required_error: "La fecha es requerida" }),
  startTime: z.string().optional(),
  isBlockDay: z.boolean().default(false),
  blockReason: z.string().optional(),
}).refine((data) => {
  // Si es un bloqueo, solo necesitamos workerId y date
  if (data.isBlockDay) {
    return true;
  }
  
  // Si es una reserva normal, validamos campos adicionales
  return (
    !!data.serviceId && 
    data.serviceId.length > 0 &&
    !!data.clientName && 
    data.clientName.length > 0 &&
    !!data.clientEmail && 
    data.clientEmail.length > 0 &&
    !!data.startTime &&
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.startTime)
  );
}, {
  message: "Por favor complete todos los campos requeridos",
  path: ["serviceId"]
});

export function CreateBookingModal({
  isOpen,
  onClose,
  onSuccess,
  selectedDate,
  selectedWorkerId,
  shopId,
  workers
}: CreateBookingModalProps) {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [workerServices, setWorkerServices] = useState<any[]>([]);
  const router = useRouter();

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
      isBlockDay: false,
      blockReason: "",
    },
  });

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
      // Si no hay tiempo seleccionado (bloqueo de día), consideramos que está disponible
      if (!values.startTime) {
        return true;
      }
      
      const params = new URLSearchParams({
        workerId: values.workerId,
        date: values.date.toISOString(),
        time: values.startTime
      });
      
      const response = await fetch("/api/bookings/available?" + params);
      
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error("Error checking availability:", error);
      return false;
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Buscar o crear un servicio para bloqueos
  const getBlockService = async (shopId: string, workerId: string): Promise<string | null> => {
    console.log("Comenzando getBlockService con shopId:", shopId, "y workerId:", workerId);
    
    // Primero, intentemos buscar entre los servicios que ya tiene asignados el trabajador
    console.log("Buscando en los servicios del trabajador...");
    try {
      const workerServicesResponse = await fetch(`/api/workers/${workerId}/services`);
      if (workerServicesResponse.ok) {
        const services = await workerServicesResponse.json();
        console.log("Servicios del trabajador:", services);
        
        // Buscar un servicio con nombre de bloqueo
        const blockService = services.find((s: any) => 
          s.name.toLowerCase().includes("bloqueo") || 
          s.name.toLowerCase().includes("block"));
        
        if (blockService) {
          console.log("Servicio de bloqueo encontrado en los servicios del trabajador:", blockService);
          return blockService.id;
        }
      }
    } catch (error) {
      console.warn("Error al buscar servicios del trabajador, continuando con otra estrategia:", error);
    }
    
    try {
      // Intentar encontrar un servicio de bloqueo existente
      console.log("Buscando servicio de bloqueo existente en todos los servicios...");
      const response = await fetch(`/api/services?name=Bloqueo de Agenda`);
      
      if (!response.ok) {
        console.error("Error al buscar servicios:", await response.text());
        // En lugar de fallar, usaremos una estrategia alternativa
        console.log("Intentando crear un servicio de bloqueo en su lugar...");
      } else {
        const services = await response.json();
        console.log("Servicios encontrados:", services);
        
        if (services && services.length > 0) {
          console.log("Servicio de bloqueo encontrado:", services[0]);
          
          // Intentar asignar al trabajador si es necesario, pero capturar errores
          try {
            console.log("Intentando asignar el servicio al trabajador...");
            
            // Hacemos la solicitud al nuevo endpoint directamente
            const assignResponse = await fetch(`/api/workers/${workerId}/services/${services[0].id}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-block-operation": "true" // Cabecera especial para operaciones de bloqueo
              }
            });
            
            if (!assignResponse.ok) {
              const errorStatus = assignResponse.status;
              console.warn(`Respuesta al asignar servicio: ${errorStatus}`);
              if (errorStatus !== 200) {
                const errorText = await assignResponse.text();
                console.warn("Detalle del error:", errorText);
              }
            } else {
              console.log("Servicio asignado exitosamente al trabajador");
            }
          } catch (assignError) {
            console.warn("Error al asignar el servicio, pero continuaremos:", assignError);
          }
          
          return services[0].id;
        }
      }
      
      // Si no existe o hubo error, crear uno nuevo
      console.log("Intentando crear un servicio de bloqueo para la tienda:", shopId);
      
      // Verificar si tenemos acceso a la API de creación de servicios
      try {
        const createResponse = await fetch("/api/services", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: "Bloqueo de Agenda",
            description: "Tiempo bloqueado en la agenda del profesional",
            price: 0,
            duration: 1440, // 24 horas en minutos
            ownerId: shopId
          }),
        });
        
        if (!createResponse.ok) {
          console.error("Error al crear servicio:", await createResponse.text());
          throw new Error("No se pudo crear un servicio de bloqueo");
        }
        
        const newService = await createResponse.json();
        console.log("Servicio creado exitosamente:", newService);
        
        // Intentar asignar al trabajador
        try {
          const assignResponse = await fetch(`/api/workers/${workerId}/services/${newService.id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-block-operation": "true" // Cabecera especial para operaciones de bloqueo
            }
          });
          
          if (!assignResponse.ok) {
            const errorStatus = assignResponse.status;
            console.warn(`Respuesta al asignar servicio: ${errorStatus}`);
            if (errorStatus !== 200) {
              const errorText = await assignResponse.text();
              console.warn("Detalle del error:", errorText);
            }
          } else {
            console.log("Servicio asignado exitosamente al trabajador");
          }
        } catch (assignError) {
          console.warn("Error al asignar el servicio, pero continuaremos:", assignError);
        }
        
        return newService.id;
      } catch (createError) {
        console.error("Error al crear servicio:", createError);
        
        // Como último recurso, buscar cualquier servicio que el trabajador ya tenga asignado
        console.log("Buscando cualquier servicio del trabajador como alternativa...");
        const fallbackResponse = await fetch(`/api/workers/${workerId}/services`);
        
        if (fallbackResponse.ok) {
          const services = await fallbackResponse.json();
          if (services && services.length > 0) {
            console.log("Usando el primer servicio disponible:", services[0]);
            return services[0].id;
          }
        }
        
        throw new Error("No se pudo encontrar o crear un servicio para bloqueos");
      }
    } catch (error) {
      console.error("Error en getBlockService:", error);
      throw error;
    }
  };

  // Función de envío simplificada y robusta
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isLoading) {
      console.log("Formulario ya está en proceso de envío, evitando múltiples envíos");
      return;
    }
    
    console.log("Inicio del proceso de envío del formulario:", values);
    
    try {
      setIsLoading(true);
      
      if (values.isBlockDay) {
        console.log("Procesando bloqueo de día");
        
        // 1. Obtener información del trabajador desde el estado local
        console.log("Buscando trabajador en los datos locales con ID:", values.workerId);
        const worker = workers.find(w => w.id === values.workerId);
        
        if (!worker) {
          toast.error("No se pudo encontrar información del profesional");
          console.error("Trabajador no encontrado en los datos locales:", values.workerId);
          setIsLoading(false);
          return;
        }
        
        console.log("Información del trabajador encontrada:", worker);
        console.log("Usando shopId de la vista seleccionada:", shopId);
        
        // 2. Obtener el servicio para el bloqueo
        console.log("Obteniendo servicio para bloqueo");
        let serviceId;
        try {
          serviceId = await getBlockService(shopId, values.workerId);
          console.log("Servicio para bloqueo obtenido:", serviceId);
        } catch (error) {
          console.error("Error al obtener servicio para bloqueo:", error);
          toast.error("No se pudo obtener un servicio para bloqueo");
          setIsLoading(false);
          return;
        }
        
        // 3. Calcular fecha y hora para el bloqueo
        const date = new Date(values.date);
        const fullDay = {
          start: new Date(date.setHours(0, 0, 0, 0)),
          end: new Date(new Date(date).setHours(23, 59, 59, 999))
        };
        
        console.log("Creando bloqueo para fecha:", {
          date: values.date,
          fullDay
        });
        
        // 4. Enviar la solicitud de bloqueo
        try {
          console.log("Enviando solicitud para crear bloqueo con los siguientes datos:");
          const requestBody = {
            workerId: values.workerId,
            serviceId: serviceId,
            isAllDay: true,
            notes: values.blockReason || "Día bloqueado",
            date: format(values.date, "yyyy-MM-dd"),
            startTime: format(fullDay.start, "HH:mm"),
            endTime: format(fullDay.end, "HH:mm"),
            status: "BLOCK",
            shopId: shopId
            // Eliminamos clientId, que será manejado por el backend
          };
          
          console.log("Datos de la solicitud:", requestBody);
          
          const response = await fetch("/api/bookings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });
          
          if (!response.ok) {
            let errorMessage = "Error al crear el bloqueo";
            try {
              const errorData = await response.text();
              console.error("Error en respuesta:", errorData);
              errorMessage = errorData || errorMessage;
            } catch (parseError) {
              console.error("No se pudo parsear el mensaje de error:", parseError);
            }
            throw new Error(errorMessage);
          }
          
          console.log("Bloqueo creado exitosamente");
          toast.success("Día bloqueado exitosamente");
          onClose();
          router.refresh();
        } catch (error) {
          console.error("Error al enviar la solicitud de bloqueo:", error);
          toast.error(error instanceof Error ? error.message : "Error al bloquear el día");
        }
      } else {
        // Proceso normal para reservas de clientes
        console.log("Procesando reserva normal");
        
        try {
          console.log("Preparando datos para reserva normal");
          const requestBody = {
            workerId: values.workerId,
            serviceId: values.serviceId,
            clientName: values.clientName,
            clientEmail: values.clientEmail,
            clientPhone: values.clientPhone || undefined,
            date: format(values.date, "yyyy-MM-dd"),  // Formato ISO para la fecha
            startTime: values.startTime,
            isAllDay: false,
            shopId: shopId
          };
          
          console.log("Datos de la reserva:", requestBody);
          
          const response = await fetch("/api/bookings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });
          
          if (!response.ok) {
            let errorMessage = "Error al crear la reserva";
            try {
              const errorData = await response.text();
              console.error("Error en respuesta:", errorData);
              errorMessage = errorData || errorMessage;
            } catch (parseError) {
              console.error("No se pudo parsear el mensaje de error:", parseError);
            }
            throw new Error(errorMessage);
          }
          
          console.log("Reserva creada exitosamente");
          toast.success("Reserva creada exitosamente");
          onClose();
          router.refresh();
        } catch (error) {
          console.error("Error al enviar la solicitud de reserva:", error);
          toast.error(error instanceof Error ? error.message : "Error al crear la reserva");
        }
      }
    } catch (error) {
      console.error("Error en el proceso de envío del formulario:", error);
      toast.error("Ha ocurrido un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener el valor actual de isBlockDay para condicionar la UI
  const isBlockDay = form.watch("isBlockDay");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Crear Nueva Reserva</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              console.log("Formulario submitted - Estado:", form.formState);
              form.handleSubmit(onSubmit)(e);
            }}
          >
            <div className="grid grid-cols-12 gap-6 p-6">
              {/* Nueva fila para seleccionar tipo de reserva */}
              <div className="col-span-12 mb-3">
                <FormField
                  control={form.control}
                  name="isBlockDay"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            id="isBlockDay"
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                        </FormControl>
                        <label 
                          htmlFor="isBlockDay"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Bloquear día completo para el profesional
                        </label>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
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

                {!isBlockDay && (
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
                )}

                {isBlockDay && (
                  <FormField
                    control={form.control}
                    name="blockReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivo del bloqueo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Vacaciones, Capacitación, etc."
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
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

                {!isBlockDay && (
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
                )}
              </div>

              {/* Columna Derecha - Datos del Cliente */}
              {!isBlockDay && (
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
              )}
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
                disabled={isLoading || (isCheckingAvailability && !isBlockDay)}
                className="min-w-[140px] relative"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isBlockDay ? "Bloqueando..." : "Guardando..."}
                  </span>
                ) : isBlockDay ? "Bloquear Día" : "Crear Reserva"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 