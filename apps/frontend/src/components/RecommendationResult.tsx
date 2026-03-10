'use client';

import React, { useMemo, useState } from 'react';
import Modal from '@/components/Modal';
import MonthCalendar from '@/components/calendar/MonthCalendar';
import { MilestoneResponse, Milestone } from '@/hooks/useMilestones';
import { buildCalendarDays, formatDate, getCurrentMonthValue } from '@/components/work/utils';

interface RecommendationResultProps {
    birthDate: string;
    onBirthDateChange: (birthDate: string) => void;
    result: MilestoneResponse;
}

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

const RecommendationResult: React.FC<RecommendationResultProps> = ({ birthDate, onBirthDateChange, result }) => {
    const [month, setMonth] = useState(getCurrentMonthValue);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedItem, setSelectedItem] = useState<Milestone['items'][0] | null>(null);
    const [isBirthDateModalOpen, setIsBirthDateModalOpen] = useState(false);
    const [draftBirthDate, setDraftBirthDate] = useState(birthDate);

    // 検索結果（result）が更新されたら、選択を一番左（現在月）にリセットする
    React.useEffect(() => {
        setSelectedIndex(0);
        setMonth(getCurrentMonthValue());
    }, [result]);

    React.useEffect(() => {
        setDraftBirthDate(birthDate);
    }, [birthDate]);

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

    const handleBirthDateSave = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onBirthDateChange(draftBirthDate);
        window.localStorage.setItem('baby-wear-translator.birth-date', draftBirthDate);
        setIsBirthDateModalOpen(false);
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
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                <p className="text-xs font-bold text-slate-500">
                                    現在設定されている誕生日: <span className="font-mono">{birthDate}</span>
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIsBirthDateModalOpen(true)}
                                    className="rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-[11px] font-black text-blue-600 transition hover:border-blue-300 hover:bg-white"
                                >
                                    誕生日を変更
                                </button>
                            </div>
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

            {/* ショップ名表示モーダル */}
            {selectedItem && (
                <Modal onClose={() => setSelectedItem(null)} maxWidthClassName="max-w-sm">
                    <div
                        className="relative -m-5 overflow-hidden rounded-t-[2rem] p-8 text-center sm:-m-6 sm:mb-0"
                        style={{ backgroundColor: selectedItem.category_color || '#F3F4F6' }}
                    >
                        <div className="absolute inset-0 flex select-none items-center justify-center text-[100px] opacity-10 pointer-events-none">
                            {selectedItem.category_emoji}
                        </div>

                        <div className="relative z-10 space-y-2">
                            <div className="mb-2 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/90 text-4xl shadow-inner animate-bounce-slow">
                                {selectedItem.category_emoji}
                            </div>
                            <h3 className="text-2xl font-black leading-tight text-gray-900">{selectedItem.universal_name}</h3>
                            <div className="inline-block rounded-full bg-gray-900/5 px-3 py-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{selectedItem.category_label}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <p className="border-b pb-2 text-sm font-bold text-gray-400">ショップごとの名称</p>
                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                aria-label="モーダルを閉じる"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-lg font-black text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-4">
                            {selectedItem.shop_names && selectedItem.shop_names.length > 0 ? (
                                selectedItem.shop_names.map((sn, idx) => (
                                    <div key={idx} className="group flex items-center justify-between">
                                        <div className="text-sm font-bold text-gray-500">
                                            {SHOP_DISPLAY_NAMES[sn.shop_key] || sn.shop_key}
                                        </div>
                                        <div className="text-md font-black text-gray-900 transition-colors group-hover:text-blue-600">
                                            {sn.shop_name}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-6 text-center">
                                    <p className="text-sm font-bold text-gray-400">データがありません</p>
                                    <p className="mt-1 text-[10px] text-gray-400">サーバーを再起動して最新の情報を反映してください</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            {isBirthDateModalOpen && (
                <Modal onClose={() => setIsBirthDateModalOpen(false)} maxWidthClassName="max-w-md">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-500">Birth Date</p>
                            <h3 className="mt-2 text-xl font-black text-slate-900">誕生日を設定</h3>
                            <p className="mt-2 text-sm font-bold text-slate-500">保存すると成長計画を自動で更新します。</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsBirthDateModalOpen(false)}
                            aria-label="モーダルを閉じる"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-lg font-black text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
                        >
                            ×
                        </button>
                    </div>
                    <form onSubmit={handleBirthDateSave} className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="birth-date-modal-input" className="block text-sm font-bold text-slate-700">
                                赤ちゃんの生年月日
                            </label>
                            <input
                                id="birth-date-modal-input"
                                type="date"
                                required
                                max={new Date().toISOString().slice(0, 10)}
                                value={draftBirthDate}
                                onChange={(event) => setDraftBirthDate(event.target.value)}
                                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                        >
                            この誕生日で更新
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default RecommendationResult;
