import { useState } from 'react';
import { components } from '@/types/openapi';

export type Milestone = components['schemas']['Milestone'];
export type MilestoneResponse = components['schemas']['MilestoneResponse'];

const generateInitialMilestones = (): MilestoneResponse => {
  const milestones: Milestone[] = [];
  const now = new Date();

  for (let i = 0; i <= 12; i++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const y = targetDate.getFullYear();
    const m = String(targetDate.getMonth() + 1).padStart(2, '0');
    const d = String(targetDate.getDate()).padStart(2, '0');

    milestones.push({
      age_in_months: i,
      target_date: `${y}-${m}-${d}`,
      size: '不明',
      items: [],
    });
  }
  return { milestones };
};

export const useMilestones = () => {
  const [data, setData] = useState<MilestoneResponse | null>(() => generateInitialMilestones());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = async (birthDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        birth_date: birthDate,
      });

      const response = await fetch(`/api/milestones?${query.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Fetch Error]', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          errorData
        });
        throw new Error(`Failed to fetch milestones: ${response.status} ${response.statusText}`);
      }
      const result: MilestoneResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchMilestones };
};
