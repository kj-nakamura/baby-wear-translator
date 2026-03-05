import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { holidayService } from './holiday.service.js';

// node-cache をモックして、キャッシュの影響を排除する
vi.mock('node-cache', () => {
  return {
    default: class {
      get = vi.fn().mockReturnValue(undefined);
      set = vi.fn();
    },
  };
});

vi.mock('axios');

describe('HolidayService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
