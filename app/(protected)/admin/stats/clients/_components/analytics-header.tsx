"use client";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { useDateStore } from "../_stores/date-store";

export function AnalyticsHeader() {
  const { dateRange, setDateRange, resetDateRange } = useDateStore();

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  };

  const handleDownload = async () => {
    try {
      const response = await fetch("/api/clients/export");
      const data = await response.json();

      // Preparar los datos para Excel
      const workbook = XLSX.utils.book_new();
      
      // Hoja de Clientes
      const clientsWS = XLSX.utils.json_to_sheet(data.clients.map((client: any) => ({
        Nombre: client.name,
        Email: client.email,
        Teléfono: client.phone || '',
        'Fecha de Registro': format(new Date(client.createdAt), 'dd/MM/yyyy'),
        'Total Visitas': client.totalVisits,
        'Última Visita': client.lastVisit ? format(new Date(client.lastVisit), 'dd/MM/yyyy') : '',
        Estado: client.status,
        Notas: client.notes || ''
      })));
      XLSX.utils.book_append_sheet(workbook, clientsWS, "Clientes");

      // Hoja de Estadísticas
      const statsData = [
        { Métrica: 'Total Clientes', Valor: data.stats.totalClients },
        { Métrica: 'Nuevos Clientes (Este Mes)', Valor: data.stats.newClientsThisMonth },
        { Métrica: 'Total Visitas', Valor: data.stats.totalVisits },
        { Métrica: 'Promedio Visitas por Cliente', Valor: data.stats.averageVisitsPerClient },
        { Métrica: 'Tasa de Retención', Valor: `${data.stats.retentionRate}%` },
      ];
      const statsWS = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsWS, "Estadísticas");

      // Descargar el archivo
      XLSX.writeFile(workbook, `clientes_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
      toast.success('Datos exportados exitosamente');
    } catch (error) {
      console.error('Error downloading data:', error);
      toast.error('Error al exportar los datos');
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Estadísticas de Clientes</h1>
        <p className="text-muted-foreground">
          Métricas y estadísticas detalladas de tu base de clientes
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleDownload}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar Datos
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                  </>
                ) : (
                  formatDate(dateRange.from)
                )
              ) : (
                "Seleccionar fechas"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={(range: DateRange | undefined) => {
                setDateRange(range || { from: undefined, to: undefined });
              }}
              numberOfMonths={2}
              locale={es}
            />
            <div className="p-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={resetDateRange}
              >
                Ver todo
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
} 