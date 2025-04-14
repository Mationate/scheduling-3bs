import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Calendar, Clock } from "lucide-react";
import type { ClientDetails } from "../types";

interface ClientInfoCardsProps {
  client: ClientDetails;
}

export function ClientInfoCards({ client }: ClientInfoCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información de contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>{client.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{client.phone || "No disponible"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estadísticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Última visita: {new Date(client.lastVisit).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Total de visitas: {client.totalVisits}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{client.notes || "Sin notas"}</p>
        </CardContent>
      </Card>
    </div>
  );
} 