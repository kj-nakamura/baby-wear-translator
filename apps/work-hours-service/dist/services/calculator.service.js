"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatorService = exports.CalculatorService = void 0;
const date_fns_1 = require("date-fns");
const holiday_service_js_1 = require("./holiday.service.js");
class CalculatorService {
    /**
     * 指定した期間の平日数（土日・祝日・年末年始を除く）を計算し、
     * 1日8時間換算の稼働時間を返却します。
     */
    async calculateWorkingHours(startStr, endStr) {
        const holidaysObj = await holiday_service_js_1.holidayService.getHolidays();
        const start = (0, date_fns_1.parseISO)(startStr);
        const end = (0, date_fns_1.parseISO)(endStr);
        let current = start;
        let workDays = 0;
        while (current <= end) {
            const isWeekEnd = (0, date_fns_1.isWeekend)(current);
            const dateString = (0, date_fns_1.format)(current, 'yyyy-MM-dd');
            const isHoliday = !!holidaysObj[dateString];
            const isYearEndNewYear = holiday_service_js_1.holidayService.isYearEndNewYear(current);
            // 土日でも祝日でも年末年始でもない場合のみカウント
            if (!isWeekEnd && !isHoliday && !isYearEndNewYear) {
                workDays++;
            }
            current = (0, date_fns_1.addDays)(current, 1);
        }
        return workDays * 8;
    }
    /**
     * 指定した期間内の祝日および年末年始の日付リスト（M/D 形式）を取得します。
     */
    async getHolidaysList(startStr, endStr) {
        const holidaysObj = await holiday_service_js_1.holidayService.getHolidays();
        const start = (0, date_fns_1.parseISO)(startStr);
        const end = (0, date_fns_1.parseISO)(endStr);
        let current = start;
        const foundHolidays = [];
        while (current <= end) {
            const dateString = (0, date_fns_1.format)(current, 'yyyy-MM-dd');
            const isHoliday = !!holidaysObj[dateString];
            const isYearEndNewYear = holiday_service_js_1.holidayService.isYearEndNewYear(current);
            if (isHoliday || isYearEndNewYear) {
                const dateLabel = (0, date_fns_1.format)(current, 'M/d');
                if (!foundHolidays.includes(dateLabel)) {
                    foundHolidays.push(dateLabel);
                }
            }
            current = (0, date_fns_1.addDays)(current, 1);
        }
        return foundHolidays;
    }
}
exports.CalculatorService = CalculatorService;
exports.calculatorService = new CalculatorService();
