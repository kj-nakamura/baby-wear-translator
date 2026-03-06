import { format, addDays, isWeekend, parseISO } from 'date-fns';
import { holidayService } from './holiday.service';

export class CalculatorService {
  /**
   * 指定した期間の平日数（土日・祝日・年末年始を除く）を計算し、
   * 1日8時間換算の稼働時間を返却します。
   */
  async calculateWorkingHours(startStr: string, endStr: string, paidLeaveDates: string[] = []): Promise<number> {
    const holidaysObj = await holidayService.getHolidays();
    const paidLeaveSet = new Set(paidLeaveDates);
    const start = parseISO(startStr);
    const end = parseISO(endStr);

    let current = start;
    let workDays = 0;

    while (current <= end) {
      const isWeekEnd = isWeekend(current);
      const dateString = format(current, 'yyyy-MM-dd');
      const isHoliday = !!holidaysObj[dateString];
      const isYearEndNewYear = holidayService.isYearEndNewYear(current);
      const isPaidLeave = paidLeaveSet.has(dateString);

      // 土日でも祝日でも年末年始でも有給でもない場合のみカウント
      if (!isWeekEnd && !isHoliday && !isYearEndNewYear && !isPaidLeave) {
        workDays++;
      }
      current = addDays(current, 1);
    }

    return workDays * 8;
  }

  /**
   * 指定した期間内の祝日および年末年始の日付リスト（M/D 形式）を取得します。
   */
  async getHolidaysList(startStr: string, endStr: string, paidLeaveDates: string[] = []): Promise<string[]> {
    const holidaysObj = await holidayService.getHolidays();
    const paidLeaveSet = new Set(paidLeaveDates);
    const start = parseISO(startStr);
    const end = parseISO(endStr);

    let current = start;
    const foundHolidays: string[] = [];

    while (current <= end) {
      const dateString = format(current, 'yyyy-MM-dd');
      const isHoliday = !!holidaysObj[dateString];
      const isYearEndNewYear = holidayService.isYearEndNewYear(current);
      const isPaidLeave = paidLeaveSet.has(dateString);

      if (isHoliday || isYearEndNewYear || isPaidLeave) {
        const dateLabel = format(current, 'M/d');
        if (!foundHolidays.includes(dateLabel)) {
          foundHolidays.push(dateLabel);
        }
      }
      current = addDays(current, 1);
    }

    return foundHolidays;
  }
}

export const calculatorService = new CalculatorService();
