import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign } from "lucide-react";
import Link from "next/link";

export default async function ServicePage({
  params
}: {
  params: { serviceId: string }
}) {
  const service = await db.service.findUnique({
    where: { id: params.serviceId },
    include: {
      bookings: true,
    },
  });

  if (!service) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{service.name}</h2>
        <Link href={`/admin/services/${service.id}/edit`}>
          <Button>Editar Servicio</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detalles del Servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {service.image && (
              <div className="relative h-48 w-full rounded-lg overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="space-y-4">
              {service.description && (
                <div>
                  <h3 className="font-medium mb-2">Descripción</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Precio:</span>
                  <span>${service.price.toFixed(2)}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Duración:</span>
                  <span>{service.duration} minutos</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reservas Totales</p>
                <p className="text-2xl font-bold">{service.bookings.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID del Servicio</p>
                <p className="font-mono text-sm">{service.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 