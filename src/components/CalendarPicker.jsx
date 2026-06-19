'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarPicker({ selectedDate, onChange, unavailableDates = [] }) {
  const [currentDate, setCurrentDate] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Normalize today to start of day for accurate comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Normalize unavailable dates to standard string for easy checking
  // We assume unavailableDates is an array of 'YYYY-MM-DD'
  const unavailableSet = new Set(unavailableDates);

  const handleSelect = (day) => {
    const d = new Date(year, month, day);
    // Adjust for timezone offset to get YYYY-MM-DD reliably
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateString);
  };

  return (
    <div className="w-full bg-white border border-beige-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="p-2 text-brown-400 hover:text-brown-700 hover:bg-beige-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold text-brown-700 text-lg">
          {monthNames[month]} {year}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 text-brown-400 hover:text-brown-700 hover:bg-beige-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-xs font-medium text-brown-400 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateObj = new Date(year, month, day);
          dateObj.setHours(0, 0, 0, 0);

          const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = selectedDate === dateString;
          const isPast = dateObj < today;
          const isUnavailable = unavailableSet.has(dateString);
          const isDisabled = isPast || isUnavailable;

          return (
            <button
              key={day}
              type="button"
              disabled={isDisabled}
              onClick={() => handleSelect(day)}
              className={`
                p-2 rounded-lg text-sm transition-all flex items-center justify-center aspect-square
                ${isDisabled ? 'text-brown-300 bg-beige-50/50 cursor-not-allowed opacity-50' : 'hover:bg-olive-100 cursor-pointer'}
                ${isSelected ? 'bg-olive-500 text-white hover:bg-olive-600 font-bold shadow-sm' : ''}
                ${!isDisabled && !isSelected ? 'text-brown-700' : ''}
              `}
              title={isUnavailable ? 'This date is already booked' : ''}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
