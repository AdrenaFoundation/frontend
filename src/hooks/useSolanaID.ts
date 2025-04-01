import { useEffect, useState } from 'react';

import { SolanaIDType } from '@/types';

const useSolanaID = ({
  walletAddress,
}: {
  walletAddress: string | null;
}): {
  data: SolanaIDType | null;
  loading: boolean;
  error: string | null;
} => {
  const [data, setData] = useState<SolanaIDType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletAddress === null || process.env.NODE_ENV === 'development') {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://score.solana.id/api/solid-score/address/${walletAddress}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.SOLANA_ID_API_KEY || '',
            },
          },
        );

        if (!response.ok) {
          console.error('Error fetching data:', response.statusText);
          return null;
        }

        const result = (await response.json()) as SolanaIDType;

        setData(result);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [walletAddress]);

  return { data, loading, error };
};

export default useSolanaID;
