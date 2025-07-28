import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { LimitOrderBookExtended } from '@/types';

const REFRESH_INTERVAL = 30000; // 30 seconds

export const useLimitOrderBook = ({
  walletAddress,
  poolKey,
}: {
  walletAddress: string | null;
  poolKey: PublicKey;
}) => {
  const [limitOrderBook, setLimitOrderBook] =
    useState<LimitOrderBookExtended | null>(null);
  // const [isLoading, setIsLoading] = useState(true);

  const loadLimitOrderBook = useCallback(async () => {
    if (!walletAddress) {
      setLimitOrderBook(null);
      // setIsLoading(false);
      return;
    }

    try {
      const limitOrderBook = await window.adrena.client.loadLimitOrderBook({
        poolKey,
        wallet: new PublicKey(walletAddress),
      });

      setLimitOrderBook(limitOrderBook);
    } catch (err) {
      console.log('Error loading limit order book:', err);
    } finally {
      // setIsLoading(false);
    }
  }, [poolKey, walletAddress]);

  useEffect(() => {
    // setIsLoading(true);
    loadLimitOrderBook();

    const interval = setInterval(() => {
      loadLimitOrderBook();
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [loadLimitOrderBook]);

  return {
    limitOrderBook,
    // isLoading,
    reload: loadLimitOrderBook,
  };
};
