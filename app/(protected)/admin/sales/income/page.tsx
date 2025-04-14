"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Download, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";
import { IncomeTable } from "./_components/income-table";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { es } from "date-fns/locale";
import { DateFilter } from "./_components/date-filter";
import { DateRange } from "react-day-picker";

interface Shop {
  id: string;
  name: string;
}

export default function IncomePage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<Date | DateRange>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingIncomes, setIsLoadingIncomes] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch('/api/shops');
        const data = await response.json();
        setShops(data);
        // Si solo hay una tienda, seleccionarla automáticamente
        if (data.length === 1) {
          setSelectedShop(data[0].id);
        }
      } catch (error) {
        toast.error("Error al cargar los locales");
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, []);

  const handleDateChange = (newDate: Date | DateRange) => {
    setIsLoadingIncomes(true);
    setDateFilter(newDate);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams({
        shopId: selectedShop,
        ...(dateFilter instanceof Date
          ? { date: format(dateFilter, 'yyyy-MM-dd') }
          : {
              from: format(dateFilter.from!, 'yyyy-MM-dd'),
              to: format(dateFilter.to || dateFilter.from!, 'yyyy-MM-dd'),
            }),
      });

      const response = await fetch(`/api/sales/income/export?${params}`);
      
      if (!response.ok) throw new Error();
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ingresos-${format(dateFilter instanceof Date ? dateFilter : dateFilter.from!, 'dd-MM-yyyy')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Archivo exportado correctamente");
    } catch (error) {
      toast.error("Error al exportar los datos");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-[280px]" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
          Registro de Ingresos
        </h2>
        <Button
          onClick={handleExport}
          disabled={!selectedShop || isExporting}
          variant="outline"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExporting ? "Exportando..." : "Exportar"}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <Select
              value={selectedShop}
              onValueChange={setSelectedShop}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Seleccionar local" />
              </SelectTrigger>
              <SelectContent>
                {shops.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedShop && (
              <DateFilter
                onDateChange={handleDateChange}
                isLoading={isLoadingIncomes}
              />
            )}
          </div>

          {selectedShop ? (
            <IncomeTable 
              key={JSON.stringify(dateFilter)}
              shopId={selectedShop} 
              dateFilter={dateFilter}
              setIsLoading={setIsLoadingIncomes}
              isLoading={isLoadingIncomes}
            />
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Selecciona un local para ver los ingresos
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
