"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building2, Users, Filter } from "lucide-react";

interface Shop {
  id: string;
  name: string;
}

interface CalendarSidebarProps {
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void;
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  selectedView: "workers" | "services";
  onViewChange: (value: "workers" | "services") => void;
}

export function CalendarSidebar({
  selectedDate,
  onDateChange,
  selectedLocation,
  onLocationChange,
  selectedView,
  onViewChange
}: CalendarSidebarProps) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch('/api/shops');
        const data = await response.json();
        setShops(data);
      } catch (error) {
        console.error('Error fetching shops:', error);
      } finally {
        setIsLoadingShops(false);
      }
    };

    fetchShops();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          📅 Calendario
        </h3>
        <Card className="p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            className="rounded-md border"
          />
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          ⚙️ Filtros
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Local
            </Label>
            <Select 
              value={selectedLocation} 
              onValueChange={onLocationChange}
              disabled={isLoadingShops}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingShops ? "Cargando locales..." : "Seleccionar local"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🏪 Todos los locales</SelectItem>
                {shops.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id}>
                    💈 {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Vista
            </Label>
            <Select 
              value={selectedView} 
              onValueChange={(v: "workers" | "services") => onViewChange(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de vista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workers">👥 Por Profesionales</SelectItem>
                <SelectItem value="services">✂️ Por Servicios</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
} 