import { useCallback, useEffect, useMemo, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import {
  LeaderboardReturnTypeAPI,
  RankedRewards,
  TradingCompetitionLeaderboardAPI,
  UserProfileExtended,
} from '@/types';
import { calculateWeeksPassed } from '@/utils';

import { WalletAdapterName } from './useWalletAdapters';

const findUserData = (
  divisions: {
    division: string;
    traders: {
      address: string;
      totalVolume: number | null;
      totalPnl: number | null;
      rankInDivision: number;
      adxReward: number;
      jtoReward: number;
      badge: 'Diamond' | 'Gold' | 'Silver' | 'Bronze' | 'Iron';
    }[];
  }[],
  walletAddress: string,
  getUserName: (address: string | null) => string | null,
) => {
  for (const { division, traders } of divisions) {
    const userIndex = traders.findIndex(
      ({ address }: { address: string }) => address === walletAddress,
    );
    if (userIndex === -1) continue;

    const user = traders[userIndex];
    return {
      username: getUserName(user.address),
      division,
      volume: user.totalVolume ?? 0,
      pnl: user.totalPnl ?? 0,
      rank: user.rankInDivision,
      adxRewards: user.adxReward,
      jtoRewards: user.jtoReward,
      badge: user.badge,
    };
  }
  return null;
};

const processLeaderboardData = (
  traderDivisions: LeaderboardReturnTypeAPI<{
    showTraderDivisions: true;
  }>['traderDivisions'],
  getUserName: (address: string | null) => string | null,
  wallet: { walletAddress: string } | null,
): TradingCompetitionLeaderboardAPI => {
  return traderDivisions.reduce((acc, { division, traders }) => {
    acc[division] = traders.map(
      (trader: {
        address: string;
        totalVolume: number | null;
        totalPnl: number | null;
        rankInDivision: number;
        adxReward: number;
        jtoReward: number;
        badge: 'Diamond' | 'Gold' | 'Silver' | 'Bronze' | 'Iron';
      }) => ({
        username: getUserName(trader.address) ?? trader.address,
        connected: trader.address === wallet?.walletAddress,
        rank: trader.rankInDivision,
        volume: trader.totalVolume,
        pnl: trader.totalPnl,
        adxRewards: trader.adxReward,
        jtoRewards: trader.jtoReward ?? 0,
        badge: trader.badge,
      }),
    );

    const nbMissing = 10 - traders.length;
    for (let i = 0; i < nbMissing; i++) {
      acc[division].push({
        connected: false,
        username: '-',
        rank: 10 - nbMissing + (i + 1),
        volume: null,
        pnl: null,
        adxRewards: 0,
        jtoRewards: 0,
        badge: 'Iron' as const,
      });
    }
    return acc;
  }, {} as TradingCompetitionLeaderboardAPI);
};

const processAchievements = (
  achievements: LeaderboardReturnTypeAPI<{
    showAchievements: true;
  }>['achievements'],
  getUserName: (address: string | null) => string | null,
) => {
  if (!achievements) return null;
  const { biggestLiquidation, topDegen, ...rest } = achievements;

  if (biggestLiquidation && topDegen) {
    return {
      biggestLiquidation: {
        ...biggestLiquidation,
        addresses: biggestLiquidation.addresses.map(getUserName),
      },
      topDegen: {
        ...topDegen,
        addresses: topDegen.addresses.map(getUserName),
      },
      ...rest,
    };
  }
  return achievements;
};

export default function useAwakeningV2({
  wallet,
  allUserProfiles,
}: {
  wallet: {
    adapterName: WalletAdapterName;
    walletAddress: string;
  } | null;
  allUserProfiles: UserProfileExtended[];
}) {
  const [data, setData] = useState<{
    startDate: string;
    endDate: string;
    traderDivisions: LeaderboardReturnTypeAPI<{
      showTraderDivisions: true;
    }>['traderDivisions'];
    achievements: LeaderboardReturnTypeAPI<{
      showAchievements: true;
    }>['achievements'];
    eligibleJitosolWallets: string[];
    rankedRewards: RankedRewards[];
  } | null>(null);

  const userProfilesMap = useMemo(() => {
    return allUserProfiles.reduce((acc, profile) => {
      acc[profile.owner.toBase58()] = profile.nickname;
      return acc;
    }, {} as Record<string, string>);
  }, [allUserProfiles]);

  const getUserName = useCallback(
    (address: string | null) => {
      if (!address) return '';
      return userProfilesMap[address] ?? address;
    },
    [userProfilesMap],
  );

  const fetchData = useCallback(async () => {
    try {
      const response = await DataApiClient.getTradingCompetitionLeaderboard({
        season: 'preseason',
        showAchievements: true,
        showTraderDivisions: true,
        showEligibleJitosolWallets: true,
      });

      if (!response) {
        console.log('could not fetch data from API');
        return;
      }

      setData({
        startDate: response.startDate,
        endDate: response.endDate,
        traderDivisions: response.traderDivisions,
        achievements: response.achievements,
        eligibleJitosolWallets: response.eligibleJitosolWallets,
        rankedRewards: response.rankedRewards,
      });
    } catch (e) {
      console.error('Error loading leaderboard data:', e);
    }
  }, []);

  const [startDate, endDate] = useMemo(() => {
    if (!data) return [null, null];
    return [new Date(data.startDate), new Date(data.endDate)];
  }, [data]);

  const weeksPassedSinceStartDate = useMemo(() => {
    if (!startDate) return 0;
    return calculateWeeksPassed(startDate);
  }, [startDate]);

  const processedData = useMemo(() => {
    if (!data) return null;

    const { count, volume } = data.traderDivisions.reduce(
      (acc, { traders }) => ({
        count: acc.count + traders.length,
        volume:
          acc.volume +
          traders.reduce((sum, { totalVolume }) => sum + (totalVolume ?? 0), 0),
      }),
      { count: 0, volume: 0 },
    );

    return {
      startDate: startDate,
      endDate: endDate,
      weeksPassedSinceStartDate: weeksPassedSinceStartDate,
      eligibleJitosolAirdropWallets: data.eligibleJitosolWallets,
      tradersCount: count,
      totalVolume: volume,
      currentUserData: wallet
        ? findUserData(data.traderDivisions, wallet.walletAddress, getUserName)
        : null,
      achievements: processAchievements(data.achievements, getUserName),
      data: processLeaderboardData(data.traderDivisions, getUserName, wallet),
      rankedRewards: data.rankedRewards,
    };
  }, [
    data,
    wallet,
    getUserName,
    startDate,
    endDate,
    weeksPassedSinceStartDate,
  ]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => {
      clearInterval(interval);
    };
  }, [fetchData]);

  return processedData;
}
