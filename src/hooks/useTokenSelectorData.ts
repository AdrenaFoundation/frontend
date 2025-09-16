import useDailyStats from '@/hooks/useDailyStats';
import useDynamicCustodyAvailableLiquidity from '@/hooks/useDynamicCustodyAvailableLiquidity';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { getTokenSymbol } from '@/utils';
import { useMemo } from 'react';

export function useTokenSelectorData(
  tokenList: Token[],
  selectedAction: 'long' | 'short' | 'swap',
  favorites: string[],
) {
  const streamingTokenPrices = useSelector((s) => s.streamingTokenPrices);
  const stats = useDailyStats();

  const custodyList = useMemo(() => {
    if (selectedAction === 'short') return [];
    return tokenList
      .map((token) => window.adrena.client.getCustodyByMint(token.mint))
      .filter((custody) => !!custody);
  }, [tokenList, selectedAction]);

  const custodyLiquidity = useDynamicCustodyAvailableLiquidity(custodyList);

  const tokenData = useMemo(() => {
    return tokenList
      .map((token) => {
        const symbol = getTokenSymbol(token.symbol);
        const custody = window.adrena.client.getCustodyByMint(token.mint);

        if (!custody) return null;

        const tokenPrice = streamingTokenPrices[symbol] ?? null;
        const { liquidityPrice, availableLiquidity } =
          selectedAction === 'short'
            ? {
                liquidityPrice: null as number | null,
                availableLiquidity:
                  custody.maxCumulativeShortPositionSizeUsd -
                  custody.oiShortUsd,
              }
            : {
                liquidityPrice: streamingTokenPrices[token.symbol] ?? null,
                availableLiquidity:
                  (custodyLiquidity as Record<string, number>)?.[
                    custody.pubkey.toBase58()
                  ] ?? 0,
              };

        return {
          token,
          symbol,
          custody,
          tokenPrice,
          liquidityPrice,
          availableLiquidity,
          dailyChange: stats?.[token.symbol]?.dailyChange ?? null,
          isFavorite: favorites.includes(symbol),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [
    tokenList,
    selectedAction,
    streamingTokenPrices,
    stats,
    favorites,
    custodyLiquidity,
  ]);

  return tokenData;
}
