import { useState } from 'react';
import { components } from '@/types/openapi';

export type Milestone = components['schemas']['Milestone'];
export type MilestoneResponse = components['schemas']['MilestoneResponse'];

export const useMilestones = () => {
  const [data, setData] = useState<MilestoneResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = async (birthDate: string, targetShop?: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        birth_date: birthDate,
      });
      if (targetShop) query.append('target_shop', targetShop);

      const response = await fetch(`http://localhost:8080/milestones?${query.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch milestones');
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
