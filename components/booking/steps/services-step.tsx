"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Scissors } from "lucide-react";

const services = [
  {
    id: "1",
    name: "Classic Haircut",
    description: "Traditional haircut with styling",
    price: 30,
    duration: 30,
  },
  {
    id: "2",
    name: "VIP Package",
    description: "Haircut, beard trim, and hot towel treatment",
    price: 50,
    duration: 60,
  },
  {
    id: "3",
    name: "Full Package",
    description: "VIP package plus head massage and styling products",
    price: 75,
    duration: 90,
  },
];

const staff = [
  {
    id: "1",
    name: "John Smith",
    image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=800&auto=format&fit=crop&q=60",
    bio: "Master barber with 10 years of experience",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&auto=format&fit=crop&q=60",
    bio: "Specializes in modern cuts and styling",
  },
];

export default function ServicesStep({ onNext, onBack, updateBookingData, locationId }: any) {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    updateBookingData({ service });
  };

  const handleStaffSelect = (staff: any) => {
    setSelectedStaff(staff);
    updateBookingData({ staff });
  };

  const handleContinue = () => {
    updateBookingData({ staff: selectedStaff });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Select a Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedService?.id === service.id
                  ? "ring-2 ring-primary"
                  : "hover:shadow-md"
              }`}
              onClick={() => handleServiceSelect(service)}
            >
              <div className="flex items-center gap-2 mb-2">
                <Scissors className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{service.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {service.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{service.duration} min</span>
                </div>
                <span className="font-semibold">${service.price}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedService && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Choose Your Stylist (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staff.map((person) => (
              <Card
                key={person.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedStaff?.id === person.id
                    ? "ring-2 ring-primary"
                    : "hover:shadow-md"
                }`}
                onClick={() => handleStaffSelect(person)}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={person.image} alt={person.name} />
                    <AvatarFallback>{person.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{person.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {person.bio}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedService}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}