"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ShopSchedule, ShopBreak } from "@prisma/client";
import { Trash } from "lucide-react";
import { format, parse } from "date-fns";

const DAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

interface ScheduleManagerProps {
  shopId: string;
  initialSchedules: ShopSchedule[];
  initialBreaks: ShopBreak[];
}

export function ScheduleManager({
  shopId,
  initialSchedules,
  initialBreaks,
}: ScheduleManagerProps) {
  const [schedules, setSchedules] = useState<ShopSchedule[]>(initialSchedules);
  const [breaks, setBreaks] = useState<ShopBreak[]>(initialBreaks);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [tempSchedules, setTempSchedules] = useState<ShopSchedule[]>(initialSchedules);

  const handleScheduleChange = (dayOfWeek: number, field: string, value: string | boolean) => {
    const schedule = tempSchedules.find(s => s.dayOfWeek === dayOfWeek) || {
      shopId,
      dayOfWeek,
      startTime: "09:00",
      endTime: "18:00",
      isEnabled: true,
    };

    const updatedSchedule = {
      ...schedule,
      [field]: value,
    };

    setTempSchedules(prev => [
      ...prev.filter(s => s.dayOfWeek !== dayOfWeek),
      updatedSchedule as ShopSchedule
    ]);
    setHasChanges(true);
  };

  const handleSaveSchedules = async () => {
    try {
      setLoading(true);
      
      // Guardar horarios
      const schedulePromises = tempSchedules.map(schedule => {
        const existingSchedule = schedules.find(s => s.dayOfWeek === schedule.dayOfWeek);
        return fetch(`/api/shops/${shopId}/schedules`, {
          method: existingSchedule ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(existingSchedule ? 
            { ...schedule, id: existingSchedule.id } : 
            schedule
          ),
        });
      });

      await Promise.all(schedulePromises);
      setSchedules(tempSchedules);
      setHasChanges(false);
      toast.success("Horarios guardados correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar los horarios");
    } finally {
      setLoading(false);
    }
  };

  const handleBreakChange = async (breakItem: Partial<ShopBreak>) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shops/${shopId}/breaks`, {
        method: breakItem.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(breakItem.id ? 
          breakItem : 
          {
            dayOfWeek: breakItem.dayOfWeek,
            startTime: breakItem.startTime,
            endTime: breakItem.endTime,
            name: breakItem.name,
            shopId
          }
        ),
      });

      if (!response.ok) throw new Error();

      const savedBreak = await response.json();
      if (breakItem.id) {
        setBreaks(prev => prev.map(b => b.id === breakItem.id ? savedBreak : b));
      } else {
        setBreaks(prev => [...prev, savedBreak]);
      }
      toast.success("Descanso actualizado correctamente");
    } catch {
      toast.error("Error al actualizar descanso");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBreak = async (breakId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shops/${shopId}/breaks/${breakId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      setBreaks(prev => prev.filter(b => b.id !== breakId));
      toast.success("Descanso eliminado correctamente");
    } catch {
      toast.error("Error al eliminar descanso");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (dayOfWeek: number, field: "startTime" | "endTime", value: string) => {
    try {
      const time = parse(value, "HH:mm", new Date());
      const formattedTime = format(time, "HH:mm");

      const updatedSchedules = tempSchedules.map((item) => {
        if (item.dayOfWeek === dayOfWeek) {
          return {
            ...item,
            [field]: formattedTime,
          };
        }
        return item;
      });

      setTempSchedules(updatedSchedules);
      setHasChanges(true);
    } catch (error) {
      console.error("Error parsing time:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Horarios por Día</CardTitle>
          <Button
            onClick={handleSaveSchedules}
            disabled={loading || !hasChanges}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS.map((day, index) => {
              const schedule = tempSchedules.find(s => s.dayOfWeek === index);
              return (
                <div key={day} className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="w-32">
                    <span className="font-medium">{day}</span>
                  </div>
                  <Switch
                    checked={schedule?.isEnabled ?? false}
                    onCheckedChange={(checked) => handleScheduleChange(index, "isEnabled", checked)}
                    disabled={loading}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      step="1800"
                      value={schedule?.startTime || "09:00"}
                      onChange={(e) => handleScheduleChange(index, "startTime", e.target.value)}
                      disabled={loading || !schedule?.isEnabled}
                      className="w-32"
                    />
                    <span>a</span>
                    <Input
                      type="time"
                      value={schedule?.endTime || "18:00"}
                      onChange={(e) => handleScheduleChange(index, "endTime", e.target.value)}
                      disabled={loading || !schedule?.isEnabled}
                      className="w-32"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Periodos de Descanso</CardTitle>
          <Button
            onClick={() => {
              const newBreak = {
                shopId,
                dayOfWeek: 1,
                startTime: "13:00",
                endTime: "14:00",
                name: "Nuevo Descanso"
              };
              handleBreakChange(newBreak);
            }}
            size="sm"
          >
            Agregar Descanso
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {breaks.map((breakItem) => (
              <div key={breakItem.id} className="flex items-center gap-4 p-4 rounded-lg border">
                <Input
                  value={breakItem.name}
                  onChange={(e) => handleBreakChange({
                    ...breakItem,
                    name: e.target.value
                  })}
                  className="w-40"
                  placeholder="Nombre del descanso"
                />
                <select
                  value={breakItem.dayOfWeek}
                  onChange={(e) => handleBreakChange({
                    ...breakItem,
                    dayOfWeek: parseInt(e.target.value)
                  })}
                  className="w-32 rounded-md border"
                >
                  {DAYS.map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={breakItem.startTime}
                    onChange={(e) => handleBreakChange({
                      ...breakItem,
                      startTime: e.target.value
                    })}
                    className="w-32"
                  />
                  <span>a</span>
                  <Input
                    type="time"
                    value={breakItem.endTime}
                    onChange={(e) => handleBreakChange({
                      ...breakItem,
                      endTime: e.target.value
                    })}
                    className="w-32"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteBreak(breakItem.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 