"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableCardSkeleton } from "./skeletons";
import { useFiltersStore } from "../../../stats/sales/_stores/filters-store";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TopService {
  id: string;
  name: string;
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
}

export function TopServices() {
  const [services, setServices] = useState<TopService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { shopId, serviceId, workerId, dateRange } = useFiltersStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          ...(shopId && { shopId }),
          ...(serviceId && { serviceId }),
          ...(workerId && { workerId }),
          ...(dateRange.from && { from: dateRange.from.toISOString() }),
          ...(dateRange.to && { to: dateRange.to.toISOString() })
        });

        const response = await fetch(`/api/sales/top-services?${params}`);
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error("Error fetching top services:", error);
        toast.error("Error al cargar los servicios principales");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [shopId, serviceId, workerId, dateRange]);

  if (isLoading) return <TableCardSkeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Servicios Más Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {services.map((service, index) => (
            <div key={service.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none flex items-center gap-2">
                  {service.name}
                  <Badge variant="secondary" className="ml-2">
                    #{index + 1}
                  </Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  {service.totalSales} ventas
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {formatCurrency(service.totalRevenue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Promedio: {formatCurrency(service.averagePrice)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 