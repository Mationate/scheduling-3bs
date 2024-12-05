import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";

interface CalendarHeaderProps {
  viewType: "services" | "workers";
  setViewType: (type: "services" | "workers") => void;
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void;
}

export function CalendarHeader({ 
  viewType, 
  setViewType, 
  selectedDate,
  onDateChange 
}: CalendarHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">Calendario de Reservas</h2>
        <DatePicker
          date={selectedDate}
          onChange={(date) => date && onDateChange(date)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="view-mode"
          checked={viewType === "workers"}
          onCheckedChange={(checked) => 
            setViewType(checked ? "workers" : "services")
          }
        />
        <Label htmlFor="view-mode">
          Ver por {viewType === "services" ? "Barberos" : "Servicios"}
        </Label>
      </div>
    </div>
  );
} 