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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { useEffect } from "react";
import { BookingData } from "../booking-form";

const phoneSchema = z.object({
  phone: z.string()
    .min(9, "El número debe tener al menos 9 dígitos")
    .transform(val => val.replace(/[^\d+]/g, '')) // Limpiar caracteres no numéricos
    .refine(val => /^(\+\d{1,3})?[\d]{9,15}$/.test(val), {
      message: "Por favor ingresa un número de teléfono válido"
    })
});

const verificationSchema = z.object({
  code: z.string().length(6, "El código debe tener 6 dígitos"),
});

const additionalDataSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
});

type FormStep = "phone" | "verification" | "additionalData";

interface UserStepProps {
  onNext: () => void;
  onBack: () => void;
  updateBookingData: (data: Partial<BookingData>) => void;
}

export function UserStep({
  onNext,
  onBack,
  updateBookingData,
}: UserStepProps) {
  const [formStep, setFormStep] = useState<FormStep>("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState("");

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
    mode: "onChange",
  });

  const verificationForm = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { code: "" },
    mode: "onChange",
  });

  const additionalDataForm = useForm<z.infer<typeof additionalDataSchema>>({
    resolver: zodResolver(additionalDataSchema),
    defaultValues: {
      name: "",
      email: "",
    },
    mode: "onChange",
  });

  const onPhoneSubmit = async (data: z.infer<typeof phoneSchema>) => {
    try {
      setIsLoading(true);
      // Limpiamos el número de teléfono para eliminar caracteres no numéricos
      const cleanPhone = data.phone.replace(/[^\d+]/g, '');
      console.log("[USER_STEP] Verificando teléfono:", cleanPhone);
      
      // Simulamos que se envía un código por WhatsApp
      setPhone(cleanPhone);
      
      // Simulamos espera del envío del código
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Código de verificación enviado por WhatsApp");
      setFormStep("verification");

    } catch (error) {
      console.error("[USER_STEP] Error en onPhoneSubmit:", error);
      toast.error("Error al procesar el número de teléfono");
    } finally {
      setIsLoading(false);
    }
  };

  const onVerificationSubmit = async (data: z.infer<typeof verificationSchema>) => {
    try {
      setIsLoading(true);
      console.log("[USER_STEP] Verificando código para:", phone);
      
      // Simulamos verificación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aceptamos cualquier código de 6 dígitos
      console.log("[USER_STEP] Código verificado correctamente");
      toast.success("Código verificado correctamente");
      setFormStep("additionalData");
      
    } catch (error) {
      console.error("[USER_STEP] Error en verificación:", error);
      toast.error("Error al verificar el código");
    } finally {
      setIsLoading(false);
    }
  };

  const onAdditionalDataSubmit = async (data: z.infer<typeof additionalDataSchema>) => {
    try {
      console.log("[USER_STEP] Iniciando envío de datos adicionales:", data);

      // Simulamos creación o actualización del cliente
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateBookingData({
        client: {
          phone,
          name: data.name,
          email: data.email || "",
          notes: "" // Notas vacías por defecto
        }
      });
      
      console.log("[USER_STEP] Datos del cliente actualizados en bookingData");
      onNext();
    } catch (error) {
      console.error("[USER_STEP] Error en onAdditionalDataSubmit:", error);
      toast.error("Error al guardar los datos");
    }
  };

  // Aseguramos que los inputs mantengan el foco
  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      if (formStep === "phone") {
        const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement;
        if (phoneInput) phoneInput.focus();
      } else if (formStep === "verification") {
        const codeInput = document.querySelector('input[name="code"]') as HTMLInputElement;
        if (codeInput) codeInput.focus();
      }
    }, 100);
    
    return () => clearTimeout(focusTimeout);
  }, [formStep]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">👤 Tus Datos</h2>
        <p className="text-sm text-gray-600">
          {formStep === "phone" && "Ingresa tu número de teléfono para continuar"}
          {formStep === "verification" && "Ingresa el código de verificación enviado a tu WhatsApp"}
          {formStep === "additionalData" && "Completa tus datos de contacto"}
        </p>
      </div>

      {formStep === "phone" && (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
            <FormField
              control={phoneForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de teléfono</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      autoFocus 
                      type="tel" 
                      placeholder="+56 9 1234 5678" 
                    />
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
                Hemos enviado un código de verificación a tu WhatsApp ({phone})
              </AlertDescription>
            </Alert>
            <FormField
              control={verificationForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Verificación</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      autoFocus
                      placeholder="123456" 
                      maxLength={6} 
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
                onClick={() => setFormStep("phone")}
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
          <form onSubmit={additionalDataForm.handleSubmit(onAdditionalDataSubmit)} className="space-y-6">
            <FormField
              control={additionalDataForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      autoFocus
                      placeholder="Tu nombre" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={additionalDataForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email" 
                      placeholder="tu@email.com" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setFormStep("verification")}>
                Volver
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Continuar"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
