"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
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
import { Card, CardContent } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "react-hot-toast";
import { ImageForm } from "@/components/image-form";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  phone: z.string().optional(),
  mail: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  schedule: z.string().optional(),
  image: z.string().optional(),
});

type ShopFormValues = z.infer<typeof formSchema>;

interface ShopFormProps {
  initialData?: ShopFormValues & { id: string };
}

export function ShopForm({ initialData }: ShopFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<ShopFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      phone: "",
      mail: "",
      address: "",
      schedule: "",
      image: "",
    },
  });

  const onSubmit = async (data: ShopFormValues) => {
    try {
      setLoading(true);
      const url = initialData 
        ? `/api/shops/${initialData.id}`
        : "/api/shops";
      
      const response = await fetch(url, {
        method: initialData ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Error al guardar la tienda");

      toast.success(initialData ? "Tienda actualizada" : "Tienda creada");
      router.push("/admin/shops");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Algo salió mal");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdate = async (imageUrl: string) => {
    try {
      if (!initialData?.id) {
        form.setValue("image", imageUrl);
        return;
      }

      const response = await fetch(`/api/shops/${initialData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageUrl }),
      });

      if (!response.ok) throw new Error("Error al actualizar la imagen");
      
      form.setValue("image", imageUrl);
      toast.success("Imagen actualizada correctamente");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la imagen");
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Nombre de la Tienda</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="Nombre de la tienda" {...field} />
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
                      <Input disabled={loading} placeholder="Número de teléfono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="Correo electrónico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Textarea 
                        disabled={loading} 
                        placeholder="Dirección de la tienda"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="schedule"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Horario</FormLabel>
                    <FormControl>
                      <Input 
                        disabled={loading} 
                        placeholder="Ej: Lun-Vie: 9AM-6PM" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Imagen de la Tienda</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value || ""}
                        onChange={async (url) => {
                          if (url) {
                            try {
                              if (initialData?.id) {
                                const response = await fetch(`/api/shops/${initialData.id}/image`, {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({ imageUrl: url }),
                                });

                                if (!response.ok) {
                                  throw new Error("Error al actualizar la imagen");
                                }

                                const data = await response.json();
                                console.log("Image update response:", data);
                              }

                              field.onChange(url);
                              toast.success("Imagen actualizada correctamente");
                              router.refresh();
                            } catch (error) {
                              console.error("Error updating image:", error);
                              toast.error("Error al actualizar la imagen");
                            }
                          }
                        }}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : initialData ? "Guardar Cambios" : "Crear Tienda"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 