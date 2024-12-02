"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Clock, ExternalLink, Scissors, Check } from "lucide-react";
import { motion } from "framer-motion";

const locations = [
  {
    id: "1",
    name: "3BS Manquehue",
    address: "Av. Manquehue Sur 329, Las Condes",
    phone: "+56 9 5555 5555",
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=60",
    schedule: "Lun-Sáb: 9:00-20:00, Dom: 10:00-18:00",
    mapUrl: "https://maps.google.com",
    description: "Ubicado en el corazón de Las Condes, nuestro local insignia ofrece un ambiente moderno y acogedor. Contamos con estacionamiento gratuito y fácil acceso desde el metro Manquehue.",
    services: ["Corte de Cabello", "Afeitado", "Tratamientos Capilares"],
    amenities: ["WiFi Gratis", "Café de Cortesía", "Estacionamiento"],
  },
  {
    id: "2",
    name: "3BS Ñuñoa",
    address: "Av. Irarrázaval 3665, Ñuñoa",
    phone: "+56 9 5555 5556",
    image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&auto=format&fit=crop&q=60",
    schedule: "Lun-Sáb: 10:00-21:00, Dom: Cerrado",
    mapUrl: "https://maps.google.com",
    description: "Nuestro local en Ñuñoa combina el estilo tradicional con toques modernos. Ubicado en pleno barrio gastronómico, perfecto para combinar tu corte con un buen café o almuerzo.",
    services: ["Corte de Cabello", "Afeitado", "Coloración"],
    amenities: ["WiFi Gratis", "Café de Cortesía", "Zona de Espera Premium"],
  },
];

export default function LocationStep({ onNext, updateBookingData }: any) {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const handleSelect = (location: any) => {
    setSelectedLocation(location);
    updateBookingData({ location });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Selecciona tu Local</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((location) => (
          <motion.div
            key={location.id}
            whileHover={{ scale: 1.02 }}
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
              <div className="relative h-48 mb-4 rounded-md overflow-hidden">
                <Image
                  src={location.image}
                  alt={location.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">{location.name}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{location.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{location.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{location.schedule}</span>
                </div>
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
          <Card className="p-4 bg-primary/5">
            <h3 className="text-lg font-semibold mb-3">Información Detallada</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedLocation.description}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Servicios Disponibles</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedLocation.services.map((service: string) => (
                    <li key={service} className="flex items-center gap-2">
                      <Scissors className="h-3 w-3 text-primary" />
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Comodidades</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedLocation.amenities.map((amenity: string) => (
                    <li key={amenity} className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-primary" />
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => window.open(selectedLocation.mapUrl, '_blank')}
              >
                <MapPin className="h-3 w-3 mr-1" />
                Ver en Google Maps
              </Button>
            </div>
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