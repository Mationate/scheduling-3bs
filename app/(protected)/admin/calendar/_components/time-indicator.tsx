"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export function TimeIndicator() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Actualizar inmediatamente y luego cada minuto
    const updateTime = () => setCurrentTime(new Date());
    updateTime();
    
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = (hours - 9) * 60 + minutes; // 9 es la hora de inicio
    const heightPerHour = 56; // altura de cada slot
    return (totalMinutes / 60) * heightPerHour;
  };

  if (currentTime.getHours() < 9 || currentTime.getHours() >= 22) {
    return null; // No mostrar el indicador fuera del horario de trabajo
  }

  return (
    <motion.div
      className="absolute left-0 right-0 z-10 pointer-events-none"
      initial={{ top: getCurrentTimePosition() }}
      animate={{ top: getCurrentTimePosition() }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center">
        <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-r shadow-sm">
          {format(currentTime, 'HH:mm')}
        </div>
        <div className="flex-1 border-t-2 border-red-500" style={{
          boxShadow: '0 -1px 2px rgba(239, 68, 68, 0.2)'
        }} />
      </div>
    </motion.div>
  );
} 