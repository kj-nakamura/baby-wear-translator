'use client';

import React from 'react';
import { components } from '@/types/openapi';

type RecommendationResponse = components['schemas']['RecommendationResponse'];
type Item = components['schemas']['Item'];

interface RecommendationResultProps {
    result: RecommendationResponse;
    shopName: string;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
    コンビ肌着: { label: 'インナー', emoji: '👶', color: '#FFF3E0' },
    短肌着: { label: 'インナー', emoji: '👶', color: '#FFF3E0' },
    長肌着: { label: 'インナー', emoji: '👶', color: '#FFF3E0' },
    ロンパース: { label: 'ミドル', emoji: '🧸', color: '#E3F2FD' },
    カバーオール: { label: 'アウター', emoji: '🧥', color: '#EDE7F6' },
    プレオール: { label: 'アウター', emoji: '🧥', color: '#EDE7F6' },
    フリース: { label: 'アウター', emoji: '🧥', color: '#EDE7F6' },
    ダウン: { label: 'アウター', emoji: '🧥', color: '#EDE7F6' },
    防寒ウェア: { label: 'アウター', emoji: '🧥', color: '#EDE7F6' },
    アウター: { label: 'アウター', emoji: '🧥', color: '#EDE7F6' },
};

function getItemMeta(universalName: string) {
    for (const key of Object.keys(CATEGORY_LABELS)) {
        if (universalName.includes(key)) {
            return CATEGORY_LABELS[key];
        }
    }
    return { label: 'アイテム', emoji: '👕', color: '#F3F4F6' };
}

const SHOP_DISPLAY_NAMES: Record<string, string> = {
    nishimatsuya: '西松屋',
    uniqlo: 'ユニクロ',
    akachan_honpo: 'アカチャンホンポ',
};

const ItemCard: React.FC<{ item: Item; shopName: string; index: number }> = ({
    item,
    shopName,
    index,
}) => {
    const meta = getItemMeta(item.universal_name);
    const displayShopName = SHOP_DISPLAY_NAMES[shopName] ?? shopName;

    return (
        <div
            className="relative flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* レイヤー番号バッジ */}
            <div className="absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow">
                {index + 1}
            </div>

            {/* カテゴリバッジ */}
            <span
                className="inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-gray-700"
                style={{ backgroundColor: meta.color }}
            >
                {meta.emoji} {meta.label}
            </span>

            {/* 汎用名 */}
            <p className="text-lg font-bold text-gray-900 leading-snug">{item.universal_name}</p>

            {/* ショップ固有名 */}
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                <span className="text-xs font-medium text-gray-500">{displayShopName}での呼び名</span>
                <span className="ml-auto text-sm font-semibold text-blue-700">{item.shop_specific_name}</span>
            </div>
        </div>
    );
};

const RecommendationResult: React.FC<RecommendationResultProps> = ({ result, shopName }) => {
    return (
        <div className="w-full animate-fade-in">
            {/* ヘッダー */}
            <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 p-5 text-white shadow">
                <span className="text-4xl">🍼</span>
                <div>
                    <p className="text-sm font-medium opacity-80">現在の月齢</p>
                    <p className="text-2xl font-extrabold tracking-tight">
                        生後 <span className="text-4xl">{result.age_in_months}</span> ヶ月
                    </p>
                </div>
            </div>

            {/* アイテム件数バナー */}
            {result.items.length === 0 ? (
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-center text-yellow-800">
                    <p className="text-2xl">😅</p>
                    <p className="mt-1 font-semibold">この気温と月齢に合うアイテムが見つかりませんでした。</p>
                </div>
            ) : (
                <>
                    <p className="mb-4 text-sm font-medium text-gray-500">
                        今日のおすすめコーディネート — {result.items.length} アイテム
                    </p>
                    <div className="flex flex-col gap-4">
                        {result.items.map((item, idx) => (
                            <ItemCard key={idx} item={item} shopName={shopName} index={idx} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default RecommendationResult;
