import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import { EnrichedUserMutagens, UserMutagensReturnType } from '@/types';

export function enrichUserMutagens(
  userMutagens: UserMutagensReturnType,
): EnrichedUserMutagens {
  return {
    ...userMutagens.data,
    userWallet: new PublicKey(userMutagens.data.user_wallet),
    totalPointsTrading: userMutagens.data.total_points_trading,
    totalPointsMutations: userMutagens.data.total_points_mutations,
    totalPointsStreaks: userMutagens.data.total_points_streaks,
    totalPointsQuests: userMutagens.data.total_points_quests,
    totalTotalPoints: userMutagens.data.total_total_points,
    totalVolume: userMutagens.data.total_volume,
    totalPnl: userMutagens.data.total_pnl,
    totalBorrowFees: userMutagens.data.total_borrow_fees,
    totalCloseFees: userMutagens.data.total_close_fees,
    totalFees: userMutagens.data.total_fees,
    seasons: userMutagens.data.seasons
      .map((season) => ({
        ...season,
        seasonName: season.season_name,
        pointsTrading: season.points_trading,
        pointsMutations: season.points_mutations,
        pointsStreaks: season.points_streaks,
        pointsQuests: season.points_quests,
        totalPoints: season.total_points,
        volume: season.volume,
        pnl: season.pnl,
        borrowFees: season.borrow_fees,
        closeFees: season.close_fees,
        fees: season.fees,
      }))
      .reverse(),
  };
}

export default function useUserMutagens({
  walletAddress,
}: {
  walletAddress: string | null;
}) {
  const [userMutagens, setUserMutagens] = useState<EnrichedUserMutagens | null>(
    null,
  );

  const loadUserMutagens = useCallback(async () => {
    if (!walletAddress || !window.adrena.client.readonlyConnection) {
      setUserMutagens(null);
      return;
    }

    try {
      const response = await DataApiClient.getUserMutagens({
        userWallet: walletAddress,
      });

      if (!response) {
        setUserMutagens(null);
        return;
      }

      setUserMutagens(enrichUserMutagens(response));
    } catch (e) {
      console.error('Error loading user mutagens:', e);
    }
  }, [walletAddress]);

  useEffect(() => {
    loadUserMutagens();

    const interval = setInterval(async () => {
      await loadUserMutagens();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadUserMutagens]);

  return {
    userMutagens,
    triggerUserMutagensReload: loadUserMutagens,
  };
}
