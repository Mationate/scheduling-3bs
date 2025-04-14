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
import { useStatsStore } from "../_stores/stats-store";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { ArrivalEditDialog } from "./arrival-edit-dialog";

interface ArrivalStats {
  workerName: string;
  totalDays: number;
  onTime: number;
  late: number;
  latePercentage: number;
  arrivals: {
    id: string;
    date: Date;
    isLate: boolean;
  }[];
}

export function ArrivalStatsTable() {
  const { shopId, month } = useStatsStore();
  const [stats, setStats] = useState<ArrivalStats[]>([]);
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
        `/api/shops/stats/arrivals?shopId=${shopId}&month=${format(month, 'yyyy-MM')}`
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast.error("Error al cargar las estadísticas de llegadas");
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
            <TableHead>Días Trabajados</TableHead>
            <TableHead>A Tiempo</TableHead>
            <TableHead>Atrasos</TableHead>
            <TableHead>% Atrasos</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((stat) => (
            <TableRow key={stat.workerName}>
              <TableCell className="font-medium">{stat.workerName}</TableCell>
              <TableCell>{stat.totalDays}</TableCell>
              <TableCell>{stat.onTime}</TableCell>
              <TableCell>
                <Badge variant={stat.late > 0 ? "destructive" : "secondary"}>
                  {stat.late}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={stat.latePercentage > 20 ? "destructive" : "secondary"}>
                  {stat.latePercentage}%
                </Badge>
              </TableCell>
              <TableCell>
                {stat.arrivals.map((arrival) => (
                  <ArrivalEditDialog 
                    key={arrival.id}
                    arrival={{
                      ...arrival,
                      workerName: stat.workerName
                    }}
                    onUpdate={fetchStats}
                  />
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 