'use client';

import React, { useState } from 'react';

interface RecommendationFormProps {
  onSubmit: (birthDate: string, currentTemp: number, targetShop: string) => void;
}

// 今日の日付を YYYY-MM-DD 形式で返す（inputの max 属性に使用）
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 今日の日付を YYYY-MM-DD 形式で返す（inputの max 属性に使用）
function todayString(): string {
  return formatDate(new Date());
}

// 6ヶ月前の日付を YYYY-MM-DD 形式で返す
function sixMonthsAgoString(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return formatDate(d);
}

const RecommendationForm: React.FC<RecommendationFormProps> = ({ onSubmit }) => {
  const [birthDate, setBirthDate] = useState(sixMonthsAgoString());
  const [currentTemp, setCurrentTemp] = useState('20');
  const [targetShop, setTargetShop] = useState('nishimatsuya');
  const [dateError, setDateError] = useState('');

  const today = todayString();

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBirthDate(value);

    if (value && value > today) {
      setDateError('生年月日は今日以前の日付を入力してください。');
    } else {
      setDateError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // submit 時にも再チェック
    if (birthDate > today) {
      setDateError('生年月日は今日以前の日付を入力してください。');
      return;
    }

    onSubmit(birthDate, parseFloat(currentTemp), targetShop);
  };

  const hasDateError = !!dateError;

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4 text-black">
      <div>
        <label className="block text-sm font-medium text-gray-700">赤ちゃんの生年月日</label>
        <input
          id="birth-date-input"
          type="date"
          required
          max={today}
          value={birthDate}
          onChange={handleBirthDateChange}
          className={`mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 ${hasDateError
            ? 'border-red-400 focus:ring-red-400 bg-red-50'
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
        />
        {hasDateError && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <span>⚠️</span> {dateError}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">現在の気温 (℃)</label>
        <input
          id="current-temp-input"
          type="number"
          step="0.1"
          required
          value={currentTemp}
          onChange={(e) => setCurrentTemp(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">よく行くショップ</label>
        <select
          id="target-shop-select"
          value={targetShop}
          onChange={(e) => setTargetShop(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="nishimatsuya">西松屋</option>
          <option value="uniqlo">ユニクロ</option>
          <option value="akachan_honpo">アカチャンホンポ</option>
        </select>
      </div>

      <button
        id="submit-button"
        type="submit"
        disabled={hasDateError}
        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        おすすめを提案してもらう
      </button>
    </form>
  );
};

export default RecommendationForm;
