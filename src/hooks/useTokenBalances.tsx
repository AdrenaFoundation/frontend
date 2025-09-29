import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface TokenBalance {
    mint: string;
    symbol: string;
    name: string;
    balance: number; // Raw balance (smallest unit)
    uiAmount: number; // UI-friendly amount
    decimals: number;
    logoURI?: string;
    priceUsd?: number; // USD price per token
    valueUsd?: number; // Total USD value (uiAmount * priceUsd)
}

export interface JupiterToken {
    address: string;
    chainId: number;
    decimals: number;
    name: string;
    symbol: string;
    logoURI?: string;
    tags?: string[];
}

// Global cache for Jupiter tokens - shared across all hook instances
let globalJupiterTokens: Record<string, JupiterToken> = {};
let globalJupiterTokensPromise: Promise<Record<string, JupiterToken>> | null = null;
let isGlobalJupiterTokensLoaded = false;

// Note: Token prices are now fetched from the app's existing Redux price system
// instead of external APIs to avoid authentication issues and use existing infrastructure

// Function to fetch Jupiter tokens only once globally
async function fetchJupiterTokensGlobal(): Promise<Record<string, JupiterToken>> {
    // If already loaded, return cached data
    if (isGlobalJupiterTokensLoaded) {
        return globalJupiterTokens;
    }

    // If already fetching, return the existing promise
    if (globalJupiterTokensPromise) {
        return globalJupiterTokensPromise;
    }

    // Create new fetch promise
    globalJupiterTokensPromise = (async () => {
        try {
            const response = await fetch('https://token.jup.ag/strict');
            const tokens: JupiterToken[] = await response.json();

            // Convert array to map for faster lookups
            const tokenMap: Record<string, JupiterToken> = {};
            tokens.forEach(token => {
                tokenMap[token.address] = token;
            });

            globalJupiterTokens = tokenMap;
            isGlobalJupiterTokensLoaded = true;

            return globalJupiterTokens;
        } catch (error) {
            console.error('❌ Failed to fetch Jupiter tokens:', error);
            // Reset promise so it can be retried
            globalJupiterTokensPromise = null;
            return {};
        }
    })();

    return globalJupiterTokensPromise;
}


// Function to clear the global Jupiter tokens cache (useful for development or cache invalidation)
export function clearJupiterTokensCache() {
    globalJupiterTokens = {};
    globalJupiterTokensPromise = null;
    isGlobalJupiterTokensLoaded = false;
}


export function useTokenBalances(walletAddress?: string) {
    const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
    const [jupiterTokens, setJupiterTokens] = useState<Record<string, JupiterToken>>(globalJupiterTokens);
    const [isLoadingBalances, setIsLoadingBalances] = useState(false);
    const [isLoadingJupiterTokens, setIsLoadingJupiterTokens] = useState(!isGlobalJupiterTokensLoaded);
    const [isLoadingPrices] = useState(false); // Prices are loaded synchronously from Redux
    const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(true);


    // Use the app's configured RPC connection but with 'confirmed' commitment for Privy compatibility
    const connection = useMemo(() => {
        const appConnection = window.adrena?.client?.connection;
        if (appConnection) {
            // Create a new connection with the same RPC endpoint but 'confirmed' commitment
            // This is needed because Privy requires 'confirmed' commitment for some operations
            return new Connection(appConnection.rpcEndpoint, 'confirmed');
        }
        return null;
    }, []);

    // Fetch Jupiter token registry using global cache
    useEffect(() => {
        // If already loaded globally, use cached data immediately
        if (isGlobalJupiterTokensLoaded) {
            setJupiterTokens(globalJupiterTokens);
            setIsLoadingJupiterTokens(false);
            return;
        }

        // Otherwise, fetch using global cache function
        const loadJupiterTokens = async () => {
            try {
                const tokens = await fetchJupiterTokensGlobal();
                if (isMountedRef.current) {
                    setJupiterTokens(tokens);
                    setIsLoadingJupiterTokens(false);
                }
            } catch (error) {
                console.error('❌ Failed to load Jupiter tokens:', error);
                if (isMountedRef.current) {
                    setIsLoadingJupiterTokens(false);
                }
            }
        };

        loadJupiterTokens();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Get token info from Jupiter registry with fallback to hardcoded tokens
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

        const jupiterToken = jupiterTokens[mint];
        if (jupiterToken) {
            return {
                symbol: jupiterToken.symbol,
                name: jupiterToken.name,
                logoURI: jupiterToken.logoURI,
            };
        }

        // Fallback to hardcoded well-known tokens
        const knownTokens: Record<string, { symbol: string; name: string; logoURI?: string }> = {
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin', logoURI: '/images/usdc.svg' },
            'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', name: 'Tether USD', logoURI: '/images/usdt.svg' },
            '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk': { symbol: 'ETH', name: 'Ethereum (Portal)', logoURI: '/images/eth.svg' },
            '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh': { symbol: 'BTC', name: 'Bitcoin (Portal)', logoURI: '/images/btc.svg' },
            'So11111111111111111111111111111111111111112': { symbol: 'SOL', name: 'Solana', logoURI: '/images/sol.svg' },
            'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL': { symbol: 'JTO', name: 'Jito', logoURI: undefined },
            'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': { symbol: 'JUP', name: 'Jupiter', logoURI: undefined },
            'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': { symbol: 'mSOL', name: 'Marinade Staked SOL', logoURI: undefined },
            'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1': { symbol: 'bSOL', name: 'Blaze Staked SOL', logoURI: undefined },
            'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn': { symbol: 'jitoSOL', name: 'Jito Staked SOL', logoURI: undefined },
        };

        const fallbackToken = knownTokens[mint];
        if (fallbackToken) {
            return fallbackToken;
        }

        // Last resort: generate from mint address
        return {
            symbol: mint.slice(0, 4).toUpperCase(),
            name: `Token ${mint.slice(0, 8)}...`,
            logoURI: undefined,
        };
    }, [jupiterTokens]);

    // Fetch token balances for a given wallet address
    const fetchTokenBalances = useCallback(async (address: string) => {
        if (!connection || !window.adrena?.client?.connection) {
            return;
        }

        setIsLoadingBalances(true);
        setError(null);
        try {
            const publicKey = new PublicKey(address);

            // Fetch SOL balance
            const solBalance = await connection.getBalance(publicKey);

            // Fetch SPL token accounts
            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                programId: TOKEN_PROGRAM_ID,
            });

            const balances: TokenBalance[] = [];

            // Add SOL balance
            const solTokenInfo = getTokenInfo('So11111111111111111111111111111111111111112');
            balances.push({
                mint: 'So11111111111111111111111111111111111111112',
                symbol: solTokenInfo.symbol,
                name: solTokenInfo.name,
                balance: solBalance,
                uiAmount: solBalance / 1e9, // SOL has 9 decimals
                decimals: 9,
                logoURI: solTokenInfo.logoURI,
            });

            // Add SPL token balances (only tokens with balance > 0)
            tokenAccounts.value.forEach(({ account }) => {
                const tokenAmount = account.data.parsed.info.tokenAmount;
                const mint = account.data.parsed.info.mint;

                if (tokenAmount.uiAmount && tokenAmount.uiAmount > 0) {
                    const tokenInfo = getTokenInfo(mint);
                    balances.push({
                        mint,
                        symbol: tokenInfo.symbol,
                        name: tokenInfo.name,
                        balance: parseInt(tokenAmount.amount),
                        uiAmount: tokenAmount.uiAmount,
                        decimals: tokenAmount.decimals,
                        logoURI: tokenInfo.logoURI,
                    });
                }
            });

            // Sort by uiAmount (highest first), but keep SOL at the top
            balances.sort((a, b) => {
                if (a.symbol === 'SOL') return -1;
                if (b.symbol === 'SOL') return 1;
                return b.uiAmount - a.uiAmount;
            });

            // Set balances (prices will be handled by components using Redux selectors)
            setTokenBalances(balances.map(token => ({
                ...token,
                priceUsd: undefined, // Components will get prices from Redux
                valueUsd: undefined, // Components will calculate this
            })));

            // Auto-select SOL if no token is selected and SOL is available
            if (!selectedToken && balances.length > 0) {
                const solToken = balances.find(token => token.symbol === 'SOL');
                if (solToken) {
                    setSelectedToken(solToken);
                }
            }

        } catch (error) {
            console.error('Error fetching token balances:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch token balances');
        } finally {
            setIsLoadingBalances(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getTokenInfo, selectedToken]);

    // Fetch balances when wallet address changes
    useEffect(() => {
        if (walletAddress) {
            fetchTokenBalances(walletAddress);
        } else {
            setTokenBalances([]);
            setSelectedToken(null);
        }
    }, [walletAddress, fetchTokenBalances]);


    // Refresh balances function
    const refreshBalances = useCallback(() => {
        if (walletAddress) {
            fetchTokenBalances(walletAddress);
        }
    }, [walletAddress, fetchTokenBalances]);

    // Calculate total portfolio value
    const totalValueUsd = useMemo(() => {
        return tokenBalances.reduce((total, token) => {
            return total + (token.valueUsd || 0);
        }, 0);
    }, [tokenBalances]);

    return {
        // State
        tokenBalances,
        selectedToken,
        isLoadingBalances,
        isLoadingJupiterTokens,
        isLoadingPrices,
        jupiterTokens,
        totalValueUsd,
        error,

        // Actions
        setSelectedToken,
        refreshBalances,

        // Utilities
        getTokenInfo,
        connection,
    };
}
