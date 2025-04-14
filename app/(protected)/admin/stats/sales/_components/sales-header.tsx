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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFiltersStore } from "../../../stats/sales/_stores/filters-store";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface Shop {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
}

interface Worker {
  id: string;
  name: string;
}

export function SalesHeader() {
  const { 
    dateRange, setDateRange,
    shopId, setShop,
    serviceId, setService,
    workerId, setWorker,
    resetFilters 
  } = useFiltersStore();

  const [shops, setShops] = useState<Shop[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch("/api/shops");
        const data = await response.json();
        setShops(data);
      } catch (error) {
        toast.error("Error al cargar los locales");
      }
    };
    fetchShops();
  }, []);

  useEffect(() => {
    if (!shopId) {
      setServices([]);
      setWorkers([]);
      return;
    }

    const fetchShopData = async () => {
      try {
        const [servicesRes, workersRes] = await Promise.all([
          fetch(`/api/shops/${shopId}/services`),
          fetch(`/api/shops/${shopId}/workers`)
        ]);
        const [servicesData, workersData] = await Promise.all([
          servicesRes.json(),
          workersRes.json()
        ]);
        setServices(servicesData);
        setWorkers(workersData);
      } catch (error) {
        toast.error("Error al cargar los datos del local");
      }
    };

    fetchShopData();
  }, [shopId]);

  const handleDownload = async () => {
    try {
      const response = await fetch("/api/sales/export?" + new URLSearchParams({
        ...(shopId && { shopId }),
        ...(serviceId && { serviceId }),
        ...(workerId && { workerId }),
        ...(dateRange.from && { from: dateRange.from.toISOString() }),
        ...(dateRange.to && { to: dateRange.to.toISOString() })
      }));
      const data = await response.json();

      const workbook = XLSX.utils.book_new();
      
      // Hoja de Ventas
      const salesWS = XLSX.utils.json_to_sheet(data.sales.map((sale: any) => ({
        'Fecha': format(new Date(sale.date), 'dd/MM/yyyy'),
        'Servicio': sale.serviceName,
        'Profesional': sale.workerName,
        'Cliente': sale.clientName,
        'Monto': sale.paymentAmount,
        'Estado Pago': sale.paymentStatus,
        'Método Pago': sale.paymentOption
      })));
      XLSX.utils.book_append_sheet(workbook, salesWS, "Ventas");

      // Hoja de Estadísticas
      const statsWS = XLSX.utils.json_to_sheet([
        { Métrica: 'Ventas Totales', Valor: data.stats.totalSales },
        { Métrica: 'Ingresos Totales', Valor: data.stats.totalRevenue },
        { Métrica: 'Ticket Promedio', Valor: data.stats.averageTicket },
        { Métrica: 'Tasa de Conversión', Valor: `${data.stats.conversionRate}%` },
      ]);
      XLSX.utils.book_append_sheet(workbook, statsWS, "Estadísticas");

      XLSX.writeFile(workbook, `ventas_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
      toast.success('Datos exportados exitosamente');
    } catch (error) {
      console.error('Error downloading data:', error);
      toast.error('Error al exportar los datos');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Estadísticas de Ventas</h1>
          <p className="text-muted-foreground">
            Métricas y estadísticas detalladas de ventas
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleDownload}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar Datos
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select
          value={shopId || ""}
          onValueChange={(value) => setShop(value || null)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Seleccionar Local" />
          </SelectTrigger>
          <SelectContent>
            {shops.map((shop) => (
              <SelectItem key={shop.id} value={shop.id}>
                {shop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={serviceId || ""}
          onValueChange={(value) => setService(value || null)}
          disabled={!shopId}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Seleccionar Servicio" />
          </SelectTrigger>
          <SelectContent>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={workerId || ""}
          onValueChange={(value) => setWorker(value || null)}
          disabled={!shopId}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Seleccionar Profesional" />
          </SelectTrigger>
          <SelectContent>
            {workers.map((worker) => (
              <SelectItem key={worker.id} value={worker.id}>
                {worker.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[250px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "d 'de' MMMM, yyyy", { locale: es })} -
                    {format(dateRange.to, "d 'de' MMMM, yyyy", { locale: es })}
                  </>
                ) : (
                  format(dateRange.from, "d 'de' MMMM, yyyy", { locale: es })
                )
              ) : (
                "Seleccionar fechas"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
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
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          onClick={resetFilters}
        >
          Resetear filtros
        </Button>
      </div>
    </div>
  );
} 