'use client';

import React, { useState } from 'react';
import { MilestoneResponse, Milestone } from '@/hooks/useMilestones';

interface RecommendationResultProps {
    result: MilestoneResponse;
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

const MilestoneCard: React.FC<{ milestone: Milestone; isSelected: boolean; onClick: () => void }> = ({
    milestone,
    isSelected,
    onClick,
}) => {
    return (
        <div
            onClick={onClick}
            className={`flex-shrink-0 w-32 cursor-pointer transition-all duration-300 ${isSelected ? 'scale-110' : 'opacity-60 hover:opacity-100'
                }`}
        >
            <div className={`h-1 mx-auto mb-4 ${isSelected ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className="text-center">
                <p className={`text-xs font-bold ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                    {milestone.target_date}
                </p>
                <p className="text-[10px] text-gray-400">{milestone.items.length === 0 ? '予定' : `${milestone.age_in_months}ヶ月`}</p>
            </div>
        </div>
    );
};

const RecommendationResult: React.FC<RecommendationResultProps> = ({ result, shopName }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedMilestone = result.milestones[selectedIndex];

    if (!selectedMilestone) return null;

    const isInitial = selectedMilestone.items.length === 0;

    return (
        <div className="w-full space-y-8 animate-fade-in">
            {/* タイムライン (横スクロール) */}
            <div className="relative pb-4">
                <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar scroll-smooth px-4">
                    {result.milestones.map((m, idx) => (
                        <MilestoneCard
                            key={idx}
                            milestone={m}
                            isSelected={idx === selectedIndex}
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
                                const meta = getItemMeta(item.universal_name);
                                return (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group"
                                    >
                                        <div
                                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-sm"
                                            style={{ backgroundColor: meta.color }}
                                        >
                                            {meta.emoji}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                                                {meta.label}
                                            </p>
                                            <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {item.shop_specific_name}
                                            </h4>
                                            <p className="text-xs text-gray-400">汎用名: {item.universal_name}</p>
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
        </div>
    );
};

export default RecommendationResult;
