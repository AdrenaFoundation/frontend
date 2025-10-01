import { BN } from '@coral-xyz/anchor';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth/solana';
import { PublicKey, Transaction } from '@solana/web3.js';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';

import Button from '@/components/common/Button/Button';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { useSelector } from '@/store/store';

interface PrivySendSOLProps {
    onClose?: () => void;
}

export function PrivySendSOL({ onClose }: PrivySendSOLProps) {
    const { authenticated } = usePrivy();
    const { wallets: connectedStandardWallets } = useWallets();
    const wallet = useSelector((s) => s.walletState.wallet);

    // Get the current wallet's public key
    const currentWallet = connectedStandardWallets.find(w => w.address === wallet?.walletAddress);

    // Use the token balances hook
    const {
        tokenBalances,
        selectedToken,
        isLoadingBalances,
        isLoadingJupiterTokens,
        isLoadingPrices,
        error: balancesError,
        setSelectedToken,
        refreshBalances,
        connection,
    } = useTokenBalances(currentWallet?.address);

    // Get token prices from Redux
    const tokenPrices = useSelector((s) => s.tokenPrices || {});
    const streamingTokenPrices = useSelector((s) => s.streamingTokenPrices || {});

    // Helper function to get token symbol from mint address
    const getTokenSymbolFromMint = useCallback((mint: string): string | undefined => {
        // Check app's token definitions
        if (window.adrena?.client) {
            const token = window.adrena.client.tokens.find(t => t.mint.toBase58() === mint);
            if (token) return token.symbol;

            if (mint === window.adrena.client.alpToken.mint.toBase58()) return 'ALP';
            if (mint === window.adrena.client.lmTokenMint.toBase58()) return 'ADX';
        }

        // Fallback to hardcoded well-known tokens
        const knownTokens: Record<string, string> = {
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
            'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
            '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk': 'ETH',
            '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh': 'BTC',
            'So11111111111111111111111111111111111111112': 'SOL',
            'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL': 'JTO',
            'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'JUP',
            'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'mSOL',
            'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1': 'bSOL',
            'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn': 'jitoSOL',
        };
        return knownTokens[mint];
    }, []);

    // Calculate token balances with prices
    const tokenBalancesWithPrices = useMemo(() => {
        return tokenBalances.map(token => {
            const symbol = getTokenSymbolFromMint(token.mint);
            const priceUsd = symbol ? (streamingTokenPrices[symbol] ?? tokenPrices[symbol] ?? undefined) : undefined;
            const valueUsd = priceUsd ? token.uiAmount * priceUsd : undefined;

            return {
                ...token,
                priceUsd,
                valueUsd,
            };
        });
    }, [tokenBalances, tokenPrices, streamingTokenPrices, getTokenSymbolFromMint]);

    // Calculate total portfolio value
    const totalValueUsd = useMemo(() => {
        return tokenBalancesWithPrices.reduce((total: number, token: typeof tokenBalancesWithPrices[0]) => total + (token.valueUsd || 0), 0);
    }, [tokenBalancesWithPrices]);

    const [recipientAddress, setRecipientAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [transactionMethod, setTransactionMethod] = useState<string | null>(null);

    const sendTransactionWithAdapter = useCallback(async (transaction: Transaction): Promise<string> => {
        if (!currentWallet || !connection) {
            console.error('Wallet not available or not connected');
            return 'error';
        }

        /*  if (privyAdapter && privyAdapter.connected && privyAdapter.sendTransaction) {
             setTransactionMethod('Privy Adapter');
             const signature = await privyAdapter.sendTransaction(transaction, connection);
             return signature;
         } */

        console.error('Privy not available or not connected');
        return 'error';
    }, [currentWallet, connection]);

    const handleSend = async () => {
        if (!authenticated || !currentWallet || !selectedToken) {
            setError('Wallet not connected or no token selected');
            return;
        }

        if (!recipientAddress || !amount) {
            setError('Please fill in all fields');
            return;
        }

        setError(null);
        setSuccess(null);
        setIsLoading(true);
        setTransactionMethod(null);

        try {
            const recipientPubkey = new PublicKey(recipientAddress);
            const amountNumber = parseFloat(amount);

            if (amountNumber <= 0) {
                setError('Amount must be greater than 0');
                return;
            }

            if (amountNumber > selectedToken.uiAmount) {
                setError(`Insufficient balance. Available: ${selectedToken.uiAmount} ${selectedToken.symbol}`);
                return;
            }

            const senderPubkey = new PublicKey(currentWallet.address);
            let transaction: Transaction;

            if (selectedToken.symbol === 'SOL') {
                // SOL transfer using AdrenaClient
                const amountLamports = Math.floor(amountNumber * Math.pow(10, selectedToken.decimals));

                transaction = await window.adrena.client.buildTransferSolTx({
                    owner: senderPubkey,
                    recipient: recipientPubkey,
                    amount: new BN(amountLamports),
                });
            } else {
                // SPL Token transfer using AdrenaClient
                const amountTokens = Math.floor(amountNumber * Math.pow(10, selectedToken.decimals));
                const mintPubkey = new PublicKey(selectedToken.mint);

                transaction = await window.adrena.client.buildTransferTokenTx({
                    owner: senderPubkey,
                    recipient: recipientPubkey,
                    mint: mintPubkey,
                    amount: new BN(amountTokens),
                });
            }

            const signature = await sendTransactionWithAdapter(transaction);

            if (signature === 'error') {
                setError('Failed to send transaction');
            } else {
                setSuccess(`${selectedToken.symbol} sent successfully via ${transactionMethod}! Signature: ${signature}`);
            }

            // Reset form and refresh balances
            setRecipientAddress('');
            setAmount('');
            refreshBalances();

        } catch (err) {
            console.error('Transfer error:', err);
            setError(err instanceof Error ? err.message : 'Transfer failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (!authenticated) {
        return (
            <div className="p-4 text-center text-gray-400">
                Please connect your wallet to send SOL
            </div>
        );
    }

    const isButtonDisabled = !recipientAddress || !amount || !selectedToken || isLoading || isLoadingBalances;

    return (
        <div className="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg max-w-md mx-auto">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Send Tokens</h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Token Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Select Token</label>
                {balancesError ? (
                    <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg space-y-2">
                        <div className="text-red-400 text-sm">Failed to load token balances</div>
                        <div className="text-gray-400 text-xs">{balancesError}</div>
                        <button
                            onClick={refreshBalances}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            🔄 Retry Loading Balances
                        </button>
                    </div>
                ) : isLoadingBalances ? (
                    <div className="text-gray-400">Loading token balances...</div>
                ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                        {tokenBalancesWithPrices.map((token: typeof tokenBalancesWithPrices[0]) => (
                            <div
                                key={token.mint}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedToken?.mint === token.mint
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                                    }`}
                                onClick={() => setSelectedToken(token)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {token.logoURI ? (
                                            <Image
                                                src={token.logoURI}
                                                alt={token.symbol}
                                                width={24}
                                                height={24}
                                                className="rounded-full"
                                            />
                                        ) : (
                                            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs">
                                                {token.symbol.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-white font-medium">{token.symbol}</div>
                                            <div className="text-gray-400 text-xs">{token.name}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white">{token.uiAmount.toFixed(6)}</div>
                                        <div className="text-gray-400 text-xs">
                                            {token.valueUsd ? (
                                                `$${token.valueUsd.toFixed(2)}`
                                            ) : (
                                                'Balance'
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recipient Address */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Recipient Address</label>
                <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="Enter Solana wallet address"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
            </div>

            {/* Amount */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-300">Amount</label>
                    {selectedToken && (
                        <button
                            type="button"
                            onClick={() => setAmount(selectedToken.uiAmount.toString())}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Max: {selectedToken.uiAmount.toFixed(6)} {selectedToken.symbol}
                        </button>
                    )}
                </div>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    step="any"
                    min="0"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
            </div>

            {/* Portfolio & Status Info */}
            <div className="text-xs text-gray-400 space-y-1">
                <div>
                    Portfolio Value: {isLoadingPrices ? (
                        <span className="animate-pulse">Loading...</span>
                    ) : (
                        <span className="text-white">${totalValueUsd.toFixed(2)}</span>
                    )}
                </div>
                <div>
                    Jupiter Registry: {isLoadingJupiterTokens ? 'Loading...' : 'Loaded'}
                    {transactionMethod && (
                        <span className="ml-2 text-blue-400">• Method: {transactionMethod}</span>
                    )}
                </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-3 bg-green-500/10 border border-green-500 rounded-lg text-green-400 text-sm">
                    {success}
                </div>
            )}

            {/* Send Button */}
            <Button
                title={isLoading ? 'Sending...' : 'Send Tokens'}
                disabled={isButtonDisabled}
                onClick={handleSend}
                className="w-full"
            />

            {/* Debug Info */}
            <div className="text-xs text-gray-500 space-y-1">
                <div>Button disabled: {isButtonDisabled.toString()}</div>
                <div>Has recipient: {!!recipientAddress}</div>
                <div>Has amount: {!!amount}</div>
                <div>Has token: {!!selectedToken}</div>
                <div>Is loading: {isLoading.toString()}</div>
            </div>
        </div>
    );
}
