"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, DollarSign, User } from "lucide-react";
import { motion } from "framer-motion";
import { Shop, Worker, Service } from "@prisma/client";
import { formatPrice } from "@/lib/utils";

type ShopWithRelations = Shop & {
  workers: (Worker & {
    services: Service[]
  })[];
};

interface ServicesStepProps {
  location: ShopWithRelations;
  onNext: () => void;
  onBack: () => void;
  updateBookingData: (data: { service: Service; staff: Worker }) => void;
}

export function ServicesStep({
  location,
  onNext,
  onBack,
  updateBookingData,
}: ServicesStepProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Worker | null>(null);

  // Obtener servicios únicos de todos los trabajadores
  const uniqueServices = Array.from(
    new Map(
      location.workers.flatMap(worker => 
        worker.services.map(service => [service.id, service])
      )
    ).values()
  );

  // Obtener trabajadores que pueden realizar el servicio seleccionado
  const availableStaff = selectedService
    ? location.workers.filter(worker =>
        worker.services.some(service => service.id === selectedService.id)
      )
    : [];

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedStaff(null); // Resetear el staff al cambiar de servicio
  };

  const handleStaffSelect = (staff: Worker) => {
    setSelectedStaff(staff);
  };

  const handleNext = () => {
    if (selectedService && selectedStaff) {
      updateBookingData({ service: selectedService, staff: selectedStaff });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Selecciona el Servicio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uniqueServices.map((service) => (
            <motion.div
              key={service.id}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card
                className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedService?.id === service.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : ""
                }`}
                onClick={() => handleServiceSelect(service)}
              >
                <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{service.duration} minutos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span>{formatPrice(service.price)}</span>
                  </div>
                  {service.description && (
                    <p className="mt-2 text-sm">{service.description}</p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedService && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Selecciona el Profesional</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Seleccionar un trabajador aleatorio que pueda realizar el servicio
                const randomIndex = Math.floor(Math.random() * availableStaff.length);
                setSelectedStaff({
                  id: "any",
                  name: "Cualquier Profesional",
                  phone: null,
                  mail: null,
                  avatar: null,
                  status: "ACTIVE",
                  shopId: location.id,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                } as Worker);
              }}
              className={selectedStaff?.id === "any" ? "bg-primary/10" : ""}
            >
              Cualquier Profesional
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableStaff.map((staff) => (
              <Card
                key={staff.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedStaff?.id === staff.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : ""
                }`}
                onClick={() => handleStaffSelect(staff)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{staff.name}</h3>
                    <p className="text-sm text-muted-foreground">Profesional</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {selectedStaff?.id === "any" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-primary/5 rounded-lg"
            >
              <p className="text-sm text-muted-foreground">
                Se te asignará automáticamente un profesional disponible para el horario que selecciones.
                Todos nuestros profesionales están altamente capacitados para brindarte el mejor servicio.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedService || !selectedStaff}
          className="bg-primary hover:bg-primary/90"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}