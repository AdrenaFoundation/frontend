import { useEffect, useMemo, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import {
  MutagenLeaderboardData,
  UserProfileExtended,
} from '@/types';

function applyProfile(leaderboardData: MutagenLeaderboardData | null, allUsernames: Record<string, string>) {
  if (!leaderboardData || !allUsernames) {
    return;
  }

  const leaderboardDataExtended = leaderboardData;

  leaderboardDataExtended.forEach((user) => {
    user.username = allUsernames[user.userWallet.toBase58()] ?? null;
  });
}

export default function useMutagenLeaderboardData({
  allUserProfiles,
}: {
  allUserProfiles: UserProfileExtended[];
}): MutagenLeaderboardData | null {
  const [leaderboardData, setLeaderboardData] = useState<MutagenLeaderboardData | null>(null);

  const allUsernames = useMemo(() => allUserProfiles.reduce((acc, profile) => {
    acc[profile.owner.toBase58()] = profile.nickname;
    return acc;
  }, {} as Record<string, string>), [allUserProfiles]);

  useEffect(() => {
    if (!allUsernames) return;

    DataApiClient.getMutagenLeaderboard()
      .then((data) => {
          applyProfile(data, allUsernames);
          setLeaderboardData(data);
      }).catch((error) => {
          console.log(error);
      });

    const interval = setInterval(() => {
        DataApiClient.getMutagenLeaderboard().then((data) => {
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
