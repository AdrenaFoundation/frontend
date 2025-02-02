import { useEffect, useMemo, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import {
  SeasonLeaderboardsData,
  UserProfileExtended,
} from '@/types';

function applyProfile(leaderboardData: SeasonLeaderboardsData | null, allUsernames: Record<string, string>) {
  if (!leaderboardData || !allUsernames) {
    return;
  }

  const leaderboardDataExtended = leaderboardData;

  leaderboardDataExtended.weekLeaderboard.forEach((week) => {
    week.ranks.forEach((rank) => {
      rank.username = allUsernames[rank.wallet.toBase58()] ?? null;
    });
  });

  leaderboardDataExtended.seasonLeaderboard.forEach((rank) => {
    rank.username = allUsernames[rank.wallet.toBase58()] ?? null;
  });
}

export default function useExpanseData({
  allUserProfiles,
}: {
  allUserProfiles: UserProfileExtended[];
}): SeasonLeaderboardsData | null {
  const [leaderboardData, setLeaderboardData] = useState<SeasonLeaderboardsData | null>(null);

  const allUsernames = useMemo(() => allUserProfiles.reduce((acc, profile) => {
    acc[profile.owner.toBase58()] = profile.nickname;
    return acc;
  }, {} as Record<string, string>), [allUserProfiles]);

  useEffect(() => {
    if (!allUsernames) return;

    DataApiClient.getSeasonLeaderboards()
      .then((data) => {
          applyProfile(data, allUsernames);
          setLeaderboardData(data);
      }).catch((error) => {
          console.log(error);
      });

    const interval = setInterval(() => {
        DataApiClient.getSeasonLeaderboards().then((data) => {
          applyProfile(data, allUsernames);
          setLeaderboardData(data);
        }).catch((error) => {
            console.log(error);
        });
    }, 20_000);

    return () => clearInterval(interval);
  }, [allUsernames]);

  return leaderboardData;
}
