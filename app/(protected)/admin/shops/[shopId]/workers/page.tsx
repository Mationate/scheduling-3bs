import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { ManageWorkers } from "./_components/manage-workers";

export default async function ShopWorkersPage({
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

  // Obtener todos los trabajadores activos que no están asignados a ninguna tienda
  const availableWorkers = await db.worker.findMany({
    where: {
      status: "ACTIVE",
      shopId: null,
    },
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-2">{shop.name}</h2>
      <p className="text-muted-foreground mb-6">Gestión de Trabajadores</p>

      <div className="grid gap-6">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Aquí puedes gestionar los trabajadores asignados a esta tienda. 
            Solo los trabajadores con estado "Activo" y sin asignación previa estarán disponibles para ser agregados.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Trabajadores de la Tienda</CardTitle>
            <CardDescription>
              Asigna o remueve trabajadores de {shop.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ManageWorkers
              shopId={shop.id}
              currentWorkers={shop.workers}
              availableWorkers={availableWorkers}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 