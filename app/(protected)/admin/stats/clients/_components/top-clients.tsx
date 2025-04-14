"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ActivityCardSkeleton } from "./skeletons";

interface TopClient {
  id: string;
  name: string;
  email: string;
  totalVisits: number;
  lastVisit: string;
}

export function TopClients() {
  const [clients, setClients] = useState<TopClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/clients/analytics");
        const data = await response.json();
        setClients(data.topClients);
      } catch (error) {
        console.error("Error fetching top clients:", error);
        toast.error("Error al cargar los clientes principales");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <ActivityCardSkeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clients.map((client) => (
            <div key={client.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {client.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{client.name}</p>
                  <p className="text-xs text-muted-foreground">{client.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{client.totalVisits} visitas</p>
                <p className="text-xs text-muted-foreground">
                  Última: {new Date(client.lastVisit).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 