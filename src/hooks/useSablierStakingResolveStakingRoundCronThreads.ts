import { useCallback, useEffect, useState } from 'react';

import { SablierThreadExtended, Staking } from '@/types';

// TODO: needs to refresh periodically to access new information
const useSablierStakingResolveStakingRoundCronThreads = ({
  lmStaking,
  lpStaking,
}: {
  lmStaking: Staking | null;
  lpStaking: Staking | null;
}): {
  lmStakingResolveRoundCron: SablierThreadExtended;
  lpStakingResolveRoundCron: SablierThreadExtended;
} | null => {
  const [threads, setThreads] = useState<{
    lmStakingResolveRoundCron: SablierThreadExtended;
    lpStakingResolveRoundCron: SablierThreadExtended;
  } | null>(null);

  const fetchThreads = useCallback(async () => {
    if (!lmStaking || !lpStaking) return;

    setThreads(
      await window.adrena.sablierClient.loadSablierStakingResolveStakingRoundCronThreads(
        {
          lmStaking,
          lpStaking,
        },
      ),
    );
  }, [lmStaking, lpStaking]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return threads;
};

export default useSablierStakingResolveStakingRoundCronThreads;
