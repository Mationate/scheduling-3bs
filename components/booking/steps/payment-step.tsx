"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CreditCard, Wallet, Calendar } from 'lucide-react';
import { formatPrice } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
  servicePrice: number;
  updateBookingData: (data: { paymentOption: PaymentOption, paymentAmount?: number }) => void;
}

type PaymentOption = "full" | "partial" | "later";

export function PaymentStep({
  onNext,
  onBack,
  servicePrice,
  updateBookingData,
}: PaymentStepProps) {
  const [paymentOption, setPaymentOption] = useState<PaymentOption>("later");
  const deposit = servicePrice * 0.5; // 50% de abono

  const handleContinue = () => {
    updateBookingData({
      paymentOption,
      paymentAmount: paymentOption === "full" ? servicePrice : 
                    paymentOption === "partial" ? deposit : 0
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">💳 Opciones de Pago</h2>
        <p className="text-sm text-gray-600">
          Elige cómo prefieres realizar el pago
        </p>
      </div>

      <RadioGroup
        defaultValue="later"
        onValueChange={(value) => setPaymentOption(value as PaymentOption)}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Card className={`p-4 cursor-pointer transition-all ${
              paymentOption === "full" ? "ring-2 ring-primary" : ""
            }`}>
              <RadioGroupItem value="full" id="full" className="hidden" />
              <Label htmlFor="full" className="cursor-pointer">
                <div className="flex flex-col items-center text-center gap-2">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">Pago Total</h3>
                    <p className="text-sm text-gray-600">
                      {formatPrice(servicePrice)}
                    </p>
                  </div>
                </div>
              </Label>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Card className={`p-4 cursor-pointer transition-all ${
              paymentOption === "partial" ? "ring-2 ring-primary" : ""
            }`}>
              <RadioGroupItem value="partial" id="partial" className="hidden" />
              <Label htmlFor="partial" className="cursor-pointer">
                <div className="flex flex-col items-center text-center gap-2">
                  <Wallet className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">Abono</h3>
                    <p className="text-sm text-gray-600">
                      {formatPrice(deposit)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      50% del total
                    </p>
                  </div>
                </div>
              </Label>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Card className={`p-4 cursor-pointer transition-all ${
              paymentOption === "later" ? "ring-2 ring-primary" : ""
            }`}>
              <RadioGroupItem value="later" id="later" className="hidden" />
              <Label htmlFor="later" className="cursor-pointer">
                <div className="flex flex-col items-center text-center gap-2">
                  <Calendar className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">Pagar en Local</h3>
                    <p className="text-sm text-gray-600">
                      {formatPrice(servicePrice)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      El día de tu cita
                    </p>
                  </div>
                </div>
              </Label>
            </Card>
          </motion.div>
        </div>
      </RadioGroup>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Resumen de Pago</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Precio del servicio:</span>
            <span>{formatPrice(servicePrice)}</span>
          </div>
          <div className="flex justify-between font-medium pt-2 border-t">
            <span>Total a pagar ahora:</span>
            <span>{formatPrice(
              paymentOption === "full" ? servicePrice :
              paymentOption === "partial" ? deposit :
              0
            )}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button onClick={handleContinue}>
          Continuar
        </Button>
      </div>
    </div>
  );
}

