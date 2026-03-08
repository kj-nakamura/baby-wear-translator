'use client';

import React, { useMemo, useState } from 'react';
import { useWorkHours } from '@/hooks/useWorkHours';

const HOURS_PER_DAY = 8;
const HALF_DAY_HOURS = 4;
const WEEK_LABELS = ['日', '月', '火', '水', '木', '金', '土'];
type LeaveStatus = 'working' | 'paid' | 'half';

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatMonthDay = (dateKey: string) => {
  const [, month, day] = dateKey.split('-');
  return `${month}/${day}`;
};

const buildCalendarDays = (month: string) => {
  const [year, monthIndex] = month.split('-').map(Number);
  const firstDay = new Date(year, monthIndex - 1, 1);
  const lastDay = new Date(year, monthIndex, 0);
  const daysInMonth = lastDay.getDate();
  const leadingEmptyDays = firstDay.getDay();
  const days: Array<Date | null> = Array.from({ length: leadingEmptyDays }, () => null);

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, monthIndex - 1, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
};

const WorkHoursSection: React.FC = () => {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [showCalendar, setShowCalendar] = useState(false);
  const [leaveStatuses, setLeaveStatuses] = useState<Record<string, LeaveStatus>>({});
  const { workHoursData, holidaysData, loading, error, fetchWorkHours } = useWorkHours();
  const calendarDays = useMemo(() => buildCalendarDays(month), [month]);
  const excludedDates = useMemo(
    () => new Set(holidaysData?.holidays.map((holiday) => {
      const [holidayMonth, holidayDay] = holiday.split('/').map(Number);
      const [year] = month.split('-').map(Number);
      return formatDate(new Date(year, holidayMonth - 1, holidayDay));
    }) ?? []),
    [holidaysData, month]
  );
  const paidLeaveHours = Object.values(leaveStatuses).reduce((total, status) => {
    if (status === 'paid') return total + HOURS_PER_DAY;
    if (status === 'half') return total + HALF_DAY_HOURS;
    return total;
  }, 0);
  const paidLeaveCount = Object.values(leaveStatuses).filter((status) => status === 'paid').length;
  const halfLeaveCount = Object.values(leaveStatuses).filter((status) => status === 'half').length;
  const adjustedWorkHours = workHoursData ? Math.max(0, workHoursData.workHours - paidLeaveHours) : 0;
  const excludedDisplayDays = useMemo(() => {
    const holidayItems = (holidaysData?.holidays ?? []).map((holiday) => ({
      key: `holiday-${holiday}`,
      label: holiday,
      type: 'holiday' as const,
    }));
    const leaveItems = Object.entries(leaveStatuses)
      .filter(([, status]) => status === 'paid' || status === 'half')
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([dateKey, status]) => ({
        key: `leave-${dateKey}`,
        label: formatMonthDay(dateKey),
        type: status,
      }));

    return [...holidayItems, ...leaveItems];
  }, [holidaysData, leaveStatuses]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (month) {
      fetchWorkHours(month);
      setShowCalendar(true);
    }
  };

  const togglePaidLeave = (date: Date) => {
    const dateKey = formatDate(date);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    if (isWeekend || excludedDates.has(dateKey)) {
      return;
    }

    setLeaveStatuses((current) => {
      const next = { ...current };
      const currentStatus = current[dateKey] ?? 'working';

      if (currentStatus === 'working') {
        next[dateKey] = 'paid';
      } else if (currentStatus === 'paid') {
        next[dateKey] = 'half';
      } else {
        delete next[dateKey];
      }

      return next;
    });
  };

  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white/60 p-4 shadow-sm backdrop-blur-md transition-all hover:shadow-md sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="text-2xl">📅</span>
        <h2 className="text-base font-black text-gray-800 sm:text-lg">稼働時間計算 (Work Hours)</h2>
      </div>

      <form onSubmit={handleCalculate} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)_auto]">
        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <label className="ml-1 text-xs font-black uppercase tracking-widest text-gray-400">対象月</label>
          <input
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setLeaveStatuses({});
              setShowCalendar(false);
            }}
            className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3 text-sm font-bold text-gray-700 outline-none transition-all focus:border-blue-400 focus:bg-white"
            required
          />
        </div>
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 text-xs font-bold leading-5 text-slate-500 sm:col-span-2 lg:col-span-1">
          計算後にカレンダーが表示されます。月140時間が必須です。平日タップで `勤務 → 有給 → 半休` に切り替わります。
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale sm:w-auto lg:self-stretch"
        >
          {loading ? '計算中...' : '計算する'}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
          ⚠️ {error}
        </div>
      )}

      {showCalendar && workHoursData && (
        <div className="mt-8 rounded-[2rem] border border-slate-100 bg-white/80 p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Calendar</p>
              <h3 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">{month.replace('-', '年')}月のカレンダー</h3>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">通常勤務</span>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-500">休日・祝日</span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-600">有給</span>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-600">半休</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {WEEK_LABELS.map((label) => (
                <div key={label} className="px-1 pb-1 text-center text-[9px] font-black uppercase tracking-[0.12em] text-slate-400 sm:px-2 sm:pb-2 sm:text-[10px] sm:tracking-[0.2em]">
                  {label}
                </div>
              ))}
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-14 rounded-[1.1rem] bg-transparent sm:h-18 sm:rounded-2xl" />;
                }

                const dateKey = formatDate(date);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isHoliday = excludedDates.has(dateKey);
                const leaveStatus = leaveStatuses[dateKey] ?? 'working';
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
                    onClick={() => togglePaidLeave(date)}
                    disabled={isWeekend || isHoliday}
                    className={`h-14 w-full min-w-0 rounded-[1.1rem] border px-1 py-1 text-center transition sm:h-18 sm:rounded-2xl sm:p-2 ${stateClass} ${isWeekend || isHoliday ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'}`}
                  >
                    <div className="flex h-full min-w-0 flex-col items-center justify-center overflow-hidden">
                      <span className="truncate text-[11px] font-black leading-none sm:text-xs">{date.getDate()}</span>
                      <span className="mt-1 block truncate text-center text-[8px] leading-tight font-bold opacity-80 sm:text-[10px]">
                        {leaveStatus === 'paid' ? '有給' : leaveStatus === 'half' ? '半休' : isWeekend || isHoliday ? '休日' : '勤務'}
                      </span>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {workHoursData && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-emerald-50 bg-emerald-50/40 p-5">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-emerald-500">Adjusted Work Hours</p>
            <p className="text-3xl font-black text-emerald-600">
              {adjustedWorkHours} <span className="text-sm">時間</span>
            </p>
            <p className="mt-1 text-[10px] font-bold text-emerald-500 opacity-80">
              {workHoursData.workHours} - {paidLeaveHours} = {adjustedWorkHours}
            </p>
            <p className="mt-2 text-[10px] font-bold text-emerald-600">
              必須ライン: 140時間
            </p>
          </div>

          <div className="rounded-2xl border border-blue-50 bg-blue-50/30 p-5">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-blue-400">Base Work Hours</p>
            <p className="text-3xl font-black text-blue-600">
              {workHoursData.workHours} <span className="text-sm">時間</span>
            </p>
            <p className="mt-1 text-[10px] font-bold text-blue-400 opacity-80">
              (平日数 × 8時間)
            </p>
          </div>

          <div className="rounded-2xl border border-amber-50 bg-amber-50/60 p-5">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-amber-500">Paid Leave</p>
            <p className="text-3xl font-black text-amber-600">
              {paidLeaveCount} <span className="text-sm">日</span>
            </p>
            <p className="mt-1 text-[10px] font-bold text-amber-500 opacity-80">
              半休 {halfLeaveCount} 日 / 合計 {paidLeaveHours} 時間控除
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-50 bg-indigo-50/30 p-5">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-indigo-400">Excluded Holidays</p>
            {excludedDisplayDays.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {excludedDisplayDays.map((item) => (
                  <span key={item.key} className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-indigo-500 shadow-sm">
                    {item.label}
                    {item.type === 'paid' ? ' 有給' : item.type === 'half' ? ' 半休' : ''}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs font-bold text-indigo-400 opacity-60 italic">なし</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkHoursSection;
