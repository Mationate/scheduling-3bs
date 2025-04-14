"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableCardSkeleton } from "./skeletons";
import { useFiltersStore } from "../../../stats/sales/_stores/filters-store";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface TopWorker {
  id: string;
  name: string;
  avatar: string | null;
  totalServices: number;
  totalRevenue: number;
  averageRating: number;
}

export function TopWorkers() {
  const [workers, setWorkers] = useState<TopWorker[]>([]);
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

        const response = await fetch(`/api/sales/top-workers?${params}`);
        const data = await response.json();
        setWorkers(data);
      } catch (error) {
        console.error("Error fetching top workers:", error);
        toast.error("Error al cargar los profesionales principales");
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
        <CardTitle>Top Profesionales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {workers.map((worker, index) => (
            <div key={worker.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {worker.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none flex items-center">
                    {worker.name}
                    <Badge variant="secondary" className="ml-2">
                      #{index + 1}
                    </Badge>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {worker.totalServices} servicios
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {formatCurrency(worker.totalRevenue)}
                </p>
                <div className="flex items-center justify-end text-xs text-muted-foreground">
                  <span className="text-yellow-500 mr-1">★</span>
                  {worker.averageRating.toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 