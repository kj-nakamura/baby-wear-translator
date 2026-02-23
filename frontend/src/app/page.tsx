'use client';

import React, { useState } from 'react';
import RecommendationForm from '@/components/RecommendationForm';
import RecommendationResult from '@/components/RecommendationResult';
import { useRecommendation } from '@/hooks/useRecommendation';

export default function Home() {
  // ショップ名をフォームと結果両方で使うので、ここで管理する
  const [selectedShop, setSelectedShop] = useState('nishimatsuya');

  const { data, loading, error, fetchRecommendation } = useRecommendation();

  const handleSubmit = (birthDate: string, currentTemp: number, targetShop: string) => {
    setSelectedShop(targetShop);
    fetchRecommendation(birthDate, currentTemp, targetShop);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      {/* ページヘッダー */}
      <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <span className="text-3xl">🍼</span>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900 leading-tight">
              Baby Wear Translator
            </h1>
            <p className="text-xs text-gray-500">今日の気温に合った服を提案します</p>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        {/* 入力フォームセクション */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            条件を入力
          </h2>
          <RecommendationForm onSubmit={handleSubmit} />
        </section>

        {/* ローディング */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-500">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="text-sm font-medium">おすすめを計算中…</p>
          </div>
        )}

        {/* エラー */}
        {error && !loading && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <span className="mt-0.5 text-xl">⚠️</span>
            <div>
              <p className="font-semibold">エラーが発生しました</p>
              <p className="mt-1 text-sm">{error}</p>
              <p className="mt-1 text-xs text-red-500">
                バックエンドサーバー（localhost:8080）が起動しているか確認してください。
              </p>
            </div>
          </div>
        )}

        {/* 結果表示 */}
        {data && !loading && (
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
              今日のおすすめ
            </h2>
            <RecommendationResult result={data} shopName={selectedShop} />
          </section>
        )}

        {/* 初期状態のヒント */}
        {!data && !loading && !error && (
          <div className="flex flex-col items-center gap-3 py-10 text-center text-gray-400">
            <span className="text-5xl">👆</span>
            <p className="text-sm font-medium">
              生年月日・気温・ショップを入力して<br />「おすすめを提案してもらう」を押してください
            </p>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="mt-12 border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        Baby Wear Translator — 娘の毎日を、もっと快適に 👶
      </footer>
    </div>
  );
}
