import React, { useState, useEffect } from 'react';
import { Booking } from '../types';

interface Worker {
  id: string;
  name: string;
  avatar: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
}

interface BookingCalendarProps {
  workers: Worker[];
  services: Service[];
  bookings: Booking[];
  timeInterval: string;
  selectedView: 'workers' | 'services';
}

const BookingCalendar = ({ workers, services, bookings, timeInterval, selectedView }: BookingCalendarProps) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const getBookingsForColumn = (columnId: string) => {
    return bookings.filter(booking => 
      (selectedView === 'workers' ? booking.worker.id : booking.service.id) === columnId
    );
  };

  const generateTimeSlots = () => {
    const slots = [];
    const totalMinutes = (21 - 9) * 60; // From 09:00 to 21:00
    const interval = parseInt(timeInterval);

    for (let i = 0; i <= totalMinutes; i += interval) {
      const hour = Math.floor((i / 60) + 9);
      const minute = i % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
    return slots;
  };

  const columnWidth = 150; // Adjust as needed


  return (
    <div className="flex gap-2 relative" style={{ position: 'relative', minHeight: '100%' }}>
      <div className="w-16 mt-12">
        {generateTimeSlots().map((time) => (
          <div key={time} className="h-14 text-xs text-gray-500 text-right pr-2">
            {time}
          </div>
        ))}
      </div>
      {(selectedView === "workers" ? workers : services).map(item => (
        <div 
          key={item.id} 
          className="space-y-2 flex-shrink-0"
          style={{ width: columnWidth }}
        >
          {generateTimeSlots().map((time) => {
            const columnBookings = getBookingsForColumn(item.id);
            const booking = columnBookings.find(b => {
              // Check if the current time slot falls within the booking's time range
              const [bookingStartHour, bookingStartMinute] = b.startTime.split(':').map(Number);
              const [bookingEndHour, bookingEndMinute] = b.endTime.split(':').map(Number);
              const [slotHour, slotMinute] = time.split(':').map(Number);

              const bookingStart = bookingStartHour * 60 + bookingStartMinute;
              const bookingEnd = bookingEndHour * 60 + bookingEndMinute;
              const slotTime = slotHour * 60 + slotMinute;

              return slotTime >= bookingStart && slotTime < bookingEnd;
            });

            return (
              <div key={time} className="h-14">
                {booking ? (
                  <div 
                    className="bg-primary/10 rounded-md p-2 cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => setSelectedBooking(booking)}
                    style={{
                      position: 'absolute',
                      width: columnWidth,
                      height: `${(parseInt(booking.endTime.split(':').join('')) - parseInt(booking.startTime.split(':').join(''))) * 3.5}rem`,
                      transform: `translateY(${(parseInt(booking.startTime.split(':').join('')) - 9 * 60) * 3.5 / 60}rem)`
                    }}
                  >
                    <p className="font-medium text-sm">
                      {selectedView === "workers" ? booking.service.name : booking.user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                ) : (
                  <div className="h-full border border-dashed border-gray-200 rounded-md"></div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default BookingCalendar;

