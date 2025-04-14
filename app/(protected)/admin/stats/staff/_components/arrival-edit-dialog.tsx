"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

interface ArrivalEditDialogProps {
  arrival: {
    id: string;
    date: Date;
    isLate: boolean;
    workerName: string;
  };
  onUpdate: () => void;
}

export function ArrivalEditDialog({ arrival, onUpdate }: ArrivalEditDialogProps) {
  const [isLate, setIsLate] = useState(arrival.isLate);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/worker-arrivals/${arrival.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isLate }),
      });

      if (!response.ok) throw new Error();

      toast.success('Registro actualizado');
      onUpdate();
    } catch (error) {
      toast.error('Error al actualizar el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Registro de Llegada</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <p className="font-medium">{arrival.workerName}</p>
            <p className="text-sm text-muted-foreground">
              {format(arrival.date, "EEEE d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="late-mode"
              checked={isLate}
              onCheckedChange={setIsLate}
            />
            <Label htmlFor="late-mode">Marcar como atrasado</Label>
          </div>
          <Button 
            onClick={handleUpdate} 
            disabled={isLoading}
            className="w-full"
          >
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 