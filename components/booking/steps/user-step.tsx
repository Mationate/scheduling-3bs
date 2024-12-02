"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type UserFormValues = z.infer<typeof formSchema>;

interface UserStepProps {
  onNext: () => void;
  onBack: () => void;
  updateBookingData: (data: { user: UserFormValues }) => void;
}

export default function UserStep({
  onNext,
  onBack,
  updateBookingData,
}: UserStepProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      notes: "",
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    setLoading(true);
    updateBookingData({ user: data });
    setLoading(false);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Tus Datos</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input 
                            disabled={loading} 
                            placeholder="Tu nombre completo" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input 
                            disabled={loading} 
                            placeholder="Tu número de teléfono" 
                            type="tel"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="col-span-full">
                        <FormLabel>Email (Opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            disabled={loading} 
                            placeholder="Tu correo electrónico" 
                            type="email"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="col-span-full">
                        <FormLabel>Notas Adicionales (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            disabled={loading} 
                            placeholder="Cualquier información adicional que quieras compartir"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={onBack}>
                    Volver
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Continuar
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}