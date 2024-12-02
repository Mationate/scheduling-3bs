"use client";

import { Worker } from "@prisma/client";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ManageWorkersProps {
  shopId: string;
  currentWorkers: Worker[];
  availableWorkers: Worker[];
}

export function ManageWorkers({
  shopId,
  currentWorkers,
  availableWorkers,
}: ManageWorkersProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<string>("");

  const handleAddWorker = async () => {
    if (!selectedWorker) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/shops/${shopId}/workers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workerId: selectedWorker,
        }),
      });

      if (!response.ok) throw new Error();

      toast.success("Trabajador asignado correctamente");
      router.refresh();
    } catch {
      toast.error("Error al asignar el trabajador");
    } finally {
      setLoading(false);
      setSelectedWorker("");
    }
  };

  const handleRemoveWorker = async (workerId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shops/${shopId}/workers/${workerId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      toast.success("Trabajador removido correctamente");
      router.refresh();
    } catch {
      toast.error("Error al remover el trabajador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-100 p-4 rounded-lg">
        <h3 className="font-medium mb-2">¿Cómo funciona?</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>Solo puedes asignar trabajadores que estén en estado "Activo"</li>
          <li>Un trabajador solo puede estar asignado a una tienda a la vez</li>
          <li>Al remover un trabajador, su estado vuelve a "Sin Asignar"</li>
          <li>Los cambios se aplican inmediatamente</li>
        </ul>
      </div>

      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">
            Agregar Nuevo Trabajador
          </label>
          <Select
            value={selectedWorker}
            onValueChange={setSelectedWorker}
            disabled={loading || availableWorkers.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar trabajador" />
            </SelectTrigger>
            <SelectContent>
              {availableWorkers.map((worker) => (
                <SelectItem key={worker.id} value={worker.id}>
                  {worker.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleAddWorker}
          disabled={!selectedWorker || loading}
        >
          Agregar Trabajador
        </Button>
      </div>

      <div>
        <h3 className="font-medium mb-4">Trabajadores Actuales</h3>
        {currentWorkers.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No hay trabajadores asignados a esta tienda
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentWorkers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell>{worker.name}</TableCell>
                  <TableCell>{worker.mail}</TableCell>
                  <TableCell>
                    <Badge variant={worker.status === "ACTIVE" ? "default" : "secondary"}>
                      {worker.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveWorker(worker.id)}
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