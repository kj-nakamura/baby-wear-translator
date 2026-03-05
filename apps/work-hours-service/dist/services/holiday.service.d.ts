import { HolidayData } from '../types/index.js';
export declare class HolidayService {
    /**
     * 祝日データを取得します（キャッシュがあればそれを返し、なければ外部APIから取得）。
     */
    getHolidays(): Promise<HolidayData>;
    /**
     * 特定の日付が「年末年始（12/29〜1/3）」かどうかを判定します。
     */
    isYearEndNewYear(date: Date): boolean;
}
export declare const holidayService: HolidayService;
