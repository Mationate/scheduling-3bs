"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Loader2 } from 'lucide-react';
import axios from "axios";
import { toast } from "sonner";

const emailSchema = z.object({
  email: z.string().email("Email inválido"),
});

const verificationSchema = z.object({
  code: z.string().length(6, "El código debe tener 6 dígitos"),
});

const additionalDataSchema = z.object({
  phone: z.string().min(9, "El teléfono debe tener al menos 9 dígitos"),
  notes: z.string().optional(),
});

type FormStep = "email" | "verification" | "additionalData";

interface UserStepProps {
  onNext: () => void;
  onBack: () => void;
  updateBookingData: (data: any) => void;
}

export function UserStep({
  onNext,
  onBack,
  updateBookingData,
}: UserStepProps) {
  const [formStep, setFormStep] = useState<FormStep>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [email, setEmail] = useState("");

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const verificationForm = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { code: "" },
  });

  const additionalDataForm = useForm<z.infer<typeof additionalDataSchema>>({
    resolver: zodResolver(additionalDataSchema),
    defaultValues: { phone: "", notes: "" },
  });

  const onEmailSubmit = async (data: z.infer<typeof emailSchema>) => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/check-user", { email: data.email });
      setUserExists(response.data.exists);
      setEmail(data.email);

      await axios.post("/api/send-verification", { email: data.email });
      
      toast.success("Código de verificación enviado");
      setFormStep("verification");
    } catch (error) {
      toast.error("Error al procesar el email");
    } finally {
      setIsLoading(false);
    }
  };

  const onVerificationSubmit = async (data: z.infer<typeof verificationSchema>) => {
    try {
      setIsLoading(true);
      console.log("Intentando verificar código:", {
        email,
        code: data.code
      });

      const response = await axios.post("/api/verify-code", { 
        email,
        code: data.code 
      });

      console.log("Respuesta de verificación:", response.data);

      if (response.data.success) {
        toast.success("Código verificado correctamente");
        setFormStep("additionalData");
      } else {
        toast.error("Error al verificar el código");
      }
    } catch (error) {
      console.error("Error en verificación:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Código inválido");
      } else {
        toast.error("Error al verificar el código");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onAdditionalDataSubmit = async (data: z.infer<typeof additionalDataSchema>) => {
    updateBookingData({
      user: {
        email,
        phone: data.phone,
        notes: data.notes,
      }
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">👤 Tus Datos</h2>
        <p className="text-sm text-gray-600">
          {formStep === "email" && "Ingresa tu correo electrónico para continuar"}
          {formStep === "verification" && "Ingresa el código de verificación enviado a tu correo"}
          {formStep === "additionalData" && "Completa tus datos de contacto"}
        </p>
      </div>

      {formStep === "email" && (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="tu@email.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onBack}>
                Volver
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continuar
              </Button>
            </div>
          </form>
        </Form>
      )}

      {formStep === "verification" && (
        <Form {...verificationForm}>
          <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                Hemos enviado un código de verificación a {email}
              </AlertDescription>
            </Alert>
            <FormField
              control={verificationForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Verificación</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123456" maxLength={6} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setFormStep("email")}
              >
                Volver
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verificar
              </Button>
            </div>
          </form>
        </Form>
      )}

      {formStep === "additionalData" && (
        <Form {...additionalDataForm}>
          <form onSubmit={additionalDataForm.handleSubmit(onAdditionalDataSubmit)} className="space-y-4">
            <FormField
              control={additionalDataForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="+56 9 1234 5678" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={additionalDataForm.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Cualquier información adicional que necesitemos saber"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setFormStep("verification")}
              >
                Volver
              </Button>
              <Button type="submit">
                Continuar
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
