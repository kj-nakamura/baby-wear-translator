export interface HolidayData {
    [date: string]: string;
}
export interface WorkHoursRequest {
    start: string;
    end: string;
}
export interface WorkHoursResponse {
    workHours: number;
    period: {
        start: string;
        end: string;
    };
}
export interface HolidaysListResponse {
    holidays: string[];
}
