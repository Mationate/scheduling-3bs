"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStatsStore } from "../_stores/stats-store";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Users, Calendar, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface StatsData {
  totalServices: number;
  totalWorkers: number;
  avgServicesPerDay: number;
  latePercentage: number;
}

export function StatsOverview() {
  const { shopId, month } = useStatsStore();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (shopId) {
      fetchOverviewStats();
    }
  }, [shopId, month]);

  const fetchOverviewStats = async () => {
    try {
      const response = await fetch(
        `/api/shops/stats/overview?shopId=${shopId}&month=${format(month, 'yyyy-MM')}`
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast.error("Error al cargar el resumen de estadísticas");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return <div className="grid gap-4 grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-[120px]" />
      ))}
    </div>;
  }

  return (
    <div className="grid gap-4 grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Servicios</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalServices}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profesionales Activos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalWorkers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Servicios por Día</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgServicesPerDay}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">% Atrasos</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{stats.latePercentage}%</div>
        </CardContent>
      </Card>
    </div>
  );
} 