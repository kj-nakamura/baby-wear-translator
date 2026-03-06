'use client';

import React, { useState } from 'react';
import { useWorkHours } from '@/hooks/useWorkHours';

const HOURS_PER_DAY = 8;

const WorkHoursSection: React.FC = () => {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [paidLeaveDays, setPaidLeaveDays] = useState('0');
  const { workHoursData, holidaysData, loading, error, fetchWorkHours } = useWorkHours();
  const paidLeaveHours = Math.max(0, Number(paidLeaveDays) || 0) * HOURS_PER_DAY;
  const adjustedWorkHours = workHoursData ? Math.max(0, workHoursData.workHours - paidLeaveHours) : 0;

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (month) {
      fetchWorkHours(month);
    }
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white/60 p-8 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
      <div className="mb-6 flex items-center gap-3">
        <span className="text-2xl">📅</span>
        <h2 className="text-lg font-black text-gray-800">稼働時間計算 (Work Hours)</h2>
      </div>

      <form onSubmit={handleCalculate} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)_auto] lg:items-end">
        <div className="flex-1 space-y-2">
          <label className="ml-1 text-xs font-black uppercase tracking-widest text-gray-400">対象月</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-4 py-3 text-sm font-bold text-gray-700 outline-none transition-all focus:border-blue-400 focus:bg-white"
            required
          />
        </div>
        <div className="flex-1 space-y-2">
          <label className="ml-1 text-xs font-black uppercase tracking-widest text-gray-400">有給日数</label>
          <div className="rounded-2xl border-2 border-emerald-50 bg-emerald-50/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                step="0.5"
                value={paidLeaveDays}
                onChange={(e) => setPaidLeaveDays(e.target.value)}
                className="w-full bg-transparent text-sm font-black text-emerald-700 outline-none"
              />
              <span className="shrink-0 text-xs font-black uppercase tracking-wider text-emerald-500">日</span>
            </div>
            <p className="mt-2 text-[10px] font-bold text-emerald-500/80">0.5 日単位で入力できます</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale lg:self-stretch"
        >
          {loading ? '計算中...' : '計算する'}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
          ⚠️ {error}
        </div>
      )}

      {workHoursData && (
        <div className="mt-8 grid gap-4 xl:grid-cols-[1.1fr_1.1fr_0.9fr]">
          <div className="rounded-2xl border border-emerald-50 bg-emerald-50/40 p-5">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-emerald-500">Adjusted Work Hours</p>
            <p className="text-3xl font-black text-emerald-600">
              {adjustedWorkHours} <span className="text-sm">時間</span>
            </p>
            <p className="mt-1 text-[10px] font-bold text-emerald-500 opacity-80">
              {workHoursData.workHours} - {paidLeaveHours} = {adjustedWorkHours}
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

          <div className="rounded-2xl border border-indigo-50 bg-indigo-50/30 p-5 xl:row-span-2">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-indigo-400">Excluded Holidays</p>
            {holidaysData && holidaysData.holidays.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {holidaysData.holidays.map((h, i) => (
                  <span key={i} className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-indigo-500 shadow-sm">
                    {h}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs font-bold text-indigo-400 opacity-60 italic">なし</p>
            )}
          </div>

          <div className="rounded-2xl border border-amber-50 bg-amber-50/60 p-5">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-amber-500">Paid Leave</p>
            <p className="text-3xl font-black text-amber-600">
              {Number(paidLeaveDays) || 0} <span className="text-sm">日</span>
            </p>
            <p className="mt-1 text-[10px] font-bold text-amber-500 opacity-80">
              {paidLeaveHours} 時間分を控除
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkHoursSection;
