'use client';

import React, { useState } from 'react';
import { useWorkHours } from '@/hooks/useWorkHours';

const WorkHoursSection: React.FC = () => {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const { workHoursData, holidaysData, loading, error, fetchWorkHours } = useWorkHours();

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

      <form onSubmit={handleCalculate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
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
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
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
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-blue-50 bg-blue-50/30 p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Total Work Hours</p>
            <p className="text-3xl font-black text-blue-600">
              {workHoursData.workHours} <span className="text-sm">時間</span>
            </p>
            <p className="mt-1 text-[10px] font-bold text-blue-400 opacity-80">
              (平日数 × 8時間)
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-50 bg-indigo-50/30 p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Excluded Holidays</p>
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
        </div>
      )}
    </div>
  );
};

export default WorkHoursSection;
