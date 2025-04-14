"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
import { DateRange } from "react-day-picker";

interface DateFilterProps {
  onDateChange: (date: Date | DateRange) => void;
  isLoading: boolean;
}

export function DateFilter({ onDateChange, isLoading }: DateFilterProps) {
  const [filterType, setFilterType] = useState<"day" | "month" | "range">("day");
  const [date, setDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleFilterTypeChange = (type: "day" | "month" | "range") => {
    setFilterType(type);
    if (type === "day") {
      onDateChange(date);
    } else if (type === "month") {
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      onDateChange(firstDayOfMonth);
    } else {
      dateRange && onDateChange(dateRange);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={filterType}
        onValueChange={(value: "day" | "month" | "range") => 
          handleFilterTypeChange(value)
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Tipo de filtro" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Por día</SelectItem>
          <SelectItem value="month">Por mes</SelectItem>
          <SelectItem value="range">Rango de fechas</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[240px]" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CalendarIcon className="mr-2 h-4 w-4" />
            )}
            {filterType === "range" 
              ? dateRange?.from
                ? `${format(dateRange.from, "P", { locale: es })} - ${
                    dateRange.to ? format(dateRange.to, "P", { locale: es }) : "..."
                  }`
                : "Seleccionar rango"
              : filterType === "month"
              ? format(date, "MMMM yyyy", { locale: es })
              : format(date, "PPP", { locale: es })
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {filterType === "range" ? (
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(selected) => {
                setDateRange(selected as DateRange);
                selected && onDateChange(selected as DateRange);
              }}
              initialFocus
              locale={es}
            />
          ) : (
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selected) => {
                const newDate = selected as Date;
                setDate(newDate);
                if (filterType === "month") {
                  const firstDayOfMonth = new Date(
                    newDate.getFullYear(),
                    newDate.getMonth(),
                    1
                  );
                  onDateChange(firstDayOfMonth);
                } else {
                  onDateChange(newDate);
                }
              }}
              initialFocus
              locale={es}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
} 