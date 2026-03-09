export type LeaveStatus = 'working' | 'paid' | 'half';

export type CalendarEvent = {
  allDay: boolean;
  calendarColor?: string;
  calendarId?: string;
  calendarName?: string;
  end: string;
  id: string;
  start: string;
  title: string;
};

export type CalendarOption = {
  accessRole: string;
  color: string;
  id: string;
  isPrimary: boolean;
  name: string;
};

export type SelectedDateDetail = {
  date: Date;
  dateKey: string;
};

export type MultiDayEventBar = {
  calendarColor?: string;
  calendarId?: string;
  event: CalendarEvent;
  row: number;
  span: number;
  startColumn: number;
  weekIndex: number;
};

export type ExcludedDisplayDay = {
  key: string;
  label: string;
  type: 'holiday' | 'paid' | 'half';
};
