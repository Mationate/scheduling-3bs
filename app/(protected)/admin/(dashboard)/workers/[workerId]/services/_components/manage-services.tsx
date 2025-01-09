"use client";

import { Service } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface ManageServicesProps {
  workerId: string;
  currentServices: Service[];
  availableServices: Service[];
}

export function ManageServices({
  workerId,
  currentServices,
  availableServices,
}: ManageServicesProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");

  const handleAddService = async () => {
    if (!selectedService) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/workers/${workerId}/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: selectedService,
        }),
      });

      if (!response.ok) throw new Error();

      toast.success("Servicio asignado correctamente");
      router.refresh();
    } catch {
      toast.error("Error al asignar el servicio");
    } finally {
      setLoading(false);
      setSelectedService("");
    }
  };

  const handleRemoveService = async (serviceId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workers/${workerId}/services/${serviceId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      toast.success("Servicio removido correctamente");
      router.refresh();
    } catch {
      toast.error("Error al remover el servicio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-100 p-4 rounded-lg">
        <h3 className="font-medium mb-2">¿Cómo funciona?</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>Asigna los servicios que el trabajador está capacitado para realizar</li>
          <li>Un mismo servicio puede ser realizado por varios trabajadores</li>
          <li>Los servicios asignados aparecerán como opciones al crear reservas</li>
          <li>Los cambios afectan inmediatamente al sistema de reservas</li>
        </ul>
      </div>

      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">
            Agregar Nuevo Servicio
          </label>
          <Select
            value={selectedService}
            onValueChange={setSelectedService}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar servicio" />
            </SelectTrigger>
            <SelectContent>
              {availableServices.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} - {formatPrice(service.price)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleAddService}
          disabled={!selectedService || loading}
        >
          Agregar Servicio
        </Button>
      </div>

      <div>
        <h3 className="font-medium mb-4">Servicios Asignados</h3>
        {currentServices.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Este trabajador aún no tiene servicios asignados
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell>{formatPrice(service.price)}</TableCell>
                  <TableCell>{service.duration} min</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveService(service.id)}
                      disabled={loading}
                    >
                      Remover
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
} 