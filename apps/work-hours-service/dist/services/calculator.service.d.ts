export declare class CalculatorService {
    /**
     * 指定した期間の平日数（土日・祝日・年末年始を除く）を計算し、
     * 1日8時間換算の稼働時間を返却します。
     */
    calculateWorkingHours(startStr: string, endStr: string): Promise<number>;
    /**
     * 指定した期間内の祝日および年末年始の日付リスト（M/D 形式）を取得します。
     */
    getHolidaysList(startStr: string, endStr: string): Promise<string[]>;
}
export declare const calculatorService: CalculatorService;
