"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiCalendar, FiChevronLeft, FiChevronRight, 
  FiX, FiCheck 
} from "react-icons/fi";

interface CustomDatePickerProps {
  value: string; // Format: YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  minYear?: number;
  maxYear?: number;
  className?: string;
  id?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = "Select Date",
  required = false,
  minYear = 1940,
  maxYear = 2040,
  className = "",
  id,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial or current value
  const initialDate = value ? new Date(value + "T00:00:00") : new Date();
  const validInitial = !isNaN(initialDate.getTime());

  const [viewYear, setViewYear] = useState(validInitial ? initialDate.getFullYear() : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(validInitial ? initialDate.getMonth() : new Date().getMonth());

  // Update view when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // Navigate months
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Generate calendar days for current month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInCurrentMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const daysInPrevMonth = getDaysInMonth(viewYear, viewMonth - 1);

  // Pad previous month days
  const prevDays = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    prevDays.push(daysInPrevMonth - i);
  }

  // Current month days
  const currentDays = [];
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    currentDays.push(i);
  }

  // Next month days to fill 42 cells (6 rows * 7 cols)
  const totalSlots = 42;
  const nextDaysCount = totalSlots - (prevDays.length + currentDays.length);
  const nextDays = [];
  for (let i = 1; i <= nextDaysCount; i++) {
    nextDays.push(i);
  }

  // Check if date is selected
  const isSelected = (day: number) => {
    if (!value) return false;
    const parts = value.split("-");
    if (parts.length !== 3) return false;
    const [y, m, d] = parts.map(Number);
    return y === viewYear && m === viewMonth + 1 && d === day;
  };

  // Check if date is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  // Select day
  const handleSelectDay = (day: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const formattedMonth = String(viewMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  // Year options array
  const yearOptions = [];
  for (let y = maxYear; y >= minYear; y--) {
    yearOptions.push(y);
  }

  // Formatted date string for input display
  const displayDate = value ? (() => {
    const d = new Date(value + "T00:00:00");
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  })() : "";

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Visual Trigger Box */}
      <div
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border rounded-2xl cursor-pointer transition-all duration-200 group ${
          isOpen
            ? "border-yellow-400 ring-2 ring-yellow-400/20 shadow-lg shadow-yellow-400/10"
            : "border-slate-800 hover:border-slate-700 bg-slate-950/60"
        }`}
      >
        <div className="flex items-center gap-3 truncate">
          {/* Prominent Golden Calendar Icon */}
          <div className="w-7 h-7 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 shrink-0 group-hover:scale-105 transition-transform">
            <FiCalendar size={14} />
          </div>
          <span className={`text-sm truncate ${displayDate ? "text-white font-semibold" : "text-slate-500"}`}>
            {displayDate || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-500 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Clear date"
            >
              <FiX size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Hidden native input for form validation */}
      <input
        type="hidden"
        value={value}
        required={required}
      />

      {/* Unique Animated Dark Luxury Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 z-[110] mt-2 w-[310px] sm:w-[330px] p-4 bg-[#0a0f1d] border border-yellow-400/30 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-4"
          >
            {/* Header: Month & Year Controls */}
            <div className="flex items-center justify-between gap-1 pb-3 border-b border-slate-800/80">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-yellow-400 hover:border-yellow-400/40 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <FiChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1.5">
                {/* Month Dropdown */}
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:border-yellow-400 focus:outline-none cursor-pointer"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={m} value={idx} className="bg-slate-950 text-white">
                      {m}
                    </option>
                  ))}
                </select>

                {/* Year Dropdown */}
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-yellow-400 focus:border-yellow-400 focus:outline-none cursor-pointer font-mono"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y} className="bg-slate-950 text-white">
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-yellow-400 hover:border-yellow-400/40 transition-colors cursor-pointer"
                title="Next Month"
              >
                <FiChevronRight size={16} />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {DAY_NAMES.map((d, i) => (
                <span
                  key={d}
                  className={`text-[10px] font-black uppercase tracking-wider py-1 ${
                    i === 0 || i === 6 ? "text-amber-400/90" : "text-slate-400"
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Previous Month Days */}
              {prevDays.map((day) => (
                <div
                  key={`prev-${day}`}
                  className="h-8 flex items-center justify-center text-xs text-slate-700 cursor-not-allowed select-none"
                >
                  {day}
                </div>
              ))}

              {/* Current Month Days */}
              {currentDays.map((day) => {
                const selected = isSelected(day);
                const today = isToday(day);

                return (
                  <button
                    key={`curr-${day}`}
                    type="button"
                    onClick={(e) => handleSelectDay(day, e)}
                    className={`h-8 w-8 mx-auto rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-pointer select-none ${
                      selected
                        ? "bg-yellow-400 text-black font-black shadow-lg shadow-yellow-400/40 scale-105"
                        : today
                        ? "bg-slate-900 border border-yellow-400/60 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                        : "text-slate-200 hover:bg-slate-850 hover:text-yellow-400 hover:border hover:border-yellow-400/30"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}

              {/* Next Month Days */}
              {nextDays.map((day) => (
                <div
                  key={`next-${day}`}
                  className="h-8 flex items-center justify-center text-xs text-slate-700 cursor-not-allowed select-none"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Footer Quick Controls */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleSelectToday}
                className="text-[11px] font-bold text-yellow-400 hover:underline cursor-pointer"
              >
                Today
              </button>

              <div className="flex items-center gap-2">
                {value && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
