import { useEffect, useMemo, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import {
  ProfilePicture,
  SeasonLeaderboardsData,
  UserProfileTitle,
  UserProfileMetadata,
} from '@/types';

function applyProfile(leaderboardData: SeasonLeaderboardsData | null, allMetadata: Record<string, UserProfileMetadata>) {
  if (!leaderboardData || !allMetadata) {
    return;
  }

  const leaderboardDataExtended = leaderboardData;

  leaderboardDataExtended.weekLeaderboard.forEach((week) => {
    week.ranks.forEach((rank) => {
      const metadata = allMetadata[rank.wallet.toBase58()];

      if (metadata) {
        rank.nickname = metadata.nickname;
        rank.profilePicture = metadata.profilePicture as ProfilePicture;
        rank.title = metadata.title as UserProfileTitle;
      }
    });
  });

  leaderboardDataExtended.seasonLeaderboard.forEach((rank) => {
    const metadata = allMetadata[rank.wallet.toBase58()];

    if (metadata) {
      rank.nickname = metadata.nickname;
      rank.profilePicture = metadata.profilePicture as ProfilePicture;
      rank.title = metadata.title as UserProfileTitle;
    }
  });
}

export default function useExpanseData({
  allUserProfilesMetadata,
}: {
  allUserProfilesMetadata: UserProfileMetadata[];
}): SeasonLeaderboardsData | null {
  const [leaderboardData, setLeaderboardData] = useState<SeasonLeaderboardsData | null>(null);

  const allMetadata = useMemo(() => allUserProfilesMetadata.reduce((acc, profile) => {
    acc[profile.owner.toBase58()] = profile;
    return acc;
  }, {} as Record<string, UserProfileMetadata>), [allUserProfilesMetadata]);

  useEffect(() => {
    if (!allMetadata) return;

    DataApiClient.getSeasonLeaderboards()
      .then((data) => {
          applyProfile(data, allMetadata);
          setLeaderboardData(data);
      }).catch((error) => {
          console.log(error);
      });

    const interval = setInterval(() => {
        DataApiClient.getSeasonLeaderboards().then((data) => {
          applyProfile(data, allMetadata);
          setLeaderboardData(data);
        }).catch((error) => {
            console.log(error);
        });
    }, 20_000);

    return () => clearInterval(interval);
  }, [allMetadata]);

  return leaderboardData;
}
