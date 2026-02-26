'use client';

import React, { useState } from 'react';

interface RecommendationFormProps {
  onSubmit: (birthDate: string) => void;
}

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

const RecommendationForm: React.FC<RecommendationFormProps> = ({ onSubmit }) => {
  const [birthDate, setBirthDate] = useState('2025-10-23');

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
          onChange={(e) => setBirthDate(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">誕生日から2歳までのマイルストーンを表示します</p>
      </div>

      <button
        id="submit-button"
        type="submit"
        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
      >
        マイルストーンを表示する
      </button>
    </form>
  );
};

export default RecommendationForm;
