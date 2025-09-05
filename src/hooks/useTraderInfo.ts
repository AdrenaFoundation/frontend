import { useCallback, useEffect, useMemo, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import { EnrichedTraderInfo } from '@/types';

import useAwakeningV2 from './useAwakeningV2';
import useExpanseData from './useExpanseData';
import useFactionsData from './useFactionsData';
import { WalletAdapterName } from './useWalletAdapters';

export type ExpanseRankingTraderInfo =
  | {
      rank: number;
      championshipPoints: number;
      volume: number;
      pnl: number;
      tradersCount: number;
      startDate: Date | null;
      endDate: Date | null;
    }
  | {
      startDate: Date | null;
      endDate: Date | null;
    };

export type AwakeningRankingTraderInfo =
  | {
      division: string;
      pnl: number;
      rank: number;
      volume: number;
      tradersCount: number;
      startDate: Date | null;
      endDate: Date | null;
    }
  | {
      startDate: Date | null;
      endDate: Date | null;
    };

export type FactionRankingTraderInfo =
  | {
      pnl: number;
      rank: number;
      volume: number;
      tradersCount: number;
      startDate: Date | null;
      endDate: Date | null;
    }
  | {
      startDate: Date | null;
      endDate: Date | null;
    }
  | null;

export default function useTraderInfo({
  walletAddress,
}: {
  walletAddress: string | null;
}): {
  traderInfo: EnrichedTraderInfo | null;
  isTraderInfoLoading: boolean;
  isInitialLoad: boolean;
  triggerTraderInfoReload: () => void;
  expanseRanking: ExpanseRankingTraderInfo | null;
  awakeningRanking: AwakeningRankingTraderInfo | null;
  factionRanking: FactionRankingTraderInfo | null;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const [traderInfo, setTraderInfo] = useState<EnrichedTraderInfo | null>(null);
  const [isTraderInfoLoading, setIsTraderInfoLoading] =
    useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  const wallet = useMemo(() => {
    return walletAddress
      ? {
          adapterName: 'Phantom' as WalletAdapterName,
          walletAddress,
        }
      : null;
  }, [walletAddress]);

  const emptyMetadata = useMemo(() => [], []);

  const expanseLeaderboard = useExpanseData({
    allUserProfilesMetadata: emptyMetadata,
  });
  const awakeningLeaderboard = useAwakeningV2({
    wallet,
    allUserProfilesMetadata: emptyMetadata,
  });

  const factionLeaderboard = useFactionsData({
    allUserProfilesMetadata: emptyMetadata,
  });

  const expanseRanking = useMemo(() => {
    if (!walletAddress) return null;

    const d = expanseLeaderboard?.seasonLeaderboard.find(
      (rank) => rank.wallet.toBase58() === walletAddress,
    );

    if (!d) {
      if (!expanseLeaderboard?.startDate || !expanseLeaderboard?.endDate) {
        return null;
      }

      return {
        startDate: expanseLeaderboard.startDate,
        endDate: expanseLeaderboard.endDate,
      };
    }

    return {
      rank: d.rank,
      championshipPoints: d.championshipPoints,
      volume: d.volume,
      pnl: d.pnl,
      tradersCount: expanseLeaderboard?.seasonLeaderboard.length ?? 0,
      startDate: expanseLeaderboard?.startDate ?? null,
      endDate: expanseLeaderboard?.endDate ?? null,
    };
  }, [
    expanseLeaderboard?.endDate,
    expanseLeaderboard?.seasonLeaderboard,
    expanseLeaderboard?.startDate,
    walletAddress,
  ]);

  const awakeningRanking = useMemo(() => {
    if (!walletAddress) return null;

    if (!awakeningLeaderboard) return null;

    if (!awakeningLeaderboard?.currentUserData)
      return {
        startDate: awakeningLeaderboard.startDate,
        endDate: awakeningLeaderboard.endDate,
      };

    return {
      division: awakeningLeaderboard.currentUserData.division,
      pnl: awakeningLeaderboard.currentUserData.pnl,
      rank: awakeningLeaderboard.currentUserData.rank,
      volume: awakeningLeaderboard.currentUserData.volume,
      tradersCount: awakeningLeaderboard.tradersCount,
      startDate: awakeningLeaderboard.startDate,
      endDate: awakeningLeaderboard.endDate,
    };
  }, [awakeningLeaderboard, walletAddress]);

  const factionRanking = useMemo(() => {
    if (!walletAddress) return null;

    if (!factionLeaderboard) return null;

    const currentUserData = factionLeaderboard.seasonLeaderboard.find(
      (u) => u.userWallet === walletAddress,
    );
    if (!currentUserData)
      return {
        startDate: factionLeaderboard.startDate,
        endDate: factionLeaderboard.endDate,
      };

    return {
      pnl: currentUserData.pnl,
      rank: currentUserData.rank,
      volume: currentUserData.volume,
      tradersCount: factionLeaderboard.seasonLeaderboard.length,
      startDate: factionLeaderboard.startDate,
      endDate: factionLeaderboard.endDate,
    };
  }, [factionLeaderboard, walletAddress]);

  const loadTraderInfo = useCallback(
    async () => {
      if (!walletAddress) {
        setIsTraderInfoLoading(false);
        // Set initial load to false only once
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
        return;
      }

      setIsTraderInfoLoading(true);

      async function fetchTraderInfo(): Promise<EnrichedTraderInfo | null> {
        if (!walletAddress) return null;

        const traderInfo = await DataApiClient.getTraderInfo({
          walletAddress,
        });

        if (!traderInfo) {
          return null;
        }

        return traderInfo;
      }

      try {
        setTraderInfo(await fetchTraderInfo());

        // Set initial load to false only once after first successful fetch
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      } catch (e) {
        console.log('Error loading trader info', e, String(e));

        // Set initial load to false even on error to prevent infinite loading state
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
        throw e;
      } finally {
        setIsTraderInfoLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [walletAddress, isInitialLoad],
  );

  useEffect(() => {
    loadTraderInfo();

    const interval = setInterval(() => {
      loadTraderInfo();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTraderInfo, trickReload, window.adrena.client.readonlyConnection]);

  return {
    traderInfo,
    isTraderInfoLoading,
    isInitialLoad,
    triggerTraderInfoReload: () => {
      triggerReload(trickReload + 1);
    },
    expanseRanking,
    awakeningRanking,
    factionRanking,
  };
}
