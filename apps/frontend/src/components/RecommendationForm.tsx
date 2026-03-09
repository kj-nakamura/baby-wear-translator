'use client';

import React, { useEffect } from 'react';

interface RecommendationFormProps {
  onSubmit: (birthDate: string) => void;
  birthDate: string;
  onBirthDateChange: (birthDate: string) => void;
}

const BIRTH_DATE_STORAGE_KEY = 'baby-wear-translator.birth-date';
const DEFAULT_BIRTH_DATE = '2025-10-23';

// 日付を YYYY-MM-DD 形式で返す
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 今日の日付を YYYY-MM-DD 形式で返す
function todayString(): string {
  return formatDate(new Date());
}

export function getInitialBirthDate(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_BIRTH_DATE;
  }

  return window.localStorage.getItem(BIRTH_DATE_STORAGE_KEY) ?? DEFAULT_BIRTH_DATE;
}

const RecommendationForm: React.FC<RecommendationFormProps> = ({ birthDate, onBirthDateChange, onSubmit }) => {
  useEffect(() => {
    window.localStorage.setItem(BIRTH_DATE_STORAGE_KEY, birthDate);
  }, [birthDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(birthDate);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4 text-black">
      <div>
        <label className="block text-sm font-medium text-gray-700">赤ちゃんの生年月日</label>
        <input
          suppressHydrationWarning
          id="birth-date-input"
          type="date"
          required
          max={todayString()}
          value={birthDate}
          onChange={(e) => onBirthDateChange(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">誕生日から2歳までの成長計画を表示します</p>
        <div className="mt-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          <span className="font-semibold">現在設定されている誕生日:</span>{' '}
          <span className="font-mono">{birthDate}</span>
        </div>
      </div>

      <button
        id="submit-button"
        type="submit"
        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
      >
        成長計画を表示する
      </button>
    </form>
  );
};

export default RecommendationForm;
