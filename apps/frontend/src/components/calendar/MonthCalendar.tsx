'use client';

import React from 'react';
import { shiftMonthValue, WEEK_LABELS } from '@/components/work/utils';

type MonthCalendarProps = {
  calendarDays: Array<Date | null>;
  month: string;
  onMonthChange: (nextMonth: string) => void;
  renderDay: (date: Date, index: number) => React.ReactNode;
  renderWeekOverlay?: (weekIndex: number) => React.ReactNode;
  subtitle?: string;
  title?: string;
};

const MonthCalendar: React.FC<MonthCalendarProps> = ({
  calendarDays,
  month,
  onMonthChange,
  renderDay,
  renderWeekOverlay,
  subtitle,
  title,
}) => (
  <div className="mt-8 w-full rounded-[1.5rem] border border-slate-100 bg-white/80 p-2 shadow-sm sm:rounded-[2rem] sm:p-6">
    <div className="mb-4 grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2 sm:mb-5 sm:gap-3">
      <div className="flex justify-start">
        <button
          type="button"
          onClick={() => onMonthChange(shiftMonthValue(month, -1))}
          aria-label="前月を表示"
          className="mt-2 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-black text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-600 sm:h-10 sm:w-10 sm:rounded-2xl"
        >
          ←
        </button>
      </div>
      <div className="min-w-0 text-center">
        <h3 className="mt-2 text-base font-black text-slate-900 sm:text-2xl">
          {title ?? `${month.replace('-', '年')}月のカレンダー`}
        </h3>
        {subtitle && <p className="mt-1 text-[11px] font-bold text-slate-400 sm:mt-2 sm:text-xs">{subtitle}</p>}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onMonthChange(shiftMonthValue(month, 1))}
          aria-label="次月を表示"
          className="mt-2 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-black text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-600 sm:h-10 sm:w-10 sm:rounded-2xl"
        >
          →
        </button>
      </div>
    </div>

    <div className="space-y-1 sm:space-y-2">
      <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
        {WEEK_LABELS.map((label) => (
          <div key={label} className="px-0.5 pb-1 text-center text-[8px] font-black uppercase tracking-[0.08em] text-slate-400 sm:px-2 sm:pb-2 sm:text-[10px] sm:tracking-[0.2em]">
            {label}
          </div>
        ))}
      </div>
      {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => {
        const weekDays = calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7);

        return (
          <div key={`week-${weekIndex}`} className="space-y-0">
            {renderWeekOverlay?.(weekIndex)}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
              {weekDays.map((date, index) => (
                date ? renderDay(date, weekIndex * 7 + index) : <div key={`empty-${weekIndex}-${index}`} className="h-14 rounded-[1.1rem] bg-transparent sm:h-18 sm:rounded-2xl" />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default MonthCalendar;
