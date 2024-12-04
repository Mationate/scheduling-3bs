import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ServiceForm } from "../../_components/service-form";

export default async function EditServicePage({
  params
}: {
  params: { serviceId: string }
}) {
  const service = await db.service.findUnique({
    where: { id: params.serviceId },
  });

  if (!service) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Editar Servicio</h2>
      <ServiceForm initialData={{
        id: service.id,
        name: service.name,
        description: service.description || undefined,
        price: service.price,
        duration: service.duration,
        image: service.image || undefined
      }} />
    </div>
  );
}
