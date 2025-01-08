"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Clock, ExternalLink, Scissors, Check } from 'lucide-react';
import { motion } from "framer-motion";
import { Shop, Worker, Service, ShopSchedule, ShopBreak } from "@prisma/client";
import { BookingData } from "../booking-form";

type ShopWithRelations = Shop & {
  workers: (Worker & {
    services: Service[]
  })[];
  schedules: ShopSchedule[];
  breaks: ShopBreak[];
};

interface LocationStepProps {
  locations: ShopWithRelations[];
  onNext: () => void;
  updateBookingData: (data: Partial<BookingData>) => void;
}

export default function LocationStep({ locations, onNext, updateBookingData }: LocationStepProps) {
  const [selectedLocation, setSelectedLocation] = useState<ShopWithRelations | null>(null);

  const handleSelect = (location: ShopWithRelations) => {
    setSelectedLocation(location);
    updateBookingData({ location });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">📍 Selecciona tu Local</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {locations.map((location) => (
          <motion.div
            key={location.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card
              className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                selectedLocation?.id === location.id
                  ? "ring-2 ring-primary bg-primary/5"
                  : ""
              }`}
              onClick={() => handleSelect(location)}
            >
              <div className="relative h-40 mb-4 rounded-md overflow-hidden">
                <Image
                  src={location.image || "/placeholder-shop.jpg"}
                  alt={location.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">{location.name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{location.address}</span>
                </div>
                {location.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{location.phone}</span>
                  </div>
                )}
                {location.schedule && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{location.schedule}</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <Card className="p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">✨ Información Detallada</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Servicios Disponibles 💇‍♀️</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {Array.from(new Set(selectedLocation.workers.flatMap(worker => 
                    worker.services.map(service => service.name)
                  ))).map((serviceName) => (
                    <li key={serviceName} className="flex items-center gap-2">
                      <Scissors className="h-3 w-3 text-primary" />
                      {serviceName}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Información Adicional 📌</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-primary" />
                    {selectedLocation.workers.length} profesionales disponibles
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-primary" />
                    WiFi Gratis
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-primary" />
                    Aire Acondicionado
                  </li>
                </ul>
              </div>
            </div>
            {selectedLocation.address && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => window.open(`https://maps.google.com/maps?q=${encodeURIComponent(selectedLocation.address ?? '')}`, '_blank')}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  Ver en Google Maps
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      <div className="mt-6 flex justify-end">
        <Button
          onClick={onNext}
          disabled={!selectedLocation}
          className="bg-primary hover:bg-primary/90"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
