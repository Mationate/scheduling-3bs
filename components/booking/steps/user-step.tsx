"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function UserStep({ onNext, onBack, updateBookingData }: any) {
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");

  const handleSendCode = () => {
    // Simulate sending verification code
    toast.success("Verification code sent!");
    setStep("verify");
  };

  const handleVerify = () => {
    // Simulate verification
    if (verificationCode === "1234") {
      updateBookingData({
        user: {
          phone,
          verified: true,
        },
      });
      onNext();
    } else {
      toast.error("Invalid verification code");
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Verify Your Phone Number</h2>
        {step === "phone" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSendCode}
              disabled={!phone}
              className="w-full"
            >
              Send Verification Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Enter Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="1234"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Use code "1234" for demo purposes
              </p>
            </div>
            <Button
              onClick={handleVerify}
              disabled={!verificationCode}
              className="w-full"
            >
              Verify Code
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}