"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrivalForm } from "./arrival-form";
import { startOfDay, endOfDay } from "date-fns";
import toast from "react-hot-toast";
import { useShop } from "@/hooks/use-shop";

interface Worker {
  id: string;
  name: string;
  hasArrivalToday: boolean;
}

export function ArrivalControlModal() {
  const { shop, setShop } = useShop();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await fetch('/api/shops/current');
        const data = await response.json();
        setShop(data);
      } catch (error) {
        console.error("Error fetching shop:", error);
        toast.error("Error al cargar el local");
      }
    };
    
    if (!shop) {
      fetchShop();
    }
  }, []);

  useEffect(() => {
    if (isOpen && shop) {
      checkTodayArrivals();
    }
  }, [isOpen, shop]);

  const checkTodayArrivals = async () => {
    try {
      setIsLoading(true);
      // Primero obtener todos los trabajadores del local
      const workersResponse = await fetch(`/api/shops/${shop?.id}/workers`);
      const allWorkers = await workersResponse.json();

      // Luego obtener las llegadas de hoy
      const today = new Date();
      const arrivalsResponse = await fetch(
        `/api/shops/${shop?.id}/worker-arrivals?start=${startOfDay(today).toISOString()}&end=${endOfDay(today).toISOString()}`
      );
      const todayArrivals = await arrivalsResponse.json();

      // Marcar los trabajadores que ya tienen registro
      const updatedWorkers = allWorkers.map((worker: any) => ({
        id: worker.id,
        name: worker.name,
        hasArrivalToday: todayArrivals.some((arrival: any) => arrival.workerId === worker.id)
      }));

      setWorkers(updatedWorkers);
    } catch (error) {
      console.error("Error checking arrivals:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    checkTodayArrivals();
  };

  const availableWorkers = workers.filter(w => !w.hasArrivalToday);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Control de Llegadas</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Control de Llegadas</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Cargando...
          </div>
        ) : availableWorkers.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Todos los profesionales ya han registrado su llegada hoy
          </div>
        ) : (
          <ArrivalForm 
            shopId={shop?.id || ''} 
            workers={availableWorkers}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
} 