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

        {/* ローディング */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-gray-500">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
              <div className="absolute inset-0 flex items-center justify-center text-xl">👶</div>
            </div>
            <p className="text-sm font-bold animate-pulse text-blue-600">マイルストーンを生成中…</p>
          </div>
        )}

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
        {data && !loading && (
          <section className="relative">
            <div className="absolute -top-6 -left-2 text-xs font-black uppercase tracking-widest text-indigo-200 select-none">
              Milestones
            </div>
            <RecommendationResult result={data} shopName={selectedShop} />
          </section>
        )}

        {/* 初期状態のヒント */}
        {!data && !loading && !error && (
          <div className="flex flex-col items-center gap-6 py-16 text-center">
            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-inner text-5xl">
              ✨
            </div>
            <div className="space-y-2">
              <p className="text-lg font-black text-gray-900">
                あなたの赤ちゃんの成長ラインを<br />
                今すぐチェック
              </p>
              <p className="text-sm font-medium text-gray-400">
                生年月日を入力するだけで、2歳までの<br />
                おすすめコーディネートを自動生成します。
              </p>
            </div>
          </div>
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
