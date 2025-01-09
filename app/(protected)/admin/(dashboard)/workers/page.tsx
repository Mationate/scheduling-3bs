import { db } from "@/lib/db";
import { format } from "date-fns";
import { WorkersDataTable } from "./_components/workers-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default async function WorkersPage() {
  const workers = await db.worker.findMany({
    include: {
      shop: true,
    },
  });

  const formattedWorkers = workers.map(worker => ({
    id: worker.id,
    name: worker.name,
    phone: worker.phone || "",
    mail: worker.mail || "",
    avatar: worker.avatar || "",
    status: worker.status,
    shopName: worker.shop?.name || "Sin asignar",
    createdAt: format(new Date(worker.createdAt), "PP")
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-violet-300 text-transparent bg-clip-text">
          Gestión de Profesionales
        </h2>
        <div className="flex gap-2">
          <Link href="/admin/workers/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Profesional
            </Button>
          </Link>
        </div>
      </div>

      <Alert className="bg-violet-50 border-violet-200">
        <AlertDescription className="text-violet-600">
          Administra tu equipo de trabajo y asigna los servicios que cada profesional puede realizar.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border bg-card shadow-sm">
        <WorkersDataTable initialData={formattedWorkers} />
      </div>
    </div>
  );
} 