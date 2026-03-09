import { useCallback, useState } from 'react';

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

  const fetchWorkHours = useCallback(async (month: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/work-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null) as { error?: string; details?: string } | null;
        const message = errorBody?.details || errorBody?.error || `Work hours error: ${response.status}`;
        throw new Error(message);
      }
      const data: WorkHoursResponse = await response.json();
      setWorkHoursData(data);

      const holidayResponse = await fetch(`/api/holidays?month=${month}`);
      if (!holidayResponse.ok) {
        const errorBody = await holidayResponse.json().catch(() => null) as { error?: string; details?: string } | null;
        const message = errorBody?.details || errorBody?.error || `Holidays error: ${holidayResponse.status}`;
        throw new Error(message);
      }
      const hData: HolidaysResponse = await holidayResponse.json();
      setHolidaysData(hData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  return { workHoursData, holidaysData, loading, error, fetchWorkHours };
};
