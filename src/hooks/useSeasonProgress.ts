import { useCallback, useEffect, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import {
  EnrichedUserSeasonProgress,
  UserSeasonProgressReturnType,
} from '@/types';

const transformToEnrichedProgress = (
  response: UserSeasonProgressReturnType,
): EnrichedUserSeasonProgress => ({
  startDate: response.data.start_date,
  endDate: response.data.end_date,
  streaks: response.data.streaks && {
    status: response.data.streaks.status,
    updatedStreakDate: response.data.streaks.updated_streak_date,
    currentDaysStreak: response.data.streaks.current_days_streak,
    longestDaysStreak: response.data.streaks.longest_days_streak,
    weeklyDaysStreak: response.data.streaks.weekly_days_streak,
    monthlyDaysStreak: response.data.streaks.monthly_days_streak,
    weeksCompleted: response.data.streaks.weeks_completed,
    monthsCompleted: response.data.streaks.months_completed,
    pointsDays: response.data.streaks.points_days,
    pointsWeeks: response.data.streaks.points_weeks,
    pointsMonths: response.data.streaks.points_months,
  },
  quests: response.data.quests && {
    dailyQuests: response.data.quests.daily_quests.map((quest) => ({
      ...quest,
      currentValue: quest.current_value,
      targetValue: quest.target_value,
      isCondition: quest.is_condition,
      targetType: quest.target_type,
      currentValue2: quest.current_value_2,
      targetValue2: quest.target_value_2,
      isCondition2: quest.is_condition_2,
      targetType2: quest.target_type_2,
      currentValue3: quest.current_value_3,
      targetValue3: quest.target_value_3,
      isCondition3: quest.is_condition_3,
      targetType3: quest.target_type_3,
      currentValue4: quest.current_value_4,
      targetValue4: quest.target_value_4,
      isCondition4: quest.is_condition_4,
      targetType4: quest.target_type_4,
      currentValue5: quest.current_value_5,
      targetValue5: quest.target_value_5,
      isCondition5: quest.is_condition_5,
      targetType5: quest.target_type_5,
      currentValue6: quest.current_value_6,
      targetValue6: quest.target_value_6,
      isCondition6: quest.is_condition_6,
      targetType6: quest.target_type_6,
    })),
    weeklyQuests: response.data.quests.weekly_quests.map((quest) => ({
      ...quest,
      currentValue: quest.current_value,
      targetValue: quest.target_value,
      isCondition: quest.is_condition,
      targetType: quest.target_type,
      currentValue2: quest.current_value_2,
      targetValue2: quest.target_value_2,
      isCondition2: quest.is_condition_2,
      targetType2: quest.target_type_2,
      currentValue3: quest.current_value_3,
      targetValue3: quest.target_value_3,
      isCondition3: quest.is_condition_3,
      targetType3: quest.target_type_3,
      currentValue4: quest.current_value_4,
      targetValue4: quest.target_value_4,
      isCondition4: quest.is_condition_4,
      targetType4: quest.target_type_4,
      currentValue5: quest.current_value_5,
      targetValue5: quest.target_value_5,
      isCondition5: quest.is_condition_5,
      targetType5: quest.target_type_5,
      currentValue6: quest.current_value_6,
      targetValue6: quest.target_value_6,
      isCondition6: quest.is_condition_6,
      targetType6: quest.target_type_6,
    })),
    dailyPointsQuests: response.data.quests.daily_points_quests,
    weeklyPointsQuests: response.data.quests.weekly_points_quests,
    totalPointsQuests: response.data.quests.total_points_quests,
  },
  mutations: response.data.mutations?.map((mutation) => ({
    mutationDate: mutation.mutation_date,
    name: mutation.name,
    description: mutation.description,
    points: mutation.points,
    conditionType: mutation.condition_type,
    conditionValue: mutation.condition_value,
    comparison: mutation.comparison,
    calculationType: mutation.calculation_type,
    maxPoints: mutation.max_points,
  })),
  weekLeaderboard: {
    weekDatesStart: response.data.week_leaderboard.week_dates_start,
    weekDatesEnd: response.data.week_leaderboard.week_dates_end,
    leaderboard: response.data.week_leaderboard.leaderboard,
  },
  seasonLeaderboard: response.data.season_leaderboard,
  name: response.data.name,
  description: response.data.description,
});

export default function useUserSeasonProgress({
  walletAddress,
}: {
  walletAddress: string | null;
}) {
  const [userSeasonProgress, setUserSeasonProgress] =
    useState<EnrichedUserSeasonProgress | null>(null);

  const loadUserSeasonProgress = useCallback(async () => {
    if (!walletAddress || !window.adrena.client.readonlyConnection) {
      setUserSeasonProgress(null);
      return;
    }

    try {
      const response = await DataApiClient.getUserSeasonProgress({
        userWallet: walletAddress,
        season: 'expanse',
      });

      if (!response) {
        setUserSeasonProgress(null);
        return;
      }

      setUserSeasonProgress(transformToEnrichedProgress(response));
    } catch (e) {
      console.error('Error loading user season progress:', e);
    }
  }, [walletAddress]);

  useEffect(() => {
    loadUserSeasonProgress();

    const interval = setInterval(async () => {
      await loadUserSeasonProgress();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadUserSeasonProgress]);

  return {
    userSeasonProgress,
    triggerUserSeasonProgressReload: loadUserSeasonProgress,
  };
}
