import { db } from "@/lib/db";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { ServicesDataTable } from "./_components/services-table";

export default async function ServicesPage() {
  const services = await db.service.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedServices = services.map(service => ({
    id: service.id,
    name: service.name,
    description: service.description || "Sin descripción",
    price: service.price,
    duration: service.duration,
    image: service.image || "/placeholder-service.jpg",
    createdAt: format(service.createdAt, "dd/MM/yyyy"),
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-pink-300 text-transparent bg-clip-text">
          Gestión de Servicios
        </h2>
        <div className="flex gap-2">
          <Link href="/admin/(dashboard)/services/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Button>
          </Link>
        </div>
      </div>

      <Alert className="bg-pink-50 border-pink-200">
        <AlertDescription className="text-pink-600">
          Configura los servicios que ofreces, sus precios y duración para que tus clientes puedan reservarlos.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border bg-card shadow-sm">
        <ServicesDataTable initialData={formattedServices} />
      </div>
    </div>
  );
} 