'use client';

import React, { useEffect, useMemo, useState } from 'react';
import CalendarDayDetailModal from '@/components/CalendarDayDetailModal';
import CalendarSelectorModal from '@/components/CalendarSelectorModal';
import { useWorkHours } from '@/hooks/useWorkHours';

const HOURS_PER_DAY = 8;
const HALF_DAY_HOURS = 4;
const WEEK_LABELS = ['日', '月', '火', '水', '木', '金', '土'];
const SELECTED_CALENDAR_IDS_STORAGE_KEY = 'work-hours:selected-calendar-ids';
const JST_TIME_ZONE = 'Asia/Tokyo';
type LeaveStatus = 'working' | 'paid' | 'half';
type CalendarEvent = {
  allDay: boolean;
  calendarColor?: string;
  calendarId?: string;
  calendarName?: string;
  end: string;
  id: string;
  start: string;
  title: string;
};
type CalendarOption = {
  accessRole: string;
  color: string;
  id: string;
  isPrimary: boolean;
  name: string;
};
type SelectedDateDetail = {
  date: Date;
  dateKey: string;
};
type MultiDayEventBar = {
  calendarColor?: string;
  calendarId?: string;
  event: CalendarEvent;
  row: number;
  span: number;
  startColumn: number;
  weekIndex: number;
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatMonthDay = (dateKey: string) => {
  const [, month, day] = dateKey.split('-');
  return `${month}/${day}`;
};

const formatFullDate = (date: Date) => {
  const weekDay = WEEK_LABELS[date.getDay()];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 (${weekDay})`;
};

const formatEventTime = (event: CalendarEvent) => {
  if (event.allDay) {
    return '終日';
  }

  const start = event.start ? new Date(event.start) : null;
  const end = event.end ? new Date(event.end) : null;
  if (!start || Number.isNaN(start.getTime())) {
    return '時刻未設定';
  }

  const timeFormatter = new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: JST_TIME_ZONE,
  });
  const startText = timeFormatter.format(start);
  if (!end || Number.isNaN(end.getTime())) {
    return startText;
  }

  const endText = timeFormatter.format(end);
  return `${startText} - ${endText}`;
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

const getCurrentMonthValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
};

const shiftMonthValue = (value: string, diff: number) => {
  const [year, month] = value.split('-').map(Number);
  const date = new Date(year, month - 1 + diff, 1);
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
};

const getEventDateKeys = (event: CalendarEvent, visibleMonth: string) => {
  const startKey = event.start.slice(0, 10);
  if (!startKey) {
    return [];
  }

  const startDate = parseDateKey(startKey);
  const monthStart = parseDateKey(`${visibleMonth}-01`);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

  if (!event.end) {
    return [startKey];
  }

  const endBaseKey = event.end.slice(0, 10);
  if (!endBaseKey) {
    return [startKey];
  }

  const endDate = parseDateKey(endBaseKey);
  if (event.allDay) {
    endDate.setDate(endDate.getDate() - 1);
  } else if (event.end.includes('T')) {
    const rawEnd = new Date(event.end);
    if (rawEnd.getHours() === 0 && rawEnd.getMinutes() === 0 && rawEnd.getSeconds() === 0 && rawEnd.getMilliseconds() === 0) {
      endDate.setDate(endDate.getDate() - 1);
    }
  }

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return [startKey];
  }

  const rangeStart = startDate > monthStart ? startDate : monthStart;
  const rangeEnd = endDate < monthEnd ? endDate : monthEnd;
  if (rangeStart > rangeEnd) {
    return [];
  }

  const dateKeys: string[] = [];
  const cursor = new Date(rangeStart);
  while (cursor <= rangeEnd) {
    dateKeys.push(formatDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dateKeys;
};

const isMultiDayEvent = (event: CalendarEvent, visibleMonth: string) => getEventDateKeys(event, visibleMonth).length > 1;

const buildMultiDayEventBars = (days: Array<Date | null>, eventsByDate: Record<string, CalendarEvent[]>, visibleMonth: string) => {
  const uniqueEvents = new Map<string, CalendarEvent>();

  Object.values(eventsByDate).flat().forEach((event) => {
    if (!isMultiDayEvent(event, visibleMonth)) {
      return;
    }

    const eventKey = `${event.calendarId ?? 'calendar'}-${event.id}`;
    if (!uniqueEvents.has(eventKey)) {
      uniqueEvents.set(eventKey, event);
    }
  });

  const occupiedRowsByWeek = new Map<number, Array<{ endColumn: number; row: number }>>();
  const bars: MultiDayEventBar[] = [];

  uniqueEvents.forEach((event) => {
    const dateKeys = getEventDateKeys(event, visibleMonth);
    const indexes = dateKeys
      .map((dateKey) => days.findIndex((day) => day && formatDate(day) === dateKey))
      .filter((index) => index >= 0);

    if (indexes.length <= 1) {
      return;
    }

    let segmentStart = 0;
    while (segmentStart < indexes.length) {
      const startIndex = indexes[segmentStart];
      const weekIndex = Math.floor(startIndex / 7);
      let segmentEnd = segmentStart;

      while (segmentEnd + 1 < indexes.length && Math.floor(indexes[segmentEnd + 1] / 7) === weekIndex) {
        segmentEnd += 1;
      }

      const endIndex = indexes[segmentEnd];
      const startColumn = (startIndex % 7) + 1;
      const endColumn = (endIndex % 7) + 1;
      const weekRows = occupiedRowsByWeek.get(weekIndex) ?? [];
      let row = 0;

      while (weekRows.some((item) => item.row === row && startColumn <= item.endColumn)) {
        row += 1;
      }

      weekRows.push({ endColumn, row });
      occupiedRowsByWeek.set(weekIndex, weekRows);

      bars.push({
        calendarColor: event.calendarColor,
        calendarId: event.calendarId,
        event,
        row,
        span: endColumn - startColumn + 1,
        startColumn,
        weekIndex,
      });

      segmentStart = segmentEnd + 1;
    }
  });

  return bars;
};

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
        <div className="mt-8 rounded-[2rem] border border-slate-100 bg-white/80 p-4 shadow-sm sm:p-6">
          <div className="mb-5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => {
                  setMonth((current) => shiftMonthValue(current, -1));
                  setLeaveStatuses({});
                }}
                aria-label="前月を表示"
                className="mt-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-black text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-600"
              >
                ←
              </button>
            </div>
            <div className="min-w-0 text-center">
              <h3 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">{month.replace('-', '年')}月のカレンダー</h3>
              <p className="mt-2 text-xs font-bold text-slate-400">
                {isGoogleConnected
                  ? calendarLoading
                    ? 'Googleカレンダーを同期中です。'
                    : selectedCalendars.length > 0
                      ? `${selectedCalendars.length}件のGoogleカレンダーを表示しています。`
                      : 'Googleカレンダーの予定を表示しています。'
                  : 'Googleログインすると、ここに Googleカレンダーの予定も表示されます。'}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setMonth((current) => shiftMonthValue(current, 1));
                  setLeaveStatuses({});
                }}
                aria-label="次月を表示"
                className="mt-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-black text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-600"
              >
                →
              </button>
            </div>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {WEEK_LABELS.map((label) => (
                <div key={label} className="px-1 pb-1 text-center text-[9px] font-black uppercase tracking-[0.12em] text-slate-400 sm:px-2 sm:pb-2 sm:text-[10px] sm:tracking-[0.2em]">
                  {label}
                </div>
              ))}
            </div>
            {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => {
              const weekDays = calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7);
              const weekBars = multiDayEventBars.filter((bar) => bar.weekIndex === weekIndex);
              const barRows = weekBars.length > 0 ? Math.max(...weekBars.map((bar) => bar.row)) + 1 : 0;

              return (
                <div key={`week-${weekIndex}`} className="space-y-0">
                  {barRows > 0 && (
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
                  )}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {weekDays.map((date, index) => {
                      if (!date) {
                        return <div key={`empty-${weekIndex}-${index}`} className="h-14 rounded-[1.1rem] bg-transparent sm:h-18 sm:rounded-2xl" />;
                      }

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
                          onClick={() => openDateDetail(date)}
                          className={`h-18 w-full min-w-0 rounded-[0.95rem] border px-1 pt-1 pb-1 text-center transition sm:h-24 sm:rounded-[1.35rem] sm:px-2 sm:pt-2 sm:pb-2 ${stateClass} cursor-pointer active:scale-[0.98]`}
                        >
                          <div className="flex h-full min-w-0 flex-col items-center overflow-hidden">
                            <span className="shrink-0 truncate text-[11px] font-black leading-none sm:text-xs">{date.getDate()}</span>
                            <span className="mt-1 block truncate text-center text-[8px] leading-tight font-bold opacity-80 sm:text-[10px]">
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
                    })}
                  </div>
                </div>
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

      <form onSubmit={handleCalculate} className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="space-y-2">
          <label className="ml-1 text-xs font-black uppercase tracking-widest text-gray-400">対象月</label>
          <input
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setLeaveStatuses({});
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
