"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { toast } from "sonner";
import { ChartCardSkeleton } from "./skeletons";

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];

interface VisitData {
  name: string;
  value: number;
}

export function VisitsDistribution() {
  const [data, setData] = useState<VisitData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/clients/analytics");
        const result = await response.json();
        setData(result.visitsDistribution);
      } catch (error) {
        console.error("Error fetching distribution data:", error);
        toast.error("Error al cargar la distribución de visitas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <ChartCardSkeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Visitas</CardTitle>
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
              <Tooltip formatter={(value) => [`${value} clientes`, '']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 