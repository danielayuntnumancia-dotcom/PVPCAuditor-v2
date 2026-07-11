import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { formatDate } from "../utils";

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label: string;
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

export default function CustomDatePicker({ value, onChange, label }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current date or fallback to today
  const parsedDate = value ? new Date(value) : new Date();
  const initialYear = isNaN(parsedDate.getTime()) ? new Date().getFullYear() : parsedDate.getFullYear();
  const initialMonth = isNaN(parsedDate.getTime()) ? new Date().getMonth() : parsedDate.getMonth();

  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [currentYear, setCurrentYear] = useState(initialYear);

  // Keep internal calendar view in sync when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentMonth(d.getMonth());
        setCurrentYear(d.getFullYear());
      }
    }
  }, [value]);

  // Click outside listener to close calendar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const padZero = (n: number) => n.toString().padStart(2, "0");

  const handleSelectDay = (year: number, month: number, day: number) => {
    const ymd = `${year}-${padZero(month + 1)}-${padZero(day)}`;
    onChange(ymd);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    const ymd = `${today.getFullYear()}-${padZero(today.getMonth() + 1)}-${padZero(today.getDate())}`;
    onChange(ymd);
    setIsOpen(false);
  };

  // Generate calendar grid days (6 weeks = 42 cells)
  const generateGrid = () => {
    const cells = [];
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    // getDay() is 0 (Sunday) to 6 (Saturday).
    // Convert to Monday (0) through Sunday (6):
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

    // 1. Previous month padded days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = totalDaysInPrevMonth - i;
      const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYearNum = currentMonth === 0 ? currentYear - 1 : currentYear;
      cells.push({
        day: dayNum,
        month: prevMonthIdx,
        year: prevYearNum,
        isCurrentMonth: false,
      });
    }

    // 2. Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      cells.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
      });
    }

    // 3. Next month padded days to fill the rest of 42 cells
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYearNum = currentMonth === 11 ? currentYear + 1 : currentYear;
      cells.push({
        day: i,
        month: nextMonthIdx,
        year: nextYearNum,
        isCurrentMonth: false,
      });
    }

    return cells;
  };

  const gridDays = generateGrid();

  // Helper to determine if a grid cell is currently selected
  const isSelected = (year: number, month: number, day: number) => {
    if (!value) return false;
    const d = new Date(value);
    return (
      !isNaN(d.getTime()) &&
      d.getFullYear() === year &&
      d.getMonth() === month &&
      d.getDate() === day
    );
  };

  // Helper to determine if a grid cell is today
  const isToday = (year: number, month: number, day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  // Generate list of years for select element (e.g., 2020 to 2030)
  const years = Array.from({ length: 15 }, (_, i) => 2020 + i);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        id={`datepicker-trigger-${label.toLowerCase().replace(/\s+/g, "-")}`}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-xs p-2.5 bg-slate-800 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-white dark:text-white cursor-pointer flex justify-between items-center hover:border-slate-600 dark:hover:border-slate-700 transition-all select-none"
      >
        <span className="font-mono font-medium">{formatDate(value)}</span>
        <Calendar size={14} className="text-white dark:text-slate-200" />
      </button>

      {isOpen && (
        <div
          id={`datepicker-popover-${label.toLowerCase().replace(/\s+/g, "-")}`}
          className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.6)] z-50 p-4 animate-fadeIn"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1">
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                className="text-xs font-bold bg-transparent border-none text-slate-800 dark:text-slate-100 focus:outline-hidden cursor-pointer hover:text-emerald-500 dark:hover:text-emerald-400 font-sans"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                className="text-xs font-bold bg-transparent border-none text-slate-800 dark:text-slate-100 focus:outline-hidden cursor-pointer hover:text-emerald-500 dark:hover:text-emerald-400 font-mono"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="text-2xs font-bold text-slate-400 dark:text-slate-500 font-sans"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {gridDays.map((item, idx) => {
              const selected = isSelected(item.year, item.month, item.day);
              const today = isToday(item.year, item.month, item.day);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(item.year, item.month, item.day)}
                  className={`
                    h-8 text-xs rounded-lg font-sans transition-all flex items-center justify-center relative
                    ${
                      selected
                        ? "bg-emerald-500 text-white font-bold shadow-xs shadow-emerald-500/20"
                        : item.isCurrentMonth
                        ? "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        : "text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }
                    ${today && !selected ? "ring-1 ring-emerald-500/50 dark:ring-emerald-400/50 font-semibold" : ""}
                  `}
                >
                  {item.day}
                  {today && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick buttons */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 mt-3 pt-2.5">
            <button
              type="button"
              onClick={handleToday}
              className="text-3xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors font-sans"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-3xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors font-sans"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
