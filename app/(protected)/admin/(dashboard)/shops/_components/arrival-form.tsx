"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

interface Worker {
  id: string;
  name: string;
}

interface ArrivalFormProps {
  shopId: string;
  workers: Worker[];
  onSuccess?: () => void;
}

export function ArrivalForm({ shopId, workers, onSuccess }: ArrivalFormProps) {
  const [workerId, setWorkerId] = useState("");
  const [isLate, setIsLate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerId) {
      toast.error("Selecciona un profesional");
      return;
    }

    try {
      setIsLoading(true);
      const now = new Date();
      const response = await fetch("/api/worker-arrivals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workerId,
          shopId,
          date: now.toISOString(),
          isLate,
          arrivalTime: now.toISOString()
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        if (response.status === 400) {
          toast.error(error);
        } else {
          throw new Error();
        }
        return;
      }

      toast.success("Llegada registrada");
      setWorkerId("");
      setIsLate(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Error al registrar la llegada");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Profesional</Label>
        <Select value={workerId} onValueChange={setWorkerId}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar profesional" />
          </SelectTrigger>
          <SelectContent>
            {workers.map((worker) => (
              <SelectItem key={worker.id} value={worker.id}>
                {worker.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="late-mode"
          checked={isLate}
          onCheckedChange={setIsLate}
        />
        <Label htmlFor="late-mode">Marcar como atrasado</Label>
      </div>

      <Button type="submit" disabled={isLoading || !workerId} className="w-full">
        Registrar llegada
      </Button>
    </form>
  );
} 