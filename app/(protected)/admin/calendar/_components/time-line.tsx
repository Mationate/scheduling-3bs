"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

export function TimeLine() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(timer);
  }, []);

  const timePercentage = () => {
    const now = currentTime;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = (hours - 8) * 60 + minutes; // 8 AM es el inicio
    return (totalMinutes / (12 * 60)) * 100; // 12 horas es el rango total
  };

  return (
    <div 
      className="absolute left-0 right-0 border-t-2 border-red-500 z-10 pointer-events-none"
      style={{ 
        top: `${timePercentage()}%`,
      }}
    >
      <div className="absolute -left-16 -top-3 text-xs text-red-500">
        {format(currentTime, "HH:mm")}
      </div>
    </div>
  );
} 