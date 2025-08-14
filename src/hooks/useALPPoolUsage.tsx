import { useEffect, useState } from 'react';

import DataApiClient from '@/DataApiClient';
import { getCustodyByMint } from '@/utils';

import useAssetsUnderManagement from './useAssetsUnderManagement';

export type ALPPoolUsage = {
  totalUsageUsd: number;
  totalUsagePercentage: number;
  longUsageUsd: number;
  shortUsageUsd: number;
  longPercentage: number;
  shortPercentage: number;
};

export function useALPPoolUsage(): {
  poolUsage: ALPPoolUsage | null;
  triggerReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const [poolUsage, setPoolUsage] = useState<ALPPoolUsage | null>(null);
  const aumUsd = useAssetsUnderManagement();

  useEffect(() => {
    const loadPoolUsage = async () => {
      try {
        const custodyData = await DataApiClient.getCustodyInfo(
          'custodyinfo',
          'open_interest_long_usd=true&open_interest_short_usd=true',
          1,
        );

        if (!custodyData) {
          console.log('No open interest data available');
          return;
        }

        let totalUsageUsd = 0;
        let longUsageUsd = 0;
        let shortUsageUsd = 0;

        const { open_interest_long_usd, open_interest_short_usd } = custodyData;

        const typedLongOI = open_interest_long_usd as {
          [key: string]: string[];
        };
        const typedShortOI = open_interest_short_usd as {
          [key: string]: string[];
        };

        for (const [mint, longValues] of Object.entries(typedLongOI || {})) {
          const custody = await getCustodyByMint(mint);
          if (!custody || !longValues) continue;

          const longOI = parseFloat(longValues[0] || '0');
          const shortOI = parseFloat(typedShortOI[mint]?.[0] || '0');

          if (custody.tokenInfo.symbol === 'USDC') {
            shortUsageUsd += longOI + shortOI;
          } else {
            longUsageUsd += longOI;
            shortUsageUsd += shortOI;
          }
          totalUsageUsd += longOI + shortOI;
        }

        const totalTVL = aumUsd || 0;
        const totalUsagePercentage =
          totalTVL > 0 ? (totalUsageUsd / totalTVL) * 100 : 0;

        setPoolUsage({
          totalUsageUsd,
          totalUsagePercentage,
          longUsageUsd,
          shortUsageUsd,
          longPercentage:
            totalUsageUsd > 0 ? (longUsageUsd / totalUsageUsd) * 100 : 0,
          shortPercentage:
            totalUsageUsd > 0 ? (shortUsageUsd / totalUsageUsd) * 100 : 0,
        });
      } catch (e) {
        console.log('Error loading pool usage', e);
      }
    };

    loadPoolUsage();

    const interval = setInterval(loadPoolUsage, 60000);
    return () => clearInterval(interval);
  }, [trickReload, aumUsd]);

  return {
    poolUsage,
    triggerReload: () => triggerReload(trickReload + 1),
  };
}
