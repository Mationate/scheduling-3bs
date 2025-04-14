"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, CreditCard, Users } from "lucide-react";
import { useFiltersStore } from "../../../stats/sales/_stores/filters-store";
import { StatCardSkeleton } from "./skeletons";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface OverviewStats {
  totalRevenue: number;
  averageTicket: number;
  totalSales: number;
  conversionRate: number;
}

export function OverviewCards() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { shopId, serviceId, workerId, dateRange } = useFiltersStore();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          ...(shopId && { shopId }),
          ...(serviceId && { serviceId }),
          ...(workerId && { workerId }),
          ...(dateRange.from && { from: dateRange.from.toISOString() }),
          ...(dateRange.to && { to: dateRange.to.toISOString() })
        });

        const response = await fetch(`/api/sales/stats?${params}`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Error al cargar las estadísticas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [shopId, serviceId, workerId, dateRange]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-blue-500/10 via-transparent to-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-500">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Ingresos del período seleccionado
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/10 via-transparent to-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
          <CreditCard className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">
            {formatCurrency(stats.averageTicket)}
          </div>
          <p className="text-xs text-muted-foreground">
            Valor promedio por venta
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500/10 via-transparent to-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-500">
            {stats.totalSales}
          </div>
          <p className="text-xs text-muted-foreground">
            Servicios realizados
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500/10 via-transparent to-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
          <Users className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-500">
            {stats.conversionRate}%
          </div>
          <p className="text-xs text-muted-foreground">
            Reservas completadas
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 