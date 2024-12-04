import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function ShopPage({
  params
}: {
  params: { shopId: string }
}) {
  const shop = await db.shop.findUnique({
    where: { id: params.shopId },
    include: {
      workers: true,
    },
  });

  if (!shop) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{shop.name}</h2>
        <div className="flex gap-2">
          <Link href={`/admin/shops/${shop.id}/workers`}>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Gestionar Trabajadores
            </Button>
          </Link>
          <Link href={`/admin/shops/${shop.id}/schedule`}>
            <Button variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Gestionar Horarios
            </Button>
          </Link>
          <Link href={`/admin/shops/${shop.id}/edit`}>
            <Button>Editar Tienda</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información de la Tienda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {shop.image && (
              <div className="relative h-48 w-full rounded-lg overflow-hidden">
                <Image
                  src={shop.image}
                  alt={shop.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shop.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Teléfono:</span>
                  <span>{shop.phone}</span>
                </div>
              )}
              
              {shop.mail && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{shop.mail}</span>
                </div>
              )}
              
              {shop.address && (
                <div className="flex items-center space-x-2 col-span-full">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Dirección:</span>
                  <span>{shop.address}</span>
                </div>
              )}
              
              {shop.schedule && (
                <div className="flex items-center space-x-2 col-span-full">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Horario:</span>
                  <span>{shop.schedule}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trabajadores</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shop.workers.length}</div>
            <p className="text-xs text-muted-foreground">
              Trabajadores asignados
            </p>
            <div className="mt-4 space-y-2">
              {shop.workers.map((worker) => (
                <div key={worker.id} className="flex items-center justify-between">
                  <span>{worker.name}</span>
                  <Badge variant={worker.status === "ACTIVE" ? "default" : "secondary"}>
                    {worker.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Creado</p>
                <p>{format(new Date(shop.createdAt), "PPP")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
                <p>{format(new Date(shop.updatedAt), "PPP")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID de la Tienda</p>
                <p className="font-mono text-sm">{shop.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 