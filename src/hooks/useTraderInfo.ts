import { useCallback, useEffect, useMemo, useState } from "react";

import DataApiClient from "@/DataApiClient";
import { EnrichedTraderInfo } from "@/types";

import useAwakeningV2 from "./useAwakeningV2";
import useExpanseData from "./useExpanseData";

export default function useTraderInfo({
  walletAddress,
}: {
  walletAddress: string | null;
}): {
  traderInfo: EnrichedTraderInfo | null;
  triggerTraderInfoReload: () => void;
  expanseRanking: {
    rank: number;
    championshipPoints: number;
    volume: number;
    pnl: number;
  } | null;
  awakeningRanking: {
    division: string;
    pnl: number;
    rank: number;
    volume: number;
  } | null;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const [traderInfo, setTraderInfo] = useState<EnrichedTraderInfo | null>(null);

  const expanseLeaderboard = useExpanseData({ allUserProfilesMetadata: [] });
  const awakeningLeaderboard = useAwakeningV2({
    wallet: walletAddress
      ? {
          adapterName: "Phantom",
          walletAddress,
        }
      : null,
    allUserProfilesMetadata: [],
  });

  const expanseRanking = useMemo(() => {
    if (!walletAddress) return null;

    const d = expanseLeaderboard?.seasonLeaderboard.find(
      (rank) => rank.wallet.toBase58() === walletAddress,
    );

    if (!d) return null;

    return {
      rank: d.rank,
      championshipPoints: d.championshipPoints,
      volume: d.volume,
      pnl: d.pnl,
    };
  }, [expanseLeaderboard?.seasonLeaderboard, walletAddress]);

  const awakeningRanking = useMemo(() => {
    if (!walletAddress) return null;

    if (!awakeningLeaderboard || !awakeningLeaderboard?.currentUserData)
      return null;

    return {
      division: awakeningLeaderboard.currentUserData.division,
      pnl: awakeningLeaderboard.currentUserData.pnl,
      rank: awakeningLeaderboard.currentUserData.rank,
      volume: awakeningLeaderboard.currentUserData.volume,
    };
  }, [awakeningLeaderboard?.currentUserData, walletAddress]);

  const loadTraderInfo = useCallback(
    async () => {
      if (!walletAddress) {
        return;
      }

      async function fetchTraderInfo(): Promise<EnrichedTraderInfo | null> {
        if (!walletAddress) return null;

        const traderInfo = await DataApiClient.getTraderInfo({
          walletAddress,
        });

        if (!traderInfo) {
          return null;
        }

        return traderInfo;
      }

      try {
        setTraderInfo(await fetchTraderInfo());
      } catch (e) {
        console.log("Error loading trader info", e, String(e));
        throw e;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [walletAddress],
  );

  useEffect(() => {
    loadTraderInfo();

    const interval = setInterval(() => {
      loadTraderInfo();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTraderInfo, trickReload, window.adrena.client.readonlyConnection]);

  return {
    traderInfo,
    triggerTraderInfoReload: () => {
      triggerReload(trickReload + 1);
    },
    expanseRanking,
    awakeningRanking,
  };
}
