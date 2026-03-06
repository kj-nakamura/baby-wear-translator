import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { holidayService } from './holiday.service';

const cacheStore = new Map<string, unknown>();

vi.mock('node-cache', () => {
  return {
    default: class {
      get = vi.fn((key: string) => cacheStore.get(key));
      set = vi.fn((key: string, value: unknown) => {
        cacheStore.set(key, value);
        return true;
      });
    },
  };
});

vi.mock('axios');

describe('HolidayService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cacheStore.clear();
  });

  describe('isYearEndNewYear', () => {
    it('should return true for Dec 29 to Jan 3', () => {
      expect(holidayService.isYearEndNewYear(new Date('2025-12-28'))).toBe(false);
      expect(holidayService.isYearEndNewYear(new Date('2025-12-29'))).toBe(true);
      expect(holidayService.isYearEndNewYear(new Date('2025-12-31'))).toBe(true);
      expect(holidayService.isYearEndNewYear(new Date('2026-01-01'))).toBe(true);
      expect(holidayService.isYearEndNewYear(new Date('2026-01-03'))).toBe(true);
      expect(holidayService.isYearEndNewYear(new Date('2026-01-04'))).toBe(false);
    });
  });

  describe('getHolidays', () => {
    it('should fetch holidays from API and return them', async () => {
      const mockData = { '2026-01-01': '元旦' };
      vi.mocked(axios.get).mockResolvedValue({ data: mockData });

      const result = await holidayService.getHolidays();
      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should deduplicate concurrent API requests', async () => {
      const mockData = { '2026-01-01': '元旦' };
      let resolveRequest: ((value: { data: typeof mockData }) => void) | undefined;
      const pendingRequest = new Promise<{ data: typeof mockData }>((resolve) => {
        resolveRequest = resolve;
      });
      vi.mocked(axios.get).mockReturnValue(pendingRequest);

      const [result1, result2] = await Promise.all([
        holidayService.getHolidays(),
        holidayService.getHolidays(),
      ].map(async (promise, index) => {
        if (index === 0 && resolveRequest) {
          resolveRequest({ data: mockData });
        }
        return promise;
      }));

      expect(result1).toEqual(mockData);
      expect(result2).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should return stale cache when API fails', async () => {
      const staleData = { '2026-01-01': '元旦' };
      cacheStore.set('holidays:stale', staleData);
      vi.mocked(axios.get).mockRejectedValue(new Error('API Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await holidayService.getHolidays();

      expect(result).toEqual(staleData);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should return empty object and log error when API fails', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('API Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await holidayService.getHolidays();
      expect(result).toEqual({});
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});
