"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, DollarSign, User } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Shop, Worker, Service } from "@prisma/client";
import { formatPrice } from "@/lib/utils";

type ShopWithRelations = Shop & {
  workers: (Worker & {
    services: Service[]
  })[];
};

interface ServicesStepProps {
  location: Shop & {
    workers: (Worker & {
      services: Service[];
    })[];
  };
  onNext: () => void;
  onBack: () => void;
  updateBookingData: (data: {
    service: Service;
    staff: Worker & {
      services: Service[];
    };
  }) => void;
}

export function ServicesStep({
  location,
  onNext,
  onBack,
  updateBookingData,
}: ServicesStepProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Worker & { services: Service[] } | null>(null);

  const uniqueServices = Array.from(
    new Map(
      location.workers.flatMap(worker => 
        worker.services.map(service => [service.id, service])
      )
    ).values()
  );

  const availableStaff = selectedService
    ? location.workers.filter(worker =>
        worker.services.some(service => service.id === selectedService.id)
      ).map(staff => ({
        ...staff,
        services: staff.services.filter(s => s.id === selectedService.id)
      }))
    : [];

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedStaff(null);
  };

  const handleStaffSelect = (staff: Worker & { services: Service[] }) => {
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
        <h2 className="text-2xl font-semibold mb-4 text-center">✂️ Selecciona el Servicio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {uniqueServices.map((service) => (
            <motion.div
              key={service.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
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
                <div className="space-y-2 text-sm text-gray-600">
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

      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-center">👨‍💼 Selecciona el Profesional</h2>
              <p className="text-sm text-gray-600 mt-1 text-center">
                Elige un profesional específico o selecciona &quot;Cualquier Profesional Disponible&quot;
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg border-2 ${
                    selectedStaff?.id === "any"
                      ? "border-primary bg-primary/5"
                      : "border-transparent"
                  }`}
                  onClick={() => {
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
                      services: [selectedService!],
                    } as Worker & { services: Service[] });
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">&quot;Cualquier Profesional&quot;</h3>
                      <p className="text-sm text-gray-600">Disponible</p>
                    </div>
                  </div>
                  {selectedStaff?.id === "any" && (
                    <div className="mt-2 text-xs text-primary">
                      Se te asignará el primer profesional disponible
                    </div>
                  )}
                </Card>
              </motion.div>

              {availableStaff.map((staff) => (
                <motion.div
                  key={staff.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                      selectedStaff?.id === staff.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : ""
                    }`}
                    onClick={() => handleStaffSelect(staff as Worker & { services: Service[] })}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{staff.name}</h3>
                        <p className="text-sm text-gray-600">Profesional</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack} className="border-gray-300 text-gray-700 hover:bg-gray-100">
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

