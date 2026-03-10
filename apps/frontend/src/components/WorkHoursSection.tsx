'use client';

import React, { useEffect, useMemo, useState } from 'react';
import CalendarDayDetailModal from '@/components/CalendarDayDetailModal';
import CalendarSelectorModal from '@/components/CalendarSelectorModal';
import { useWorkHours } from '@/hooks/useWorkHours';
import type { CalendarEvent, CalendarOption, ExcludedDisplayDay, LeaveStatus, SelectedDateDetail } from '@/components/work/types';
import { buildCalendarDays, buildMultiDayEventBars, formatDate, formatEventTime, formatFullDate, formatMonthDay, getCurrentMonthValue, getEventDateKeys } from '@/components/work/utils';
import WorkCalendarView from '@/components/work/WorkCalendarView';
import WorkHoursSummary from '@/components/work/WorkHoursSummary';

const HOURS_PER_DAY = 8;
const HALF_DAY_HOURS = 4;
const SELECTED_CALENDAR_IDS_STORAGE_KEY = 'work-hours:selected-calendar-ids';

type WorkHoursSectionProps = {
  isGoogleConnected: boolean;
};

// WorkHoursSection は稼働時間計算と Google カレンダーの月表示をまとめて扱います。
const WorkHoursSection: React.FC<WorkHoursSectionProps> = ({ isGoogleConnected }) => {
  const [month, setMonth] = useState(getCurrentMonthValue);
  const [showCalendar, setShowCalendar] = useState(true);
  const [showCalendarSelector, setShowCalendarSelector] = useState(false);
  const [leaveStatuses, setLeaveStatuses] = useState<Record<string, LeaveStatus>>({});
  const [calendarOptions, setCalendarOptions] = useState<CalendarOption[]>([]);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
  const [storedCalendarIds, setStoredCalendarIds] = useState<string[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<Record<string, CalendarEvent[]>>({});
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedDateDetail, setSelectedDateDetail] = useState<SelectedDateDetail | null>(null);
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
  const adjustedWorkHours = workHoursData ? Math.max(0, workHoursData.workHours - paidLeaveHours) : 0;
  const excludedDisplayDays = useMemo<ExcludedDisplayDay[]>(() => {
    const holidayItems: ExcludedDisplayDay[] = (holidaysData?.holidays ?? []).map((holiday) => ({
      key: `holiday-${holiday}`,
      label: holiday,
      type: 'holiday' as const,
    }));
    const leaveItems: ExcludedDisplayDay[] = Object.entries(leaveStatuses)
      .filter(([, status]) => status === 'paid' || status === 'half')
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([dateKey, status]) => ({
        key: `leave-${dateKey}`,
        label: formatMonthDay(dateKey),
        type: status as ExcludedDisplayDay['type'],
      }));

    return [...holidayItems, ...leaveItems];
  }, [holidaysData, leaveStatuses]);

  const selectedCalendars = useMemo(
    () => calendarOptions.filter((calendar) => selectedCalendarIds.includes(calendar.id)),
    [calendarOptions, selectedCalendarIds]
  );
  const multiDayEventBars = useMemo(
    () => buildMultiDayEventBars(calendarDays, calendarEvents, month),
    [calendarDays, calendarEvents, month]
  );
  const selectedDateEvents = selectedDateDetail ? calendarEvents[selectedDateDetail.dateKey] ?? [] : [];
  const selectedLeaveStatus = selectedDateDetail ? leaveStatuses[selectedDateDetail.dateKey] ?? 'working' : 'working';
  const selectedDateIsWeekend = selectedDateDetail ? selectedDateDetail.date.getDay() === 0 || selectedDateDetail.date.getDay() === 6 : false;
  const selectedDateIsHoliday = selectedDateDetail ? excludedDates.has(selectedDateDetail.dateKey) : false;
  const canEditLeaveStatus = !!selectedDateDetail && !selectedDateIsWeekend && !selectedDateIsHoliday;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storedValue = window.localStorage.getItem(SELECTED_CALENDAR_IDS_STORAGE_KEY);
      if (!storedValue) {
        return;
      }

      const parsed = JSON.parse(storedValue);
      if (!Array.isArray(parsed)) {
        return;
      }

      const nextStoredCalendarIds = parsed.filter((value): value is string => typeof value === 'string');
      setStoredCalendarIds(nextStoredCalendarIds);
      setSelectedCalendarIds(nextStoredCalendarIds);
    } catch {
      window.localStorage.removeItem(SELECTED_CALENDAR_IDS_STORAGE_KEY);
    }
  }, []);

  // 連携済みの Google カレンダー一覧を取得し、表示対象を選べるようにします。
  useEffect(() => {
    if (!isGoogleConnected) {
      setCalendarOptions([]);
      setSelectedCalendarIds([]);
      setCalendarError(null);
      return;
    }

    const controller = new AbortController();

    const fetchCalendars = async () => {
      setCalendarError(null);

      try {
        const response = await fetch('/api/google-calendar?mode=calendars', {
          signal: controller.signal,
          cache: 'no-store',
        });
        const body = await response.json().catch(() => null) as
          | { calendars?: CalendarOption[]; error?: string }
          | null;

        if (!response.ok) {
          throw new Error(body?.error || 'Googleカレンダー一覧の取得に失敗しました');
        }

        const calendars = body?.calendars ?? [];
        setCalendarOptions(calendars);
        setCalendarError(null);
        setSelectedCalendarIds((current) => {
          const preferredIds = current.length > 0 ? current : storedCalendarIds;
          const filteredCurrent = preferredIds.filter((calendarId) => calendars.some((calendar) => calendar.id === calendarId));
          if (filteredCurrent.length > 0) {
            return filteredCurrent;
          }

          const defaultCalendar = calendars.find((calendar) => calendar.isPrimary)?.id ?? calendars[0]?.id;
          return defaultCalendar ? [defaultCalendar] : [];
        });
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }

        setCalendarOptions([]);
        setSelectedCalendarIds([]);
        setCalendarError(fetchError instanceof Error ? fetchError.message : 'Googleカレンダー一覧の取得に失敗しました');
      }
    };

    void fetchCalendars();

    return () => controller.abort();
  }, [isGoogleConnected, storedCalendarIds]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!isGoogleConnected) {
      window.localStorage.removeItem(SELECTED_CALENDAR_IDS_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(SELECTED_CALENDAR_IDS_STORAGE_KEY, JSON.stringify(selectedCalendarIds));
  }, [isGoogleConnected, selectedCalendarIds]);

  // 月変更やログイン状態の変化に応じて Google カレンダーの予定を取得します。
  useEffect(() => {
    if (!isGoogleConnected) {
      setCalendarEvents({});
      setCalendarError(null);
      setCalendarLoading(false);
      return;
    }

    if (selectedCalendarIds.length === 0) {
      setCalendarEvents({});
      setCalendarLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchCalendarEvents = async () => {
      setCalendarLoading(true);
      setCalendarError(null);

      try {
        const responses = await Promise.all(selectedCalendarIds.map(async (calendarId) => {
          const params = new URLSearchParams({ month, calendarId });
          const response = await fetch(`/api/google-calendar?${params.toString()}`, {
            signal: controller.signal,
            cache: 'no-store',
          });
          const body = await response.json().catch(() => null) as
            | { error?: string; events?: CalendarEvent[]; details?: string }
            | null;

          if (!response.ok) {
            throw new Error(body?.error || body?.details || 'Googleカレンダーの取得に失敗しました');
          }

          const calendar = calendarOptions.find((option) => option.id === calendarId);
          return (body?.events ?? []).map((event) => ({
            ...event,
            calendarColor: calendar?.color,
            calendarId,
            calendarName: calendar?.name,
          }));
        }));

        const nextEvents = responses.flat().reduce<Record<string, CalendarEvent[]>>((accumulator, event) => {
          const eventDateKeys = getEventDateKeys(event, month);
          if (eventDateKeys.length === 0) {
            return accumulator;
          }

          eventDateKeys.forEach((eventDate) => {
            const existingEvents = accumulator[eventDate] ?? [];
            accumulator[eventDate] = [...existingEvents, event];
          });

          return accumulator;
        }, {});

        setCalendarEvents(nextEvents);
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }

        setCalendarEvents({});
        setCalendarError(fetchError instanceof Error ? fetchError.message : 'Googleカレンダーの取得に失敗しました');
      } finally {
        if (!controller.signal.aborted) {
          setCalendarLoading(false);
        }
      }
    };

    void fetchCalendarEvents();

    return () => controller.abort();
  }, [calendarOptions, isGoogleConnected, month, selectedCalendarIds]);

  // カレンダーの選択状態を切り替えます。
  const toggleCalendarSelection = (calendarId: string) => {
    setSelectedCalendarIds((current) => (
      current.includes(calendarId)
        ? current.filter((id) => id !== calendarId)
        : [...current, calendarId]
    ));
  };

  // 日付詳細モーダルを開きます。
  const openDateDetail = (date: Date) => {
    setSelectedDateDetail({
      date,
      dateKey: formatDate(date),
    });
  };

  // 日付詳細モーダルを閉じます。
  const closeDateDetail = () => {
    setSelectedDateDetail(null);
  };

  const handleMonthChange = (nextMonth: string) => {
    setMonth(nextMonth);
    setLeaveStatuses({});
  };

  // 対象日の勤務状態をモーダルから更新します。
  const setLeaveStatusForDate = (status: LeaveStatus) => {
    if (!selectedDateDetail || !canEditLeaveStatus) {
      return;
    }

    setLeaveStatuses((current) => {
      const next = { ...current };
      if (status === 'working') {
        delete next[selectedDateDetail.dateKey];
      } else {
        next[selectedDateDetail.dateKey] = status;
      }

      return next;
    });

    closeDateDetail();
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (month) {
      void fetchWorkHours(month);
      setShowCalendar(true);
    }
  };

  useEffect(() => {
    if (!month) {
      return;
    }

    setShowCalendar(true);
    setSelectedDateDetail(null);
    void fetchWorkHours(month);
  }, [fetchWorkHours, month]);

  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white/60 p-4 shadow-sm backdrop-blur-md transition-all hover:shadow-md sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="text-2xl">📅</span>
        <h2 className="text-base font-black text-gray-800 sm:text-lg">稼働時間計算 (Work Hours)</h2>
      </div>

      {isGoogleConnected && calendarOptions.length > 0 && (
        <div className="mt-4 grid gap-3">
          <div>
            <div>
              <p className="ml-1 text-xs font-black uppercase tracking-widest text-sky-500">表示するGoogleカレンダー</p>
              <p className="ml-1 mt-1 text-[11px] font-bold text-slate-400">
                {selectedCalendars.length > 0 ? `${selectedCalendars.length}件を選択中` : '未選択'}
              </p>
            </div>
          </div>
          {selectedCalendars.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCalendarSelector(true)}
              aria-expanded={showCalendarSelector}
              aria-label="選択中のGoogleカレンダー一覧を開く"
              className="rounded-2xl bg-white/90 px-4 py-3 text-left text-xs font-bold text-slate-500 shadow-sm transition hover:bg-sky-50/80 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-sky-500">選択中</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedCalendars.map((calendar) => (
                  <span key={calendar.id} className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: calendar.color }} />
                    <span>{calendar.name}</span>
                  </span>
                ))}
              </div>
            </button>
          )}
          {selectedCalendarIds.length === 0 && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">
              表示したいカレンダーを1つ以上選択してください。
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
          ⚠️ {error}
        </div>
      )}

      {calendarError && (
        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
          ⚠️ {calendarError}
        </div>
      )}

      {showCalendar && workHoursData && (
        <WorkCalendarView
          calendarDays={calendarDays}
          calendarEvents={calendarEvents}
          calendarLoading={calendarLoading}
          excludedDates={excludedDates}
          isGoogleConnected={isGoogleConnected}
          leaveStatuses={leaveStatuses}
          month={month}
          multiDayEventBars={multiDayEventBars}
          onMonthChange={handleMonthChange}
          onOpenDateDetail={openDateDetail}
          selectedCalendarCount={selectedCalendars.length}
        />
      )}

      {workHoursData && (
        <WorkHoursSummary
          adjustedWorkHours={adjustedWorkHours}
          excludedDisplayDays={excludedDisplayDays}
          paidLeaveHours={paidLeaveHours}
          totalWorkHours={workHoursData.workHours}
        />
      )}

      <form onSubmit={handleCalculate} className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="space-y-2">
          <label className="ml-1 text-xs font-black uppercase tracking-widest text-gray-400">対象月</label>
          <input
            type="month"
            value={month}
            onChange={(e) => {
              handleMonthChange(e.target.value);
            }}
            className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3 text-sm font-bold text-gray-700 outline-none transition-all focus:border-blue-400 focus:bg-white"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-slate-900 px-8 py-3 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:grayscale sm:w-auto"
        >
          {loading ? '表示中...' : '表示する'}
        </button>
      </form>

      {showCalendarSelector && (
        <CalendarSelectorModal
          calendarOptions={calendarOptions}
          onClose={() => setShowCalendarSelector(false)}
          selectedCalendarIds={selectedCalendarIds}
          toggleCalendarSelection={toggleCalendarSelection}
        />
      )}

      {selectedDateDetail && (
        <CalendarDayDetailModal
          canEditLeaveStatus={canEditLeaveStatus}
          closeDateDetail={closeDateDetail}
          formatEventTime={formatEventTime}
          formatFullDate={formatFullDate}
          selectedDateDetail={selectedDateDetail}
          selectedDateEvents={selectedDateEvents}
          selectedDateIsHoliday={selectedDateIsHoliday}
          selectedDateIsWeekend={selectedDateIsWeekend}
          selectedLeaveStatus={selectedLeaveStatus}
          setLeaveStatusForDate={setLeaveStatusForDate}
        />
      )}
    </div>
  );
};

export default WorkHoursSection;
