import { db } from "@/lib/db";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
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
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Servicios</h2>
        <Link href="/admin/services/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Servicio
          </Button>
        </Link>
      </div>
      <ServicesDataTable initialData={formattedServices} />
    </div>
  );
} 