import { useCallback, useEffect, useMemo, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import { EnrichedTraderInfo } from '@/types';

import useAwakeningV2 from './useAwakeningV2';
import useExpanseData from './useExpanseData';
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

export default function useTraderInfo({
  walletAddress,
}: {
  walletAddress: string | null;
}): {
  traderInfo: EnrichedTraderInfo | null;
  triggerTraderInfoReload: () => void;
  expanseRanking: ExpanseRankingTraderInfo | null;
  awakeningRanking: AwakeningRankingTraderInfo | null;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const [traderInfo, setTraderInfo] = useState<EnrichedTraderInfo | null>(null);

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

  const loadTraderInfo = useCallback(
    async () => {
      if (!walletAddress) {
        return;
      }

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
      } catch (e) {
        console.log('Error loading trader info', e, String(e));
        throw e;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [walletAddress],
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
    triggerTraderInfoReload: () => {
      triggerReload(trickReload + 1);
    },
    expanseRanking,
    awakeningRanking,
  };
}
