'use client';

import React from 'react';
import Modal from '@/components/Modal';
import type { CalendarOption } from '@/components/work/types';

type CalendarSelectorModalProps = {
  calendarOptions: CalendarOption[];
  onClose: () => void;
  selectedCalendarIds: string[];
  toggleCalendarSelection: (calendarId: string) => void;
};

const CalendarSelectorModal: React.FC<CalendarSelectorModalProps> = ({
  calendarOptions,
  onClose,
  selectedCalendarIds,
  toggleCalendarSelection,
}) => (
  <Modal onClose={onClose} maxWidthClassName="max-w-lg">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="mt-2 text-xl font-black text-slate-900">表示するGoogleカレンダー</h3>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="モーダルを閉じる"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-lg font-black text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
      >
        ×
      </button>
    </div>

    <div className="mt-6 grid max-h-80 gap-2 overflow-y-auto pr-1">
      {calendarOptions.map((calendar) => {
        const checked = selectedCalendarIds.includes(calendar.id);

        return (
          <label
            key={calendar.id}
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition ${checked ? 'border-sky-300 bg-sky-50 text-slate-700' : 'border-sky-100 bg-white text-slate-500'}`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleCalendarSelection(calendar.id)}
              className="mt-0.5 h-4 w-4 rounded border-sky-300 text-sky-600 focus:ring-sky-400"
            />
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: calendar.color }} />
                <span className="truncate">
                  {calendar.name}
                  {calendar.isPrimary ? ' (メイン)' : ''}
                </span>
              </span>
              <span className="mt-1 block text-[11px] text-slate-400">
                権限: {calendar.accessRole}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  </Modal>
);

export default CalendarSelectorModal;
