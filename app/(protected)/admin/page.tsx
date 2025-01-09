import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Building2, Users, Scissors, Calendar, Filter } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  // Obtener estadísticas reales de la base de datos
  const [shopsCount, workersCount, servicesCount, bookingsCount] = await Promise.all([
    db.shop.count(),
    db.worker.count(),
    db.service.count(),
    db.booking.count(),
  ]);

  const stats = [
    {
      title: "Locales",
      value: shopsCount,
      icon: Building2,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Profesionales",
      value: workersCount,
      icon: Users,
      color: "text-violet-500",
      bgColor: "bg-violet-50",
    },
    {
      title: "Servicios",
      value: servicesCount,
      icon: Scissors,
      color: "text-pink-500",
      bgColor: "bg-pink-50",
    },
    {
      title: "Reservas",
      value: bookingsCount,
      icon: Calendar,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
          Panel de Administración
        </h2>
      </div>

      <Alert className="bg-primary/5 border-primary/10">
        <AlertDescription className="text-primary">
          ¡Configura el horario y la dirección de tus locales para empezar a recibir reservas!
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className="p-6 transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={cn("p-3 rounded-full", stat.bgColor)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Accesos Rápidos</h3>
          </div>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Building2 className="mr-2 h-5 w-5" />
              Gestionar Locales
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Users className="mr-2 h-5 w-5" />
              Gestionar Profesionales
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Scissors className="mr-2 h-5 w-5" />
              Gestionar Servicios
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Información Básica</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/10">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Locales</p>
                <p className="text-sm text-muted-foreground">
                  Configura tus locales y horarios
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/10">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Profesionales</p>
                <p className="text-sm text-muted-foreground">
                  Gestiona tu equipo de trabajo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/10">
              <Scissors className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Servicios</p>
                <p className="text-sm text-muted-foreground">
                  Administra tu catálogo de servicios
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}