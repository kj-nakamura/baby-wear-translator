import { useState } from 'react';

export interface WorkHoursResponse {
  workHours: number;
  period: {
    start: string;
    end: string;
  };
}

export interface HolidaysResponse {
  holidays: string[];
}

export const useWorkHours = () => {
  const [workHoursData, setWorkHoursData] = useState<WorkHoursResponse | null>(null);
  const [holidaysData, setHolidaysData] = useState<HolidaysResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkHours = async (start: string, end: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/work-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, end }),
      });

      if (!response.ok) {
        throw new Error(`Work hours error: ${response.status}`);
      }
      const data: WorkHoursResponse = await response.json();
      setWorkHoursData(data);

      const holidayResponse = await fetch(`/api/holidays?start=${start}&end=${end}`);
      if (!holidayResponse.ok) {
        throw new Error(`Holidays error: ${holidayResponse.status}`);
      }
      const hData: HolidaysResponse = await holidayResponse.json();
      setHolidaysData(hData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { workHoursData, holidaysData, loading, error, fetchWorkHours };
};
