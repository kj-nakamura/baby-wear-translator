import { useState } from 'react';
import { components } from '@/types/openapi';

type RecommendationResponse = components['schemas']['RecommendationResponse'];

export const useRecommendation = () => {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = async (birthDate: string, currentTemp: number, targetShop?: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        birth_date: birthDate,
        current_temp: currentTemp.toString(),
      });
      if (targetShop) query.append('target_shop', targetShop);

      const response = await fetch(`http://localhost:8080/recommend?${query.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendation');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchRecommendation };
};
