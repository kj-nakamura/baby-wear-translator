import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculatorService } from './calculator.service';
import { holidayService } from './holiday.service';

vi.mock('./holiday.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./holiday.service')>();
  // 既存のインスタンスのメソッドをモックに置き換える
  actual.holidayService.getHolidays = vi.fn();
  return actual;
});

describe('CalculatorService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate working hours correctly excluding weekends', async () => {
    vi.mocked(holidayService.getHolidays).mockResolvedValue({});
    
    // 2026-03-01 (Sun) to 2026-03-07 (Sat)
    // Working days: 02 (Mon), 03 (Tue), 04 (Wed), 05 (Thu), 06 (Fri)
    // 5 days * 8 hours = 40 hours
    const result = await calculatorService.calculateWorkingHours('2026-03-01', '2026-03-07');
    expect(result).toBe(40);
  });

  it('should exclude year-end and new-year holidays', async () => {
    vi.mocked(holidayService.getHolidays).mockResolvedValue({});
    
    // 2025-12-28 (Sun) to 2026-01-04 (Sun)
    const result = await calculatorService.calculateWorkingHours('2025-12-28', '2026-01-04');
    expect(result).toBe(0);
  });

  it('should exclude Japanese national holidays', async () => {
    vi.mocked(holidayService.getHolidays).mockResolvedValue({
      '2026-05-04': 'みどりの日',
      '2026-05-05': 'こどもの日',
      '2026-05-06': '振替休日',
    });

    const result = await calculatorService.calculateWorkingHours('2026-05-04', '2026-05-08');
    expect(result).toBe(16);
  });

  it('should exclude paid leave dates from working hours', async () => {
    vi.mocked(holidayService.getHolidays).mockResolvedValue({});

    const result = await calculatorService.calculateWorkingHours(
      '2026-03-02',
      '2026-03-06',
      ['2026-03-03', '2026-03-05']
    );

    expect(result).toBe(24);
  });

  it('should return correct holiday list', async () => {
    vi.mocked(holidayService.getHolidays).mockResolvedValue({
      '2026-01-01': '元旦',
    });

    const result = await calculatorService.getHolidaysList('2026-01-01', '2026-01-03');
    expect(result).toContain('1/1');
    expect(result).toContain('1/2');
    expect(result).toContain('1/3');
  });

  it('should include paid leave dates in holiday list', async () => {
    vi.mocked(holidayService.getHolidays).mockResolvedValue({});

    const result = await calculatorService.getHolidaysList(
      '2026-03-01',
      '2026-03-05',
      ['2026-03-02', '2026-03-04', '2026-04-01']
    );

    expect(result).toEqual(['3/2', '3/4']);
  });
});
