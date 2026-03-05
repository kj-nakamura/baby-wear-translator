export interface HolidayData {
  [date: string]: string; // "2026-01-01": "元日"
}

export interface WorkHoursRequest {
  start: string; // ISO 8601, e.g., "2026-03-01"
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
  holidays: string[]; // e.g., ["1/1", "1/2"]
}
