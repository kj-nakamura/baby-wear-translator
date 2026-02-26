'use client';

import React, { useState } from 'react';
import { MilestoneResponse, Milestone } from '@/hooks/useMilestones';

interface RecommendationResultProps {
    result: MilestoneResponse;
}

const MilestoneCard: React.FC<{ milestone: Milestone; isSelected: boolean; onClick: () => void }> = ({
    milestone,
    isSelected,
    onClick,
}) => {
    return (
        <div
            onClick={onClick}
            className={`flex-shrink-0 w-32 cursor-pointer transition-all duration-300 ${isSelected ? 'scale-105' : 'opacity-60 hover:opacity-100'
                }`}
        >
            <div className={`h-1 mx-auto mb-4 rounded-full ${isSelected ? 'bg-blue-600 w-full' : 'bg-gray-200 w-1/2'}`} />
            <div className="text-center">
                <p className={`text-xs font-bold ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                    {milestone.target_date}
                </p>
                <p className="text-[10px] text-gray-400">{milestone.items.length === 0 ? '予定' : `${milestone.age_in_months}ヶ月`}</p>
            </div>
        </div>
    );
};

// ショップ名を表示するためのフレンドリーな名前マップ
const SHOP_DISPLAY_NAMES: Record<string, string> = {
    'nishimatsuya': '西松屋',
    'uniqlo': 'ユニクロ',
    'akachan_honpo': 'アカチャンホンポ',
};

const RecommendationResult: React.FC<RecommendationResultProps> = ({ result }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedItem, setSelectedItem] = useState<Milestone['items'][0] | null>(null);

    // 検索結果（result）が更新されたら、選択を一番左（現在月）にリセットする
    React.useEffect(() => {
        setSelectedIndex(0);
    }, [result]);

    // 現在日付の月次開始日を取得
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 現在の月以降のマイルストーンのみを表示対象とする
    const displayedMilestones = result.milestones.filter(m => {
        const d = new Date(m.target_date);
        return d >= currentMonthStart;
    });

    const activeIndex = selectedIndex >= displayedMilestones.length ? 0 : selectedIndex;
    const selectedMilestone = displayedMilestones[activeIndex];

    if (!selectedMilestone) return null;

    const isInitial = selectedMilestone.items.length === 0;

    return (
        <div className="w-full space-y-8 animate-fade-in">
            {/* タイムライン (横スクロール) */}
            <div className="relative pb-4">
                <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar scroll-smooth px-4">
                    {displayedMilestones.map((m, idx) => (
                        <MilestoneCard
                            key={idx}
                            milestone={m}
                            isSelected={idx === activeIndex}
                            onClick={() => setSelectedIndex(idx)}
                        />
                    ))}
                </div>
                {/* 指示器 */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 -z-10" />
            </div>

            {/* 詳細表示区域 */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-500 p-6 text-white text-center">
                    <div className="flex justify-center items-center gap-4 mb-2">
                        <span className="text-4xl">{isInitial ? '🗓️' : '🍼'}</span>
                        <div className="text-left">
                            <p className="text-sm font-medium opacity-80">
                                {isInitial ? '未来の成長ライン' : `生後 ${selectedMilestone.age_in_months} ヶ月頃`}
                            </p>
                            <h3 className="text-2xl font-black">
                                {selectedMilestone.target_date} {isInitial ? 'の予定' : 'のおすすめ'}
                            </h3>
                        </div>
                    </div>
                    <div className="inline-block bg-white/20 backdrop-blur-md rounded-full px-4 py-1 text-sm font-bold">
                        {isInitial ? '📏 サイズをチェック' : `📏 目安サイズ: ${selectedMilestone.size}`}
                    </div>
                </div>

                <div className="p-6">
                    {selectedMilestone.items.length > 0 ? (
                        <div className="grid gap-4">
                            {selectedMilestone.items.map((item, idx) => {
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedItem(item)}
                                        className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:shadow-lg hover:border-blue-100 transition-all group cursor-pointer"
                                    >
                                        <div
                                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-sm group-hover:scale-110 transition-transform"
                                            style={{ backgroundColor: item.category_color }}
                                        >
                                            {item.category_emoji}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                                                {item.category_label}
                                            </p>
                                            <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {item.universal_name}
                                            </h4>
                                            <p className="text-xs text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                <span>ショップごとの名称を見る</span>
                                                <span className="text-[10px]">▶</span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 px-4 space-y-4">
                            <div className="text-4xl">⌨️</div>
                            <div>
                                <p className="text-lg font-bold text-gray-900">生年月日を入力してください</p>
                                <p className="text-sm text-gray-500">
                                    上のフォームから誕生日を入力して「表示する」を押すと、<br />
                                    その時期にぴったりのベビー服が表示されます。
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ショップ名表示モーダル */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                        onClick={() => setSelectedItem(null)}
                    />
                    <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                        <div
                            className="p-8 text-center relative overflow-hidden"
                            style={{ backgroundColor: selectedItem.category_color || '#F3F4F6' }}
                        >
                            {/* 装飾用背景パターン */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none select-none text-[100px] flex items-center justify-center">
                                {selectedItem.category_emoji}
                            </div>

                            <div className="relative z-10 space-y-2">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/90 rounded-3xl shadow-inner text-4xl mb-2 animate-bounce-slow">
                                    {selectedItem.category_emoji}
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 leading-tight">{selectedItem.universal_name}</h3>
                                <div className="inline-block px-3 py-1 bg-gray-900/5 rounded-full">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{selectedItem.category_label}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm font-bold text-gray-400 border-b pb-2">ショップごとの名称</p>
                            <div className="space-y-4">
                                {selectedItem.shop_names && selectedItem.shop_names.length > 0 ? (
                                    selectedItem.shop_names.map((sn, idx) => (
                                        <div key={idx} className="flex justify-between items-center group">
                                            <div className="text-sm font-bold text-gray-500">
                                                {SHOP_DISPLAY_NAMES[sn.shop_key] || sn.shop_key}
                                            </div>
                                            <div className="text-md font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {sn.shop_name}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-sm font-bold text-gray-400">データがありません</p>
                                        <p className="text-[10px] text-gray-400 mt-1">サーバーを再起動して最新の情報を反映してください</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="w-full mt-6 bg-gray-900 text-white font-black py-3 rounded-2xl hover:bg-gray-800 transition-all active:scale-95"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecommendationResult;
