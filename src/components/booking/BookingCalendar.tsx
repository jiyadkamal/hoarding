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
        if (isBefore(date, today)) return; // Can't select past dates
        if (isDateBooked(date)) return; // Can't select booked dates

        // If no start date or both dates are set, start fresh
        if (!startDate || (startDate && endDate && !isSameDay(startDate, endDate))) {
            onSelectStart(date);
            onSelectEnd(date); // Initially set end same as start
        } else if (startDate && endDate && isSameDay(startDate, endDate)) {
            // We have a single date selected, now set range
            if (isAfter(date, startDate)) {
                // Check if any booked dates are in the range
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
                    // Booked date in range - start fresh with new date
                    onSelectStart(date);
                    onSelectEnd(date);
                }
            } else if (isBefore(date, startDate)) {
                // Clicked before start - swap: new date becomes start
                const oldStart = startDate;
                onSelectStart(date);
                // Check if range is clear
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
                // Same date clicked - keep as single day selection
                onSelectEnd(date);
            }
        } else {
            // Fallback - start fresh
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

        let classes = 'w-10 h-10 rounded-lg text-sm font-medium transition-all ';

        if (isPast) {
            classes += 'text-[var(--text-tertiary)] cursor-not-allowed opacity-40';
        } else if (isBooked) {
            classes += 'bg-red-500/20 text-red-500 cursor-not-allowed line-through';
        } else if (isStart || isEnd) {
            classes += 'bg-[var(--accent-primary)] text-white cursor-pointer';
        } else if (isSelected) {
            classes += 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] cursor-pointer';
        } else if (isToday) {
            classes += 'border-2 border-[var(--accent-primary)] text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-tertiary)]';
        } else {
            classes += 'text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-tertiary)]';
        }

        return classes;
    };

    return (
        <div className="bg-[var(--bg-secondary)] rounded-[var(--radius-lg)] p-4 border border-[var(--border-light)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <button
                    type="button"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className="w-10 h-8 flex items-center justify-center text-xs font-medium text-[var(--text-tertiary)]">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
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
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--border-light)]">
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/50" />
                    <span>Booked</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <div className="w-3 h-3 rounded bg-[var(--accent-primary)]" />
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <div className="w-3 h-3 rounded border-2 border-[var(--accent-primary)]" />
                    <span>Today</span>
                </div>
            </div>
        </div>
    );
}
