"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import toast from "react-hot-toast";
import { useStatsStore } from "../_stores/stats-store";

interface Shop {
  id: string;
  name: string;
}

export function StatsHeader() {
  const { shopId, month, setShop, setMonth } = useStatsStore();
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch('/api/shops');
        const data = await response.json();
        setShops(data);
        // Si hay locales y no hay uno seleccionado, seleccionar el primero
        if (data.length > 0 && !shopId) {
          setShop(data[0].id);
        }
      } catch (error) {
        toast.error("Error al cargar los locales");
      }
    };
    fetchShops();
  }, []);

  const handleExport = async () => {
    try {
      const response = await fetch(
        `/api/shops/stats/export?shopId=${shopId}&month=${format(month, 'yyyy-MM')}`
      );
      
      if (!response.ok) {
        throw new Error('Error al exportar');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estadisticas-${format(month, 'MMMM-yyyy', { locale: es })}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Error al exportar las estadísticas");
    }
  };

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-3xl font-bold">Estadísticas del Local</h2>
      
      <div className="flex items-center gap-4">
        <Select value={shopId} onValueChange={setShop}>
          <SelectTrigger className="w-[200px]">
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

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(month, 'MMMM yyyy', { locale: es })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={month}
              onSelect={(date) => date && setMonth(date)}
              initialFocus
              locale={es}
            />
          </PopoverContent>
        </Popover>

        <Button onClick={handleExport} disabled={!shopId}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>
    </div>
  );
} 