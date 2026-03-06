"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.holidayService = exports.HolidayService = void 0;
const axios_1 = __importDefault(require("axios"));
const node_cache_1 = __importDefault(require("node-cache"));
// キャッシュ時間: 6時間 (21600秒)
const cache = new node_cache_1.default({ stdTTL: 21600 });
const HOLIDAY_CACHE_KEY = 'holidays';
const HOLIDAYS_API_URL = 'https://holidays-jp.github.io/api/v1/date.json';
class HolidayService {
    /**
     * 祝日データを取得します（キャッシュがあればそれを返し、なければ外部APIから取得）。
     */
    async getHolidays() {
        const cachedData = cache.get(HOLIDAY_CACHE_KEY);
        if (cachedData) {
            return cachedData;
        }
        try {
            const response = await axios_1.default.get(HOLIDAYS_API_URL);
            const holidaysData = response.data;
            cache.set(HOLIDAY_CACHE_KEY, holidaysData);
            return holidaysData;
        }
        catch (error) {
            console.error('祝日データの取得に失敗しました:', error);
            // エラー時でも最小限の空データを返すか、例外を投げる
            return {};
        }
    }
    /**
     * 特定の日付が「年末年始（12/29〜1/3）」かどうかを判定します。
     */
    isYearEndNewYear(date) {
        const month = date.getMonth() + 1; // 1-indexed
        const day = date.getDate();
        return (month === 12 && day >= 29) || (month === 1 && day <= 3);
    }
}
exports.HolidayService = HolidayService;
exports.holidayService = new HolidayService();
