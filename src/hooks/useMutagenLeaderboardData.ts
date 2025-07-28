import { useEffect, useMemo, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import {
  MutagenLeaderboardData,
  ProfilePicture,
  UserProfileMetadata,
  UserProfileTitle,
} from '@/types';

function applyProfile(
  leaderboardData: MutagenLeaderboardData | null,
  allMetadata: Record<string, UserProfileMetadata>,
) {
  if (!leaderboardData || !allMetadata) {
    return;
  }

  const leaderboardDataExtended = leaderboardData;

  leaderboardDataExtended.forEach((user) => {
    const metadata = allMetadata[user.userWallet.toBase58()];

    if (metadata) {
      user.nickname = metadata.nickname;
      user.profilePicture = metadata.profilePicture as ProfilePicture;
      user.title = metadata.title as UserProfileTitle;
    }
  });
}

export default function useMutagenLeaderboardData({
  allUserProfilesMetadata,
  refreshInterval = 20_000,
  seasonName,
  rankFilter,
}: {
  allUserProfilesMetadata: UserProfileMetadata[];
  refreshInterval?: number;
  seasonName?: string;
  rankFilter?:
    | 'total_points'
    | 'points_trading'
    | 'points_mutations'
    | 'points_streaks'
    | 'points_quests';
}): MutagenLeaderboardData | null {
  const [leaderboardData, setLeaderboardData] =
    useState<MutagenLeaderboardData | null>(null);

  const allMetadata = useMemo(
    () =>
      allUserProfilesMetadata.reduce(
        (acc, profile) => {
          acc[profile.owner.toBase58()] = profile;
          return acc;
        },
        {} as Record<string, UserProfileMetadata>,
      ),
    [allUserProfilesMetadata],
  );

  useEffect(() => {
    if (!allMetadata) return;

    const fetchLeaderboardData = () => {
      DataApiClient.getMutagenLeaderboard({ seasonName, rankFilter })
        .then((data) => {
          applyProfile(data, allMetadata);
          setLeaderboardData(data);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    fetchLeaderboardData();

    const interval = setInterval(fetchLeaderboardData, refreshInterval);

    return () => clearInterval(interval);
  }, [allMetadata, refreshInterval, seasonName, rankFilter]);

  return leaderboardData;
}
