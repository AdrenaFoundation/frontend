import { BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * This hook is used to fetch token balances for a given wallet address.
 * This is used by the WalletSidebar to display the token balances.
 * It uses the Jupiter Data API to get comprehensive token data including price.
 */

interface JupiterTokenData {
  price: number;
  name: string;
  symbol: string;
  icon?: string;
  priceChange24h?: number;
}

const jupiterAssetData: Map<string, JupiterTokenData> = new Map();
const jupiterTTL: Map<string, number> = new Map();

export async function getTokenDataByMints(
  tokenMints: string[],
): Promise<Record<string, JupiterTokenData>> {
  try {
    const cachedData: Record<string, JupiterTokenData> = {};
    const uncachedMints: string[] = [];

    tokenMints.forEach((mint) => {
      const cached = jupiterAssetData.get(mint);
      const ttl = jupiterTTL.get(mint);

      if (cached && ttl && new Date().getTime() - ttl < 60 * 1000) {
        cachedData[mint] = cached;
      } else {
        uncachedMints.push(mint);
      }
    });

    if (uncachedMints.length === 0) {
      return cachedData;
    }

    const queryString = uncachedMints.join(',');
    const response = await fetch(
      `https://datapi.jup.ag/v1/assets/search?query=${queryString}`,
    );
    const assets = (await response.json()) as Array<{
      id: string;
      name: string;
      symbol: string;
      icon?: string;
      usdPrice: number;
      stats24h?: {
        priceChange: number;
      };
    }>;

    const result = { ...cachedData };
    const now = new Date().getTime();

    assets.forEach((asset) => {
      if (asset.usdPrice && asset.usdPrice > 0) {
        const tokenData = {
          price: asset.usdPrice,
          name: asset.name,
          symbol: asset.symbol,
          icon: asset.icon,
          priceChange24h: asset.stats24h?.priceChange,
        };

        result[asset.id] = tokenData;
        jupiterAssetData.set(asset.id, tokenData);
        jupiterTTL.set(asset.id, now);
      }
    });

    return result;
  } catch (error) {
    console.error('Failed to fetch token data from Jupiter Data API:', error);
    return {};
  }
}

export class DecimalUtil {
  public static fromBigInt(input: bigint, shift = 0): number {
    return Number(input.toString()) / Math.pow(10, shift);
  }

  public static fromBN(input: BN, shift = 0): number {
    return Number(input.toString()) / Math.pow(10, shift);
  }
}

export interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  uiAmount: number;
  decimals: number;
  icon?: string;
  priceUsd?: number;
  valueUsd?: number;
  priceChange24h?: number;
}

export function useGetBalancesAndJupiterPrices(walletAddress?: string) {
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const connection = window.adrena.mainConnection;

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const getTokenInfo = useCallback((mint: string) => {
    if (typeof window !== 'undefined' && window.adrena?.client) {
      if (mint === window.adrena.client.lmTokenMint?.toBase58()) {
        return {
          symbol: 'ADX',
          name: 'Adrena',
          logoURI: '/images/adx.svg',
        };
      }
      if (mint === window.adrena.client.lpTokenMint?.toBase58()) {
        return {
          symbol: 'ALP',
          name: 'Adrena LP',
          logoURI: '/images/alp.svg',
        };
      }
    }

    const configToken = window.adrena?.config?.tokensInfo?.[mint];
    if (configToken) {
      return {
        symbol: configToken.symbol,
        name: configToken.name,
        logoURI:
          typeof configToken.image === 'string' ? configToken.image : undefined,
      };
    }

    // Return null - Jupiter API will fill in all the data
    return null;
  }, []);

  const fetchTokenBalances = useCallback(
    async (address: string) => {
      if (!connection) {
        console.error('❌ No connection available');
        return;
      }

      setIsLoadingBalances(true);
      setError(null);

      try {
        const publicKey = new PublicKey(address);

        const [solBalance, tokenAccounts] = await Promise.all([
          connection.getBalance(publicKey),
          connection.getParsedTokenAccountsByOwner(publicKey, {
            programId: TOKEN_PROGRAM_ID,
          }),
        ]);

        setSolBalance(solBalance / 1e9);

        const balances: TokenBalance[] = [];

        const solTokenInfo = getTokenInfo(
          'So11111111111111111111111111111111111111112',
        );
        if (!solTokenInfo) {
          console.error('❌ SOL token info not found');
          return;
        }

        balances.push({
          mint: 'So11111111111111111111111111111111111111112',
          symbol: solTokenInfo.symbol,
          name: solTokenInfo.name,
          balance: solBalance,
          uiAmount: solBalance / 1e9,
          decimals: 9,
          icon: solTokenInfo.logoURI,
        });

        tokenAccounts.value.forEach(({ account }) => {
          const tokenAmount = account.data.parsed.info.tokenAmount;
          const mint = account.data.parsed.info.mint;

          if (tokenAmount.uiAmount && tokenAmount.uiAmount > 0) {
            const tokenInfo = getTokenInfo(mint);

            balances.push({
              mint,
              symbol: tokenInfo?.symbol || '-',
              name: tokenInfo?.name || '-',
              balance: parseInt(tokenAmount.amount),
              uiAmount: tokenAmount.uiAmount,
              decimals: tokenAmount.decimals,
              icon: tokenInfo?.logoURI,
            });
          }
        });

        const allMints = balances.map((token) => token.mint);
        const tokenDataMap = await getTokenDataByMints(allMints);

        const balancesWithPrices = balances
          .map((token) => {
            const tokenData = tokenDataMap[token.mint];
            const priceUsd = tokenData?.price;
            const valueUsd = priceUsd ? token.uiAmount * priceUsd : undefined;
            const priceChange24h = tokenData?.priceChange24h;

            return {
              ...token,
              symbol: tokenData?.symbol || token.symbol,
              name: tokenData?.name || token.name,
              icon: tokenData?.icon || token.icon,
              priceUsd,
              valueUsd,
              priceChange24h,
            };
          })
          .filter((token) => {
            return (
              token.symbol === 'SOL' ||
              token.priceUsd !== undefined ||
              token.name !== '-'
            );
          });

        // Sort by valueUsd descending then by token number
        balancesWithPrices.sort((a, b) => {
          const aValue = a.valueUsd || 0;
          const bValue = b.valueUsd || 0;

          if (bValue !== aValue) {
            return bValue - aValue;
          }

          return a.balance - b.balance;
        });

        setTokenBalances(balancesWithPrices);

        if (!selectedToken && balances.length > 0) {
          const solToken = balances.find((token) => token.symbol === 'SOL');
          if (solToken) {
            setSelectedToken(solToken);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching token balances:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch token balances',
        );
      } finally {
        setIsLoadingBalances(false);
      }
    },
    [getTokenInfo, selectedToken, connection],
  );

  useEffect(() => {
    if (walletAddress) {
      fetchTokenBalances(walletAddress);
    } else {
      setTokenBalances([]);
      setSelectedToken(null);
    }
  }, [walletAddress, fetchTokenBalances]);

  const refreshBalances = useCallback(() => {
    if (walletAddress) {
      fetchTokenBalances(walletAddress);
    }
  }, [walletAddress, fetchTokenBalances]);

  const totalValueUsd = useMemo(() => {
    return tokenBalances.reduce((total, token) => {
      return total + (token.valueUsd || 0);
    }, 0);
  }, [tokenBalances]);

  return {
    solBalance,
    tokenBalances,
    selectedToken,
    isLoadingBalances,
    totalValueUsd,
    error,
    setSelectedToken,
    refreshBalances,
    getTokenInfo,
    getTokenDataByMints,
    connection,
  };
}
