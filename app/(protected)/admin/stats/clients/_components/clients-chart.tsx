"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from "sonner";
import { ChartCardSkeleton } from "./skeletons";

interface MonthlyStats {
  month: number;
  year: number;
  count: number;
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function ClientsChart() {
  const [data, setData] = useState<MonthlyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/clients/analytics");
        const result = await response.json();
        setData(result.monthlyStats);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        toast.error("Error al cargar los datos del gráfico");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <ChartCardSkeleton />;

  const chartData = data.map(stat => ({
    name: MONTHS[stat.month],
    clientes: stat.count
  }));

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Crecimiento de Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="clientes" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 