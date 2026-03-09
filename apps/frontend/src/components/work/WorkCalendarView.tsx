'use client';

import React from 'react';
import MonthCalendar from '@/components/calendar/MonthCalendar';
import type { CalendarEvent, LeaveStatus, MultiDayEventBar } from '@/components/work/types';
import { formatDate, isMultiDayEvent } from '@/components/work/utils';

type WorkCalendarViewProps = {
  calendarDays: Array<Date | null>;
  calendarEvents: Record<string, CalendarEvent[]>;
  calendarLoading: boolean;
  excludedDates: Set<string>;
  isGoogleConnected: boolean;
  leaveStatuses: Record<string, LeaveStatus>;
  month: string;
  multiDayEventBars: MultiDayEventBar[];
  onMonthChange: (nextMonth: string) => void;
  onOpenDateDetail: (date: Date) => void;
  selectedCalendarCount: number;
};

const WorkCalendarView: React.FC<WorkCalendarViewProps> = ({
  calendarDays,
  calendarEvents,
  calendarLoading,
  excludedDates,
  isGoogleConnected,
  leaveStatuses,
  month,
  multiDayEventBars,
  onMonthChange,
  onOpenDateDetail,
  selectedCalendarCount,
}) => {
  const subtitle = isGoogleConnected
    ? calendarLoading
      ? 'Googleカレンダーを同期中です。'
      : selectedCalendarCount > 0
        ? `${selectedCalendarCount}件のGoogleカレンダーを表示しています。`
        : 'Googleカレンダーの予定を表示しています。'
    : 'Googleログインすると、ここに Googleカレンダーの予定も表示されます。';

  return (
    <MonthCalendar
      calendarDays={calendarDays}
      month={month}
      onMonthChange={onMonthChange}
      subtitle={subtitle}
      renderWeekOverlay={(weekIndex) => {
        const weekBars = multiDayEventBars.filter((bar) => bar.weekIndex === weekIndex);
        const barRows = weekBars.length > 0 ? Math.max(...weekBars.map((bar) => bar.row)) + 1 : 0;
        if (barRows === 0) {
          return null;
        }

        return (
          <div className="relative -mb-5 sm:-mb-6">
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: 7 }, (_, index) => (
                <div key={`week-${weekIndex}-bar-slot-${index}`} className="h-4 sm:h-5" />
              ))}
            </div>
            <div className="pointer-events-none absolute inset-0">
              {weekBars.map((bar) => (
                <div
                  key={`${bar.calendarId ?? 'calendar'}-${bar.event.id}-${bar.weekIndex}-${bar.startColumn}`}
                  className="absolute z-10 flex h-4 items-center overflow-hidden rounded-t-xl rounded-b-md px-2 text-[9px] font-black text-sky-950 shadow-sm sm:h-5 sm:text-[10px]"
                  style={{
                    backgroundColor: `${bar.calendarColor ?? '#dbeafe'}dd`,
                    left: `calc((100% / 7) * ${bar.startColumn - 1})`,
                    top: `${bar.row * 24 + 6}px`,
                    width: `calc((100% / 7) * ${bar.span})`,
                  }}
                  title={bar.event.calendarName ? `${bar.event.calendarName}: ${bar.event.title}` : bar.event.title}
                >
                  <span className="truncate">{bar.event.title}</span>
                </div>
              ))}
            </div>
            <div style={{ height: `${barRows * 24}px` }} />
          </div>
        );
      }}
      renderDay={(date) => {
        const dateKey = formatDate(date);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isHoliday = excludedDates.has(dateKey);
        const leaveStatus = leaveStatuses[dateKey] ?? 'working';
        const dailyEvents = (calendarEvents[dateKey] ?? []).filter((event) => !isMultiDayEvent(event, month));
        const stateClass = leaveStatus === 'paid'
          ? 'border-amber-200 bg-amber-100 text-amber-700'
          : leaveStatus === 'half'
            ? 'border-orange-200 bg-orange-100 text-orange-700'
            : isWeekend || isHoliday
              ? 'border-rose-100 bg-rose-50 text-rose-500'
              : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-amber-200 hover:bg-amber-50';

        return (
          <button
            key={dateKey}
            type="button"
            onClick={() => onOpenDateDetail(date)}
            className={`h-18 w-full min-w-0 cursor-pointer rounded-[0.95rem] border px-1 pt-1 pb-1 text-center transition active:scale-[0.98] sm:h-24 sm:rounded-[1.35rem] sm:px-2 sm:pt-2 sm:pb-2 ${stateClass}`}
          >
            <div className="flex h-full min-w-0 flex-col items-center overflow-hidden">
              <span className="shrink-0 truncate text-[11px] font-black leading-none sm:text-xs">{date.getDate()}</span>
              <span className="mt-1 block truncate text-center text-[8px] font-bold leading-tight opacity-80 sm:text-[10px]">
                {leaveStatus === 'paid' ? '有給' : leaveStatus === 'half' ? '半休' : isWeekend || isHoliday ? '休日' : '勤務'}
              </span>
              {dailyEvents.length > 0 && (
                <div className="mt-1 w-full space-y-1">
                  {dailyEvents.slice(0, 2).map((event) => (
                    <span
                      key={`${event.calendarId ?? 'calendar'}-${event.id}`}
                      className="block truncate rounded-full px-1.5 py-0.5 text-[8px] font-black text-sky-900 shadow-sm sm:text-[9px]"
                      style={{ backgroundColor: `${event.calendarColor ?? '#dbeafe'}cc` }}
                      title={event.calendarName ? `${event.calendarName}: ${event.title}` : event.title}
                    >
                      {event.title}
                    </span>
                  ))}
                  {dailyEvents.length > 2 && (
                    <span className="block text-[8px] font-black text-sky-700 sm:text-[9px]">
                      +{dailyEvents.length - 2}件
                    </span>
                  )}
                </div>
              )}
            </div>
          </button>
        );
      }}
    />
  );
};

export default WorkCalendarView;
