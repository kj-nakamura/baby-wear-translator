import type { CalendarEvent, MultiDayEventBar } from '@/components/work/types';

export const WEEK_LABELS = ['日', '月', '火', '水', '木', '金', '土'];
const JST_TIME_ZONE = 'Asia/Tokyo';

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateKey = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatMonthDay = (dateKey: string) => {
  const [, month, day] = dateKey.split('-');
  return `${month}/${day}`;
};

export const formatFullDate = (date: Date) => {
  const weekDay = WEEK_LABELS[date.getDay()];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 (${weekDay})`;
};

export const formatEventTime = (event: CalendarEvent) => {
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

export const buildCalendarDays = (month: string) => {
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

export const getCurrentMonthValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
};

export const shiftMonthValue = (value: string, diff: number) => {
  const [year, month] = value.split('-').map(Number);
  const date = new Date(year, month - 1 + diff, 1);
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
};

export const getEventDateKeys = (event: CalendarEvent, visibleMonth: string) => {
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

export const isMultiDayEvent = (event: CalendarEvent, visibleMonth: string) => getEventDateKeys(event, visibleMonth).length > 1;

export const buildMultiDayEventBars = (
  days: Array<Date | null>,
  eventsByDate: Record<string, CalendarEvent[]>,
  visibleMonth: string
) => {
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
