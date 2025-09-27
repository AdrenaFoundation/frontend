import { useEffect, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import { AnniversaryResponse } from '@/types';

export default function useAnniversaryRecords(userWallet?: string | null): {
  anniversaryData: AnniversaryResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [anniversaryData, setAnniversaryData] =
    useState<AnniversaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await DataApiClient.getAnniversaryRecords(
        userWallet || undefined,
      );
      setAnniversaryData(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch anniversary records',
      );
      setAnniversaryData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [userWallet]);

  return {
    anniversaryData,
    isLoading,
    error,
    refetch: fetchRecords,
  };
}
