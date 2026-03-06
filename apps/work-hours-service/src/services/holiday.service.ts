import axios from 'axios';
import NodeCache from 'node-cache';
import { HolidayData } from '../types/index';

// キャッシュ時間: 6時間 (21600秒)
const cache = new NodeCache({ stdTTL: 21600 });
const HOLIDAY_CACHE_KEY = 'holidays';
const HOLIDAY_STALE_CACHE_KEY = 'holidays:stale';
const HOLIDAYS_API_URL = 'https://holidays-jp.github.io/api/v1/date.json';

export class HolidayService {
  private inFlightRequest: Promise<HolidayData> | null = null;

  /**
   * 祝日データを取得します（キャッシュがあればそれを返し、なければ外部APIから取得）。
   */
  async getHolidays(): Promise<HolidayData> {
    const cachedData = cache.get<HolidayData>(HOLIDAY_CACHE_KEY);
    if (cachedData) {
      return cachedData;
    }

    if (this.inFlightRequest) {
      return this.inFlightRequest;
    }

    this.inFlightRequest = this.fetchAndCacheHolidays();

    try {
      return await this.inFlightRequest;
    } finally {
      this.inFlightRequest = null;
    }
  }

  private async fetchAndCacheHolidays(): Promise<HolidayData> {
    try {
      const response = await axios.get<HolidayData>(HOLIDAYS_API_URL);
      const holidaysData = response.data;

      cache.set(HOLIDAY_CACHE_KEY, holidaysData);
      cache.set(HOLIDAY_STALE_CACHE_KEY, holidaysData, 60 * 60 * 24 * 30);

      return holidaysData;
    } catch (error) {
      console.error('祝日データの取得に失敗しました:', error);

      const staleData = cache.get<HolidayData>(HOLIDAY_STALE_CACHE_KEY);
      if (staleData) {
        return staleData;
      }

      return {};
    }
  }

  /**
   * 特定の日付が「年末年始（12/29〜1/3）」かどうかを判定します。
   */
  isYearEndNewYear(date: Date): boolean {
    const month = date.getMonth() + 1; // 1-indexed
    const day = date.getDate();
    return (month === 12 && day >= 29) || (month === 1 && day <= 3);
  }
}

export const holidayService = new HolidayService();
