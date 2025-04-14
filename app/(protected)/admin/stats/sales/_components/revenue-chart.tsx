"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useFiltersStore } from "../../../stats/sales/_stores/filters-store";
import { ChartCardSkeleton } from "./skeletons";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface RevenueData {
  date: string;
  revenue: number;
}

export function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([]);
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

        const response = await fetch(`/api/sales/revenue-chart?${params}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        toast.error("Error al cargar los datos de ingresos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [shopId, serviceId, workerId, dateRange]);

  if (isLoading) return <ChartCardSkeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos en el Tiempo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('es-CL', { 
                  day: '2-digit',
                  month: 'short'
                })}
              />
              <YAxis 
                tickFormatter={(value) => `$${value/1000}k`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), "Ingresos"]}
                labelFormatter={(label) => new Date(label).toLocaleDateString('es-CL', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 