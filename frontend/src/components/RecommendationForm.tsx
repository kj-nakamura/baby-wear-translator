'use client';

import React, { useState } from 'react';

interface RecommendationFormProps {
  onSubmit: (birthDate: string, currentTemp: number, targetShop: string) => void;
}

const RecommendationForm: React.FC<RecommendationFormProps> = ({ onSubmit }) => {
  const [birthDate, setBirthDate] = useState('');
  const [currentTemp, setCurrentTemp] = useState('20');
  const [targetShop, setTargetShop] = useState('nishimatsuya');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(birthDate, parseFloat(currentTemp), targetShop);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4 text-black">
      <div>
        <label className="block text-sm font-medium text-gray-700">赤ちゃんの生年月日</label>
        <input
          type="date"
          required
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">現在の気温 (℃)</label>
        <input
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
        type="submit"
        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
      >
        おすすめを提案してもらう
      </button>
    </form>
  );
};

export default RecommendationForm;
