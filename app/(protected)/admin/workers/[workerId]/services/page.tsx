import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { ManageServices } from "./_components/manage-services";

export default async function WorkerServicesPage({
  params
}: {
  params: { workerId: string }
}) {
  const worker = await db.worker.findUnique({
    where: { id: params.workerId },
    include: {
      services: true,
      shop: true,
    },
  });

  if (!worker) {
    notFound();
  }

  const allServices = await db.service.findMany({
    where: {
      ownerId: worker.shop?.userId
    },
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-2">{worker.name}</h2>
      <p className="text-muted-foreground mb-6">Gestión de Servicios</p>

      <div className="grid gap-6">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Aquí puedes gestionar los servicios que este trabajador puede realizar.
            Asigna solo los servicios para los cuales el trabajador está capacitado.
            Esto afectará las opciones disponibles al momento de realizar reservas.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Servicios del Trabajador</CardTitle>
            <CardDescription>
              Asigna o remueve los servicios que {worker.name} puede realizar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ManageServices 
              workerId={worker.id}
              currentServices={worker.services}
              availableServices={allServices}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 