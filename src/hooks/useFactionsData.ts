import { useEffect, useMemo, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import {
  FactionsLeaderboardsData,
  ProfilePicture,
  UserProfileMetadata,
  UserProfileTitle,
} from '@/types';

function applyProfile(
  leaderboardData: FactionsLeaderboardsData | null,
  allMetadata: Record<string, UserProfileMetadata>,
) {
  if (!leaderboardData || !allMetadata) {
    return;
  }

  const leaderboardDataExtended = leaderboardData;

  leaderboardDataExtended.weekly.bonkLeaderboard.forEach((u) => {
    u.forEach((u) => {
      const metadata = allMetadata[u.userWallet];

      if (metadata) {
        u.nickname = metadata.nickname;
        u.profilePicture = metadata.profilePicture as ProfilePicture;
        u.title = metadata.title as UserProfileTitle;
      }
    });
  });

  leaderboardDataExtended.weekly.jitoLeaderboard.forEach((u) => {
    u.forEach((u) => {
      const metadata = allMetadata[u.userWallet];

      if (metadata) {
        u.nickname = metadata.nickname;
        u.profilePicture = metadata.profilePicture as ProfilePicture;
        u.title = metadata.title as UserProfileTitle;
      }
    });
  });

  leaderboardData.weekly.officers.forEach((u) => {
    Object.values(u).forEach((u) => {
      const metadata = allMetadata[u.wallet];

      if (metadata) {
        u.nickname = metadata.nickname;
      }
    });
  });

  leaderboardData.seasonLeaderboard.forEach((u) => {
    const metadata = allMetadata[u.userWallet];

    if (metadata) {
      u.nickname = metadata.nickname;
      u.profilePicture = metadata.profilePicture as ProfilePicture;
      u.title = metadata.title as UserProfileTitle;
    }
  });
}

export default function useFactionsData({
  allUserProfilesMetadata,
}: {
  allUserProfilesMetadata: UserProfileMetadata[];
}): FactionsLeaderboardsData | null {
  const [leaderboardData, setLeaderboardData] =
    useState<FactionsLeaderboardsData | null>(null);

  const allMetadata = useMemo(() => {
    if (!allUserProfilesMetadata || !allUserProfilesMetadata.length) return {};

    return allUserProfilesMetadata.reduce(
      (acc, profile) => {
        acc[profile.owner.toBase58()] = profile;
        return acc;
      },
      {} as Record<string, UserProfileMetadata>,
    );
  }, [allUserProfilesMetadata]);

  useEffect(() => {
    if (!allMetadata) return;

    DataApiClient.getFactionsLeaderboards()
      .then((data) => {
        applyProfile(data, allMetadata);
        setLeaderboardData(data);
      })
      .catch((error) => {
        console.log(error);
      });

    const interval = setInterval(() => {
      DataApiClient.getFactionsLeaderboards()
        .then((data) => {
          applyProfile(data, allMetadata);
          setLeaderboardData(data);
        })
        .catch((error) => {
          console.log(error);
        });
    }, 20_000);

    return () => clearInterval(interval);
  }, [allMetadata]);

  return leaderboardData;
}
