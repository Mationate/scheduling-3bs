"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useFiltersStore } from "../../../stats/sales/_stores/filters-store";
import { ChartCardSkeleton } from "./skeletons";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface ServiceData {
  name: string;
  value: number;
  revenue: number;
}

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export function ServiceDistribution() {
  const [data, setData] = useState<ServiceData[]>([]);
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

        const response = await fetch(`/api/sales/service-distribution?${params}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching service distribution:", error);
        toast.error("Error al cargar la distribución de servicios");
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
        <CardTitle>Distribución de Servicios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  `${value} servicios - ${formatCurrency(props.payload.revenue)}`,
                  name
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 