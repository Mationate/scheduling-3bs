"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import { useStatsStore } from "../_stores/stats-store";

interface ServiceStats {
  workerName: string;
  services: Record<string, number>;
  total: number;
}

export function ServiceStatsTable() {
  const { shopId, month } = useStatsStore();
  const [stats, setStats] = useState<ServiceStats[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (shopId) {
      fetchStats();
    }
  }, [shopId, month]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/shops/stats/services?shopId=${shopId}&month=${format(month, 'yyyy-MM')}`
      );
      const data = await response.json();
      setStats(data.stats);
      setServices(data.services);
    } catch (error) {
      toast.error("Error al cargar las estadísticas");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Profesional</TableHead>
            {services.map((service) => (
              <TableHead key={service}>{service}</TableHead>
            ))}
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((stat) => (
            <TableRow key={stat.workerName}>
              <TableCell className="font-medium">{stat.workerName}</TableCell>
              {services.map((service) => (
                <TableCell key={service}>{stat.services[service] || 0}</TableCell>
              ))}
              <TableCell className="font-bold">{stat.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 