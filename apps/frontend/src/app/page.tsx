'use client';

import React, { useState } from 'react';
import RecommendationForm from '@/components/RecommendationForm';
import RecommendationResult from '@/components/RecommendationResult';
import { useMilestones } from '@/hooks/useMilestones';

export default function Home() {
  const [selectedShop, setSelectedShop] = useState('nishimatsuya');
  const { data, loading, error, fetchMilestones } = useMilestones();

  const handleSubmit = (birthDate: string, targetShop: string) => {
    setSelectedShop(targetShop);
    fetchMilestones(birthDate, targetShop);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      {/* ページヘッダー */}
      <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <span className="text-3xl animate-bounce-slow">🍼</span>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 leading-tight">
              Baby Wear Translator
            </h1>
            <p className="text-xs font-bold text-gray-400">成長に合わせたコーディネートを提案</p>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-2xl px-4 py-8 space-y-12">
        {/* 入力フォームセクション */}
        <section className="relative">
          <div className="absolute -top-6 -left-2 text-xs font-black uppercase tracking-widest text-blue-200 select-none">
            Setting
          </div>
          <RecommendationForm onSubmit={handleSubmit} />
        </section>

        {/* エラー */}
        {error && !loading && (
          <div className="flex items-start gap-4 rounded-3xl border border-red-100 bg-red-50/50 p-6 text-red-700 backdrop-blur-sm">
            <span className="mt-0.5 text-2xl">🚨</span>
            <div>
              <p className="font-black">通信エラー</p>
              <p className="mt-1 text-sm font-medium opacity-80">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-xs font-bold underline decoration-2 underline-offset-4"
              >
                再読み込みしてリトライ
              </button>
            </div>
          </div>
        )}

        {/* 結果表示 */}
        {data && (
          <section className="relative transition-all duration-500">
            <div className="absolute -top-6 -left-2 text-xs font-black uppercase tracking-widest text-indigo-200 select-none">
              Milestones
            </div>
            <div className={loading ? 'opacity-40 grayscale-[0.5] pointer-events-none blur-[1px] transition-all duration-300' : 'transition-all duration-300'}>
              <RecommendationResult result={data} shopName={selectedShop} />
            </div>

            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20">
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-600" />
                  <div className="absolute inset-0 flex items-center justify-center text-xl">👶</div>
                </div>
                <p className="text-sm font-black text-blue-600 animate-pulse bg-white/80 px-4 py-1 rounded-full shadow-sm backdrop-blur-sm">
                  マイルストーンを更新中…
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* フッター */}
      <footer className="mt-20 border-t border-gray-100 py-10 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-2">
          Baby Wear Translator
        </p>
        <p className="text-xs font-bold text-gray-400">
          娘の毎日を、もっと快適に 👶
        </p>
      </footer>
    </div>
  );
}
