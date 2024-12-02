import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Store, Clock, UserCircle, Wrench } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export default async function WorkerPage({
  params
}: {
  params: { workerId: string }
}) {
  const worker = await db.worker.findUnique({
    where: { id: params.workerId },
    include: {
      shop: true,
      services: true,
    },
  });

  if (!worker) {
    notFound();
  }

  const statusMap = {
    UNASSIGNED: { label: "Sin Asignar", variant: "destructive" },
    ACTIVE: { label: "Activo", variant: "default" },
    INACTIVE: { label: "Inactivo", variant: "secondary" },
  } as const;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{worker.name}</h2>
        <div className="flex gap-2">
          <Link href={`/admin/workers/${worker.id}/services`}>
            <Button variant="outline">
              <Wrench className="w-4 h-4 mr-2" />
              Gestionar Servicios
            </Button>
          </Link>
          <Link href={`/admin/workers/${worker.id}/edit`}>
            <Button>Editar Trabajador</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información del Trabajador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {worker.avatar && (
              <div className="relative h-48 w-48 mx-auto rounded-full overflow-hidden">
                <Image
                  src={worker.avatar}
                  alt={worker.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <UserCircle className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Estado:</span>
                <Badge variant={statusMap[worker.status].variant as any}>
                  {statusMap[worker.status].label}
                </Badge>
              </div>

              {worker.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Teléfono:</span>
                  <span>{worker.phone}</span>
                </div>
              )}
              
              {worker.mail && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{worker.mail}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Store className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Tienda:</span>
                <span>{worker.shop?.name || "Sin asignar"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Creado</p>
              <p>{format(new Date(worker.createdAt), "PPP")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
              <p>{format(new Date(worker.updatedAt), "PPP")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID del Trabajador</p>
              <p className="font-mono text-sm">{worker.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios Asignados</CardTitle>
            <Wrench className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {worker.services.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay servicios asignados
                </p>
              ) : (
                <div className="space-y-2">
                  {worker.services.map((service) => (
                    <div key={service.id} className="flex justify-between items-center">
                      <span>{service.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatPrice(service.price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Link href={`/admin/workers/${worker.id}/services`}>
                <Button variant="outline" size="sm" className="w-full">
                  Gestionar Servicios
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 