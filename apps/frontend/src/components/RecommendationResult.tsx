'use client';

import React from 'react';
import { RecommendationResponse } from '@/hooks/useRecommendation';

// バックエンドのレスポンスを拡張した型（other_shop_names を含む）
interface ExtendedItem {
    universal_name: string;
    shop_specific_name: string;
    other_shop_names?: Record<string, string>;
}

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

const ItemCard: React.FC<{ item: ExtendedItem; shopName: string; index: number }> = ({
    item,
    shopName,
    index,
}) => {
    const meta = getItemMeta(item.universal_name);
    const displayShopName = SHOP_DISPLAY_NAMES[shopName] ?? shopName;

    // other_shop_names を表示用に整形（shop_id → 表示名の順で並べる）
    const otherShops = Object.entries(item.other_shop_names ?? {}).map(([shopId, name]) => ({
        shopId,
        displayName: SHOP_DISPLAY_NAMES[shopId] ?? shopId,
        name,
    }));

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

            {/* 選択ショップでの呼び名（メイン） */}
            <div>
                <p className="text-xs font-medium text-gray-400 mb-0.5">{displayShopName}での名前</p>
                <p className="text-xl font-bold text-gray-900 leading-snug">{item.shop_specific_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">（汎用名: {item.universal_name}）</p>
            </div>

            {/* 他のショップでの呼び名 */}
            {otherShops.length > 0 && (
                <div className="border-t border-gray-100 pt-3 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        他のショップでは…
                    </p>
                    {otherShops.map(({ shopId, displayName, name }) => (
                        <div
                            key={shopId}
                            className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2"
                        >
                            <span className="text-xs font-medium text-gray-500 shrink-0">{displayName}</span>
                            <span className="ml-auto text-sm font-semibold text-indigo-600">{name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const RecommendationResult: React.FC<RecommendationResultProps> = ({ result, shopName }) => {
    return (
        <div className="w-full animate-fade-in">
            {/* ヘッダー */}
            <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 p-5 text-white shadow sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">🍼</span>
                    <div>
                        <p className="text-sm font-medium opacity-80">生後月齢</p>
                        <p className="text-2xl font-extrabold tracking-tight">
                            <span className="text-4xl">{result.age_in_months}</span> ヶ月頃
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 border-t border-white/20 pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
                    <span className="text-3xl">📏</span>
                    <div>
                        <p className="text-sm font-medium opacity-80">目安サイズ</p>
                        <p className="text-2xl font-extrabold tracking-tight">
                            {result.size}
                        </p>
                    </div>
                </div>
            </div>

            {/* アイテム一覧 */}
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
                            <ItemCard key={idx} item={item as ExtendedItem} shopName={shopName} index={idx} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default RecommendationResult;
