'use client';

import React, { useMemo, useState } from 'react';
import MonthCalendar from '@/components/calendar/MonthCalendar';
import { MilestoneResponse, Milestone } from '@/hooks/useMilestones';
import { buildCalendarDays, formatDate, getCurrentMonthValue } from '@/components/work/utils';

interface RecommendationResultProps {
    birthDate: string;
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

const calculateAgeInMonths = (birthDate: string, targetDate: string) => {
    const birth = new Date(birthDate);
    const target = new Date(targetDate);

    if (Number.isNaN(birth.getTime()) || Number.isNaN(target.getTime())) {
        return null;
    }

    const months = (target.getFullYear() - birth.getFullYear()) * 12 + (target.getMonth() - birth.getMonth());
    return Math.max(0, months);
};

const RecommendationResult: React.FC<RecommendationResultProps> = ({ birthDate, result }) => {
    const [month, setMonth] = useState(getCurrentMonthValue);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedItem, setSelectedItem] = useState<Milestone['items'][0] | null>(null);

    // 検索結果（result）が更新されたら、選択を一番左（現在月）にリセットする
    React.useEffect(() => {
        setSelectedIndex(0);
        setMonth(getCurrentMonthValue());
    }, [result]);

    // 現在日付の月次開始日を取得
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 現在の月以降のマイルストーンのみを表示対象とする
    const displayedMilestones = result.milestones.filter(m => {
        const d = new Date(m.target_date);
        return d >= currentMonthStart;
    });
    const calendarDays = useMemo(() => buildCalendarDays(month), [month]);
    const milestonesByDate = useMemo(() => {
        return displayedMilestones.reduce<Record<string, Milestone>>((accumulator, milestone) => {
            accumulator[milestone.target_date] = milestone;
            return accumulator;
        }, {});
    }, [displayedMilestones]);
    const milestonesByMonth = useMemo(() => {
        return displayedMilestones.reduce<Record<string, Milestone>>((accumulator, milestone) => {
            accumulator[milestone.target_date.slice(0, 7)] = milestone;
            return accumulator;
        }, {});
    }, [displayedMilestones]);
    const visibleMonthDateKey = `${month}-01`;
    const visibleMonthMilestone = milestonesByMonth[month];
    const visibleMonthAge = calculateAgeInMonths(birthDate, visibleMonthMilestone?.target_date ?? visibleMonthDateKey);
    const visibleMonthSize = visibleMonthMilestone?.size ?? '未設定';

    const activeIndex = selectedIndex >= displayedMilestones.length ? 0 : selectedIndex;
    const selectedMilestone = displayedMilestones[activeIndex];

    if (!selectedMilestone) return null;

    const visibleMonthItems = visibleMonthMilestone?.items ?? [];
    const visibleMonthIsInitial = !visibleMonthMilestone || visibleMonthItems.length === 0;

    const handleMonthChange = (nextMonth: string) => {
        setMonth(nextMonth);

        const index = displayedMilestones.findIndex((milestone) => milestone.target_date.slice(0, 7) === nextMonth);
        if (index >= 0) {
            setSelectedIndex(index);
        }
    };

    return (
        <div className="w-full space-y-8 animate-fade-in">
            <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#eef2ff_45%,#ffffff_100%)] shadow-sm">
                <div className="border-b border-white/70 px-5 py-4 sm:px-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-500">Monthly Recommendation</p>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 sm:text-2xl">
                                {month.replace('-', '年')}月のおすすめ服
                            </h3>
                            <p className="mt-1 text-xs font-bold text-slate-500">
                                現在設定されている誕生日: <span className="font-mono">{birthDate}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-5 sm:px-6">
                    <div className="mb-4 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-400">Age</p>
                            <p className="mt-1 text-sm font-black text-slate-900">
                                {visibleMonthAge !== null ? `生後 ${visibleMonthAge} ヶ月頃` : '計算不可'}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-400">Size</p>
                            <p className="mt-1 text-sm font-black text-slate-900">
                                {visibleMonthSize}
                            </p>
                        </div>
                    </div>
                    {visibleMonthIsInitial ? (
                        <p className="text-sm font-bold leading-7 text-slate-600">
                            生年月日を入力すると、この月におすすめのベビー服がここに表示されます。
                        </p>
                    ) : (
                        <div className="space-y-5">


                            <div className="space-y-3">
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-500">
                                    おすすめの服
                                </p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {visibleMonthItems.map((item, idx) => (
                                        <button
                                            key={`${item.universal_name}-${idx}`}
                                            type="button"
                                            onClick={() => setSelectedItem(item)}
                                            className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/85 px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                        >
                                            <div
                                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-2xl"
                                                style={{ backgroundColor: item.category_color }}
                                            >
                                                {item.category_emoji}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-400">
                                                    {item.category_label}
                                                </p>
                                                <p className="truncate text-sm font-black text-slate-900">
                                                    {item.universal_name}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <MonthCalendar
                calendarDays={calendarDays}
                month={month}
                onMonthChange={handleMonthChange}
                title={`${month.replace('-', '年')}月の成長カレンダー`}
                subtitle="月ごとのおすすめサイズと服装候補を確認できます。"
                renderDay={(date) => {
                    const dateKey = formatDate(date);
                    const milestone = milestonesByDate[dateKey];
                    const isSelected = milestone && displayedMilestones[activeIndex]?.target_date === dateKey;

                    return (
                        <button
                            key={dateKey}
                            type="button"
                            onClick={() => {
                                const index = displayedMilestones.findIndex((item) => item.target_date === dateKey);
                                if (index >= 0) {
                                    setSelectedIndex(index);
                                }
                            }}
                            className={`h-18 w-full rounded-[0.95rem] border px-1 py-1 text-left transition sm:h-24 sm:rounded-[1.35rem] sm:px-2 sm:py-2 ${milestone ? (isSelected ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-sky-100 bg-sky-50/70 hover:border-blue-200 hover:bg-blue-50') : 'border-slate-100 bg-slate-50 text-slate-300'}`}
                        >
                            <div className="flex h-full flex-col">
                                <span className={`text-[11px] font-black leading-none sm:text-xs ${milestone ? 'text-slate-900' : 'text-slate-400'}`}>{date.getDate()}</span>
                                {milestone ? (
                                    <div className="mt-1 min-w-0">
                                        <p className="truncate text-[8px] font-black text-blue-600 sm:text-[9px]">
                                            {milestone.items.length === 0 ? '入力待ち' : `${milestone.age_in_months}ヶ月`}
                                        </p>
                                        <p className="mt-1 line-clamp-2 text-[8px] font-bold leading-tight text-slate-600 sm:text-[9px]">
                                            {milestone.items.length === 0 ? 'おすすめ準備前' : milestone.size}
                                        </p>
                                    </div>
                                ) : (
                                    <span className="mt-auto text-[8px] font-bold text-slate-300 sm:text-[9px]">-</span>
                                )}
                            </div>
                        </button>
                    );
                }}
            />

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
