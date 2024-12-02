"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import LocationStep from "./steps/location-step";
import ServicesStep from "./steps/services-step";
import UserStep from "./steps/user-step";
import ConfirmationStep from "./steps/confirmation-step";

const steps = [
  { id: 1, name: "Local" },
  { id: 2, name: "Servicios" },
  { id: 3, name: "Tus Datos" },
  { id: 4, name: "Confirmación" },
];

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    location: null,
    service: null,
    staff: null,
    user: null,
    date: null,
  });

  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const updateBookingData = (data: any) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  return (
    <Card className="p-6 shadow-lg border-t-4 border-t-primary">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step) => (
            <span
              key={step.id}
              className={`text-sm font-medium transition-colors duration-200 ${
                step.id === currentStep
                  ? "text-primary"
                  : step.id < currentStep
                  ? "text-green-500"
                  : "text-muted-foreground"
              }`}
            >
              {step.name}
            </span>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="min-h-[400px]"
        >
          {currentStep === 1 && (
            <LocationStep
              onNext={handleNext}
              updateBookingData={updateBookingData}
            />
          )}
          {currentStep === 2 && (
            <ServicesStep
              onNext={handleNext}
              onBack={handleBack}
              updateBookingData={updateBookingData}
              locationId={bookingData.location}
              selectedLocation={bookingData.location}
            />
          )}
          {currentStep === 3 && (
            <UserStep
              onNext={handleNext}
              onBack={handleBack}
              updateBookingData={updateBookingData}
            />
          )}
          {currentStep === 4 && (
            <ConfirmationStep
              onBack={handleBack}
              bookingData={bookingData}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}