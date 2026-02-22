'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isAfter, isBefore, startOfDay } from 'date-fns';

interface BookingCalendarProps {
    bookedDates: { start: Date; end: Date }[];
    startDate: Date | null;
    endDate: Date | null;
    onSelectStart: (date: Date) => void;
    onSelectEnd: (date: Date) => void;
}

export default function BookingCalendar({
    bookedDates,
    startDate,
    endDate,
    onSelectStart,
    onSelectEnd,
}: BookingCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const today = startOfDay(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get day of week for first day (0 = Sunday)
    const startDayOfWeek = monthStart.getDay();
    const emptyDays = Array(startDayOfWeek).fill(null);

    const isDateBooked = (date: Date): boolean => {
        const checkDate = startOfDay(date);
        return bookedDates.some(({ start, end }) => {
            const bookingStart = startOfDay(start);
            const bookingEnd = startOfDay(end);
            return checkDate >= bookingStart && checkDate <= bookingEnd;
        });
    };

    const isInSelectedRange = (date: Date): boolean => {
        if (!startDate || !endDate) return false;
        const checkDate = startOfDay(date);
        return checkDate >= startOfDay(startDate) && checkDate <= startOfDay(endDate);
    };

    const isStartDate = (date: Date): boolean => {
        if (!startDate) return false;
        return isSameDay(date, startDate);
    };

    const isEndDate = (date: Date): boolean => {
        if (!endDate) return false;
        return isSameDay(date, endDate);
    };

    const handleDateClick = (date: Date) => {
        if (isBefore(date, today)) return;
        if (isDateBooked(date)) return;

        if (!startDate || (startDate && endDate && !isSameDay(startDate, endDate))) {
            onSelectStart(date);
            onSelectEnd(date);
        } else if (startDate && endDate && isSameDay(startDate, endDate)) {
            if (isAfter(date, startDate)) {
                const hasBookedInRange = bookedDates.some(({ start, end }) => {
                    const bookingStart = startOfDay(start);
                    const bookingEnd = startOfDay(end);
                    const rangeStart = startOfDay(startDate);
                    const rangeEnd = startOfDay(date);
                    return bookingStart <= rangeEnd && bookingEnd >= rangeStart;
                });
                if (!hasBookedInRange) {
                    onSelectEnd(date);
                } else {
                    onSelectStart(date);
                    onSelectEnd(date);
                }
            } else if (isBefore(date, startDate)) {
                const oldStart = startDate;
                onSelectStart(date);
                const hasBookedInRange = bookedDates.some(({ start, end }) => {
                    const bookingStart = startOfDay(start);
                    const bookingEnd = startOfDay(end);
                    return bookingStart <= startOfDay(oldStart) && bookingEnd >= startOfDay(date);
                });
                if (!hasBookedInRange) {
                    onSelectEnd(oldStart);
                } else {
                    onSelectEnd(date);
                }
            } else {
                onSelectEnd(date);
            }
        } else {
            onSelectStart(date);
            onSelectEnd(date);
        }
    };

    const getDayClass = (date: Date): string => {
        const isPast = isBefore(date, today);
        const isBooked = isDateBooked(date);
        const isSelected = isInSelectedRange(date);
        const isStart = isStartDate(date);
        const isEnd = isEndDate(date);
        const isToday = isSameDay(date, today);

        let classes = 'w-10 h-10 rounded-lg text-[13px] font-semibold transition-all ';

        if (isPast) {
            classes += 'text-slate-300 cursor-not-allowed opacity-30';
        } else if (isBooked) {
            classes += 'bg-red-50 text-red-400 cursor-not-allowed line-through border border-red-100';
        } else if (isSelected) {
            if (isStart || isEnd) {
                classes += 'bg-emerald-500 text-white z-10 scale-110 shadow-lg shadow-emerald-500/20';
            } else {
                classes += 'bg-emerald-50 text-emerald-700';
            }
        } else if (isToday) {
            classes += 'border-2 border-emerald-500 text-emerald-600';
        } else {
            classes += 'text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors';
        }

        return classes;
    };

    return (
        <div className="bg-white border border-slate-150 rounded-2xl p-8 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                <button
                    type="button"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                    {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <button
                    type="button"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className="w-10 h-8 flex items-center justify-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
                {emptyDays.map((_, i) => (
                    <div key={`empty-${i}`} className="w-10 h-10" />
                ))}
                {days.map((date) => (
                    <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => handleDateClick(date)}
                        disabled={isBefore(date, today) || isDateBooked(date)}
                        className={getDayClass(date)}
                    >
                        {format(date, 'd')}
                    </button>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-8 mt-10 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    <div className="w-3 h-3 rounded-full bg-red-400 opacity-30" />
                    <span>Booked</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Selected</span>
                </div>
            </div>
        </div>
    );
}
