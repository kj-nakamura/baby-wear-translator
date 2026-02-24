import { useState } from 'react';
import { components } from '@/types/openapi';

type BaseResponse = components['schemas']['RecommendationResponse'];

// バックエンドが返す拡張 Item 型（other_shop_names を含む）
interface ExtendedItem {
  universal_name: string;
  shop_specific_name: string;
  other_shop_names?: Record<string, string>;
}

// RecommendationResponse の items を拡張 Item で上書きした型
export interface RecommendationResponse extends Omit<BaseResponse, 'items'> {
  items: ExtendedItem[];
}

export const useRecommendation = () => {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = async (birthDate: string, targetDate: string, targetShop?: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        birth_date: birthDate,
        target_date: targetDate,
      });
      if (targetShop) query.append('target_shop', targetShop);

      const response = await fetch(`http://localhost:8080/recommend?${query.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendation');
      }
      const result: RecommendationResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchRecommendation };
};
