import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { LimitOrderBookExtended } from '@/types';

const REFRESH_INTERVAL = 30000; // 30 seconds

// Mock data for testing
const getMockLimitOrders = (wallet: PublicKey) => {
  const mockUSDCMint = new PublicKey(
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  );
  const mockJITOSOLMint = new PublicKey(
    'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
  );
  const mockWBTCMint = new PublicKey(
    '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
  );
  const mockBONKMint = new PublicKey(
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  );

  return {
    initialized: 1,
    registeredLimitOrderCount: 5,
    owner: wallet,
    limitOrders: [
      // WBTC orders
      {
        id: 1,
        triggerPrice: 45000,
        limitPrice: 44800,
        custody: mockWBTCMint,
        collateralCustody: mockUSDCMint,
        side: 'long' as const,
        initialized: 1,
        amount: 1000,
        leverage: 100,
      },
      {
        id: 2,
        triggerPrice: 45500,
        limitPrice: 45800,
        custody: mockWBTCMint,
        collateralCustody: mockBONKMint,
        side: 'long' as const,
        initialized: 1,
        amount: 1000,
        leverage: 10,
      },
      {
        id: 3,
        triggerPrice: 49000,
        limitPrice: 49800,
        custody: mockWBTCMint,
        collateralCustody: mockJITOSOLMint,
        side: 'long' as const,
        initialized: 1,
        amount: 1000,
        leverage: 25,
      },
      {
        id: 4,
        triggerPrice: 55000,
        limitPrice: null,
        custody: mockWBTCMint,
        collateralCustody: mockWBTCMint,
        side: 'long' as const,
        initialized: 1,
        amount: 2,
        leverage: 10,
      },

      // JITOSOL orders
      {
        id: 5,
        triggerPrice: 100,
        limitPrice: 99.5,
        custody: mockJITOSOLMint,
        collateralCustody: mockUSDCMint,
        side: 'long' as const,
        initialized: 1,
        amount: 750,
        leverage: 7,
      },
      {
        id: 6,
        triggerPrice: 100,
        limitPrice: 99.5,
        custody: mockJITOSOLMint,
        collateralCustody: mockBONKMint,
        side: 'long' as const,
        initialized: 1,
        amount: 750,
        leverage: 7,
      },
      {
        id: 7,
        triggerPrice: 100,
        limitPrice: 99.5,
        custody: mockJITOSOLMint,
        collateralCustody: mockJITOSOLMint,
        side: 'long' as const,
        initialized: 1,
        amount: 750,
        leverage: 7,
      },
      {
        id: 8,
        triggerPrice: 100,
        limitPrice: 99.5,
        custody: mockJITOSOLMint,
        collateralCustody: mockWBTCMint,
        side: 'long' as const,
        initialized: 1,
        amount: 750,
        leverage: 7,
      },

      // BONK orders
      {
        id: 9,
        triggerPrice: 0.00001,
        limitPrice: 0.000012,
        custody: mockBONKMint,
        collateralCustody: mockUSDCMint,
        side: 'long' as const,
        initialized: 1,
        amount: 300,
        leverage: 3,
      },
      {
        id: 10,
        triggerPrice: 0.00001,
        limitPrice: 0.000012,
        custody: mockBONKMint,
        collateralCustody: mockBONKMint,
        side: 'long' as const,
        initialized: 1,
        amount: 300,
        leverage: 3,
      },
      {
        id: 11,
        triggerPrice: 0.00001,
        limitPrice: 0.000012,
        custody: mockBONKMint,
        collateralCustody: mockJITOSOLMint,
        side: 'long' as const,
        initialized: 1,
        amount: 300,
        leverage: 3,
      },
      {
        id: 12,
        triggerPrice: 0.00001,
        limitPrice: 0.000012,
        custody: mockBONKMint,
        collateralCustody: mockWBTCMint,
        side: 'long' as const,
        initialized: 1,
        amount: 300,
        leverage: 3,
      },

      {
        id: 13,
        triggerPrice: 35000,
        limitPrice: 34800,
        custody: mockWBTCMint,
        collateralCustody: mockUSDCMint,
        side: 'short' as const,
        initialized: 1,
        amount: 180000,
        leverage: 100,
      },
    ],
    escrowedLamports: 1000000,
    pubkey: PublicKey.default,
  } as LimitOrderBookExtended;
};

export const useLimitOrderBook = ({
  walletAddress,
}: {
  walletAddress: string | null;
}) => {
  const [limitOrderBook, setLimitOrderBook] =
    useState<LimitOrderBookExtended | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadLimitOrderBook = useCallback(async () => {
    if (!walletAddress) {
      setLimitOrderBook(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // For testing, use mock data instead of actual API call
      // const limitOrderBook = await window.adrena.client.loadLimitOrderBook({
      //   wallet: publicKey,
      // });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockData = getMockLimitOrders(new PublicKey(walletAddress));
      setLimitOrderBook(mockData);
    } catch (err) {
      console.log('Error loading limit order book:', err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
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
    isLoading,
    reload: loadLimitOrderBook,
  };
};
