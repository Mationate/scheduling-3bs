"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building2, Users, Filter } from "lucide-react";

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
            <Select value={selectedLocation} onValueChange={onLocationChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar local" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🏪 Todos los locales</SelectItem>
                <SelectItem value="local1">💈 Local 1</SelectItem>
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

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          🎯 Vista Rápida
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Solo reservas activas</Label>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Mostrar canceladas</Label>
            <Switch />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">📊 Resumen del día</h3>
          <div className="grid grid-cols-2 gap-2">
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Reservas</p>
              <p className="text-2xl font-bold text-primary">12</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted-foreground">Disponibles</p>
              <p className="text-2xl font-bold text-green-500">8</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 