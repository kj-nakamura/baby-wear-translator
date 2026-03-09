'use client';

import React from 'react';
import type { ExcludedDisplayDay } from '@/components/work/types';

type WorkHoursSummaryProps = {
  adjustedWorkHours: number;
  excludedDisplayDays: ExcludedDisplayDay[];
  paidLeaveHours: number;
  totalWorkHours: number;
};

const WorkHoursSummary: React.FC<WorkHoursSummaryProps> = ({
  adjustedWorkHours,
  excludedDisplayDays,
  paidLeaveHours,
  totalWorkHours,
}) => (
  <div className="mt-6 space-y-4">
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-emerald-50 bg-emerald-50/40 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-emerald-500">Adjusted Work Hours</p>
        <p className="text-3xl font-black text-emerald-600">
          {adjustedWorkHours} <span className="text-sm">時間</span>
        </p>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-[10px] font-bold text-emerald-500 opacity-80">
          {totalWorkHours} - {paidLeaveHours} = {adjustedWorkHours}
        </p>
        <p className="mt-2 text-[10px] font-bold text-emerald-600">
          必須ライン: 140時間
        </p>
      </div>
    </div>

    <div className="flex w-full flex-col gap-3 rounded-2xl border border-indigo-50 bg-indigo-50/30 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="shrink-0">
        <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-indigo-400">Excluded Holidays</p>
      </div>
      {excludedDisplayDays.length > 0 ? (
        <div className="flex flex-wrap gap-2 sm:justify-end">
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
);

export default WorkHoursSummary;
