"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TrendsCardSkeleton } from "./skeletons";

interface TrendStats {
  weeklyGrowth: number;
  monthlyGrowth: number;
  averageVisitsPerWeek: number;
  retentionRate: number;
}

export function TrendsCard() {
  const [stats, setStats] = useState<TrendStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/clients/analytics/trends");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching trends:", error);
        toast.error("Error al cargar las tendencias");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) return <TrendsCardSkeleton />;

  if (isLoading || !stats) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Crecimiento Semanal</p>
            <div className="flex items-center">
              {stats.weeklyGrowth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span className={cn(
                "text-2xl font-bold",
                stats.weeklyGrowth >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {Math.abs(stats.weeklyGrowth)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Tasa de Retención</p>
            <div className="flex items-center">
              <span className="text-2xl font-bold">
                {stats.retentionRate}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Visitas por Semana</p>
            <div className="flex items-center">
              <span className="text-2xl font-bold">
                {stats.averageVisitsPerWeek}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Crecimiento Mensual</p>
            <div className="flex items-center">
              {stats.monthlyGrowth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span className={cn(
                "text-2xl font-bold",
                stats.monthlyGrowth >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {Math.abs(stats.monthlyGrowth)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 