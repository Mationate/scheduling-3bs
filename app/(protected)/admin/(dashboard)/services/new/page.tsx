import { ServiceForm } from "../_components/service-form";

export default function NewServicePage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Crear Nuevo Servicio</h2>
      <ServiceForm />
    </div>
  );
} 