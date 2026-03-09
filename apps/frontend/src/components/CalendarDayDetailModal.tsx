'use client';

import React from 'react';
import Modal from '@/components/Modal';

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

type SelectedDateDetail = {
  date: Date;
  dateKey: string;
};

type CalendarDayDetailModalProps = {
  canEditLeaveStatus: boolean;
  closeDateDetail: () => void;
  formatEventTime: (event: CalendarEvent) => string;
  formatFullDate: (date: Date) => string;
  selectedDateDetail: SelectedDateDetail;
  selectedDateEvents: CalendarEvent[];
  selectedDateIsHoliday: boolean;
  selectedDateIsWeekend: boolean;
  selectedLeaveStatus: LeaveStatus;
  setLeaveStatusForDate: (status: LeaveStatus) => void;
};

const CalendarDayDetailModal: React.FC<CalendarDayDetailModalProps> = ({
  canEditLeaveStatus,
  closeDateDetail,
  formatEventTime,
  formatFullDate,
  selectedDateDetail,
  selectedDateEvents,
  selectedDateIsHoliday,
  selectedDateIsWeekend,
  selectedLeaveStatus,
  setLeaveStatusForDate,
}) => (
  <Modal onClose={closeDateDetail} maxWidthClassName="max-w-2xl">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-500">Day Detail</p>
        <h3 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">
          {formatFullDate(selectedDateDetail.date)}
        </h3>
        <p className="mt-2 text-xs font-bold text-slate-400">
          現在の勤務状態: {selectedLeaveStatus === 'paid' ? '有給' : selectedLeaveStatus === 'half' ? '半休' : selectedDateIsWeekend || selectedDateIsHoliday ? '休日' : '勤務'}
        </p>
      </div>
      <button
        type="button"
        onClick={closeDateDetail}
        aria-label="モーダルを閉じる"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-lg font-black text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
      >
        ×
      </button>
    </div>

    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div className="rounded-[1.5rem] border border-amber-100 bg-amber-50/70 p-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">勤務ステータス</p>
        {canEditLeaveStatus ? (
          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => setLeaveStatusForDate('working')}
              className={`rounded-2xl px-4 py-3 text-left text-sm font-black transition ${selectedLeaveStatus === 'working' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
            >
              通常勤務
            </button>
            <button
              type="button"
              onClick={() => setLeaveStatusForDate('paid')}
              className={`rounded-2xl px-4 py-3 text-left text-sm font-black transition ${selectedLeaveStatus === 'paid' ? 'bg-amber-500 text-white' : 'bg-white text-amber-700 hover:bg-amber-100'}`}
            >
              有給
            </button>
            <button
              type="button"
              onClick={() => setLeaveStatusForDate('half')}
              className={`rounded-2xl px-4 py-3 text-left text-sm font-black transition ${selectedLeaveStatus === 'half' ? 'bg-orange-500 text-white' : 'bg-white text-orange-700 hover:bg-orange-100'}`}
            >
              半休
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm font-bold leading-7 text-amber-700">
            土日と祝日は勤務状態を変更できません。
          </p>
        )}
      </div>

      <div className="rounded-[1.5rem] border border-sky-100 bg-sky-50/60 p-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-600">Google Calendar</p>
        {selectedDateEvents.length > 0 ? (
          <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
            {selectedDateEvents.map((event) => (
              <div key={`${event.calendarId ?? 'calendar'}-${event.id}`} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: event.calendarColor ?? '#38bdf8' }}
                  />
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    {event.calendarName ?? 'Google Calendar'}
                  </p>
                </div>
                <p className="mt-3 text-sm font-black leading-6 text-slate-900">
                  {event.title}
                </p>
                <p className="mt-2 text-xs font-bold text-slate-500">
                  {formatEventTime(event)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm font-bold leading-7 text-sky-800">
            この日の Google カレンダー予定はありません。
          </p>
        )}
      </div>
    </div>
  </Modal>
);

export default CalendarDayDetailModal;
