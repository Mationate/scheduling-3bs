import { db } from "@/lib/db";
import { format } from "date-fns";
import { ShopsDataTable } from "./_components/shops-table";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default async function ShopsPage() {
  const shops = await db.shop.findMany({
    include: {
      workers: true,
    },
  });

  const formattedShops = shops.map(shop => ({
    id: shop.id,
    name: shop.name,
    phone: shop.phone || "",
    mail: shop.mail || "",
    address: shop.address || "",
    workersCount: shop.workers.length,
    createdAt: format(new Date(shop.createdAt), "PP")
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
          Gestión de Locales
        </h2>
        <div className="flex gap-2">
          <Link href="/admin/shops/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo local
            </Button>
          </Link>
        </div>
      </div>

      <Alert className="bg-primary/5 border-primary/10">
        <AlertDescription className="text-primary">
          ¡Configura el horario y la dirección de tus locales para empezar a recibir reservas!
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border bg-card">
        <ShopsDataTable initialData={formattedShops} />
      </div>
    </div>
  );
}